const WINDOW_MS = 60000;
const MAX_REQUESTS = 20;
const store = new Map();

export function rateLimit(ip, maxReqs = MAX_REQUESTS) {
  if (!ip) return { ok: true };
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(ip, { windowStart: now, count: 1 });
    return { ok: true };
  }
  entry.count++;
  if (entry.count > maxReqs) {
    return { ok: false, retryAfter: Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000) };
  }
  return { ok: true };
}
