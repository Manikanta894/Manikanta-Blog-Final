'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Send } from 'lucide-react';

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
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border border-white/20 rounded-xl px-4 py-3.5 bg-white/10 text-white text-sm outline-none focus:border-white/40 focus:bg-white/15 transition-all placeholder:text-white/50"
            required
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 bg-white text-[--brand-accent] rounded-xl px-5 py-3.5 text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-50 shadow-lg"
        >
          {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : status === 'success' ? <Check size={16} /> : <><Send size={14} /> Subscribe</>}
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
          className="flex-1 border border-white/20 rounded-xl px-4 py-3.5 bg-transparent text-white text-sm outline-none focus:border-[--brand-accent] transition-all placeholder:text-white/40"
          required
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 bg-[--brand-accent] hover:opacity-90 text-white rounded-xl px-6 py-3.5 text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
        >
          {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : status === 'success' ? <Check size={16} /> : 'Subscribe'}
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
