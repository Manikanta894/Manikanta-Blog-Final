import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import { db } from '@/packages/db';
import { MapPin, BookOpen, Calendar } from 'lucide-react';

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
      <main className="max-w-[900px] mx-auto px-5 pt-14 pb-24">
        <div className="flex flex-col sm:flex-row gap-8 items-start pb-12 border-b border-[--brand-border] mb-14">
          <div className="avatar w-24 h-24 text-4xl shrink-0 shadow-lg shadow-green-500/20"><span>M</span></div>
          <div>
            <h1 className="cool-hero text-[--brand-text]">Manikanta</h1>
            <p className="mt-4 text-lg text-[--brand-text-secondary] leading-relaxed max-w-xl">
              Writer, builder, and the mind behind <strong>INSIGHTS</strong>. I write about AI, business, strategy, career, and the future of work — always with a focus on substance over noise.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-[--brand-text-secondary]">
              <span className="flex items-center gap-1.5"><MapPin size={14} /> Bangalore, India</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Writing since 2020</span>
              <span className="flex items-center gap-1.5"><BookOpen size={14} /> {articles.length} articles</span>
            </div>
          </div>
        </div>

        <h2 className="cool-h2 text-[--brand-text] mb-8">All articles</h2>
        {articles.length === 0 ? (
          <p className="text-[--brand-text-secondary]">No articles yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
            {articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
