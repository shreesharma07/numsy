/**
 * Export function tests
 */

import {
  formatFromExtension,
  resolveOutputFormat,
  toCSV,
  toJSON,
  toMarkdown,
  toText,
  toXlsxBuffer,
} from '../src/common/functions';

describe('Export functions', () => {
  const rows = [
    { name: 'Asha', phone: '9876501234' },
    { name: 'Ravi, Jr.', phone: '7012345678', note: 'said "hi"' },
  ];

  it('resolves formats and aliases', () => {
    expect(resolveOutputFormat('markdown')).toBe('md');
    expect(resolveOutputFormat('Excel')).toBe('xlsx');
    expect(resolveOutputFormat('yaml')).toBeNull();
    expect(formatFromExtension('out/report.JSON')).toBe('json');
    expect(formatFromExtension('report')).toBeNull();
  });

  it('serialises JSON pretty or compact', () => {
    expect(toJSON({ a: 1 })).toBe('{\n  "a": 1\n}');
    expect(toJSON({ a: 1 }, { pretty: false })).toBe('{"a":1}');
  });

  it('writes RFC 4180 CSV with the union of columns', () => {
    expect(toCSV(rows)).toBe(
      'name,phone,note\r\nAsha,9876501234,\r\n"Ravi, Jr.",7012345678,"said ""hi"""\r\n',
    );
  });

  it('neutralises spreadsheet formulas but keeps +91 numbers', () => {
    const csv = toCSV([{ a: '=HYPERLINK("x")', b: '+91 98765 01234', c: '+SUM(A1)' }]);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).toContain(',+91 98765 01234,');
    expect(csv).toContain(`'+SUM(A1)`);
  });

  it('renders Markdown with title, summary and escaped pipes', () => {
    const md = toMarkdown([{ a: 'x|y' }], { title: 'Report', summary: { Total: 1 } });
    expect(md).toContain('# Report');
    expect(md).toContain('| Total | 1 |');
    expect(md).toContain('| x\\|y |');
  });

  it('joins text lines', () => {
    expect(toText(['1', 2])).toBe('1\n2\n');
    expect(toText([])).toBe('');
  });

  it('builds an xlsx buffer', async () => {
    const buffer = await toXlsxBuffer([{ name: 'Results', rows }]);
    // xlsx files are zip archives
    expect(buffer.subarray(0, 2).toString()).toBe('PK');
  });
});
