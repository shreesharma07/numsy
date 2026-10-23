/**
 * CSV reader
 * RFC 4180 quoting, CRLF/LF line endings, UTF-8 BOM and delimiter sniffing (, ; tab |)
 */

import { FileParseResult, ParsedDataRow } from '../common/interfaces';

const DELIMITERS = [',', ';', '\t', '|'];

/**
 * Picks the delimiter that appears most often outside quotes in the header line
 */
export function sniffDelimiter(text: string): string {
  let header = '';
  let quoted = false;
  for (const char of text) {
    if (char === '"') quoted = !quoted;
    else if (!quoted && (char === '\n' || char === '\r')) break;
    else if (!quoted) header += char;
  }

  let best = ',';
  let bestCount = 0;
  for (const delimiter of DELIMITERS) {
    const count = header.split(delimiter).length - 1;
    if (count > bestCount) {
      best = delimiter;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Splits CSV text into records of raw cell strings
 */
export function parseCsvRecords(text: string, delimiter = sniffDelimiter(text)): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let cell = '';
  let quoted = false;
  let i = text.charCodeAt(0) === 0xfeff ? 1 : 0;

  const endCell = () => {
    record.push(cell);
    cell = '';
  };
  const endRecord = () => {
    endCell();
    // Skip blank lines
    if (record.length > 1 || record[0] !== '') records.push(record);
    record = [];
  };

  for (; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += char;
    } else if (char === '"' && cell === '') quoted = true;
    else if (char === delimiter) endCell();
    else if (char === '\n') endRecord();
    else if (char === '\r') {
      if (text[i + 1] === '\n') i++;
      endRecord();
    } else cell += char;
  }
  if (cell !== '' || record.length > 0) endRecord();

  return records;
}

/**
 * Parses CSV text with a header row into objects keyed by header.
 * Blank headers become column_N and repeated headers get a _2, _3... suffix.
 */
export function parseCsv(text: string, delimiter?: string): FileParseResult {
  const [header = [], ...body] = parseCsvRecords(text, delimiter);
  const seen = new Map<string, number>();
  const columns = header.map((raw, index) => {
    const name = raw.trim() || `column_${index + 1}`;
    const count = (seen.get(name) ?? 0) + 1;
    seen.set(name, count);
    return count === 1 ? name : `${name}_${count}`;
  });

  const data = body.map((cells) => {
    const row: ParsedDataRow = {};
    columns.forEach((column, index) => {
      row[column] = cells[index] ?? '';
    });
    return row;
  });

  return { data, totalRows: data.length, detectedColumns: columns };
}
