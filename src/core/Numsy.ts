/**
 * Numsy - Main Class
 * The primary interface for the number processor package
 * Provides a unified API for phone number processing
 */

import { Parser } from './Parser';
import { PhoneValidator } from './PhoneValidator';
import { FileProcessor } from './FileProcessor';
import {
  NumsyOptions,
  PhoneValidationResult,
  MultipleNumbersResult,
  ProcessingResult,
  FileParseResult,
  ParsedDataRow,
} from '../common/interfaces';
import { LoggerHelper } from '../common/helpers';

/**
 * Numsy class - Main entry point for the package
 */
export class Numsy {
  private logger: LoggerHelper;
  private parser: Parser;
  private validator: PhoneValidator;
  private processor: FileProcessor;
  private options: NumsyOptions;

  constructor(options?: NumsyOptions) {
    this.options = {
      enableLogging: options?.enableLogging ?? true,
      logLevel: options?.logLevel ?? 'log',
      throwOnError: options?.throwOnError ?? false,
    };

    this.logger = new LoggerHelper('Numsy', {
      level: this.options.logLevel,
      timestamp: true,
    });

    // Initialize core components
    this.parser = new Parser(this.options);
    this.validator = new PhoneValidator(this.options);
    this.processor = new FileProcessor();

    if (this.options.enableLogging) {
      this.logger.log('Numsy initialized successfully');
    }
  }

  // ==================== File Operations ====================

  /**
   * Parse a file (CSV or Excel)
   */
  async parseFile(filePath: string): Promise<FileParseResult> {
    try {
      return await this.parser.parseFile(filePath);
    } catch (error) {
      this.logger.error('Error parsing file', String(error));
      throw error;
    }
  }

  /**
   * Process a file with phone number validation
   */
  async processFile(filePath: string, outputDir?: string): Promise<ProcessingResult> {
    try {
      return await this.processor.processFile(filePath, outputDir);
    } catch (error) {
      this.logger.error('Error processing file', String(error));
      throw error;
    }
  }

  /**
   * Write data to CSV file
   */
  async writeCsv(data: ParsedDataRow[], outputPath: string): Promise<void> {
    try {
      await this.parser.writeCsv(data, outputPath);
    } catch (error) {
      this.logger.error('Error writing CSV', String(error));
      throw error;
    }
  }

  // ==================== Phone Validation Operations ====================

  /**
   * Validate a single phone number
   */
  validate(phone: string): PhoneValidationResult {
    try {
      return this.validator.validate(phone);
    } catch (error) {
      this.logger.error('Error validating phone', String(error));
      throw error;
    }
  }

  /**
   * Validate multiple phone numbers
   */
  validateBatch(phones: string[]): PhoneValidationResult[] {
    try {
      return this.validator.validateBatch(phones);
    } catch (error) {
      this.logger.error('Error in batch validation', String(error));
      throw error;
    }
  }

  /**
   * Sanitize a phone number
   */
  sanitize(phone: string): string {
    try {
      return this.validator.sanitize(phone);
    } catch (error) {
      this.logger.error('Error sanitizing phone', String(error));
      throw error;
    }
  }

  /**
   * Check if a phone number is valid
   */
  isValid(phone: string): boolean {
    try {
      return this.validator.isValid(phone);
    } catch (error) {
      this.logger.error('Error checking validity', String(error));
      return false;
    }
  }

  /**
   * Extract multiple phone numbers from text
   */
  extractMultiple(text: string): MultipleNumbersResult {
    try {
      return this.validator.extractMultiple(text);
    } catch (error) {
      this.logger.error('Error extracting numbers', String(error));
      throw error;
    }
  }

  /**
   * Format phone number
   */
  format(phone: string, withCountryCode: boolean = false): string {
    try {
      return this.validator.format(phone, withCountryCode);
    } catch (error) {
      this.logger.error('Error formatting phone', String(error));
      throw error;
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Detect phone column from data
   */
  detectPhoneColumn(data: ParsedDataRow[]): string | null {
    try {
      return this.validator.detectPhoneColumn(data);
    } catch (error) {
      this.logger.error('Error detecting phone column', String(error));
      return null;
    }
  }

  /**
   * Get parser instance
   */
  getParser(): Parser {
    return this.parser;
  }

  /**
   * Get validator instance
   */
  getValidator(): PhoneValidator {
    return this.validator;
  }

  /**
   * Get processor instance
   */
  getProcessor(): FileProcessor {
    return this.processor;
  }

  /**
   * Set options
   */
  setOptions(options: Partial<NumsyOptions>): void {
    try {
      this.options = { ...this.options, ...options };

      // Update options for all components
      this.parser.setOptions(options);
      this.validator.setOptions(options);

      this.logger.log('Options updated');
    } catch (error) {
      this.logger.error('Error setting options', String(error));
    }
  }

  /**
   * Get current options
   */
  getOptions(): NumsyOptions {
    return { ...this.options };
  }
}

// Export default instance for convenience
export default Numsy;
