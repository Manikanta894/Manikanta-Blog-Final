// ── Edit your links here ──────────────────────────────────────────────
// This is the ONE place to update social + contact links across the
// whole site (footer + connect popover both read from this file).
// Leave a value as '' (empty string) to hide that link everywhere.

export const CONTACT_EMAIL = 'contact@manikantar.in';

export const SOCIAL_LINKS = [
  { key: 'github',    name: 'GitHub',    href: '' }, // e.g. https://github.com/yourhandle
  { key: 'linkedin',  name: 'LinkedIn',  href: '' }, // e.g. https://linkedin.com/in/yourhandle
  { key: 'instagram', name: 'Instagram', href: '' }, // e.g. https://instagram.com/yourhandle
  { key: 'threads',   name: 'Threads',   href: '' }, // e.g. https://threads.net/@yourhandle
  { key: 'facebook',  name: 'Facebook',  href: '' }, // e.g. https://facebook.com/yourhandle
];

// Only links with a non-empty href actually render.
export const activeSocialLinks = () => SOCIAL_LINKS.filter((l) => l.href);
