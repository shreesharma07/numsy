/**
 * Column detection for tabular data
 */

import { COLUMN_ALIASES } from '../common/functions/constants';
import { findMatchingField } from '../common/functions/data.functions';
import { sanitizePhoneNumber } from '../common/functions/phone.functions';
import { isNonEmptyString } from '../common/helpers/validation.helper';
import { ParsedDataRow } from '../common/interfaces';

const PHONE_HINTS = [
  'phone',
  'mobile',
  'contact',
  'telephone',
  'number',
  'phone_number',
  'mobile_number',
];

/** Rows sampled when looking for phone-like values */
const CONTENT_SAMPLE = 25;

/**
 * Finds the phone column: first by header name, then by phone-like values in the first rows
 */
export function detectPhoneColumn(data: ParsedDataRow[]): string | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  const keys = Object.keys(data[0]);

  for (const key of keys) {
    const keyLower = key.toLowerCase().trim();
    if (PHONE_HINTS.some((hint) => keyLower.includes(hint))) return key;
  }

  for (const row of data.slice(0, CONTENT_SAMPLE)) {
    for (const key of keys) {
      const value = row[key];
      const text = typeof value === 'number' ? String(value) : value;
      if (isNonEmptyString(text) && sanitizePhoneNumber(text).length >= 10) return key;
    }
  }

  return null;
}

/**
 * Finds the contact-name column by header name (English and common Indian/European aliases)
 */
export function detectNameColumn(data: ParsedDataRow[]): string | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  return findMatchingField(data[0], COLUMN_ALIASES.name);
}
