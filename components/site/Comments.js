'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine } from 'lucide-react';

const STORAGE_KEY = 'wbi_comments_';

function sanitize(str) {
  return String(str || '').replace(/[<>&"']/g, (c) => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'})[c]).trim();
}

function getComments(slug) {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY + slug) || '[]');
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
    const updated = [entry, ...comments];
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
          <PenLine size={16} className="text-[--brand-text-secondary]" />
        </div>
        <h3 className="text-lg font-bold text-[--brand-text]">Your Notes</h3>
        <span className="text-[11px] text-[--brand-text-secondary] bg-[--brand-accent-soft] px-2 py-0.5 rounded-full">local only</span>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)"
          className="w-full border border-[--brand-border] rounded-xl px-4 py-3 text-sm bg-[--brand-card] text-[--brand-text] outline-none focus:border-[--brand-accent] focus:ring-1 focus:ring-[--brand-accent]/20 transition-all"
        />
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Jot down a thought..." rows={3} required
          className="w-full border border-[--brand-border] rounded-xl px-4 py-3 text-sm bg-[--brand-card] text-[--brand-text] outline-none focus:border-[--brand-accent] focus:ring-1 focus:ring-[--brand-accent]/20 transition-all resize-none"
        />
        <div className="flex items-center gap-3">
          <button type="submit" className="inline-flex items-center gap-1.5 bg-[--brand-accent] text-white rounded-xl px-5 py-3 text-sm font-bold hover:opacity-90 transition-all hover:shadow-md hover:shadow-black/5">
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
              </div>
              <p className="text-sm text-[--brand-text-secondary] leading-relaxed pl-9">{c.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <p className="text-sm text-[--brand-text-secondary] italic">No notes yet. Jot something down.</p>
        )}
      </div>
    </section>
  );
}
