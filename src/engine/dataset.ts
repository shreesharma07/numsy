/**
 * Datasets: what a command produces, ready to be rendered in any output format.
 * The CLI, the local dashboard and the website build their exports from these.
 */

import { AnalysisReport, ProcessedRow } from '../common/interfaces';
import { NumberStyle, RuleOptions, checkNumber, extractNumbers, formatNumber } from './rules';
import { XlsxSheet, toCSV, toJSON, toMarkdown, toText } from './serialize';

/**
 * Which rows a dataset exports
 */
export type RowSet = 'all' | 'valid' | 'invalid' | 'unique' | 'duplicates';

export const ROW_SETS: RowSet[] = ['all', 'valid', 'invalid', 'unique', 'duplicates'];

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
  /** Key holding the phone number in each row (renamed by OutputOptions.numberHeader) */
  numberKey?: string;
  /** Key holding the contact name, when there is one */
  nameKey?: string;
}

/**
 * How exports are shaped: header row, number column name, row cap and columns
 */
export interface OutputOptions {
  /** Write a header row in csv and xlsx output (txt never has one). Default: true */
  header?: boolean;
  /** Rename the number column in exports, e.g. "Mobile". Default: keep the key */
  numberHeader?: string;
  /** Export at most this many rows per set; 0 = all (default) */
  maxRows?: number;
  /** full: every column (default); numbers: only the name and number columns */
  columns?: 'full' | 'numbers';
}

export interface DatasetOptions extends RuleOptions {
  only?: RowSet;
  numberStyle?: NumberStyle;
  /** validate: drop repeat occurrences of a valid number (process datasets de-dupe at analysis) */
  dedupe?: boolean;
}

const baseName = (file: string) => file.split(/[\\/]/).pop() || file;

/**
 * validate: one result per input value
 */
export function validateDataset(values: string[], options: DatasetOptions = {}): Dataset {
  const { only = 'all', numberStyle = 'plain' } = options;
  const results = values.map((value) => checkNumber(value, options));
  const valid = results.filter((r) => r.isValid);
  const unique = Array.from(new Set(valid.map((r) => r.sanitized)));
  const firstSeen = new Set<string>();

  const marked = results.map((r) => {
    const duplicate = r.isValid && firstSeen.has(r.sanitized);
    if (r.isValid) firstSeen.add(r.sanitized);
    return {
      input: r.original,
      sanitized: r.isValid ? formatNumber(r.sanitized, numberStyle) : r.sanitized,
      valid: r.isValid,
      duplicate,
      reason: r.reason ?? '',
    };
  });
  const all = options.dedupe ? marked.filter((r) => !r.duplicate) : marked;

  const rows = {
    all,
    valid: all.filter((r) => r.valid),
    invalid: all.filter((r) => !r.valid),
    unique: unique.map((phone) => ({ phone: formatNumber(phone, numberStyle) })),
    duplicates: marked.filter((r) => r.duplicate),
  }[only];

  return {
    title: 'Numsy · validate',
    rows,
    numberKey: only === 'unique' ? 'phone' : 'sanitized',
    summary: {
      Total: results.length,
      Valid: valid.length,
      Invalid: results.length - valid.length,
      Unique: unique.length,
      Duplicates: valid.length - unique.length,
    },
    lines:
      only === 'invalid'
        ? all.filter((r) => !r.valid).map((r) => r.input)
        : only === 'unique'
          ? unique.map((p) => formatNumber(p, numberStyle))
          : only === 'duplicates'
            ? marked.filter((r) => r.duplicate).map((r) => r.sanitized)
            : all.filter((r) => r.valid).map((r) => r.sanitized),
  };
}

/**
 * extract: every distinct number found in free text
 */
export function extractDataset(text: string, options: DatasetOptions = {}): Dataset {
  const { only = 'all', numberStyle = 'plain' } = options;
  const found = extractNumbers(text, options);
  const all = [
    ...found.valid.map((n) => ({ number: formatNumber(n, numberStyle), valid: true, reason: '' })),
    ...found.invalid.map((n) => ({ number: n.number, valid: false, reason: n.reason })),
  ];
  const unique = found.valid.map((n) => ({ phone: formatNumber(n, numberStyle) }));

  const rows = {
    all,
    valid: all.filter((r) => r.valid),
    invalid: all.filter((r) => !r.valid),
    unique,
    // extract already returns each number once
    duplicates: [],
  }[only];

  return {
    title: 'Numsy · extract',
    rows,
    numberKey: only === 'unique' ? 'phone' : 'number',
    summary: {
      Found: found.all.length,
      Valid: found.valid.length,
      Invalid: found.invalid.length,
      Unique: found.valid.length,
    },
    lines:
      only === 'invalid'
        ? found.invalid.map((n) => n.number)
        : found.valid.map((n) => formatNumber(n, numberStyle)),
  };
}

/**
 * Key figures for an analysis report
 */
export function reportSummary(report: AnalysisReport): Record<string, string | number> {
  const { analytics } = report;
  return {
    Records: report.totalRecords,
    Valid: analytics.totalValidNumbers,
    Invalid: analytics.totalInvalidNumbers,
    Unique: analytics.uniqueValidNumbers,
    Duplicates: analytics.duplicateNumbers,
    ...(analytics.duplicatesRemoved ? { 'Duplicates removed': analytics.duplicatesRemoved } : {}),
    'Phone column': report.phoneColumn,
  };
}

/**
 * process: a CSV/XLSX analysis report
 */
export function reportDataset(report: AnalysisReport, options: DatasetOptions = {}): Dataset {
  const { only = 'all', numberStyle = 'plain' } = options;
  // The library adds a `name` field to every row; drop it when the file already has its own name column
  const dropName = Boolean(report.nameColumn) && report.nameColumn !== 'name';

  const fmt = (source: ProcessedRow): ProcessedRow => {
    const row = { ...source };
    if (dropName) delete row.name;
    if (numberStyle !== 'plain' && row.validationStatus === 'VALID') {
      row[report.phoneColumn] = formatNumber(row.sanitizedPhone ?? '', numberStyle);
      row.sanitizedPhone = formatNumber(row.sanitizedPhone ?? '', numberStyle);
    }
    return row;
  };

  const all = report.rows.map(fmt);
  const valid = report.validRows.map(fmt);
  const invalid = report.invalidRows.map(fmt);
  const duplicates = (report.duplicateRows ?? []).map(fmt);
  const unique = report.unique.map((u) => ({
    ...(report.nameColumn ? { name: u.name ?? '' } : {}),
    phone: formatNumber(u.phone, numberStyle),
    occurrences: u.occurrences,
  }));

  const rows = { all, valid, invalid, unique, duplicates }[only];
  const tableColumns =
    only === 'unique'
      ? Object.keys(unique[0] ?? { phone: '' })
      : [
          ...(report.nameColumn ? [report.nameColumn] : []),
          'originalPhone',
          'sanitizedPhone',
          'validationStatus',
          'validationReason',
        ];

  const { analytics } = report;
  const rowKeys = { numberKey: 'sanitizedPhone', nameKey: report.nameColumn };
  const uniqueKeys = { numberKey: 'phone', nameKey: report.nameColumn ? 'name' : undefined };
  const sheets: XlsxSheet[] = {
    all: [
      { name: 'All rows', rows: all, ...rowKeys },
      { name: 'Valid', rows: valid, ...rowKeys },
      { name: 'Invalid', rows: invalid, ...rowKeys },
      { name: 'Unique', rows: unique, ...uniqueKeys },
      ...(duplicates.length ? [{ name: 'Duplicates', rows: duplicates, ...rowKeys }] : []),
    ],
    valid: [{ name: 'Valid', rows: valid, ...rowKeys }],
    invalid: [{ name: 'Invalid', rows: invalid, ...rowKeys }],
    unique: [{ name: 'Unique', rows: unique, ...uniqueKeys }],
    duplicates: [{ name: 'Duplicates', rows: duplicates, ...rowKeys }],
  }[only];

  return {
    title: `Numsy · ${baseName(report.source ?? 'data')}`,
    rows,
    tableColumns,
    ...(only === 'unique' ? uniqueKeys : rowKeys),
    summary: reportSummary(report),
    lines:
      only === 'invalid'
        ? invalid.map((r) => r.originalPhone ?? '')
        : only === 'unique'
          ? unique.map((u) => u.phone)
          : (only === 'duplicates' ? duplicates : valid).map((r) => r.sanitizedPhone ?? ''),
    sheets,
    json: {
      source: report.source,
      phoneColumn: report.phoneColumn,
      nameColumn: report.nameColumn ?? null,
      analytics,
      ...(only === 'all' ? { unique } : {}),
    },
  };
}

/**
 * Applies OutputOptions to rows: cap, pick the name + number columns, rename the number column
 */
function shapeRows(
  rows: Record<string, any>[],
  keys: { numberKey?: string; nameKey?: string },
  options: OutputOptions,
): Record<string, any>[] {
  const capped = options.maxRows && options.maxRows > 0 ? rows.slice(0, options.maxRows) : rows;
  const { numberKey, nameKey } = keys;
  const rename = options.numberHeader?.trim();
  if (!numberKey || (options.columns !== 'numbers' && !rename)) return capped;

  return capped.map((row) => {
    const out: Record<string, any> = {};
    const entries =
      options.columns === 'numbers'
        ? [nameKey, numberKey]
            .filter((k): k is string => Boolean(k) && k! in row)
            .map((k) => [k, row[k]])
        : Object.entries(row);
    for (const [key, value] of entries) out[key === numberKey && rename ? rename : key] = value;
    return out;
  });
}

/**
 * A dataset reshaped for export. Summary and analytics always describe the full result.
 */
export function shapeDataset(dataset: Dataset, options: OutputOptions = {}): Dataset {
  const keys = { numberKey: dataset.numberKey, nameKey: dataset.nameKey };
  const rename = options.numberHeader?.trim();
  return {
    ...dataset,
    rows: shapeRows(dataset.rows, keys, options),
    lines:
      options.maxRows && options.maxRows > 0
        ? dataset.lines.slice(0, options.maxRows)
        : dataset.lines,
    sheets: dataset.sheets?.map((sheet) => ({
      ...sheet,
      rows: shapeRows(sheet.rows, sheet, options),
      numberKey: rename && sheet.numberKey ? rename : sheet.numberKey,
    })),
    numberKey: rename && dataset.numberKey ? rename : dataset.numberKey,
  };
}

/**
 * Text formats a dataset can be serialised to (xlsx goes through datasetSheets + a workbook)
 */
export type TextFormat = 'json' | 'csv' | 'md' | 'txt';

/**
 * Serialises a dataset into a text format. header: false drops the csv header row.
 */
export function serializeDataset(
  dataset: Dataset,
  format: TextFormat,
  pretty = true,
  output: Pick<OutputOptions, 'header'> = {},
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
      )}
`;
    case 'csv':
      return toCSV(dataset.rows, { header: output.header !== false });
    case 'md':
      return toMarkdown(dataset.rows, { title: dataset.title, summary: dataset.summary });
    case 'txt':
      return toText(dataset.lines);
  }
}

/**
 * Workbook sheets for a dataset: a Summary sheet followed by one sheet per row set
 */
export function datasetSheets(dataset: Dataset): XlsxSheet[] {
  const summary: XlsxSheet = {
    name: 'Summary',
    rows: Object.entries(dataset.summary).map(([metric, value]) => ({ metric, value })),
  };
  return [
    summary,
    ...(dataset.sheets ?? [
      {
        name: 'Results',
        rows: dataset.rows,
        numberKey: dataset.numberKey,
        nameKey: dataset.nameKey,
      },
    ]),
  ];
}
