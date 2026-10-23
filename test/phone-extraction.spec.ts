/**
 * Phone extraction tests
 * Numbers written with spaces, dashes, brackets or a +91 prefix
 */

import { extractAndValidatePhoneNumbers, findPhoneCandidates } from '../src/common/functions';

describe('Phone extraction', () => {
  it('keeps formatted numbers together', () => {
    expect(findPhoneCandidates('+91 98765 01234 / (0) 70123-45678')).toEqual([
      '919876501234',
      '07012345678',
    ]);
  });

  it('splits several numbers separated only by spaces', () => {
    expect(findPhoneCandidates('98765 01234 91234 56789')).toEqual(['9876501234', '9123456789']);
  });

  it('extracts and validates numbers in free text', () => {
    const result = extractAndValidatePhoneNumbers(
      'Call 98765-01234 or 0 91234 56789, office 12345',
    );
    expect(result.validNumbers).toEqual(['9876501234', '9123456789']);
  });
});
