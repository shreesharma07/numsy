/**
 * fetch + sessionStorage cache. Never throws: resolves to null on network/HTTP/parse errors
 * (e.g. GitHub's 60 req/h anonymous rate limit) so callers can render fallbacks.
 */
const DEFAULT_TTL = 15 * 60 * 1000;
const inflight = new Map<string, Promise<unknown>>();

interface Entry<T> {
  t: number;
  v: T;
}

function readCache<T>(key: string, ttl: number): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    return Date.now() - entry.t < ttl ? entry.v : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, v: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v } satisfies Entry<T>));
  } catch {
    // storage full or blocked: caching is best effort
  }
}

export function fetchJSON<T>(url: string, key: string, ttl = DEFAULT_TTL): Promise<T | null> {
  const cached = readCache<T>(key, ttl);
  if (cached !== null) return Promise.resolve(cached);
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T | null>;
  const p = fetch(url, { headers: { Accept: 'application/json' } })
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<T>;
    })
    .then((v) => {
      writeCache(key, v);
      return v;
    })
    .catch(() => null)
    .finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

export const isCount = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 0;
