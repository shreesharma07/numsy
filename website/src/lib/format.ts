import { isCount } from './cache';

let compact: Intl.NumberFormat | null = null;
try {
  compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
} catch {
  compact = null;
}

/** 1234 → "1.2K"; anything that isn't a finite non-negative number → fallback. */
export function formatCount(n: unknown, fallback = '—'): string {
  if (!isCount(n)) return fallback;
  return compact ? compact.format(n) : String(n);
}
