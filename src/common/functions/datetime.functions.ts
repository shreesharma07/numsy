/**
 * Date and Time Utility Functions
 * Uses moment-timezone for timezone-aware operations
 */

import moment from 'moment-timezone';

/**
 * Gets the system's default timezone
 */
export function getSystemTimezone(): string {
  try {
    return moment.tz.guess();
  } catch (error) {
    return 'UTC';
  }
}

/**
 * Gets current timestamp with timezone
 */
export function getCurrentTimestamp(timezone?: string): string {
  try {
    const tz = timezone || getSystemTimezone();
    return moment().tz(tz).format();
  } catch (error) {
    return new Date().toISOString();
  }
}

/**
 * Formats a date with timezone
 */
export function formatDateTime(
  date: Date | string | number,
  format: string = 'YYYY-MM-DD HH:mm:ss',
  timezone?: string,
): string {
  try {
    const tz = timezone || getSystemTimezone();
    return moment(date).tz(tz).format(format);
  } catch (error) {
    return new Date(date).toISOString();
  }
}

/**
 * Gets current date in specified format
 */
export function getCurrentDate(format: string = 'YYYY-MM-DD', timezone?: string): string {
  try {
    const tz = timezone || getSystemTimezone();
    return moment().tz(tz).format(format);
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Gets current time in specified format
 */
export function getCurrentTime(format: string = 'HH:mm:ss', timezone?: string): string {
  try {
    const tz = timezone || getSystemTimezone();
    return moment().tz(tz).format(format);
  } catch (error) {
    return new Date().toTimeString().split(' ')[0];
  }
}

/**
 * Gets a timestamp for file naming (no special characters)
 */
export function getFileTimestamp(timezone?: string): string {
  try {
    const tz = timezone || getSystemTimezone();
    return moment().tz(tz).format('YYYYMMDD_HHmmss');
  } catch (error) {
    return Date.now().toString();
  }
}

/**
 * Gets Unix timestamp
 */
export function getUnixTimestamp(): number {
  try {
    return moment().unix();
  } catch (error) {
    return Math.floor(Date.now() / 1000);
  }
}

/**
 * Gets millisecond timestamp
 */
export function getMillisTimestamp(): number {
  try {
    return moment().valueOf();
  } catch (error) {
    return Date.now();
  }
}

/**
 * Parses a date string with timezone
 */
export function parseDateTime(
  dateStr: string,
  format?: string,
  timezone?: string,
): moment.Moment | null {
  try {
    const tz = timezone || getSystemTimezone();
    if (format) {
      return moment.tz(dateStr, format, tz);
    }
    return moment.tz(dateStr, tz);
  } catch (error) {
    return null;
  }
}

/**
 * Checks if a date is valid
 */
export function isValidDate(date: any): boolean {
  try {
    return moment(date).isValid();
  } catch (error) {
    return false;
  }
}

/**
 * Gets the difference between two dates
 */
export function getDateDifference(
  date1: Date | string | number,
  date2: Date | string | number,
  unit: moment.unitOfTime.Diff = 'days',
): number {
  try {
    const m1 = moment(date1);
    const m2 = moment(date2);
    return m1.diff(m2, unit);
  } catch (error) {
    return 0;
  }
}

/**
 * Formats a relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string | number, timezone?: string): string {
  try {
    const tz = timezone || getSystemTimezone();
    return moment(date).tz(tz).fromNow();
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Adds time to a date
 */
export function addTime(
  date: Date | string | number,
  amount: number,
  unit: moment.unitOfTime.DurationConstructor,
  timezone?: string,
): string {
  try {
    const tz = timezone || getSystemTimezone();
    return moment(date).tz(tz).add(amount, unit).format();
  } catch (error) {
    return new Date(date).toISOString();
  }
}

/**
 * Subtracts time from a date
 */
export function subtractTime(
  date: Date | string | number,
  amount: number,
  unit: moment.unitOfTime.DurationConstructor,
  timezone?: string,
): string {
  try {
    const tz = timezone || getSystemTimezone();
    return moment(date).tz(tz).subtract(amount, unit).format();
  } catch (error) {
    return new Date(date).toISOString();
  }
}

/**
 * Gets start of day
 */
export function getStartOfDay(date?: Date | string | number, timezone?: string): string {
  try {
    const tz = timezone || getSystemTimezone();
    const d = date || new Date();
    return moment(d).tz(tz).startOf('day').format();
  } catch (error) {
    const d = date ? new Date(date) : new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
}

/**
 * Gets end of day
 */
export function getEndOfDay(date?: Date | string | number, timezone?: string): string {
  try {
    const tz = timezone || getSystemTimezone();
    const d = date || new Date();
    return moment(d).tz(tz).endOf('day').format();
  } catch (error) {
    const d = date ? new Date(date) : new Date();
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }
}

/**
 * Formats duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  try {
    const duration = moment.duration(milliseconds);
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  } catch (error) {
    return `${Math.floor(milliseconds / 1000)}s`;
  }
}

/**
 * Gets localized date string
 */
export function getLocalizedDate(
  date: Date | string | number,
  locale: string = 'en',
  timezone?: string,
): string {
  try {
    const tz = timezone || getSystemTimezone();
    return moment(date).tz(tz).locale(locale).format('LLL');
  } catch (error) {
    return new Date(date).toLocaleString(locale);
  }
}
