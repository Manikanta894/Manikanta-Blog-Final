import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSession, issueSessionCookie, recordSession, getAdminSessionSecret } from '@/lib/auth';
import { verifySessionToken } from '@/lib/session';
import { decryptSecret } from '@/lib/crypto-secrets';
import { verifyTotp as verifyTotpCode } from '@/lib/totp';

export async function POST(request) {
  const secret = await getAdminSessionSecret();
  if (!secret) return NextResponse.json({ error: 'Admin login is not configured.' }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const { code, challengeToken } = body;
  const payload = await verifySessionToken(challengeToken, secret);
  if (!payload || payload.type !== 'challenge') {
    return NextResponse.json({ error: 'Invalid or expired challenge' }, { status: 401 });
  }

  const { db } = await import('@/packages/db');
  const user = await db.adminUsers.getByUsername(payload.username);
  if (!user || !user.totpEnabled || !user.totpSecretEncrypted) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  let totpSecret;
  try { totpSecret = decryptSecret(user.totpSecretEncrypted); } catch {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  if (!verifyTotpCode(totpSecret, code)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await createAdminSession();
  await recordSession(request.headers.get('x-forwarded-for') || 'unknown');
  const res = NextResponse.json({ ok: true });
  issueSessionCookie(res, token);
  return res;
}