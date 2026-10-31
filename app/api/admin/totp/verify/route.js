import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSession, issueSessionCookie, recordSession, getAdminSessionSecret, isValidSession } from '@/lib/auth';
import { verifySessionToken } from '@/lib/session';
import { decryptSecret, hashRecoveryCode, generateRecoveryCodes } from '@/lib/crypto-secrets';
import { verifyTotp as verifyTotpCode } from '@/lib/totp';

export async function POST(request) {
  const secret = await getAdminSessionSecret();
  if (!secret) return NextResponse.json({ error: 'Admin login is not configured.' }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const { code, verifyToken } = body;

  let username = null;
  const cookieValue = request.cookies.get('admin_session')?.value;
  if (await isValidSession(cookieValue)) username = 'admin';
  else if (verifyToken) {
    const payload = await verifySessionToken(verifyToken, secret);
    if (payload && payload.type === 'verify') username = payload.username;
  }
  if (!username) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { db } = await import('@/packages/db');
  const user = await db.adminUsers.getByUsername(username);
  if (!user || !user.totpSecretEncrypted) return NextResponse.json({ error: 'no pending enrollment' }, { status: 400 });

  let totpSecret;
  try { totpSecret = decryptSecret(user.totpSecretEncrypted); } catch {
    return NextResponse.json({ error: 'invalid secret' }, { status: 400 });
  }
  if (!verifyTotpCode(totpSecret, code)) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
  }

  const recoveryCodes = generateRecoveryCodes(10);
  const hashes = recoveryCodes.map((c) => ({ hash: hashRecoveryCode(c), used: false }));

  await db.adminUsers.update(username, { totpEnabled: true, recoveryCodeHashes: hashes });

  const token = await createAdminSession();
  await recordSession(request.headers.get('x-forwarded-for') || 'unknown');
  const res = NextResponse.json({ ok: true, recoveryCodes });
  issueSessionCookie(res, token);
  return res;
}