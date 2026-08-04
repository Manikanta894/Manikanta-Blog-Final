// Slim re-export shim — sections config now lives in /packages/utils.
// IMPORTANT: only import from browser-safe modules here — this file is imported
// from client components. Do NOT re-export from /packages/db or /packages/ai.
export { SECTIONS, slugify, pollinationsUrl } from '@/packages/utils';

// Primary header nav — matches the INSIGHTS brand spec exactly.
export const NAV = [
  { slug: '', name: 'Home', href: '/' },
  { slug: 'latest', name: 'Latest', href: '/latest' },
  { slug: 'explore', name: 'Explore', href: '/explore' },
  { slug: 'ai', name: 'AI', href: '/ai' },
  { slug: 'business', name: 'Business', href: '/business' },
  { slug: 'career', name: 'Career', href: '/career' },
  { slug: 'productivity', name: 'Productivity', href: '/productivity' },
  { slug: 'essays', name: 'Essays', href: '/essays' },
  { slug: 'signals', name: 'Signals', href: '/signals' },
  { slug: 'about', name: 'About', href: '/about' },
];

// Full section list (kept intact for existing content / category pages —
// SECTIONS in /packages/utils is the backend-facing data model and is left
// unchanged so previously published articles in any section keep resolving).
import { SECTIONS } from '@/packages/utils';
export const findSection = (slug) => SECTIONS.find((s) => s.slug === slug);

// The three categories the homepage highlights, per the redesign brief.
export const HOMEPAGE_CATEGORIES = [
  { slug: 'ai', title: 'Artificial Intelligence' },
  { slug: 'business', title: 'Business & Strategy' },
  { slug: 'career', title: 'Career & Growth' },
];
