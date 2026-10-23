import { PageHeader } from '../../components/layout/PageHeader';
import { InstallTabs } from '../../components/sections/InstallTabs';
import { UsageTrio } from '../../components/sections/UsageTrio';
import { Callout, CodeBlock, Section } from '../../components/ui';
import { pages } from '../../content/pages';
import { pkg } from '../../content/site';
import { usePageMeta } from '../../hooks/usePageMeta';
import './docs.css';

const audiences = [
  'Growth & CRM teams',
  'SMS / WhatsApp campaign ops',
  'Data engineers',
  'Node.js & NestJS developers',
  'CI data-quality checks',
];

const pillars: { k: string; title: string; body: string }[] = [
  {
    k: 'A',
    title: 'Validate',
    body: '10 digits, starts with 6–9, after stripping +91, 0091 and a leading 0.',
  },
  {
    k: 'B',
    title: 'Extract',
    body: 'Every number out of free text or a crowded cell: commas, slashes, pipes, “or”, “and”.',
  },
  {
    k: 'C',
    title: 'De-duplicate',
    body: 'Collapse repeats into a unique list with occurrence counts and the first name seen.',
  },
  {
    k: 'D',
    title: 'Export',
    body: 'Table, JSON, CSV, Markdown, Excel or TXT, or the classic ZIP report bundle.',
  },
];

export function GettingStartedPage() {
  usePageMeta(pages.docs);
  return (
    <>
      <PageHeader
        label="Docs / Getting started"
        num="01–03"
        title="Getting started."
        lede="What Numsy is, who it's for, how to install it, and your first run in three commands."
        art={false}
      />
      <Section
        id="about"
        num="01"
        label="About / What & why"
        title="Messy sheets in. Clean numbers out."
      >
        <div className="docs-two">
          <div>
            <p className="lede">
              Real-world phone columns are chaos: <code>+91 98765-01234</code>,{' '}
              <code>098765 01234</code>, two numbers in one cell, dummy <code>9999999999</code>{' '}
              entries, the same lead forty times.
            </p>
            <p className="muted">
              Numsy normalises all of them into clean 10-digit Indian mobile numbers, explains every
              rejection, and exports the result in the format your next tool expects, as a{' '}
              <strong>CLI</strong>, a <strong>TypeScript library</strong> or a{' '}
              <strong>local dashboard and REST API</strong>.
            </p>
            <p className="label mt-6">Built for</p>
            <ul className="chips">
              {audiences.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <ul className="pillars">
            {pillars.map((p) => (
              <li key={p.k}>
                <span className="pillars__k" aria-hidden="true">
                  {p.k}
                </span>
                <p>
                  <strong>{p.title}</strong>
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        id="install"
        num="02"
        label="Installation"
        title="One command. Any package manager."
        tone="alt"
      >
        <ul className="req">
          <li>
            <span className="req__dot req__dot--coral" aria-hidden="true" />
            Node.js {pkg.node} or newer
          </li>
          <li>
            <span className="req__dot req__dot--amber" aria-hidden="true" />
            ESM &amp; CommonJS
          </li>
          <li>
            <span className="req__dot req__dot--violet" aria-hidden="true" />
            TypeScript types included
          </li>
        </ul>
        <InstallTabs />
        <div className="grid grid-2 mt-6">
          <div>
            <h3>Global CLI</h3>
            <p className="muted">
              Install globally for the <code>numsy</code> command on your PATH. It includes the
              local dashboard: <code>numsy dashboard</code>.
            </p>
            <CodeBlock
              code={`$ ${pkg.install.global}\n$ numsy --version\n$ numsy --help`}
              lang="sh"
              label="Shell"
            />
          </div>
          <div>
            <h3>As a project dependency</h3>
            <p className="muted">Import the class or the standalone helpers.</p>
            <CodeBlock
              code={
                "import { Numsy } from 'numsy';\n// CommonJS: const { Numsy } = require('numsy');\nconst numsy = new Numsy({ enableLogging: false });"
              }
              lang="ts"
              label="TypeScript"
            />
          </div>
        </div>
        <Callout tone="note" title="Supported inputs">
          <p>
            <code>.csv</code> and <code>.xlsx</code> files, stdin and plain strings. Legacy binary{' '}
            <code>.xls</code> is not supported. Re-save it as .xlsx or .csv.
          </p>
        </Callout>
      </Section>

      <Section
        id="usage"
        num="03"
        label="Quick start / Three ways in"
        title="Terminal, code, or browser."
      >
        <UsageTrio />
      </Section>
    </>
  );
}
