import Link from 'next/link';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import NewsletterForm from '@/components/site/NewsletterForm';
import Reveal from '@/components/site/Reveal';
import { db } from '@/packages/db';
import { AUTHOR } from '@/lib/author';
import { MapPin, Calendar, BookOpen, Mail, Globe, ExternalLink, Sparkles, ArrowUpRight } from 'lucide-react';

export const revalidate = 900;

export const metadata = {
  title: 'Manikanta — Author',
  description: AUTHOR.mission,
  openGraph: { title: 'Manikanta — INSIGHTS', description: AUTHOR.mission, type: 'profile' },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.manikantar.in';

export default async function AuthorPage() {
  let articles = [];
  try { articles = await db.articles.list({ status: 'published', limit: 30 }); } catch { articles = []; }

  const stats = {
    ...AUTHOR.stats,
    articlesPublished: articles.length,
  };

  const socialLinks = [
    { label: 'Email', href: `mailto:${AUTHOR.social.email}`, icon: Mail },
    { label: 'Portfolio', href: AUTHOR.social.portfolio, icon: Globe },
  ].filter((l) => l.href);

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: AUTHOR.name,
        description: AUTHOR.mission,
        url: `${SITE_URL}/author`,
        jobTitle: AUTHOR.headline,
        homeLocation: AUTHOR.location,
        knowsAbout: AUTHOR.expertise,
        sameAs: Object.values(AUTHOR.social).filter(Boolean),
      }) }} />
      <Nav />
      <main>
        {/* ═══ HERO ═══ */}
        <section className="max-w-[1280px] mx-auto px-5 pt-16 md:pt-24 pb-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[--brand-text-secondary] uppercase tracking-[0.15em] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[--brand-text]" />
              About the Author
            </span>
            <h1 className="font-display italic text-[clamp(42px,6vw,72px)] leading-[0.95] tracking-[-0.03em] text-[--brand-text]">
              {AUTHOR.name}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-[--brand-text-secondary] leading-relaxed">
              {AUTHOR.headline} &mdash; {AUTHOR.location}
            </p>
            <p className="mt-4 text-base text-[--brand-text-secondary] leading-relaxed max-w-2xl">
              {AUTHOR.mission}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[--brand-border] text-sm text-[--brand-text-secondary] hover:text-[--brand-text] hover:border-[--brand-text]/20 transition-all"
                  >
                    <Icon size={13} /> {link.label}
                  </a>
                );
              })}
              <Link href="/newsletter"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[--brand-text] text-[--brand-bg] text-sm font-medium hover:opacity-80 transition-opacity"
              >
                <Sparkles size={13} /> Subscribe
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <Reveal>
          <section className="max-w-[1280px] mx-auto px-5 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: stats.articlesPublished, label: 'Articles Published' },
                { value: stats.sectionCoverage, label: 'Sections Covered' },
                { value: stats.readers, label: 'Monthly Readers' },
                { value: stats.yearsWriting, label: 'Years Writing' },
              ].map((s) => (
                <div key={s.label} className="p-6 rounded-2xl border border-[--brand-border] text-center">
                  <div className="font-display italic text-3xl md:text-4xl text-[--brand-text]">{s.value}</div>
                  <div className="mt-1 text-xs text-[--brand-text-secondary] uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ═══ BIO ═══ */}
        <Reveal>
          <section className="max-w-[1280px] mx-auto px-5 py-16">
            <div className="max-w-3xl">
              <h2 className="cool-h2 text-[--brand-text] mb-6">About</h2>
              <div className="prose-editorial text-[--brand-text-secondary]">
                {AUTHOR.bio.split('\n\n').map((p, i) => (
                  <p key={i} className="mb-4">{p}</p>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* ═══ EXPERTISE ═══ */}
        <Reveal>
          <section className="max-w-[1280px] mx-auto px-5 py-16 border-t border-[--brand-border]">
            <h2 className="cool-h2 text-[--brand-text] mb-8">Areas of Expertise</h2>
            <div className="flex flex-wrap gap-3">
              {AUTHOR.expertise.map((skill) => (
                <span key={skill}
                  className="px-5 py-3 rounded-xl border border-[--brand-border] text-sm font-medium text-[--brand-text] hover:border-[--brand-text]/20 hover:bg-[--brand-accent-soft]/30 transition-all"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ═══ TIMELINE ═══ */}
        <Reveal>
          <section className="max-w-[1280px] mx-auto px-5 py-16 border-t border-[--brand-border]">
            <h2 className="cool-h2 text-[--brand-text] mb-10">Journey</h2>
            <div className="max-w-2xl">
              {AUTHOR.timeline.map((item, i) => (
                <div key={item.year} className="relative pl-8 pb-10 last:pb-0">
                  {i < AUTHOR.timeline.length - 1 && (
                    <div className="absolute left-[7px] top-3 bottom-0 w-px bg-[--brand-border]" />
                  )}
                  <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-[--brand-text] bg-[--brand-bg]" />
                  <span className="text-xs font-semibold text-[--brand-text-secondary] uppercase tracking-wider">{item.year}</span>
                  <h3 className="mt-1 text-base font-semibold text-[--brand-text]">{item.event}</h3>
                  <p className="mt-1 text-sm text-[--brand-text-secondary] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ═══ FEATURED ARTICLES ═══ */}
        {articles.length > 0 && (
          <Reveal>
            <section className="max-w-[1280px] mx-auto px-5 py-16 border-t border-[--brand-border]">
              <div className="flex items-center justify-between mb-10">
                <h2 className="cool-h2 text-[--brand-text]">Published Articles</h2>
                <Link href="/latest" className="inline-flex items-center gap-1 text-sm font-medium text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors">
                  View all <ArrowUpRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                {articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
              </div>
            </section>
          </Reveal>
        )}

        {/* ═══ NEWSLETTER ═══ */}
        <Reveal>
          <section className="max-w-[1280px] mx-auto px-5 py-20">
            <div className="relative overflow-hidden rounded-3xl bg-[--brand-text] p-10 md:p-16 text-[--brand-bg] text-center">
              <Sparkles size={20} className="mx-auto mb-5 text-white/50" />
              <h2 className="font-display italic text-[clamp(28px,4vw,40px)] leading-[1.05] text-white mb-3">
                Stay in the loop.
              </h2>
              <p className="text-base text-white/60 mb-8 max-w-md mx-auto">
                Get new articles delivered to your inbox. No spam, just thoughtful writing.
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