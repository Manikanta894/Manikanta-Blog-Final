'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import Kicker from '@/components/site/Kicker';
import ArticleCard from '@/components/site/ArticleCard';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

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
      <main className="container pt-10 pb-24">
        <div className="text-center max-w-2xl mx-auto py-10">
          <Kicker>Find Anything</Kicker>
          <h1 className="text-hero italic mt-4 text-[#181818]">Search</h1>
          <div className="mt-8 relative">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try: agents, MBA, focus, moat…" className="w-full border border-[#D8D3CB] rounded-sm pl-11 pr-4 py-4 text-lead outline-none focus:border-[#181818] bg-white text-[#181818]" />
          </div>
        </div>

        {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#555555]" /></div> : (
          <div className="max-w-5xl mx-auto">
            {q && results.length === 0 && <div className="text-center text-[#555555] py-10">No matches yet.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {results.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
