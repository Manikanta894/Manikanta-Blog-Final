import crypto from 'crypto';

function keyFromEnv(envName) {
  const raw = process.env[envName];
  if (!raw) return null;
  // Derive a 32-byte key deterministically so any passphrase format works.
  return crypto.createHash('sha256').update(raw).digest();
}

export function encryptSecret(plaintext, envName = 'TOTP_ENCRYPTION_KEY') {
  const key = keyFromEnv(envName);
  if (!key) throw new Error(`${envName} is not configured`);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString('base64');
}

export function decryptSecret(blob, envName = 'TOTP_ENCRYPTION_KEY') {
  const key = keyFromEnv(envName);
  if (!key) throw new Error(`${envName} is not configured`);
  const buf = Buffer.from(blob, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

export function hashPassword(password) {
  // scrypt
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('scrypt$')) {
    // Legacy plaintext comparison (constant-time) for migration
    if (stored === undefined) return false;
    // support env plaintext fallback handled by caller
    return false;
  }
  const [, saltHex, hashHex] = stored.split('$');
  const salt = Buffer.from(saltHex, 'hex');
  const hash = Buffer.from(hashHex, 'hex');
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  if (derived.length !== hash.length) return false;
  let r = 0;
  for (let i = 0; i < derived.length; i++) r |= derived[i] ^ hash[i];
  return r === 0;
}

export function hashRecoveryCode(code) {
  const normalized = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function generateRecoveryCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(5).toString('hex').toUpperCase(); // 10 hex chars
    codes.push(raw.slice(0,5) + '-' + raw.slice(5));
  }
  return codes;
}