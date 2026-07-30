import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getExpectedSessionToken, recordSession } from '@/lib/auth';

function timingSafeEqual(a, b) {
  const sa = String(a); const sb = String(b);
  if (sa.length !== sb.length) return false;
  let result = 0;
  for (let i = 0; i < sa.length; i++) result |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  return result === 0;
}

const loginAttempts = new Map();

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  const attempts = loginAttempts.get(ip) || [];
  const recent = attempts.filter((t) => Date.now() - t < 900000);
  if (recent.length >= 5) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const { password } = await request.json().catch(() => ({}));

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Admin login is not configured.' }, { status: 500 });
  }

  if (!password || !timingSafeEqual(password, process.env.ADMIN_PASSWORD)) {
    loginAttempts.set(ip, [...recent, Date.now()]);
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  loginAttempts.delete(ip);

  const token = await getExpectedSessionToken();
  try { await recordSession(ip); } catch {}

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400,
  });
  return res;
}
