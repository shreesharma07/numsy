#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as net from 'net';
import { Logger } from '@nestjs/common';

const logger = new Logger('ServerCLI');

/**
 * CLI Options interface
 */
interface CLIOptions {
  port?: number;
  page?: boolean;
  help?: boolean;
}

/**
 * Check if a port is available
 */
async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
}

/**
 * Find an available port starting from the preferred port
 */
async function findAvailablePort(preferredPort: number): Promise<number> {
  let port = preferredPort;
  const maxAttempts = 100;

  for (let i = 0; i < maxAttempts; i++) {
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
  }

  throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
}

/**
 * Parse command line arguments
 */
function parseCLIArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--port':
      case '-p':
        const portValue = parseInt(args[++i]);
        if (!isNaN(portValue) && portValue >= 1024 && portValue <= 65535) {
          options.port = portValue;
        } else {
          logger.error('Invalid port number. Using default.');
        }
        break;

      case '--page':
      case '--serve':
      case '-s':
        options.page = true;
        break;

      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * Display help information
 */
function displayHelp(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    NUMSY SERVER CLI                           ║
╚═══════════════════════════════════════════════════════════════╝

Usage: numsy-serve [options]

Options:
  -p, --port <number>     Specify port number (default: 68679)
  -s, --page, --serve     Serve the HTML utility page
  -h, --help              Display this help message

Examples:
  $ numsy-serve                    # Start server on default port
  $ numsy-serve --port 3000        # Start server on port 3000
  $ numsy-serve --page             # Serve HTML utility page
  $ numsy-serve -p 8080 --page     # Custom port with HTML page

Environment Variables:
  PORT                    Override default port
  NODE_ENV                Set environment (development/production)

For more information, visit:
  https://github.com/shreesharma07/numsy
`);
}

/**
 * Bootstrap the NestJS application
 */
async function bootstrap(): Promise<void> {
  try {
    const options = parseCLIArgs();

    if (options.help) {
      displayHelp();
      process.exit(0);
    }

    // Determine preferred port
    const preferredPort = options.port || parseInt(process.env.PORT || '68679') || 68679;

    // Find available port
    logger.log(`Looking for available port starting from ${preferredPort}...`);
    const port = await findAvailablePort(preferredPort);

    if (port !== preferredPort) {
      logger.warn(`Port ${preferredPort} is in use. Using port ${port} instead.`);
    }

    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    // Enable CORS
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Set global prefix
    app.setGlobalPrefix('api');

    // Start listening
    await app.listen(port);

    const url = `http://localhost:${port}`;
    const apiUrl = `${url}/api`;
    const healthUrl = `${url}/api/health`;
    const pageUrl = options.page ? `${url}` : null;

    logger.log(`
╔═══════════════════════════════════════════════════════════════╗
║                  ✅ Server Started Successfully                ║
╚═══════════════════════════════════════════════════════════════╝

🚀 Server running on:      ${url}
📡 API endpoint:           ${apiUrl}
💚 Health check:           ${healthUrl}
${pageUrl ? `🌐 Utility page:          ${pageUrl}\n` : ''}
📝 Environment:            ${process.env.NODE_ENV || 'development'}
⚡ Process ID:             ${process.pid}

Press Ctrl+C to stop the server
    `);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM signal received: closing HTTP server');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('\nSIGINT signal received: closing HTTP server');
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
bootstrap();
