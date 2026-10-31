import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSession, issueSessionCookie, recordSession, getAdminSessionSecret } from '@/lib/auth';
import { createSessionToken, verifySessionToken } from '@/lib/session';
import { verifyPassword, hashPassword } from '@/lib/crypto-secrets';

const loginAttempts = new Map();

function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

async function getAdminUser() {
  const { db } = await import('@/packages/db');
  let user = await db.adminUsers.getByUsername('admin');
  if (!user) {
    const bootstrapPw = process.env.ADMIN_BOOTSTRAP_PASSWORD || process.env.ADMIN_PASSWORD;
    if (!bootstrapPw) return null;
    user = await db.adminUsers.create({ username: 'admin', passwordHash: hashPassword(bootstrapPw) });
  }
  return user;
}

export async function POST(request) {
  const ip = clientIp(request);
  const attempts = loginAttempts.get(ip) || [];
  const recent = attempts.filter((t) => Date.now() - t < 900000);
  if (recent.length >= 5) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const { password } = body;

  const secret = await getAdminSessionSecret();
  if (!secret) {
    return NextResponse.json({ error: 'Admin login is not configured.' }, { status: 500 });
  }

  const user = await getAdminUser();
  if (!user || !password || !verifyPassword(password, user.passwordHash)) {
    loginAttempts.set(ip, [...recent, Date.now()]);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  loginAttempts.delete(ip);

  if (user.totpEnabled) {
    const token = await createSessionToken({ type: 'challenge', username: user.username, exp: Math.floor(Date.now() / 1000) + 300 }, secret);
    return NextResponse.json({ ok: true, requiresTotp: true, challengeToken: token });
  }

  const setupToken = await createSessionToken({ type: 'setup', username: user.username, exp: Math.floor(Date.now() / 1000) + 600 }, secret);
  return NextResponse.json({ ok: true, requiresSetup: true, setupToken });
}