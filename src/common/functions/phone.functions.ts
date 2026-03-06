/**
 * Phone Validation Functions
 * Pure functions for phone number validation and sanitization
 */

import { PHONE_PATTERNS, PHONE_LENGTH } from './constants';
import { PhoneValidationResult } from '../interfaces';
import { isNonEmptyString } from '../helpers';

/**
 * Sanitizes a phone number by removing non-digit characters
 */
export function sanitizePhoneNumber(phone: string): string {
  try {
    if (!isNonEmptyString(phone)) {
      return '';
    }

    const phoneStr = String(phone).trim();
    const digitsOnly = phoneStr.replace(/\D/g, '');

    // Remove country code prefix if present
    let sanitizedValue = digitsOnly;
    if (sanitizedValue.startsWith('91') && sanitizedValue.length === 12) {
      sanitizedValue = sanitizedValue.substring(2);
    } else if (sanitizedValue.startsWith('0') && sanitizedValue.length === 11) {
      sanitizedValue = sanitizedValue.substring(1);
    }

    return sanitizedValue;
  } catch (error) {
    return '';
  }
}

/**
 * Validates if a phone number is a valid Indian mobile number
 */
export function isValidIndianMobile(phone: string): boolean {
  try {
    if (!isNonEmptyString(phone)) {
      return false;
    }

    const sanitized = sanitizePhoneNumber(phone);
    return PHONE_PATTERNS.INDIAN_MOBILE.test(sanitized);
  } catch (error) {
    return false;
  }
}

/**
 * Validates a phone number and returns detailed result
 */
export function validatePhoneNumber(phone: string): PhoneValidationResult {
  const result: PhoneValidationResult = {
    original: phone,
    sanitized: '',
    isValid: false,
    reason: undefined,
  };

  try {
    if (!isNonEmptyString(phone)) {
      result.reason = 'Empty or invalid phone number';
      return result;
    }

    const sanitized = sanitizePhoneNumber(phone);
    result.sanitized = sanitized;

    if (!sanitized) {
      result.reason = 'No digits found in phone number';
      return result;
    }

    if (sanitized.length < PHONE_LENGTH.MIN_LENGTH) {
      result.reason = `Too short (${sanitized.length} digits)`;
      return result;
    }

    if (sanitized.length > PHONE_LENGTH.MIN_LENGTH) {
      result.reason = `Too long (${sanitized.length} digits)`;
      return result;
    }

    if (!PHONE_PATTERNS.INDIAN_MOBILE.test(sanitized)) {
      result.reason = 'Invalid Indian mobile number format';
      return result;
    }

    result.isValid = true;
    result.reason = undefined;
    return result;
  } catch (error) {
    result.reason = 'Error during validation';
    return result;
  }
}

/**
 * Extracts all phone numbers from a string
 */
export function extractPhoneNumbers(text: string): string[] {
  const extractedNumbers: string[] = [];

  try {
    if (!isNonEmptyString(text)) {
      return extractedNumbers;
    }

    const textStr = String(text).trim();
    const potentialNumbers = textStr.match(PHONE_PATTERNS.EXTRACT_DIGITS);

    if (!potentialNumbers) {
      return extractedNumbers;
    }

    for (const numStr of potentialNumbers) {
      const sanitized = sanitizePhoneNumber(numStr);
      if (sanitized && sanitized.length === PHONE_LENGTH.INDIAN_MOBILE) {
        if (isValidIndianMobile(sanitized)) {
          extractedNumbers.push(sanitized);
        }
      }
    }

    return [...new Set(extractedNumbers)]; // Remove duplicates
  } catch (error) {
    return extractedNumbers;
  }
}

/**
 * Checks if a string contains multiple phone numbers
 */
export function hasMultiplePhoneNumbers(text: string): boolean {
  try {
    const numbers = extractPhoneNumbers(text);
    return numbers.length > 1;
  } catch (error) {
    return false;
  }
}

/**
 * Formats phone number with country code
 */
export function formatPhoneWithCountryCode(phone: string): string {
  try {
    const sanitized = sanitizePhoneNumber(phone);
    if (isValidIndianMobile(sanitized)) {
      return `+91${sanitized}`;
    }
    return phone;
  } catch (error) {
    return phone;
  }
}

/**
 * Checks if phone number starts with valid Indian prefix
 */
export function hasValidIndianPrefix(phone: string): boolean {
  try {
    const sanitized = sanitizePhoneNumber(phone);
    if (!sanitized || sanitized.length !== PHONE_LENGTH.INDIAN_MOBILE) {
      return false;
    }
    const firstDigit = parseInt(sanitized[0], 10);
    return firstDigit >= 6 && firstDigit <= 9;
  } catch (error) {
    return false;
  }
}
