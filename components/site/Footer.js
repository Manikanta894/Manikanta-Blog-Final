'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SocialIcon from './SocialIcon';
import { activeSocialLinks } from '@/lib/social';
import { ArrowUp, Mail, Sparkles, BookOpen, Target, Library, TrendingUp, Hash } from 'lucide-react';

const SECTIONS = [
  { slug: 'ai', name: 'AI', icon: Sparkles },
  { slug: 'tech', name: 'Tech', icon: BookOpen },
  { slug: 'business', name: 'Business', icon: Target },
  { slug: 'essays', name: 'Essays', icon: BookOpen },
  { slug: 'productivity', name: 'Productivity', icon: Library },
];

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-2xl bg-[--brand-accent] text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-1 transition-all duration-300 group ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
      aria-label="Back to top"
    >
      <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
}

function Dot({ className = '' }) {
  return <span className={`inline-block w-1.5 h-1.5 rounded-full bg-[--brand-accent] ${className}`} />;
}

export default function Footer() {
  const links = activeSocialLinks();
  const year = new Date().getFullYear();

  return (
    <>
      <BackToTop />
      <footer className="relative mt-32">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[--brand-accent]/50 to-transparent animate-pulse-glow" />

        <div className="relative max-w-[1200px] mx-auto px-5 pt-20 pb-10">
          <div className="max-w-3xl mb-16">
            <div className="font-display italic text-[clamp(32px,5vw,56px)] leading-[0.95] tracking-[-0.03em] text-[--brand-text]">
              Ideas.<br />
              <span className="text-gradient">Intelligence.</span><br />
              Impact.
            </div>
            <p className="mt-6 text-base text-[--brand-text-secondary] leading-relaxed max-w-lg">
              A premium digital publication exploring AI, business, and the future of work — written by builders, for builders.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/newsletter"
                className="inline-flex items-center gap-2 bg-[--brand-accent] text-white rounded-xl px-6 py-3 text-sm font-bold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-indigo-500/25"
              >
                <Sparkles size={14} />
                Join the newsletter
              </Link>
              <a href="mailto:contact@manikantar.in"
                className="inline-flex items-center gap-2 rounded-xl border border-[--brand-border] px-5 py-3 text-sm font-medium text-[--brand-text-secondary] hover:text-[--brand-text] hover:border-[--brand-accent]/30 hover:bg-[--brand-accent-soft]/50 transition-all"
              >
                <Mail size={14} />
                Say hello
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-[--brand-border]">
            <div className="col-span-2 md:col-span-1">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[--brand-text-secondary] mb-5 block">Sections</span>
              <div className="flex flex-col gap-3">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <Link key={sec.slug} href={`/${sec.slug}`}
                      className="group flex items-center gap-3 text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors"
                    >
                      <span className="w-7 h-7 rounded-lg bg-[--brand-accent-soft]/60 flex items-center justify-center group-hover:bg-[--brand-accent-soft] group-hover:scale-110 transition-all duration-200">
                        <Icon size={12} className="text-[--brand-accent]" />
                      </span>
                      {sec.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[--brand-text-secondary] mb-5 block">Browse</span>
              <div className="flex flex-col gap-3">
                {[
                  { href: '/latest', label: 'Latest', icon: TrendingUp },
                  { href: '/search', label: 'Search', icon: Hash },
                  { href: '/author', label: 'Author', icon: BookOpen },
                ].map((p) => {
                  const Icon = p.icon;
                  return (
                    <Link key={p.href} href={p.href}
                      className="group flex items-center gap-3 text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors"
                    >
                      <span className="w-7 h-7 rounded-lg bg-[--brand-accent-soft]/60 flex items-center justify-center group-hover:bg-[--brand-accent-soft] group-hover:scale-110 transition-all duration-200">
                        <Icon size={12} className="text-[--brand-accent]" />
                      </span>
                      {p.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[--brand-text-secondary] mb-5 block">Company</span>
              <div className="flex flex-col gap-3">
                <Link href="/about" className="text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors">About</Link>
                <Link href="/newsletter" className="text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors">Newsletter</Link>
                <Link href="/privacy" className="text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors">Privacy</Link>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[--brand-text-secondary] mb-5 block">Connect</span>
              <a href="mailto:contact@manikantar.in"
                className="inline-flex items-center gap-2 text-sm text-[--brand-text-secondary] hover:text-[--brand-accent] transition-colors mb-4"
              >
                <Mail size={13} />
                contact@manikantar.in
              </a>
              {links.length > 0 && (
                <div className="flex gap-2">
                  {links.map((s) => (
                    <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}
                      className="w-9 h-9 rounded-xl border border-[--brand-border] flex items-center justify-center text-[--brand-text-secondary] hover:text-[--brand-accent] hover:border-[--brand-accent]/30 hover:bg-[--brand-accent-soft]/50 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <SocialIcon iconKey={s.key} size={15} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-[--brand-border] text-xs text-[--brand-text-secondary]">
            <div className="flex items-center gap-2">
              <span className="font-display italic text-sm text-[--brand-text]">INSIGHTS</span>
              <Dot />
              <span>&copy; {year}</span>
            </div>
            <span>Crafted with care in India</span>
          </div>
        </div>
      </footer>
    </>
  );
}