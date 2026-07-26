// Slim re-export shim — real DB code lives in /packages/db.
export { getDb, COLLECTIONS, getSettings, setSettings } from './mongo-legacy';
