'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock } from 'lucide-react';
import { SECTIONS } from '@/lib/sections';
import { coverImageFor } from '@/packages/utils';

export default function HeroSplit({ hero, trending = [] }) {
  if (!hero) return null;
  const heroDate = new Date(hero.publishedAt || hero.createdAt);
  const heroDateStr = heroDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const words = (hero.content || '').split(/\s+/).length;
  const readMin = Math.max(2, Math.round(words / 220));
  const sectionName = SECTIONS.find((s) => s.slug === hero.section)?.name || hero.section;
  const heroCover = hero.coverImage || coverImageFor(hero.title, hero.section);

  return (
    <section className="container pt-10 pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-stretch">
        {/* Featured story */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-3"
        >
          <Link href={`/article/${hero.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-md bg-[--shimmer-base] aspect-[16/10] grain">
              <img
                src={heroCover}
                alt={hero.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                style={{ filter: 'grayscale(15%) contrast(1.02)' }}
              />
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-brand px-3 py-1 text-eyebrow text-brand">
                  Featured
                </span>
                <span className="text-eyebrow text-[--brand-text-secondary]">{sectionName}</span>
              </div>
              <h1 className="text-h1 italic mt-4 text-[--brand-text] group-hover:text-brand transition-colors">
                {hero.title}
              </h1>
              <p className="mt-4 text-lead text-[--brand-text-secondary] max-w-2xl">{hero.excerpt}</p>
              <div className="mt-6 flex items-center gap-3 text-eyebrow text-[--brand-text-secondary]">
                <span className="inline-flex items-center gap-1.5"><Clock size={12} /> {readMin} min read</span>
                <span className="w-1 h-1 rounded-full bg-[--brand-border]" />
                <span>{heroDateStr}</span>
              </div>
            </div>
          </Link>
        </motion.article>

        {/* Trending rail */}
        {trending.length > 0 && (
          <aside className="lg:col-span-2 lg:border-l lg:border-[--brand-border] lg:pl-10">
            <div className="flex items-center justify-between mb-5">
              <span className="text-eyebrow text-brand">Trending Now</span>
              <Link href="/latest" className="text-eyebrow text-[--brand-text-secondary] hover:text-[--brand-text]">
                See all →
              </Link>
            </div>
            <div className="flex flex-col">
              {trending.slice(0, 4).map((a, i) => {
                const d = new Date(a.publishedAt || a.createdAt);
                const dStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const w = (a.content || '').split(/\s+/).length;
                const min = Math.max(2, Math.round(w / 220));
                return (
                  <motion.article
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
                    className="group border-b border-[--brand-border] last:border-0 py-4 first:pt-0"
                  >
                    <Link href={`/article/${a.slug}`} className="flex gap-4 items-start">
                      <div className="flex-1 min-w-0">
                        <div className="text-eyebrow text-brand mb-1">
                          {SECTIONS.find((s) => s.slug === a.section)?.name || a.section}
                        </div>
                        <h3 className="text-h4 italic text-[--brand-text] group-hover:text-brand transition-colors line-clamp-2">
                          {a.title}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-2 text-eyebrow text-[--brand-text-secondary]">
                          <span>{min} min</span><span>&middot;</span><span>{dStr}</span>
                        </div>
                      </div>
                      <img
                        src={a.coverImage || coverImageFor(a.title, a.section)}
                        alt=""
                        className="w-20 h-20 object-cover rounded shrink-0"
                        style={{ filter: 'grayscale(15%) contrast(1.02)' }}
                      />
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
