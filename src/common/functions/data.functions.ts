/**
 * Data Processing Functions
 * Pure functions for data manipulation and transformation
 */

import { ParsedDataRow } from '../interfaces';
import { COLUMN_ALIASES } from './constants';
import { isNonEmptyString, isValidArray } from '../helpers';

/**
 * Finds a matching field name from a list of aliases
 */
export function findMatchingField(row: Record<string, any>, aliases: string[]): string | null {
  try {
    if (!row || !isValidArray(aliases)) {
      return null;
    }

    const keys = Object.keys(row);
    for (const key of keys) {
      const keyLower = key.toLowerCase().trim();
      if (aliases.includes(keyLower)) {
        return key;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Normalizes column names to standard format
 */
export function normalizeRowColumns(row: ParsedDataRow): ParsedDataRow {
  const normalized: ParsedDataRow = {};

  try {
    if (!row) {
      return normalized;
    }

    // Find and map name field
    const nameField = findMatchingField(row, COLUMN_ALIASES.name);
    if (nameField) {
      normalized.name = row[nameField];
    }

    // Find and map phone field
    const phoneField = findMatchingField(row, COLUMN_ALIASES.phone);
    if (phoneField) {
      normalized.phone = row[phoneField];
    }

    // Find and map address field
    const addressField = findMatchingField(row, COLUMN_ALIASES.address);
    if (addressField) {
      normalized.address = row[addressField];
    }

    // Keep any other fields as-is
    Object.keys(row).forEach((key) => {
      const keyLower = key.toLowerCase();
      if (
        !COLUMN_ALIASES.name.includes(keyLower) &&
        !COLUMN_ALIASES.phone.includes(keyLower) &&
        !COLUMN_ALIASES.address.includes(keyLower)
      ) {
        normalized[key] = row[key];
      }
    });

    return normalized;
  } catch (error) {
    return normalized;
  }
}

/**
 * Normalizes an array of data rows
 */
export function normalizeDataRows(data: ParsedDataRow[]): ParsedDataRow[] {
  try {
    if (!isValidArray(data)) {
      return [];
    }

    return data.map((row) => normalizeRowColumns(row));
  } catch (error) {
    return [];
  }
}

/**
 * Detects phone column from data
 */
export function detectPhoneColumn(data: ParsedDataRow[]): string | null {
  try {
    if (!isValidArray(data) || data.length === 0) {
      return null;
    }

    const firstRow = data[0];
    const keys = Object.keys(firstRow);

    // First, try to find an exact match
    for (const key of keys) {
      const keyLower = key.toLowerCase().trim();
      if (COLUMN_ALIASES.phone.includes(keyLower)) {
        return key;
      }
    }

    // If no exact match, try to find a column with phone-like values
    for (const key of keys) {
      const value = firstRow[key];
      if (isNonEmptyString(value)) {
        const cleaned = String(value).replace(/\D/g, '');
        if (cleaned.length >= 10) {
          return key;
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Removes duplicate rows based on a key field
 */
export function removeDuplicates(data: ParsedDataRow[], keyField: string): ParsedDataRow[] {
  try {
    if (!isValidArray(data)) {
      return [];
    }

    const seen = new Set<string>();
    const result: ParsedDataRow[] = [];

    for (const row of data) {
      const keyValue = row[keyField];
      if (keyValue && !seen.has(String(keyValue))) {
        seen.add(String(keyValue));
        result.push(row);
      }
    }

    return result;
  } catch (error) {
    return data;
  }
}

/**
 * Filters rows based on a predicate function
 */
export function filterRows(
  data: ParsedDataRow[],
  predicate: (row: ParsedDataRow) => boolean,
): ParsedDataRow[] {
  try {
    if (!isValidArray(data)) {
      return [];
    }

    return data.filter(predicate);
  } catch (error) {
    return [];
  }
}

/**
 * Sorts rows by a specific field
 */
export function sortRowsByField(
  data: ParsedDataRow[],
  field: string,
  order: 'asc' | 'desc' = 'asc',
): ParsedDataRow[] {
  try {
    if (!isValidArray(data)) {
      return [];
    }

    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      const comparison = String(aVal).localeCompare(String(bVal));
      return order === 'asc' ? comparison : -comparison;
    });
  } catch (error) {
    return data;
  }
}

/**
 * Groups rows by a specific field
 */
export function groupRowsByField(
  data: ParsedDataRow[],
  field: string,
): Record<string, ParsedDataRow[]> {
  const groups: Record<string, ParsedDataRow[]> = {};

  try {
    if (!isValidArray(data)) {
      return groups;
    }

    for (const row of data) {
      const key = String(row[field] || 'undefined');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    }

    return groups;
  } catch (error) {
    return groups;
  }
}

/**
 * Extracts unique values from a specific field
 */
export function extractUniqueValues(data: ParsedDataRow[], field: string): string[] {
  try {
    if (!isValidArray(data)) {
      return [];
    }

    const values = data
      .map((row) => row[field])
      .filter((val) => val !== undefined && val !== null)
      .map((val) => String(val));

    return [...new Set(values)];
  } catch (error) {
    return [];
  }
}
