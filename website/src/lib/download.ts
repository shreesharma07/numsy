import type { PlaygroundRow } from '../types';

export type ExportKind = 'json' | 'csv' | 'md';

const COLUMNS: (keyof PlaygroundRow)[] = [
  'original',
  'sanitized',
  'formatted',
  'isValid',
  'duplicate',
  'reason',
];

const csvCell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const mdCell = (v: unknown) => String(v ?? '').replace(/\|/g, '\\|');

export function serialize(rows: PlaygroundRow[], kind: ExportKind): string {
  if (kind === 'json') {
    return JSON.stringify(
      { generatedBy: 'numsy playground', generatedAt: new Date().toISOString(), results: rows },
      null,
      2,
    );
  }
  if (kind === 'csv') {
    const body = rows.map((r) => COLUMNS.map((c) => csvCell(r[c])).join(','));
    return `${[COLUMNS.join(','), ...body].join('\n')}\n`;
  }
  const head = `| ${COLUMNS.join(' | ')} |\n|${COLUMNS.map(() => ' --- ').join('|')}|`;
  const body = rows.map((r) => `| ${COLUMNS.map((c) => mdCell(r[c])).join(' | ')} |`);
  return `${[head, ...body].join('\n')}\n`;
}

const MIME: Record<ExportKind, string> = {
  json: 'application/json',
  csv: 'text/csv',
  md: 'text/markdown',
};

export function downloadText(filename: string, text: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadRows(rows: PlaygroundRow[], kind: ExportKind): string {
  const filename = `numsy-results.${kind}`;
  downloadText(filename, serialize(rows, kind), MIME[kind]);
  return filename;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
