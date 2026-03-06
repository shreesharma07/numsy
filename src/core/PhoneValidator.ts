/**
 * PhoneValidator Class
 * Handles phone number validation and sanitization
 */

import { PhoneValidationResult, MultipleNumbersResult, ParsedDataRow } from '../common/interfaces';
import { LoggerHelper, AppError, isNonEmptyString, isValidArray } from '../common/helpers';
import {
  sanitizePhoneNumber,
  validatePhoneNumber,
  extractPhoneNumbers,
  isValidIndianMobile,
  hasMultiplePhoneNumbers,
  formatPhoneWithCountryCode,
} from '../common/functions';
import { NumsyOptions } from '../common/interfaces';

/**
 * PhoneValidator class for phone number validation operations
 */
export class PhoneValidator {
  private logger: LoggerHelper;
  private options: NumsyOptions;

  constructor(options?: NumsyOptions) {
    this.options = {
      enableLogging: options?.enableLogging ?? true,
      logLevel: options?.logLevel ?? 'log',
      throwOnError: options?.throwOnError ?? false,
    };

    this.logger = new LoggerHelper('PhoneValidator', {
      level: this.options.logLevel,
      timestamp: true,
    });

    if (this.options.enableLogging) {
      this.logger.log('PhoneValidator initialized');
    }
  }

  /**
   * Validates a single phone number
   */
  validate(phone: string): PhoneValidationResult {
    try {
      const result = validatePhoneNumber(phone);

      if (this.options.enableLogging) {
        if (result.isValid) {
          this.logger.debug(`Valid phone: ${result.sanitized}`);
        } else {
          this.logger.debug(`Invalid phone: ${phone} - ${result.reason}`);
        }
      }

      return result;
    } catch (error) {
      this.logger.error('Error validating phone number', String(error));
      if (this.options.throwOnError) {
        throw new AppError('Phone validation failed', 'VALIDATION_ERROR');
      }
      return {
        original: phone,
        sanitized: '',
        isValid: false,
        reason: 'Validation error',
      };
    }
  }

  /**
   * Sanitizes a phone number
   */
  sanitize(phone: string): string {
    try {
      return sanitizePhoneNumber(phone);
    } catch (error) {
      this.logger.error('Error sanitizing phone number', String(error));
      return '';
    }
  }

  /**
   * Checks if a phone number is valid
   */
  isValid(phone: string): boolean {
    try {
      return isValidIndianMobile(phone);
    } catch (error) {
      this.logger.error('Error checking phone validity', String(error));
      return false;
    }
  }

  /**
   * Extracts multiple phone numbers from a string
   */
  extractMultiple(text: string): MultipleNumbersResult {
    const result: MultipleNumbersResult = {
      originalValue: text,
      extractedNumbers: [],
      validNumbers: [],
      invalidNumbers: [],
    };

    try {
      if (!isNonEmptyString(text)) {
        return result;
      }

      const extracted = extractPhoneNumbers(text);
      result.extractedNumbers = extracted;

      for (const number of extracted) {
        const validation = this.validate(number);
        if (validation.isValid) {
          result.validNumbers.push(validation.sanitized);
        } else {
          result.invalidNumbers.push(number);
        }
      }

      this.logger.debug(
        `Extracted ${result.extractedNumbers.length} numbers (${result.validNumbers.length} valid)`,
      );

      return result;
    } catch (error) {
      this.logger.error('Error extracting multiple numbers', String(error));
      return result;
    }
  }

  /**
   * Checks if text contains multiple phone numbers
   */
  hasMultiple(text: string): boolean {
    try {
      return hasMultiplePhoneNumbers(text);
    } catch (error) {
      this.logger.error('Error checking multiple numbers', String(error));
      return false;
    }
  }

  /**
   * Formats phone number with country code
   */
  format(phone: string, withCountryCode: boolean = false): string {
    try {
      if (withCountryCode) {
        return formatPhoneWithCountryCode(phone);
      }
      return sanitizePhoneNumber(phone);
    } catch (error) {
      this.logger.error('Error formatting phone number', String(error));
      return phone;
    }
  }

  /**
   * Validates multiple phone numbers
   */
  validateBatch(phones: string[]): PhoneValidationResult[] {
    const results: PhoneValidationResult[] = [];

    try {
      if (!isValidArray(phones)) {
        return results;
      }

      for (const phone of phones) {
        results.push(this.validate(phone));
      }

      const validCount = results.filter((r) => r.isValid).length;
      this.logger.log(`Batch validation complete: ${validCount}/${phones.length} valid`);

      return results;
    } catch (error) {
      this.logger.error('Error in batch validation', String(error));
      return results;
    }
  }

  /**
   * Detects phone column from data
   */
  detectPhoneColumn(data: ParsedDataRow[]): string | null {
    try {
      if (!isValidArray(data) || data.length === 0) {
        this.logger.warn('No data provided for phone column detection');
        return null;
      }

      const firstRow = data[0];
      const keys = Object.keys(firstRow);

      // Try common phone field names
      const commonNames = [
        'phone',
        'mobile',
        'contact',
        'telephone',
        'number',
        'phone_number',
        'mobile_number',
      ];

      for (const key of keys) {
        const keyLower = key.toLowerCase().trim();
        if (commonNames.some((name) => keyLower.includes(name))) {
          this.logger.log(`Detected phone column: ${key}`);
          return key;
        }
      }

      // If no match found, check for columns with phone-like values
      for (const key of keys) {
        const value = firstRow[key];
        if (isNonEmptyString(value)) {
          const sanitized = sanitizePhoneNumber(value);
          if (sanitized.length >= 10) {
            this.logger.log(`Detected phone column by content: ${key}`);
            return key;
          }
        }
      }

      this.logger.warn('Could not detect phone column');
      return null;
    } catch (error) {
      this.logger.error('Error detecting phone column', String(error));
      return null;
    }
  }

  /**
   * Sets validator options
   */
  setOptions(options: Partial<NumsyOptions>): void {
    try {
      this.options = { ...this.options, ...options };
      this.logger.log('PhoneValidator options updated');
    } catch (error) {
      this.logger.error('Error setting options', String(error));
    }
  }

  /**
   * Gets current validator options
   */
  getOptions(): NumsyOptions {
    return { ...this.options };
  }
}
