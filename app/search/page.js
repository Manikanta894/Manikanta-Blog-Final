'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import ArticleCard from '@/components/site/ArticleCard';
import { Search as SearchIcon, Loader2, Sparkles } from 'lucide-react';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setResults(d.results || []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-[900px] mx-auto px-5 pt-16 pb-24">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[--brand-accent-soft] text-sm font-medium text-[--brand-accent] mb-5">
            <Sparkles size={14} /> Find Anything
          </div>
          <h1 className="cool-hero text-[--brand-text]">Search</h1>
          <div className="mt-8 relative">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[--brand-text-secondary]" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try: agents, MBA, focus, moat…"
              className="w-full border border-[--brand-border] rounded-xl pl-12 pr-5 py-4 text-base outline-none focus:border-[--brand-accent] focus:ring-1 focus:ring-[--brand-accent]/20 bg-[--brand-card] text-[--brand-text] transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[--brand-accent]" size={24} />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {q && results.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4 opacity-20">&#128269;</div>
                <p className="text-lg text-[--brand-text-secondary]">No matches for &ldquo;{q}&rdquo;</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
              {results.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
