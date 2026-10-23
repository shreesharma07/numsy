/**
 * Common interfaces for the 🔢 Numsy package
 * Centralizes all type definitions for better maintainability
 */

/**
 * Interface for parsed data row
 */
export interface ParsedDataRow {
  name?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
}

/**
 * Interface for file parsing result
 */
export interface FileParseResult {
  data: ParsedDataRow[];
  totalRows: number;
  detectedColumns: string[];
}

/**
 * Interface for validated phone number result
 */
export interface PhoneValidationResult {
  original: string;
  sanitized: string;
  isValid: boolean;
  reason?: string;
}

/**
 * Interface for multiple phone numbers extraction result
 */
export interface MultipleNumbersResult {
  originalValue: string;
  extractedNumbers: string[];
  validNumbers: PhoneValidationResult[];
  invalidNumbers: PhoneValidationResult[];
  validCount: number;
  invalidCount: number;
  totalFound: number;
}

/**
 * Interface for processing result
 */
export interface ProcessingResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  phoneColumn: string;
  nameColumn?: string;
  zipFilePath: string;
  validFilePath: string;
  invalidFilePath: string;
  uniqueNumbersFilePath?: string;
  analyticsFilePath: string;
  analytics: ProcessingAnalytics;
}

/**
 * Interface for processing analytics
 */
export interface ProcessingAnalytics {
  totalNumbersExtracted: number;
  totalValidNumbers: number;
  totalInvalidNumbers: number;
  recordsWithMultipleNumbers: number;
  averageNumbersPerRecord: number;
  duplicateNumbers: number;
  uniqueValidNumbers: number;
  /** Repeat occurrences dropped by the `dedupe` setting (0 when dedupe is off) */
  duplicatesRemoved?: number;
  /** Rows whose phone cell was empty */
  emptyRecords?: number;
}

/**
 * Interface for processed row with validation details
 */
export interface ProcessedRow extends ParsedDataRow {
  validationStatus?: string;
  validationReason?: string;
  originalPhone?: string;
  sanitizedPhone?: string;
  numbersExtracted?: number;
  allExtractedNumbers?: string;
}

/**
 * Interface for extracted data analytics
 */
export interface ExtractedDataAnalytics {
  uniqueNumbers: Set<string>;
  numberFrequency: Map<string, number>;
  fieldDistribution: Map<string, number>;
}

/**
 * Interface for file operation result
 */
export interface FileOperationResult {
  success: boolean;
  filePath?: string;
  error?: string;
  message?: string;
}

/**
 * Interface for batch operation result
 */
export interface BatchOperationResult<T = any> {
  total: number;
  successful: number;
  failed: number;
  results: T[];
  errors: Array<{ index: number; error: string }>;
}

/**
 * Interface for logger options
 */
export interface LoggerOptions {
  context?: string;
  timestamp?: boolean;
  level?: 'log' | 'error' | 'warn' | 'debug' | 'verbose';
  timezone?: string;
  /** Set to false to silence the logger entirely */
  enabled?: boolean;
}

/**
 * Interface for Numsy configuration options
 */
export interface NumsyOptions {
  enableLogging?: boolean;
  logLevel?: 'log' | 'error' | 'warn' | 'debug' | 'verbose';
  throwOnError?: boolean;
  /** Rename known column headers (e.g. "Mobile Number" -> "phone") when parsing files. Default: true */
  normalizeColumns?: boolean;
}

/**
 * Interface for Parser configuration options
 */
export interface ParserOptions extends NumsyOptions {
  normalizeColumns?: boolean;
  detectPhoneColumn?: boolean;
}

/**
 * Interface for processing options
 */
export interface ProcessingOptions extends NumsyOptions {
  outputDir?: string;
  preserveOriginalColumns?: boolean;
  validateNumbers?: boolean;
}

/**
 * Options for in-memory analysis of parsed rows
 */
export interface AnalyzeOptions {
  /** Column holding phone numbers. Auto-detected when omitted. */
  phoneColumn?: string;
  /** Column holding contact names. Auto-detected when omitted; pass null to disable. */
  nameColumn?: string | null;
  /**
   * Remove repeat occurrences of the same valid number from `rows` and `validRows`.
   * - off:   keep every occurrence (default)
   * - first: keep the first occurrence
   * - last:  keep the last occurrence
   */
  dedupe?: DedupeMode;
  /** Reject dummy and test patterns such as 9999999999 or 1234567890. Default: true */
  strict?: boolean;
  /** When a cell holds several valid numbers: one row per number ('all', default) or only the first */
  multiple?: 'all' | 'first';
  /** Leave rows with an empty phone cell out of `invalidRows`. Default: false */
  skipEmpty?: boolean;
}

/**
 * Duplicate handling for AnalyzeOptions.dedupe
 */
export type DedupeMode = 'off' | 'first' | 'last';

/**
 * A unique valid number with the first name seen for it
 */
export interface UniqueNumber {
  phone: string;
  name?: string;
  /** How many times the number appeared across the dataset */
  occurrences: number;
}

/**
 * In-memory analysis report produced by FileProcessor.analyze / analyzeFile
 */
export interface AnalysisReport {
  source?: string;
  phoneColumn: string;
  nameColumn?: string;
  totalRecords: number;
  /** Every output row in input order (rows holding several valid numbers are expanded) */
  rows: ProcessedRow[];
  validRows: ProcessedRow[];
  invalidRows: ProcessedRow[];
  /** Repeat occurrences of a valid number (removed from rows/validRows unless dedupe is off) */
  duplicateRows: ProcessedRow[];
  unique: UniqueNumber[];
  analytics: ProcessingAnalytics;
}

/**
 * Interface for error response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

/**
 * Interface for success response
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Type for API response
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;
