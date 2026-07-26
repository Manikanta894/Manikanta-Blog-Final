// Real file upload for manually-posted images, using Supabase Storage
// (free tier: 1GB). Requires a public bucket named "media" — see
// docs/IMAGE_UPLOADS.md for the one-time setup (SQL is in packages/db/schema.sql).
//
// POST /api/upload  — multipart/form-data, field name "file"
// Returns: { url: "https://.../media/xyz.jpg" }

import { NextResponse } from 'next/server';
import { getClient } from '@/packages/db/adapters/supabase.js';
import { db } from '@/packages/db';

const BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'media';
const MAX_BYTES = 8 * 1024 * 1024; // 8MB — generous for blog images, safe for the free tier

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided (expected form field "file")' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `File too large — max ${MAX_BYTES / 1024 / 1024}MB` }, { status: 413 });
    }
    if (!/^image\//.test(file.type)) {
      return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 });
    }

    const supabase = getClient();
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

    // Track it in the media library too, so it shows up alongside AI-generated images.
    try { await db.media.create({ url, prompt: file.name, provider: 'upload' }); } catch { /* non-fatal */ }

    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 });
  }
}
