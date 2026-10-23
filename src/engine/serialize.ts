/**
 * Serialisers for JSON, CSV, Markdown and plain text
 * Browser-safe: shared by the library, the CLI, the local dashboard and the website
 */

/**
 * A worksheet to be written by writeXlsx / toXlsxBuffer
 */
export interface XlsxSheet {
  name: string;
  rows: Record<string, any>[];
  columns?: string[];
  /** Key holding the phone number (used when exports are reshaped) */
  numberKey?: string;
  /** Key holding the contact name */
  nameKey?: string;
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

/**
 * Flattens a cell value to text
 */
export const stringify = (value: any): string => {
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
  options?: { columns?: string[]; delimiter?: string; header?: boolean },
): string {
  const columns = options?.columns ?? collectColumns(rows);
  const delimiter = options?.delimiter ?? ',';
  const escapeCell = (value: any): string => {
    const text = neutraliseFormula(stringify(value));
    return /["\r\n]/.test(text) || text.includes(delimiter)
      ? `"${text.replace(/"/g, '""')}"`
      : text;
  };

  const lines = options?.header === false ? [] : [columns.map(escapeCell).join(delimiter)];
  for (const row of rows) {
    lines.push(columns.map((column) => escapeCell(row[column])).join(delimiter));
  }
  return lines.length ? `${lines.join('\r\n')}\r\n` : '';
}

/**
 * Serialises rows to a Markdown report: title, summary table and data table,
 * each block separated by exactly one blank line
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
  const blocks: string[] = [];
  const sectioned = Boolean(options?.title || options?.summary);

  if (options?.title) blocks.push(`# ${options.title}`);

  if (options?.summary) {
    const summary = ['## Summary', '', '| Metric | Value |', '| --- | ---: |'];
    for (const [key, value] of Object.entries(options.summary)) {
      summary.push(`| ${cell(key)} | ${cell(value)} |`);
    }
    blocks.push(summary.join('\n'));
  }

  const table: string[] = sectioned ? [`## Rows (${rows.length})`, ''] : [];
  if (columns.length === 0) {
    table.push('_No rows._');
  } else {
    table.push(`| ${columns.map(cell).join(' | ')} |`);
    table.push(`| ${columns.map(() => '---').join(' | ')} |`);
    for (const row of rows) {
      table.push(`| ${columns.map((column) => cell(row[column])).join(' | ')} |`);
    }
  }
  blocks.push(table.join('\n'));

  return `${blocks.join('\n\n')}\n`;
}

/**
 * Joins values into newline separated text
 */
export function toText(values: Array<string | number>): string {
  return values.length ? `${values.map(String).join('\n')}\n` : '';
}
