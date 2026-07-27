// Unified AI + image + social generation. Providers: Groq → OpenRouter → mock.
// Image generation via Pollinations AI (no key required).
//
// Keys can come from: (1) settings row in DB, (2) env vars (fallback).

import { db } from '../db/index.js';
import { pollinationsUrl, safeJson, coverImageFor } from '../utils/index.js';

// Re-exported so `import { coverImageFor } from '@/packages/ai'` keeps working
// anywhere that already used it — the implementation now lives in
// packages/utils (pure, no `db` import) so client components can use the
// same deterministic fallback without pulling server-only code into the
// browser bundle.
export { coverImageFor };

const GROQ_MODELS = ['llama-3.3-70b-versatile', 'qwen/qwen3-32b', 'llama-3.1-8b-instant'];
const OR_MODELS = ['meta-llama/llama-3.3-70b-instruct:free', 'qwen/qwen-2.5-72b-instruct:free'];

async function loadKeys() {
  let s = {};
  try { s = await db.settings.get(); } catch { s = {}; }
  return {
    groq: s.groqKey || process.env.GROQ_API_KEY || '',
    openrouter: s.openrouterKey || process.env.OPENROUTER_API_KEY || '',
  };
}

async function callGroq(key, model, messages, json = false) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model, messages, temperature: 0.8, max_tokens: 6500,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Groq ${model} ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callOpenRouter(key, model, messages) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://insights.app',
      'X-Title': 'INSIGHTS',
    },
    body: JSON.stringify({ model, messages, temperature: 0.8, max_tokens: 6500 }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${model} ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function llmChat(messages, { json = false } = {}) {
  const { groq, openrouter } = await loadKeys();
  if (groq) {
    for (const m of GROQ_MODELS) {
      try { return { text: await callGroq(groq, m, messages, json), provider: `groq:${m}` }; }
      catch (e) { console.warn(e.message); }
    }
  }
  if (openrouter) {
    for (const m of OR_MODELS) {
      try { return { text: await callOpenRouter(openrouter, m, messages), provider: `openrouter:${m}` }; }
      catch (e) { console.warn(e.message); }
    }
  }
  return { text: null, provider: 'mock' };
}

function parseJson(text) {
  try {
    let s = text.trim();
    const a = s.indexOf('{');
    const b = s.lastIndexOf('}');
    if (a >= 0 && b > a) s = s.slice(a, b + 1);
    return JSON.parse(s);
  } catch { return null; }
}

const MOCK_TOPICS = {
  ai: 'The New Model Wars: Agents, Reasoners, and the Death of the Chatbot',
  business: 'Durable Companies: What the New Playbook Rewards',
  career: 'The Operator Ladder: Careers Built on Compounding Reps',
  productivity: 'The Personal Operating System: Tools for a Focused Life',
  essays: 'On Slowness: A Case for Considered Work in a Fast Century',
  signals: 'Five Things Worth Your Attention This Week',
};

function mockArticle(section) {
  const title = MOCK_TOPICS[section] || 'A Note From the Desk';
  const excerpt = 'A brief, considered take from the desk — pattern, evidence, and the one question worth sitting with this week.';
  const body = [
    `# ${title}`, '',
    'There is a version of this story you have already heard. The important version is quieter.', '',
    '## The Setup',
    'Every serious operator learns to distrust the headline.', '',
    '## The Argument',
    'Three things are happening at once. First, the technology stopped being the story and started being the substrate.', '',
    '> The best move in a noisy market is rarely a loud one. It is the small, repeated act of showing up.', '',
    '## What To Do This Week',
    '- Cut one meeting. Reinvest the hour into deep work.',
    '- Write down the one question you are afraid to ask.',
    '- Read something older than you are.', '',
    '## The Bottom Line',
    '',
    '> Most advice ages badly because it was never about you. Test everything against your own week before you keep it.',
    '',
    'The signal is here. It always was. Your job this week is to sit still long enough to hear it.',
  ].join('\n');
  return {
    title, excerpt, content: body,
    seo: { title: `${title} — INSIGHTS`, description: excerpt, keywords: [section, 'analysis', 'ideas'] },
    hashtags: [`#${section.replace('-', '')}`, '#Insights', '#DeepWork', '#Ideas', '#Business'],
  };
}

// Replaces `![alt text](IMAGE: short visual prompt)` placeholders the model
// writes inline with real, contextually relevant Pollinations image URLs, so
// long-form posts get 2-3 in-body images instead of only a cover image.
function hydrateInlineImages(markdown, section) {
  if (!markdown) return markdown;
  return markdown.replace(/!\[([^\]]*)\]\(IMAGE:\s*([^)]+)\)/g, (m, alt, prompt) => {
    const styled = `${prompt.trim()}, editorial photograph, cinematic, no text, no watermark`;
    return `![${alt}](${pollinationsUrl(styled, 1400, 900)})`;
  });
}

export async function generateArticle(section, angle = '') {
  const system = `You are the senior editor of "INSIGHTS", a premium digital publication with the editorial voice of The Economist crossed with Every.to and Stratechery. Voice: considered, sharp, concrete, first-principles, opinionated but evidence-led. Never generic, never filler, never a string of platitudes — every paragraph must contain a specific claim, example, number, or mechanism, not just mood. Vary sentence length deliberately: short declarative sentences punctuating longer structural ones. No clichés ("in today's fast-paced world", "unlock your potential", "in conclusion"). Write like a specific, well-read human editor with a point of view, not like a generic AI summary of a topic.`;

  const user = `Write a comprehensive, magazine-quality, SEO-optimized long-form article for the "${section}" section of INSIGHTS.${angle ? ` Angle: ${angle}.` : ''}

STRUCTURE REQUIREMENTS (this is a long-form piece, not a blog snippet):
- Total length: 1,600-2,200 words of actual body content (not counting headings). Short thin articles are the one thing you must avoid.
- Open with a concrete hook: a specific scene, statistic, or contrarian claim — never "In today's world..." or a dictionary-style definition.
- 5-7 "##" H2 sections, each with a distinct sub-argument (not just restating the title). Use "###" H3s inside sections where it helps a reader scan.
- Include at least one bulleted list AND one numbered list where they genuinely help (frameworks, steps, comparisons).
- PULL QUOTES (required, separate from images — do not skip this): include 1-2 real blockquote pull-quotes using "> " markdown. Each must be a single sharp, self-contained, quotable sentence — not a restated heading. Place them INSIDE the body, roughly a third and two-thirds of the way through the piece (e.g. after the 2nd and 5th "##" section) — never as the very first line and never both back-to-back. If you include 2, they must make different points, not paraphrase each other.
- Include exactly 2 inline images placed at natural transition points, written as: ![short descriptive alt text](IMAGE: a short visual scene description for an image generator) — literally use the token "IMAGE:" followed by the visual prompt inside the parentheses; do not invent a real URL. Images and pull-quotes are separate requirements — both must appear.
- Add a "## Frequently Asked Questions" section near the end with exactly 3 Q&A pairs written as "### Question" followed by a short answer paragraph — this is for Google's FAQ rich results, so phrase questions the way a real reader would type them into Google.
- End with a "## Key Takeaways" section as a short bulleted list (4-6 bullets).
- Naturally weave in 2-3 specific, plausible real-world reference points (named companies, tools, studies, or historical examples appropriate to the section) rather than vague generalities — but do not fabricate statistics with false precision; keep specific claims qualitative or clearly framed as illustrative where you are not citing a verifiable source.

Return strict JSON only, no markdown fences, no commentary outside the JSON:
{
  "title": string (7-12 words, specific and clickable, includes the core keyword naturally — not clickbait),
  "excerpt": string (25-40 words, written to make a reader click, not a summary of the structure),
  "content": string (the full markdown body described above, 1600-2200 words),
  "seo": { "title": string (50-60 chars, includes primary keyword), "description": string (exactly 150-160 chars, includes primary keyword, written to earn the click from a search results page), "keywords": string[] (6-10 realistic search-intent keywords/phrases, not single generic words) },
  "hashtags": string[] (8-12 with #, mix of broad and niche)
}`;

  const { text, provider } = await llmChat(
    [{ role: 'system', content: system }, { role: 'user', content: user }],
    { json: true }
  );
  if (!text) return { ...mockArticle(section), provider: 'mock' };
  const parsed = parseJson(text);
  if (!parsed || !parsed.content || parsed.content.split(/\s+/).length < 400) {
    return { ...mockArticle(section), provider: `${provider}-parseFail` };
  }
  parsed.content = hydrateInlineImages(parsed.content, section);
  if (parsed.seo?.description && parsed.seo.description.length > 160) {
    parsed.seo.description = parsed.seo.description.slice(0, 157).trim() + '...';
  }
  return { ...parsed, provider };
}


