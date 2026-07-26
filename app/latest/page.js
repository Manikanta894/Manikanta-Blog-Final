import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import Kicker from '@/components/site/Kicker';
import ArticleCard from '@/components/site/ArticleCard';
import { db } from '@/packages/db';

export const revalidate = 900;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://insights.manikantar.in';

export const metadata = {
  title: 'Latest Stories',
  description: 'Every published article on INSIGHTS, newest first — AI, business, career, and productivity.',
  alternates: { canonical: `${SITE_URL}/latest` },
};

export default async function LatestPage() {
  let articles = [];
  try { articles = await db.articles.list({ status: 'published', limit: 60 }); } catch { articles = []; }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container pt-10 pb-24">
        <div className="max-w-2xl py-10">
          <Kicker color="#D46A2E">Every story</Kicker>
          <h1 className="text-hero italic mt-3 text-[#181818]">Latest stories</h1>
          <p className="mt-4 text-lead text-[#555555]">Every published article, newest first — synced automatically as new stories go live.</p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-[#555555]">Nothing published yet — check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-6">
            {articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
