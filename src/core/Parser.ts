/**
 * Parser Class
 * Main class for parsing files (CSV, Excel) with validation and processing
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import { ParsedDataRow, FileParseResult, ParserOptions } from '../common/interfaces';
import {
  LoggerHelper,
  AppError,
  fileExists,
  ensureDirectory,
  validateFileExtension,
} from '../common/helpers';
import { getFileExtension } from '../common/functions';
import { parseCsv } from '../engine/csv';
import { worksheetToRows } from '../engine/workbook';
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
      enabled: this.options.enableLogging,
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
    if (!fileExists(filePath)) {
      throw new AppError(`File not found: ${filePath}`, 'FILE_NOT_FOUND');
    }
    this.assertSupported(filePath);
    this.logger.log(`Parsing file: ${filePath}`);
    return this.parseBuffer(await fs.promises.readFile(filePath), filePath);
  }

  /**
   * Parses file contents already in memory (e.g. an upload); fileName decides CSV vs Excel
   */
  async parseBuffer(
    buffer: Buffer | ArrayBuffer | Uint8Array,
    fileName: string,
  ): Promise<FileParseResult> {
    try {
      const extension = this.assertSupported(fileName);
      const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer as ArrayBuffer);
      const result =
        extension === 'csv'
          ? this.parseCsvText(bytes.toString('utf-8'))
          : await this.parseExcel(bytes, extension);

      // Normalize columns if enabled
      if (this.options.normalizeColumns && result.data.length > 0) {
        result.data = normalizeDataRows(result.data);
      }

      this.logger.log(`File parsed successfully: ${result.totalRows} rows`);
      return result;
    } catch (error) {
      this.logger.error('Error parsing file', String(error));
      if (this.options.throwOnError || error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to parse file', 'PARSE_ERROR');
    }
  }

  /**
   * Throws UNSUPPORTED_FORMAT unless the name ends in a supported extension; returns the extension
   */
  private assertSupported(fileName: string): string {
    const extension = getFileExtension(fileName);
    if (!validateFileExtension(fileName, SUPPORTED_FILE_EXTENSIONS)) {
      throw new AppError(
        `Unsupported file format: ${extension || 'none'}. Supported: ${SUPPORTED_FILE_EXTENSIONS.join(', ')}`,
        'UNSUPPORTED_FORMAT',
      );
    }
    return extension;
  }

  /**
   * Parses CSV text (delimiter, quotes and BOM handled by the shared engine)
   */
  private parseCsvText(text: string): FileParseResult {
    try {
      const result = parseCsv(text);
      this.logger.debug(`Detected CSV columns: ${result.detectedColumns.join(', ')}`);
      this.logger.log(`CSV parsing complete: ${result.totalRows} rows`);
      return result;
    } catch (error) {
      this.logger.error('CSV parsing error', String(error));
      throw new AppError('CSV parsing failed', 'CSV_PARSE_ERROR');
    }
  }

  /**
   * Parses an Excel workbook (first worksheet, first row as headers)
   */
  private async parseExcel(bytes: Buffer, extension: string): Promise<FileParseResult> {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(bytes as any);
    } catch (error) {
      this.logger.error('Excel parsing error', String(error));
      throw new AppError(
        extension === 'xls'
          ? 'Could not read this .xls file. Legacy Excel 97-2003 files are not supported: save it as .xlsx or .csv'
          : 'Excel parsing failed: the file is not a valid .xlsx workbook (it may be truncated or corrupted; try re-saving it in Excel)',
        'EXCEL_PARSE_ERROR',
      );
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new AppError('No worksheet found in Excel file', 'EXCEL_PARSE_ERROR');

    const result = worksheetToRows(worksheet);
    this.logger.log(`Excel parsing complete: ${result.totalRows} rows`);
    this.logger.debug(`Detected Excel columns: ${result.detectedColumns.join(', ')}`);
    return result;
  }

  /**
   * Writes data to a CSV file
   */
  async writeCsv(data: ParsedDataRow[], outputPath: string): Promise<void> {
    try {
      if (!data || data.length === 0) throw new AppError('No data to write', 'NO_DATA');

      // Ensure output directory exists
      const dirPath = path.dirname(outputPath);
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
      this.logger.setEnabled(this.options.enableLogging ?? true);
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
