import { Injectable, Logger } from '@nestjs/common';

/**
 * Comprehensive list of phone number field names
 * Covers various naming conventions used in different systems
 */
export const PHONE_NUMBER_FIELD_NAMES = [
  'phone',
  'phone number',
  'phone_number',
  'phonenumber',
  'mobile',
  'mobile number',
  'mobile_number',
  'mobilenumber',
  'contact',
  'contact number',
  'contact_number',
  'contactnumber',
  'telephone',
  'telephone number',
  'telephone_number',
  'tel',
  'tel number',
  'tel_number',
  'cell',
  'cell number',
  'cell_number',
  'cellphone',
  'cell phone',
  'cell_phone',
  'cellphone number',
  'cellphone_number',
  'user phone',
  'user_phone',
  'user mobile',
  'user_mobile',
  'user contact',
  'user contact number',
  'user_contact_number',
  'primary phone',
  'primary_phone',
  'primary mobile',
  'primary_mobile',
  'secondary phone',
  'secondary_phone',
  'secondary mobile',
  'secondary_mobile',
  'alternate phone',
  'alternate_phone',
  'alternate mobile',
  'alternate_mobile',
  'alt phone',
  'alt_phone',
  'alt mobile',
  'alt_mobile',
  'emergency phone',
  'emergency_phone',
  'emergency contact',
  'emergency contact number',
  'emergency_contact_number',
  'registered phone',
  'registered_phone',
  'registered mobile',
  'registered_mobile',
  'verified phone',
  'verified_phone',
  'verified mobile',
  'verified_mobile',
  'login phone',
  'login_phone',
  'login mobile',
  'login_mobile',
  'otp phone',
  'otp_phone',
  'otp mobile',
  'otp_mobile',
  'customer phone',
  'customer_phone',
  'customer mobile',
  'customer_mobile',
  'client phone',
  'client_phone',
  'client mobile',
  'client_mobile',
  'business phone',
  'business_phone',
  'business mobile',
  'business_mobile',
  'office phone',
  'office_phone',
  'office number',
  'office_number',
  'work phone',
  'work_phone',
  'work mobile',
  'work_mobile',
  'home phone',
  'home_phone',
  'home number',
  'home_number',
  'personal phone',
  'personal_phone',
  'personal mobile',
  'personal_mobile',
  'whatsapp',
  'whatsapp number',
  'whatsapp_number',
  'whatsapp mobile',
  'whatsapp_mobile',
  'contact mobile',
  'contact_mobile',
  'phone no',
  'phone no.',
  'phone_no',
  'mobile no',
  'mobile no.',
  'mobile_no',
  'contact no',
  'contact no.',
  'contact_no',
  'telephone no',
  'telephone_no',
  'tel no',
  'tel_no',
  'number',
  'mobile contact',
  'mobile_contact',
  'phone contact',
  'phone_contact',
  'call number',
  'call_number',
];

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
  totalFound: number;
  validCount: number;
  invalidCount: number;
}

/**
 * Service for validating and sanitizing Indian phone numbers
 * Handles 10-digit Indian phone numbers with various formats
 */
@Injectable()
export class PhoneValidatorService {
  private readonly logger = new Logger(PhoneValidatorService.name);

  /**
   * Validates and sanitizes a phone number
   * @param phoneNumber - The phone number to validate
   * @returns PhoneValidationResult object with validation details
   */
  validateAndSanitize(phoneNumber: string): PhoneValidationResult {
    const original = phoneNumber;

    // Check if input is null, undefined, or empty
    if (!phoneNumber || String(phoneNumber).trim() === '') {
      return {
        original: original || '',
        sanitized: '',
        isValid: false,
        reason: 'Empty or null value',
      };
    }

    // Convert to string if not already
    const phoneStr = String(phoneNumber).trim();

    // Remove common separators: spaces, hyphens, parentheses, dots
    let sanitized = phoneStr
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/-/g, '') // Remove hyphens
      .replace(/\(/g, '') // Remove opening parentheses
      .replace(/\)/g, '') // Remove closing parentheses
      .replace(/\./g, '') // Remove dots
      .replace(/\+/g, ''); // Remove plus signs

    // Remove country code if present (91 for India)
    // Handle various formats: 91XXXXXXXXXX, 0091XXXXXXXXXX
    if (sanitized.startsWith('0091') && sanitized.length >= 14) {
      sanitized = sanitized.substring(4);
    } else if (sanitized.startsWith('91') && sanitized.length === 12) {
      sanitized = sanitized.substring(2);
    } else if (sanitized.startsWith('0') && sanitized.length === 11) {
      // Handle leading zero (some formats have 0 before 10 digits)
      sanitized = sanitized.substring(1);
    }

    // Check if it's exactly 10 digits
    if (!/^\d{10}$/.test(sanitized)) {
      return {
        original,
        sanitized,
        isValid: false,
        reason: `Invalid format - must be 10 digits, got ${sanitized.length} characters`,
      };
    }

    // Validate Indian phone number patterns
    // Indian mobile numbers start with 6, 7, 8, or 9
    const firstDigit = sanitized.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return {
        original,
        sanitized,
        isValid: false,
        reason: 'Indian mobile numbers must start with 6, 7, 8, or 9',
      };
    }

    // Check for suspicious patterns (all same digits)
    if (/^(\d)\1{9}$/.test(sanitized)) {
      return {
        original,
        sanitized,
        isValid: false,
        reason: 'Invalid pattern - all digits are the same',
      };
    }

    // Valid number
    this.logger.debug(`Validated number: ${original} -> ${sanitized}`);
    return {
      original,
      sanitized,
      isValid: true,
    };
  }

  /**
   * Extracts multiple phone numbers from a single string
   * Handles separators: /, -, space
   * @param phoneString - String containing one or more phone numbers
   * @returns MultipleNumbersResult with extracted and validated numbers
   */
  extractMultipleNumbers(phoneString: string): MultipleNumbersResult {
    const originalValue = phoneString;

    if (!phoneString || typeof phoneString !== 'string') {
      return {
        originalValue: phoneString || '',
        extractedNumbers: [],
        validNumbers: [],
        invalidNumbers: [],
        totalFound: 0,
        validCount: 0,
        invalidCount: 0,
      };
    }

    // Split by common separators: /, comma, or multiple spaces (but not single space within number)
    // First, replace / and , with a unique delimiter
    const normalized = phoneString.replace(/[\/,]/g, '|');

    // Split by the delimiter or by 2+ spaces (to avoid splitting numbers with single space)
    const parts = normalized.split(/\||\s{2,}/).filter((part) => part.trim().length > 0);

    const extractedNumbers: string[] = [];
    const validNumbers: PhoneValidationResult[] = [];
    const invalidNumbers: PhoneValidationResult[] = [];

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.length === 0) continue;

      // Check if this part looks like a phone number (contains digits)
      if (/\d/.test(trimmed)) {
        extractedNumbers.push(trimmed);
        const validation = this.validateAndSanitize(trimmed);

        if (validation.isValid) {
          validNumbers.push(validation);
        } else {
          invalidNumbers.push(validation);
        }
      }
    }

    this.logger.debug(
      `Extracted ${extractedNumbers.length} numbers from: "${originalValue.substring(0, 50)}"`,
    );

    return {
      originalValue,
      extractedNumbers,
      validNumbers,
      invalidNumbers,
      totalFound: extractedNumbers.length,
      validCount: validNumbers.length,
      invalidCount: invalidNumbers.length,
    };
  }

  /**
   * Batch validates multiple phone numbers
   * @param phoneNumbers - Array of phone numbers to validate
   * @returns Array of PhoneValidationResult objects
   */
  validateBatch(phoneNumbers: string[]): PhoneValidationResult[] {
    return phoneNumbers.map((phone) => this.validateAndSanitize(phone));
  }

  /**
   * Detects which column in a data array likely contains phone numbers
   * Uses comprehensive field name matching with regex patterns
   * @param data - Array of data rows (objects)
   * @returns The field name most likely to contain phone numbers, or null
   */
  detectPhoneColumn(data: Record<string, any>[]): string | null {
    if (!data || data.length === 0) {
      this.logger.warn('No data provided for phone column detection');
      return null;
    }

    const sampleSize = Math.min(20, data.length);
    const sample = data.slice(0, sampleSize);

    let bestMatch: { field: string | null; score: number } = { field: null, score: 0 };

    // Check each field in the first row
    const firstRow = data[0];
    if (!firstRow || typeof firstRow !== 'object') {
      this.logger.warn('Invalid data format for phone column detection');
      return null;
    }
    const allFields = Object.keys(firstRow);

    for (const field of allFields) {
      const fieldLower = field.toLowerCase().trim();
      const fieldNormalized = fieldLower.replace(/[^a-z0-9]/g, '');
      let score = 0;

      // Exact match with comprehensive field names list (highest priority)
      if (PHONE_NUMBER_FIELD_NAMES.includes(fieldLower)) {
        score += 50;
        this.logger.debug(`Field "${field}" - Exact match in field names list (+50)`);
      } else {
        // Check normalized version (without special characters)
        const normalizedMatch = PHONE_NUMBER_FIELD_NAMES.some(
          (candidate) => candidate.replace(/[^a-z0-9]/g, '') === fieldNormalized,
        );
        if (normalizedMatch) {
          score += 40;
          this.logger.debug(`Field "${field}" - Normalized match (+40)`);
        }
      }

      // Pattern matching with regex for common keywords
      const phoneKeywords = [
        /^phone/i,
        /^mobile/i,
        /^contact/i,
        /^tel/i,
        /^cell/i,
        /^whatsapp/i,
        /phone$/i,
        /mobile$/i,
        /number$/i,
      ];

      for (const pattern of phoneKeywords) {
        if (pattern.test(fieldLower)) {
          score += 15;
          this.logger.debug(`Field "${field}" - Keyword pattern match: ${pattern} (+15)`);
          break; // Only count once
        }
      }

      // Check how many values in this field are valid phone numbers
      let validCount = 0;
      let numericCount = 0;

      for (const row of sample) {
        const value = row[field];
        if (value) {
          const valueStr = String(value).trim();

          // Check if contains digits
          if (/\d/.test(valueStr)) {
            numericCount++;
          }

          // Try to extract and validate numbers
          const extraction = this.extractMultipleNumbers(valueStr);
          if (extraction.validCount > 0) {
            validCount += extraction.validCount;
          }
        }
      }

      // Bonus for having numeric content
      if (numericCount > sampleSize * 0.5) {
        score += 10;
        this.logger.debug(`Field "${field}" - High numeric content (+10)`);
      }

      // Calculate percentage of valid phone numbers
      const validPercentage = (validCount / sampleSize) * 100;
      score += validPercentage;

      this.logger.debug(
        `Field "${field}": ${validCount} valid numbers in ${sampleSize} samples (total score: ${score.toFixed(1)})`,
      );

      if (score > bestMatch.score) {
        bestMatch = { field, score };
      }
    }

    // Return the field if score is above threshold
    if (bestMatch.score >= 20) {
      this.logger.log(
        `✓ Detected phone column: "${bestMatch.field}" (score: ${bestMatch.score.toFixed(1)})`,
      );
      return bestMatch.field;
    }

    this.logger.warn('⚠ Could not reliably detect phone column. Please check your file format.');
    return null;
  }
}
