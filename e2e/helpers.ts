import { type Download, type Page, expect, type TestInfo } from '@playwright/test';
import * as fs from 'node:fs';

/** The dashboard lives at "/" on the local server and at "/playground/" on the website */
export const entry = (info: TestInfo) => (info.project.name === 'website' ? '/playground/' : '/');

export const fmt = (n: number) => n.toLocaleString('en-IN');

export async function openDashboard(page: Page, info: TestInfo) {
  await page.goto(entry(info));
  await expect(page.getByRole('button', { name: 'Use sample data' })).toBeVisible();
}

/** The value of a summary tile, e.g. tile(page, 'Valid') */
export const tile = (page: Page, label: string) =>
  page
    .locator('.summary__tile')
    .filter({ has: page.locator('dt', { hasText: new RegExp(`^${label}$`) }) })
    .locator('dd');

export const setTab = (page: Page, label: string) =>
  page.getByRole('tab', { name: new RegExp(`^${label} `) });

export async function expectTiles(page: Page, values: Record<string, number>) {
  for (const [label, value] of Object.entries(values)) {
    await expect(tile(page, label)).toHaveText(fmt(value));
  }
}

/** Clicks an export button and returns the downloaded file's name and contents */
export async function download(page: Page, label: string) {
  const [file] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: label, exact: true }).click(),
  ]);
  return { name: (file as Download).suggestedFilename(), body: fs.readFileSync(await file.path()) };
}

/** Uploads an in-memory file through the drop zone's file input */
export async function upload(
  page: Page,
  name: string,
  contents: string | Buffer,
  mimeType = 'text/csv',
) {
  await page.locator('input[type="file"]').setInputFiles({
    name,
    mimeType,
    buffer: Buffer.isBuffer(contents) ? contents : Buffer.from(contents, 'utf-8'),
  });
}
