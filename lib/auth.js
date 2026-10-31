import { verifySessionToken, createSessionToken } from '@/lib/session';

export const ADMIN_SESSION_COOKIE = 'admin_session';

const SESSION_TTL_SECONDS = 60 * 60 * 8;
const IDLE_TIMEOUT_SECONDS = 60 * 30;

export async function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || null;
}

export async function isValidSession(cookieValue) {
  const secret = await getAdminSessionSecret();
  if (!secret || !cookieValue) return false;
  const payload = await verifySessionToken(cookieValue, secret);
  if (!payload) return false;
  if (payload.role !== 'admin') return false;
  return true;
}

export async function createAdminSession() {
  const secret = await getAdminSessionSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET not configured');
  const sid = cryptoRandomId();
  const now = Math.floor(Date.now() / 1000);
  const token = await createSessionToken({ sid, role: 'admin', iat: now, exp: now + SESSION_TTL_SECONDS, lastActivity: now }, secret);
  return token;
}

function cryptoRandomId() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function issueSessionCookie(res, token) {
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export const SESSION_TTL = SESSION_TTL_SECONDS;
export const IDLE_TIMEOUT = IDLE_TIMEOUT_SECONDS;

async function getDb() {
  const { db } = await import('@/packages/db');
  return db;
}

export async function recordSession(ip = null) {
  try {
    const db = await getDb();
    if (db.sessions?.create) await db.sessions.create(cryptoRandomId(), { ip: ip || 'unknown', userAgent: 'admin', createdAt: new Date() });
  } catch {}
}

export async function revokeAllSessions() {
  try { const db = await getDb(); if (db.sessions?.deleteAll) await db.sessions.deleteAll(); } catch {}
}