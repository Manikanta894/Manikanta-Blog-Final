// Cross-package utilities. Pure, browser-safe. No DB imports.

export { renderMd, mdToText, esc, extractHeadings, ensureEditorialStructure, slugifyHeading } from './markdown.js';

export function slugify(s) {
  return (s || '').toString().toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90);
}

export function readingMinutes(text) {
  const words = (text || '').split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export function safeJson(str) {
  try {
    const a = str.indexOf('{');
    const b = str.lastIndexOf('}');
    if (a < 0 || b <= a) return null;
    return JSON.parse(str.slice(a, b + 1));
  } catch { return null; }
}

export function pollinationsUrl(prompt, w = 1600, h = 900, seed) {
  const s = seed ?? Math.floor(Math.random() * 99999);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&enhance=true&seed=${s}`;
}

// Deterministic small hash — so an auto-generated fallback cover for the
// same article resolves to the same seed on every render (SSR, client,
// repeat visits) instead of a new random image each time.
function seedFrom(str) {
  let h = 0;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
  return h % 99999;
}

const COVER_STYLES = {
  ai: 'abstract data topology, glowing neural mesh, dark violet, cinematic',
  business: 'financial district at dusk, moody, cinematic',
  career: 'lone figure in a glass tower, golden hour, cinematic',
  productivity: 'organized desk, notebook, morning light',
  essays: 'linen paper, quill, ink, editorial still life',
  signals: 'newswire ticker, halftone print, high contrast',
};

// Mandatory-cover fallback. Deterministic (seeded off the title) so the
// same article always gets the same auto-generated cover instead of a new
// random image on every request. Pure/browser-safe — safe to import from
// client components (ArticleCard, HeroSplit) as well as server pages.
export function coverImageFor(title, section) {
  const style = COVER_STYLES[section] || 'cinematic editorial photograph';
  return pollinationsUrl(`${title}, ${style}, magazine cover, 35mm film, no text, no watermark`, 1600, 900, seedFrom(title));
}

export const SECTIONS = [
  { slug: 'ai', name: 'AI', kicker: 'The AI Desk', desc: 'Frontier models & agents.', accent: '#7C3AED' },
  { slug: 'business', name: 'Business', kicker: 'Business & Strategy', desc: 'Markets, moats, and operators.', accent: '#4F46E5' },
  { slug: 'career', name: 'Career', kicker: 'The Career Desk', desc: 'Playbooks for operators.', accent: '#EA580C' },
  { slug: 'productivity', name: 'Productivity', kicker: 'Systems & Craft', desc: 'Deep work rituals.', accent: '#0284C7' },
  { slug: 'essays', name: 'Essays', kicker: 'Long Reads', desc: 'Slow ideas, written to last.', accent: '#0A0A0A' },
  { slug: 'signals', name: 'Signals', kicker: 'Quick Takes', desc: 'Short-form notes and social posts.', accent: '#0EA5A5' },
];
