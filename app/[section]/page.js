import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import { findSection } from '@/lib/sections';
import { db } from '@/packages/db';
import { TrendingUp } from 'lucide-react';

export const revalidate = 900;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.manikantar.in';

export async function generateMetadata({ params }) {
  const { section } = await params;
  const cfg = findSection(section);
  if (!cfg) return { title: 'Not found — INSIGHTS' };
  return {
    title: cfg.name,
    description: cfg.desc,
    alternates: { canonical: `${SITE_URL}/${cfg.slug}` },
    openGraph: { title: `${cfg.name} — INSIGHTS`, description: cfg.desc, url: `${SITE_URL}/${cfg.slug}` },
  };
}

export default async function SectionPage({ params }) {
  const { section } = await params;
  const cfg = findSection(section);

  if (!cfg) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="max-w-[1200px] mx-auto px-5 py-32 text-center">
          <h1 className="cool-h1 text-[--brand-text]">Nothing here yet.</h1>
        </div>
        <Footer />
      </div>
    );
  }

  let articles = [];
  try { articles = await db.articles.list({ section, status: 'published', limit: 50 }); } catch { articles = []; }
  const [hero, ...rest] = articles;

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-[1200px] mx-auto px-5 pt-14 pb-16">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[--brand-accent-soft] flex items-center justify-center">
              <TrendingUp size={20} className="text-[--brand-accent]" />
            </div>
            <h1 className="cool-hero text-[--brand-text]">{cfg.name}</h1>
          </div>
          <p className="text-lg text-[--brand-text-secondary] max-w-xl">{cfg.desc}</p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-24 text-[--brand-text-secondary]">No articles published in this section yet.</div>
        ) : (
          <>
            {hero && (
              <div className="mb-10 bg-[--brand-accent-soft] rounded-2xl p-6 -mx-3">
                <ArticleCard article={hero} variant="compact" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {rest.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
