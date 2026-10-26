'use client';

// Standalone reading-time chip. Extracts the read-time calculation used by
// ArticleCard / HeroSplit / article pages into a reusable piece of UI.
export default function ReadingTime({ article, className = '' }) {
  const words = (article.content || '').split(/\s+/).length;
  const readMin = Math.max(1, Math.round(words / 220));
  return <span className={`text-xs text-[--brand-text-secondary] ${className}`}>{readMin} min read</span>;
}
