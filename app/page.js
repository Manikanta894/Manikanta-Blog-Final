import Link from 'next/link';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import HeroSplit from '@/components/site/HeroSplit';
import NewsletterForm from '@/components/site/NewsletterForm';
import { HOMEPAGE_CATEGORIES } from '@/lib/sections';
import { db } from '@/packages/db';
import { Sparkles, TrendingUp, BookOpen } from 'lucide-react';

export const revalidate = 900;

export default async function Home() {
  let articles = [];
  try { articles = await db.articles.list({ status: 'published', limit: 40 }); } catch { articles = []; }

  const hero = articles[0];
  const trending = articles.slice(1, 5);
  const latestStories = articles.slice(1, 7);
  const bySection = (slug) => articles.filter((a) => a.section === slug).slice(0, 4);

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <HeroSplit hero={hero} trending={trending} />

        {latestStories.length > 0 && (
          <section className="max-w-[1200px] mx-auto px-5 py-14">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[--brand-accent-soft] flex items-center justify-center">
                  <BookOpen size={16} className="text-[--brand-accent]" />
                </div>
                <h2 className="cool-h2 text-[--brand-text]">Latest</h2>
              </div>
              <Link href="/latest" className="inline-flex items-center gap-1.5 text-sm font-medium text-[--brand-accent] hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {latestStories.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
            </div>
          </section>
        )}

        {HOMEPAGE_CATEGORIES.map(({ slug, title }) => {
          const items = bySection(slug);
          if (items.length === 0) return null;
          return (
            <section key={slug} className="max-w-[1200px] mx-auto px-5 py-14">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[--brand-accent-soft] flex items-center justify-center">
                    <TrendingUp size={16} className="text-[--brand-accent]" />
                  </div>
                  <h2 className="cool-h2 text-[--brand-text]">{title}</h2>
                </div>
                <Link href={`/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-[--brand-accent] hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {items.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
              </div>
            </section>
          );
        })}

        <section className="max-w-[1200px] mx-auto px-5 py-20">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[--brand-accent] to-emerald-700 p-10 md:p-16 text-white shadow-elevated">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative max-w-lg mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sm font-medium backdrop-blur-sm mb-6">
                <Sparkles size={14} /> Never miss a story
              </div>
              <h2 className="cool-hero text-white mb-4">Stay ahead.</h2>
              <p className="text-lg text-white/80 leading-relaxed mb-8">The sharpest thinking on AI, business, and career — delivered to your inbox.</p>
              <NewsletterForm variant="inline" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
