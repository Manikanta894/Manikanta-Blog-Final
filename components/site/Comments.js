'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const STORAGE_KEY = 'wbi_comments_';

const SEED_COMMENTS = [
  { name: 'Arjun Mehta', text: 'This resonates deeply. I have been thinking about this exact topic for weeks — you articulated it perfectly.', date: '2026-06-15T09:23:00Z' },
  { name: 'Priya Sharma', text: 'Bookmarked this one. The section on practical applications is exactly what I needed for my team at work.', date: '2026-06-14T14:45:00Z' },
  { name: 'Rahul Verma', text: 'Been following INSIGHTS for a while now and every piece gets better. Keep raising the bar!', date: '2026-06-13T18:12:00Z' },
  { name: 'Ananya Patel', text: 'Finally someone said it. The nuance here is lost on most takes about this subject. Thank you for writing this.', date: '2026-06-12T11:30:00Z' },
  { name: 'Vikram Desai', text: 'Shared this with my entire team. The framework you laid out is going straight into our strategy docs.', date: '2026-06-11T20:05:00Z' },
  { name: 'Kavya Nair', text: 'Beautifully written. The clarity of thought and the quality of research really stand out. More of this please.', date: '2026-06-10T07:48:00Z' },
  { name: 'Siddharth Rao', text: 'I have read a dozen posts on this topic — this is the only one that actually added something new to my understanding.', date: '2026-06-09T16:20:00Z' },
  { name: 'Deepika Krishnan', text: 'The second half changed how I think about this completely. Love when writing does that.', date: '2026-06-08T22:15:00Z' },
  { name: 'Karthik Iyer', text: 'Spot on analysis. The data points you pulled together tell a story most people are missing right now.', date: '2026-06-07T13:40:00Z' },
  { name: 'Neha Joshi', text: 'Sent this to three people before I even finished reading. That is how you know it is good.', date: '2026-06-06T10:55:00Z' },
];

function getSeedForSlug(slug) {
  const hash = slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const count = 3 + (hash % 4);
  const start = hash % (SEED_COMMENTS.length - count);
  return SEED_COMMENTS.slice(start, start + count).map((c, i) => ({
    id: `seed_${slug}_${i}`,
    name: c.name,
    text: c.text,
    date: new Date(c.date).toISOString(),
    seed: true,
  }));
}

function getComments(slug) {
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY + slug) || '[]');
    const hasUserComments = stored.some((c) => !c.seed);
    if (hasUserComments) return stored;
    const seeds = getSeedForSlug(slug);
    if (stored.length === 0) return seeds;
    return stored;
  } catch { return []; }
}

function saveComments(slug, comments) {
  try { localStorage.setItem(STORAGE_KEY + slug, JSON.stringify(comments)); } catch {}
}

export default function Comments({ articleSlug, articleTitle }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { setComments(getComments(articleSlug)); }, [articleSlug]);

  function sanitize(str) {
    return String(str || '').replace(/[<>&"']/g, (c) => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'})[c]).trim();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const entry = { id: Date.now().toString(36), name: sanitize(name) || 'Anonymous', text: sanitize(text), date: new Date().toISOString() };
    const updated = [entry, ...comments.filter((c) => !c.seed)];
    setComments(updated);
    saveComments(articleSlug, updated);
    setText('');
    setName('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  }

  return (
    <section className="mt-16 pt-8 border-t border-[--brand-border]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[--brand-accent-soft] flex items-center justify-center">
          <MessageSquare size={16} className="text-[--brand-accent]" />
        </div>
        <h3 className="text-lg font-bold text-[--brand-text]">Discussion</h3>
        {comments.length > 0 && (
          <span className="text-sm text-[--brand-text-secondary]">({comments.length})</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)"
          className="w-full border border-[--brand-border] rounded-xl px-4 py-3 text-sm bg-[--brand-card] text-[--brand-text] outline-none focus:border-[--brand-accent] focus:ring-1 focus:ring-[--brand-accent]/20 transition-all"
        />
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your thoughts..." rows={3} required
          className="w-full border border-[--brand-border] rounded-xl px-4 py-3 text-sm bg-[--brand-card] text-[--brand-text] outline-none focus:border-[--brand-accent] focus:ring-1 focus:ring-[--brand-accent]/20 transition-all resize-none"
        />
        <div className="flex items-center gap-3">
          <button type="submit" className="inline-flex items-center gap-1.5 bg-[--brand-accent] text-white rounded-xl px-5 py-3 text-sm font-bold hover:opacity-90 transition-all hover:shadow-md hover:shadow-green-500/20">
            Post comment
          </button>
          <AnimatePresence>
            {submitted && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-sm text-[--brand-accent] font-medium">
                Posted!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </form>

      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="pb-5 border-b border-[--brand-border] last:border-0"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-[--brand-accent-soft] flex items-center justify-center text-xs font-bold text-[--brand-accent]">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-[--brand-text]">{c.name}</span>
                <span className="text-xs text-[--brand-text-secondary]">{new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                {c.seed && <span className="text-[10px] text-[--brand-text-secondary] bg-[--brand-border] px-1.5 py-0.5 rounded">seed</span>}
              </div>
              <p className="text-sm text-[--brand-text-secondary] leading-relaxed pl-9">{c.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <p className="text-sm text-[--brand-text-secondary] italic">No comments yet. Start the discussion.</p>
        )}
      </div>
    </section>
  );
}
