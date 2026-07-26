// Unified repository interface. Adapter selected via DB_DRIVER env var.
// Both adapters export the same shape: { db, initDb }.
// Default = mongo (works in the local/dev preview). Set DB_DRIVER=supabase for production.

import * as mongoAdapter from './adapters/mongo.js';
import * as supabaseAdapter from './adapters/supabase.js';

const driver = (process.env.DB_DRIVER || 'mongo').toLowerCase();
const impl = driver === 'supabase' ? supabaseAdapter : mongoAdapter;

export const db = impl.db;
export const initDb = impl.initDb;
export const driverName = driver;
