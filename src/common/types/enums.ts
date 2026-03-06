/**
 * Enhanced type definitions and enums for Numsy package
 */

// ============== Enums ==============

/**
 * Log levels for the logger
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

/**
 * Validation status codes
 */
export enum ValidationStatus {
  VALID = 'valid',
  INVALID = 'invalid',
  UNKNOWN = 'unknown',
}

/**
 * File types supported by the parser
 */
export enum FileType {
  CSV = 'csv',
  XLSX = 'xlsx',
  XLS = 'xls',
  JSON = 'json',
}

/**
 * Phone number formats
 */
export enum PhoneFormat {
  STANDARD = 'standard', // 9876543210
  WITH_COUNTRY_CODE = 'country', // +919876543210
  WITH_SPACES = 'spaces', // +91 98765 43210
  WITH_DASHES = 'dashes', // +91-98765-43210
}

/**
 * Error codes for standardized error handling
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_FORMAT = 'INVALID_FORMAT',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Processing status for file operations
 */
export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// ============== Type Guards ==============

export function isValidLogLevel(level: string): level is LogLevel {
  return Object.values(LogLevel).includes(level as LogLevel);
}

export function isValidFileType(type: string): type is FileType {
  return Object.values(FileType).includes(type as FileType);
}

export function isValidPhoneFormat(format: string): format is PhoneFormat {
  return Object.values(PhoneFormat).includes(format as PhoneFormat);
}

// ============== Utility Types ==============

/**
 * Make all properties of T readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Make specific properties K of T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties K of T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract function parameter types
 */
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;

/**
 * Extract function return type
 */
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

/**
 * Async version of return type
 */
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any;

// ============== Constants ==============

/**
 * Phone number validation constants
 */
export const PHONE_CONSTANTS = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 13,
  COUNTRY_CODE: '+91',
  VALID_PREFIXES: ['6', '7', '8', '9'],
  INDIAN_COUNTRY_CODE: '91',
} as const;

/**
 * File processing constants
 */
export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_EXTENSIONS: ['.csv', '.xlsx', '.xls'],
  DEFAULT_ENCODING: 'utf-8',
} as const;

/**
 * Default port configuration
 */
export const PORT_CONSTANTS = {
  DEFAULT: 68679,
  MIN: 1024,
  MAX: 65535,
} as const;

export type PhoneConstants = typeof PHONE_CONSTANTS;
export type FileConstants = typeof FILE_CONSTANTS;
export type PortConstants = typeof PORT_CONSTANTS;
