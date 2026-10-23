import {
  analyzeRows,
  checkNumber,
  detectPhoneColumn,
  extractNumbers,
  formatNumber,
  parseCsv,
  reportDataset,
  resolveSettings,
  serializeDataset,
  shapeDataset,
  sniffDelimiter,
  toAnalyzeOptions,
  validateDataset,
} from '../src/engine';

const rows = [
  { Name: 'A', Mobile: '9876501234' },
  { Name: 'B', Mobile: '+91 98765 01234' },
  { Name: 'C', Mobile: '9123456789, 8123456780' },
  { Name: 'D', Mobile: '' },
  { Name: 'E', Mobile: '9999999999' },
  { Name: 'F', Mobile: '09123456789' },
];

describe('engine rules', () => {
  it('applies the dummy-pattern rules only when strict', () => {
    expect(checkNumber('9999999999').isValid).toBe(false);
    expect(checkNumber('9999999999', { strict: false }).isValid).toBe(true);
    expect(checkNumber('5123456789', { strict: false }).isValid).toBe(false);
  });

  it('extracts each distinct number once', () => {
    const found = extractNumbers('9876501234 / +91 98765 01234 or 9999999999');
    expect(found.all).toEqual(['9876501234', '9999999999']);
    expect(found.valid).toEqual(['9876501234']);
    expect(found.invalid[0].number).toBe('9999999999');
  });

  it('formats numbers in every style', () => {
    expect(formatNumber('9876501234', 'plain')).toBe('9876501234');
    expect(formatNumber('9876501234', 'e164')).toBe('+919876501234');
    expect(formatNumber('9876501234', 'spaced')).toBe('+91 98765 01234');
    expect(formatNumber('12345', 'e164')).toBe('12345');
  });
});

describe('analyzeRows', () => {
  it('keeps every occurrence by default and reports duplicates', () => {
    const report = analyzeRows(rows);
    expect(report.phoneColumn).toBe('Mobile');
    expect(report.nameColumn).toBe('Name');
    expect(report.validRows).toHaveLength(5);
    expect(report.duplicateRows.map((r) => r.Name)).toEqual(['B', 'F']);
    expect(report.analytics.duplicateNumbers).toBe(2);
    expect(report.analytics.duplicatesRemoved).toBe(0);
    expect(report.analytics.emptyRecords).toBe(1);
  });

  it('removes repeats keeping the first or the last occurrence', () => {
    const first = analyzeRows(rows, { dedupe: 'first' });
    expect(first.validRows.map((r) => r.Name)).toEqual(['A', 'C', 'C']);
    expect(first.analytics.duplicatesRemoved).toBe(2);

    const last = analyzeRows(rows, { dedupe: 'last' });
    expect(last.validRows.map((r) => r.Name)).toEqual(['B', 'C', 'F']);
    expect(last.unique.find((u) => u.phone === '9876501234')).toEqual({
      phone: '9876501234',
      name: 'B',
      occurrences: 2,
    });
  });

  it('supports loose rules, first-only cells and skipping empty cells', () => {
    expect(analyzeRows(rows, { strict: false }).validRows).toHaveLength(6);
    expect(analyzeRows(rows, { multiple: 'first' }).validRows).toHaveLength(4);
    const skipped = analyzeRows(rows, { skipEmpty: true });
    expect(skipped.invalidRows.map((r) => r.Name)).toEqual(['E']);
  });

  it('prefers the hinted column that actually holds numbers', () => {
    const data = [
      { Contact: 'Asha', Alt: '98765 01234', 'Phone Type': 'mobile' },
      { Contact: 'Ravi', Alt: '+91 91234 56789', 'Phone Type': 'home' },
    ];
    expect(detectPhoneColumn(data)).toBe('Alt');
    expect(detectPhoneColumn([{ Phone: '', Name: 'x' }])).toBe('Phone');
    expect(detectPhoneColumn([{ City: 'Pune' }])).toBeNull();
  });

  it('honours an explicit phone column and disables names with null', () => {
    const report = analyzeRows(rows, { phoneColumn: 'Mobile', nameColumn: null });
    expect(report.nameColumn).toBeUndefined();
    expect(() => analyzeRows(rows, { phoneColumn: 'Nope' })).toThrow(/Column "Nope" not found/);
    expect(() => analyzeRows([])).toThrow(/No data/);
  });
});

describe('datasets', () => {
  it('builds the duplicates set for files and pasted values', () => {
    const report = analyzeRows(rows);
    const dataset = reportDataset(report, { only: 'duplicates', numberStyle: 'e164' });
    expect(dataset.rows.map((r) => r.sanitizedPhone)).toEqual(['+919876501234', '+919123456789']);

    const pasted = validateDataset(['9876501234', '98765 01234', 'x'], { dedupe: true });
    expect(pasted.rows).toHaveLength(2);
    expect(pasted.summary.Duplicates).toBe(1);
    expect(serializeDataset(pasted, 'txt')).toBe('9876501234\n');
  });

  it('writes Markdown with one blank line between blocks', () => {
    const md = serializeDataset(validateDataset(['9876501234']), 'md');
    expect(md).toMatch(/^# Numsy · validate\n\n## Summary\n\n\| Metric \| Value \|/);
    expect(md).toContain('\n\n## Rows (1)\n\n| input |');
    expect(md).not.toMatch(/\n{3,}/);
  });
});

describe('output shaping', () => {
  const report = analyzeRows(rows);

  it('renames the number column, picks name + number and caps rows', () => {
    const shaped = shapeDataset(reportDataset(report, { only: 'valid' }), {
      numberHeader: 'Mobile No',
      columns: 'numbers',
      maxRows: 2,
    });
    expect(shaped.rows).toEqual([
      { Name: 'A', 'Mobile No': '9876501234' },
      { Name: 'B', 'Mobile No': '9876501234' },
    ]);
    expect(shaped.summary.Valid).toBe(5);
    expect(shaped.sheets?.[0].rows).toHaveLength(2);
  });

  it('keeps every column when only renaming, and drops the csv header on request', () => {
    const shaped = shapeDataset(reportDataset(report, { only: 'unique' }), {
      numberHeader: 'Phone',
    });
    expect(Object.keys(shaped.rows[0])).toEqual(['name', 'Phone', 'occurrences']);
    const csv = serializeDataset(shaped, 'csv', true, { header: false });
    expect(csv.split('\r\n')[0]).toBe('A,9876501234,2');
  });

  it('caps txt lines and leaves datasets without a number key alone', () => {
    const pasted = validateDataset(['9876501234', '9123456789']);
    expect(serializeDataset(shapeDataset(pasted, { maxRows: 1 }), 'txt')).toBe('9876501234\n');
    expect(shapeDataset(pasted, { columns: 'numbers' }).rows).toEqual([
      { sanitized: '9876501234' },
      { sanitized: '9123456789' },
    ]);
  });
});

describe('parseCsv', () => {
  it('handles BOM, quotes, CRLF, blank lines and duplicate headers', () => {
    const csv = '﻿Name,Phone,Phone,\r\n"Doe, J","98765 ""01234""",x,y\r\n\r\nA,9123456789,,\n';
    const result = parseCsv(csv);
    expect(result.detectedColumns).toEqual(['Name', 'Phone', 'Phone_2', 'column_4']);
    expect(result.data).toEqual([
      { Name: 'Doe, J', Phone: '98765 "01234"', Phone_2: 'x', column_4: 'y' },
      { Name: 'A', Phone: '9123456789', Phone_2: '', column_4: '' },
    ]);
  });

  it('sniffs semicolon, tab and pipe delimiters', () => {
    expect(sniffDelimiter('a;b;c\n1;2;3')).toBe(';');
    expect(sniffDelimiter('a\tb\n')).toBe('\t');
    expect(sniffDelimiter('a|b|c')).toBe('|');
    expect(parseCsv('name;phone\nA;9876501234').data[0].phone).toBe('9876501234');
  });
});

describe('settings', () => {
  it('sanitises untrusted input and maps it to analyze options', () => {
    const settings = resolveSettings({
      dedupe: 'last',
      strict: 'false',
      numberStyle: 'bogus',
      only: 'duplicates',
      nameColumn: 'none',
      phoneColumn: 42,
    });
    expect(settings).toMatchObject({
      dedupe: 'last',
      strict: false,
      numberStyle: 'plain',
      only: 'duplicates',
      phoneColumn: '',
    });
    expect(toAnalyzeOptions(settings)).toMatchObject({ nameColumn: null, phoneColumn: undefined });
  });
});
