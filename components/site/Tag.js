'use client';

// Category / tag pill. Shares the `.tag` CSS in globals.css so every tag
// badge renders identically across the site.
export default function Tag({ label, className = '' }) {
  return (
    <span className={`tag ${className}`}>{label}</span>
  );
}
