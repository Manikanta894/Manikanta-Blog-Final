'use client';
import { useEffect, useState } from 'react';

// Sticky mini table-of-contents for long articles, generated from the
// H2/H3 outline (see extractHeadings() in packages/utils/markdown.js).
// Desktop only — hidden below lg, where a floating sidebar has nowhere
// good to live.
export default function ArticleTOC({ headings = [] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id);

  useEffect(() => {
    if (!headings.length) return;
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-110px 0px -70% 0px', threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="article-toc hidden lg:block" aria-label="Table of contents">
      <div className="article-toc__label">In This Article</div>
      <div className="article-toc__list">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`article-toc__item ${h.level === 3 ? 'article-toc__item--h3' : ''} ${activeId === h.id ? 'is-active' : ''}`}
          >
            {h.text}
          </a>
        ))}
      </div>
    </nav>
  );
}
