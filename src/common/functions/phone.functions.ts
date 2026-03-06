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

/**
 * Performs comprehensive final regex validation on a phone number
 * This is the ultimate validation check before accepting a number
 */
export function finalRegexValidation(phone: string): {
  isValid: boolean;
  sanitized: string;
  reason?: string;
} {
  const result = {
    isValid: false,
    sanitized: '',
    reason: undefined as string | undefined,
  };

  try {
    // Step 1: Sanitize the phone number
    const sanitized = sanitizePhoneNumber(phone);
    result.sanitized = sanitized;

    if (!sanitized) {
      result.reason = 'No digits found after sanitization';
      return result;
    }

    // Step 2: Check exact length (must be exactly 10 digits)
    if (sanitized.length !== PHONE_LENGTH.INDIAN_MOBILE) {
      result.reason = `Invalid length: ${sanitized.length} digits (expected 10)`;
      return result;
    }

    // Step 3: Check if starts with valid Indian mobile prefix (6-9)
    const firstDigit = sanitized.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      result.reason = `Invalid prefix: ${firstDigit} (must start with 6, 7, 8, or 9)`;
      return result;
    }

    // Step 4: Check against primary Indian mobile pattern
    if (!PHONE_PATTERNS.INDIAN_MOBILE.test(sanitized)) {
      result.reason = 'Failed primary pattern validation';
      return result;
    }

    // Step 5: Check for invalid patterns (all same digits)
    const allSameDigits = /^(\d)\1{9}$/.test(sanitized);
    if (allSameDigits) {
      result.reason = 'Invalid pattern: all digits are the same';
      return result;
    }

    // Step 6: Check for sequential patterns (ascending only)
    const isSequential = sanitized === '0123456789' || sanitized === '1234567890';
    if (isSequential) {
      result.reason = 'Invalid pattern: sequential digits';
      return result;
    }

    // Step 7: Check for obvious test/dummy numbers
    const isDummyNumber = [
      '1111111111',
      '2222222222',
      '3333333333',
      '4444444444',
      '5555555555',
      '6666666666',
      '7777777777',
      '8888888888',
      '9999999999',
      '0000000000',
      '1234512345',
      '9999900000',
      '0000099999',
    ].includes(sanitized);

    if (isDummyNumber) {
      result.reason = 'Invalid pattern: dummy/test number detected';
      return result;
    }

    // Step 8: Additional pattern validation - strong regex check
    const strongPattern = /^[6-9]{1}[0-9]{9}$/;
    if (!strongPattern.test(sanitized)) {
      result.reason = 'Failed strong pattern validation';
      return result;
    }

    // Step 9: Check that not all digits in the remaining 9 are the same
    const remainingDigits = sanitized.substring(1);
    const allRemainingSame = /^(\d)\1{8}$/.test(remainingDigits);
    if (allRemainingSame) {
      result.reason = 'Invalid pattern: repeating digits after prefix';
      return result;
    }

    // All validations passed
    result.isValid = true;
    result.reason = undefined;
    return result;
  } catch (error) {
    result.reason = 'Error during final validation';
    return result;
  }
}

/**
 * Enhanced phone number extraction with final regex validation
 * Extracts and validates all phone numbers from a string
 */
export function extractAndValidatePhoneNumbers(text: string): {
  allExtracted: string[];
  validNumbers: string[];
  invalidNumbers: Array<{ number: string; reason: string }>;
} {
  const resultData = {
    allExtracted: [] as string[],
    validNumbers: [] as string[],
    invalidNumbers: [] as Array<{ number: string; reason: string }>,
  };

  try {
    if (!isNonEmptyString(text)) {
      return resultData;
    }

    const textStr = String(text).trim();
    const potentialNumbers = textStr.match(PHONE_PATTERNS.EXTRACT_DIGITS);

    if (!potentialNumbers) {
      return resultData;
    }

    const seenNumbers = new Set<string>();

    for (const numStr of potentialNumbers) {
      const sanitized = sanitizePhoneNumber(numStr);

      // Skip if empty or already processed
      if (!sanitized || seenNumbers.has(sanitized)) {
        continue;
      }

      // Only process numbers that could be valid (10 digits)
      if (sanitized.length === PHONE_LENGTH.INDIAN_MOBILE) {
        resultData.allExtracted.push(sanitized);
        seenNumbers.add(sanitized);

        // Perform final regex validation
        const validation = finalRegexValidation(sanitized);

        if (validation.isValid) {
          resultData.validNumbers.push(validation.sanitized);
        } else {
          resultData.invalidNumbers.push({
            number: sanitized,
            reason: validation.reason || 'Unknown validation failure',
          });
        }
      }
    }

    return resultData;
  } catch (error) {
    return resultData;
  }
}
