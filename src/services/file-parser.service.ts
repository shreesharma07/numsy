import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import csv from 'csv-parser';
import * as ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import { ParsedDataRow, FileParseResult } from '../common/interfaces';
import {
  isPathAllowed,
  getAllowedDirectories,
  safeFileExists,
  isFile,
  getFileExtension,
} from '../common/functions';

/**
 * Service for parsing CSV and Excel files
 * Handles various file formats and extracts data
 */
@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  /**
   * Parses a file based on its extension
   * @param filePath - Path to the file to parse
   * @returns Promise with parsed data
   */
  async parseFile(filePath: string): Promise<FileParseResult> {
    const methodName = 'parseFile';
    const startTime = Date.now();

    try {
      this.logger.log(`[${methodName}] Starting file parsing: ${filePath}`);

      // Validate input file path using centralized utility
      const pathValidation = isPathAllowed(filePath, getAllowedDirectories('input'));

      if (!pathValidation.isValid) {
        const errorMsg = `Invalid file path: ${pathValidation.error}`;
        this.logger.error(`[${methodName}] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const normalizedPath = pathValidation.normalizedPath;

      // Check if file exists
      if (!safeFileExists(normalizedPath)) {
        const errorMsg = `File not found: ${normalizedPath}`;
        this.logger.error(`[${methodName}] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // Verify it's a file, not a directory
      if (!isFile(normalizedPath)) {
        const errorMsg = `Path is not a file: ${normalizedPath}`;
        this.logger.error(`[${methodName}] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const extension = getFileExtension(normalizedPath);
      this.logger.log(`[${methodName}] Detected file type: ${extension}`);

      let result: FileParseResult;

      switch (extension) {
        case 'csv':
          result = await this.parseCsv(normalizedPath);
          break;
        case 'xlsx':
        case 'xls':
          result = await this.parseExcel(normalizedPath);
          break;
        default:
          throw new Error(`Unsupported file format: ${extension}`);
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `[${methodName}] File parsed successfully in ${duration}ms: ${result.totalRows} rows`,
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during parsing';
      this.logger.error(`[${methodName}] Failed after ${duration}ms: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Parses a CSV file
   * @param filePath - Path to the CSV file
   * @returns Promise with parsed data
   */
  private async parseCsv(filePath: string): Promise<FileParseResult> {
    const methodName = 'parseCsv';
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      try {
        const data: ParsedDataRow[] = [];
        let detectedColumns: string[] = [];

        this.logger.debug(`[${methodName}] Starting CSV parsing: ${filePath}`);

        fs.createReadStream(filePath)
          .pipe(csv())
          .on('headers', (headers: string[]) => {
            detectedColumns = headers;
            this.logger.debug(`[${methodName}] Detected columns: ${headers.join(', ')}`);
          })
          .on('data', (row) => {
            try {
              data.push(row);
            } catch (error) {
              this.logger.warn(`[${methodName}] Error processing row: ${error}`);
            }
          })
          .on('end', () => {
            const duration = Date.now() - startTime;
            this.logger.log(
              `[${methodName}] Parsing complete in ${duration}ms: ${data.length} rows`,
            );
            resolve({
              data,
              totalRows: data.length,
              detectedColumns,
            });
          })
          .on('error', (error) => {
            const duration = Date.now() - startTime;
            const errorMsg = error instanceof Error ? error.message : 'CSV parsing error';
            this.logger.error(`[${methodName}] Failed after ${duration}ms: ${errorMsg}`);
            reject(new Error(`CSV parsing failed: ${errorMsg}`));
          });
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : 'Unexpected CSV error';
        this.logger.error(`[${methodName}] Failed after ${duration}ms: ${errorMsg}`);
        reject(error);
      }
    });
  }

  /**
   * Parses an Excel file
   * @param filePath - Path to the Excel file
   * @returns Promise with parsed data
   */
  private async parseExcel(filePath: string): Promise<FileParseResult> {
    const methodName = 'parseExcel';
    const startTime = Date.now();

    try {
      this.logger.debug(`[${methodName}] Starting Excel parsing: ${filePath}`);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        throw new Error('No worksheet found in Excel file');
      }

      const data: ParsedDataRow[] = [];
      const detectedColumns: string[] = [];
      let headerRow: any[] = [];

      // Process rows
      worksheet.eachRow((row, rowNumber) => {
        try {
          if (rowNumber === 1) {
            // First row is header
            headerRow = row.values as any[];
            // Remove the first empty element that ExcelJS adds
            headerRow.shift();
            detectedColumns.push(...headerRow.map((h) => String(h || '')));
            this.logger.debug(`[${methodName}] Detected columns: ${detectedColumns.join(', ')}`);
          } else {
            // Data rows
            const rowData: ParsedDataRow = {};
            const values = row.values as any[];
            // Remove the first empty element
            values.shift();

            headerRow.forEach((header, index) => {
              if (header) {
                rowData[String(header)] = values[index] !== undefined ? values[index] : '';
              }
            });
            data.push(rowData);
          }
        } catch (error) {
          this.logger.warn(`[${methodName}] Error processing row ${rowNumber}: ${error}`);
        }
      });

      const duration = Date.now() - startTime;
      this.logger.log(`[${methodName}] Parsing complete in ${duration}ms: ${data.length} rows`);

      return {
        data,
        totalRows: data.length,
        detectedColumns,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Excel parsing error';
      this.logger.error(`[${methodName}] Failed after ${duration}ms: ${errorMsg}`);
      throw new Error(`Excel parsing failed: ${errorMsg}`);
    }
  }

  /**
   * Normalizes column names to standard format
   * Maps various column names to standard fields: name, phone, address
   * @param data - Array of data rows
   * @returns Normalized data array
   */
  normalizeColumns(data: ParsedDataRow[]): ParsedDataRow[] {
    if (!data || data.length === 0) {
      return [];
    }

    const nameAliases = ['name', 'full name', 'fullname', 'customer name', 'person'];
    const phoneAliases = [
      'phone',
      'mobile',
      'contact',
      'number',
      'telephone',
      'phone number',
      'mobile number',
      'contact number',
    ];
    const addressAliases = [
      'address',
      'location',
      'city',
      'place',
      'area',
      'full address',
      'street',
    ];

    return data.map((row) => {
      const normalized: ParsedDataRow = {};

      // Find and map name field
      const nameField = this.findMatchingField(row, nameAliases);
      if (nameField) {
        normalized.name = row[nameField];
      }

      // Find and map phone field
      const phoneField = this.findMatchingField(row, phoneAliases);
      if (phoneField) {
        normalized.phone = row[phoneField];
      }

      // Find and map address field
      const addressField = this.findMatchingField(row, addressAliases);
      if (addressField) {
        normalized.address = row[addressField];
      }

      // Keep any other fields as-is
      Object.keys(row).forEach((key) => {
        const keyLower = key.toLowerCase();
        if (
          !nameAliases.includes(keyLower) &&
          !phoneAliases.includes(keyLower) &&
          !addressAliases.includes(keyLower)
        ) {
          normalized[key] = row[key];
        }
      });

      return normalized;
    });
  }

  /**
   * Finds a matching field name from a list of aliases
   * @param row - Data row object
   * @param aliases - Array of possible field names
   * @returns Matching field name or null
   */
  private findMatchingField(row: Record<string, any>, aliases: string[]): string | null {
    const keys = Object.keys(row);
    for (const key of keys) {
      const keyLower = key.toLowerCase().trim();
      if (aliases.includes(keyLower)) {
        return key;
      }
    }
    return null;
  }

  /**
   * Writes processed data to a CSV file
   * @param data - Array of data rows to write
   * @param outputPath - Path to write the CSV file
   * @returns Promise that resolves when file is written
   */
  /**
   * Writes processed data to a CSV file
   * @param data - Array of data rows to write
   * @param outputPath - Path to write the CSV file
   * @returns Promise that resolves when file is written
   */
  async writeCsv(data: ParsedDataRow[], outputPath: string): Promise<void> {
    const methodName = 'writeCsv';
    const startTime = Date.now();

    try {
      this.logger.debug(`[${methodName}] Starting CSV write: ${outputPath}`);

      // Validate data
      if (!data || data.length === 0) {
        throw new Error('No data to write');
      }

      // Validate output path using centralized utility
      const pathValidation = isPathAllowed(outputPath, getAllowedDirectories('output'));

      if (!pathValidation.isValid) {
        throw new Error(`Invalid CSV output path: ${pathValidation.error}`);
      }

      const normalizedPath = pathValidation.normalizedPath;

      // Get all unique headers from the data
      const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row)))).map(
        (header) => ({
          id: header,
          title: header,
        }),
      );

      this.logger.debug(
        `[${methodName}] Writing ${data.length} rows with ${headers.length} columns`,
      );

      const csvWriter = createObjectCsvWriter({
        path: normalizedPath,
        header: headers,
      });

      await csvWriter.writeRecords(data);

      const duration = Date.now() - startTime;
      this.logger.log(
        `[${methodName}] CSV file written successfully in ${duration}ms: ${normalizedPath} (${data.length} rows)`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'CSV write error';
      this.logger.error(`[${methodName}] Failed after ${duration}ms: ${errorMsg}`);
      throw new Error(`CSV write failed: ${errorMsg}`);
    }
  }

  /**
   * Writes data to multiple CSV files (valid and invalid)
   * @param validData - Array of valid data rows
   * @param invalidData - Array of invalid data rows
   * @param validPath - Path for valid data CSV
   * @param invalidPath - Path for invalid data CSV
   */
  async writeProcessedFiles(
    validData: ParsedDataRow[],
    invalidData: ParsedDataRow[],
    validPath: string,
    invalidPath: string,
  ): Promise<void> {
    const writePromises: Promise<void>[] = [];

    if (validData && validData.length > 0) {
      writePromises.push(this.writeCsv(validData, validPath));
    }

    if (invalidData && invalidData.length > 0) {
      writePromises.push(this.writeCsv(invalidData, invalidPath));
    }

    await Promise.all(writePromises);
    this.logger.log('All processed files written successfully');
  }
}
