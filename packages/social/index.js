// Social copy generation + posting stubs.
// Auto-posting requires OAuth credentials in settings (linkedinToken,
// linkedinActor, instagramToken, instagramActor). Without credentials, posts are
// enqueued to social_queue and can be dispatched later (see automation/scheduler.js).

import { llmChat } from '../ai/index.js';
import { db } from '../db/index.js';

export async function generateSocial(article) {
  const { text, provider } = await llmChat(
    [
      { role: 'system', content: 'You are a world-class social copywriter. Return strict JSON only.' },
      { role: 'user', content: `Given this article, produce social copy.

Title: ${article.title}
Excerpt: ${article.excerpt}

Return JSON:
{
  "linkedin": { "caption": string (150-220 words, hook + insight + CTA, no emojis), "cta": string, "hashtags": string[] (5-8) },
  "instagram": {
    "caption": string (80-140 words, hooky, one emoji max),
    "hashtags": string[] (12-20),
    "slides": [{ "title": string, "body": string (20-40 words) }]  // exactly 5 slides
  }
}` },
    ],
    { json: true }
  );

  const fallback = {
    linkedin: {
      caption: `${article.excerpt}\n\nThe full read is up on INSIGHTS.`,
      cta: 'Read the full essay →',
      hashtags: ['#Leadership', '#Strategy', '#AI', '#Business', '#DeepWork'],
    },
    instagram: {
      caption: `${article.excerpt} — new on INSIGHTS.`,
      hashtags: ['#Insights', '#Ideas', '#Business', '#AI', '#Career', '#DeepWork'],
      slides: [
        { title: article.title, body: 'The one idea worth sitting with this week.' },
        { title: 'The Setup', body: 'Every operator learns to distrust the headline.' },
        { title: 'The Argument', body: 'Three things are happening at once. Most people see one.' },
        { title: 'The Framework', body: 'Cut, reinvest, compound. Repeat quietly for years.' },
        { title: 'Read the essay', body: "On INSIGHTS — link in bio." },
      ],
    },
    provider: 'mock',
  };

  if (!text) return fallback;
  try {
    let s = text.trim(); const a = s.indexOf('{'), b = s.lastIndexOf('}');
    if (a >= 0 && b > a) s = s.slice(a, b + 1);
    return { ...JSON.parse(s), provider };
  } catch { return { ...fallback, provider: `${provider}-parseFail` }; }
}

export async function enqueueSocial(articleId, social) {
  const jobs = [];
  if (social?.linkedin) {
    jobs.push(await db.socialQueue.create({ articleId, platform: 'linkedin', content: social.linkedin }));
  }
  if (social?.instagram) {
    jobs.push(await db.socialQueue.create({ articleId, platform: 'instagram', content: social.instagram }));
  }
  return jobs;
}

// ----- posting stubs (wire OAuth in settings to activate) -----

export async function postToLinkedIn(job) {
  const s = await db.settings.get();
  if (!s.linkedinToken || !s.linkedinActor) {
    return { ok: false, reason: 'linkedin_credentials_missing' };
  }
  const body = {
    author: s.linkedinActor,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: (job.content?.caption || '') + '\n\n' + (job.content?.hashtags || []).join(' ') },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${s.linkedinToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { ok: false, reason: `linkedin_${res.status}`, detail: await res.text() };
  const data = await res.json();
  return { ok: true, externalId: data.id };
}

export async function postToInstagram(job) {
  const s = await db.settings.get();
  if (!s.instagramToken || !s.instagramActor) {
    return { ok: false, reason: 'instagram_credentials_missing' };
  }
  // Instagram Graph API two-step: create container, then publish.
  // For carousels, create per-slide containers then a carousel container.
  // Placeholder: return not_implemented; real impl requires image URLs and Meta app permissions.
  return { ok: false, reason: 'instagram_publish_not_implemented' };
}

export async function dispatchQueue(limit = 10) {
  const items = await db.socialQueue.list(limit);
  const results = [];
  for (const j of items.filter((x) => x.status === 'pending')) {
    let out;
    if (j.platform === 'linkedin') out = await postToLinkedIn(j);
    else if (j.platform === 'instagram') out = await postToInstagram(j);
    else out = { ok: false, reason: 'unknown_platform' };
    await db.socialQueue.update(j.id, {
      status: out.ok ? 'posted' : 'failed',
      postedAt: out.ok ? new Date() : null,
      externalId: out.externalId || null,
      error: out.ok ? null : (out.reason + (out.detail ? ': ' + out.detail : '')),
      attemptedAt: new Date(),
      attempts: (j.attempts || 0) + 1,
    });
    results.push({ id: j.id, ...out });
  }
  return results;
}
