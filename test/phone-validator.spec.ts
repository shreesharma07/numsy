/**
 * PhoneValidator Tests
 * Comprehensive test suite for phone number validation
 */

import { PhoneValidator } from '../src/core/PhoneValidator';
import { PhoneValidationResult } from '../src/common/interfaces';

describe('PhoneValidator', () => {
  let validator: PhoneValidator;

  beforeEach(() => {
    validator = new PhoneValidator({ enableLogging: false });
  });

  describe('validate', () => {
    it('should validate valid Indian mobile numbers', () => {
      const result: PhoneValidationResult = validator.validate('9876543210');

      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('9876543210');
      expect(result.reason).toBeUndefined();
    });

    it('should validate numbers with country code', () => {
      const result: PhoneValidationResult = validator.validate('+919876543210');

      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('9876543210');
    });

    it('should validate numbers with 91 prefix', () => {
      const result: PhoneValidationResult = validator.validate('919876543210');

      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('9876543210');
    });

    it('should reject invalid numbers', () => {
      const result: PhoneValidationResult = validator.validate('1234567890');

      expect(result.isValid).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should reject numbers that are too short', () => {
      const result: PhoneValidationResult = validator.validate('98765');

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Too short');
    });

    it('should reject empty phone numbers', () => {
      const result: PhoneValidationResult = validator.validate('');

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Empty or invalid phone number');
    });
  });

  describe('sanitize', () => {
    it('should remove non-digit characters', () => {
      const sanitized = validator.sanitize('+91-987-654-3210');

      expect(sanitized).toBe('9876543210');
    });

    it('should remove country code prefix', () => {
      const sanitized = validator.sanitize('919876543210');

      expect(sanitized).toBe('9876543210');
    });

    it('should handle empty strings', () => {
      const sanitized = validator.sanitize('');

      expect(sanitized).toBe('');
    });
  });

  describe('isValid', () => {
    it('should return true for valid numbers', () => {
      expect(validator.isValid('9876543210')).toBe(true);
      expect(validator.isValid('8123456789')).toBe(true);
      expect(validator.isValid('7987654321')).toBe(true);
      expect(validator.isValid('6765432109')).toBe(true);
    });

    it('should return false for invalid numbers', () => {
      expect(validator.isValid('1234567890')).toBe(false);
      expect(validator.isValid('5876543210')).toBe(false);
      expect(validator.isValid('98765')).toBe(false);
    });
  });

  describe('extractMultiple', () => {
    it('should extract multiple numbers from text', () => {
      const result = validator.extractMultiple('Call me at 9876543210 or 8123456789');

      expect(result.extractedNumbers).toHaveLength(2);
      expect(result.validNumbers).toHaveLength(2);
      expect(result.validNumbers).toContain('9876543210');
      expect(result.validNumbers).toContain('8123456789');
    });

    it('should handle text with no numbers', () => {
      const result = validator.extractMultiple('No numbers here');

      expect(result.extractedNumbers).toHaveLength(0);
      expect(result.validNumbers).toHaveLength(0);
    });

    it('should separate valid and invalid numbers', () => {
      const result = validator.extractMultiple('Valid: 9876543210, Invalid: 1234567890');

      expect(result.validNumbers).toHaveLength(1);
      expect(result.validNumbers).toContain('9876543210');
    });
  });

  describe('format', () => {
    it('should format number with country code', () => {
      const formatted = validator.format('9876543210', true);

      expect(formatted).toBe('+919876543210');
    });

    it('should format number without country code', () => {
      const formatted = validator.format('9876543210', false);

      expect(formatted).toBe('9876543210');
    });
  });

  describe('validateBatch', () => {
    it('should validate multiple numbers', () => {
      const numbers = ['9876543210', '8123456789', '1234567890'];
      const results = validator.validateBatch(numbers);

      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(false);
    });

    it('should handle empty array', () => {
      const results = validator.validateBatch([]);

      expect(results).toHaveLength(0);
    });
  });

  describe('detectPhoneColumn', () => {
    it('should detect phone column from data', () => {
      const data = [
        { name: 'John', phone: '9876543210', address: 'Mumbai' },
        { name: 'Jane', phone: '8123456789', address: 'Delhi' },
      ];

      const column = validator.detectPhoneColumn(data);

      expect(column).toBe('phone');
    });

    it('should detect mobile column', () => {
      const data = [{ name: 'John', mobile: '9876543210' }];

      const column = validator.detectPhoneColumn(data);

      expect(column).toBe('mobile');
    });

    it('should return null for data without phone column', () => {
      const data = [{ name: 'John', email: 'john@example.com' }];

      const column = validator.detectPhoneColumn(data);

      expect(column).toBeNull();
    });
  });
});
