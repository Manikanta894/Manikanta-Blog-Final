// TOTP (RFC 6238) helpers — pure Node.js, no external deps.
import crypto from 'crypto';

function base32Encode(buf) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, value = 0, out = '';
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) {
      out += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += alphabet[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(str) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = str.replace(/=+$/, '').toUpperCase().replace(/\s+/g, '');
  let bits = 0, value = 0;
  const out = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = alphabet.indexOf(clean[i]);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateSecret(bytes = 20) {
  return base32Encode(crypto.randomBytes(bytes));
}

export function generateTotpCode(secret, timeStep = 30, digits = 6, now = Date.now()) {
  const counter = Math.floor(now / 1000 / timeStep);
  const buf = Buffer.alloc(8);
  let t = counter;
  for (let i = 7; i >= 0; i--) { buf[i] = t & 0xff; t = Math.floor(t / 256); }
  const key = base32Decode(secret);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(code % (10 ** digits)).padStart(digits, '0');
}

export function verifyTotp(secret, code, window = 1) {
  if (!secret || !code) return false;
  const now = Date.now();
  for (let w = -window; w <= window; w++) {
    const c = generateTotpCode(secret, 30, 6, now + w * 30000);
    if (timingSafeEqualStr(c, String(code).trim())) return true;
  }
  return false;
}

function timingSafeEqualStr(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function otpauthUri({ secret, account = 'admin', issuer = 'NEXT DRAFT' }) {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

export function base32(secret) { return secret; }