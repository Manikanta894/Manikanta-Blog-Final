import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidSession } from '@/lib/auth';
import { isR2Configured, sanitizeKey, getSignedReadUrl } from '@/packages/storage/r2';

export async function GET(request) {
  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidSession(cookieValue))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const keyParam = new URL(request.url).searchParams.get('key');
  if (!keyParam) return NextResponse.json({ error: 'key is required' }, { status: 400 });
  let key;
  try { key = sanitizeKey(keyParam); } catch { return NextResponse.json({ error: 'invalid key' }, { status: 400 }); }
  if (!isR2Configured()) return NextResponse.json({ error: 'R2 is not configured' }, { status: 503 });
  try {
    const url = await getSignedReadUrl(key, 3600);
    return NextResponse.json({ url, expiresIn: 3600 });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'failed' }, { status: 500 });
  }
}