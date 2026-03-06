import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import { PhoneValidatorService } from './phone-validator.service';
import { FileParserService, ParsedDataRow } from './file-parser.service';

/**
 * Interface for processing result
 */
export interface ProcessingResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  phoneColumn: string;
  zipFilePath: string;
  validFilePath: string;
  invalidFilePath: string;
  analyticsFilePath: string;
  analytics: {
    totalNumbersExtracted: number;
    totalValidNumbers: number;
    totalInvalidNumbers: number;
    recordsWithMultipleNumbers: number;
    averageNumbersPerRecord: number;
    duplicateNumbers: number;
    uniqueValidNumbers: number;
  };
}

/**
 * Interface for processed row with validation details
 */
interface ProcessedRow extends ParsedDataRow {
  validationStatus?: string;
  validationReason?: string;
  originalPhone?: string;
  sanitizedPhone?: string;
  numbersExtracted?: number;
  allExtractedNumbers?: string;
}

/**
 * Service for processing uploaded files
 * Coordinates file parsing, phone validation, and output generation
 */
@Injectable()
export class FileProcessorService {
  private readonly logger = new Logger(FileProcessorService.name);

  constructor(
    private readonly phoneValidator: PhoneValidatorService,
    private readonly fileParser: FileParserService,
  ) {}

  /**
   * Processes an uploaded file
   * @param filePath - Path to the uploaded file
   * @param outputDir - Directory to save processed files
   * @returns Promise with processing result
   */
  async processFile(filePath: string, outputDir: string): Promise<ProcessingResult> {
    this.logger.log(`Starting file processing: ${filePath}`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Parse the input file
    const parseResult = await this.fileParser.parseFile(filePath);
    this.logger.log(`Parsed ${parseResult.totalRows} rows`);

    // Validate parsed data
    if (!parseResult.data || parseResult.data.length === 0) {
      throw new Error('No data found in the uploaded file');
    }

    // Normalize column names
    const normalizedData = this.fileParser.normalizeColumns(parseResult.data);

    // Detect phone column
    const phoneColumn = this.phoneValidator.detectPhoneColumn(normalizedData);
    if (!phoneColumn) {
      throw new Error(
        'Could not detect a valid phone number column in the file. Please ensure your file contains a column with phone numbers named like: phone, mobile, contact, telephone, etc.',
      );
    }

    this.logger.log(`Using phone column: "${phoneColumn}"`);

    // Process each row
    const { validRows, invalidRows, analytics, allExtractedData } = this.processRows(
      normalizedData,
      phoneColumn,
    );

    // Generate output file paths
    const timestamp = Date.now();
    const validFilePath = path.join(outputDir, `valid_numbers_${timestamp}.csv`);
    const invalidFilePath = path.join(outputDir, `invalid_numbers_${timestamp}.csv`);
    const analyticsFilePath = path.join(outputDir, `analytics_${timestamp}.txt`);
    const zipFilePath = path.join(outputDir, `processed_${timestamp}.zip`);

    // Write CSV files
    await this.fileParser.writeProcessedFiles(
      validRows,
      invalidRows,
      validFilePath,
      invalidFilePath,
    );

    // Generate comprehensive analytics text file
    await this.generateAnalyticsFile(
      analyticsFilePath,
      analytics,
      allExtractedData,
      parseResult.totalRows,
      phoneColumn,
    );

    // Create ZIP file with all outputs
    await this.createZipFile([validFilePath, invalidFilePath, analyticsFilePath], zipFilePath);

    const result: ProcessingResult = {
      totalRecords: parseResult.totalRows,
      validRecords: validRows.length,
      invalidRecords: invalidRows.length,
      phoneColumn,
      zipFilePath,
      validFilePath,
      invalidFilePath,
      analyticsFilePath,
      analytics,
    };

    this.logger.log(
      `Processing complete: ${result.validRecords} valid, ${result.invalidRecords} invalid`,
    );

    return result;
  }

  /**
   * Processes data rows and validates phone numbers
   * Handles multiple numbers in a single cell
   * All fields except phone are now optional
   * @param data - Array of data rows
   * @param phoneColumn - Name of the phone column
   * @returns Object with valid and invalid rows, analytics, and extracted data
   */
  private processRows(
    data: ParsedDataRow[],
    phoneColumn: string,
  ): {
    validRows: ProcessedRow[];
    invalidRows: ProcessedRow[];
    analytics: ProcessingResult['analytics'];
    allExtractedData: {
      uniqueNumbers: Set<string>;
      numberFrequency: Map<string, number>;
      fieldDistribution: Map<string, number>;
    };
  } {
    const validRows: ProcessedRow[] = [];
    const invalidRows: ProcessedRow[] = [];
    const allValidNumbers = new Set<string>();
    const allNumbersList: string[] = [];
    const numberFrequency = new Map<string, number>();
    const fieldDistribution = new Map<string, number>();
    let recordsWithMultipleNumbers = 0;
    let totalNumbersExtracted = 0;
    let totalValidNumbers = 0;
    let totalInvalidNumbers = 0;

    // Track all available fields - validate data is not empty
    if (!data || data.length === 0) {
      this.logger.warn('No data rows to process');
      return {
        validRows: [],
        invalidRows: [],
        analytics: {
          totalNumbersExtracted: 0,
          totalValidNumbers: 0,
          totalInvalidNumbers: 0,
          recordsWithMultipleNumbers: 0,
          averageNumbersPerRecord: 0,
          duplicateNumbers: 0,
          uniqueValidNumbers: 0,
        },
        allExtractedData: {
          uniqueNumbers: new Set<string>(),
          numberFrequency: new Map<string, number>(),
          fieldDistribution: new Map<string, number>(),
        },
      };
    }

    const firstRow = data[0];
    const allFields = firstRow ? Object.keys(firstRow) : [];
    allFields.forEach((field) => fieldDistribution.set(field, 0));

    for (const row of data) {
      const phoneValue = row[phoneColumn];

      // Extract multiple numbers from the cell
      const extraction = this.phoneValidator.extractMultipleNumbers(String(phoneValue || ''));

      totalNumbersExtracted += extraction.totalFound;
      totalValidNumbers += extraction.validCount;
      totalInvalidNumbers += extraction.invalidCount;

      if (extraction.totalFound > 1) {
        recordsWithMultipleNumbers++;
      }

      // Track all valid numbers for duplicate detection and frequency
      extraction.validNumbers.forEach((valid) => {
        allValidNumbers.add(valid.sanitized);
        allNumbersList.push(valid.sanitized);
        numberFrequency.set(valid.sanitized, (numberFrequency.get(valid.sanitized) || 0) + 1);
      });

      // Create separate rows for each extracted valid number
      if (extraction.validCount > 0) {
        extraction.validNumbers.forEach((validNum) => {
          const processedRow: ProcessedRow = {
            phone: validNum.sanitized,
            originalPhone: extraction.originalValue,
            sanitizedPhone: validNum.sanitized,
            validationStatus: 'Valid',
            numbersExtracted: extraction.totalFound,
            allExtractedNumbers: extraction.extractedNumbers.join(', '),
          };

          // Add other fields if they exist (all optional)
          allFields.forEach((field) => {
            if (field !== phoneColumn && row[field] !== undefined) {
              processedRow[field] = row[field];
              // Track field usage
              const currentCount = fieldDistribution.get(field) || 0;
              fieldDistribution.set(field, currentCount + 1);
            }
          });

          validRows.push(processedRow);
        });
      }

      // Create row for invalid numbers or if no valid numbers found
      if (extraction.invalidCount > 0 || extraction.totalFound === 0) {
        const reasons = extraction.invalidNumbers.map((inv) => inv.reason).join('; ');
        const processedRow: ProcessedRow = {
          phone: phoneValue,
          originalPhone: extraction.originalValue,
          sanitizedPhone:
            extraction.invalidNumbers.length > 0
              ? extraction.invalidNumbers.map((inv) => inv.sanitized).join(', ')
              : '',
          validationStatus: 'Invalid',
          validationReason:
            extraction.totalFound === 0 ? 'No phone numbers found' : reasons || 'Invalid format',
          numbersExtracted: extraction.totalFound,
          allExtractedNumbers: extraction.extractedNumbers.join(', '),
        };

        // Add other fields if they exist
        allFields.forEach((field) => {
          if (field !== phoneColumn && row[field] !== undefined) {
            processedRow[field] = row[field];
          }
        });

        invalidRows.push(processedRow);
      }
    }

    // Calculate analytics
    const duplicateNumbers = allNumbersList.length - allValidNumbers.size;
    const averageNumbersPerRecord =
      data.length > 0 ? +(totalNumbersExtracted / data.length).toFixed(2) : 0;

    const analytics: ProcessingResult['analytics'] = {
      totalNumbersExtracted,
      totalValidNumbers,
      totalInvalidNumbers,
      recordsWithMultipleNumbers,
      averageNumbersPerRecord,
      duplicateNumbers,
      uniqueValidNumbers: allValidNumbers.size,
    };

    this.logger.log(`Analytics: ${JSON.stringify(analytics)}`);

    return {
      validRows,
      invalidRows,
      analytics,
      allExtractedData: {
        uniqueNumbers: allValidNumbers,
        numberFrequency,
        fieldDistribution,
      },
    };
  }

  /**
   * Generates comprehensive analytics text file
   * @param filePath - Path where the analytics file will be saved
   * @param analytics - Analytics data
   * @param allExtractedData - Additional extracted data for detailed analysis
   * @param totalRecords - Total number of records processed
   * @param phoneColumn - Name of the detected phone column
   */
  private async generateAnalyticsFile(
    filePath: string,
    analytics: ProcessingResult['analytics'],
    allExtractedData: {
      uniqueNumbers: Set<string>;
      numberFrequency: Map<string, number>;
      fieldDistribution: Map<string, number>;
    },
    totalRecords: number,
    phoneColumn: string,
  ): Promise<void> {
    const timestamp = new Date().toLocaleString();
    const { uniqueNumbers, numberFrequency, fieldDistribution } = allExtractedData;

    // Find duplicate numbers
    const duplicates: { number: string; count: number }[] = [];
    numberFrequency.forEach((count, number) => {
      if (count > 1) {
        duplicates.push({ number, count });
      }
    });
    duplicates.sort((a, b) => b.count - a.count);

    // Find most common prefixes
    const prefixMap = new Map<string, number>();
    uniqueNumbers.forEach((number) => {
      const prefix = number.substring(0, 4); // First 4 digits
      prefixMap.set(prefix, (prefixMap.get(prefix) || 0) + 1);
    });
    const topPrefixes = Array.from(prefixMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Find carrier series (first digit indicates carrier in India)
    const carrierMap = new Map<string, { name: string; count: number }>();
    uniqueNumbers.forEach((number) => {
      const firstDigit = number.charAt(0);
      let carrier = 'Unknown';
      if (firstDigit === '6') carrier = 'Series 6 (Various Carriers)';
      else if (firstDigit === '7') carrier = 'Series 7 (Various Carriers)';
      else if (firstDigit === '8') carrier = 'Series 8 (Various Carriers)';
      else if (firstDigit === '9') carrier = 'Series 9 (Various Carriers)';

      const existing = carrierMap.get(firstDigit) || { name: carrier, count: 0 };
      carrierMap.set(firstDigit, { name: carrier, count: existing.count + 1 });
    });

    // Build analytics content
    let content = `
========================================================================
                    NUMBER PROCESSOR - ANALYTICS REPORT
========================================================================

Generated: ${timestamp}
Processor: Number Processor v1.0.0
File Format: CSV/Excel

========================================================================
                         SUMMARY STATISTICS
========================================================================

Total Input Records:              ${totalRecords}
Phone Column Detected:            "${phoneColumn}"

EXTRACTION RESULTS:
├─ Total Numbers Extracted:       ${analytics.totalNumbersExtracted}
├─ Valid Numbers Found:           ${analytics.totalValidNumbers}
├─ Invalid Numbers Found:         ${analytics.totalInvalidNumbers}
└─ Success Rate:                  ${analytics.totalNumbersExtracted > 0 ? ((analytics.totalValidNumbers / analytics.totalNumbersExtracted) * 100).toFixed(2) : 0}%

UNIQUE COUNT:
├─ Unique Valid Numbers:          ${analytics.uniqueValidNumbers}
├─ Duplicate Numbers Found:       ${analytics.duplicateNumbers}
└─ Deduplication Rate:            ${analytics.totalValidNumbers > 0 ? ((analytics.duplicateNumbers / analytics.totalValidNumbers) * 100).toFixed(2) : 0}%

MULTIPLE NUMBERS:
├─ Records with Multiple Numbers: ${analytics.recordsWithMultipleNumbers}
├─ Average Numbers per Record:    ${analytics.averageNumbersPerRecord}
└─ Multi-Number Records Rate:     ${totalRecords > 0 ? ((analytics.recordsWithMultipleNumbers / totalRecords) * 100).toFixed(2) : 0}%

========================================================================
                      CARRIER SERIES DISTRIBUTION
========================================================================

Indian mobile numbers start with 6, 7, 8, or 9. Distribution:

`;

    carrierMap.forEach((data) => {
      const percentage =
        analytics.uniqueValidNumbers > 0
          ? ((data.count / analytics.uniqueValidNumbers) * 100).toFixed(2)
          : '0.00';
      content += `${data.name.padEnd(40)} ${String(data.count).padStart(8)} (${percentage}%)\n`;
    });

    content += `
========================================================================
                    TOP 10 NUMBER PREFIXES (First 4 Digits)
========================================================================

Prefix    Count    Percentage
`;

    topPrefixes.forEach(([prefix, count]) => {
      const percentage =
        analytics.uniqueValidNumbers > 0
          ? ((count / analytics.uniqueValidNumbers) * 100).toFixed(2)
          : '0.00';
      content += `${prefix}      ${String(count).padStart(6)}    ${percentage}%\n`;
    });

    if (duplicates.length > 0) {
      content += `
========================================================================
                        DUPLICATE NUMBERS
========================================================================

Found ${duplicates.length} number(s) appearing multiple times:

Number          Occurrences
`;

      duplicates.slice(0, 20).forEach((dup) => {
        content += `${dup.number}    ${dup.count}\n`;
      });

      if (duplicates.length > 20) {
        content += `\n... and ${duplicates.length - 20} more duplicates\n`;
      }
    } else {
      content += `
========================================================================
                        DUPLICATE NUMBERS
========================================================================

No duplicate numbers found. All numbers are unique!
`;
    }

    content += `
========================================================================
                        FIELD DISTRIBUTION
========================================================================

Fields detected in the input file:

`;

    fieldDistribution.forEach((count, field) => {
      const percentage = totalRecords > 0 ? ((count / totalRecords) * 100).toFixed(2) : '0.00';
      content += `${field.padEnd(30)} ${String(count).padStart(8)} records (${percentage}%)\n`;
    });

    content += `
========================================================================
                        VALIDATION DETAILS
========================================================================

VALIDATION RULES APPLIED:
✓ Must be exactly 10 digits after sanitization
✓ Must start with 6, 7, 8, or 9 (Indian mobile format)
✓ Country code (+91/0091/91) automatically removed
✓ Special characters (+, -, spaces, dots, parentheses) removed
✓ Duplicate detection across entire dataset
✓ Multiple numbers per cell extracted and separated

INVALID NUMBER REASONS:
├─ Invalid length (not 10 digits)
├─ Invalid starting digit (not 6/7/8/9)
├─ All same digits (e.g., 9999999999)
└─ No numeric content found

========================================================================
                           OUTPUT FILES
========================================================================

This report is part of a ZIP package containing:

1. valid_numbers_*.csv     - All valid phone numbers
2. invalid_numbers_*.csv   - All invalid phone numbers  
3. analytics_*.txt         - This comprehensive report

Each valid number from multi-number cells is in a separate row,
with all other field values preserved.

========================================================================
                        RECOMMENDATIONS
========================================================================

`;

    if (analytics.duplicateNumbers > 0) {
      content += `⚠  ${analytics.duplicateNumbers} duplicate numbers found\n`;
      content += `   Consider removing duplicates for cleaner data\n\n`;
    }

    if (analytics.totalInvalidNumbers > analytics.totalValidNumbers * 0.1) {
      const invalidRate =
        analytics.totalNumbersExtracted > 0
          ? ((analytics.totalInvalidNumbers / analytics.totalNumbersExtracted) * 100).toFixed(1)
          : '0.0';
      content += `⚠  High invalid number rate (${invalidRate}%)\n`;
      content += `   Review your source data quality\n\n`;
    }

    if (analytics.recordsWithMultipleNumbers > totalRecords * 0.3) {
      content += `ℹ  Many records contain multiple numbers (${analytics.recordsWithMultipleNumbers})\n`;
      content += `   Each number has been extracted into a separate row\n\n`;
    }

    if (
      analytics.duplicateNumbers === 0 &&
      analytics.totalInvalidNumbers < analytics.totalValidNumbers * 0.05
    ) {
      content += `✓ Excellent data quality!\n`;
      content += `  Low invalid rate and no duplicates detected\n\n`;
    }

    content += `
========================================================================
                         END OF REPORT
========================================================================

For questions or support, visit: https://github.com/razorpod/number-processor
Thank you for using Number Processor!

`;

    // Write to file
    fs.writeFileSync(filePath, content, 'utf-8');
    this.logger.log(`Analytics report generated: ${filePath}`);
  }

  /**
   * Creates a ZIP file containing multiple files
   * @param filePaths - Array of file paths to include in ZIP
   * @param outputZipPath - Path for the output ZIP file
   * @returns Promise that resolves when ZIP is created
   */
  private async createZipFile(filePaths: string[], outputZipPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputZipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Maximum compression
      });

      output.on('close', () => {
        this.logger.log(`ZIP file created: ${outputZipPath} (${archive.pointer()} bytes)`);
        resolve();
      });

      archive.on('error', (err) => {
        this.logger.error(`ZIP creation error: ${err.message}`);
        reject(err);
      });

      archive.pipe(output);

      // Add each file to the archive
      for (const filePath of filePaths) {
        if (fs.existsSync(filePath)) {
          const fileName = path.basename(filePath);
          archive.file(filePath, { name: fileName });
        }
      }

      archive.finalize();
    });
  }

  /**
   * Cleans up temporary files after processing
   * @param filePaths - Array of file paths to delete
   */
  async cleanupFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          this.logger.debug(`Deleted file: ${filePath}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to delete file ${filePath}: ${errorMessage}`);
      }
    }
  }

  /**
   * Cleans up all files in a directory
   * @param dirPath - Directory path to clean
   */
  async cleanupDirectory(dirPath: string): Promise<void> {
    try {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          fs.unlinkSync(filePath);
        }
        this.logger.log(`Cleaned up directory: ${dirPath}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to cleanup directory ${dirPath}: ${errorMessage}`);
    }
  }
}
