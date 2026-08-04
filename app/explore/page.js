import Link from 'next/link';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import NewsletterForm from '@/components/site/NewsletterForm';
import Reveal from '@/components/site/Reveal';
import { db } from '@/packages/db';
import { coverImageFor } from '@/packages/utils';
import { findSection } from '@/lib/sections';
import { ArrowUpRight, TrendingUp, Hash, Clock, BookOpen, Sparkles, Compass } from 'lucide-react';

export const revalidate = 900;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.manikantar.in';

export const metadata = {
  title: 'Explore — INSIGHTS',
  description: 'Discover articles, categories, and trending topics at INSIGHTS.',
};

const CATEGORIES = [
  { slug: 'ai', title: 'Artificial Intelligence', desc: 'Frontier models, agents, and the race to AGI', icon: 'AI' },
  { slug: 'business', title: 'Business & Strategy', desc: 'Markets, moats, and modern operators', icon: 'BS' },
  { slug: 'career', title: 'Career & Growth', desc: 'Navigating the future of work', icon: 'CG' },
  { slug: 'productivity', title: 'Productivity', desc: 'Deep work, systems, and rituals', icon: 'PR' },
  { slug: 'essays', title: 'Essays', desc: 'Slow ideas, written to last', icon: 'ES' },
  { slug: 'tech', title: 'Technology', desc: 'Code, architecture, and engineering', icon: 'TC' },
];

export default async function ExplorePage() {
  let articles = [];
  try { articles = await db.articles.list({ status: 'published', limit: 50 }); } catch { articles = []; }

  const catCounts = {};
  const catFeatured = {};
  articles.forEach((a) => {
    catCounts[a.section] = (catCounts[a.section] || 0) + 1;
    if (!catFeatured[a.section]) catFeatured[a.section] = a;
  });

  const allTags = [...new Set(articles.flatMap((a) => (a.hashtags || []).slice(0, 3)))].slice(0, 12);
  const recent = articles.slice(0, 6);

  const picks = articles.filter((a, i) => i < 6 && a.excerpt?.length > 80).slice(0, 3);

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        {/* ═══ HERO ═══ */}
        <section className="max-w-[1280px] mx-auto px-5 pt-16 md:pt-24 pb-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[--brand-text-secondary] uppercase tracking-[0.15em] mb-6">
              <Compass size={13} /> Discover
            </span>
            <h1 className="font-display italic text-[clamp(40px,6vw,68px)] leading-[0.95] tracking-[-0.03em] text-[--brand-text]">
              Explore.
            </h1>
            <p className="mt-4 text-lg text-[--brand-text-secondary] leading-relaxed max-w-xl">
              Dive into topics that matter — AI research, business strategy, engineering deep dives, and essays that challenge how you think.
            </p>
          </div>
        </section>

        {/* ═══ CATEGORIES GRID ═══ */}
        <Reveal>
          <section className="max-w-[1280px] mx-auto px-5 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => {
                const count = catCounts[cat.slug] || 0;
                const featured = catFeatured[cat.slug];
                return (
                  <Link key={cat.slug} href={`/${cat.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-[--brand-border] p-6 hover:border-[--brand-text]/15 hover:bg-[--brand-accent-soft]/20 transition-all duration-300"
                  >
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-[--brand-accent-soft]/60 flex items-center justify-center text-xs font-bold text-[--brand-text-secondary] group-hover:bg-[--brand-accent-soft] transition-colors">
                      {cat.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-[--brand-text] pr-14">{cat.title}</h3>
                    <p className="mt-1.5 text-sm text-[--brand-text-secondary] leading-relaxed">{cat.desc}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-[--brand-text-secondary]">{count} article{count !== 1 ? 's' : ''}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[--brand-text-secondary] group-hover:text-[--brand-text] transition-colors">
                        Browse <ArrowUpRight size={11} />
                      </span>
                    </div>
                    {featured && (
                      <div className="mt-4 pt-4 border-t border-[--brand-border]">
                        <span className="text-[10px] font-semibold text-[--brand-text-secondary] uppercase tracking-wider">Featured</span>
                        <p className="mt-1 text-sm text-[--brand-text] leading-snug line-clamp-2">{featured.title}</p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        </Reveal>

        {/* ═══ TRENDING TOPICS ═══ */}
        {allTags.length > 0 && (
          <Reveal>
            <section className="max-w-[1280px] mx-auto px-5 py-12 border-t border-[--brand-border]">
              <div className="flex items-center gap-2.5 mb-8">
                <TrendingUp size={15} className="text-[--brand-text-secondary]" />
                <h2 className="text-lg font-semibold text-[--brand-text]">Trending Topics</h2>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {allTags.map((tag) => (
                  <Link key={tag} href={`/search?q=${encodeURIComponent(tag.replace('#', ''))}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[--brand-border] text-sm text-[--brand-text-secondary] hover:text-[--brand-text] hover:border-[--brand-text]/20 hover:bg-[--brand-accent-soft]/30 transition-all"
                  >
                    <Hash size={12} />
                    {tag.replace('#', '')}
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ═══ EDITOR'S PICKS ═══ */}
        {picks.length > 0 && (
          <Reveal>
            <section className="max-w-[1280px] mx-auto px-5 py-12 border-t border-[--brand-border]">
              <div className="flex items-center gap-2.5 mb-8">
                <Sparkles size={15} className="text-[--brand-text-secondary]" />
                <h2 className="text-lg font-semibold text-[--brand-text]">Editor&rsquo;s Picks</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {picks.map((a) => (
                  <Link key={a.id} href={`/article/${a.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-[--brand-border] hover:border-[--brand-text]/15 transition-all duration-300"
                  >
                    <div className="aspect-[2/1] bg-[--shimmer-base] overflow-hidden">
                      <img
                        src={a.coverImage || coverImageFor(a.title, a.section)}
                        alt={a.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] font-semibold text-[--brand-text-secondary] uppercase tracking-wider">
                        {findSection(a.section)?.name || a.section}
                      </span>
                      <h3 className="mt-1.5 text-[15px] font-semibold text-[--brand-text] leading-snug group-hover:opacity-70 transition-opacity line-clamp-2">
                        {a.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-[--brand-text-secondary] leading-relaxed line-clamp-2">{a.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* ═══ RECENTLY UPDATED ═══ */}
        {recent.length > 0 && (
          <Reveal>
            <section className="max-w-[1280px] mx-auto px-5 py-12 border-t border-[--brand-border]">
              <div className="flex items-center gap-2.5 mb-8">
                <Clock size={15} className="text-[--brand-text-secondary]" />
                <h2 className="text-lg font-semibold text-[--brand-text]">Recently Published</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                {recent.map((a, i) => (
                  <Link key={a.id} href={`/article/${a.slug}`}
                    className="group flex gap-4 py-4 border-b border-[--brand-border] items-start hover:bg-[--brand-accent-soft]/20 -mx-3 px-3 rounded-lg transition-colors"
                  >
                    <span className="text-[22px] font-normal text-[--brand-border] leading-none shrink-0 w-7 font-display italic tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold text-[--brand-text-secondary] uppercase tracking-wider">
                        {findSection(a.section)?.name || a.section}
                      </span>
                      <h3 className="text-sm font-semibold text-[--brand-text] leading-snug mt-0.5 group-hover:opacity-70 transition-opacity line-clamp-2">
                        {a.title}
                      </h3>
                      <p className="mt-1 text-xs text-[--brand-text-secondary] line-clamp-1">{a.excerpt}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/latest"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors"
                >
                  Browse all articles <ArrowUpRight size={14} />
                </Link>
              </div>
            </section>
          </Reveal>
        )}

        {/* ═══ READING COLLECTIONS ═══ */}
        <Reveal>
          <section className="max-w-[1280px] mx-auto px-5 py-12 border-t border-[--brand-border]">
            <div className="flex items-center gap-2.5 mb-8">
              <BookOpen size={15} className="text-[--brand-text-secondary]" />
              <h2 className="text-lg font-semibold text-[--brand-text]">Reading Collections</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'AI & Machine Learning', desc: 'Everything from foundation models to practical ML engineering.', href: '/ai' },
                { title: 'Career Development', desc: 'Playbooks for navigating modern tech careers.', href: '/career' },
                { title: 'Business Strategy', desc: 'Deep dives on markets, growth, and competitive advantage.', href: '/business' },
                { title: 'Deep Work & Productivity', desc: 'Systems, habits, and rituals for focused work.', href: '/productivity' },
                { title: 'Long-form Essays', desc: 'Ideas worth sitting with.', href: '/essays' },
                { title: 'All Articles', desc: 'Every published piece, newest first.', href: '/latest' },
              ].map((col) => (
                <Link key={col.href} href={col.href}
                  className="group flex flex-col p-5 rounded-xl border border-[--brand-border] hover:border-[--brand-text]/15 hover:bg-[--brand-accent-soft]/20 transition-all duration-300"
                >
                  <h3 className="text-sm font-semibold text-[--brand-text] group-hover:opacity-80 transition-opacity">{col.title}</h3>
                  <p className="mt-1 text-xs text-[--brand-text-secondary] leading-relaxed">{col.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[--brand-text-secondary] group-hover:text-[--brand-text] transition-colors">
                    Explore <ArrowUpRight size={10} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ═══ NEWSLETTER ═══ */}
        <Reveal>
          <section className="max-w-[1280px] mx-auto px-5 py-20">
            <div className="relative overflow-hidden rounded-3xl bg-[--brand-text] p-10 md:p-16 text-[--brand-bg] text-center">
              <Sparkles size={20} className="mx-auto mb-5 text-white/50" />
              <h2 className="font-display italic text-[clamp(26px,4vw,38px)] leading-[1.05] text-white mb-3">
                Never miss a discovery.
              </h2>
              <p className="text-base text-white/60 mb-8 max-w-md mx-auto">
                Weekly curated reads delivered to your inbox — no spam, just signal.
              </p>
              <NewsletterForm variant="inline" />
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}