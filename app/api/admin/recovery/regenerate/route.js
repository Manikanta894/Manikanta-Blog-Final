import { NextResponse } from 'next/server';
import { isValidSession, getAdminSessionSecret } from '@/lib/auth';
import { verifyPassword } from '@/lib/crypto-secrets';
import { generateRecoveryCodes, hashRecoveryCode } from '@/lib/crypto-secrets';
import { decryptSecret } from '@/lib/crypto-secrets';
import { verifyTotp as verifyTotpCode } from '@/lib/totp';

export async function POST(request) {
  const cookieValue = request.cookies.get('admin_session')?.value;
  if (!(await isValidSession(cookieValue))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { password, totpCode } = body;

  const { db } = await import('@/packages/db');
  const user = await db.adminUsers.getByUsername('admin');
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  if (user.totpEnabled && user.totpSecretEncrypted) {
    let s;
    try { s = decryptSecret(user.totpSecretEncrypted); } catch { return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }); }
    if (!verifyTotpCode(s, totpCode)) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const recoveryCodes = generateRecoveryCodes(10);
  const hashes = recoveryCodes.map((c) => ({ hash: hashRecoveryCode(c), used: false }));
  await db.adminUsers.update('admin', { recoveryCodeHashes: hashes });

  return NextResponse.json({ ok: true, recoveryCodes });
}