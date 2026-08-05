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
    <header className={`sticky top-0 z-40 transition-all duration-500 ${scrolled ? 'bg-[--brand-bg]/80 backdrop-blur-xl border-b border-[--brand-border]' : ''}`}>
      <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-[52px] md:h-[56px]">
        <div className="flex items-center gap-6">
          <button onClick={() => setOpen(true)} className="lg:hidden -ml-2 w-11 h-11 flex items-center justify-center text-[--brand-text-secondary]" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo-mark.svg" alt="INSIGHTS" className="h-7 w-auto" />
            <span className="hidden sm:inline font-semibold text-[19px] tracking-tight text-[--brand-text]">
              INSIGHTS
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-0.5">
            {primaryNav.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3 py-1.5 text-[13px] rounded-md transition-colors ${
                    active
                      ? 'text-[--brand-text] bg-[--brand-accent-soft]'
                      : 'text-[--brand-text-secondary] hover:text-[--brand-text]'
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
                  className="flex items-center gap-1 px-3 py-1.5 text-[13px] text-[--brand-text-secondary] hover:text-[--brand-text] rounded-md transition-colors"
                >
                  More <ChevronDown size={12} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <div className="absolute left-0 top-full mt-1 w-40 bg-[--brand-card] border border-[--brand-border] rounded-xl shadow-elevated p-1 animate-scale-in origin-top-left">
                    {extraNav.map((n) => (
                      <Link
                        key={n.href}
                        href={n.href}
                        onClick={() => setMoreOpen(false)}
                        className={`block px-3 py-2 text-[13px] rounded-lg transition-colors ${
                          isActive(n.href) ? 'text-[--brand-text] bg-[--brand-accent-soft]' : 'text-[--brand-text-secondary] hover:text-[--brand-text]'
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

        <div className="flex items-center gap-0.5">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="w-8 h-8 flex items-center justify-center rounded-md text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors"
            >
              {resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
          <Link href="/search" aria-label="Search"
            className="w-8 h-8 flex items-center justify-center rounded-md text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors"
          >
            <Search size={15} />
          </Link>
          <Link
            href="/newsletter"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[--brand-text] text-[--brand-bg] px-4 py-1.5 text-[13px] font-medium hover:opacity-80 transition-opacity active:scale-95"
          >
            <Sparkles size={12} />
            Subscribe
          </Link>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-[--brand-bg] flex flex-col">
          <div className="flex items-center justify-between h-[56px] px-5 border-b border-[--brand-border]">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
              <img src="/logo-mark.svg" alt="INSIGHTS" className="h-6 w-auto" />
              <span className="font-semibold text-[17px] tracking-tight text-[--brand-text]">INSIGHTS</span>
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[--brand-accent-soft]"><X size={18} /></button>
          </div>
          <div className="px-5 py-6 flex flex-col gap-1 overflow-y-auto">
            {NAV.map((n, i) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${i * 30}ms` }}
                className={`py-3 px-3 text-[17px] rounded-xl transition-all animate-fade-up ${
                  isActive(n.href)
                    ? 'text-[--brand-text] bg-[--brand-accent-soft] font-medium'
                    : 'text-[--brand-text-secondary] hover:text-[--brand-text]'
                }`}
              >
                {n.name}
              </Link>
            ))}
          </div>
          <div className="px-5 mt-auto pb-10 pt-6">
            <Link
              href="/newsletter"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-[--brand-text] text-[--brand-bg] px-6 py-3 text-[15px] font-medium hover:opacity-80 transition-opacity"
            >
              <Sparkles size={15} />
              Subscribe to Newsletter
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}