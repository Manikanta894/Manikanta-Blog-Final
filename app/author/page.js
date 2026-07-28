import Link from 'next/link';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import Kicker from '@/components/site/Kicker';
import { db } from '@/packages/db';

export const revalidate = 900;

export const metadata = {
  title: 'Manikanta — Author',
  description: 'Writer, builder, and the mind behind INSIGHTS.',
};

export default async function AuthorPage() {
  let articles = [];
  try { articles = await db.articles.list({ status: 'published', limit: 30 }); } catch { articles = []; }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container pt-10 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start py-12">
            <div className="w-28 h-28 md:w-36 md:h-36 shrink-0 rounded-full bg-[--brand-accent-soft] flex items-center justify-center text-[--brand-accent] text-5xl font-display italic">
              M
            </div>
            <div>
              <Kicker color="#D46A2E">About the Author</Kicker>
              <h1 className="text-h1 italic mt-2 text-[--brand-text]">Manikanta</h1>
              <p className="mt-4 text-lead text-[--brand-text-secondary] max-w-xl">
                Writer, builder, and the mind behind <strong>INSIGHTS</strong>. I write about AI, business, strategy, career, and the future of work — always with a focus on substance over noise.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="text-eyebrow text-[--brand-text-secondary]">Based in Bangalore, India</span>
                <span className="text-eyebrow text-[--brand-text-secondary]">&middot;</span>
                <span className="text-eyebrow text-[--brand-text-secondary]">Writing since 2020</span>
                <span className="text-eyebrow text-[--brand-text-secondary]">&middot;</span>
                <span className="text-eyebrow text-[--brand-text-secondary]">{articles.length} articles published</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-16 pt-12 border-t border-[--brand-border]">
          <h2 className="text-h2 italic text-[--brand-text] mb-2">All articles</h2>
          <p className="text-lead text-[--brand-text-secondary] mb-8">Every piece I have written on INSIGHTS.</p>
          {articles.length === 0 ? (
            <p className="text-[--brand-text-secondary]">No articles yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              {articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
