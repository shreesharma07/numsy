#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as net from 'node:net';
import { Logger } from '@nestjs/common';

const logger = new Logger('ServerCLI');

/**
 * Options accepted by startServer
 */
export interface ServerOptions {
  port?: number;
  page?: boolean;
}

/**
 * CLI Options interface
 */
interface CLIOptions extends ServerOptions {
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
 * Parse a port value, returning undefined when it is out of range
 */
export function parsePort(value: string | undefined): number | undefined {
  const port = parseInt(String(value), 10);
  return !Number.isNaN(port) && port >= 1024 && port <= 65535 ? port : undefined;
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
      case '-p': {
        const port = parsePort(args[++i]);
        if (port) {
          options.port = port;
        } else {
          logger.error('Invalid port number. Using default.');
        }
        break;
      }

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
Numsy server — web UI + REST API

Usage: numsy serve [options]      (or: numsy-serve [options])

Options:
  -p, --port <number>     Port to listen on (default: 3000, next free port is used if busy)
  -h, --help              Display this help message

Environment Variables:
  PORT                    Override default port
  NODE_ENV                Set environment (development/production)

Docs: https://shreesharma07.github.io/numsy/
`);
}

/**
 * Start the NestJS server (web UI on "/", API under "/api")
 */
export async function startServer(options: ServerOptions = {}): Promise<void> {
  const preferredPort = options.port || parsePort(process.env.PORT) || 3000;

  logger.log(`Looking for available port starting from ${preferredPort}...`);
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    logger.warn(`Port ${preferredPort} is in use. Using port ${port} instead.`);
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Routes are already namespaced by @Controller('api'), so no global prefix here
  await app.listen(port);

  const url = `http://localhost:${port}`;

  logger.log(`
  Numsy server is running

  Web UI         ${url}
  API            ${url}/api
  Health check   ${url}/api/health
  Environment    ${process.env.NODE_ENV || 'development'}
  Process ID     ${process.pid}

  Press Ctrl+C to stop the server
    `);

  const shutdown = async (signal: string) => {
    logger.log(`${signal} received: closing HTTP server`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * Bootstrap when executed directly as the numsy-serve binary
 */
async function bootstrap(): Promise<void> {
  const options = parseCLIArgs();

  if (options.help) {
    displayHelp();
    process.exit(0);
  }

  try {
    await startServer(options);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}
