/**
 * Validation Helper
 * Provides validation utilities for data validation
 */

import { LoggerHelper } from './logger.helper';
import { AppError } from './error.helper';

const logger = new LoggerHelper('ValidationHelper');

/**
 * Validates if a value is a non-empty string
 */
export function isNonEmptyString(value: any): boolean {
  try {
    return typeof value === 'string' && value.trim().length > 0;
  } catch (error) {
    logger.error('Error checking non-empty string', String(error));
    return false;
  }
}

/**
 * Validates if a value is a number
 */
export function isValidNumber(value: any): boolean {
  try {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  } catch (error) {
    logger.error('Error checking valid number', String(error));
    return false;
  }
}

/**
 * Validates if a value is an array
 */
export function isValidArray(value: any): boolean {
  try {
    return Array.isArray(value);
  } catch (error) {
    logger.error('Error checking valid array', String(error));
    return false;
  }
}

/**
 * Validates if an array is non-empty
 */
export function isNonEmptyArray(value: any): boolean {
  try {
    return isValidArray(value) && value.length > 0;
  } catch (error) {
    logger.error('Error checking non-empty array', String(error));
    return false;
  }
}

/**
 * Validates if a value is an object
 */
export function isValidObject(value: any): boolean {
  try {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  } catch (error) {
    logger.error('Error checking valid object', String(error));
    return false;
  }
}

/**
 * Sanitizes a string by removing special characters
 */
export function sanitizeString(value: string): string {
  try {
    if (!isNonEmptyString(value)) {
      return '';
    }
    return value.trim().replace(/[^\w\s.-]/g, '');
  } catch (error) {
    logger.error('Error sanitizing string', String(error));
    return '';
  }
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  try {
    if (!isNonEmptyString(email)) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  } catch (error) {
    logger.error('Error validating email', String(error));
    return false;
  }
}

/**
 * Validates if string contains only digits
 */
export function isDigitsOnly(value: string): boolean {
  try {
    if (!isNonEmptyString(value)) {
      return false;
    }
    return /^\d+$/.test(value);
  } catch (error) {
    logger.error('Error checking digits only', String(error));
    return false;
  }
}

/**
 * Validates minimum length of string
 */
export function hasMinLength(value: string, minLength: number): boolean {
  try {
    if (!isNonEmptyString(value)) {
      return false;
    }
    return value.length >= minLength;
  } catch (error) {
    logger.error('Error checking min length', String(error));
    return false;
  }
}

/**
 * Validates maximum length of string
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  try {
    if (!isNonEmptyString(value)) {
      return true; // Empty string is within max length
    }
    return value.length <= maxLength;
  } catch (error) {
    logger.error('Error checking max length', String(error));
    return false;
  }
}

/**
 * Validates if value is in allowed list
 */
export function isInAllowedList<T>(value: T, allowedList: T[]): boolean {
  try {
    return allowedList.includes(value);
  } catch (error) {
    logger.error('Error checking allowed list', String(error));
    return false;
  }
}

/**
 * Throws error if validation fails
 */
export function assertValid(condition: boolean, message: string): void {
  try {
    if (!condition) {
      throw new AppError(message, 'VALIDATION_ERROR');
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Assertion failed', String(error));
    throw new AppError(message, 'VALIDATION_ERROR');
  }
}
