import type { Tone } from '../types';

export interface OutputFormat {
  id: string;
  name: string;
  ext: string;
  tone: Tone;
  description: string;
  sample: string;
}

/** Samples are illustrative — exact columns may vary by command. */
export const formats: OutputFormat[] = [
  {
    id: 'table',
    name: 'Table',
    ext: 'default',
    tone: 'ink',
    description: 'Readable summary in the terminal — great for quick checks.',
    sample: `#  INPUT            SANITIZED   STATUS
1  +91 98765 01234  9876501234  valid
2  98765 43210      9876543210  sequential`,
  },
  {
    id: 'json',
    name: 'JSON',
    ext: '.json',
    tone: 'amber',
    description:
      'Structured results for scripts and APIs. Pretty by default (`--no-pretty` to compact).',
    sample: `[{ "original": "+91 98765 01234",
   "sanitized": "9876501234",
   "isValid": true }]`,
  },
  {
    id: 'csv',
    name: 'CSV',
    ext: '.csv',
    tone: 'coral',
    description: 'Drop straight into Sheets, a CRM import or a database load.',
    sample: `original,sanitized,isValid,reason
"+91 98765 01234",9876501234,true,
9876543210,9876543210,false,Sequential`,
  },
  {
    id: 'md',
    name: 'Markdown',
    ext: '.md',
    tone: 'violet',
    description: 'Paste into a PR, issue or wiki page as a table.',
    sample: `| original        | sanitized  | valid |
|-----------------|------------|-------|
| +91 98765 01234 | 9876501234 | yes   |`,
  },
  {
    id: 'xlsx',
    name: 'Excel',
    ext: '.xlsx',
    tone: 'amber',
    description:
      'A real workbook for people who live in Excel — one row per number with status columns.',
    sample: 'numsy process leads.csv -f xlsx',
  },
  {
    id: 'txt',
    name: 'TXT',
    ext: '.txt',
    tone: 'coral',
    description: 'One number per line — the simplest input for SMS tools and other CLIs.',
    sample: `9876501234
9123456789`,
  },
];

export const rowSets: { name: string; description: string }[] = [
  { name: 'all', description: 'Every row, valid and invalid (default).' },
  { name: 'valid', description: 'Only rows with a valid number.' },
  { name: 'invalid', description: 'Only rejected rows, with the reason.' },
  { name: 'unique', description: 'One row per distinct valid number, with occurrence counts.' },
];
