import Link from 'next/link';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import NewsletterForm from '@/components/site/NewsletterForm';
import QuoteOfTheDay from '@/components/site/QuoteOfTheDay';
import Reveal from '@/components/site/Reveal';
import { findSection } from '@/lib/sections';
import { db } from '@/packages/db';
import { coverImageFor } from '@/packages/utils';
import { ArrowUpRight, TrendingUp, BookOpen, Sparkles } from 'lucide-react';

export const revalidate = 900;

function readingMinutes(content) {
  return Math.max(2, Math.round((content || '').split(/\s+/).length / 220));
}

export default async function Home() {
  let articles = [];
  try { articles = await db.articles.list({ status: 'published', limit: 30 }); } catch { articles = []; }

  const hero = articles[0];
  const picks = articles.slice(0, 3);
  const trending = articles.slice(3, 9);
  const latest = articles.length > 3 ? articles.slice(3, 15) : articles.slice(0, 12);

  const categories = [
    { slug: 'ai', name: 'Artificial Intelligence', desc: 'Frontier models, agents, and the race to AGI' },
    { slug: 'business', name: 'Business & Strategy', desc: 'Markets, moats, and modern operators' },
    { slug: 'career', name: 'Career & Growth', desc: 'Navigating the future of work' },
    { slug: 'productivity', name: 'Productivity', desc: 'Deep work rituals and systems' },
    { slug: 'essays', name: 'Essays', desc: 'Slow ideas, written to last' },
  ];

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        {/* ═══ HERO ═══ */}
        {hero && (() => {
          const hd = new Date(hero.publishedAt || hero.createdAt);
          const hdStr = hd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          const hMin = readingMinutes(hero.content);
          const hCover = hero.coverImage || coverImageFor(hero.title, hero.section);
          const hSection = findSection(hero.section)?.name || hero.section;

          return (
            <section className="max-w-[1280px] mx-auto px-5 pt-12 md:pt-20 pb-8">
              <Link href={`/article/${hero.slug}`} className="group block">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                  <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl aspect-[4/3] lg:aspect-[5/4] bg-[--shimmer-base] shadow-sm">
                    <img
                      src={hCover}
                      alt={hero.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                      loading="eager"
                    />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[--brand-text-secondary] uppercase tracking-[0.15em] mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-[--brand-text]" />
                      Featured
                    </span>
                    <h1 className="cool-hero text-[--brand-text] group-hover:opacity-80 transition-opacity">
                      {hero.title}
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-[--brand-text-secondary] leading-relaxed max-w-xl">
                      {hero.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-6 text-sm text-[--brand-text-secondary]">
                      <div className="avatar avatar-sm"><span>M</span></div>
                      <span className="font-semibold text-[--brand-text]">Manikanta</span>
                      <span className="text-[--brand-border]">/</span>
                      <span>{hSection}</span>
                      <span className="text-[--brand-border]">/</span>
                      <span>{hdStr}</span>
                      <span className="text-[--brand-border]">&middot;</span>
                      <span>{hMin} min read</span>
                    </div>
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-1.5 bg-[--brand-text] text-[--brand-bg] rounded-full px-5 py-2.5 text-sm font-medium hover:opacity-80 transition-opacity group-hover:gap-2.5">
                        Read Article <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          );
        })()}

        {/* ═══ QUOTE ═══ */}
        <Reveal><QuoteOfTheDay /></Reveal>

        {/* ═══ EDITOR'S PICKS ═══ */}
        {picks.length >= 2 && (
          <Reveal>
            <section className="max-w-[1280px] mx-auto px-5 py-20">
              <div className="flex items-center gap-3 mb-10">
                <Sparkles size={16} className="text-[--brand-text-secondary]" />
                <h2 className="cool-h2 text-[--brand-text]">Editor&rsquo;s Picks</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                {picks.map((a, i) => (
                  <Link key={a.id} href={`/article/${a.slug}`} className="group block">
                    <div className="relative overflow-hidden rounded-xl aspect-[3/2] bg-[--shimmer-base] mb-4 shadow-sm">
                      <img
                        src={a.coverImage || coverImageFor(a.title, a.section)}
                        alt={a.title}
className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    </div>
                    <span className="text-[11px] font-semibold text-[--brand-text-secondary] uppercase tracking-[0.1em]">
                      {findSection(a.section)?.name || a.section}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-[--brand-text] leading-snug group-hover:opacity-70 transition-opacity line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-[--brand-text-secondary] leading-relaxed line-clamp-2">{a.excerpt}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-[--brand-text-secondary]">
                      <div className="avatar avatar-xs"><span>M</span></div>
                      <span>{readingMinutes(a.content)} min read</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ═══ TRENDING ═══ */}
        {trending.length > 0 && (
          <Reveal>
            <section className="max-w-[1280px] mx-auto px-5 py-20 border-t border-[--brand-border]">
              <div className="flex items-center gap-3 mb-10">
                <TrendingUp size={16} className="text-[--brand-text-secondary]" />
                <h2 className="cool-h2 text-[--brand-text]">Trending This Week</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                {trending.slice(0, 6).map((a, i) => (
                  <Link
                    key={a.id}
                    href={`/article/${a.slug}`}
                    className="group flex gap-4 py-5 border-b border-[--brand-border] items-start hover:bg-[--brand-accent-soft]/30 -mx-3 px-3 rounded-lg transition-colors"
                  >
                    <span className="text-[26px] font-normal text-[--brand-border] leading-none shrink-0 w-8 font-display italic tabular-nums">
                      {String(i + 3).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold text-[--brand-text-secondary] uppercase tracking-wider">
                        {findSection(a.section)?.name || a.section}
                      </span>
                      <h3 className="text-sm font-semibold text-[--brand-text] leading-snug mt-0.5 group-hover:opacity-70 transition-opacity line-clamp-2">
                        {a.title}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[--brand-text-secondary]">
                        <div className="avatar avatar-xs"><span>M</span></div>
                        <span>{readingMinutes(a.content)} min read</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ═══ LATEST ═══ */}
        {latest.length > 0 && (
          <Reveal>
            <section className="max-w-[1280px] mx-auto px-5 py-20 border-t border-[--brand-border]">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <BookOpen size={16} className="text-[--brand-text-secondary]" />
                  <h2 className="cool-h2 text-[--brand-text]">Latest</h2>
                </div>
                <Link href="/latest" className="inline-flex items-center gap-1 text-sm font-medium text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors">
                  View all <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-14">
                {latest.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
              </div>
            </section>
          </Reveal>
        )}

        {/* ═══ CATEGORIES ═══ */}
        <Reveal>
          <section className="max-w-[1280px] mx-auto px-5 py-20 border-t border-[--brand-border]">
            <h2 className="cool-h2 text-[--brand-text] mb-10">Explore by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="group flex flex-col p-6 rounded-2xl border border-[--brand-border] hover:border-[--brand-text]/20 hover:bg-[--brand-accent-soft]/30 transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold text-[--brand-text] group-hover:opacity-80 transition-opacity">
                    {cat.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-[--brand-text-secondary] leading-relaxed">{cat.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[--brand-text-secondary] group-hover:text-[--brand-text] transition-colors">
                    Browse articles <ArrowUpRight size={12} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ═══ NEWSLETTER ═══ */}
        <Reveal>
          <section className="max-w-[1280px] mx-auto px-5 py-20">
            <div className="relative overflow-hidden rounded-3xl bg-[--brand-text] p-10 md:p-16 text-[--brand-bg]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/[0.03] rounded-full translate-y-1/2 -translate-x-1/3" />
              <div className="relative max-w-xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] text-[13px] font-medium text-white/60 mb-8">
                  <Sparkles size={13} /> The INSIGHTS Newsletter
                </div>
                <h2 className="font-display italic text-[clamp(28px,4vw,44px)] leading-[1.05] text-white mb-4">
                  Stay ahead of the curve.
                </h2>
                <p className="text-base text-white/60 leading-relaxed mb-10">
                  The sharpest thinking on AI, business, and career — delivered to your inbox every morning.
                </p>
                <NewsletterForm variant="inline" />
              </div>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}