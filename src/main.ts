/**
 * Development entry point: starts the dashboard + REST API (same as `numsy dashboard`)
 */

import { startServer } from './cli/server';

startServer().catch((error) => {
  console.error(`Failed to start server: ${(error as Error).message}`);
  process.exit(1);
});
