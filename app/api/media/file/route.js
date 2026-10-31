import { NextResponse } from 'next/server';
import { Readable } from 'node:stream';
import { isR2Configured, sanitizeKey, getObject } from '@/packages/storage/r2';

export async function GET(request) {
  const keyParam = new URL(request.url).searchParams.get('key');
  if (!keyParam) {
    return NextResponse.json({ error: 'key is required' }, { status: 400 });
  }

  let key;
  try {
    key = sanitizeKey(keyParam);
  } catch {
    return NextResponse.json({ error: 'invalid key' }, { status: 400 });
  }

  if (!isR2Configured()) {
    return NextResponse.json({ error: 'R2 is not configured' }, { status: 503 });
  }

  try {
    const obj = await getObject(key);
    const webStream = obj.Body ? Readable.toWeb(obj.Body) : null;
    const filename = key.split('/').pop() || 'file';
    const disposition = `inline; filename="${filename.replace(/"/g, '')}"`;
    const headers = {
      'Content-Type': obj.ContentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': disposition,
    };
    if (obj.ContentLength != null) headers['Content-Length'] = String(obj.ContentLength);
    return new NextResponse(webStream, { status: 200, headers });
  } catch (e) {
    const status = /NoSuchKey|NotFound|404/.test(String(e?.name || e?.message || '')) ? 404 : 500;
    return NextResponse.json({ error: status === 404 ? 'not found' : 'read failed' }, { status });
  }
}