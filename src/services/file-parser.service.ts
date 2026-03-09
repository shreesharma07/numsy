import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import * as ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';

/**
 * Interface for parsed data row
 */
export interface ParsedDataRow {
  name?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
}

/**
 * Interface for file parsing result
 */
export interface FileParseResult {
  data: ParsedDataRow[];
  totalRows: number;
  detectedColumns: string[];
}

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
    // Validate input file path
    const normalizedPath = path.normalize(path.resolve(filePath));
    const allowedDirs = [
      path.resolve(process.cwd(), 'uploads'),
      path.resolve(process.cwd(), 'temp'),
      path.resolve(process.cwd(), 'Temp'),
    ];

    const isPathValid = allowedDirs.some((allowedDir) => {
      const normalizedAllowedDir = path.normalize(allowedDir);
      return normalizedPath.startsWith(normalizedAllowedDir + path.sep);
    });

    if (!isPathValid || normalizedPath.includes('..')) {
      throw new Error(`Invalid file path for parsing: ${filePath}`);
    }

    const extension = normalizedPath.split('.').pop()?.toLowerCase() || '';

    this.logger.log(`Parsing file: ${normalizedPath} (type: ${extension})`);

    switch (extension) {
      case 'csv':
        return this.parseCsv(normalizedPath);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(normalizedPath);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  /**
   * Parses a CSV file
   * @param filePath - Path to the CSV file
   * @returns Promise with parsed data
   */
  private async parseCsv(filePath: string): Promise<FileParseResult> {
    return new Promise((resolve, reject) => {
      const data: ParsedDataRow[] = [];
      let detectedColumns: string[] = [];

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
          reject(error);
        });
    });
  }

  /**
   * Parses an Excel file
   * @param filePath - Path to the Excel file
   * @returns Promise with parsed data
   */
  private async parseExcel(filePath: string): Promise<FileParseResult> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.worksheets[0];

      if (!worksheet) throw new Error('No worksheet found in Excel file');

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
            if (header) {
              rowData[String(header)] = values[index] !== undefined ? values[index] : '';
            }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Excel parsing error: ${error.message}`);
      } else {
        this.logger.error('Excel parsing error: Unknown error');
      }
      throw error;
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
  async writeCsv(data: ParsedDataRow[], outputPath: string): Promise<void> {
    if (!data || data.length === 0) {
      throw new Error('No data to write');
    }

    // Validate output path
    const normalizedPath = path.normalize(path.resolve(outputPath));
    const allowedDirs = [path.resolve(process.cwd(), 'temp'), path.resolve(process.cwd(), 'Temp')];

    const isPathValid = allowedDirs.some((allowedDir) => {
      const normalizedAllowedDir = path.normalize(allowedDir);
      return normalizedPath.startsWith(normalizedAllowedDir + path.sep);
    });

    if (!isPathValid || normalizedPath.includes('..')) {
      throw new Error(`Invalid CSV output path: ${outputPath}`);
    }

    // Get all unique headers from the data
    const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row)))).map((header) => ({
      id: header,
      title: header,
    }));

    const csvWriter = createObjectCsvWriter({
      path: normalizedPath,
      header: headers,
    });

    await csvWriter.writeRecords(data);
    this.logger.log(`CSV file written: ${normalizedPath} (${data.length} rows)`);
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
