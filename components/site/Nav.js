'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Menu, Search, X, Sun, Moon, ChevronDown, Sparkles } from 'lucide-react';
import { NAV } from '@/lib/sections';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const primaryNav = NAV.slice(0, 6);
  const extraNav = NAV.slice(6);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (href) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'glass shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-16 md:h-18">
        <div className="flex items-center gap-6">
          <button onClick={() => setOpen(true)} className="lg:hidden text-[--brand-text]" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display italic text-2xl md:text-3xl tracking-tight text-gradient">
              INSIGHTS
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {primaryNav.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    active
                      ? 'text-white bg-[--brand-accent] shadow-sm'
                      : 'text-[--brand-text-secondary] hover:text-[--brand-text] hover:bg-[--brand-accent-soft]'
                  }`}
                >
                  {n.name}
                </Link>
              );
            })}
            {extraNav.length > 0 && (
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-[--brand-text-secondary] hover:text-[--brand-text] rounded-lg hover:bg-[--brand-accent-soft] transition-all"
                >
                  More <ChevronDown size={14} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-44 bg-[--brand-card] border border-[--brand-border] rounded-xl shadow-elevated p-1.5 animate-scale-in">
                    {extraNav.map((n) => (
                      <Link
                        key={n.href}
                        href={n.href}
                        onClick={() => setMoreOpen(false)}
                        className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          isActive(n.href) ? 'text-[--brand-accent] bg-[--brand-accent-soft]' : 'text-[--brand-text-secondary] hover:text-[--brand-text] hover:bg-[--brand-accent-soft]'
                        }`}
                      >
                        {n.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[--brand-text-secondary] hover:text-[--brand-text] hover:bg-[--brand-accent-soft] transition-all"
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          <Link href="/search" aria-label="Search" className="w-9 h-9 flex items-center justify-center rounded-lg text-[--brand-text-secondary] hover:text-[--brand-text] hover:bg-[--brand-accent-soft] transition-all">
            <Search size={16} />
          </Link>
          <Link
            href="/newsletter"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[--brand-accent] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-all hover:shadow-md hover:shadow-indigo-500/20"
          >
            <Sparkles size={14} />
            Subscribe
          </Link>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-[--brand-bg] flex flex-col animate-fade-in">
          <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-16 border-b border-[--brand-border]">
            <Link href="/" onClick={() => setOpen(false)} className="font-display italic text-2xl text-gradient">INSIGHTS</Link>
            <button onClick={() => setOpen(false)} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[--brand-accent-soft]"><X size={20} /></button>
          </div>
          <div className="px-5 py-6 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`py-3 px-3 text-lg font-medium rounded-lg transition-colors ${
                  isActive(n.href) ? 'text-[--brand-accent] bg-[--brand-accent-soft]' : 'text-[--brand-text] hover:bg-[--brand-accent-soft]'
                }`}
              >
                {n.name}
              </Link>
            ))}
          </div>
          <div className="px-5 mt-auto pb-8 pt-4 border-t border-[--brand-border]">
            <Link
              href="/newsletter"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg bg-[--brand-accent] text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition-all"
            >
              <Sparkles size={16} />
              Subscribe to Newsletter
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
