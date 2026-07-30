// Minimal single-admin auth. No user table, no DB round trip — the session
// cookie's value is a deterministic hash of ADMIN_SESSION_SECRET, so both
// the login route and the (Edge) middleware can verify it independently
// using only Web Crypto (works in Node and Edge runtimes alike).

export const ADMIN_SESSION_COOKIE = 'admin_session';

function timingSafeEqual(a, b) {
  const sa = String(a);
  const sb = String(b);
  if (sa.length !== sb.length) return false;
  let result = 0;
  for (let i = 0; i < sa.length; i++) {
    result |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  }
  return result === 0;
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getExpectedSessionToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  return sha256Hex(`${secret}:admin-session`);
}

export async function isValidSession(cookieValue) {
  if (!cookieValue) return false;
  const expected = await getExpectedSessionToken();
  if (!expected) return false;
  return timingSafeEqual(cookieValue, expected);
}
