'use client';
import { useState, useEffect } from 'react';
import Nav from '@/components/site/Nav';
import Footer from '@/components/site/Footer';
import Kicker from '@/components/site/Kicker';
import { motion } from 'framer-motion';
import { BarChart3, Eye, BookOpen, TrendingUp, Calendar, Clock } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sr, ar] = await Promise.all([
          fetch('/api/stats').then((r) => r.json()),
          fetch('/api/articles?limit=50').then((r) => r.json()),
        ]);
        setStats(sr);
        setArticles(ar.articles || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen">
      <Nav />
      <main className="container pt-10 pb-24">
        <div className="max-w-xl py-10">
          <div className="h-4 w-24 shimmer rounded mb-3" />
          <div className="h-12 w-64 shimmer rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 shimmer rounded-md" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 shimmer rounded-md" />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );

  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
    .slice(0, 10);

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container pt-10 pb-24">
        <div className="max-w-xl py-10">
          <Kicker color="#D46A2E">Private</Kicker>
          <h1 className="text-h1 italic mt-2 text-[--brand-text]">Analytics</h1>
          <p className="mt-3 text-lead text-[--brand-text-secondary]">Reading stats and content overview.</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Total Articles', value: stats.articles, icon: BookOpen, color: '#7C3AED' },
              { label: 'Published', value: stats.published, icon: Eye, color: '#0A0A0A' },
              { label: 'Subscribers', value: stats.subscribers, icon: TrendingUp, color: '#0284C7' },
              { label: 'Drafts', value: stats.drafts, icon: Clock, color: '#EA580C' },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-[--brand-border] rounded-md bg-[--brand-card] p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-eyebrow text-[--brand-text-secondary]">{card.label}</span>
                  <card.icon size={16} style={{ color: card.color }} />
                </div>
                <span className="text-h2 italic text-[--brand-text]">{card.value}</span>
              </motion.div>
            ))}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} className="text-[--brand-accent]" />
            <h2 className="font-display italic text-h3 text-[--brand-text]">Recent articles</h2>
          </div>
          <div className="border border-[--brand-border] rounded-md overflow-hidden">
            {recentArticles.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 px-5 py-4 border-b border-[--brand-border] last:border-0 hover:bg-[--brand-accent-soft] transition-colors"
              >
                <span className="w-6 text-eyebrow text-[--brand-text-secondary]">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm text-[--brand-text] truncate">{a.title}</span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[--brand-text-secondary]">
                    {a.section} · {new Date(a.publishedAt || a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span className={`text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-1 rounded-full ${a.status === 'published' ? 'text-green-600 bg-green-100' : a.status === 'draft' ? 'text-[--brand-text-secondary] bg-[--brand-accent-soft]' : ''}`}>
                  {a.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
