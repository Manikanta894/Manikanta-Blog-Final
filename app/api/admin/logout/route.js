import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidSession, revokeAllSessions } from '@/lib/auth';

export async function POST(request) {
  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const hasSession = await isValidSession(cookieValue);
  const body = await request.json().catch(() => ({}));
  if (body.all) {
    if (!hasSession) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    try { await revokeAllSessions(); } catch {}
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
