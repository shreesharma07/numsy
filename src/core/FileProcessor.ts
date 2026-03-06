/**
 * FileProcessor Class
 * Coordinates file parsing, phone validation, and output generation
 */

import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import { createObjectCsvWriter } from 'csv-writer';
import {
  ProcessingResult,
  ProcessedRow,
  ParsedDataRow,
  ProcessingOptions,
  ProcessingAnalytics,
} from '../common/interfaces';
import { LoggerHelper, AppError, ensureDirectory } from '../common/helpers';
import { Parser } from './Parser';
import { PhoneValidator } from './PhoneValidator';
import { findMatchingField, COLUMN_ALIASES } from '../common/functions';

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
    };

    this.logger = new LoggerHelper('FileProcessor');
    this.parser = new Parser();
    this.validator = new PhoneValidator();

    this.logger.log('FileProcessor initialized');
  }

  /**
   * Processes an uploaded file
   */
  async processFile(filePath: string, outputDir?: string): Promise<ProcessingResult> {
    const outputDirectory = outputDir! || this.options.outputDir!;

    try {
      this.logger.log(`Starting file processing: ${filePath}`);

      // Ensure output directory exists
      ensureDirectory(outputDirectory);

      // Parse the input file
      const parseResult = await this.parser.parseFile(filePath);
      this.logger.log(`Parsed ${parseResult.totalRows} rows`);

      // Validate parsed data
      if (!parseResult.data || parseResult.data.length === 0) {
        throw new AppError('No data found in the uploaded file', 'NO_DATA');
      }

      // Detect phone column
      const phoneColumn = this.validator.detectPhoneColumn(parseResult.data);
      if (!phoneColumn) {
        throw new AppError(
          'Could not detect a valid phone number column in the file',
          'NO_PHONE_COLUMN',
        );
      }

      this.logger.log(`Using phone column: "${phoneColumn}"`);

      // Detect name column (if present)
      const nameColumn = this.detectNameColumn(parseResult.data);
      if (nameColumn) {
        this.logger.log(`Detected name column: "${nameColumn}"`);
      } else {
        this.logger.log('No name column detected');
      }

      // Process each row
      const { validRows, invalidRows, analytics, allExtractedData, uniqueValidNumbers } =
        this.processRows(parseResult.data, phoneColumn, nameColumn);

      // Generate output file paths using original filename
      const originalFileName = path.basename(filePath, path.extname(filePath));
      const timestamp = Date.now();
      const baseFileName = `${originalFileName}_numsy_report_${timestamp}`;

      const validFilePath = path.join(outputDirectory, `${baseFileName}_valid.csv`);
      const invalidFilePath = path.join(outputDirectory, `${baseFileName}_invalid.csv`);
      const uniqueNumbersFilePath = path.join(outputDirectory, `${baseFileName}_unique.csv`);
      const analyticsFilePath = path.join(outputDirectory, `${baseFileName}_analytics.txt`);
      const zipFilePath = path.join(outputDirectory, `${baseFileName}.zip`);

      // Write CSV files
      await this.parser.writeProcessedFiles(validRows, invalidRows, validFilePath, invalidFilePath);

      // Write unique numbers file
      await this.writeUniqueNumbersFile(uniqueValidNumbers, uniqueNumbersFilePath, nameColumn);

      // Generate analytics file
      await this.generateAnalyticsFile(
        analyticsFilePath,
        analytics,
        allExtractedData,
        parseResult.totalRows,
        phoneColumn,
        nameColumn,
      );

      // Create ZIP file
      await this.createZipFile(
        [validFilePath, invalidFilePath, uniqueNumbersFilePath, analyticsFilePath],
        zipFilePath,
      );

      const result: ProcessingResult = {
        totalRecords: parseResult.totalRows,
        validRecords: validRows.length,
        invalidRecords: invalidRows.length,
        phoneColumn,
        nameColumn: nameColumn || undefined,
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
    validRows: ProcessedRow[];
    invalidRows: ProcessedRow[];
    analytics: ProcessingAnalytics;
    allExtractedData: ProcessedRow[];
    uniqueValidNumbers: Map<string, { name?: string; phone: string }>;
  } {
    const validRows: ProcessedRow[] = [];
    const invalidRows: ProcessedRow[] = [];
    const allExtractedData: ProcessedRow[] = [];
    const allValidNumbers: string[] = [];
    const uniqueValidNumbers = new Map<string, { name?: string; phone: string }>();
    let recordsWithMultipleNumbers = 0;
    let totalNumbersExtracted = 0;

    try {
      for (const row of data) {
        const phoneValue = row[phoneColumn];
        const nameValue = nameColumn ? row[nameColumn] : undefined;

        if (!phoneValue) {
          const invalidRow: ProcessedRow = {
            ...row,
            validationStatus: 'INVALID',
            validationReason: 'Empty phone number',
            originalPhone: '',
            sanitizedPhone: '',
            numbersExtracted: 0,
          };
          invalidRows.push(invalidRow);
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
              [phoneColumn]: validNumber,
              validationStatus: 'VALID',
              originalPhone: String(phoneValue),
              sanitizedPhone: validNumber,
              numbersExtracted: extractedCount,
              allExtractedNumbers: multipleResult.extractedNumbers.join(', '),
            };

            // Add name to the row if detected
            if (nameColumn && nameValue) {
              validRow.name = String(nameValue);
            }

            validRows.push(validRow);
            allExtractedData.push(validRow);
            allValidNumbers.push(validNumber);

            // Track unique numbers with their associated names
            if (!uniqueValidNumbers.has(validNumber)) {
              uniqueValidNumbers.set(validNumber, {
                phone: validNumber,
                name: nameValue ? String(nameValue) : undefined,
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

          invalidRows.push(invalidRow);
        }
      }

      // Calculate analytics
      const uniqueCount = uniqueValidNumbers.size;
      const duplicateNumbers = allValidNumbers.length - uniqueCount;

      const analytics: ProcessingAnalytics = {
        totalNumbersExtracted,
        totalValidNumbers: allValidNumbers.length,
        totalInvalidNumbers: invalidRows.length,
        recordsWithMultipleNumbers,
        averageNumbersPerRecord: totalNumbersExtracted / data.length || 0,
        duplicateNumbers,
        uniqueValidNumbers: uniqueCount,
      };

      this.logger.log(
        `Processed ${data.length} rows: ${allValidNumbers.length} valid (${uniqueCount} unique), ${invalidRows.length} invalid`,
      );

      return { validRows, invalidRows, analytics, allExtractedData, uniqueValidNumbers };
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
    uniqueNumbers: Map<string, { name?: string; phone: string }>,
    filePath: string,
    nameColumnDetected: string | null | undefined,
  ): Promise<void> {
    try {
      const uniqueArray = Array.from(uniqueNumbers.values());

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

      await csvWriter.writeRecords(uniqueArray);
      this.logger.log(
        `Unique numbers file created: ${filePath} (${uniqueNumbers.size} unique numbers)`,
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
    allExtractedData: ProcessedRow[],
    totalRecords: number,
    phoneColumn: string,
    nameColumn?: string | null,
  ): Promise<void> {
    try {
      const nameInfo = nameColumn ? `\nName Column Used           : ${nameColumn}` : '';

      const content = `
═══════════════════════════════════════════════════════════════
           NUMBER PROCESSOR - ANALYTICS REPORT
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
Success Rate              : ${((analytics.totalValidNumbers / totalRecords) * 100).toFixed(2)}%
Deduplication Rate        : ${((analytics.duplicateNumbers / analytics.totalValidNumbers) * 100).toFixed(2)}%

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
  private async createZipFile(filePaths: string[], zipPath: string): Promise<void> {
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

        for (const filePath of filePaths) {
          if (fs.existsSync(filePath)) {
            const fileName = path.basename(filePath);
            archive.file(filePath, { name: fileName });
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
