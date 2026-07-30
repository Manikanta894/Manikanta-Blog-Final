export const ADMIN_SESSION_COOKIE = 'admin_session';

function timingSafeEqual(a, b) {
  const sa = String(a); const sb = String(b);
  if (sa.length !== sb.length) return false;
  let result = 0;
  for (let i = 0; i < sa.length; i++) result |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  return result === 0;
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── Session token (Edge + Node compatible) ──────────────────────────
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

// ─── DB-backed session audit (Node.js only) ───────────────────────────
async function getDb() {
  const { db } = await import('@/packages/db');
  return db;
}

export async function recordSession(ip = null) {
  const token = await getExpectedSessionToken();
  if (!token) return;
  const db = await getDb();
  await db.sessions.create(token, { ip: ip || 'unknown', userAgent: 'admin' });
}

export async function revokeAllSessions() {
  const db = await getDb();
  await db.sessions.deleteAll();
}

export async function getActiveSessions() {
  const db = await getDb();
  return db.sessions.list();
}
