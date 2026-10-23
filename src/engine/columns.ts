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

/** How many of the sampled rows hold a phone-like value (10+ digits) in a column */
const phoneLikeCount = (sample: ParsedDataRow[], key: string) =>
  sample.filter((row) => {
    const value = row[key];
    const text = typeof value === 'number' ? String(value) : value;
    return isNonEmptyString(text) && sanitizePhoneNumber(text).length >= 10;
  }).length;

/** The column with the most phone-like values, or null when none has any */
const bestByContent = (sample: ParsedDataRow[], keys: string[]) => {
  let best: string | null = null;
  let bestCount = 0;
  for (const key of keys) {
    const count = phoneLikeCount(sample, key);
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best;
};

/**
 * Finds the phone column. Header hints ("phone", "mobile", "contact"…) come first, but a hinted
 * column must also hold phone-like values, so a "Contact" column of names loses to the numbers.
 * Then any column with phone-like values; finally the first hinted header.
 */
export function detectPhoneColumn(data: ParsedDataRow[]): string | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  const keys = Object.keys(data[0]);
  const sample = data.slice(0, CONTENT_SAMPLE);
  const hinted = keys.filter((key) => {
    const keyLower = key.toLowerCase().trim();
    return PHONE_HINTS.some((hint) => keyLower.includes(hint));
  });

  return bestByContent(sample, hinted) ?? bestByContent(sample, keys) ?? hinted[0] ?? null;
}

/**
 * Finds the contact-name column by header name (English and common Indian/European aliases)
 */
export function detectNameColumn(data: ParsedDataRow[]): string | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  return findMatchingField(data[0], COLUMN_ALIASES.name);
}
