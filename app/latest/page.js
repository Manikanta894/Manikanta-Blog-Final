'use client';
import { useState, useCallback } from 'react';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import { Loader2, BookOpen } from 'lucide-react';

const PAGE_SIZE = 12;

export default function LatestPage() {
  const [articles, setArticles] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/articles?limit=${PAGE_SIZE}`);
      const d = await r.json();
      const all = d.articles || [];
      const newSlice = skip === 0 ? all : all.slice(skip, skip + PAGE_SIZE);
      if (newSlice.length === 0 || articles.length + newSlice.length >= all.length) setHasMore(false);
      setArticles((prev) => [...prev, ...newSlice]);
      setSkip((s) => s + PAGE_SIZE);
      setLoaded(true);
    } catch {}
    setLoading(false);
  }, [skip, loading, articles.length]);

  if (!loaded) loadMore();

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-[1200px] mx-auto px-5 pt-14 pb-24">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[--brand-accent-soft] flex items-center justify-center">
              <BookOpen size={20} className="text-[--brand-accent]" />
            </div>
            <h1 className="cool-hero text-[--brand-text]">Latest</h1>
          </div>
          <p className="text-lg text-[--brand-text-secondary] max-w-xl">Every published article, newest first.</p>
        </div>

        {articles.length === 0 && loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="aspect-[16/9] shimmer rounded-xl mb-4" />
                <div className="h-4 w-1/4 shimmer rounded-lg mb-2" />
                <div className="h-6 w-full shimmer rounded-lg mb-2" />
                <div className="h-4 w-2/3 shimmer rounded-lg" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4 opacity-20">&#128221;</div>
            <p className="text-lg text-[--brand-text-secondary]">Nothing published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
          </div>
        )}

        {hasMore && articles.length > 0 && (
          <div className="flex justify-center mt-16">
            <button
              onClick={loadMore}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[--brand-border] px-8 py-3.5 text-sm font-bold text-[--brand-text] hover:border-[--brand-accent] hover:text-[--brand-accent] hover:bg-[--brand-accent-soft] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Loading...' : 'Load more articles'}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
