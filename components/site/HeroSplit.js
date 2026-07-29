'use client';
import Link from 'next/link';
import { SECTIONS } from '@/lib/sections';
import { coverImageFor } from '@/packages/utils';
import { TrendingUp } from 'lucide-react';

export default function HeroSplit({ hero, trending = [] }) {
  if (!hero) return null;
  const heroDate = new Date(hero.publishedAt || hero.createdAt);
  const heroDateStr = heroDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const words = (hero.content || '').split(/\s+/).length;
  const readMin = Math.max(2, Math.round(words / 220));
  const sectionName = SECTIONS.find((s) => s.slug === hero.section)?.name || hero.section;
  const heroCover = hero.coverImage || coverImageFor(hero.title, hero.section);

  return (
    <section className="max-w-[1200px] mx-auto px-5 pt-12 pb-6">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="lg:flex-[2] min-w-0">
          <Link href={`/article/${hero.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-2xl bg-[--shimmer-base] aspect-[2.4/1] shadow-sm">
              <img
                src={heroCover}
                alt={hero.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
            <div className="mt-6">
              <span className="text-xs font-semibold text-[--brand-text-secondary] uppercase tracking-[0.1em]">{sectionName}</span>
              <h1 className="cool-hero mt-3 text-[--brand-text] group-hover:opacity-80 transition-opacity">{hero.title}</h1>
              <p className="mt-3 text-base text-[--brand-text-secondary] leading-relaxed max-w-2xl">{hero.excerpt}</p>
              <div className="flex items-center gap-2 mt-5 text-sm text-[--brand-text-secondary]">
                <div className="avatar avatar-sm"><span>M</span></div>
                <span className="font-semibold text-[--brand-text]">Manikanta</span>
                <span>&middot;</span>
                <span>{heroDateStr}</span>
                <span>&middot;</span>
                <span>{readMin} min read</span>
              </div>
            </div>
          </Link>
        </div>

        {trending.length > 0 && (
          <aside className="lg:flex-1 lg:border-l lg:border-[--brand-border] lg:pl-10">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={15} className="text-[--brand-text-secondary]" />
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[--brand-text-secondary]">Trending</span>
            </div>
            <div className="flex flex-col">
              {trending.slice(0, 4).map((a, i) => {
                const d = new Date(a.publishedAt || a.createdAt);
                const dStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const sec = SECTIONS.find((s) => s.slug === a.section)?.name || a.section;
                return (
                  <article key={a.id} className="group">
                    <Link href={`/article/${a.slug}`} className="flex gap-3 py-3.5 border-b border-[--brand-border] last:border-0 items-start">
                      <span className="text-[28px] font-normal text-[--brand-border] leading-none shrink-0 w-7 font-display italic">{String(i + 2).padStart(2, '0')}</span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-[--brand-text-secondary] uppercase tracking-wider">{sec}</span>
                        <h3 className="text-sm font-medium text-[--brand-text] leading-snug mt-0.5 group-hover:opacity-70 transition-opacity line-clamp-2">{a.title}</h3>
                        <div className="mt-1 text-xs text-[--brand-text-secondary]">{dStr} &middot; {Math.max(2, Math.round((a.content || '').split(/\s+/).length / 220))} min read</div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
            <Link href="/latest" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors">
              See all articles &rarr;
            </Link>
          </aside>
        )}
      </div>
      <div className="hairline mt-8" />
    </section>
  );
}
