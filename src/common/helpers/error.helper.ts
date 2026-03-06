/**
 * Error Helper
 * Provides centralized error handling utilities
 */

import { ErrorResponse, SuccessResponse, ApiResponse } from '../interfaces';
import { LoggerHelper } from './logger.helper';

const logger = new LoggerHelper('ErrorHelper');

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string | Error | AppError,
  code?: string,
  details?: any,
): ErrorResponse {
  let errorMessage: string;
  let errorCode: string | undefined = code;
  let errorDetails: any = details;

  try {
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error instanceof AppError) {
      errorMessage = error.message;
      errorCode = error.code || errorCode;
      errorDetails = error.details || errorDetails;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = 'An unknown error occurred';
    }

    logger.error(`Error occurred: ${errorMessage}`, errorCode);

    return {
      success: false,
      error: errorMessage,
      code: errorCode,
      details: errorDetails,
    };
  } catch (handlerError) {
    logger.error('Error in error handler', String(handlerError));
    return {
      success: false,
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(data: T, message?: string): SuccessResponse<T> {
  try {
    return {
      success: true,
      data,
      message,
    };
  } catch (error) {
    logger.error('Error creating success response', String(error));
    throw new AppError('Failed to create success response');
  }
}

/**
 * Wraps async functions with error handling
 */
export async function handleAsync<T>(
  fn: () => Promise<T>,
  errorMessage?: string,
): Promise<ApiResponse<T>> {
  try {
    const result: T = await fn();
    return createSuccessResponse(result);
  } catch (error) {
    const message = errorMessage || 'Operation failed';
    logger.error(message, String(error));
    return createErrorResponse(error as Error);
  }
}

/**
 * Wraps sync functions with error handling
 */
export function handleSync<T>(fn: () => T, errorMessage?: string): ApiResponse<T> {
  try {
    const result: T = fn();
    return createSuccessResponse(result);
  } catch (error) {
    const message = errorMessage || 'Operation failed';
    logger.error(message, String(error));
    return createErrorResponse(error as Error);
  }
}

/**
 * Validates required parameters
 */
export function validateRequired(params: Record<string, any>, requiredFields: string[]): void {
  const missingFields: string[] = [];

  try {
    for (const field of requiredFields) {
      if (params[field] === undefined || params[field] === null || params[field] === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new AppError(
        `Missing required fields: ${missingFields.join(', ')}`,
        'VALIDATION_ERROR',
        { missingFields },
      );
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Validation error', String(error));
    throw new AppError('Validation failed');
  }
}
