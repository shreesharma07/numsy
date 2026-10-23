import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests for the two Numsy dashboards:
 * - local:   `numsy dashboard` served by the built CLI (dist/) on port 6790
 * - website: the playground of the built website (website/dist) on port 4173
 *
 * Build first: `pnpm build && pnpm --filter @numsy/website build`.
 * PLAYWRIGHT_CHANNEL=chrome (or msedge) uses an installed browser instead of Playwright's Chromium.
 */
const channel = process.env.PLAYWRIGHT_CHANNEL || undefined;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list']],
  // Never keep traces, screenshots or videos: tests may be pointed at private files (see real-files.spec.ts)
  use: { trace: 'off', screenshot: 'off', video: 'off', acceptDownloads: true },
  webServer: [
    {
      command: 'node dist/cli/index.js dashboard --port 6790',
      url: 'http://localhost:6790/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'pnpm --filter @numsy/website exec vite preview --port 4173 --strictPort',
      url: 'http://localhost:4173/playground/',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
  projects: [
    {
      name: 'local',
      use: { ...devices['Desktop Chrome'], channel, baseURL: 'http://localhost:6790' },
    },
    {
      name: 'website',
      use: { ...devices['Desktop Chrome'], channel, baseURL: 'http://localhost:4173' },
    },
  ],
});
