// Signed session tokens — Edge-runtime compatible (Web Crypto).
const IDLE_TIMEOUT_SECONDS = 30 * 60;
const enc = new TextEncoder();

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(s) {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createSessionToken(payload, secret) {
  const body = { ...payload, iat: Math.floor(Date.now() / 1000) };
  const json = JSON.stringify(body);
  const data = enc.encode(json);
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, data);
  return b64url(data) + '.' + b64url(sig);
}

export async function verifySessionToken(token, secret) {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  let data, sig;
  try { data = b64urlDecode(parts[0]); sig = b64urlDecode(parts[1]); } catch { return null; }
  const key = await hmacKey(secret);
  const ok = await crypto.subtle.verify('HMAC', key, sig, data);
  if (!ok) return null;
  let payload;
  try { payload = JSON.parse(new TextDecoder().decode(data)); } catch { return null; }
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) return null;
  if (payload.lastActivity && (now - payload.lastActivity) > IDLE_TIMEOUT_SECONDS) return null;
  return payload;
}