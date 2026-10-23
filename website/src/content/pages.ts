/**
 * Route manifest — the single source of truth for every page's path and meta.
 * Used at runtime (usePageMeta) and at build time (vite/route-shells.ts) to emit
 * per-route HTML shells, 404.html and sitemap.xml. Keep this file free of React/CSS imports.
 */

declare const __SITE_URL__: string | undefined;

/** Primary deployment (Cloudflare Pages). Override with the SITE_URL env var at build time. */
const DEFAULT_SITE_URL = 'https://numsy.pages.dev';

/**
 * Absolute site URL without a trailing slash. In the browser bundle it is injected by
 * vite.config.ts (`__SITE_URL__`); when the build plugins load this file in Node it is read
 * from process.env. GitHub Pages builds set SITE_URL=https://shreesharma07.github.io/numsy.
 */
export const SITE_URL = (
  typeof __SITE_URL__ === 'string'
    ? __SITE_URL__
    : ((globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env
        .SITE_URL ?? DEFAULT_SITE_URL)
).replace(/\/$/, '');
export const SITE_NAME = 'Numsy';
export const OG_IMAGE = `${SITE_URL}/brand/og-image.png`;

export interface PageMeta {
  /** Router path relative to the base (no trailing slash except home). */
  path: string;
  /** Page title; the site name is prefixed automatically ("Numsy: <title>"). */
  title: string;
  description: string;
  /** Exclude from sitemap.xml */
  hidden?: boolean;
  priority?: number;
}

export const pages = {
  home: {
    path: '/',
    title: 'Validate, extract & de-dupe Indian mobile numbers',
    description:
      'Numsy is a lightweight TypeScript toolkit and CLI that validates, sanitizes, extracts and de-duplicates Indian mobile numbers from CSV, Excel and free text.',
    priority: 1,
  },
  docs: {
    path: '/docs',
    title: 'Getting started',
    description:
      'What Numsy is, who it is for, how to install it with npm, pnpm, yarn or npx, and a three-step quick start for the CLI, library and local dashboard.',
    priority: 0.9,
  },
  cli: {
    path: '/docs/cli',
    title: 'CLI reference',
    description:
      'Every numsy command and option: validate, extract, process, dashboard and formats; output, filter and dashboard flags such as --dedupe, --number-style, --columns, --header-name and --fail-on-invalid.',
    priority: 0.9,
  },
  api: {
    path: '/docs/api',
    title: 'Library API',
    description:
      'The Numsy TypeScript API: validate, validateBatch, sanitize, isValid, extractMultiple, format, detectPhoneColumn, parseFile, analyzeFile, processFile, writeCsv and exporters.',
    priority: 0.9,
  },
  formats: {
    path: '/docs/formats',
    title: 'Output formats',
    description:
      'Export cleaned numbers as a terminal table, JSON, CSV, Markdown, Excel (.xlsx) or plain text — one format or several at once.',
    priority: 0.8,
  },
  webui: {
    path: '/docs/web-ui',
    title: 'Local dashboard & REST API',
    description:
      'Run numsy dashboard for a local dashboard on localhost:6789 with file upload, filters, de-duplication and exports, plus a REST API for scripts.',
    priority: 0.7,
  },
  faq: {
    path: '/docs/faq',
    title: 'FAQ',
    description:
      'Which numbers count as valid, .xls support, privacy (everything runs locally) and using Numsy in CI with --fail-on-invalid.',
    priority: 0.7,
  },
  playground: {
    path: '/playground',
    title: 'Playground',
    description:
      'Upload a CSV or Excel file or paste text, then validate, de-duplicate and filter Indian mobile numbers in your browser. Export CSV, Excel, JSON, Markdown or text. Nothing leaves the page.',
    priority: 0.8,
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy & data disclaimer',
    description:
      'Numsy never stores, sells or shares the Excel, CSV or text you process, and never uses it for AI training. The playground runs in your browser; the CLI and local dashboard run on your machine.',
    priority: 0.6,
  },
  about: {
    path: '/about',
    title: 'About the author',
    description:
      'Numsy is built and maintained by Shri Kumar Sharma, a software engineer from India.',
    priority: 0.5,
  },
  contributors: {
    path: '/contributors',
    title: 'Contributors & community',
    description:
      'The people who build Numsy, and how to contribute: guidelines, code of conduct, security policy, issues and discussions.',
    priority: 0.5,
  },
  credits: {
    path: '/credits',
    title: 'Credits',
    description:
      'Open-source libraries, fonts, icons, APIs and design inspiration used to build the Numsy website, with licenses.',
    priority: 0.3,
  },
  notFound: {
    path: '/404',
    title: 'Page not found',
    description: "This page doesn't exist. Head back to the Numsy home page.",
    hidden: true,
  },
} satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof pages;

export const fullTitle = (meta: PageMeta): string => `${SITE_NAME}: ${meta.title}`;

export const canonicalUrl = (meta: PageMeta): string =>
  meta.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${meta.path}/`;
