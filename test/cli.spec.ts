/**
 * CLI Tests
 * Drives the numsy CLI in-process with captured stdout/stderr
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as ExcelJS from 'exceljs';
import { CliIO, EXIT, run } from '../src/cli';

const createIO = (cwd: string, stdin: string | null = null) => {
  const out: string[] = [];
  const err: string[] = [];
  const io: CliIO = {
    stdout: { write: (chunk: string) => out.push(chunk) },
    stderr: { write: (chunk: string) => err.push(chunk) },
    readStdin: async () => stdin,
    cwd,
    env: { NO_COLOR: '1' },
  };
  return { io, stdout: () => out.join(''), stderr: () => err.join('') };
};

describe('numsy CLI', () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'numsy-cli-'));
    fs.writeFileSync(
      path.join(dir, 'leads.csv'),
      [
        'Name,Mobile Number,City',
        'Asha,"98765 01234, 91234-56789",Pune',
        'Ravi,+91 98765 01234,Delhi',
        'Meera,12345,Agra',
        'John,,Goa',
      ].join('\n'),
    );
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  describe('general', () => {
    it('prints the version', async () => {
      const { io, stdout } = createIO(dir);
      expect(await run(['--version'], io)).toBe(EXIT.OK);
      expect(stdout().trim()).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('prints help and exits non-zero without a command', async () => {
      const { io, stdout } = createIO(dir);
      expect(await run([], io)).toBe(EXIT.ERROR);
      expect(stdout()).toContain('Usage');
    });

    it('rejects unknown commands, options and formats', async () => {
      for (const argv of [['bogus'], ['validate', '1', '--wat'], ['validate', '1', '-f', 'yaml']]) {
        const { io, stderr } = createIO(dir);
        expect(await run(argv, io)).toBe(EXIT.ERROR);
        expect(stderr()).toContain('numsy --help');
      }
    });

    it('lists formats', async () => {
      const { io, stdout } = createIO(dir);
      await run(['formats'], io);
      for (const format of ['table', 'json', 'csv', 'md', 'xlsx', 'txt']) {
        expect(stdout()).toContain(format);
      }
    });
  });

  describe('validate', () => {
    it('renders a table by default', async () => {
      const { io, stdout } = createIO(dir);
      expect(await run(['validate', '9876501234', '12345'], io)).toBe(EXIT.OK);
      expect(stdout()).toContain('Valid 1');
      expect(stdout()).toContain('Too short');
    });

    it('prints JSON to stdout', async () => {
      const { io, stdout } = createIO(dir);
      await run(['validate', '+91 98765 01234', '12345', '-f', 'json'], io);
      const doc = JSON.parse(stdout());
      expect(doc.summary).toMatchObject({ Total: 2, Valid: 1, Invalid: 1 });
      expect(doc.rows[0]).toMatchObject({ sanitized: '9876501234', valid: true });
    });

    it('reads stdin line by line', async () => {
      const { io, stdout } = createIO(dir, '9876501234\n7012345678\n\n');
      await run(['validate', '-f', 'txt'], io);
      expect(stdout()).toBe('9876501234\n7012345678\n');
    });

    it('applies --country-code and --only', async () => {
      const { io, stdout } = createIO(dir);
      await run(
        ['validate', '9876501234', '9876501234', '--only', 'unique', '-f', 'csv', '--country-code'],
        io,
      );
      expect(stdout()).toBe('phone\r\n+919876501234\r\n');
    });

    it('exits 2 with --fail-on-invalid', async () => {
      const { io } = createIO(dir);
      expect(await run(['validate', '12345', '--fail-on-invalid', '-q', '-f', 'txt'], io)).toBe(
        EXIT.INVALID_FOUND,
      );
    });
  });

  describe('extract', () => {
    it('extracts formatted numbers from free text', async () => {
      const { io, stdout } = createIO(dir);
      await run(['extract', 'Call 98765-01234 or 0 91234 56789, office 12345', '-f', 'json'], io);
      const doc = JSON.parse(stdout());
      expect(doc.rows.map((r: any) => r.number)).toEqual(['9876501234', '9123456789']);
    });

    it('renders markdown', async () => {
      const { io, stdout } = createIO(dir);
      await run(['extract', '98765 01234', '-f', 'md'], io);
      expect(stdout()).toContain('| number | valid | reason |');
    });
  });

  describe('process', () => {
    it('writes every requested format with --out-dir and --name', async () => {
      const { io, stderr } = createIO(dir);
      const code = await run(
        ['process', 'leads.csv', '-f', 'json,csv,md,xlsx,txt', '-d', 'reports', '-n', 'clean'],
        io,
      );
      expect(code).toBe(EXIT.OK);
      for (const ext of ['json', 'csv', 'md', 'xlsx', 'txt']) {
        expect(fs.existsSync(path.join(dir, 'reports', `clean.${ext}`))).toBe(true);
      }
      expect(stderr()).toContain('clean.xlsx');
    });

    it('keeps original headers unless --normalize is passed', async () => {
      const { io, stdout } = createIO(dir);
      await run(['process', 'leads.csv', '-f', 'csv', '-q'], io);
      expect(stdout().split('\r\n')[0]).toMatch(/^Name,Mobile Number,City,/);

      const normalised = createIO(dir);
      await run(['process', 'leads.csv', '-f', 'csv', '-q', '--normalize'], normalised.io);
      expect(normalised.stdout().split('\r\n')[0]).toMatch(/^name,phone,/);
    });

    it('infers the format from --output and exports unique numbers', async () => {
      const { io } = createIO(dir);
      await run(['process', 'leads.csv', '--only', 'unique', '-o', 'unique.csv', '-q'], io);
      const csv = fs.readFileSync(path.join(dir, 'unique.csv'), 'utf-8');
      expect(csv).toBe('name,phone,occurrences\r\nAsha,9876501234,2\r\nAsha,9123456789,1\r\n');
    });

    it('writes a multi-sheet Excel workbook', async () => {
      const { io } = createIO(dir);
      await run(['process', 'leads.csv', '-o', 'out.xlsx', '-q'], io);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(path.join(dir, 'out.xlsx'));
      expect(workbook.worksheets.map((s) => s.name)).toEqual([
        'Summary',
        'All rows',
        'Valid',
        'Invalid',
        'Unique',
      ]);
    });

    it('reports a missing file and a bad column', async () => {
      const missing = createIO(dir);
      expect(await run(['process', 'nope.csv'], missing.io)).toBe(EXIT.ERROR);
      expect(missing.stderr()).toContain('File not found');

      const badColumn = createIO(dir);
      expect(await run(['process', 'leads.csv', '-c', 'Phone'], badColumn.io)).toBe(EXIT.ERROR);
      expect(badColumn.stderr()).toContain('Column "Phone" not found');
    });
  });
});
