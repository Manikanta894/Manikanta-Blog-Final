// Unified repository interface. Adapter selected via DB_DRIVER env var.
//   supabase — Supabase / Postgres (production, default)
//   demo     — Demo/mock data (no database needed)
//
// MongoDB support has been removed; Supabase is the sole database backend.

import * as supabaseAdapter from './adapters/supabase.js';
import * as demoAdapter from './adapters/demo.js';

const driver = (process.env.DB_DRIVER || 'supabase').toLowerCase();
const impl = driver === 'demo' ? demoAdapter : supabaseAdapter;

if (driver !== 'supabase' && driver !== 'demo') {
  throw new Error(`Unknown or removed DB_DRIVER: ${driver}. Use "supabase" or "demo".`);
}

export const db = impl.db;
export const initDb = impl.initDb;
export const driverName = driver;
