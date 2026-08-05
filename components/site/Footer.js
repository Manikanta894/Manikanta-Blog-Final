'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import SocialIcon from './SocialIcon';
import { activeSocialLinks } from '@/lib/social';
import { ArrowUp, Mail, Sparkles, Rss, ArrowUpRight, MapPin, Globe } from 'lucide-react';
import NewsletterForm from './NewsletterForm';

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}

function StatCounter({ value, label }) {
  const [counted, setCounted] = useState(false);
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !counted) { setCounted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [counted]);

  useEffect(() => {
    if (!counted) return;
    const target = parseInt(String(value)) || 0;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [counted, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display italic text-2xl md:text-3xl text-white">{display.toLocaleString()}</div>
      <div className="mt-1 text-[11px] text-white/40 uppercase tracking-wider">{label}</div>
    </div>
  );
}

const SECTIONS = ['ai', 'tech', 'business', 'essays', 'productivity', 'career'];
const PAGES = [
  { href: '/latest', label: 'Latest' },
  { href: '/explore', label: 'Explore' },
  { href: '/search', label: 'Search' },
  { href: '/author', label: 'Author' },
  { href: '/about', label: 'About' },
];

export default function Footer() {
  const links = activeSocialLinks();
  const year = new Date().getFullYear();

  return (
    <>
      <BackToTop />
      <footer className="relative bg-[#0A0A0A] text-white overflow-hidden">
        {/* subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative max-w-[1280px] mx-auto px-5 pt-14 md:pt-20 pb-10 md:pb-16">
          {/* ═══ TOP: BRAND + NEWSLETTER ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-16 border-b border-white/[0.06]">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo-mark.svg" alt="INSIGHTS" className="h-8 w-auto brightness-0 invert" />
                <span className="text-[22px] font-semibold tracking-tight">INSIGHTS</span>
              </div>
              <p className="text-[15px] text-white/50 leading-relaxed">
                A premium digital publication exploring artificial intelligence, business strategy, and the future of work. We publish deep dives, frameworks, and essays that help you think better and build smarter.
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-white/40">
                <MapPin size={12} />
                <span>Bangalore, India</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
              </div>
            </div>

            <div className="relative lg:pl-8">
              <span className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-4 block">Newsletter</span>
              <p className="text-sm text-white/50 mb-4">Get the best of INSIGHTS delivered to your inbox every weekday morning.</p>
              <NewsletterForm variant="inline" />
            </div>
          </div>

          {/* ═══ MIDDLE: NAV + CATEGORIES + ARTICLES ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-14 border-b border-white/[0.06]">
            <div>
              <span className="text-xs font-semibold text-white/30 uppercase tracking-[0.15em] mb-5 block">Navigate</span>
              <div className="flex flex-col gap-2.5">
                {PAGES.map((p) => (
                  <Link key={p.href} href={p.href} className="text-[15px] text-white/50 hover:text-white transition-colors">{p.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-white/30 uppercase tracking-[0.15em] mb-5 block">Categories</span>
              <div className="flex flex-col gap-2.5">
                {SECTIONS.map((s) => (
                  <Link key={s} href={`/${s}`} className="text-[15px] text-white/50 hover:text-white transition-colors capitalize">{s}</Link>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-white/30 uppercase tracking-[0.15em] mb-5 block">Company</span>
              <div className="flex flex-col gap-2.5">
                <Link href="/about" className="text-[15px] text-white/50 hover:text-white transition-colors">About</Link>
                <Link href="/privacy" className="text-[15px] text-white/50 hover:text-white transition-colors">Privacy</Link>
                <a href="/rss.xml" className="text-[15px] text-white/50 hover:text-white transition-colors flex items-center gap-1.5">
                  <Rss size={12} /> RSS Feed
                </a>
                <Link href="/newsletter" className="text-[15px] text-white/50 hover:text-white transition-colors">Newsletter</Link>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-white/30 uppercase tracking-[0.15em] mb-5 block">Connect</span>
              <a href="mailto:contact@manikantar.in"
                className="flex items-center gap-1.5 text-[15px] text-white/50 hover:text-white transition-colors mb-4"
              >
                <Mail size={13} /> contact@manikantar.in
              </a>
              {links.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {links.map((s) => (
                    <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}
                      className="w-9 h-9 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all"
                    >
                      <SocialIcon iconKey={s.key} size={15} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ═══ STATS BAR ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 py-8 md:py-12 border-b border-white/[0.06]">
            <StatCounter value={12} label="Articles Published" />
            <StatCounter value={5} label="Sections" />
            <StatCounter value={5000} label="Monthly Readers" />
            <StatCounter value={6} label="Years Writing" />
          </div>

          {/* ═══ BOTTOM ═══ */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-xs text-white/30">
            <div className="flex items-center gap-2">
              <span>&copy; {year} INSIGHTS. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span className="hover:text-white/50 transition-colors cursor-default">Terms</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>Crafted with care in India</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}