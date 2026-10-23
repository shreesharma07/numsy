/**
 * Export Functions
 * Serialise rows to JSON, CSV, Markdown, plain text and Excel
 */

import * as path from 'node:path';
import * as ExcelJS from 'exceljs';
import { ensureDirectory } from '../helpers';
import { XlsxSheet } from '../../engine/serialize';
import { buildWorkbook } from '../../engine/workbook';

export { collectColumns, toCSV, toJSON, toMarkdown, toText } from '../../engine/serialize';
export type { XlsxSheet } from '../../engine/serialize';

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
 * Builds an Excel workbook in memory
 */
export async function toXlsxBuffer(
  sheets: XlsxSheet[],
  options?: { header?: boolean },
): Promise<Buffer> {
  const buffer = await buildWorkbook(ExcelJS, sheets, options).xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
}

/**
 * Writes an Excel workbook to disk, creating the parent directory if needed
 */
export async function writeXlsx(
  sheets: XlsxSheet[],
  filePath: string,
  options?: { header?: boolean },
): Promise<void> {
  ensureDirectory(path.dirname(filePath));
  await buildWorkbook(ExcelJS, sheets, options).xlsx.writeFile(filePath);
}
