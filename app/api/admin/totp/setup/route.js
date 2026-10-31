import { NextResponse } from 'next/server';
import { getAdminSessionSecret, isValidSession } from '@/lib/auth';
import { verifySessionToken, createSessionToken } from '@/lib/session';
import { generateSecret, otpauthUri } from '@/lib/totp';
import { encryptSecret, verifyPassword, decryptSecret } from '@/lib/crypto-secrets';
import { verifyTotp as verifyTotpCode } from '@/lib/totp';

export async function POST(request) {
  const secret = await getAdminSessionSecret();
  if (!secret) return NextResponse.json({ error: 'Admin login is not configured.' }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const { setupToken, password, totpCode } = body;

  let username = null;
  // Allow via valid admin session, but require fresh password (and current
  // TOTP when 2FA is already enabled) to prevent session-only re-enrollment.
  const cookieValue = request.cookies.get('admin_session')?.value;
  if (await isValidSession(cookieValue)) {
    const { db } = await import('@/packages/db');
    const user = await db.adminUsers.getByUsername('admin');
    if (user && verifyPassword(password || '', user.passwordHash)) {
      if (user.totpEnabled && user.totpSecretEncrypted) {
        let s;
        try { s = decryptSecret(user.totpSecretEncrypted); } catch { s = null; }
        if (s && verifyTotpCode(s, totpCode || '')) username = 'admin';
      } else {
        username = 'admin';
      }
    }
  } else if (setupToken) {
    const payload = await verifySessionToken(setupToken, secret);
    if (payload && payload.type === 'setup') username = payload.username;
  }
  if (!username) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const totpSecret = generateSecret();
  const encrypted = encryptSecret(totpSecret);

  const { db } = await import('@/packages/db');
  const user = await db.adminUsers.getByUsername(username);
  if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

  await db.adminUsers.update(username, { totpSecretEncrypted: encrypted, totpEnabled: false });

  // issue a verify token to complete enrollment
  const verifyToken = await createSessionToken({ type: 'verify', username, exp: Math.floor(Date.now() / 1000) + 600 }, secret);

  return NextResponse.json({
    ok: true,
    secret: totpSecret,
    otpauthUri: otpauthUri({ secret: totpSecret, account: username }),
    verifyToken,
  });
}