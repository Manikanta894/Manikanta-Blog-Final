import Link from 'next/link';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import HeroSplit from '@/components/site/HeroSplit';
import Kicker from '@/components/site/Kicker';
import NewsletterForm from '@/components/site/NewsletterForm';
import { HOMEPAGE_CATEGORIES } from '@/lib/sections';
import { ArrowUpRight } from 'lucide-react';
import { db } from '@/packages/db';

export const revalidate = 900; // ISR: re-check every 15 minutes

export default async function Home() {
  let articles = [];
  try { articles = await db.articles.list({ status: 'published', limit: 40 }); } catch { articles = []; }

  // The homepage always reflects whatever has actually been published —
  // by you in /admin, or by your n8n workflow. Nothing is auto-generated.
  const hero = articles[0];
  const trending = articles.slice(1, 5);
  const latestStories = articles.slice(1, 4);
  const editorsPicks = articles.slice(4, 7);
  const bySection = (slug) => articles.filter((a) => a.section === slug).slice(0, 4);

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        {/* HERO — featured story */}
        <HeroSplit hero={hero} trending={trending} />

        {/* LATEST STORIES */}
        {latestStories.length > 0 && (
          <section className="container py-16 md:py-20">
            <div className="flex items-end justify-between mb-8 pb-5 border-b border-[--brand-border]">
              <div>
                <Kicker color="#D46A2E">Fresh off the desk</Kicker>
                <h2 className="text-h2 italic mt-2 text-[--brand-text]">Latest stories</h2>
              </div>
              <Link href="/latest" className="hidden md:inline-flex items-center gap-2 text-sm text-[--brand-text] hover:text-brand group">
                <span className="text-eyebrow">View all</span>
                <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {latestStories.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
            </div>
          </section>
        )}

        {/* EDITOR'S PICKS */}
        {editorsPicks.length > 0 && (
          <section className="container py-16 md:py-20">
            <div className="flex items-end justify-between mb-8 pb-5 border-b border-[--brand-border]">
              <div>
                <Kicker color="#D46A2E">Curated</Kicker>
                <h2 className="text-h2 italic mt-2 text-[--brand-text]">Editor&#39;s picks</h2>
              </div>
            </div>
            <div className="max-w-4xl">
              {editorsPicks.map((a, i) => <ArticleCard key={a.id} article={a} variant="compact" index={i} />)}
            </div>
          </section>
        )}

        {/* CATEGORY SECTIONS — Artificial Intelligence, Business & Strategy, Career & Growth */}
        {HOMEPAGE_CATEGORIES.map(({ slug, title }) => {
          const items = bySection(slug);
          if (items.length === 0) return null;
          return (
            <section key={slug} className="container py-16 md:py-20">
              <div className="flex items-end justify-between mb-8 pb-5 border-b border-[#D8D3CB]">
                <div>
                  <Kicker color="#D46A2E">Category</Kicker>
                  <h2 className="text-h2 italic mt-2 text-[--brand-text]">{title}</h2>
                </div>
                <Link href={`/${slug}`} className="hidden md:inline-flex items-center gap-2 text-sm text-[--brand-text] hover:text-brand group">
                  <span className="text-eyebrow">See all</span>
                  <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
              </div>
            </section>
          );
        })}

        {/* NEWSLETTER */}
        <section className="container py-16 md:py-20">
          <div className="relative overflow-hidden rounded-md bg-[--brand-text] text-white px-8 py-14 md:px-14 md:py-16 grid gap-8 md:grid-cols-[1fr_auto] md:items-center grain">
            <div>
              <h2 className="text-h1 italic">Ideas. Intelligence. Impact.</h2>
              <p className="mt-3 text-lead text-white/60 max-w-md">One email, delivered when it matters. The sharpest thinking on AI, business, and career growth — no fluff.</p>
            </div>
            <div className="w-full md:w-80">
              <NewsletterForm variant="inline" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
