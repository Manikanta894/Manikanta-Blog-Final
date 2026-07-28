'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

export default function NewsletterForm({ variant = 'default' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const r = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (r.ok) {
        setStatus('success');
        setMessage('You\'re in. Welcome to INSIGHTS.');
        setEmail('');
      } else {
        const d = await r.json();
        setStatus('error');
        setMessage(d.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Try again.');
    }
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 border border-[--brand-border] rounded-sm px-3 py-2.5 text-sm bg-[--brand-card] text-[--brand-text] outline-none focus:border-[--brand-accent]"
          required
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-1.5 bg-[--brand-accent] text-white rounded-sm px-4 py-2.5 text-xs font-mono uppercase tracking-[0.12em] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : status === 'success' ? <Check size={14} /> : 'Join'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 border border-white/20 rounded-sm px-4 py-3 bg-transparent text-white text-sm outline-none focus:border-[--brand-accent] placeholder:text-white/40"
          required
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 bg-[--brand-accent] hover:opacity-90 text-white rounded-full px-6 py-3 text-xs font-mono uppercase tracking-[0.16em] transition-opacity disabled:opacity-50"
        >
          {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : status === 'success' ? <Check size={14} /> : 'Subscribe'}
        </button>
      </div>
      <AnimatePresence>
        {message && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mt-2 text-xs ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
