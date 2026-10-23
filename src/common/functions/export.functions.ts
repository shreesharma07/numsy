/**
 * Export Functions
 * Serialise rows to JSON, CSV, Markdown, plain text and Excel
 */

import * as path from 'node:path';
import * as ExcelJS from 'exceljs';
import { ensureDirectory } from '../helpers';

/**
 * Output formats understood by the exporters and the CLI
 */
export type OutputFormat = 'table' | 'json' | 'csv' | 'md' | 'xlsx' | 'txt';

/**
 * Format metadata: file extension, binary flag and a short description
 */
export const OUTPUT_FORMATS: Record<
  OutputFormat,
  { extension: string; binary: boolean; description: string }
> = {
  table: { extension: '', binary: false, description: 'Aligned table for the terminal' },
  json: { extension: '.json', binary: false, description: 'JSON with summary + rows' },
  csv: { extension: '.csv', binary: false, description: 'RFC 4180 CSV (Excel friendly)' },
  md: { extension: '.md', binary: false, description: 'Markdown report with summary + table' },
  xlsx: { extension: '.xlsx', binary: true, description: 'Excel workbook, one sheet per set' },
  txt: { extension: '.txt', binary: false, description: 'One number per line' },
};

const FORMAT_ALIASES: Record<string, OutputFormat> = {
  table: 'table',
  json: 'json',
  csv: 'csv',
  md: 'md',
  markdown: 'md',
  xlsx: 'xlsx',
  excel: 'xlsx',
  txt: 'txt',
  text: 'txt',
};

/**
 * Resolves a user supplied format name (or alias) to an OutputFormat
 */
export function resolveOutputFormat(name: string): OutputFormat | null {
  return FORMAT_ALIASES[String(name).trim().toLowerCase()] ?? null;
}

/**
 * Infers an OutputFormat from a file path extension
 */
export function formatFromExtension(filePath: string): OutputFormat | null {
  const ext = path.extname(filePath).slice(1);
  return ext ? resolveOutputFormat(ext) : null;
}

/**
 * Collects the union of keys across rows, preserving first-seen order
 */
export function collectColumns(rows: Record<string, any>[]): string[] {
  const columns = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) columns.add(key);
  }
  return Array.from(columns);
}

const stringify = (value: any): string => {
  if (value === undefined || value === null) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

/**
 * Serialises any value to JSON
 */
export function toJSON(data: unknown, options?: { pretty?: boolean }): string {
  return JSON.stringify(data, null, options?.pretty === false ? undefined : 2);
}

/**
 * Guards against CSV formula injection while leaving phone numbers like "+91 98765 43210" intact
 */
const neutraliseFormula = (value: string): string => {
  if (/^[=@\t\r]/.test(value)) return `'${value}`;
  if (/^[+-]/.test(value) && !/^[+-][\d\s().-]*$/.test(value)) return `'${value}`;
  return value;
};

/**
 * Serialises rows to RFC 4180 CSV
 */
export function toCSV(
  rows: Record<string, any>[],
  options?: { columns?: string[]; delimiter?: string },
): string {
  const columns = options?.columns ?? collectColumns(rows);
  const delimiter = options?.delimiter ?? ',';
  const escapeCell = (value: any): string => {
    const text = neutraliseFormula(stringify(value));
    return /["\r\n]/.test(text) || text.includes(delimiter)
      ? `"${text.replace(/"/g, '""')}"`
      : text;
  };

  const lines = [columns.map(escapeCell).join(delimiter)];
  for (const row of rows) {
    lines.push(columns.map((column) => escapeCell(row[column])).join(delimiter));
  }
  return `${lines.join('\r\n')}\r\n`;
}

/**
 * Serialises rows to a Markdown document with an optional title and summary list
 */
export function toMarkdown(
  rows: Record<string, any>[],
  options?: {
    columns?: string[];
    title?: string;
    summary?: Record<string, string | number>;
  },
): string {
  const columns = options?.columns ?? collectColumns(rows);
  const cell = (value: any) => stringify(value).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
  const parts: string[] = [];

  if (options?.title) parts.push(`# ${options.title}`, '');

  if (options?.summary) {
    parts.push('| Metric | Value |', '| --- | ---: |');
    for (const [key, value] of Object.entries(options.summary)) {
      parts.push(`| ${cell(key)} | ${cell(value)} |`);
    }
    parts.push('');
  }

  if (columns.length === 0) {
    parts.push('_No rows._');
  } else {
    parts.push(`| ${columns.map(cell).join(' | ')} |`);
    parts.push(`| ${columns.map(() => '---').join(' | ')} |`);
    for (const row of rows) {
      parts.push(`| ${columns.map((column) => cell(row[column])).join(' | ')} |`);
    }
  }

  return `${parts.join('\n')}\n`;
}

/**
 * Joins values into newline separated text
 */
export function toText(values: Array<string | number>): string {
  return values.length ? `${values.map(String).join('\n')}\n` : '';
}

/**
 * A worksheet to be written by writeXlsx / toXlsxBuffer
 */
export interface XlsxSheet {
  name: string;
  rows: Record<string, any>[];
  columns?: string[];
}

const buildWorkbook = (sheets: XlsxSheet[]): ExcelJS.Workbook => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Numsy';
  workbook.created = new Date();

  for (const sheet of sheets) {
    // Excel limits sheet names to 31 chars and forbids []:*?/\
    const worksheet = workbook.addWorksheet(sheet.name.replace(/[[\]:*?/\\]/g, ' ').slice(0, 31));
    const columns = sheet.columns ?? collectColumns(sheet.rows);

    worksheet.columns = columns.map((column) => ({
      header: column,
      key: column,
      width: Math.min(
        60,
        Math.max(
          column.length,
          ...sheet.rows.slice(0, 200).map((row) => stringify(row[column]).length),
        ) + 2,
      ),
    }));

    for (const row of sheet.rows) {
      const values: Record<string, any> = {};
      for (const column of columns) values[column] = stringify(row[column]);
      worksheet.addRow(values);
    }

    if (columns.length) {
      worksheet.getRow(1).font = { bold: true };
      worksheet.views = [{ state: 'frozen', ySplit: 1 }];
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: columns.length },
      };
    }
  }

  return workbook;
};

/**
 * Builds an Excel workbook in memory
 */
export async function toXlsxBuffer(sheets: XlsxSheet[]): Promise<Buffer> {
  const buffer = await buildWorkbook(sheets).xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
}

/**
 * Writes an Excel workbook to disk, creating the parent directory if needed
 */
export async function writeXlsx(sheets: XlsxSheet[], filePath: string): Promise<void> {
  ensureDirectory(path.dirname(filePath));
  await buildWorkbook(sheets).xlsx.writeFile(filePath);
}
