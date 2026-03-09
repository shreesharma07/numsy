/**
 * Server entry point for NestJS application
 * This file is used when running the web server
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application
 * Starts the server on configured port
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Enable CORS for development
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Set global prefix for API routes
    app.setGlobalPrefix('');

    const port = process.env.PORT || 3000;
    await app.listen(port);

    // Beautiful startup banner
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                                                               ║');
    console.log('║     \x1b[1m\x1b[36mNumsy - Phone Number Validator & Sanitizer\x1b[0m      ║');
    console.log('║                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(
      '  \x1b[32m✓\x1b[0m Server running at: \x1b[1m\x1b[36mhttp://localhost:' + port + '\x1b[0m',
    );
    console.log(
      '  \x1b[32m✓\x1b[0m Environment: \x1b[1m' +
        (process.env.NODE_ENV || 'development') +
        '\x1b[0m',
    );
    console.log(
      '  \x1b[32m✓\x1b[0m API Documentation: \x1b[36mhttp://localhost:' + port + '/api\x1b[0m',
    );
    console.log('');
    console.log('  \x1b[1m\x1b[33m📋 Features:\x1b[0m');
    console.log('    • Indian mobile number validation (10 digits, 6/7/8/9 prefix)');
    console.log('    • CSV, XLSX, XLS file processing');
    console.log('    • Advanced analytics & deduplication');
    console.log('    • Multi-number extraction per row');
    console.log('    • Dark/Light theme with system detection');
    console.log('');
    console.log('  \x1b[1m\x1b[35m🚀 Quick Start:\x1b[0m');
    console.log('    1. Open \x1b[36mhttp://localhost:' + port + '\x1b[0m in your browser');
    console.log('    2. Drag & drop or select a CSV/Excel file');
    console.log('    3. Click "Process File" to validate numbers');
    console.log('    4. Download the processed ZIP file');
    console.log('');
    console.log('  \x1b[1m\x1b[34m📊 API Endpoints:\x1b[0m');
    console.log('    GET    /api                 - API documentation page');
    console.log('    GET    /api/health-page     - Health check page');
    console.log('    GET    /api/health          - Health check (JSON)');
    console.log('    POST   /api/upload          - Upload and process file');
    console.log('    GET    /api/download/:id    - Download processed files');
    console.log('');
    console.log('  \x1b[90mPress Ctrl+C to stop the server\x1b[0m');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    logger.log(`Application started successfully on port ${port}`);
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();
