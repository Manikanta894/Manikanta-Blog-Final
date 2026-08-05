'use client';
import Link from 'next/link';
import { SECTIONS } from '@/lib/sections';
import { coverImageFor } from '@/packages/utils';
import Reveal from './Reveal';

function readingMinutes(article) {
  const words = (article.content || '').split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

const AUTHOR = { name: 'Manikanta', initial: 'M' };

export default function ArticleCard({ article, variant = 'default', index = 0 }) {
  const href = `/article/${article.slug}`;
  const date = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt || Date.now());
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const readMin = readingMinutes(article);
  const cover = article.coverImage || coverImageFor(article.title, article.section);
  const sectionName = SECTIONS.find((s) => s.slug === article.section)?.name || article.section;

  if (variant === 'compact') {
    return (
      <Reveal delay={index * 40}>
        <article className="group">
          <Link href={href} className="flex gap-4 py-5 border-b border-[--brand-border] items-start">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold text-[--brand-text-secondary] uppercase tracking-wider">{sectionName}</span>
              <h3 className="mt-1 text-[15px] font-semibold text-[--brand-text] leading-snug group-hover:opacity-70 transition-opacity line-clamp-2">{article.title}</h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-[--brand-text-secondary]">
                <span>{dateStr}</span>
                <span>&middot;</span>
                <span>{readMin} min read</span>
              </div>
            </div>
            {cover && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-[--shimmer-base]">
                <img src={cover} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
            )}
          </Link>
        </article>
      </Reveal>
    );
  }

  return (
    <Reveal delay={index * 60}>
      <article className="group">
        <Link href={href}>
          {cover && (
            <div className="relative overflow-hidden rounded-xl aspect-[2/1] bg-[--shimmer-base] mb-4 shadow-sm transition-shadow duration-300 group-hover:shadow-md">
              <img src={cover} alt={article.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            </div>
          )}
          <span className="text-[11px] font-semibold text-[--brand-text-secondary] uppercase tracking-wider">{sectionName}</span>
          <h3 className="mt-1.5 text-[17px] font-semibold text-[--brand-text] leading-snug group-hover:opacity-70 transition-opacity line-clamp-2">{article.title}</h3>
          {article.excerpt && <p className="mt-1.5 text-sm text-[--brand-text-secondary] leading-relaxed line-clamp-2">{article.excerpt}</p>}
          <div className="flex items-center gap-1.5 mt-3 text-xs text-[--brand-text-secondary]">
            <div className="avatar avatar-xs"><span>{AUTHOR.initial}</span></div>
            <span>{AUTHOR.name}</span>
            <span>&middot;</span>
            <span>{dateStr}</span>
            <span>&middot;</span>
            <span>{readMin} min read</span>
          </div>
        </Link>
      </article>
    </Reveal>
  );
}