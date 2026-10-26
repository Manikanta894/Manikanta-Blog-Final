'use client';
import Link from 'next/link';

// Shared editorial byline: avatar + author name + date + read time.
// Centralizes the author/date/read-time pattern used across ArticleCard,
// HeroSplit, and article pages so the byline renders identically everywhere.
const AUTHOR = { name: 'Manikanta', initial: 'M', url: '/author' };

function readingMinutes(article) {
  const words = (article.content || '').split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export default function AuthorByline({
  article,
  className = '',
  showAvatar = true,
  showDate = true,
  showReadTime = true,
  linkAuthor = true,
  dateFormat = 'short',
}) {
  const date = article.publishedAt
    ? new Date(article.publishedAt)
    : new Date(article.createdAt || Date.now());
  const dateStr = date.toLocaleDateString('en-US', {
    month: dateFormat === 'long' ? 'long' : 'short',
    day: 'numeric',
    ...(dateFormat === 'long' ? { year: 'numeric' } : {}),
  });
  const readMin = readingMinutes(article);

  const items = [];
  if (showAvatar) {
    items.push(<span key="avatar" className="shrink-0">
      <div className="avatar avatar-xs"><span>{AUTHOR.initial}</span></div>
    </span>);
  }
  if (AUTHOR.name) {
    items.push(<span key="author" className="font-semibold text-[--brand-text]">
      {linkAuthor ? (
        <Link href={AUTHOR.url} className="hover:opacity-70 transition-opacity">{AUTHOR.name}</Link>
      ) : (
        AUTHOR.name
      )}
    </span>);
  }
  if (showDate) {
    items.push(<span key="middot-1" aria-hidden>{'&middot;'}</span>);
    items.push(<span key="date">{dateStr}</span>);
  }
  if (showReadTime) {
    items.push(<span key="middot-2" aria-hidden>{'&middot;'}</span>);
    items.push(<span key="read">{readMin} min read</span>);
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs text-[--brand-text-secondary] ${className}`}>
      {items}
    </div>
  );
}
