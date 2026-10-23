/**
 * Excel helpers shared by Node and the browser.
 * The ExcelJS module is passed in so the browser can load it lazily.
 */

import type * as ExcelJSModule from 'exceljs';
import { FileParseResult, ParsedDataRow } from '../common/interfaces';
import { XlsxSheet, collectColumns, stringify } from './serialize';

type ExcelJS = typeof ExcelJSModule;

/**
 * Flattens an ExcelJS cell value (rich text, hyperlink, formula, date) into a primitive
 */
export function cellToValue(value: any): string | number | boolean {
  if (value === undefined || value === null) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== 'object') return value;
  if (Array.isArray(value.richText)) return value.richText.map((r: any) => r.text).join('');
  if ('text' in value) return cellToValue(value.text);
  if ('result' in value) return cellToValue(value.result);
  if ('error' in value) return '';
  return String(value);
}

/**
 * Reads a worksheet whose first row holds the headers
 */
export function worksheetToRows(worksheet: ExcelJSModule.Worksheet): FileParseResult {
  const data: ParsedDataRow[] = [];
  let headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    // ExcelJS row.values is 1-based: index 0 is always empty
    const values = (row.values as any[]).slice(1);
    if (rowNumber === 1) {
      headers = values.map((h) => String(cellToValue(h) ?? ''));
      return;
    }
    const record: ParsedDataRow = {};
    headers.forEach((header, index) => {
      if (header) record[header] = cellToValue(values[index]);
    });
    data.push(record);
  });

  return { data, totalRows: data.length, detectedColumns: headers };
}

/**
 * Builds a workbook with one sheet per set: bold frozen header, auto-filter and fitted widths.
 * header: false leaves the header row out of every sheet except Summary.
 */
export function buildWorkbook(
  excel: ExcelJS,
  sheets: XlsxSheet[],
  options: { header?: boolean } = {},
): ExcelJSModule.Workbook {
  const workbook = new excel.Workbook();
  workbook.creator = 'Numsy';
  workbook.created = new Date();

  for (const sheet of sheets) {
    // Excel limits sheet names to 31 chars and forbids []:*?/\
    const worksheet = workbook.addWorksheet(sheet.name.replace(/[[\]:*?/\\]/g, ' ').slice(0, 31));
    const columns = sheet.columns ?? collectColumns(sheet.rows);
    const header = options.header !== false || sheet.name === 'Summary';

    worksheet.columns = columns.map((column) => ({
      ...(header ? { header: column } : {}),
      key: column,
      width: Math.min(
        60,
        Math.max(
          column.length,
          ...sheet.rows.slice(0, 200).map((row) => stringify(row[column]).length),
        ) + 2,
      ),
    }));

    for (const row of sheet.rows) {
      const values: Record<string, any> = {};
      for (const column of columns) values[column] = stringify(row[column]);
      worksheet.addRow(values);
    }

    if (columns.length && header) {
      worksheet.getRow(1).font = { bold: true };
      worksheet.views = [{ state: 'frozen', ySplit: 1 }];
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: columns.length },
      };
    }
  }

  return workbook;
}
