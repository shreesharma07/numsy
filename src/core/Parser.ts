/**
 * Parser Class
 * Main class for parsing files (CSV, Excel) with validation and processing
 */

import * as fs from 'fs';
import csv from 'csv-parser';
import * as ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import { ParsedDataRow, FileParseResult, ParserOptions } from '../common/interfaces';
import {
  LoggerHelper,
  AppError,
  fileExists,
  ensureDirectory,
  getFileExtension,
  validateFileExtension,
} from '../common/helpers';
import {
  SUPPORTED_FILE_EXTENSIONS,
  normalizeDataRows,
  detectPhoneColumn,
} from '../common/functions';

/**
 * Parser class for file parsing operations
 */
export class Parser {
  private logger: LoggerHelper;
  private options: ParserOptions;

  constructor(options?: ParserOptions) {
    this.options = {
      enableLogging: options?.enableLogging ?? true,
      logLevel: options?.logLevel ?? 'log',
      throwOnError: options?.throwOnError ?? false,
      normalizeColumns: options?.normalizeColumns ?? true,
      detectPhoneColumn: options?.detectPhoneColumn ?? true,
    };

    this.logger = new LoggerHelper('Parser', {
      level: this.options.logLevel,
      timestamp: true,
    });

    if (this.options.enableLogging) {
      this.logger.log('Parser initialized');
    }
  }

  /**
   * Parses a file based on its extension
   */
  async parseFile(filePath: string): Promise<FileParseResult> {
    try {
      // Validate file exists
      if (!fileExists(filePath)) {
        throw new AppError(`File not found: ${filePath}`, 'FILE_NOT_FOUND');
      }

      // Validate file extension
      const extension = getFileExtension(filePath);
      if (!validateFileExtension(filePath, SUPPORTED_FILE_EXTENSIONS)) {
        throw new AppError(
          `Unsupported file format: ${extension}. Supported: ${SUPPORTED_FILE_EXTENSIONS.join(', ')}`,
          'UNSUPPORTED_FORMAT',
        );
      }

      this.logger.log(`Parsing file: ${filePath} (type: ${extension})`);

      let result: FileParseResult;

      switch (extension) {
        case 'csv':
          result = await this.parseCsv(filePath);
          break;
        case 'xlsx':
        case 'xls':
          result = await this.parseExcel(filePath);
          break;
        default:
          throw new AppError(`Unsupported file format: ${extension}`, 'UNSUPPORTED_FORMAT');
      }

      // Normalize columns if enabled
      if (this.options.normalizeColumns && result.data.length > 0) {
        result.data = normalizeDataRows(result.data);
      }

      this.logger.log(`File parsed successfully: ${result.totalRows} rows`);
      return result;
    } catch (error) {
      this.logger.error('Error parsing file', String(error));
      if (this.options.throwOnError) {
        throw error;
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to parse file', 'PARSE_ERROR');
    }
  }

  /**
   * Parses a CSV file
   */
  private async parseCsv(filePath: string): Promise<FileParseResult> {
    return new Promise((resolve, reject) => {
      const data: ParsedDataRow[] = [];
      let detectedColumns: string[] = [];

      try {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('headers', (headers: string[]) => {
            detectedColumns = headers;
            this.logger.debug(`Detected CSV columns: ${headers.join(', ')}`);
          })
          .on('data', (row) => {
            data.push(row);
          })
          .on('end', () => {
            this.logger.log(`CSV parsing complete: ${data.length} rows`);
            resolve({
              data,
              totalRows: data.length,
              detectedColumns,
            });
          })
          .on('error', (error) => {
            this.logger.error(`CSV parsing error: ${error.message}`);
            reject(new AppError('CSV parsing failed', 'CSV_PARSE_ERROR'));
          });
      } catch (error) {
        this.logger.error('CSV parsing error', String(error));
        reject(new AppError('CSV parsing failed', 'CSV_PARSE_ERROR'));
      }
    });
  }

  /**
   * Parses an Excel file
   */
  private async parseExcel(filePath: string): Promise<FileParseResult> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.worksheets[0];

      if (!worksheet) throw new AppError('No worksheet found in Excel file', 'EXCEL_PARSE_ERROR');

      const data: ParsedDataRow[] = [];
      const detectedColumns: string[] = [];
      let headerRow: any[] = [];

      // Process rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          // First row is header
          headerRow = row.values as any[];
          // Remove the first empty element that ExcelJS adds
          headerRow.shift();
          detectedColumns.push(...headerRow.map((h) => String(h || '')));
        } else {
          // Data rows
          const rowData: ParsedDataRow = {};
          const values = row.values as any[];
          // Remove the first empty element
          values.shift();

          headerRow.forEach((header, index) => {
            if (header) rowData[String(header)] = values[index] !== undefined ? values[index] : '';
          });
          data.push(rowData);
        }
      });

      this.logger.log(`Excel parsing complete: ${data.length} rows`);
      this.logger.debug(`Detected Excel columns: ${detectedColumns.join(', ')}`);

      return {
        data,
        totalRows: data.length,
        detectedColumns,
      };
    } catch (error) {
      this.logger.error('Excel parsing error', String(error));
      throw new AppError('Excel parsing failed', 'EXCEL_PARSE_ERROR');
    }
  }

  /**
   * Writes data to a CSV file
   */
  async writeCsv(data: ParsedDataRow[], outputPath: string): Promise<void> {
    try {
      if (!data || data.length === 0) throw new AppError('No data to write', 'NO_DATA');

      // Ensure output directory exists
      const dirPath = outputPath.substring(0, outputPath.lastIndexOf('/'));
      if (dirPath) ensureDirectory(dirPath);

      // Get all unique headers from the data
      const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row)))).map(
        (header) => ({
          id: header,
          title: header,
        }),
      );

      const csvWriter = createObjectCsvWriter({
        path: outputPath,
        header: headers,
      });

      await csvWriter.writeRecords(data);
      this.logger.log(`CSV file written: ${outputPath} (${data.length} rows)`);
    } catch (error) {
      this.logger.error('Error writing CSV file', String(error));
      throw new AppError('Failed to write CSV file', 'WRITE_ERROR');
    }
  }

  /**
   * Writes data to multiple CSV files (valid and invalid)
   */
  async writeProcessedFiles(
    validData: ParsedDataRow[],
    invalidData: ParsedDataRow[],
    validPath: string,
    invalidPath: string,
  ): Promise<void> {
    try {
      const writePromises: Promise<void>[] = [];

      if (validData && validData.length > 0) {
        writePromises.push(this.writeCsv(validData, validPath));
      }

      if (invalidData && invalidData.length > 0) {
        writePromises.push(this.writeCsv(invalidData, invalidPath));
      }

      await Promise.all(writePromises);
      this.logger.log('Processed files written successfully');
    } catch (error) {
      this.logger.error('Error writing processed files', String(error));
      throw new AppError('Failed to write processed files', 'WRITE_ERROR');
    }
  }

  /**
   * Detects phone column from parsed data
   */
  detectPhoneColumn(data: ParsedDataRow[]): string | null {
    try {
      const phoneColumn = detectPhoneColumn(data);

      if (phoneColumn) {
        this.logger.log(`Detected phone column: ${phoneColumn}`);
      } else {
        this.logger.warn('No phone column detected');
      }

      return phoneColumn;
    } catch (error) {
      this.logger.error('Error detecting phone column', String(error));
      return null;
    }
  }

  /**
   * Sets parser options
   */
  setOptions(options: Partial<ParserOptions>): void {
    try {
      this.options = { ...this.options, ...options };
      this.logger.log('Parser options updated');
    } catch (error) {
      this.logger.error('Error setting options', String(error));
    }
  }

  /**
   * Gets current parser options
   */
  getOptions(): ParserOptions {
    return { ...this.options };
  }
}
