// Server-side Cloudflare R2 (S3-compatible) storage helper.
// Credentials are read from environment variables and must never be shipped
// to the browser. Import this module only from server code / route handlers.

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
};

function env(name) {
  const v = process.env[name];
  return v ? String(v).trim() : '';
}

export function r2Config() {
  const accountId = env('R2_ACCOUNT_ID');
  const accessKeyId = env('R2_ACCESS_KEY_ID');
  const secretAccessKey = env('R2_SECRET_ACCESS_KEY');
  const bucket = env('R2_BUCKET') || env('R2_BUCKET_NAME');
  const endpoint =
    env('R2_ENDPOINT') || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');
  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint) {
    throw new Error(
      'R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET (or R2_BUCKET_NAME).'
    );
  }
  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    endpoint,
    region: env('R2_REGION') || 'auto',
    publicBaseUrl: env('R2_PUBLIC_BASE_URL') || null,
  };
}

export function isR2Configured() {
  try {
    r2Config();
    return true;
  } catch {
    return false;
  }
}

let _client = null;
export function getClient() {
  if (_client) return _client;
  const cfg = r2Config();
  _client = new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
    forcePathStyle: true,
  });
  return _client;
}

export function getBucket() {
  return r2Config().bucket;
}

export function extensionFor(contentType, originalName) {
  if (EXT_BY_MIME[contentType]) return EXT_BY_MIME[contentType];
  const ext = String(originalName || '')
    .split('.')
    .pop()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return ext || 'bin';
}

export function buildObjectKey({ contentType, originalName }) {
  const ext = extensionFor(contentType, originalName);
  const now = new Date();
  const prefix = contentType === 'application/pdf' ? 'documents' : 'images';
  return `${prefix}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${uuid()}.${ext}`;
}

export function sanitizeKey(key) {
  if (typeof key !== 'string' || !key.trim()) throw new Error('Invalid object key');
  const cleaned = key.trim().replace(/^\/+/, '');
  if (cleaned.includes('..') || cleaned.includes('\\') || /[\u0000-\u001f]/.test(cleaned)) {
    throw new Error('Unsafe object key');
  }
  if (!/^[A-Za-z0-9._\-/]+$/.test(cleaned)) {
    throw new Error('Invalid object key characters');
  }
  return cleaned;
}

export async function putObject({ key, body, contentType }) {
  const cfg = r2Config();
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'private, max-age=31536000',
    })
  );
}

export async function deleteObject(key) {
  const cfg = r2Config();
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }));
}

export async function getObject(key) {
  const cfg = r2Config();
  const client = getClient();
  return client.send(new GetObjectCommand({ Bucket: cfg.bucket, Key: key }));
}

export async function getSignedReadUrl(key, expiresIn = 3600) {
  const cfg = r2Config();
  const client = getClient();
  const command = new GetObjectCommand({ Bucket: cfg.bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn });
}

export function proxyUrlForKey(key) {
  return `/api/media/file?key=${encodeURIComponent(key)}`;
}