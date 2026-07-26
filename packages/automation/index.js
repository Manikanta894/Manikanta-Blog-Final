// Automation orchestration.
import { db } from '../db/index.js';
import { generateArticle, coverImageFor } from '../ai/index.js';
import { generateSocial, enqueueSocial } from '../social/index.js';
import { slugify } from '../utils/index.js';

export async function ingestRss() {
  const sources = await db.rssSources.list();
  const results = [];
  for (const src of sources.filter((s) => s.active)) {
    try {
      const res = await fetch(src.url);
      const xml = await res.text();
      const items = Array.from(xml.matchAll(/<item[\s\S]*?<\/item>/g)).slice(0, 5).map((m) => {
        const block = m[0];
        const title = (block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
        const link = (block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '').trim();
        return { title, link };
      });
      results.push({ source: src.name || src.url, items });
      // seed the inbox
      for (const it of items) {
        await db.inbox.create({ type: 'news', content: `${it.title} — ${it.link}`, section: src.section || 'signals', source: `rss:${src.name || src.url}` });
      }
      await db.logs.create({ action: 'rss.ingest', status: 'ok', meta: { source: src.name, count: items.length } });
    } catch (e) {
      await db.logs.create({ action: 'rss.ingest', status: 'failed', meta: { source: src.name, error: e.message } });
    }
  }
  return results;
}

export async function pipelinePublish({ section, angle, publish = false, notifyN8n = true }) {
  const gen = await generateArticle(section, angle || '');
  const cover = coverImageFor(gen.title, section);
  const social = await generateSocial(gen);
  const slug = slugify(gen.title) + '-' + Math.random().toString(36).slice(2, 6);

  const article = await db.articles.create({
    slug, title: gen.title, section, excerpt: gen.excerpt, content: gen.content, coverImage: cover,
    hashtags: gen.hashtags || [], seo: gen.seo || {},
    socialPosts: { linkedin: social.linkedin, instagram: social.instagram },
    provider: gen.provider,
    status: publish ? 'published' : 'draft',
    publishedAt: publish ? new Date() : null,
  });

  await enqueueSocial(article.id, social);

  if (notifyN8n) {
    const s = await db.settings.get();
    if (s.n8nWebhook && publish) {
      try {
        await fetch(s.n8nWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Secret': s.n8nSecret || '' },
          body: JSON.stringify({ event: 'article.published', article }),
        });
        await db.logs.create({ action: 'n8n.webhook', status: 'ok', meta: { articleId: article.id } });
      } catch (e) {
        await db.logs.create({ action: 'n8n.webhook', status: 'failed', meta: { error: e.message } });
      }
    }
  }
  return article;
}

export async function runScheduler() {
  const drafts = await db.articles.list({ status: 'scheduled', limit: 20 });
  const now = new Date();
  const published = [];
  for (const a of drafts) {
    if (a.scheduledFor && new Date(a.scheduledFor) <= now) {
      const updated = await db.articles.update(a.id, { status: 'published', publishedAt: new Date() });
      published.push(updated);
      await db.logs.create({ action: 'scheduler.publish', status: 'ok', meta: { articleId: a.id } });
    }
  }
  return published;
}

export async function sendNewsletter({ subject, html }) {
  const subs = await db.subscribers.list();
  await db.logs.create({ action: 'newsletter.send', status: 'ok', meta: { subject, recipients: subs.length, note: 'STUB — wire ESP in packages/automation/index.js' } });
  return { queued: subs.length };
}

// Process a Content Inbox item into a full published draft.
export async function processInboxItem(item) {
  const angle = `${item.type === 'news' ? 'Write an original commentary/analysis inspired by this news item: ' : ''}${item.content}${item.notes ? ` \u2014 additional notes: ${item.notes}` : ''}`;
  return await pipelinePublish({
    section: item.section || 'ai',
    angle,
    publish: false,           // always start as draft — user approves
    notifyN8n: false,
  });
}
