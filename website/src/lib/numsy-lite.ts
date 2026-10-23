/**
 * numsy-lite — a small browser port of Numsy's validation rules for the playground.
 * Close to the library, not a byte-for-byte copy: the npm package remains the source of truth.
 */
import type { PlaygroundRow } from '../types';

export interface LiteResult {
  original: string;
  sanitized: string;
  isValid: boolean;
  reason: string | null;
}

/** Strip non-digits and the +91 / 0091 / 091 / leading-0 prefixes. */
export function sanitize(raw: string): string {
  let d = String(raw).replace(/\D/g, '');
  if (d.length === 14 && d.startsWith('0091')) d = d.slice(4);
  else if (d.length === 13 && d.startsWith('091')) d = d.slice(3);
  else if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
}

/** Straight ascending or descending run, wrapping 9→0 (e.g. 9876543210, 6789012345). */
export function isSequential(s: string): boolean {
  let up = true;
  let down = true;
  for (let i = 1; i < s.length; i++) {
    const a = Number(s[i - 1]);
    const b = Number(s[i]);
    if ((a + 1) % 10 !== b) up = false;
    if ((a + 9) % 10 !== b) down = false;
  }
  return up || down;
}

export function validate(raw: string): LiteResult {
  const s = sanitize(raw);
  let reason: string | null = null;
  if (!s) reason = 'No digits found';
  else if (s.length !== 10) reason = 'Must be 10 digits';
  else if (!/^[6-9]/.test(s)) reason = 'Must start with 6-9';
  else if (/^(\d)\1{9}$/.test(s)) reason = 'Repeated digits';
  else if (isSequential(s)) reason = 'Sequential pattern';
  else if (/^(\d\d)\1{4}$/.test(s)) reason = 'Repeating pattern';
  else if (/^\d(\d)\1{8}$/.test(s)) reason = 'Dummy pattern';
  return { original: String(raw).trim(), sanitized: s, isValid: reason === null, reason };
}

/** Split a digit run such as "+91 98765 01234 91234 56789" into phone-sized candidates. */
function splitRun(run: string): string[] {
  const groups = run
    .split(/[\s\-.()]+/)
    .map((g) => g.replace(/\D/g, ''))
    .filter(Boolean);
  const out: string[] = [];
  let buf = '';
  for (let i = 0; i < groups.length; i++) {
    buf += groups[i];
    const next = groups[i + 1] ?? '';
    const target = buf.startsWith('0091')
      ? 14
      : buf.startsWith('91') && buf.length + next.length === 12
        ? 12
        : buf.startsWith('0')
          ? 11
          : 10;
    if (buf.length >= target || !next || buf.length + next.length > 14) {
      out.push(buf);
      buf = '';
    }
  }
  return out;
}

const SEPARATORS = /[,;/|\n\r]+|\s+(?:or|and)\s+/i;
const RUN = /\+?\(?\d[\d\s\-.()]*\d/g;

/**
 * Extract candidate numbers from free text: split on , ; / | newlines, "or", "and",
 * then match digit runs allowing spaces, dashes, dots, brackets and an optional +91.
 * Runs shorter than 7 digits (years, house numbers) are ignored.
 */
export function extract(text: string): string[] {
  const found: string[] = [];
  for (const seg of String(text).split(SEPARATORS)) {
    for (const run of seg.match(RUN) ?? []) {
      if (run.replace(/\D/g, '').length < 7) continue;
      const parts = splitRun(run);
      if (parts.length === 1) found.push(run.trim());
      else for (const d of parts) if (d.length >= 7) found.push(d);
    }
  }
  return found;
}

export interface Analysis {
  rows: PlaygroundRow[];
  total: number;
  valid: number;
  invalid: number;
  unique: number;
}

/** Extract, validate and flag duplicates (a repeat of an earlier valid number). */
export function analyze(text: string): Analysis {
  const seen = new Set<string>();
  const rows = extract(text).map<PlaygroundRow>((candidate) => {
    const r = validate(candidate);
    const duplicate = r.isValid && seen.has(r.sanitized);
    if (r.isValid) seen.add(r.sanitized);
    return { ...r, duplicate, formatted: r.isValid ? `+91${r.sanitized}` : '' };
  });
  const valid = rows.filter((r) => r.isValid).length;
  return { rows, total: rows.length, valid, invalid: rows.length - valid, unique: seen.size };
}
