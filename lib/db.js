// Re-export from the new package layer. Kept for backwards-compat with existing imports.
export { db, driverName } from '@/packages/db';
export { getDb, COLLECTIONS, getSettings, setSettings } from './mongo-legacy';
