import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getExpectedSessionToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

const loginAttempts = new Map();

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Brute-force protection: 5 attempts per 15 min per IP
  const attempts = loginAttempts.get(ip) || [];
  const recent = attempts.filter((t) => Date.now() - t < 900000);
  if (recent.length >= 5) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const { password } = await request.json().catch(() => ({}));

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { error: 'Admin login is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in your environment.' },
      { status: 500 }
    );
  }

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    loginAttempts.set(ip, [...recent, Date.now()]);
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  // Clear attempts on successful login
  loginAttempts.delete(ip);

  const token = await getExpectedSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return res;
}
