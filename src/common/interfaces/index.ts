/**
 * Common interfaces for the Number Processor package
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
  validNumbers: string[];
  invalidNumbers: string[];
}

/**
 * Interface for processing result
 */
export interface ProcessingResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  phoneColumn: string;
  zipFilePath: string;
  validFilePath: string;
  invalidFilePath: string;
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
 * Interface for logger options
 */
export interface LoggerOptions {
  context?: string;
  timestamp?: boolean;
  level?: 'log' | 'error' | 'warn' | 'debug' | 'verbose';
}

/**
 * Interface for Numsy configuration options
 */
export interface NumsyOptions {
  enableLogging?: boolean;
  logLevel?: 'log' | 'error' | 'warn' | 'debug' | 'verbose';
  throwOnError?: boolean;
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
export interface ProcessingOptions {
  outputDir?: string;
  preserveOriginalColumns?: boolean;
  validateNumbers?: boolean;
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
