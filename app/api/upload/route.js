import { NextResponse } from 'next/server';
import { db } from '@/packages/db';
import { ADMIN_SESSION_COOKIE, isValidSession } from '@/lib/auth';
import {
  isR2Configured,
  getBucket,
  buildObjectKey,
  sanitizeKey,
  putObject,
  deleteObject,
  proxyUrlForKey,
} from '@/packages/storage/r2';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_PDF_BYTES = 25 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
  'application/pdf',
]);

function sizeLimitFor(type) {
  return type === 'application/pdf' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
}

async function requireAdmin(request) {
  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidSession(cookieValue))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

export async function POST(request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided (expected form field "file")' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type || 'unknown'}` }, { status: 400 });
    }
    const limit = sizeLimitFor(file.type);
    if (file.size > limit) {
      return NextResponse.json({ error: `File too large — max ${limit / 1024 / 1024}MB` }, { status: 413 });
    }

    const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (isR2Configured()) {
      const key = buildObjectKey({ contentType: file.type, originalName: file.name });
      const bytes = Buffer.from(await file.arrayBuffer());
      await putObject({ key, body: bytes, contentType: file.type });
      const url = proxyUrlForKey(key);
      let media = null;
      try {
        media = await db.media.create({
          url,
          key,
          mimeType: file.type,
          sizeBytes: file.size,
          name: file.name,
          prompt: file.name,
          provider: 'r2',
        });
      } catch (e) {
        console.warn('[upload] media metadata create failed:', e?.message);
      }
      return NextResponse.json({ url, key, id: media?.id || null, contentType: file.type, size: file.size });
    }

    if (hasSupabase) {
      const { getClient } = await import('@/packages/db/adapters/supabase.js');
      const supabase = getClient();
      const BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'media';
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, bytes, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const url = data?.publicUrl;
      try { await db.media.create({ url, mimeType: file.type, sizeBytes: file.size, name: file.name, prompt: file.name, provider: 'upload' }); } catch { /* non-fatal */ }
      return NextResponse.json({ url });
    }

    return NextResponse.json(
      { error: 'Media storage is not configured. Set R2 or Supabase credentials.' },
      { status: 503 }
    );
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const url = new URL(request.url);
    let key = url.searchParams.get('key');
    let id = url.searchParams.get('id');

    if (!key && !id) {
      try {
        const body = await request.json();
        key = body?.key || key;
        id = body?.id || id;
      } catch {
        // no JSON body
      }
    }

    if (id && !key) {
      try {
        const item = await db.media.getById(id);
        key = item?.key || item?.objectKey || null;
      } catch {
        // ignore
      }
    }

    if (!key && !id) {
      return NextResponse.json({ error: 'key or id is required' }, { status: 400 });
    }

    if (key) {
      const safeKey = sanitizeKey(key);
      if (isR2Configured()) {
        try {
          await deleteObject(safeKey);
        } catch (e) {
          console.warn('[upload] R2 delete failed:', e?.message);
        }
      }
    }

    if (id) {
      try {
        await db.media.delete(id);
      } catch (e) {
        console.warn('[upload] media metadata delete failed:', e?.message);
      }
    } else if (key) {
      try {
        const item = await db.media.getByKey(sanitizeKey(key));
        if (item?.id) await db.media.delete(item.id);
      } catch {
        // non-fatal
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Delete failed' }, { status: 500 });
  }
}