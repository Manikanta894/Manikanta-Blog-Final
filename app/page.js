import Link from 'next/link';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import AuthorByline from '@/components/site/AuthorByline';
import NewsletterForm from '@/components/site/NewsletterForm';
import Reveal from '@/components/site/Reveal';
import { findSection } from '@/lib/sections';
import { db } from '@/packages/db';
import { coverImageFor } from '@/packages/utils';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export const revalidate = 900;

function readingMinutes(content) {
  return Math.max(2, Math.round((content || '').split(/\s+/).length / 220));
}

export default async function Home() {
  let articles = [];
  try { articles = await db.articles.list({ status: 'published', limit: 40 }); } catch { articles = []; }

  const hero = articles[0] || null;
  const latest = articles.length > 1 ? articles.slice(1, 13) : [];
  const essays = articles.filter((a) => a.section === 'essays').slice(0, 3);

  let categories = [];
  try {
    const raw = await db.categories.list();
    categories = raw.map((c) => ({
      slug: c.slug,
      name: c.name,
      desc: c.description || c.kicker || '',
      accent: c.accent || '#0A0A0A',
    }));
  } catch { categories = []; }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const EmptyState = ({ title, body, href, cta }) => (
    <div className="rounded-2xl border border-dashed border-[--brand-border] bg-[--brand-accent-soft]/20 p-10 md:p-14 text-center">
      <div className="mx-auto max-w-md">
        <h3 className="font-display italic text-2xl md:text-3xl text-[--brand-text]">{title}</h3>
        <p className="mt-3 text-sm md:text-base text-[--brand-text-secondary] leading-relaxed">{body}</p>
        {href && cta && (
          <Link href={href} className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[--brand-text] text-[--brand-bg] px-5 py-2.5 text-sm font-medium hover:opacity-80 transition-opacity">
            {cta} <ArrowUpRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        {/* MASTHEAD */}
        <section className="max-w-[1200px] mx-auto px-5 pt-10 md:pt-14 pb-8 border-b border-[--brand-border]">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[--brand-text-secondary] mb-3">
                A Publication on Ideas, Intelligence &amp; Impact
              </p>
              <h1 className="font-display text-[clamp(36px,6vw,64px)] leading-[1.02] tracking-tight text-[--brand-text] whitespace-nowrap">
                NEXT DRAFT
              </h1>
              <p className="mt-4 text-base md:text-lg text-[--brand-text-secondary] leading-relaxed max-w-xl">
                Long-form thinking on artificial intelligence, business strategy, and the craft of building things that matter.
              </p>
            </div>
            <div className="text-left md:text-right text-sm text-[--brand-text-secondary] space-y-1">
              <div className="font-mono text-xs uppercase tracking-widest">{today}</div>
              <div className="font-mono text-xs uppercase tracking-widest">Ideas. Intelligence. Impact.</div>
              <Link href="/newsletter" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[--brand-text] text-[--brand-bg] px-4 py-2 text-[13px] font-medium hover:opacity-80 transition-opacity">
                Subscribe <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURED STORY */}
        <Reveal>
          <section className="max-w-[1200px] mx-auto px-5 py-12 md:py-16 border-b border-[--brand-border]">
            {hero ? (() => {
              const hd = new Date(hero.publishedAt || hero.createdAt);
              const hdStr = hd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              const hMin = readingMinutes(hero.content);
              const hCover = hero.coverImage || coverImageFor(hero.title, hero.section);
              const hSection = findSection(hero.section)?.name || hero.section;
              return (
                <Link href={`/article/${hero.slug}`} className="group block">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-7 relative overflow-hidden rounded-2xl aspect-[16/10] bg-[--shimmer-base] shadow-sm">
                      <img src={hCover} alt={hero.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]" loading="eager" />
                    </div>
                    <div className="lg:col-span-5">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[--brand-text-secondary] mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[--brand-text]" />
                        Featured · {hSection}
                      </span>
                      <h2 className="font-display text-[clamp(28px,4vw,46px)] leading-[1.05] tracking-tight text-[--brand-text] group-hover:opacity-80 transition-opacity">
                        {hero.title}
                      </h2>
                      <p className="mt-4 text-base md:text-lg text-[--brand-text-secondary] leading-relaxed">
                        {hero.excerpt || 'Read the full piece.'}
                      </p>
                      <AuthorByline article={hero} className="mt-6" dateFormat="long" />
                      <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-[--brand-text] group-hover:gap-2.5 transition-all">
                        Read the story <ArrowUpRight size={15} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })() : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[--brand-text-secondary] mb-4">Welcome</p>
                  <h2 className="font-display text-[clamp(30px,4.5vw,52px)] leading-[1.02] tracking-tight text-[--brand-text]">
                    Ideas worth reading, written to last.
                  </h2>
                  <p className="mt-5 text-base md:text-lg text-[--brand-text-secondary] leading-relaxed max-w-xl">
                    NEXT DRAFT publishes long-form thinking on AI, business strategy, career growth, and the craft of building. New pieces arrive regularly — subscribe to get them in your inbox, or explore topics below.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/explore" className="inline-flex items-center gap-1.5 rounded-full bg-[--brand-text] text-[--brand-bg] px-5 py-2.5 text-sm font-medium hover:opacity-80 transition-opacity">
                      Explore topics <ArrowUpRight size={14} />
                    </Link>
                    <Link href="/newsletter" className="inline-flex items-center gap-1.5 rounded-full border border-[--brand-border] px-5 py-2.5 text-sm font-medium text-[--brand-text] hover:bg-[--brand-accent-soft] transition-colors">
                      Subscribe
                    </Link>
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-[--brand-border] bg-[--brand-accent-soft]/30 p-8">
                    <h3 className="font-display text-2xl text-[--brand-text]">What to expect</h3>
                    <ul className="mt-4 space-y-3 text-sm text-[--brand-text-secondary]">
                      <li>Deep dives on AI and emerging technology</li>
                      <li>Practical business and career strategy</li>
                      <li>Essays on craft, systems, and leadership</li>
                      <li>Short signals and curated reading</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>
        </Reveal>
        {/* LATEST ARTICLES */}
        {latest.length > 0 && (
        <Reveal>
          <section className="max-w-[1200px] mx-auto px-5 py-12 md:py-16 border-b border-[--brand-border]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl md:text-3xl text-[--brand-text]">Latest</h2>
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

        {/* RESEARCH & ESSAYS */}
        {essays.length > 0 && (
          <Reveal>
            <section className="max-w-[1200px] mx-auto px-5 py-12 md:py-16 border-b border-[--brand-border]">
              <h2 className="font-display text-2xl md:text-3xl text-[--brand-text] mb-8">Research &amp; Long-form Essays</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10">
                {essays.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
              </div>
            </section>
          </Reveal>
        )}

        {/* EXPLORE BY CATEGORY */}
        <Reveal>
          <section className="max-w-[1200px] mx-auto px-5 py-12 md:py-16 border-b border-[--brand-border]">
            <h2 className="font-display text-2xl md:text-3xl text-[--brand-text] mb-8">Explore by Category</h2>
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <Link key={cat.slug} href={`/${cat.slug}`}
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
            ) : (
              <EmptyState
                title="Categories coming soon."
                body="Topic categories will appear here once they are configured in the Studio."
              />
            )}
          </section>
        </Reveal>

        {/* NEWSLETTER */}
        <Reveal>
          <section className="max-w-[1200px] mx-auto px-5 py-16 md:py-24">
            <div className="relative overflow-hidden rounded-3xl bg-[--brand-text] p-10 md:p-16 text-[--brand-bg]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/[0.03] rounded-full translate-y-1/2 -translate-x-1/3" />
              <div className="relative max-w-xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] text-[13px] font-medium text-white/60 mb-8">
                  <Sparkles size={13} /> The NEXT DRAFT Newsletter
                </div>
                <h2 className="font-display italic text-[clamp(28px,4vw,44px)] leading-[1.05] text-white mb-4">
                  Stay ahead of the curve.
                </h2>
                <p className="text-base text-white/60 leading-relaxed mb-10">
                  The sharpest thinking on AI, business, and the craft of building things that matter — delivered to your inbox.
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