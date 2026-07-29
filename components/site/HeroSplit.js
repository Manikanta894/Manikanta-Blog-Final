'use client';
import Link from 'next/link';
import { SECTIONS } from '@/lib/sections';
import { coverImageFor } from '@/packages/utils';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

export default function HeroSplit({ hero, trending = [] }) {
  if (!hero) return null;
  const heroDate = new Date(hero.publishedAt || hero.createdAt);
  const heroDateStr = heroDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const words = (hero.content || '').split(/\s+/).length;
  const readMin = Math.max(2, Math.round(words / 220));
  const sectionName = SECTIONS.find((s) => s.slug === hero.section)?.name || hero.section;
  const heroCover = hero.coverImage || coverImageFor(hero.title, hero.section);

  return (
    <section className="max-w-[1200px] mx-auto px-5 pt-6 pb-4">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
        {/* Featured — dramatic hero card */}
        <div className="lg:flex-[2] min-w-0">
          <Link href={`/article/${hero.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-2xl bg-[--shimmer-base] aspect-[21/9] sm:aspect-[2.5/1] shadow-sm md:rounded-3xl">
              <img
                src={heroCover}
                alt={hero.title}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="featured-badge mb-3 inline-block">Featured</span>
              </div>
            </div>
            <div className="mt-5">
              <span className="text-sm font-semibold text-[--brand-accent] uppercase tracking-wider">{sectionName}</span>
              <h1 className="cool-hero mt-2 text-[--brand-text] group-hover:text-[--brand-accent] transition-colors">{hero.title}</h1>
              <p className="mt-3 text-base md:text-lg text-[--brand-text-secondary] leading-relaxed max-w-2xl">{hero.excerpt}</p>
              <div className="flex items-center gap-3 mt-5 text-sm">
                <div className="avatar avatar-sm"><span>M</span></div>
                <div className="flex flex-wrap items-center gap-x-2 text-[--brand-text-secondary]">
                  <span className="font-semibold text-[--brand-text]">Manikanta</span>
                  <span className="text-[--brand-border]">/</span>
                  <span>{heroDateStr}</span>
                  <span className="w-1 h-1 rounded-full bg-[--brand-border]" />
                  <span>{readMin} min read</span>
                </div>
                <span className="ml-auto flex items-center gap-1.5 text-sm font-medium text-[--brand-accent] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  Read <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Trending rail */}
        {trending.length > 0 && (
          <aside className="lg:flex-1 lg:border-l lg:border-[--brand-border] lg:pl-10">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={16} className="text-[--brand-accent]" />
              <span className="text-sm font-bold uppercase tracking-wider text-[--brand-text]">Trending</span>
            </div>
            <div className="flex flex-col gap-1">
              {trending.slice(0, 4).map((a, i) => {
                const d = new Date(a.publishedAt || a.createdAt);
                const dStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <article key={a.id} className="group">
                    <Link href={`/article/${a.slug}`} className="flex gap-4 py-4 border-b border-[--brand-border] last:border-0 items-start">
                      <span className="text-3xl font-black text-[--brand-border] leading-none shrink-0 w-8 font-display italic">{String(i + 2).padStart(2, '0')}</span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[--brand-text] leading-snug group-hover:text-[--brand-accent] transition-colors line-clamp-2">{a.title}</h3>
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[--brand-text-secondary]">
                          <span>{dStr}</span>
                          <span>&middot;</span>
                          <span>{Math.max(2, Math.round((a.content || '').split(/\s+/).length / 220))} min read</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
            <Link href="/latest" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[--brand-accent] hover:underline">
              See all articles <ArrowUpRight size={14} />
            </Link>
          </aside>
        )}
      </div>
      <div className="hairline mt-10" />
    </section>
  );
}
