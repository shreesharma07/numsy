import type { Tone } from '../types';
import { pages } from './pages';

export const heroVerbs = ['Validate.', 'Extract.', 'Sanitize.', 'De-dupe.'];

export const tickerLines = [
  'Validate · Sanitize · Extract · De-dupe · Export ·',
  '+91 · CSV · XLSX · JSON · Markdown · TXT · CLI ·',
];

export interface Feature {
  title: string;
  body: string;
  icon: `ph:${string}`;
  tone: Exclude<Tone, 'surface'>;
}

export const features: Feature[] = [
  {
    title: 'Strict Indian mobile rules',
    body: '10 digits, 6–9 prefix, and rejection of repeated, sequential and dummy patterns, with a human-readable reason for every failure.',
    icon: 'ph:seal-check-bold',
    tone: 'coral',
  },
  {
    title: 'CSV & Excel parsing',
    body: 'Reads `.csv` and `.xlsx`, auto-detects the phone column (or pass `--column`) and the name column.',
    icon: 'ph:file-xls-bold',
    tone: 'amber',
  },
  {
    title: 'Multi-number extraction',
    body: 'One cell, three numbers? Numsy splits and validates each, expanding them into separate rows.',
    icon: 'ph:scissors-bold',
    tone: 'violet',
  },
  {
    title: 'Six output formats',
    body: 'Table, JSON, CSV, Markdown, Excel and TXT. Pick several at once with `-f json,csv,xlsx`.',
    icon: 'ph:export-bold',
    tone: 'ink',
  },
  {
    title: 'CI-friendly CLI',
    body: '`--fail-on-invalid` exits with code 2 so data-quality checks can gate a pipeline. Reads stdin, writes files.',
    icon: 'ph:terminal-window-bold',
    tone: 'coral',
  },
  {
    title: 'Local & typed',
    body: 'Pure TypeScript with full typings; runs entirely on your machine. Plus a local dashboard and REST API via `numsy dashboard`.',
    icon: 'ph:lock-key-bold',
    tone: 'amber',
  },
];

export interface UsageWay {
  step: string;
  title: string;
  body: string;
  code: string;
  lang: 'sh' | 'ts';
  label: string;
  link: { label: string; to: string };
  tone: 'amber' | 'coral' | 'violet';
}

export const usageWays: UsageWay[] = [
  {
    step: '1',
    title: 'From the terminal',
    body: 'Validate a few numbers, or clean a whole spreadsheet into several formats.',
    code: 'npx numsy validate 9876501234\nnumsy process leads.csv -f json,xlsx',
    lang: 'sh',
    label: 'CLI',
    link: { label: 'CLI reference', to: pages.cli.path },
    tone: 'amber',
  },
  {
    step: '2',
    title: 'From your code',
    body: 'Use the `Numsy` class for single values, batches and whole files.',
    code: "numsy.isValid('098765 01234'); // true\nawait numsy.analyzeFile('leads.xlsx');",
    lang: 'ts',
    label: 'TypeScript',
    link: { label: 'Library API', to: pages.api.path },
    tone: 'coral',
  },
  {
    step: '3',
    title: 'From the browser',
    body: 'Start the local dashboard, drop in a file, filter and export.',
    code: 'numsy dashboard --open\n# → http://localhost:6789',
    lang: 'sh',
    label: 'CLI',
    link: { label: 'Local dashboard', to: pages.webui.path },
    tone: 'violet',
  },
];

export const docsCards: { title: string; body: string; to: string; icon: `ph:${string}` }[] = [
  {
    title: 'Getting started',
    body: 'What, why, install and a quick start.',
    to: pages.docs.path,
    icon: 'ph:rocket-launch-bold',
  },
  {
    title: 'CLI reference',
    body: 'Every command, flag and example.',
    to: pages.cli.path,
    icon: 'ph:terminal-window-bold',
  },
  {
    title: 'Library API',
    body: 'Methods, options and exporters.',
    to: pages.api.path,
    icon: 'ph:brackets-curly-bold',
  },
  {
    title: 'Output formats',
    body: 'Table, JSON, CSV, MD, XLSX, TXT.',
    to: pages.formats.path,
    icon: 'ph:file-text-bold',
  },
  {
    title: 'Local dashboard',
    body: 'numsy dashboard and its REST API.',
    to: pages.webui.path,
    icon: 'ph:browser-bold',
  },
  {
    title: 'FAQ',
    body: 'Validity rules, privacy, CI.',
    to: pages.faq.path,
    icon: 'ph:question-bold',
  },
];
