'use client';
import Link from 'next/link';
import { MapPin, Quote, Sparkles, ArrowUpRight } from 'lucide-react';
import SocialIcon from './SocialIcon';
import { activeSocialLinks } from '@/lib/social';

const SOCIAL = activeSocialLinks();

export default function WhosBehindInsights() {
  return (
    <section className="max-w-[900px] mx-auto px-5 py-20 md:py-28">
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[--brand-accent-soft] text-sm font-medium text-[--brand-accent] mb-5">
          <Sparkles size={14} /> About
        </div>
        <h1 className="cool-hero text-[--brand-text] mb-4">
          About <span className="font-display italic text-gradient">INSIGHTS</span>
        </h1>
        <p className="text-lg md:text-xl text-[--brand-text-secondary] leading-relaxed max-w-xl">
          Ideas. Intelligence. Impact. A digital publication on AI, business, and the future of work.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start pb-10 border-b border-[--brand-border] mb-10">
        <div className="avatar w-20 h-20 text-3xl shrink-0 shadow-lg shadow-black/5"><span>M</span></div>
        <div>
          <h2 className="text-2xl font-bold text-[--brand-text]">Manikanta</h2>
          <p className="mt-2 text-[--brand-text-secondary] leading-relaxed max-w-lg">
            Writer, builder, and the mind behind INSIGHTS. I write about AI, business, strategy, career, and the future of work — always with a focus on substance over noise.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="flex items-center gap-1.5 text-sm text-[--brand-text-secondary]">
              <MapPin size={14} /> Bangalore, India
            </span>
            {SOCIAL.length > 0 && (
              <span className="flex items-center gap-2 ml-2 pl-3 border-l border-[--brand-border]">
                {SOCIAL.map((s) => (
                  <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg text-[--brand-text-secondary] hover:text-[--brand-accent] hover:bg-[--brand-accent-soft] transition-all">
                    <SocialIcon iconKey={s.key} size={16} />
                  </a>
                ))}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[--brand-accent-soft] to-transparent border border-[--brand-accent]/10">
          <Quote size={24} className="text-[--brand-accent] mb-4" />
          <h3 className="text-lg font-bold text-[--brand-text] mb-2">Why this publication exists</h3>
          <p className="text-sm text-[--brand-text-secondary] leading-relaxed">The web is full of noise. INSIGHTS exists to cut through it — delivering signal, not fluff. Every piece is crafted with the reader&#39;s time and intelligence in mind.</p>
        </div>
        <div className="p-6 rounded-2xl border border-[--brand-border] bg-[--brand-card]">
          <h3 className="text-lg font-bold text-[--brand-text] mb-3">What to expect</h3>
          <ul className="space-y-2.5 text-sm text-[--brand-text-secondary]">
            <li className="flex items-start gap-3"><span className="w-5 h-5 rounded-full bg-[--brand-accent-soft] flex items-center justify-center text-[10px] text-[--brand-accent] shrink-0 mt-0.5 font-bold">&#10003;</span> Deep dives on AI and emerging tech</li>
            <li className="flex items-start gap-3"><span className="w-5 h-5 rounded-full bg-[--brand-accent-soft] flex items-center justify-center text-[10px] text-[--brand-accent] shrink-0 mt-0.5 font-bold">&#10003;</span> Practical business and career insights</li>
            <li className="flex items-start gap-3"><span className="w-5 h-5 rounded-full bg-[--brand-accent-soft] flex items-center justify-center text-[10px] text-[--brand-accent] shrink-0 mt-0.5 font-bold">&#10003;</span> Curated signals from across the web</li>
            <li className="flex items-start gap-3"><span className="w-5 h-5 rounded-full bg-[--brand-accent-soft] flex items-center justify-center text-[10px] text-[--brand-accent] shrink-0 mt-0.5 font-bold">&#10003;</span> A weekly newsletter with zero filler</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/newsletter"
          className="inline-flex items-center gap-2 rounded-xl bg-[--brand-accent] text-white px-8 py-3.5 text-sm font-bold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-black/5"
        >
          <Sparkles size={16} />
          Subscribe to the newsletter <ArrowUpRight size={14} />
        </Link>
      </div>
    </section>
  );
}
