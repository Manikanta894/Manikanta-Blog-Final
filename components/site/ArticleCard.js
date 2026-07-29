'use client';
import Link from 'next/link';
import { SECTIONS } from '@/lib/sections';
import { coverImageFor } from '@/packages/utils';
import ShimmerImage from './ShimmerImage';
import { ArrowUpRight } from 'lucide-react';

function readingMinutes(article) {
  const words = (article.content || '').split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

const AUTHOR = { name: 'Manikanta', initial: 'M' };

function CategoryLabel({ section }) {
  const cfg = SECTIONS.find((s) => s.slug === section);
  return <span className="text-xs font-semibold text-[--brand-accent] uppercase tracking-wider">{cfg?.name || section}</span>;
}

export default function ArticleCard({ article, variant = 'default', index = 0 }) {
  const href = `/article/${article.slug}`;
  const date = article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt || Date.now());
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const readMin = readingMinutes(article);
  const cover = article.coverImage || coverImageFor(article.title, article.section);

  if (variant === 'compact') {
    return (
      <article className="group -mx-3 px-3 rounded-xl transition-all hover:bg-[--brand-accent-soft]">
        <Link href={href} className="flex gap-5 py-5 border-b border-[--brand-border] items-start">
          <div className="flex-1 min-w-0">
            <CategoryLabel section={article.section} />
            <h3 className="cool-h3 mt-1 mb-1.5 text-[--brand-text] group-hover:text-[--brand-accent] transition-colors">{article.title}</h3>
            <p className="text-sm text-[--brand-text-secondary] line-clamp-2 leading-relaxed">{article.excerpt}</p>
            <div className="flex items-center gap-2 mt-3 text-sm text-[--brand-text-secondary]">
              <div className="avatar avatar-sm"><span>{AUTHOR.initial}</span></div>
              <span className="font-semibold text-[--brand-text]">{AUTHOR.name}</span>
              <span className="text-[--brand-border]">/</span>
              <span>{dateStr}</span>
              <span className="w-1 h-1 rounded-full bg-[--brand-border]" />
              <span>{readMin} min read</span>
            </div>
          </div>
          {cover && (
            <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-[--shimmer-base] shadow-sm">
              <ShimmerImage src={cover} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" wrapperClass="w-full h-full" />
            </div>
          )}
        </Link>
      </article>
    );
  }

  return (
    <article className="group">
      <Link href={href}>
        {cover && (
          <div className="relative overflow-hidden rounded-xl aspect-[16/9] bg-[--shimmer-base] mb-4 shadow-sm card-hover">
            <ShimmerImage src={cover} alt="" className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105" wrapperClass="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <CategoryLabel section={article.section} />
          <ArrowUpRight size={14} className="text-[--brand-text-secondary] opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0 text-[--brand-accent]" />
        </div>
        <h3 className="cool-h3 text-[--brand-text] group-hover:text-[--brand-accent] transition-colors mb-1.5">{article.title}</h3>
        {article.excerpt && <p className="text-sm text-[--brand-text-secondary] line-clamp-2 leading-relaxed mb-4">{article.excerpt}</p>}
        <div className="flex items-center gap-2 text-sm text-[--brand-text-secondary]">
          <div className="avatar avatar-sm"><span>{AUTHOR.initial}</span></div>
          <span className="font-semibold text-[--brand-text]">{AUTHOR.name}</span>
          <span className="text-[--brand-border]">/</span>
          <span>{dateStr}</span>
          <span className="w-1 h-1 rounded-full bg-[--brand-border]" />
          <span>{readMin} min read</span>
        </div>
      </Link>
    </article>
  );
}
