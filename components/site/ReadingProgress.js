'use client';
import { useEffect, useState } from 'react';

// Thin accent-colored line pinned to the top of the viewport, above the
// sticky Nav, that fills as the reader scrolls through the article body.
// `targetId` should point at the element wrapping the article content
// (not the whole page) so the bar reflects reading progress through the
// piece itself, not the surrounding chrome (related articles, footer).
export default function ReadingProgress({ targetId }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const el = targetId ? document.getElementById(targetId) : null;

    const onScroll = () => {
      const top = el ? el.offsetTop : 0;
      const height = el ? el.offsetHeight : document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY - top;
      const ratio = height > 0 ? Math.min(1, Math.max(0, scrolled / height)) : 0;
      setPct(ratio * 100);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [targetId]);

  return <div className="reading-progress" style={{ width: `${pct}%` }} aria-hidden="true" />;
}
