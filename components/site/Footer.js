import Link from 'next/link';
import SocialIcon from './SocialIcon';
import { activeSocialLinks } from '@/lib/social';

export default function Footer() {
  const links = activeSocialLinks();

  return (
    <footer className="border-t border-[--brand-border] mt-20">
      <div className="max-w-[1200px] mx-auto px-5 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8 pb-10 border-b border-[--brand-border]">
          <div className="max-w-xs">
            <div className="font-display italic text-xl tracking-tight text-[--brand-text]">INSIGHTS</div>
            <p className="mt-3 text-sm text-[--brand-text-secondary] leading-relaxed">Ideas. Intelligence. Impact. A digital publication on AI, business, and the future of work.</p>
            {links.length > 0 && (
              <div className="mt-5 flex gap-3">
                {links.map((s) => (
                  <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="w-8 h-8 flex items-center justify-center rounded-full text-[--brand-text-secondary] hover:text-[--brand-text] hover:bg-[--brand-accent-soft] transition-colors">
                    <SocialIcon iconKey={s.key} size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[--brand-text-secondary]">Sections</span>
              <Link href="/ai" className="text-[--brand-text] hover:text-[--brand-accent] transition-colors">AI</Link>
              <Link href="/business" className="text-[--brand-text] hover:text-[--brand-accent] transition-colors">Business</Link>
              <Link href="/career" className="text-[--brand-text] hover:text-[--brand-accent] transition-colors">Career</Link>
              <Link href="/latest" className="text-[--brand-text] hover:text-[--brand-accent] transition-colors">Latest</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[--brand-text-secondary]">More</span>
              <Link href="/newsletter" className="text-[--brand-text] hover:text-[--brand-accent] transition-colors">Newsletter</Link>
              <Link href="/about" className="text-[--brand-text] hover:text-[--brand-accent] transition-colors">About</Link>
              <Link href="/privacy" className="text-[--brand-text] hover:text-[--brand-accent] transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col md:flex-row justify-between text-xs text-[--brand-text-secondary] gap-1">
          <span>&copy; {new Date().getFullYear()} INSIGHTS. All rights reserved.</span>
          <span>Ideas. Intelligence. Impact.</span>
        </div>
      </div>
    </footer>
  );
}
