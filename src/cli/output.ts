/**
 * CLI output helpers
 * Terminal rendering (table, colours) and routing of exported formats to files or stdout
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  OUTPUT_FORMATS,
  OutputFormat,
  XlsxSheet,
  collectColumns,
  toCSV,
  toJSON,
  toMarkdown,
  toText,
  writeXlsx,
} from '../common/functions/export.functions';
import { ensureDirectory } from '../common/helpers';

/**
 * Minimal writable stream used by the CLI (lets tests capture output)
 */
export interface OutStream {
  write(chunk: string): unknown;
  isTTY?: boolean;
}

/**
 * Everything a command produces, ready to be rendered in any format
 */
export interface Dataset {
  title: string;
  /** Rows exported to json/csv/md */
  rows: Record<string, any>[];
  /** Columns shown in the terminal table (defaults to every column) */
  tableColumns?: string[];
  /** Key figures shown above tables and in md/json/xlsx */
  summary: Record<string, string | number>;
  /** Values written by the txt format */
  lines: Array<string | number>;
  /** Workbook sheets for the xlsx format (defaults to a single sheet of rows) */
  sheets?: XlsxSheet[];
  /** Extra top-level fields merged into the json document */
  json?: Record<string, unknown>;
}

/**
 * Where generated output should go
 */
export interface OutputTarget {
  formats: OutputFormat[];
  output?: string;
  outDir?: string;
  name?: string;
  defaultName: string;
  pretty: boolean;
  limit: number;
  cwd: string;
}

// ==================== Colours ====================

const BRAND = {
  coral: [255, 77, 109],
  amber: [255, 183, 3],
  violet: [131, 56, 236],
} as const;

/**
 * ANSI styling that degrades to plain text when colour is off
 */
export class Paint {
  constructor(private readonly enabled: boolean) {}

  private wrap(open: string, text: string): string {
    return this.enabled ? `\x1b[${open}m${text}\x1b[0m` : text;
  }

  private rgb(color: readonly number[], text: string): string {
    return this.wrap(`38;2;${color.join(';')}`, text);
  }

  bold = (text: string) => this.wrap('1', text);
  dim = (text: string) => this.wrap('2', text);
  coral = (text: string) => this.rgb(BRAND.coral, text);
  amber = (text: string) => this.rgb(BRAND.amber, text);
  violet = (text: string) => this.rgb(BRAND.violet, text);
  ok = (text: string) => this.wrap('32', text);
  bad = (text: string) => this.rgb(BRAND.coral, text);
}

/**
 * Colour is on for TTYs unless NO_COLOR / --no-color says otherwise
 */
export function shouldUseColor(stream: OutStream, env: NodeJS.ProcessEnv, flag?: boolean) {
  if (flag === false || 'NO_COLOR' in env) return false;
  if ('FORCE_COLOR' in env) return true;
  return Boolean(stream.isTTY);
}

// ==================== Terminal table ====================

const MAX_CELL = 42;

// biome-ignore lint/suspicious/noControlCharactersInRegex: strips ANSI colour escapes
const visibleLength = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, '').length;

const truncate = (text: string) =>
  text.length > MAX_CELL ? `${text.slice(0, MAX_CELL - 1)}…` : text;

/**
 * Renders rows as a box-drawn table with a summary line
 */
export function renderTable(dataset: Dataset, paint: Paint, limit: number): string {
  const columns = dataset.tableColumns ?? collectColumns(dataset.rows);
  const shown = limit > 0 ? dataset.rows.slice(0, limit) : dataset.rows;
  const header = ['#', ...columns];

  const body = shown.map((row, index) => [
    String(index + 1),
    ...columns.map((column) => {
      const raw = row[column];
      const text = truncate(raw === undefined || raw === null ? '' : String(raw));
      if (raw === true || raw === 'VALID') return paint.ok(text);
      if (raw === false || raw === 'INVALID') return paint.bad(text);
      return text;
    }),
  ]);

  const widths = header.map((title, i) =>
    Math.max(visibleLength(title), ...body.map((cells) => visibleLength(cells[i]))),
  );
  const pad = (text: string, i: number) => text + ' '.repeat(widths[i] - visibleLength(text));
  const line = (left: string, mid: string, right: string) =>
    paint.dim(left + widths.map((w) => '─'.repeat(w + 2)).join(mid) + right);
  const bar = paint.dim('│');

  const out: string[] = [];
  out.push('');
  out.push(`  ${paint.bold(paint.violet('■'))} ${paint.bold(dataset.title)}`);
  out.push(`  ${formatSummary(dataset.summary, paint)}`);
  out.push('');

  if (columns.length === 0 || dataset.rows.length === 0) {
    out.push(paint.dim('  No rows to show.'));
  } else {
    out.push(line('┌', '┬', '┐'));
    out.push(`${bar} ${header.map((h, i) => paint.bold(pad(h, i))).join(` ${bar} `)} ${bar}`);
    out.push(line('├', '┼', '┤'));
    for (const cells of body) {
      out.push(`${bar} ${cells.map(pad).join(` ${bar} `)} ${bar}`);
    }
    out.push(line('└', '┴', '┘'));
  }

  if (shown.length < dataset.rows.length) {
    out.push(
      paint.dim(
        `  …${dataset.rows.length - shown.length} more rows. Use --limit 0, or -f csv|json|md|xlsx for the full set.`,
      ),
    );
  }
  out.push('');
  return out.join('\n');
}

/**
 * One-line coloured summary, e.g. "Total 5 · Valid 3 · Invalid 2"
 */
export function formatSummary(summary: Record<string, string | number>, paint: Paint): string {
  return Object.entries(summary)
    .map(([key, value]) => {
      const lower = key.toLowerCase();
      const text = String(value);
      const colored = lower.startsWith('valid')
        ? paint.ok(text)
        : lower.startsWith('invalid')
          ? paint.coral(text)
          : lower.startsWith('unique')
            ? paint.amber(text)
            : paint.bold(text);
      return `${paint.dim(key)} ${colored}`;
    })
    .join(paint.dim('  ·  '));
}

// ==================== Serialisation ====================

/**
 * Serialises a dataset into a text format
 */
export function serialise(
  dataset: Dataset,
  format: Exclude<OutputFormat, 'xlsx' | 'table'>,
  pretty: boolean,
): string {
  switch (format) {
    case 'json':
      return `${toJSON(
        {
          title: dataset.title,
          generatedAt: new Date().toISOString(),
          summary: dataset.summary,
          ...dataset.json,
          rows: dataset.rows,
        },
        { pretty },
      )}\n`;
    case 'csv':
      return toCSV(dataset.rows);
    case 'md':
      return toMarkdown(dataset.rows, {
        title: dataset.title,
        summary: dataset.summary,
      });
    case 'txt':
      return toText(dataset.lines);
  }
}

const sheetsFor = (dataset: Dataset): XlsxSheet[] => {
  const summary: XlsxSheet = {
    name: 'Summary',
    rows: Object.entries(dataset.summary).map(([metric, value]) => ({ metric, value })),
  };
  return [summary, ...(dataset.sheets ?? [{ name: 'Results', rows: dataset.rows }])];
};

const withExtension = (file: string, format: OutputFormat) =>
  path.extname(file) ? file : file + OUTPUT_FORMATS[format].extension;

/**
 * Decides the destination of every requested format: a file path, or stdout (null)
 */
export function planOutputs(
  target: OutputTarget,
): Array<{ format: OutputFormat; file: string | null }> {
  const fileFormats = target.formats.filter((format) => format !== 'table');
  const explicitDir = target.outDir !== undefined || target.name !== undefined;
  const dir = path.resolve(target.cwd, target.outDir ?? '.');
  const base = target.name ?? target.defaultName;

  return target.formats.map((format) => {
    if (format === 'table') return { format, file: null };

    if (target.output) {
      const output = path.resolve(target.cwd, target.output);
      if (fileFormats.length === 1) return { format, file: withExtension(output, format) };
      const stem = output.slice(0, output.length - path.extname(output).length);
      return { format, file: stem + OUTPUT_FORMATS[format].extension };
    }

    // Text formats stream to stdout unless a directory/name was given; xlsx always needs a file
    if (!explicitDir && !OUTPUT_FORMATS[format].binary) return { format, file: null };
    return { format, file: path.join(dir, base + OUTPUT_FORMATS[format].extension) };
  });
}

/**
 * Writes or prints every requested format and returns the files created
 */
export async function emit(
  dataset: Dataset,
  target: OutputTarget,
  stdout: OutStream,
  paint: Paint,
): Promise<string[]> {
  const written: string[] = [];

  for (const { format, file } of planOutputs(target)) {
    if (format === 'table') {
      stdout.write(`${renderTable(dataset, paint, target.limit)}\n`);
      continue;
    }

    if (format === 'xlsx') {
      await writeXlsx(sheetsFor(dataset), file!);
      written.push(file!);
      continue;
    }

    const content = serialise(dataset, format, target.pretty);
    if (file) {
      ensureDirectory(path.dirname(file));
      fs.writeFileSync(file, content, 'utf-8');
      written.push(file);
    } else {
      stdout.write(content);
    }
  }

  return written;
}
