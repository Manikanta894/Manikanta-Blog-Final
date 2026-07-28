'use client';
import { useState, useCallback } from 'react';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import Kicker from '@/components/site/Kicker';
import ArticleCard from '@/components/site/ArticleCard';
import ShimmerImage from '@/components/site/ShimmerImage';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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

  if (!loaded) {
    loadMore();
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container pt-10 pb-24">
        <div className="max-w-2xl py-10">
          <Kicker color="#D46A2E">Every story</Kicker>
          <h1 className="text-hero italic mt-3 text-[--brand-text]">Latest stories</h1>
          <p className="mt-4 text-lead text-[--brand-text-secondary]">Every published article, newest first — synced automatically as new stories go live.</p>
        </div>

        {articles.length === 0 && loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-md border border-[--brand-border] bg-[--brand-card] overflow-hidden">
                <div className="aspect-[4/3] shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-16 shimmer rounded" />
                  <div className="h-5 w-full shimmer rounded" />
                  <div className="h-4 w-3/4 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-[--brand-text-secondary]">Nothing published yet — check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-6">
            <AnimatePresence mode="popLayout">
              {articles.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: (i % PAGE_SIZE) * 0.03 }}
                >
                  <ArticleCard article={a} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {hasMore && articles.length > 0 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              disabled={loading}
              className="inline-flex items-center gap-2 border border-[--brand-border] rounded-full px-7 py-3.5 text-sm font-mono uppercase tracking-[0.12em] text-[--brand-text] hover:border-[--brand-accent] hover:text-[--brand-accent] transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Loading...' : `Load more · ${PAGE_SIZE}`}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
