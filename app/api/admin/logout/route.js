import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, revokeAllSessions } from '@/lib/auth';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (body.all) try { await revokeAllSessions(); } catch {}

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
