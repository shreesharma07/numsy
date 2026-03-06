/**
 * Main entry point for the Numsy package
 * Provides named and default exports for easy consumption
 */

// Export all core classes
export { Numsy, Parser, PhoneValidator, FileProcessor } from './core';

// Export all interfaces
export * from './common/interfaces';

// Export all functions
export * from './common/functions';

// Export all helpers
export * from './common/helpers';

// Default export - Numsy class
export { default } from './core/Numsy';
