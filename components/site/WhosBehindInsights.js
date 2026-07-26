'use client';
/**
 * WhosBehindInsights — "Who's Behind INSIGHTS."
 * Same numbered field-notes layout, stamp badge, and signature underline
 * as the portfolio's Ch14BeyondNotes section — no photo, identity kept
 * anonymous ("UNKNOWN") by request.
 * Sits at the end of the About page, right before the footer.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';

const ICONS = {
  pen: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M8 40l6-2 22-22-4-4-22 22z" />
      <path d="M28 10l4 4" />
      <path d="M6 42l2-6" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 24c6-9 14-13 20-13s14 4 20 13c-6 9-14 13-20 13S10 33 4 24z" />
      <circle cx="24" cy="24" r="5" />
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="24" cy="10" r="4" />
      <path d="M24 14v14M24 22l-8 10M24 22l8 10" />
      <path d="M6 34c6-4 30-4 36 0" />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M30 6a18 18 0 1 0 12 30 14 14 0 0 1-12-30z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M24 4l16 6v12c0 12-8 18-16 22-8-4-16-10-16-22V10z" />
    </svg>
  ),
  seed: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M24 44V24" />
      <path d="M24 24C10 24 6 12 6 8c8 0 18 4 18 16z" />
      <path d="M24 24c14 0 18-12 18-16-8 0-18 4-18 16z" />
    </svg>
  ),
  scale: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M24 6v36M12 12h24" />
      <path d="M6 18l6-6 6 6M30 18l6-6 6 6" />
      <path d="M6 18c0 4 2.5 7 6 7s6-3 6-7M30 18c0 4 2.5 7 6 7s6-3 6-7" />
    </svg>
  ),
  robot: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="10" y="16" width="28" height="20" rx="3" />
      <circle cx="18" cy="26" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="30" cy="26" r="2.2" fill="currentColor" stroke="none" />
      <path d="M24 16V8M18 8h12" />
      <path d="M16 36v4M32 36v4" />
    </svg>
  ),
  stairs: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 40h8v-8h8v-8h8v-8h8v-8" />
      <circle cx="38" cy="6" r="3" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="24" cy="24" r="4" />
    </svg>
  ),
};

function parseLine(text) {
  const pattern = /__([^_]+)__|\[\[([^\]]+)\]\]|\(\(([^)]+)\)\)/g;
  const out = [];
  let last = 0;
  let m;
  let key = 0;
  while ((m = pattern.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<u key={key++}>{m[1]}</u>);
    else if (m[2] !== undefined) out.push(<span key={key++} className="wbi-notes__box">{m[2]}</span>);
    else if (m[3] !== undefined) out.push(<span key={key++} className="wbi-notes__circle">{m[3]}</span>);
    last = pattern.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const DATA = {
  kicker: 'Beyond The Byline',
  number: '01',
  title: 'The Mind Behind INSIGHTS.',
  subtitle: 'Not an expert with all the answers—just someone who never stopped asking better questions.',
  photo: {
    name: 'UNKNOWN',
    location: 'Bangalore · India',
    tagline: 'Still curious. Still building.',
    lastUpdated: 'July 2026',
    note: 'Thanks for actually reading this far.\nIt means the words are doing their job.',
  },
  notes: [
    { line: "I didn't start with a roadmap. I started with questions.", body: ['Every paper I wrote, every project I built, and every late night began the same way.', '"Why does it work this way?"'], icon: 'compass' },
    { line: '[[Curiosity]] became my greatest advantage.', body: ["I wasn't always the most experienced person in the room.", 'But I was usually the one still learning after everyone else had stopped.'], icon: 'eye' },
    { line: 'There were seasons when ((silence)) taught me more than conversations.', body: ["Some of my biggest lessons didn't come from classrooms.", 'They came from long nights, difficult choices, and learning to keep moving forward.'], icon: 'moon' },
    { line: 'People often assume confidence came first.', body: ["It didn't.", 'Confidence arrived quietly after hundreds of small promises I kept to myself.'], icon: 'seed' },
    { line: "I almost stopped more times than I'll ever admit.", body: ['Not because the dream changed.', 'Because the road became heavier than I expected.', 'Curiosity kept me walking.'], icon: 'stairs' },
    { line: 'I refuse to chase attention over substance.', body: ['If something appears here, it should teach, challenge, or genuinely help someone.', "Otherwise, it doesn't belong."], icon: 'scale' },
    { line: 'AI is part of what I build. People are why I build it.', body: ['Technology changes every year.', 'Human curiosity never goes out of date.'], icon: 'robot' },
    { line: "I don't measure success by numbers alone.", body: ['If one article changes how someone thinks,', "that's already worth writing."], icon: 'shield' },
    { line: "INSIGHTS isn't the destination.", body: ["It's simply the notebook I'm willing to share while I'm still learning.", "The best chapters haven't been written yet."], icon: 'pen' },
  ],
  quote: "I don't write because I've figured everything out. I write so I never stop learning.",
  signOff: 'Still Learning.\nStill Building.',
};

const VISIBLE_BY_DEFAULT = 6;

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function WhosBehindInsights() {
  const [expanded, setExpanded] = useState(false);
  const d = DATA;
  const photo = d.photo;
  const notes = d.notes;
  const hasMore = notes.length > VISIBLE_BY_DEFAULT;
  const visibleNotes = expanded ? notes : notes.slice(0, VISIBLE_BY_DEFAULT);

  return (
    <section className="relative py-20 md:py-28 grain overflow-hidden" aria-labelledby="wbi-title">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(55% 38% at 20% 12%, rgba(212,106,46,0.05), transparent 70%), radial-gradient(50% 35% at 85% 85%, rgba(212,106,46,0.04), transparent 72%)',
        }}
      />
      <div className="relative container">
        {/* Stamp badge */}
        <div className="wbi-notes__stamp" aria-hidden>
          <svg viewBox="0 0 120 120" className="h-full w-full">
            <path id="wbiStampCircle" fill="none" d="M 60,60 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0" />
            <text className="wbi-notes__stamp-text">
              <textPath href="#wbiStampCircle" startOffset="2%">STILL LEARNING · STILL BUILDING · </textPath>
            </text>
            <line x1="46" y1="70" x2="74" y2="50" strokeWidth="1.4" stroke="currentColor" />
          </svg>
        </div>

        <div className="text-eyebrow text-[#555555]">/{d.number} — {d.kicker}</div>
        <h2 id="wbi-title" className="text-h1 italic mt-5 text-[#181818]">
          {d.title}
        </h2>
        <Reveal>
          <p className="mt-6 max-w-xl text-lead text-[#555555]">{d.subtitle}</p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-[300px_1fr]">
          {/* Left — signature block, no photo */}
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <div className="wbi-notes__sig">
              <span>{photo.name}</span>
              <svg viewBox="0 0 220 20" className="wbi-notes__sig-underline" aria-hidden>
                <path d="M2 12c30-10 50-10 60-2 8 6 14 6 22-2 10-10 20-10 30 0 8 8 16 8 26 0 8-7 18-9 30-4 10 4 20 4 28-2" />
              </svg>
            </div>
            <div className="mt-3 text-eyebrow text-[#555555]">
              {photo.location}
              <br />
              {photo.tagline}
            </div>
            <div className="mt-4 text-eyebrow text-[#8a8a8a]">
              Last updated: {photo.lastUpdated}
            </div>
            <div className="mt-5 flex items-start gap-2 text-[#555555]">
              <span className="mt-0.5">&#9825;</span>
              <span className="font-hand text-[1.3rem] leading-snug text-[#555555]">
                {photo.note.split('\n').map((l, i) => (
                  <span key={i}>
                    {l}
                    <br />
                  </span>
                ))}
              </span>
            </div>
          </Reveal>

          {/* Right — numbered field notes */}
          <div>
            {visibleNotes.map((n, i) => (
              <Reveal key={i} delay={Math.min(i, 8) * 0.03}>
                <div className="wbi-notes__row">
                  <div className="wbi-notes__num tabular-nums">{String(i + 1).padStart(2, '0')}.</div>
                  <div>
                    <p className="wbi-notes__line font-hand">{parseLine(n.line)}</p>
                    {(n.body || []).map((b, j) => (
                      <p key={j} className="wbi-notes__sub">{b}</p>
                    ))}
                  </div>
                  <div className="wbi-notes__icon">{ICONS[n.icon || 'default'] || ICONS.default}</div>
                </div>
              </Reveal>
            ))}

            {hasMore && (
              <div className="mt-8 flex justify-start">
                <button type="button" onClick={() => setExpanded((v) => !v)} className="wbi-notes__more">
                  {expanded ? 'Show less' : `Read more \u00b7 ${notes.length - VISIBLE_BY_DEFAULT} more`}
                  <span className={`wbi-notes__more-arrow ${expanded ? 'is-open' : ''}`} aria-hidden>
                    &darr;
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="wbi-beyond__rule mt-20" aria-hidden />

        <Reveal>
          <div className="mt-16 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <p className="max-w-2xl text-h3 italic leading-[1.4] text-[#181818]">
              <span className="wbi-beyond__pull">&ldquo;</span>
              {d.quote}
              <span className="wbi-beyond__pull">&rdquo;</span>
            </p>
            <div className="font-hand shrink-0 text-right text-[1.6rem] leading-tight text-[#555555]">
              {d.signOff.split('\n').map((l, i) => (
                <span key={i}>
                  {l}
                  <br />
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default WhosBehindInsights;
