/**
 * FileProcessor Class
 * Coordinates file parsing, phone validation, and output generation
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import archiver from 'archiver';
import { createObjectCsvWriter } from 'csv-writer';
import {
  AnalysisReport,
  AnalyzeOptions,
  ProcessingResult,
  ProcessedRow,
  ParsedDataRow,
  ProcessingOptions,
  ProcessingAnalytics,
  UniqueNumber,
} from '../common/interfaces';
import { LoggerHelper, AppError, ensureDirectory } from '../common/helpers';
import { Parser } from './Parser';
import { PhoneValidator } from './PhoneValidator';
import { findMatchingField, COLUMN_ALIASES } from '../common/functions';

/**
 * Percentage helper that never returns NaN/Infinity
 */
const percent = (part: number, whole: number): string =>
  whole > 0 ? ((part / whole) * 100).toFixed(2) : '0.00';

/**
 * FileProcessor class for processing files with phone number validation
 */
export class FileProcessor {
  private logger: LoggerHelper;
  private parser: Parser;
  private validator: PhoneValidator;
  private options: ProcessingOptions;

  constructor(options?: ProcessingOptions) {
    this.options = {
      outputDir: options?.outputDir ?? './output',
      preserveOriginalColumns: options?.preserveOriginalColumns ?? true,
      validateNumbers: options?.validateNumbers ?? true,
      enableLogging: options?.enableLogging ?? true,
      logLevel: options?.logLevel ?? 'log',
      throwOnError: options?.throwOnError ?? false,
      normalizeColumns: options?.normalizeColumns ?? true,
    };

    const shared = {
      enableLogging: this.options.enableLogging,
      logLevel: this.options.logLevel,
      throwOnError: this.options.throwOnError,
      normalizeColumns: this.options.normalizeColumns,
    };

    this.logger = new LoggerHelper('FileProcessor', {
      level: this.options.logLevel,
      enabled: this.options.enableLogging,
    });
    this.parser = new Parser(shared);
    this.validator = new PhoneValidator(shared);

    this.logger.log('FileProcessor initialized');
  }

  /**
   * Parses and analyses a file entirely in memory — nothing is written to disk
   */
  async analyzeFile(filePath: string, options?: AnalyzeOptions): Promise<AnalysisReport> {
    const parseResult = await this.parser.parseFile(filePath);
    this.logger.log(`Parsed ${parseResult.totalRows} rows`);

    const report = this.analyze(parseResult.data, options);
    report.source = filePath;
    return report;
  }

  /**
   * Validates, extracts and de-duplicates phone numbers from already-parsed rows
   */
  analyze(data: ParsedDataRow[], options?: AnalyzeOptions): AnalysisReport {
    if (!data || data.length === 0) {
      throw new AppError('No data found in the uploaded file', 'NO_DATA');
    }

    const phoneColumn = options?.phoneColumn ?? this.validator.detectPhoneColumn(data);
    if (!phoneColumn) {
      throw new AppError(
        'Could not detect a valid phone number column in the file',
        'NO_PHONE_COLUMN',
      );
    }
    if (!(phoneColumn in data[0])) {
      throw new AppError(
        `Column "${phoneColumn}" not found. Available: ${Object.keys(data[0]).join(', ')}`,
        'NO_PHONE_COLUMN',
      );
    }
    this.logger.log(`Using phone column: "${phoneColumn}"`);

    const nameColumn =
      options?.nameColumn === undefined ? this.detectNameColumn(data) : options.nameColumn;
    if (nameColumn) {
      this.logger.log(`Detected name column: "${nameColumn}"`);
    } else {
      this.logger.log('No name column detected');
    }

    const { rows, validRows, invalidRows, analytics, unique } = this.processRows(
      data,
      phoneColumn,
      nameColumn,
    );

    return {
      phoneColumn,
      nameColumn: nameColumn || undefined,
      totalRecords: data.length,
      rows,
      validRows,
      invalidRows,
      unique,
      analytics,
    };
  }

  /**
   * Processes a file and writes the classic report bundle (CSVs, analytics, ZIP) to disk
   */
  async processFile(filePath: string, outputDir?: string): Promise<ProcessingResult> {
    const outputDirectory = outputDir || this.options.outputDir!;

    try {
      this.logger.log(`Starting file processing: ${filePath}`);

      // Ensure output directory exists
      ensureDirectory(outputDirectory);

      const report = await this.analyzeFile(filePath);
      const { phoneColumn, nameColumn, validRows, invalidRows, analytics, unique } = report;

      // Generate output file paths using original filename
      const originalFileName = path.basename(filePath, path.extname(filePath));
      const timestamp = Date.now();

      // ZIP file name without timestamp
      const zipFileName = `${originalFileName}_numsy_report`;

      // Individual files with timestamp for uniqueness
      const baseFileName = `${originalFileName}_numsy_report_${timestamp}`;

      const validFilePath = path.join(outputDirectory, `${baseFileName}_valid_phone_report.csv`);
      const invalidFilePath = path.join(outputDirectory, `${baseFileName}_invalid_report.csv`);
      const uniqueNumbersFilePath = path.join(
        outputDirectory,
        `${originalFileName}_unique_numsy_nos.csv`,
      );
      const analyticsFilePath = path.join(outputDirectory, `${baseFileName}_analytics.txt`);
      const zipFilePath = path.join(outputDirectory, `${zipFileName}.zip`);

      // Write CSV files
      await this.parser.writeProcessedFiles(validRows, invalidRows, validFilePath, invalidFilePath);

      // Write unique numbers file
      await this.writeUniqueNumbersFile(unique, uniqueNumbersFilePath, nameColumn);

      // Generate analytics file
      await this.generateAnalyticsFile(
        analyticsFilePath,
        analytics,
        report.totalRecords,
        phoneColumn,
        nameColumn,
      );

      // Create ZIP file
      await this.createZipFile(
        [
          { path: validFilePath, name: 'valid_phone_report.csv' },
          { path: invalidFilePath, name: 'invalid_report.csv' },
          { path: uniqueNumbersFilePath, name: `${originalFileName}_unique_numsy_nos.csv` },
          { path: analyticsFilePath, name: 'analytics.txt' },
        ],
        zipFilePath,
      );

      const result: ProcessingResult = {
        totalRecords: report.totalRecords,
        validRecords: validRows.length,
        invalidRecords: invalidRows.length,
        phoneColumn,
        nameColumn,
        zipFilePath,
        validFilePath,
        invalidFilePath,
        uniqueNumbersFilePath,
        analyticsFilePath,
        analytics,
      };

      this.logger.log(
        `Processing complete: ${result.validRecords} valid, ${result.invalidRecords} invalid, ${analytics.uniqueValidNumbers} unique`,
      );

      return result;
    } catch (error) {
      this.logger.error('Error processing file', String(error));
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to process file', 'PROCESSING_ERROR');
    }
  }

  /**
   * Processes data rows and validates phone numbers
   */
  private processRows(
    data: ParsedDataRow[],
    phoneColumn: string,
    nameColumn?: string | null,
  ): {
    rows: ProcessedRow[];
    validRows: ProcessedRow[];
    invalidRows: ProcessedRow[];
    analytics: ProcessingAnalytics;
    unique: UniqueNumber[];
  } {
    const rows: ProcessedRow[] = [];
    const validRows: ProcessedRow[] = [];
    const invalidRows: ProcessedRow[] = [];
    const uniqueValidNumbers = new Map<string, UniqueNumber>();
    let totalValidNumbers = 0;
    let recordsWithMultipleNumbers = 0;
    let totalNumbersExtracted = 0;

    const pushInvalid = (row: ProcessedRow) => {
      invalidRows.push(row);
      rows.push(row);
    };

    try {
      for (const row of data) {
        const phoneValue = row[phoneColumn];
        const nameValue = nameColumn ? row[nameColumn] : undefined;

        if (phoneValue === undefined || phoneValue === null || String(phoneValue).trim() === '') {
          pushInvalid({
            ...row,
            validationStatus: 'INVALID',
            validationReason: 'Empty phone number',
            originalPhone: '',
            sanitizedPhone: '',
            numbersExtracted: 0,
          });
          continue;
        }

        const multipleResult = this.validator.extractMultiple(String(phoneValue));
        const extractedCount = multipleResult.extractedNumbers.length;
        totalNumbersExtracted += extractedCount;

        if (extractedCount > 1) {
          recordsWithMultipleNumbers++;
          this.logger.debug(
            `Row contains ${extractedCount} numbers: ${multipleResult.extractedNumbers.join(', ')}`,
          );
        }

        if (multipleResult.validNumbers.length > 0) {
          // Create a row for each valid number extracted
          for (const validNumber of multipleResult.validNumbers) {
            const validRow: ProcessedRow = {
              ...row,
              [phoneColumn]: validNumber.sanitized,
              validationStatus: 'VALID',
              originalPhone: String(phoneValue),
              sanitizedPhone: validNumber.sanitized,
              numbersExtracted: extractedCount,
              allExtractedNumbers: multipleResult.extractedNumbers.join(', '),
            };

            // Add name to the row if detected
            if (nameColumn && nameValue) {
              validRow.name = String(nameValue);
            }

            validRows.push(validRow);
            rows.push(validRow);
            totalValidNumbers++;

            // Track unique numbers with their associated names
            const seen = uniqueValidNumbers.get(validNumber.sanitized);
            if (seen) {
              seen.occurrences++;
            } else {
              uniqueValidNumbers.set(validNumber.sanitized, {
                phone: validNumber.sanitized,
                name: nameValue ? String(nameValue) : undefined,
                occurrences: 1,
              });
            }
          }
        } else {
          // No valid numbers found
          const validation = this.validator.validate(String(phoneValue));
          const invalidRow: ProcessedRow = {
            ...row,
            validationStatus: 'INVALID',
            validationReason: validation.reason || 'Invalid format',
            originalPhone: String(phoneValue),
            sanitizedPhone: validation.sanitized,
            numbersExtracted: extractedCount,
          };

          if (nameColumn && nameValue) {
            invalidRow.name = String(nameValue);
          }

          pushInvalid(invalidRow);
        }
      }

      // Calculate analytics
      const uniqueCount = uniqueValidNumbers.size;

      const analytics: ProcessingAnalytics = {
        totalNumbersExtracted,
        totalValidNumbers,
        totalInvalidNumbers: invalidRows.length,
        recordsWithMultipleNumbers,
        averageNumbersPerRecord: data.length > 0 ? totalNumbersExtracted / data.length : 0,
        duplicateNumbers: totalValidNumbers - uniqueCount,
        uniqueValidNumbers: uniqueCount,
      };

      this.logger.log(
        `Processed ${data.length} rows: ${totalValidNumbers} valid (${uniqueCount} unique), ${invalidRows.length} invalid`,
      );

      return {
        rows,
        validRows,
        invalidRows,
        analytics,
        unique: Array.from(uniqueValidNumbers.values()),
      };
    } catch (error) {
      this.logger.error('Error processing rows', String(error));
      throw new AppError('Failed to process data rows', 'PROCESSING_ERROR');
    }
  }

  /**
   * Detects name column from data using multiple variations
   */
  private detectNameColumn(data: ParsedDataRow[]): string | null {
    try {
      if (!data || data.length === 0) {
        return null;
      }

      const firstRow = data[0];
      const nameField = findMatchingField(firstRow, COLUMN_ALIASES.name);

      return nameField;
    } catch (error) {
      this.logger.error('Error detecting name column', String(error));
      return null;
    }
  }

  /**
   * Writes unique numbers to a CSV file
   */
  private async writeUniqueNumbersFile(
    uniqueNumbers: UniqueNumber[],
    filePath: string,
    nameColumnDetected: string | null | undefined,
  ): Promise<void> {
    try {
      const headers: Array<{ id: string; title: string }> = [
        { id: 'phone', title: 'Phone Number' },
      ];

      if (nameColumnDetected) {
        headers.unshift({ id: 'name', title: 'Name' });
      }

      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: headers,
      });

      await csvWriter.writeRecords(uniqueNumbers);
      this.logger.log(
        `Unique numbers file created: ${filePath} (${uniqueNumbers.length} unique numbers)`,
      );
    } catch (error) {
      this.logger.error('Error writing unique numbers file', String(error));
      throw new AppError('Failed to write unique numbers file', 'WRITE_ERROR');
    }
  }

  /**
   * Generates analytics text file
   */
  private async generateAnalyticsFile(
    filePath: string,
    analytics: ProcessingAnalytics,
    totalRecords: number,
    phoneColumn: string,
    nameColumn?: string | null,
  ): Promise<void> {
    try {
      const nameInfo = nameColumn ? `\nName Column Used           : ${nameColumn}` : '';

      const content = `
═══════════════════════════════════════════════════════════════
           🔢 Numsy - ANALYTICS REPORT
═══════════════════════════════════════════════════════════════

PROCESSING SUMMARY
─────────────────────────────────────────────────────────────
Total Records Processed     : ${totalRecords}
Phone Column Used          : ${phoneColumn}${nameInfo}
Total Numbers Extracted    : ${analytics.totalNumbersExtracted}

VALIDATION RESULTS
─────────────────────────────────────────────────────────────
✓ Valid Numbers            : ${analytics.totalValidNumbers}
✗ Invalid Numbers          : ${analytics.totalInvalidNumbers}
◈ Unique Valid Numbers     : ${analytics.uniqueValidNumbers}
⊗ Duplicate Numbers        : ${analytics.duplicateNumbers}

DETAILED STATISTICS
─────────────────────────────────────────────────────────────
Records with Multiple Nums : ${analytics.recordsWithMultipleNumbers}
Average Numbers per Record : ${analytics.averageNumbersPerRecord.toFixed(2)}
Success Rate              : ${percent(analytics.totalValidNumbers, totalRecords)}%
Deduplication Rate        : ${percent(analytics.duplicateNumbers, analytics.totalValidNumbers)}%

VALIDATION FEATURES
─────────────────────────────────────────────────────────────
✓ Multiple number extraction per row
✓ Comprehensive final regex validation
✓ Pattern-based filtering (dummy numbers, sequential, etc.)
✓ Automatic name column detection
✓ Unique number deduplication

═══════════════════════════════════════════════════════════════
Generated on: ${new Date().toISOString()}
═══════════════════════════════════════════════════════════════
      `.trim();

      fs.writeFileSync(filePath, content, 'utf-8');
      this.logger.log(`Analytics file created: ${filePath}`);
    } catch (error) {
      this.logger.error('Error generating analytics file', String(error));
      throw new AppError('Failed to generate analytics file', 'WRITE_ERROR');
    }
  }

  /**
   * Creates a ZIP file containing all output files
   */
  private async createZipFile(
    files: Array<{ path: string; name: string }>,
    zipPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
          this.logger.log(`ZIP file created: ${zipPath} (${archive.pointer()} bytes)`);
          resolve();
        });

        archive.on('error', (err) => {
          this.logger.error('Archive error', String(err));
          reject(new AppError('Failed to create ZIP file', 'ZIP_ERROR'));
        });

        archive.pipe(output);

        for (const file of files) {
          if (fs.existsSync(file.path)) {
            archive.file(file.path, { name: file.name });
          }
        }

        archive.finalize();
      } catch (error) {
        this.logger.error('Error creating ZIP file', String(error));
        reject(new AppError('Failed to create ZIP file', 'ZIP_ERROR'));
      }
    });
  }

  /**
   * Sets processor options
   */
  setOptions(options: Partial<ProcessingOptions>): void {
    try {
      this.options = { ...this.options, ...options };
      this.logger.setEnabled(this.options.enableLogging ?? true);
      this.parser.setOptions(options);
      this.validator.setOptions(options);
      this.logger.log('FileProcessor options updated');
    } catch (error) {
      this.logger.error('Error setting options', String(error));
    }
  }

  /**
   * Gets current processor options
   */
  getOptions(): ProcessingOptions {
    return { ...this.options };
  }
}
