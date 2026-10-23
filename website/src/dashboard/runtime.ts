import type { Settings, SourceInfo, ViewQuery, ViewResult } from '@numsy/engine';

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'md' | 'txt';

export interface LoadedSource extends SourceInfo {
  sessionId: string;
  size: number;
  /** Time spent reading the file */
  parseMs: number;
}

export interface ExportedFile {
  blob: Blob;
  fileName: string;
  rows: number;
}

/**
 * Where the dashboard does its work.
 * - local:   `numsy dashboard`; the Node server parses, analyses and exports
 * - browser: the website; a Web Worker does the same with the same engine
 */
export interface Runtime {
  kind: 'local' | 'browser';
  /** Shown in the header, e.g. "Local · v2.1.0" */
  label: string;
  loadFile(file: File): Promise<LoadedSource>;
  loadText(text: string, mode: 'validate' | 'extract'): Promise<LoadedSource>;
  view(sessionId: string, settings: Settings, query: ViewQuery): Promise<ViewResult>;
  exportFile(sessionId: string, settings: Settings, format: ExportFormat): Promise<ExportedFile>;
  release(sessionId: string): void;
}

export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const ACCEPT = '.csv,.xlsx,.xls';

export const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  csv: '.csv',
  xlsx: '.xlsx',
  json: '.json',
  md: '.md',
  txt: '.txt',
};

/** Same naming as the server: <file>-<set>.<ext> */
export const exportName = (source: string, only: string, format: ExportFormat) =>
  `${
    source
      .replace(/\.[^.]+$/, '')
      .replace(/[^\w.-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'numsy'
  }-${only}${FORMAT_EXTENSIONS[format]}`;

/**
 * Checks a file before it is read; returns an error message or null
 */
export function checkFile(file: File): string | null {
  if (!/\.(csv|xlsx|xls)$/i.test(file.name)) return 'Choose a .csv or .xlsx file.';
  if (file.size > MAX_FILE_BYTES) return 'Files up to 50 MB are supported.';
  if (file.size === 0) return 'This file is empty.';
  return null;
}
