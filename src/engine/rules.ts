/**
 * Validation rules
 * One definition of "a valid Indian mobile number" for every Numsy surface
 */

import { PHONE_LENGTH } from '../common/functions/constants';
import {
  finalRegexValidation,
  findPhoneCandidates,
  sanitizePhoneNumber,
  validatePhoneNumber,
} from '../common/functions/phone.functions';
import { PhoneValidationResult } from '../common/interfaces';

export interface RuleOptions {
  /**
   * Reject dummy and test patterns (all-same digits, 1234567890, 9999900000...). Default: true.
   * When false only the shape is checked: 10 digits starting with 6-9.
   */
  strict?: boolean;
}

/**
 * How valid numbers are written in results and exports
 * - plain:  9876501234
 * - e164:   +919876501234
 * - spaced: +91 98765 01234
 */
export type NumberStyle = 'plain' | 'e164' | 'spaced';

export const NUMBER_STYLES: NumberStyle[] = ['plain', 'e164', 'spaced'];

/**
 * Validates one value: sanitise, check the shape, then (strict) the dummy-pattern rules
 */
export function checkNumber(phone: string, options?: RuleOptions): PhoneValidationResult {
  const basic = validatePhoneNumber(phone);
  if (!basic.isValid || options?.strict === false) return basic;

  const final = finalRegexValidation(basic.sanitized);
  return final.isValid
    ? { original: phone, sanitized: final.sanitized, isValid: true }
    : { original: phone, sanitized: final.sanitized, isValid: false, reason: final.reason };
}

export interface ExtractedNumbers {
  /** Every distinct 10-digit candidate, in order of appearance */
  all: string[];
  valid: string[];
  invalid: Array<{ number: string; reason: string }>;
}

/**
 * Finds every distinct 10-digit number in free text and validates each one
 */
export function extractNumbers(text: string, options?: RuleOptions): ExtractedNumbers {
  const result: ExtractedNumbers = { all: [], valid: [], invalid: [] };
  const seen = new Set<string>();

  for (const candidate of findPhoneCandidates(String(text ?? ''))) {
    const sanitized = sanitizePhoneNumber(candidate);
    if (sanitized.length !== PHONE_LENGTH.INDIAN_MOBILE || seen.has(sanitized)) continue;
    seen.add(sanitized);
    result.all.push(sanitized);

    const check = checkNumber(sanitized, options);
    if (check.isValid) result.valid.push(check.sanitized);
    else result.invalid.push({ number: sanitized, reason: check.reason ?? 'Invalid number' });
  }

  return result;
}

/**
 * Writes a valid 10-digit number in the requested style; anything else is returned unchanged
 */
export function formatNumber(phone: string, style: NumberStyle = 'plain'): string {
  if (style === 'plain' || !phone) return phone;
  const digits = sanitizePhoneNumber(phone);
  if (!/^[6-9]\d{9}$/.test(digits)) return phone;
  return style === 'e164' ? `+91${digits}` : `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}
