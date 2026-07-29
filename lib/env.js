const REQUIRED = {
  production: { DB_DRIVER: true },
  development: {},
};

export function validateEnv() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const required = REQUIRED[nodeEnv] || {};
  const missing = [];
  for (const [key, required_] of Object.entries(required)) {
    if (required_ && !process.env[key]) missing.push(key);
  }
  if (process.env.DB_DRIVER === 'supabase') {
    if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }
  if (process.env.DB_DRIVER === 'mongo' && !process.env.MONGO_URL) {
    if (!process.env.MONGO_URL) missing.push('MONGO_URL');
  }
  return { valid: missing.length === 0, missing };
}
