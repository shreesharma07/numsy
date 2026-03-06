/**
 * Logger Helper
 * Provides centralized logging functionality with different log levels
 */

import { LoggerOptions } from '../interfaces';

export class LoggerHelper {
  private context: string;
  private enableTimestamp: boolean;
  private logLevel: 'log' | 'error' | 'warn' | 'debug' | 'verbose';

  constructor(context: string = 'App', options?: LoggerOptions) {
    this.context = context;
    this.enableTimestamp = options?.timestamp ?? true;
    this.logLevel = options?.level ?? 'log';
  }

  /**
   * Formats log message with timestamp and context
   */
  private formatMessage(level: string, message: string): string {
    const timestamp = this.enableTimestamp ? `[${new Date().toISOString()}]` : '';
    const contextStr = this.context ? `[${this.context}]` : '';
    const levelStr = `[${level.toUpperCase()}]`;

    return `${timestamp} ${levelStr} ${contextStr} ${message}`.trim();
  }

  /**
   * Log informational messages
   */
  log(message: string, ...optionalParams: any[]): void {
    try {
      console.log(this.formatMessage('log', message), ...optionalParams);
    } catch (error) {
      console.error('Logger error:', error);
    }
  }

  /**
   * Log error messages
   */
  error(message: string, trace?: string, ...optionalParams: any[]): void {
    try {
      console.error(this.formatMessage('error', message), trace || '', ...optionalParams);
    } catch (error) {
      console.error('Logger error:', error);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, ...optionalParams: any[]): void {
    try {
      console.warn(this.formatMessage('warn', message), ...optionalParams);
    } catch (error) {
      console.error('Logger error:', error);
    }
  }

  /**
   * Log debug messages
   */
  debug(message: string, ...optionalParams: any[]): void {
    try {
      if (this.logLevel === 'debug' || this.logLevel === 'verbose') {
        console.debug(this.formatMessage('debug', message), ...optionalParams);
      }
    } catch (error) {
      console.error('Logger error:', error);
    }
  }

  /**
   * Log verbose messages
   */
  verbose(message: string, ...optionalParams: any[]): void {
    try {
      if (this.logLevel === 'verbose') {
        console.log(this.formatMessage('verbose', message), ...optionalParams);
      }
    } catch (error) {
      console.error('Logger error:', error);
    }
  }

  /**
   * Set context for logger
   */
  setContext(context: string): void {
    this.context = context;
  }
}
