import Link from 'next/link';
import SocialIcon from './SocialIcon';
import { activeSocialLinks } from '@/lib/social';

export default function Footer() {
  const links = activeSocialLinks();

  return (
    <footer className="mt-24 relative overflow-hidden bg-[var(--brand-text)] text-white">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, rgba(212,106,46,0.20), transparent)' }}
      />
      <div className="container py-16 relative">
        <div className="grid md:grid-cols-2 gap-12 items-start pb-12 border-b border-white/10">
          <div>
            <div className="font-display italic text-4xl md:text-5xl tracking-tight">INSIGHTS</div>
            <p className="mt-4 max-w-sm text-white/60 leading-relaxed">Ideas. Intelligence. Impact. A digital publication on AI, business, and the future of work.</p>
            <Link href="/newsletter" className="mt-6 inline-flex items-center gap-2 bg-brand hover:opacity-90 text-white rounded-full px-5 py-2.5 text-xs font-mono uppercase tracking-[0.16em] transition-opacity">
              Subscribe to the Newsletter →
            </Link>

            {links.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2.5">
                {links.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    title={s.name}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white hover:border-brand hover:bg-brand/20 transition-colors"
                  >
                    <SocialIcon iconKey={s.key} size={17} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-8 md:justify-items-end text-sm">
            <div className="flex flex-col gap-3 md:items-end">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">Sections</span>
              <Link href="/ai" className="text-white/70 hover:text-brand transition-colors">AI</Link>
              <Link href="/business" className="text-white/70 hover:text-brand transition-colors">Business</Link>
              <Link href="/career" className="text-white/70 hover:text-brand transition-colors">Career</Link>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">More</span>
              <Link href="/newsletter" className="text-white/70 hover:text-brand transition-colors">Newsletter</Link>
              <Link href="/about#connect" className="text-white/70 hover:text-brand transition-colors">Contact</Link>
              <Link href="/privacy" className="text-white/70 hover:text-brand transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-white/40 gap-2">
          <span>&copy; {new Date().getFullYear()} INSIGHTS. All rights reserved.</span>
          <span>Ideas. Intelligence. Impact.</span>
        </div>
      </div>
    </footer>
  );
}
