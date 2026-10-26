'use client';
import Link from 'next/link';

// Section breadcrumb. `items` = [{ label, href? }]. The last item is the
// current page and is rendered as plain text; prior items are links.
export default function Breadcrumb({ items = [], className = '' }) {
  if (!items.length) return null;
  return (
    <nav className={`text-xs text-[--brand-text-secondary] ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>{'&rsaquo;'}</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-[--brand-text] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[--brand-text]">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
