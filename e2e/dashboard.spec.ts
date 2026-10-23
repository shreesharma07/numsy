/**
 * The same scenario runs against the local dashboard and the website playground.
 * Expected values come from the engine itself, so both UIs must match the library exactly.
 * Synthetic data only.
 */
import { expect, test } from '@playwright/test';
import * as ExcelJS from 'exceljs';
import {
  analyzeRows,
  extractDataset,
  parseCsv,
  reportDataset,
  serializeDataset,
  shapeDataset,
} from '../src/engine';
import { SAMPLE_TEXT, sampleCsv } from '../website/src/dashboard/sample';
import { download, entry, expectTiles, fmt, openDashboard, setTab, tile, upload } from './helpers';

const rows = parseCsv(sampleCsv()).data;
const report = analyzeRows(rows);

test.describe('dashboard', () => {
  test.beforeEach(async ({ page }, info) => {
    await openDashboard(page, info);
  });

  test('states the privacy guarantees and links the disclaimer', async ({ page }) => {
    const note = page.getByRole('note');
    await expect(note).toContainText('never sells or shares it with third parties');
    await expect(note).toContainText('never uses it for AI training');
    await expect(note.getByRole('link', { name: 'Privacy & data disclaimer' })).toHaveAttribute(
      'href',
      /\/privacy\/?$/,
    );
  });

  test('analyses the sample exactly like the engine', async ({ page }) => {
    await page.getByRole('button', { name: 'Use sample data' }).click();
    await expect(page.getByRole('heading', { name: 'numsy-sample.csv' })).toBeVisible();
    await expectTiles(page, {
      Records: report.totalRecords,
      Valid: report.analytics.totalValidNumbers,
      Invalid: report.analytics.totalInvalidNumbers,
      Unique: report.analytics.uniqueValidNumbers,
      Duplicates: report.analytics.duplicateNumbers,
    });
    await expect(setTab(page, 'All rows')).toContainText(fmt(report.rows.length));
    await expect(setTab(page, 'Duplicates')).toContainText(fmt(report.duplicateRows.length));
    await expect(page.getByText(`1–50 of ${fmt(report.rows.length)}`)).toBeVisible();
  });

  test('applies duplicate and validation filters', async ({ page }) => {
    await page.getByRole('button', { name: 'Use sample data' }).click();

    const first = analyzeRows(rows, { dedupe: 'first' });
    await page.getByLabel('Keep first').check();
    await expect(tile(page, 'Removed')).toHaveText(fmt(first.analytics.duplicatesRemoved ?? 0));
    await expect(setTab(page, 'Valid')).toContainText(fmt(first.validRows.length));

    const loose = analyzeRows(rows, { dedupe: 'first', strict: false });
    await page.getByRole('switch', { name: 'Reject dummy numbers' }).uncheck();
    await expect(tile(page, 'Invalid')).toHaveText(fmt(loose.analytics.totalInvalidNumbers));

    const skip = analyzeRows(rows, { dedupe: 'first', strict: false, skipEmpty: true });
    await page.getByRole('switch', { name: 'Skip empty phone cells' }).check();
    await expect(setTab(page, 'Invalid')).toContainText(fmt(skip.invalidRows.length));
  });

  test('searches and pages through rows', async ({ page }) => {
    await page.getByRole('button', { name: 'Use sample data' }).click();
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page.getByText(`51–100 of ${fmt(report.rows.length)}`)).toBeVisible();

    await page.getByRole('searchbox', { name: 'Search rows' }).fill('Contact 0007');
    const body = page.locator('.results__table tbody tr');
    await expect(body).toHaveCount(report.rows.filter((r) => r.Name === 'Contact 0007').length);
    await expect(body.first()).toContainText('Contact 0007');
  });

  test('exports CSV shaped by the output settings', async ({ page }) => {
    await page.getByRole('button', { name: 'Use sample data' }).click();
    await setTab(page, 'Valid').click();
    await page.locator('input[name="style"][value="spaced"]').check();
    await page.getByLabel('Name + number').check();
    await page.getByLabel('Number column header').fill('Mobile');
    await page.getByLabel('Max rows to export').fill('10');

    const file = await download(page, 'CSV');
    const expected = serializeDataset(
      shapeDataset(reportDataset(report, { only: 'valid', numberStyle: 'spaced' }), {
        columns: 'numbers',
        numberHeader: 'Mobile',
        maxRows: 10,
      }),
      'csv',
    );
    expect(file.name).toBe('numsy-sample-valid.csv');
    expect(file.body.toString('utf-8')).toBe(expected);
    expect(expected.split('\r\n')[0]).toBe('Name,Mobile');

    await page.getByRole('switch', { name: 'Include header row' }).uncheck();
    const bare = await download(page, 'CSV');
    expect(bare.body.toString('utf-8').split('\r\n')[0]).toBe(expected.split('\r\n')[1]);
  });

  test('exports an Excel workbook', async ({ page }) => {
    await page.getByRole('button', { name: 'Use sample data' }).click();
    const file = await download(page, 'Excel');
    expect(file.name).toBe('numsy-sample-all.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.body as any);
    expect(workbook.worksheets.map((s) => s.name)).toEqual([
      'Summary',
      'All rows',
      'Valid',
      'Invalid',
      'Unique',
      'Duplicates',
    ]);
    expect(workbook.getWorksheet('Valid')?.rowCount).toBe(report.validRows.length + 1);
  });

  test('analyses pasted text', async ({ page }) => {
    await page.getByRole('tab', { name: 'Paste' }).click();
    await page.getByLabel('Numbers or free text').fill(SAMPLE_TEXT);
    await page.getByRole('button', { name: 'Analyse text' }).click();
    const expected = extractDataset(SAMPLE_TEXT);
    await expect(tile(page, 'Valid')).toHaveText(fmt(Number(expected.summary.Valid)));
    await expect(tile(page, 'Invalid')).toHaveText(fmt(Number(expected.summary.Invalid)));

    const txt = await download(page, 'Text');
    expect(txt.body.toString('utf-8')).toBe(serializeDataset(expected, 'txt'));
  });

  test('reads semicolon CSV with a BOM and lets you pick the phone column', async ({ page }) => {
    const csv = '﻿Contact;Alt;City\nAsha;98765 01234;Pune\nRavi;+91 91234 56789;Goa\n';
    await upload(page, 'semicolon.csv', csv);
    await expectTiles(page, { Records: 2, Valid: 2, Invalid: 0 });
    await expect(page.getByLabel('Phone column')).toContainText('Auto-detect (Alt)');

    await page.getByLabel('Phone column').selectOption('City');
    await expect(tile(page, 'Invalid')).toHaveText('2');
  });

  test('explains files it cannot read', async ({ page }) => {
    await upload(page, 'notes.txt', 'hello', 'text/plain');
    await expect(page.getByRole('alert')).toHaveText('Choose a .csv or .xlsx file.');

    await upload(page, 'broken.xlsx', 'not a zip', 'application/octet-stream');
    await expect(page.getByRole('alert')).toContainText('not a valid .xlsx workbook');
  });

  test('switches theme and fits a phone screen', async ({ page }, info) => {
    const before = await page.evaluate(() => document.documentElement.dataset.theme ?? 'system');
    await page.getByRole('button', { name: /Switch to (dark|light) theme/ }).click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.theme))
      .not.toBe(before);

    await page.setViewportSize({ width: 375, height: 760 });
    await page.goto(entry(info));
    await page.getByRole('button', { name: 'Use sample data' }).click();
    await expect(tile(page, 'Valid')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test('the local dashboard makes no requests outside this machine', async ({ page }, info) => {
  test.skip(info.project.name !== 'local', 'local server only');
  const external: string[] = [];
  page.on('request', (request) => {
    const { hostname } = new URL(request.url());
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') external.push(hostname);
  });
  await openDashboard(page, info);
  await page.getByRole('button', { name: 'Use sample data' }).click();
  await download(page, 'Excel');
  expect(external).toEqual([]);
});

test('the playground never uploads data', async ({ page }, info) => {
  test.skip(info.project.name !== 'website', 'website only');
  const writes: string[] = [];
  const beacons: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'GET') return;
    // Cookieless Cloudflare Web Analytics is the only allowed write; its payload is checked below
    if (new URL(request.url()).hostname.endsWith('cloudflareinsights.com')) {
      beacons.push(request.postData() ?? '');
    } else writes.push(`${request.method()} ${request.url()}`);
  });
  await openDashboard(page, info);
  await page.getByRole('button', { name: 'Use sample data' }).click();
  await download(page, 'CSV');
  await download(page, 'Excel');
  expect(writes).toEqual([]);
  const numbers = report.validRows.slice(0, 50).map((r) => String(r.sanitizedPhone));
  for (const body of beacons) {
    for (const number of numbers) expect(body).not.toContain(number);
  }
});

test.describe('local server pages', () => {
  // biome-ignore lint/correctness/noEmptyPattern: Playwright needs a destructuring pattern to resolve fixtures
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== 'local', 'local server only');
  });

  test('REST API reference lists every endpoint and calls them live', async ({ page }) => {
    await page.goto('/api');
    await expect(page).toHaveTitle('Numsy: REST API');
    const nav = page.getByRole('navigation', { name: 'Local server' });
    await expect(nav.getByRole('link', { name: 'REST API' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    for (const group of [
      'Sessions',
      'One-shot analysis',
      'Server',
      'Legacy 1.x',
      'Settings',
      'Errors',
    ]) {
      await expect(page.getByRole('heading', { name: group, level: 2 })).toBeVisible();
    }
    await expect(page.locator('article.endpoint')).toHaveCount(11);

    await page.locator('#status').getByRole('button', { name: 'Try it' }).click();
    const live = page.locator('#status .endpoint__live');
    await expect(live).toContainText('200');
    await expect(live).toContainText('"status": "OK"');
  });

  test('health page shows live status and endpoint checks', async ({ page }) => {
    await page.goto('/api/health-page');
    await expect(page).toHaveTitle('Numsy: Health');
    await expect(
      page.getByRole('status').filter({ hasText: 'All systems operational' }),
    ).toBeVisible();
    await expect(page.locator('.hp-tile', { hasText: 'Version' }).locator('dd')).toHaveText(
      /^v\d+\.\d+\.\d+$/,
    );
    await expect(page.locator('.hp-endpoints li')).toHaveCount(4);
    for (const badge of await page.locator('.hp-endpoints .badge').all()) {
      await expect(badge).toHaveText('200');
    }
    await page.getByText('Show the checks as a table').click();
    await expect(page.locator('.hp-table tbody tr').first()).toContainText('OK');
    await page.getByRole('button', { name: 'Pause' }).click();
    await expect(page.getByRole('button', { name: 'Resume' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
