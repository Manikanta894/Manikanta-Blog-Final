'use client';
import { useState, useEffect } from 'react';
import { Share2, Copy, Check, MessageSquare, ArrowUp } from 'lucide-react';

export default function ArticleToolbar({ url, title, articleSlug }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      handleCopy();
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scrollToComments() {
    document.getElementById('article-notes')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className={`fixed left-[max(16px,calc((100vw-1280px)/2+16px))] top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-1.5 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
      <button onClick={handleShare}
        className="w-9 h-9 rounded-full border border-[--brand-border] flex items-center justify-center text-[--brand-text-secondary] hover:text-[--brand-text] hover:border-[--brand-text]/20 hover:bg-[--brand-accent-soft]/50 transition-all"
        aria-label="Share"
      >
        <Share2 size={15} />
      </button>
      <button onClick={handleCopy}
        className="w-9 h-9 rounded-full border border-[--brand-border] flex items-center justify-center text-[--brand-text-secondary] hover:text-[--brand-text] hover:border-[--brand-text]/20 hover:bg-[--brand-accent-soft]/50 transition-all"
        aria-label="Copy link"
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </button>
      <button onClick={scrollToComments}
        className="w-9 h-9 rounded-full border border-[--brand-border] flex items-center justify-center text-[--brand-text-secondary] hover:text-[--brand-text] hover:border-[--brand-text]/20 hover:bg-[--brand-accent-soft]/50 transition-all"
        aria-label="Notes"
      >
        <MessageSquare size={15} />
      </button>
      <div className="w-9 h-px bg-[--brand-border] my-1" />
      <button onClick={scrollToTop}
        className="w-9 h-9 rounded-full border border-[--brand-border] flex items-center justify-center text-[--brand-text-secondary] hover:text-[--brand-text] hover:border-[--brand-text]/20 hover:bg-[--brand-accent-soft]/50 transition-all"
        aria-label="Back to top"
      >
        <ArrowUp size={15} />
      </button>
    </div>
  );
}