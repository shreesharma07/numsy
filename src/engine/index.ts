/**
 * Numsy engine — the browser-safe core shared by the library, the CLI,
 * the local dashboard (`numsy dashboard`) and the website.
 * Nothing in here imports Node.js modules.
 */

export { analyzeRows } from './analyze';
export { detectNameColumn, detectPhoneColumn } from './columns';
export { parseCsv, parseCsvRecords, sniffDelimiter } from './csv';
export {
  ROW_SETS,
  datasetSheets,
  extractDataset,
  reportDataset,
  reportSummary,
  serializeDataset,
  shapeDataset,
  validateDataset,
} from './dataset';
export type { Dataset, DatasetOptions, OutputOptions, RowSet, TextFormat } from './dataset';
export { NUMBER_STYLES, checkNumber, extractNumbers, formatNumber } from './rules';
export type { ExtractedNumbers, NumberStyle, RuleOptions } from './rules';
export { collectColumns, toCSV, toJSON, toMarkdown, toText } from './serialize';
export type { XlsxSheet } from './serialize';
export { buildWorkbook, cellToValue, worksheetToRows } from './workbook';
export type {
  AnalysisReport,
  AnalyzeOptions,
  DedupeMode,
  FileParseResult,
  ParsedDataRow,
  PhoneValidationResult,
  ProcessedRow,
  ProcessingAnalytics,
  UniqueNumber,
} from '../common/interfaces';
export {
  DEFAULT_SETTINGS,
  resolveSettings,
  toAnalyzeOptions,
  toDatasetOptions,
  toOutputOptions,
} from './settings';
export type { Settings } from './settings';
export { AnalysisSession } from './session';
export type {
  RowStatus,
  Source,
  SourceInfo,
  ViewColumn,
  ViewQuery,
  ViewResult,
  ViewRow,
} from './session';
