/**
 * Numsy Integration Tests
 * End-to-end tests for the main Numsy class
 */

import { Numsy } from '../src/core/Numsy';

describe('Numsy Integration Tests', () => {
  let numsy: Numsy;

  beforeEach(() => {
    numsy = new Numsy({ enableLogging: false });
  });

  describe('Initialization', () => {
    it('should create instance with default options', () => {
      const instance = new Numsy();

      expect(instance).toBeDefined();
      expect(instance.getOptions()).toBeDefined();
    });

    it('should create instance with custom options', () => {
      const instance = new Numsy({
        enableLogging: true,
        logLevel: 'debug',
        throwOnError: true,
      });

      const options = instance.getOptions();
      expect(options.enableLogging).toBe(true);
      expect(options.logLevel).toBe('debug');
      expect(options.throwOnError).toBe(true);
    });
  });

  describe('Phone Validation', () => {
    it('should validate phone numbers', () => {
      const result = numsy.validate('9876543210');

      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('9876543210');
    });

    it('should reject dummy numbers with final regex validation', () => {
      const result = numsy.validate('9999999999');

      expect(result.isValid).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should sanitize phone numbers', () => {
      const sanitized = numsy.sanitize('+91-987-654-3210');

      expect(sanitized).toBe('9876543210');
    });

    it('should check if number is valid', () => {
      expect(numsy.isValid('9876543210')).toBe(true);
      expect(numsy.isValid('1234567890')).toBe(false);
    });

    it('should format phone numbers', () => {
      const formatted = numsy.format('9876543210', true);

      expect(formatted).toBe('+919876543210');
    });

    it('should extract multiple numbers', () => {
      const result = numsy.extractMultiple('Call 9876543210 or 8123456789');

      expect(result.extractedNumbers).toHaveLength(2);
      expect(result.validNumbers).toHaveLength(2);
    });

    it('should filter out invalid patterns when extracting', () => {
      const result = numsy.extractMultiple('Valid: 9876543210, 8123456789. Dummy: 1111111111');

      expect(result.validNumbers).toContain('9876543210');
      expect(result.validNumbers).toContain('8123456789');
      expect(result.validNumbers).not.toContain('1111111111');
    });

    it('should validate batch of numbers', () => {
      const numbers = ['9876543210', '8123456789', '1234567890'];
      const results = numsy.validateBatch(numbers);

      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(false);
    });
  });

  describe('Component Access', () => {
    it('should provide access to Parser', () => {
      const parser = numsy.getParser();

      expect(parser).toBeDefined();
    });

    it('should provide access to PhoneValidator', () => {
      const validator = numsy.getValidator();

      expect(validator).toBeDefined();
    });

    it('should provide access to FileProcessor', () => {
      const processor = numsy.getProcessor();

      expect(processor).toBeDefined();
    });
  });

  describe('Options Management', () => {
    it('should update options', () => {
      numsy.setOptions({ enableLogging: true });

      const options = numsy.getOptions();
      expect(options.enableLogging).toBe(true);
    });
  });

  describe('Data Operations', () => {
    it('should detect phone column from data', () => {
      const data = [
        { name: 'John', phone: '9876543210' },
        { name: 'Jane', mobile: '8123456789' },
      ];

      const column = numsy.detectPhoneColumn(data);

      expect(column).toBe('phone');
    });
  });
});
