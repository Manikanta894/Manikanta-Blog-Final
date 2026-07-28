'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const NOTES = [
  { num: '01', line: "I didn't start with a roadmap. I started with questions.", body: ['Every paper I wrote, every project I built, and every late night began the same way.', '"Why does it work this way?"'], tag: 'origin' },
  { num: '02', line: 'Curiosity became my greatest advantage.', body: ["I wasn't always the most experienced person in the room.", 'But I was usually the one still learning after everyone else had stopped.'], tag: 'mindset' },
  { num: '03', line: 'There were seasons when silence taught me more than conversations.', body: ["Some of my biggest lessons didn't come from classrooms.", 'They came from long nights, difficult choices, and learning to keep moving forward.'], tag: 'growth' },
  { num: '04', line: 'People often assume confidence came first.', body: ["It didn't.", 'Confidence arrived quietly after hundreds of small promises I kept to myself.'], tag: 'confidence' },
  { num: '05', line: "I almost stopped more times than I'll ever admit.", body: ['Not because the dream changed.', 'Because the road became heavier than I expected.', 'Curiosity kept me walking.'], tag: 'resilience' },
  { num: '06', line: 'I refuse to chase attention over substance.', body: ['If something appears here, it should teach, challenge, or genuinely help someone.', "Otherwise, it doesn't belong."], tag: 'values' },
  { num: '07', line: 'AI is part of what I build. People are why I build it.', body: ['Technology changes every year.', 'Human curiosity never goes out of date.'], tag: 'craft' },
  { num: '08', line: "I don't measure success by numbers alone.", body: ['If one article changes how someone thinks,', "that's already worth writing."], tag: 'purpose' },
  { num: '09', line: "INSIGHTS isn't the destination.", body: ["It's simply the notebook I'm willing to share while I'm still learning.", "The best chapters haven't been written yet."], tag: 'horizon' },
];

const ACCENT_SHAPES = [
  { size: 280, x: '-8%', y: '10%', blur: 80, opacity: 0.06, color: '#D46A2E' },
  { size: 200, x: '85%', y: '60%', blur: 100, opacity: 0.04, color: '#D46A2E' },
  { size: 140, x: '50%', y: '-5%', blur: 60, opacity: 0.03, color: '#B85A2A' },
];

const SIGN_OFF_LINES = ['Still Learning.', 'Still Building.'];

function Reveal({ children, delay = 0, className = '', as = 'div' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      as={as}
    >
      {children}
    </motion.div>
  );
}

function GlowDot({ className = '' }) {
  return (
    <motion.span
      className={`inline-block w-1.5 h-1.5 rounded-full bg-[#D46A2E] ${className}`}
      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function NoteCard({ note, index }) {
  const [hovered, setHovered] = useState(false);
  const isWide = index === 0 || index === 4 || index === 8;

  return (
    <Reveal delay={Math.min(index, 8) * 0.04}>
      <motion.article
        className={`wbi-card ${isWide ? 'wbi-card--wide' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="wbi-card__inner">
          <div className="wbi-card__header">
            <span className="wbi-card__num">{note.num}</span>
            <span className="wbi-card__tag">{note.tag}</span>
          </div>
          <h3 className="wbi-card__line">{note.line}</h3>
          <div className="wbi-card__body">
            {note.body.map((b, j) => (
              <p key={j} className="wbi-card__sub">{b}</p>
            ))}
          </div>
          <motion.div
            className="wbi-card__accent-line"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: hovered ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </motion.article>
    </Reveal>
  );
}

export function WhosBehindInsights() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.3, 1, 1, 0.3]);

  return (
    <section ref={containerRef} className="wbi-section grain" aria-labelledby="wbi-title">
      {/* Floating accent blobs */}
      {ACCENT_SHAPES.map((s, i) => (
        <motion.div
          key={i}
          className="wbi-blob"
          style={{
            width: s.size,
            height: s.size,
            left: s.x,
            top: s.y,
            filter: `blur(${s.blur}px)`,
            opacity: s.opacity,
            background: s.color,
          }}
          animate={{
            x: [0, 15 * (i % 2 === 0 ? 1 : -1), 0],
            y: [0, 10 * (i % 2 === 0 ? -1 : 1), 0],
          }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative wbi-container">
        {/* ── Hero ── */}
        <div className="wbi-hero">
          <Reveal>
            <div className="wbi-hero__eyebrow">
              <GlowDot />
              <span>01 — Beyond The Byline</span>
              <span className="wbi-hero__line" />
            </div>
          </Reveal>

          <motion.h2 id="wbi-title" className="wbi-hero__title" style={{ y: parallaxY, opacity }}>
            The Mind Behind
            <br />
            <span className="wbi-hero__title-accent">INSIGHTS.</span>
          </motion.h2>

          <Reveal delay={0.15}>
            <p className="wbi-hero__subtitle">
              Not an expert with all the answers—just someone who never stopped asking better questions.
            </p>
          </Reveal>
        </div>

        {/* ── Identity strip ── */}
        <Reveal delay={0.1}>
          <div className="wbi-identity">
            <div className="wbi-identity__left">
              <div className="wbi-identity__stamp" aria-hidden>
                <svg viewBox="0 0 120 120" className="wbi-identity__stamp-svg">
                  <path id="wbiStampCircle" fill="none" d="M 60,60 m -46,0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0" />
                  <text className="wbi-identity__stamp-text">
                    <textPath href="#wbiStampCircle" startOffset="2%">STILL LEARNING · STILL BUILDING · </textPath>
                  </text>
                  <line x1="46" y1="70" x2="74" y2="50" strokeWidth="1.4" stroke="currentColor" />
                </svg>
              </div>
              <div className="wbi-identity__sig">
                <span>UNKNOWN</span>
                <svg viewBox="0 0 220 20" className="wbi-identity__sig-line" aria-hidden>
                  <path d="M2 12c30-10 50-10 60-2 8 6 14 6 22-2 10-10 20-10 30 0 8 8 16 8 26 0 8-7 18-9 30-4 10 4 20 4 28-2" />
                </svg>
              </div>
            </div>
            <div className="wbi-identity__meta">
              <div className="wbi-identity__loc">
                <span className="wbi-identity__loc-dot" />
                Bangalore · India
              </div>
              <div className="wbi-identity__tagline">Still curious. Still building.</div>
              <div className="wbi-identity__date">Last updated: July 2026</div>
            </div>
          </div>
        </Reveal>

        {/* ── Notes grid ── */}
        <div className="wbi-grid">
          {NOTES.map((note, i) => (
            <NoteCard key={note.num} note={note} index={i} />
          ))}
        </div>

        {/* ── Closing quote ── */}
        <Reveal>
          <div className="wbi-closing">
            <div className="wbi-closing__rule" />
            <div className="wbi-closing__content">
              <blockquote className="wbi-closing__quote">
                <span className="wbi-closing__quote-mark">&ldquo;</span>
                I don't write because I've figured everything out. I write so I never stop learning.
              </blockquote>
              <div className="wbi-closing__signoff">
                {SIGN_OFF_LINES.map((l, i) => (
                  <span key={i}>{l}</span>
                ))}
              </div>
            </div>
            <p className="wbi-closing__note">
              Thanks for actually reading this far. It means the words are doing their job.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default WhosBehindInsights;
