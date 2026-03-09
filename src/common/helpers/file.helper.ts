/**
 * File Helper
 * Provides file system utilities for file operations
 */

import * as fs from 'fs';
import * as path from 'path';
import { LoggerHelper } from './logger.helper';
import { AppError } from './error.helper';

// Import utilities from util.functions for internal use
// Note: getFileExtension, formatFileSize, and generateUniqueFilename
// are exported from util.functions.ts and should be imported from there
// This file now only contains file helper functions not in util.functions
import { getFileExtension } from '../functions/util.functions';

const logger = new LoggerHelper('FileHelper');

/**
 * Checks if a file exists at the given path
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    logger.error(`Error checking file existence: ${filePath}`, String(error));
    return false;
  }
}

/**
 * Ensures a directory exists, creates it if it doesn't
 */
export function ensureDirectory(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.debug(`Directory created: ${dirPath}`);
    }
  } catch (error) {
    logger.error(`Error creating directory: ${dirPath}`, String(error));
    throw new AppError(`Failed to create directory: ${dirPath}`);
  }
}

/**
 * Deletes a file if it exists
 */
export function deleteFile(filePath: string): void {
  try {
    if (fileExists(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug(`File deleted: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Error deleting file: ${filePath}`, String(error));
    throw new AppError(`Failed to delete file: ${filePath}`);
  }
}

/**
 * Validates file extension against allowed extensions
 */
export function validateFileExtension(filePath: string, allowedExtensions: string[]): boolean {
  try {
    const extension = getFileExtension(filePath);
    const isValid = allowedExtensions.includes(extension);

    if (!isValid) {
      logger.warn(`Invalid file extension: ${extension}. Allowed: ${allowedExtensions.join(', ')}`);
    }

    return isValid;
  } catch (error) {
    logger.error(`Error validating file extension: ${filePath}`, String(error));
    return false;
  }
}

/**
 * Gets file size in bytes
 */
export function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    logger.error(`Error getting file size: ${filePath}`, String(error));
    return 0;
  }
}

/**
 * Reads file content as string
 */
export function readFileContent(filePath: string): string {
  try {
    if (!fileExists(filePath)) {
      throw new AppError(`File not found: ${filePath}`);
    }

    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    logger.error(`Error reading file: ${filePath}`, String(error));
    throw new AppError(`Failed to read file: ${filePath}`);
  }
}

/**
 * Writes content to file
 */
export function writeFileContent(filePath: string, content: string): void {
  try {
    const dirPath = path.dirname(filePath);
    ensureDirectory(dirPath);

    fs.writeFileSync(filePath, content, 'utf-8');
    logger.debug(`File written: ${filePath}`);
  } catch (error) {
    logger.error(`Error writing file: ${filePath}`, String(error));
    throw new AppError(`Failed to write file: ${filePath}`);
  }
}
