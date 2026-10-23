/**
 * Optional: run both dashboards against your own files and compare them with the engine.
 *
 *   NUMSY_REAL_FILES="C:\data\a.xlsx;C:\data\b.csv" pnpm test:ui e2e/real-files.spec.ts
 *
 * Files may hold personal data, so this spec never logs names, numbers or file names: only the
 * file's position, size, counts and timings. Traces, screenshots and videos are off globally.
 */
import { expect, test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { performance } from 'node:perf_hooks';
import { Numsy } from '../src';
import { analyzeRows } from '../src/engine';
import { fmt, openDashboard, setTab, tile } from './helpers';

const files = (process.env.NUMSY_REAL_FILES ?? '')
  .split(/[;\n]/)
  .map((f) => f.trim())
  .filter(Boolean);

test.describe('real files', () => {
  test.skip(files.length === 0, 'set NUMSY_REAL_FILES to run');
  test.setTimeout(5 * 60_000);

  files.forEach((file, index) => {
    test(`file #${index + 1}`, async ({ page }, info) => {
      const sizeMb = (fs.statSync(file).size / 1048576).toFixed(1);
      const label = `[${info.project.name}] file #${index + 1} (${sizeMb} MB)`;

      let expected: ReturnType<typeof analyzeRows> | null = null;
      try {
        const parsed = await new Numsy({ enableLogging: false, normalizeColumns: false }).parseFile(
          file,
        );
        expected = analyzeRows(parsed.data);
      } catch {
        expected = null;
      }

      await openDashboard(page, info);
      const started = performance.now();
      await page.locator('input[type="file"]').setInputFiles({
        name: `upload${path.extname(file).toLowerCase()}`,
        mimeType: 'application/octet-stream',
        buffer: fs.readFileSync(file),
      });

      if (!expected) {
        await expect(page.getByRole('alert')).toBeVisible({ timeout: 120_000 });
        console.log(`${label}: unreadable, the dashboard showed an error as expected`);
        return;
      }

      await expect(tile(page, 'Records')).toHaveText(fmt(expected.totalRecords), {
        timeout: 180_000,
      });
      const shownMs = Math.round(performance.now() - started);
      const a = expected.analytics;
      await expect(tile(page, 'Valid')).toHaveText(fmt(a.totalValidNumbers));
      await expect(tile(page, 'Invalid')).toHaveText(fmt(a.totalInvalidNumbers));
      await expect(tile(page, 'Unique')).toHaveText(fmt(a.uniqueValidNumbers));
      await expect(tile(page, 'Duplicates')).toHaveText(fmt(a.duplicateNumbers));

      const dedupeStarted = performance.now();
      await page.getByLabel('Keep first').check();
      await expect(setTab(page, 'Valid')).toContainText(fmt(a.uniqueValidNumbers), {
        timeout: 120_000,
      });
      const dedupeMs = Math.round(performance.now() - dedupeStarted);

      console.log(
        `${label}: ${fmt(expected.totalRecords)} rows · ${fmt(a.totalValidNumbers)} valid · ` +
          `${fmt(a.totalInvalidNumbers)} invalid · ${fmt(a.uniqueValidNumbers)} unique · ` +
          `upload→results ${shownMs} ms · de-dupe ${dedupeMs} ms`,
      );
    });
  });
});
