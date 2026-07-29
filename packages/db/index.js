// Unified repository interface. Adapter selected via DB_DRIVER env var.
//   mongo    — MongoDB (default, local development)
//   supabase — Supabase / Postgres (production)
//   demo     — Demo/mock data (no database needed)

import * as mongoAdapter from './adapters/mongo.js';
import * as supabaseAdapter from './adapters/supabase.js';
import * as demoAdapter from './adapters/demo.js';

const driver = (process.env.DB_DRIVER || 'mongo').toLowerCase();
const impl = driver === 'supabase' ? supabaseAdapter : driver === 'demo' ? demoAdapter : mongoAdapter;

export const db = impl.db;
export const initDb = impl.initDb;
export const driverName = driver;
