'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SocialIcon from './SocialIcon';
import { activeSocialLinks } from '@/lib/social';
import { ArrowUp, Mail, Sparkles, BookOpen, Library, Tag } from 'lucide-react';

const SECTIONS = [
  { slug: 'ai', name: 'AI', icon: Sparkles },
  { slug: 'tech', name: 'Tech', icon: BookOpen },
  { slug: 'business', name: 'Business', icon: Tag },
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
      className={`fixed bottom-8 right-8 z-50 w-11 h-11 rounded-2xl bg-[--brand-accent] text-white flex items-center justify-center shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-1 transition-all duration-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}

export default function Footer() {
  const links = activeSocialLinks();
  const year = new Date().getFullYear();

  return (
    <>
      <BackToTop />
      <footer className="relative mt-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[--brand-bg] via-[--brand-accent-soft]/30 to-[--brand-accent-soft]/10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[--brand-accent]/40 to-transparent" />

        <div className="relative max-w-[1200px] mx-auto px-5 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-[--brand-border]/60">
            <div className="md:col-span-1">
              <div className="font-display italic text-2xl tracking-tight bg-gradient-to-r from-[--brand-accent] to-emerald-300 bg-clip-text text-transparent">INSIGHTS</div>
              <p className="mt-3 text-sm text-[--brand-text-secondary] leading-relaxed">Ideas. Intelligence. Impact. A digital publication on AI, business, and the future of work.</p>
              <div className="mt-5 flex items-center gap-2 text-xs text-[--brand-text-secondary]">
                <Mail size={12} />
                <a href="mailto:contact@manikantar.in" className="hover:text-[--brand-accent] transition-colors">contact@manikantar.in</a>
              </div>
              {links.length > 0 && (
                <div className="mt-4 flex gap-2.5">
                  {links.map((s) => (
                    <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}
                      className="w-9 h-9 rounded-xl bg-[--brand-card] border border-[--brand-border] flex items-center justify-center text-[--brand-text-secondary] hover:text-[--brand-accent] hover:border-[--brand-accent]/30 hover:shadow-md hover:shadow-green-500/10 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <SocialIcon iconKey={s.key} size={15} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[--brand-accent]">Sections</span>
              <div className="mt-4 flex flex-col gap-2.5">
                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <Link key={sec.slug} href={`/${sec.slug}`}
                      className="group flex items-center gap-2.5 text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors"
                    >
                      <span className="w-6 h-6 rounded-lg bg-[--brand-accent-soft]/50 flex items-center justify-center group-hover:bg-[--brand-accent-soft] transition-colors">
                        <Icon size={11} className="text-[--brand-accent]" />
                      </span>
                      {sec.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[--brand-accent]">Pages</span>
              <div className="mt-4 flex flex-col gap-2.5">
                {[
                  { href: '/latest', label: 'Latest' },
                  { href: '/newsletter', label: 'Newsletter' },
                  { href: '/search', label: 'Search' },
                  { href: '/author', label: 'Author' },
                ].map((p) => (
                  <Link key={p.href} href={p.href}
                    className="text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors"
                  >{p.label}</Link>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-[--brand-accent]/5 to-transparent opacity-60 pointer-events-none" />
              <div className="relative">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[--brand-accent]">Stay updated</span>
                <p className="mt-3 text-sm text-[--brand-text-secondary] leading-relaxed">Get the latest posts delivered straight to your inbox.</p>
                <Link href="/newsletter"
                  className="mt-4 inline-flex items-center gap-1.5 bg-[--brand-accent] text-white text-sm font-bold rounded-xl px-5 py-2.5 hover:opacity-90 transition-all hover:shadow-md hover:shadow-green-500/20"
                >
                  <Mail size={14} />
                  Subscribe
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[--brand-text-secondary]">
            <span>&copy; {year} INSIGHTS. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-[--brand-text] transition-colors">Privacy</Link>
              <span className="w-1 h-1 rounded-full bg-[--brand-border]" />
              <Link href="/about" className="hover:text-[--brand-text] transition-colors">About</Link>
              <span className="w-1 h-1 rounded-full bg-[--brand-border]" />
              <span className="hidden sm:inline">Built with care</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
