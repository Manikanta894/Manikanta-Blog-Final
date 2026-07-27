// INSIGHTS API — thin route handlers.
// All business logic lives in /packages/{db,ai,social,automation}.

import { NextResponse } from 'next/server';
import { db, driverName } from '@/packages/db';
import { generateArticle, coverImageFor } from '@/packages/ai';
import { generateSocial, enqueueSocial, dispatchQueue, postToLinkedIn, postToInstagram } from '@/packages/social';
import { ingestRss, pipelinePublish, runScheduler, sendNewsletter, processInboxItem } from '@/packages/automation';
import { slugify, SECTIONS, pollinationsUrl } from '@/packages/utils';
import { ADMIN_SESSION_COOKIE, isValidSession } from '@/lib/auth';

const j = (data, init = {}) => NextResponse.json(data, init);
const err = (msg, code = 400) => j({ error: msg }, { status: code });

async function handler(request, ctx) {
  const method = request.method;
  const resolved = await ctx.params;
  const parts = resolved?.path || [];
  const url = new URL(request.url);
  const [p0, p1, p2] = parts;

  try {
    if (parts.length === 0) return j({ ok: true, name: 'INSIGHTS API', driver: driverName, version: '2.1' });

    // ===== ARTICLES =====
    if (p0 === 'articles') {
      if (method === 'GET' && !p1) return j({ articles: await db.articles.list({
        section: url.searchParams.get('section'),
        status: url.searchParams.get('status') || 'published',
        limit: parseInt(url.searchParams.get('limit') || '30'),
      }) });
      if (method === 'POST' && !p1) {
        // Auth: writes to this endpoint are allowed from two places —
        //  1) your own logged-in admin session (the Editor tab), OR
        //  2) an external caller (n8n) presenting the x-api-secret header,
        //     required whenever ARTICLES_API_SECRET is set.
        // Without this, this endpoint would otherwise be publicly writable
        // to anyone who has the URL.
        const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
        const hasAdminSession = await isValidSession(cookieValue);
        if (!hasAdminSession) {
          const requiredSecret = process.env.ARTICLES_API_SECRET;
          if (requiredSecret) {
            const provided = request.headers.get('x-api-secret');
            if (provided !== requiredSecret) return err('unauthorized', 401);
          }
        }
        const body = await request.json();
        return j({ article: await db.articles.create({ ...body, slug: body.slug || slugify(body.title || 'untitled') + '-' + Math.random().toString(36).slice(2, 6) }) });
      }
      // Per-section create endpoint for n8n: POST /api/articles/section/<slug>
      // Section comes from the URL itself, not the request body — each n8n
      // workflow (one per Google Sheet / section) points at its own fixed
      // URL, so there's no "section" field to type wrong or forget.
      // Valid <slug> values: ai, business, career, productivity, essays,
      // signals.
      if (p1 === 'section' && p2 && method === 'POST') {
        const requiredSecret = process.env.ARTICLES_API_SECRET;
        if (requiredSecret) {
          const provided = request.headers.get('x-api-secret');
          if (provided !== requiredSecret) return err('unauthorized', 401);
        }
        const validSlugs = SECTIONS.map((s) => s.slug);
        if (!validSlugs.includes(p2)) {
          return err(`invalid section "${p2}". Valid sections: ${validSlugs.join(', ')}`, 400);
        }
        const body = await request.json();
        return j({
          article: await db.articles.create({
            ...body,
            section: p2,
            slug: body.slug || slugify(body.title || 'untitled') + '-' + Math.random().toString(36).slice(2, 6),
          }),
        });
      }
      if (p1 === 'slug' && p2 && method === 'GET') return j({ article: await db.articles.getBySlug(p2) });
      if (p1 && method === 'GET') return j({ article: await db.articles.getById(p1) });
      if (p1 && (method === 'PATCH' || method === 'PUT')) return j({ article: await db.articles.update(p1, await request.json()) });
      if (p1 && method === 'DELETE') { await db.articles.delete(p1); return j({ ok: true }); }
    }

    // ===== AI =====
    if (p0 === 'ai' && p1 === 'generate' && method === 'POST') {
      const body = await request.json();
      const job = await db.aiQueue.create({ task: 'article', section: body.section, status: 'running' });
      try {
        const article = await pipelinePublish({ section: body.section || 'ai', angle: body.angle, publish: !!body.publish });
        await db.aiQueue.update(job.id, { status: 'done', articleId: article.id, provider: article.provider });
        await db.logs.create({ action: 'ai.generate', status: 'ok', meta: { section: body.section, provider: article.provider } });
        return j({ article });
      } catch (e) {
        await db.aiQueue.update(job.id, { status: 'failed', error: e.message });
        await db.logs.create({ action: 'ai.generate', status: 'failed', meta: { error: e.message } });
        return err(e.message, 500);
      }
    }
    if (p0 === 'ai-queue' && method === 'GET') return j({ items: await db.aiQueue.list() });

    // ===== JOURNAL =====
    if (p0 === 'journal') {
      if (method === 'GET' && !p1) return j({ entries: await db.journal.list() });
      if (method === 'POST' && !p1) return j({ entry: await db.journal.create(await request.json()) });
      if (p1 && method === 'DELETE') { await db.journal.delete(p1); return j({ ok: true }); }
      if (p1 && method === 'PATCH') { await db.journal.update(p1, await request.json()); return j({ ok: true }); }
    }

    // ===== MEDIA =====
    if (p0 === 'media') {
      if (method === 'GET') return j({ media: await db.media.list() });
      if (method === 'POST') {
        const { prompt } = await request.json();
        return j({ media: await db.media.create({ url: pollinationsUrl(prompt, 1200, 1200), prompt, provider: 'pollinations' }) });
      }
    }

    // ===== SETTINGS =====
    if (p0 === 'settings') {
      if (method === 'GET') return j({ settings: await db.settings.get() });
      if (method === 'PATCH') return j({ settings: await db.settings.patch(await request.json()) });
    }

    // ===== NEWSLETTER / SUBSCRIBERS =====
    if (p0 === 'newsletter') {
      if (method === 'POST') {
        const { email } = await request.json();
        if (!email || !email.includes('@')) return err('invalid email');
        await db.subscribers.subscribe(email);
        return j({ ok: true });
      }
      if (method === 'GET') return j({ subscribers: await db.subscribers.list() });
    }

    // ===== RSS SOURCES =====
    if (p0 === 'rss-sources') {
      if (method === 'GET') return j({ sources: await db.rssSources.list() });
      if (method === 'POST') return j({ source: await db.rssSources.create(await request.json()) });
      if (p1 && method === 'DELETE') { await db.rssSources.delete(p1); return j({ ok: true }); }
    }

    // ===== SOCIAL QUEUE =====
    if (p0 === 'social-queue') {
      if (method === 'GET' && !p1) return j({
        items: await db.socialQueue.list({
          status: url.searchParams.get('status') || null,
          limit: parseInt(url.searchParams.get('limit') || '200'),
        }),
      });
      if (p1 && method === 'GET') return j({ item: await db.socialQueue.getById(p1) });
      if (p1 && method === 'PATCH') {
        const patch = await request.json();
        // Allow content edits and status transitions.
        const updated = await db.socialQueue.update(p1, patch);
        await db.logs.create({ action: `social.${patch.status || 'update'}`, status: 'ok', meta: { id: p1 } });
        return j({ item: updated });
      }
      if (p1 && method === 'DELETE') { await db.socialQueue.delete(p1); return j({ ok: true }); }
      // Actions: /social-queue/{id}/action
      if (p1 && p2 && method === 'POST') {
        const item = await db.socialQueue.getById(p1);
        if (!item) return err('not found', 404);
        if (p2 === 'approve')  return j({ item: await db.socialQueue.update(p1, { status: 'approved' }) });
        if (p2 === 'reject')   return j({ item: await db.socialQueue.update(p1, { status: 'rejected' }) });
        if (p2 === 'schedule') {
          const { scheduledAt } = await request.json();
          return j({ item: await db.socialQueue.update(p1, { status: 'scheduled', scheduledAt }) });
        }
        if (p2 === 'publish') {
          let out;
          if (item.platform === 'linkedin')  out = await postToLinkedIn(item);
          else if (item.platform === 'instagram') out = await postToInstagram(item);
          else out = { ok: false, reason: 'unknown_platform' };
          const updated = await db.socialQueue.update(p1, {
            status: out.ok ? 'posted' : 'failed',
            postedAt: out.ok ? new Date() : null,
            externalId: out.externalId || null,
            error: out.ok ? null : (out.reason + (out.detail ? ': ' + out.detail : '')),
            attemptedAt: new Date(),
            attempts: (item.attempts || 0) + 1,
          });
          return j({ item: updated, result: out });
        }
      }
    }

    // ===== LOGS =====
    if (p0 === 'logs' && method === 'GET') return j({ logs: await db.logs.list() });

    // ===== STATS =====
    if (p0 === 'stats' && method === 'GET') return j(await db.stats.overview());

    // ===== SEARCH =====
    if (p0 === 'search' && method === 'GET') return j({ results: await db.articles.search(url.searchParams.get('q') || '') });

    // ===== CONTENT INBOX =====
    if (p0 === 'inbox') {
      if (method === 'GET' && !p1) return j({ items: await db.inbox.list() });
      if (method === 'POST' && !p1) return j({ item: await db.inbox.create(await request.json()) });
      if (p1 && method === 'DELETE') { await db.inbox.delete(p1); return j({ ok: true }); }
      if (p1 && p2 === 'process' && method === 'POST') {
        const item = await db.inbox.getById(p1);
        if (!item) return err('inbox item not found', 404);
        await db.inbox.update(p1, { status: 'processing' });
        try {
          const article = await processInboxItem(item);
          await db.inbox.update(p1, { status: 'done', articleId: article.id });
          return j({ ok: true, article });
        } catch (e) {
          await db.inbox.update(p1, { status: 'failed', error: e.message });
          return err(e.message, 500);
        }
      }
      // Google Sheets / n8n webhook: POST /inbox/webhook?secret=...
      // Body: { rows: [{ type, content, section, notes }] } or a single row object.
      if (p1 === 'webhook' && method === 'POST') {
        const s = await db.settings.get();
        const secret = url.searchParams.get('secret') || request.headers.get('x-secret');
        if (!s.inboxWebhookSecret || s.inboxWebhookSecret !== secret) return err('unauthorized', 401);
        const body = await request.json();
        const rows = Array.isArray(body?.rows) ? body.rows : [body];
        const created = [];
        for (const r of rows) {
          if (!r || (!r.content && !r.url)) continue;
          created.push(await db.inbox.create({ ...r, content: r.content || r.url, source: 'webhook' }));
        }
        await db.logs.create({ action: 'inbox.webhook', status: 'ok', meta: { count: created.length } });
        return j({ ok: true, created: created.length, items: created });
      }
    }

    // ===== AUTOMATION HOOKS =====
    if (p0 === 'automation' && method === 'POST') {
      if (p1 === 'rss-ingest')      return j({ ok: true, results: await ingestRss() });
      if (p1 === 'scheduler-run')   return j({ ok: true, published: await runScheduler() });
      if (p1 === 'social-dispatch') return j({ ok: true, results: await dispatchQueue() });
      if (p1 === 'newsletter-send') return j({ ok: true, result: await sendNewsletter(await request.json()) });
    }

    return err('not found', 404);
  } catch (e) {
    console.error('API error', e);
    return err(e.message || 'server error', 500);
  }
}

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
