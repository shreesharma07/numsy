/**
 * In-memory analysis of tabular data
 * Validates, extracts and de-duplicates phone numbers row by row
 */

import { AppError } from '../common/helpers/error.helper';
import {
  AnalysisReport,
  AnalyzeOptions,
  ParsedDataRow,
  ProcessedRow,
  ProcessingAnalytics,
  UniqueNumber,
} from '../common/interfaces';
import { detectNameColumn, detectPhoneColumn } from './columns';
import { checkNumber, extractNumbers } from './rules';

const isEmptyCell = (value: unknown) =>
  value === undefined || value === null || String(value).trim() === '';

/**
 * Analyses parsed rows. Throws AppError (NO_DATA, NO_PHONE_COLUMN) when there is nothing to analyse.
 */
export function analyzeRows(data: ParsedDataRow[], options: AnalyzeOptions = {}): AnalysisReport {
  if (!data || data.length === 0) {
    throw new AppError('No data found in the uploaded file', 'NO_DATA');
  }

  const phoneColumn = options.phoneColumn || detectPhoneColumn(data);
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

  const nameColumn =
    options.nameColumn === undefined ? detectNameColumn(data) : options.nameColumn || null;
  const rules = { strict: options.strict !== false };
  const dedupe = options.dedupe ?? 'off';

  const rows: ProcessedRow[] = [];
  const validRows: ProcessedRow[] = [];
  const invalidRows: ProcessedRow[] = [];
  const occurrences = new Map<string, ProcessedRow[]>();
  let totalNumbersExtracted = 0;
  let recordsWithMultipleNumbers = 0;
  let emptyRecords = 0;

  for (const row of data) {
    const phoneValue = row[phoneColumn];
    const nameValue = nameColumn ? row[nameColumn] : undefined;
    const withName = (processed: ProcessedRow): ProcessedRow => {
      if (nameColumn && nameValue) processed.name = String(nameValue);
      return processed;
    };

    if (isEmptyCell(phoneValue)) {
      emptyRecords++;
      if (options.skipEmpty) continue;
      const invalid: ProcessedRow = {
        ...row,
        validationStatus: 'INVALID',
        validationReason: 'Empty phone number',
        originalPhone: '',
        sanitizedPhone: '',
        numbersExtracted: 0,
      };
      invalidRows.push(invalid);
      rows.push(invalid);
      continue;
    }

    const cell = String(phoneValue);
    const found = extractNumbers(cell, rules);
    totalNumbersExtracted += found.all.length;
    if (found.all.length > 1) recordsWithMultipleNumbers++;

    const picked = options.multiple === 'first' ? found.valid.slice(0, 1) : found.valid;

    if (picked.length === 0) {
      const check = checkNumber(cell, rules);
      const invalid = withName({
        ...row,
        validationStatus: 'INVALID',
        validationReason: check.reason || 'Invalid format',
        originalPhone: cell,
        sanitizedPhone: check.sanitized,
        numbersExtracted: found.all.length,
      });
      invalidRows.push(invalid);
      rows.push(invalid);
      continue;
    }

    for (const phone of picked) {
      const valid = withName({
        ...row,
        [phoneColumn]: phone,
        validationStatus: 'VALID',
        originalPhone: cell,
        sanitizedPhone: phone,
        numbersExtracted: found.all.length,
        allExtractedNumbers: found.all.join(', '),
      });
      validRows.push(valid);
      rows.push(valid);
      const seen = occurrences.get(phone);
      if (seen) seen.push(valid);
      else occurrences.set(phone, [valid]);
    }
  }

  // The occurrence kept for each number; every other occurrence is a duplicate
  const duplicates = new Set<ProcessedRow>();
  const unique: UniqueNumber[] = [];
  for (const [phone, list] of occurrences) {
    const kept = dedupe === 'last' ? list[list.length - 1] : list[0];
    for (const occurrence of list) if (occurrence !== kept) duplicates.add(occurrence);
    const named = dedupe === 'last' ? kept : list.find((r) => r.name !== undefined);
    unique.push({ phone, name: named?.name, occurrences: list.length });
  }

  const totalValidNumbers = validRows.length;
  const removing = dedupe !== 'off';
  const keep = (row: ProcessedRow) => !removing || !duplicates.has(row);

  const analytics: ProcessingAnalytics = {
    totalNumbersExtracted,
    totalValidNumbers,
    totalInvalidNumbers: invalidRows.length,
    recordsWithMultipleNumbers,
    averageNumbersPerRecord: totalNumbersExtracted / data.length,
    duplicateNumbers: totalValidNumbers - occurrences.size,
    uniqueValidNumbers: occurrences.size,
    duplicatesRemoved: removing ? duplicates.size : 0,
    emptyRecords,
  };

  return {
    phoneColumn,
    nameColumn: nameColumn || undefined,
    totalRecords: data.length,
    rows: rows.filter(keep),
    validRows: validRows.filter(keep),
    invalidRows,
    duplicateRows: validRows.filter((row) => duplicates.has(row)),
    unique,
    analytics,
  };
}
