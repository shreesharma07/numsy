/**
 * Analysis sessions: a loaded source (file rows or pasted text) that can be re-analysed with
 * new settings, filtered, searched, paged and exported. The local dashboard keeps sessions in
 * the Node server; the website keeps them in a Web Worker. Both share this code.
 */

import { AnalysisReport, ParsedDataRow } from '../common/interfaces';
import { analyzeRows } from './analyze';
import { detectNameColumn, detectPhoneColumn } from './columns';
import {
  Dataset,
  ROW_SETS,
  RowSet,
  extractDataset,
  reportDataset,
  reportSummary,
  shapeDataset,
  validateDataset,
} from './dataset';
import { formatNumber } from './rules';
import { Settings, toAnalyzeOptions, toDatasetOptions, toOutputOptions } from './settings';

export type Source =
  | { kind: 'file'; fileName: string; rows: ParsedDataRow[]; columns: string[] }
  | { kind: 'text'; mode: 'validate' | 'extract'; text: string };

/**
 * What the UI needs to know about a freshly loaded source
 */
export interface SourceInfo {
  kind: Source['kind'];
  name: string;
  totalRows: number;
  columns: string[];
  detected: { phoneColumn: string | null; nameColumn: string | null };
}

export type RowStatus = 'valid' | 'invalid' | 'duplicate';

export interface ViewColumn {
  key: string;
  label: string;
}

export interface ViewRow {
  /** Position in the selected set (1-based) */
  n: number;
  status: RowStatus;
  cells: Record<string, string | number>;
}

export interface ViewQuery {
  page?: number;
  pageSize?: number;
  /** Case-insensitive substring match across the visible cells */
  search?: string;
  /** Include every source column (file sources) */
  allColumns?: boolean;
}

export interface ViewResult {
  summary: Record<string, string | number>;
  counts: Record<RowSet, number>;
  phoneColumn: string | null;
  nameColumn: string | null;
  columns: ViewColumn[];
  rows: ViewRow[];
  /** Rows in the selected set after the search filter */
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  /** Time spent analysing (0 when served from cache) */
  analyzeMs: number;
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

const MAX_PAGE_SIZE = 500;

/** Settings that change the analysis itself (numberStyle and only only change presentation) */
const analysisKey = (s: Settings) =>
  JSON.stringify([s.phoneColumn, s.nameColumn, s.dedupe, s.strict, s.multiple, s.skipEmpty]);

const text = (value: unknown) => (value === undefined || value === null ? '' : String(value));

export class AnalysisSession {
  private report?: { key: string; value: AnalysisReport };
  private listing?: { key: string; columns: ViewColumn[]; rows: ViewRow[] };
  private overviewCache?: { key: string; value: ReturnType<AnalysisSession['computeOverview']> };

  constructor(readonly source: Source) {}

  info(): SourceInfo {
    const { source } = this;
    if (source.kind === 'text') {
      return {
        kind: 'text',
        name: source.mode === 'validate' ? 'Pasted values' : 'Pasted text',
        totalRows: source.text.split(/\r?\n/).filter((l) => l.trim()).length,
        columns: [],
        detected: { phoneColumn: null, nameColumn: null },
      };
    }
    return {
      kind: 'file',
      name: source.fileName,
      totalRows: source.rows.length,
      columns: source.columns,
      detected: {
        phoneColumn: detectPhoneColumn(source.rows),
        nameColumn: detectNameColumn(source.rows),
      },
    };
  }

  /**
   * The analysis report for file sources (cached per analysis settings)
   */
  analyze(settings: Settings): { report: AnalysisReport; ms: number } {
    if (this.source.kind !== 'file') throw new Error('Only file sources produce a report');
    const key = analysisKey(settings);
    if (this.report?.key === key) return { report: this.report.value, ms: 0 };

    const started = now();
    const report = analyzeRows(this.source.rows, toAnalyzeOptions(settings));
    report.source = this.source.fileName;
    this.report = { key, value: report };
    this.listing = undefined;
    return { report, ms: Math.round(now() - started) };
  }

  /**
   * The export dataset for the given settings: identical to what the CLI writes
   */
  dataset(settings: Settings): Dataset {
    const options = toDatasetOptions(settings);
    if (this.source.kind === 'text') {
      return this.source.mode === 'validate'
        ? validateDataset(this.lines(), options)
        : extractDataset(this.source.text, options);
    }
    return reportDataset(this.analyze(settings).report, options);
  }

  /**
   * The dataset as exported: dataset() reshaped by the output settings (header name, row cap, columns)
   */
  exportDataset(settings: Settings): Dataset {
    return shapeDataset(this.dataset(settings), toOutputOptions(settings));
  }

  /**
   * One page of the selected row set, with counts for every set
   */
  view(settings: Settings, query: ViewQuery = {}): ViewResult {
    const started = now();
    const pageSize = Math.min(Math.max(1, Math.floor(query.pageSize ?? 50)), MAX_PAGE_SIZE);
    const listing = this.list(settings, Boolean(query.allColumns));
    const needle = (query.search ?? '').trim().toLowerCase();
    const matched = needle
      ? listing.rows.filter((row) =>
          Object.values(row.cells).some((value) => String(value).toLowerCase().includes(needle)),
        )
      : listing.rows;

    const pages = Math.max(1, Math.ceil(matched.length / pageSize));
    const page = Math.min(Math.max(1, Math.floor(query.page ?? 1)), pages);
    const { summary, counts, phoneColumn, nameColumn } = this.overview(settings);

    return {
      summary,
      counts,
      phoneColumn,
      nameColumn,
      columns: listing.columns,
      rows: matched.slice((page - 1) * pageSize, page * pageSize),
      total: matched.length,
      page,
      pageSize,
      pages,
      analyzeMs: Math.round(now() - started),
    };
  }

  private lines(): string[] {
    if (this.source.kind !== 'text') return [];
    return this.source.text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private overview(settings: Settings) {
    const key = JSON.stringify([analysisKey(settings), settings.numberStyle]);
    if (this.overviewCache?.key !== key) {
      this.overviewCache = { key, value: this.computeOverview(settings) };
    }
    return this.overviewCache.value;
  }

  private computeOverview(settings: Settings) {
    const counts = {} as Record<RowSet, number>;
    if (this.source.kind === 'text') {
      for (const set of ROW_SETS) {
        counts[set] = this.dataset({ ...settings, only: set }).rows.length;
      }
      return {
        summary: this.dataset(settings).summary,
        counts,
        phoneColumn: null,
        nameColumn: null,
      };
    }
    const { report } = this.analyze(settings);
    counts.all = report.rows.length;
    counts.valid = report.validRows.length;
    counts.invalid = report.invalidRows.length;
    counts.unique = report.unique.length;
    counts.duplicates = report.duplicateRows.length;
    return {
      summary: reportSummary(report),
      counts,
      phoneColumn: report.phoneColumn,
      nameColumn: report.nameColumn ?? null,
    };
  }

  /**
   * Every row of the selected set as display cells (cached per settings + column mode)
   */
  private list(
    settings: Settings,
    allColumns: boolean,
  ): { columns: ViewColumn[]; rows: ViewRow[] } {
    const key = JSON.stringify([
      analysisKey(settings),
      settings.only,
      settings.numberStyle,
      allColumns,
    ]);
    if (this.listing?.key === key) return this.listing;

    const listing =
      this.source.kind === 'text' ? this.listText(settings) : this.listFile(settings, allColumns);
    this.listing = { key, ...listing };
    return this.listing;
  }

  private listText(settings: Settings) {
    const dataset = this.dataset(settings);
    const columns = Object.keys(dataset.rows[0] ?? {})
      .filter((key) => key !== 'valid' && key !== 'duplicate')
      .map((key) => ({ key, label: key === 'sanitized' ? 'number' : key }));
    const rows = dataset.rows.map((row, index) => {
      const status: RowStatus =
        row.valid === false ? 'invalid' : row.duplicate ? 'duplicate' : 'valid';
      const cells: Record<string, string | number> = {};
      for (const { key } of columns) cells[key] = text(row[key]);
      return { n: index + 1, status, cells };
    });
    return { columns, rows };
  }

  private listFile(settings: Settings, allColumns: boolean) {
    const source = this.source as Extract<Source, { kind: 'file' }>;
    const { report } = this.analyze(settings);
    const style = settings.numberStyle;

    if (settings.only === 'unique') {
      const columns = [
        ...(report.nameColumn ? [{ key: 'name', label: report.nameColumn }] : []),
        { key: 'phone', label: 'number' },
        { key: 'occurrences', label: 'occurrences' },
      ];
      const rows = report.unique.map((u, index) => ({
        n: index + 1,
        status: 'valid' as RowStatus,
        cells: {
          name: u.name ?? '',
          phone: formatNumber(u.phone, style),
          occurrences: u.occurrences,
        },
      }));
      return { columns, rows };
    }

    const set = {
      all: report.rows,
      valid: report.validRows,
      invalid: report.invalidRows,
      duplicates: report.duplicateRows,
    }[settings.only];
    const duplicates = new Set(report.duplicateRows);
    const extra = allColumns
      ? source.columns.filter((c) => c !== report.phoneColumn && c !== report.nameColumn)
      : [];
    const columns: ViewColumn[] = [
      ...(report.nameColumn ? [{ key: report.nameColumn, label: report.nameColumn }] : []),
      { key: 'originalPhone', label: report.phoneColumn },
      { key: 'sanitizedPhone', label: 'number' },
      { key: 'validationReason', label: 'reason' },
      ...extra.map((key) => ({ key, label: key })),
    ];

    const rows = set.map((row, index) => {
      const valid = row.validationStatus === 'VALID';
      const cells: Record<string, string | number> = {};
      for (const { key } of columns) cells[key] = text(row[key]);
      if (valid) cells.sanitizedPhone = formatNumber(String(row.sanitizedPhone ?? ''), style);
      return {
        n: index + 1,
        status: (!valid ? 'invalid' : duplicates.has(row) ? 'duplicate' : 'valid') as RowStatus,
        cells,
      };
    });
    return { columns, rows };
  }
}
