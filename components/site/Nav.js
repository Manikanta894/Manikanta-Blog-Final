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
    const onScroll = () => setScrolled(window.scrollY > 30);
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
    <header className={`sticky top-0 z-40 transition-all duration-500 ${scrolled ? 'bg-[--brand-bg]/85 backdrop-blur-xl border-b border-[--brand-border]/80 shadow-sm' : ''}`}>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[--brand-accent]/30 to-transparent opacity-0 transition-opacity duration-500" style={{ opacity: scrolled ? 1 : 0 }} />

      <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-16 md:h-[68px]">
        <div className="flex items-center gap-8">
          <button onClick={() => setOpen(true)} className="lg:hidden text-[--brand-text]" aria-label="Open menu">
            <Menu size={20} />
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            <span className="w-2.5 h-2.5 rounded-full bg-[--brand-accent] animate-heartbeat group-hover:scale-125 transition-transform" />
            <span className="font-display italic text-2xl md:text-[28px] tracking-tight text-gradient">
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
                  className={`relative px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? 'text-[--brand-text] bg-[--brand-accent-soft]/80'
                      : 'text-[--brand-text-secondary] hover:text-[--brand-text] hover:bg-[--brand-accent-soft]/50'
                  }`}
                >
                  {n.name}
                  {active && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[--brand-accent]" />
                  )}
                </Link>
              );
            })}
            {extraNav.length > 0 && (
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  className="flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium text-[--brand-text-secondary] hover:text-[--brand-text] rounded-lg hover:bg-[--brand-accent-soft]/50 transition-all"
                >
                  More <ChevronDown size={13} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <div className="absolute left-0 top-full mt-2 w-44 bg-[--brand-card] border border-[--brand-border] rounded-xl shadow-elevated p-1.5 animate-scale-in origin-top-left">
                    {extraNav.map((n) => (
                      <Link
                        key={n.href}
                        href={n.href}
                        onClick={() => setMoreOpen(false)}
                        className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          isActive(n.href) ? 'text-[--brand-accent] bg-[--brand-accent-soft]' : 'text-[--brand-text-secondary] hover:text-[--brand-text] hover:bg-[--brand-accent-soft]/50'
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

        <div className="flex items-center gap-1">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[--brand-text-secondary] hover:text-[--brand-text] hover:bg-[--brand-accent-soft]/50 transition-all"
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          <Link href="/search" aria-label="Search"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[--brand-text-secondary] hover:text-[--brand-text] hover:bg-[--brand-accent-soft]/50 transition-all"
          >
            <Search size={16} />
          </Link>
          <Link
            href="/newsletter"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[--brand-accent] text-white px-4 py-2 text-[13px] font-semibold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
          >
            <Sparkles size={13} />
            Subscribe
          </Link>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-[--brand-bg] flex flex-col">
          <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-16 md:h-[68px]">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[--brand-accent]" />
              <span className="font-display italic text-2xl text-gradient">INSIGHTS</span>
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Close"
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[--brand-accent-soft]/50"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-5 py-6 flex flex-col gap-1 overflow-y-auto">
            {NAV.map((n, i) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${i * 40}ms` }}
                className={`py-3.5 px-4 text-lg font-medium rounded-xl transition-all animate-fade-up ${
                  isActive(n.href)
                    ? 'text-[--brand-accent] bg-[--brand-accent-soft]'
                    : 'text-[--brand-text] hover:bg-[--brand-accent-soft]/50'
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
              className="flex items-center justify-center gap-2 rounded-xl bg-[--brand-accent] text-white px-6 py-3.5 text-sm font-bold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-indigo-500/25"
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