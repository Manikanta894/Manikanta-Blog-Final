// Cross-package utilities. Pure, browser-safe. No DB imports.

export { renderMd, mdToText, esc } from './markdown.js';

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

export const SECTIONS = [
  { slug: 'ai', name: 'AI', kicker: 'The AI Desk', desc: 'Frontier models & agents.', accent: '#7C3AED' },
  { slug: 'business', name: 'Business', kicker: 'Business & Strategy', desc: 'Markets, moats, and operators.', accent: '#059669' },
  { slug: 'career', name: 'Career', kicker: 'The Career Desk', desc: 'Playbooks for operators.', accent: '#EA580C' },
  { slug: 'productivity', name: 'Productivity', kicker: 'Systems & Craft', desc: 'Deep work rituals.', accent: '#0284C7' },
  { slug: 'essays', name: 'Essays', kicker: 'Long Reads', desc: 'Slow ideas, written to last.', accent: '#0A0A0A' },
  { slug: 'signals', name: 'Signals', kicker: 'Quick Takes', desc: 'Short-form notes and social posts.', accent: '#0EA5A5' },
];
