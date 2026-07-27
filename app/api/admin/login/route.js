import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getExpectedSessionToken } from '@/lib/auth';

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { error: 'Admin login is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in your environment.' },
      { status: 500 }
    );
  }

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const token = await getExpectedSessionToken();
  const res = NextResponse.json({ ok: true });
  res.headers.set('x-debug-secret-configured', String(!!process.env.ADMIN_SESSION_SECRET)); // TEMP diagnostic
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
