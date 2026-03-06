/**
 * Parser Tests
 * Comprehensive test suite for file parsing
 */

import { Parser } from '../src/core/Parser';
import * as fs from 'fs';
import * as path from 'path';

describe('Parser', () => {
  let parser: Parser;
  const testDataDir = path.join(__dirname, '..', 'Temp');

  beforeEach(() => {
    parser = new Parser({ enableLogging: false });
  });

  describe('parseFile', () => {
    it('should parse CSV files', async () => {
      const csvPath = path.join(testDataDir, 'sample-data.csv');

      if (!fs.existsSync(csvPath)) {
        console.warn('Test file not found, skipping test');
        return;
      }

      const result = await parser.parseFile(csvPath);

      expect(result.data).toBeDefined();
      expect(result.totalRows).toBeGreaterThan(0);
      expect(result.detectedColumns).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should throw error for non-existent files', async () => {
      const nonExistentPath = path.join(testDataDir, 'non-existent.csv');

      await expect(parser.parseFile(nonExistentPath)).rejects.toThrow();
    });

    it('should throw error for unsupported file formats', async () => {
      const unsupportedPath = path.join(testDataDir, 'test.txt');

      // Create a temporary txt file for testing
      if (!fs.existsSync(testDataDir)) {
        fs.mkdirSync(testDataDir, { recursive: true });
      }
      fs.writeFileSync(unsupportedPath, 'test content');

      await expect(parser.parseFile(unsupportedPath)).rejects.toThrow();

      // Cleanup
      if (fs.existsSync(unsupportedPath)) {
        fs.unlinkSync(unsupportedPath);
      }
    });
  });

  describe('writeCsv', () => {
    const outputPath = path.join(testDataDir, 'test-output.csv');

    afterEach(() => {
      // Cleanup
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });

    it('should write data to CSV', async () => {
      const data = [
        { name: 'John', phone: '9876543210', address: 'Mumbai' },
        { name: 'Jane', phone: '8123456789', address: 'Delhi' },
      ];

      await parser.writeCsv(data, outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it('should throw error for empty data', async () => {
      await expect(parser.writeCsv([], outputPath)).rejects.toThrow();
    });
  });

  describe('detectPhoneColumn', () => {
    it('should detect phone column', () => {
      const data = [{ name: 'John', phone: '9876543210' }];

      const column = parser.detectPhoneColumn(data);

      expect(column).toBe('phone');
    });

    it('should detect phone column with variations', () => {
      const variations = [
        { customer_phone: '9876543210' },
        { 'mobile number': '8123456789' },
        { contact: '7987654321' },
        { whatsapp: '6765432109' },
      ];

      variations.forEach((data) => {
        const column = parser.detectPhoneColumn([data]);
        expect(column).toBeDefined();
        expect(column).not.toBeNull();
      });
    });

    it('should return null for empty data', () => {
      const column = parser.detectPhoneColumn([]);

      expect(column).toBeNull();
    });
  });

  describe('options', () => {
    it('should set and get options', () => {
      const options = {
        enableLogging: true,
        logLevel: 'debug' as const,
      };

      parser.setOptions(options);
      const currentOptions = parser.getOptions();

      expect(currentOptions.enableLogging).toBe(true);
      expect(currentOptions.logLevel).toBe('debug');
    });
  });
});
