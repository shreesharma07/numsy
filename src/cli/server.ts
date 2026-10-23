#!/usr/bin/env node

import { spawn } from 'node:child_process';
import * as net from 'node:net';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from '../app.module';
import { PORT_CONSTANTS } from '../common/types/enums';
import { dashboardDir } from '../common/functions/paths';

const logger = new Logger('Numsy');

/**
 * Options accepted by startServer
 */
export interface ServerOptions {
  /** Preferred port (default: PORT env, then 6789). The next free port is used when busy. */
  port?: number;
  /** Interface to bind (default: 127.0.0.1, so only this machine can reach the dashboard) */
  host?: string;
  /** Open the dashboard in the default browser once listening */
  open?: boolean;
}

/**
 * A running server
 */
export interface RunningServer {
  url: string;
  port: number;
  close: () => Promise<void>;
}

const DEFAULT_HOST = '127.0.0.1';

/**
 * Check if a port is free on the given interface
 */
function isPortAvailable(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, host);
  });
}

/**
 * Find an available port starting from the preferred port
 */
async function findAvailablePort(preferredPort: number, host: string): Promise<number> {
  const maxAttempts = 100;
  for (let port = preferredPort; port < preferredPort + maxAttempts; port++) {
    if (port <= PORT_CONSTANTS.MAX && (await isPortAvailable(port, host))) return port;
  }
  throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
}

/**
 * Parse a port value, returning undefined when it is out of range
 */
export function parsePort(value: string | undefined): number | undefined {
  const port = Number.parseInt(String(value), 10);
  return !Number.isNaN(port) && port >= PORT_CONSTANTS.MIN && port <= PORT_CONSTANTS.MAX
    ? port
    : undefined;
}

/**
 * Opens a URL in the default browser without blocking or failing the server
 */
export function openBrowser(url: string): void {
  const [command, args] =
    process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '""', url]]
      : process.platform === 'darwin'
        ? ['open', [url]]
        : ['xdg-open', [url]];
  try {
    const child = spawn(command, args as string[], { detached: true, stdio: 'ignore' });
    child.on('error', () => logger.warn(`Could not open a browser. Visit ${url}`));
    child.unref();
  } catch {
    logger.warn(`Could not open a browser. Visit ${url}`);
  }
}

/**
 * Rejects requests whose Host header is not this server (blocks DNS-rebinding attacks
 * against a dashboard bound to localhost)
 */
const hostGuard = (host: string, port: number) => {
  const allowed = new Set(
    ['localhost', '127.0.0.1', '[::1]', host].flatMap((name) => [name, `${name}:${port}`]),
  );
  const open = host === '0.0.0.0' || host === '::';
  return (req: Request, res: Response, next: NextFunction) => {
    if (open || allowed.has(String(req.headers.host ?? '').toLowerCase())) return next();
    res.status(403).json({ statusCode: 403, message: 'Unexpected Host header' });
  };
};

/**
 * Start the dashboard: web UI on "/", REST API under "/api"
 */
export async function startServer(options: ServerOptions = {}): Promise<RunningServer> {
  const host = options.host || process.env.HOST || DEFAULT_HOST;
  const preferredPort = options.port || parsePort(process.env.PORT) || PORT_CONSTANTS.DEFAULT;
  const port = await findAvailablePort(preferredPort, host);

  if (port !== preferredPort) {
    logger.warn(`Port ${preferredPort} is in use. Using port ${port} instead.`);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn'],
  });
  app.use(hostGuard(host, port));
  // Pasted text is exported through a JSON body
  app.useBodyParser('json', { limit: '25mb' });
  app.disable('x-powered-by');
  await app.listen(port, host);

  const shown = host === '0.0.0.0' || host === '::' || host === DEFAULT_HOST ? 'localhost' : host;
  const url = `http://${shown}:${port}`;
  const ui = dashboardDir() ? url : `${url}  (UI not built: run "pnpm build")`;

  process.stdout.write(`
  \x1b[1mNumsy dashboard\x1b[0m is running

  Dashboard      ${ui}
  REST API       ${url}/api
  Health         ${url}/api/health
  Listening on   ${host}:${port}

  Press Ctrl+C to stop
`);

  if (options.open) openBrowser(url);

  const close = () => app.close();
  const shutdown = async () => {
    await close();
    process.exit(0);
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  return { url, port, close };
}

if (require.main === module) {
  startServer({ open: process.argv.includes('--open') }).catch((error) => {
    logger.error(`Failed to start server: ${(error as Error).message}`);
    process.exit(1);
  });
}
