'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SocialIcon from './SocialIcon';
import { activeSocialLinks } from '@/lib/social';
import { ArrowUp, Mail, Sparkles } from 'lucide-react';

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-[--brand-text] text-[--brand-bg] flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
      aria-label="Back to top"
    >
      <ArrowUp size={16} />
    </button>
  );
}

export default function Footer() {
  const links = activeSocialLinks();
  const year = new Date().getFullYear();

  return (
    <>
      <BackToTop />
      <footer className="border-t border-[--brand-border] mt-20">
        <div className="max-w-[1200px] mx-auto px-5 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="text-[17px] font-semibold tracking-tight text-[--brand-text]">INSIGHTS</Link>
              <p className="mt-3 text-sm text-[--brand-text-secondary] leading-relaxed max-w-[220px]">
                Premium writing on AI, business, and the future of work.
              </p>
              <Link href="/newsletter"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[--brand-text] text-[--brand-bg] px-4 py-1.5 text-[13px] font-medium hover:opacity-80 transition-opacity"
              >
                <Sparkles size={12} />
                Subscribe
              </Link>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[--brand-text-secondary] uppercase tracking-wider block mb-3">Sections</span>
              <div className="flex flex-col gap-2">
                {['ai','tech','business','essays','productivity'].map((s) => (
                  <Link key={s} href={`/${s}`} className="text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors capitalize">{s}</Link>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[--brand-text-secondary] uppercase tracking-wider block mb-3">Pages</span>
              <div className="flex flex-col gap-2">
                {[
                  { href: '/latest', label: 'Latest' },
                  { href: '/search', label: 'Search' },
                  { href: '/author', label: 'Author' },
                  { href: '/about', label: 'About' },
                  { href: '/privacy', label: 'Privacy' },
                ].map((p) => (
                  <Link key={p.href} href={p.href} className="text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors">{p.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[--brand-text-secondary] uppercase tracking-wider block mb-3">Connect</span>
              <a href="mailto:contact@manikantar.in"
                className="flex items-center gap-1.5 text-sm text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors mb-4"
              >
                <Mail size={13} />
                contact@manikantar.in
              </a>
              {links.length > 0 && (
                <div className="flex gap-1.5">
                  {links.map((s) => (
                    <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[--brand-text-secondary] hover:text-[--brand-text] hover:bg-[--brand-accent-soft] transition-colors"
                    >
                      <SocialIcon iconKey={s.key} size={14} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 pt-5 border-t border-[--brand-border] flex flex-col sm:flex-row justify-between gap-2 text-xs text-[--brand-text-secondary]">
            <span>&copy; {year} INSIGHTS. All rights reserved.</span>
            <span>Crafted with care in India</span>
          </div>
        </div>
      </footer>
    </>
  );
}