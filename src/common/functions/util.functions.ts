/**
 * Generic Utility Functions
 * Common utility functions used across the application
 */

import * as path from 'path';
import * as fs from 'fs';

/**
 * Validates if a path is within allowed directories
 */
export function isPathAllowed(
  filePath: string,
  allowedDirs: string[],
): { isValid: boolean; normalizedPath: string; error?: string } {
  try {
    const normalizedPath = path.normalize(path.resolve(filePath));

    // Check for parent directory references
    if (normalizedPath.includes('..')) {
      return {
        isValid: false,
        normalizedPath,
        error: 'Path traversal attempt detected',
      };
    }

    // Check if path is within allowed directories
    const isAllowed = allowedDirs.some((allowedDir) => {
      const normalizedAllowedDir = path.normalize(path.resolve(allowedDir));
      return (
        normalizedPath.startsWith(normalizedAllowedDir + path.sep) ||
        normalizedPath === normalizedAllowedDir
      );
    });

    if (!isAllowed) {
      return {
        isValid: false,
        normalizedPath,
        error: 'Path outside allowed directories',
      };
    }

    return { isValid: true, normalizedPath };
  } catch (error) {
    return {
      isValid: false,
      normalizedPath: filePath,
      error: error instanceof Error ? error.message : 'Path validation error',
    };
  }
}

/**
 * Gets allowed directories for file operations
 */
export function getAllowedDirectories(type: 'input' | 'output' | 'all'): string[] {
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  const tempDir = path.resolve(process.cwd(), 'temp');
  const tempDirAlt = path.resolve(process.cwd(), 'Temp');

  switch (type) {
    case 'input':
      return [uploadDir, tempDir, tempDirAlt];
    case 'output':
      return [tempDir, tempDirAlt];
    case 'all':
      return [uploadDir, tempDir, tempDirAlt];
    default:
      return [];
  }
}

/**
 * Safely checks if a file exists
 */
export function safeFileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Safely gets file stats
 */
export function safeGetFileStats(filePath: string): fs.Stats | null {
  try {
    return fs.statSync(filePath);
  } catch (error) {
    return null;
  }
}

/**
 * Checks if a path is a file (not a directory)
 */
export function isFile(filePath: string): boolean {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Checks if a path is a directory
 */
export function isDirectory(dirPath: string): boolean {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Safely creates a directory recursively
 */
export function safeCreateDirectory(dirPath: string): { success: boolean; error?: string } {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Directory creation failed',
    };
  }
}

/**
 * Safely deletes a file
 */
export function safeDeleteFile(filePath: string): { success: boolean; error?: string } {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'File deletion failed',
    };
  }
}

/**
 * Generates a unique filename with timestamp
 */
export function generateUniqueFilename(
  baseName: string,
  extension: string,
  timestamp?: number,
): string {
  try {
    const ts = timestamp || Date.now();
    const cleanBaseName = baseName.replace(/[^a-z0-9_-]/gi, '_');
    return `${cleanBaseName}_${ts}.${extension.replace(/^\./, '')}`;
  } catch (error) {
    return `file_${Date.now()}.${extension.replace(/^\./, '')}`;
  }
}

/**
 * Gets file extension safely
 */
export function getFileExtension(filePath: string): string {
  try {
    return path.extname(filePath).toLowerCase().replace(/^\./, '');
  } catch (error) {
    return '';
  }
}

/**
 * Gets filename without extension
 */
export function getFilenameWithoutExtension(filePath: string): string {
  try {
    return path.basename(filePath, path.extname(filePath));
  } catch (error) {
    return '';
  }
}

/**
 * Validates file extension against allowed extensions
 */
export function isAllowedExtension(filePath: string, allowedExtensions: string[]): boolean {
  try {
    const ext = getFileExtension(filePath);
    return allowedExtensions.some((allowed) => allowed.toLowerCase() === ext);
  } catch (error) {
    return false;
  }
}

/**
 * Sanitizes a string for use in filenames
 */
export function sanitizeFilename(filename: string): string {
  try {
    return filename
      .replace(/[^a-z0-9_.-]/gi, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^[._]+/, '')
      .replace(/[._]+$/, '');
  } catch (error) {
    return `file_${Date.now()}`;
  }
}

/**
 * Safely reads a file as string
 */
export function safeReadFile(filePath: string, encoding: BufferEncoding = 'utf-8'): string | null {
  try {
    return fs.readFileSync(filePath, encoding);
  } catch (error) {
    return null;
  }
}

/**
 * Safely writes a file
 */
export function safeWriteFile(
  filePath: string,
  content: string,
  encoding: BufferEncoding = 'utf-8',
): { success: boolean; error?: string } {
  try {
    fs.writeFileSync(filePath, content, encoding);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'File write failed',
    };
  }
}

/**
 * Gets directory listing safely
 */
export function safeReadDirectory(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    return fs.readdirSync(dirPath);
  } catch (error) {
    return [];
  }
}

/**
 * Calculates file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  try {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  } catch (error) {
    return `${bytes} B`;
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Debounces a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * Throttles a function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    return obj;
  }
}

/**
 * Checks if two objects are deeply equal
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  try {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  } catch (error) {
    return false;
  }
}

/**
 * Safely parses JSON
 */
export function safeJsonParse<T = any>(jsonString: string, defaultValue?: T): T | null {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue !== undefined ? defaultValue : null;
  }
}

/**
 * Safely stringifies JSON
 */
export function safeJsonStringify(obj: any, space?: number): string | null {
  try {
    return JSON.stringify(obj, null, space);
  } catch (error) {
    return null;
  }
}

/**
 * Generates a random ID
 */
export function generateId(length: number = 16): string {
  try {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  } catch (error) {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length);
  }
}

/**
 * Sleeps for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Chunks an array into smaller arrays
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  try {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  } catch (error) {
    return [array];
  }
}

/**
 * Removes duplicates from array
 */
export function uniqueArray<T>(array: T[]): T[] {
  try {
    return Array.from(new Set(array));
  } catch (error) {
    return array;
  }
}

/**
 * Flattens a nested array
 */
export function flattenArray<T>(array: any[]): T[] {
  try {
    return array.flat(Infinity) as T[];
  } catch (error) {
    return array;
  }
}

/**
 * Groups array items by a key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  try {
    return array.reduce(
      (result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
          result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
      },
      {} as Record<string, T[]>,
    );
  } catch (error) {
    return {};
  }
}
