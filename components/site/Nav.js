'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Menu, Search, X, Mail, ChevronDown, Sun, Moon } from 'lucide-react';
import { NAV } from '@/lib/sections';
import { activeSocialLinks, CONTACT_EMAIL } from '@/lib/social';
import SocialIcon from '@/components/site/SocialIcon';

const SOCIAL = activeSocialLinks();

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[--brand-bg]/90 backdrop-blur-xl border-b border-[--brand-border]' : 'bg-transparent'}`}>
      <div className="container flex items-center justify-between py-5">
        <div className="flex items-center gap-4">
          <button onClick={() => setOpen(true)} className="lg:hidden text-[--brand-text]" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Link href="/" className="font-display italic text-2xl tracking-wide text-[--brand-text]">
            INSIGHTS
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-sm">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`relative font-medium transition-colors ${active ? 'text-[--brand-text]' : 'text-[--brand-text-secondary] hover:text-[--brand-text]'}`}
              >
                {n.name}
                {active && <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-brand" />}
              </Link>
            );
          })}
          <div className="relative">
            <button
              onClick={() => setConnectOpen((v) => !v)}
              className="flex items-center gap-1 font-medium text-[--brand-text-secondary] hover:text-[--brand-text] transition-colors"
            >
              Connect
              <ChevronDown size={14} className={`transition-transform ${connectOpen ? 'rotate-180' : ''}`} />
            </button>
            {connectOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setConnectOpen(false)} aria-hidden />
                <div className="absolute right-0 top-full mt-3 z-50 w-56 rounded-md border border-[--brand-border] bg-[--brand-card] shadow-[0_20px_40px_-20px_rgba(24,24,24,0.3)] p-2">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded text-sm text-[--brand-text] hover:bg-[--brand-accent-soft] transition-colors"
                    onClick={() => setConnectOpen(false)}
                  >
                    <Mail size={15} className="text-brand" /> {CONTACT_EMAIL}
                  </a>
                  {SOCIAL.length > 0 && <div className="my-1 border-t border-[--brand-border]" />}
                  {SOCIAL.map((s) => (
                    <a
                      key={s.key}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded text-sm text-[--brand-text] hover:bg-[--brand-accent-soft] transition-colors"
                      onClick={() => setConnectOpen(false)}
                    >
                      <SocialIcon iconKey={s.key} size={15} className="text-brand" /> {s.name}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[--brand-border] text-[--brand-text] hover:border-brand transition-colors"
            >
              {resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
          <Link href="/search" aria-label="Search" className="w-9 h-9 flex items-center justify-center rounded-full border border-[--brand-border] text-[--brand-text] hover:border-brand transition-colors">
            <Search size={15} />
          </Link>
          <Link href="/newsletter" className="hidden sm:inline-flex items-center rounded-full bg-brand text-white px-5 py-2.5 text-xs font-mono uppercase tracking-[0.16em] hover:opacity-90 transition-opacity">
            Newsletter
          </Link>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-[--brand-bg] flex flex-col">
          <div className="container flex items-center justify-between py-5 border-b border-[--brand-border]">
            <Link href="/" onClick={() => setOpen(false)} className="font-display italic text-2xl text-[--brand-text]">INSIGHTS</Link>
            <button onClick={() => setOpen(false)} aria-label="Close menu"><X size={22} /></button>
          </div>
          <div className="container py-8 flex flex-col gap-1">
            {[...NAV, { name: 'Newsletter', href: '/newsletter' }].map((n, i) => (
              <Link
                key={n.href}
                href={n.href}
                target={n.external ? '_blank' : undefined}
                rel={n.external ? 'noopener noreferrer' : undefined}
                onClick={() => setOpen(false)}
                className="font-display text-3xl border-b border-[--brand-border] py-3 flex justify-between items-center text-[--brand-text]"
              >
                <span>{n.name}</span>
                <span className="font-mono text-xs text-[--brand-text-secondary]">{String(i + 1).padStart(2, '0')}</span>
              </Link>
            ))}
          </div>
          <div className="container mt-auto pb-10 pt-4 border-t border-[--brand-border] flex flex-col gap-1">
            <span className="text-eyebrow text-[--brand-text-secondary] mb-2">Connect</span>
            <a href={`mailto:${CONTACT_EMAIL}`} onClick={() => setOpen(false)} className="flex items-center gap-2.5 py-2 text-[--brand-text]">
              <Mail size={16} className="text-brand" /> {CONTACT_EMAIL}
            </a>
            {SOCIAL.map((s) => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex items-center gap-2.5 py-2 text-[--brand-text]">
                <SocialIcon iconKey={s.key} size={16} className="text-brand" /> {s.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
