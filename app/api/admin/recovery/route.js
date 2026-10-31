import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSession, issueSessionCookie, recordSession, getAdminSessionSecret } from '@/lib/auth';
import { verifyPassword } from '@/lib/crypto-secrets';
import { hashRecoveryCode } from '@/lib/crypto-secrets';

export async function POST(request) {
  const secret = await getAdminSessionSecret();
  if (!secret) return NextResponse.json({ error: 'Admin login is not configured.' }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const { password, recoveryCode } = body;

  const { db } = await import('@/packages/db');
  const user = await db.adminUsers.getByUsername('admin');
  if (!user || !password || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  if (!recoveryCode || !Array.isArray(user.recoveryCodeHashes)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const codeHash = hashRecoveryCode(String(recoveryCode).trim().toUpperCase());
  const idx = user.recoveryCodeHashes.findIndex((r) => r && !r.used && r.hash === codeHash);
  if (idx === -1) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // invalidate code
  const updated = [...user.recoveryCodeHashes];
  updated[idx] = { ...updated[idx], used: true, usedAt: new Date() };
  await db.adminUsers.update('admin', { recoveryCodeHashes: updated });

  const token = await createAdminSession();
  await recordSession(request.headers.get('x-forwarded-for') || 'unknown');
  const res = NextResponse.json({ ok: true });
  issueSessionCookie(res, token);
  return res;
}