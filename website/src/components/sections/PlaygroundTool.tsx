import { type FormEvent, useId, useMemo, useState } from 'react';
import { downloadRows, type ExportKind } from '../../lib/download';
import { analyze } from '../../lib/numsy-lite';
import type { TableRow } from '../../types';
import { Badge, Button, Callout, Stat, StatGrid, Table } from '../ui';
import './PlaygroundTool.css';

export const SAMPLE = [
  'Ravi: +91 98765 01234, Priya 0 91234 56789 / 70123-45678',
  'Leads: 9876543210; 98989 89898 | 5123456789 or 9999999999',
  'Dup: 919876501234 and (0091) 81234-56780',
  'Typo: 98765 4321',
].join('\n');

const COLUMNS = [
  { key: 'n', header: '#', width: '3rem' },
  { key: 'input', header: 'Input' },
  { key: 'number', header: 'Number' },
  { key: 'status', header: 'Status' },
  { key: 'reason', header: 'Reason' },
];

/** In-browser validator using the numsy-lite port. Nothing leaves the page. */
export function PlaygroundTool() {
  const inputId = useId();
  const helpId = useId();
  const [draft, setDraft] = useState(SAMPLE);
  const [text, setText] = useState(SAMPLE);
  const [uniqueOnly, setUniqueOnly] = useState(false);
  const [withCode, setWithCode] = useState(false);
  const [notice, setNotice] = useState('');

  const result = useMemo(() => analyze(text), [text]);
  const view = uniqueOnly ? result.rows.filter((r) => r.isValid && !r.duplicate) : result.rows;

  const rows: TableRow[] = view.map((r, i) => ({
    n: i + 1,
    input: <span className="pg__mono">{r.original}</span>,
    number: (
      <span className="pg__mono">{(withCode && r.isValid ? r.formatted : r.sanitized) || '—'}</span>
    ),
    status: !r.isValid ? (
      <Badge tone="bad">Invalid</Badge>
    ) : r.duplicate ? (
      <Badge tone="neutral">Duplicate</Badge>
    ) : (
      <Badge tone="ok">Valid</Badge>
    ),
    reason: r.reason ?? (r.duplicate ? 'Seen earlier' : '—'),
  }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setText(draft);
  };
  const onDownload = (kind: ExportKind) => {
    const name = downloadRows(view, kind);
    setNotice(`Downloaded ${name}`);
  };

  return (
    <div className="pg">
      <form className="pg__form" onSubmit={onSubmit}>
        <label className="label pg__label" htmlFor={inputId}>
          Numbers or free text
        </label>
        <textarea
          id={inputId}
          className="pg__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          aria-describedby={helpId}
          rows={10}
        />
        <p id={helpId} className="muted pg__help">
          Separate with commas, semicolons, slashes, pipes, new lines, “or” / “and” — or paste a
          paragraph.
        </p>
        <div className="pg__opts">
          <label>
            <input
              type="checkbox"
              checked={uniqueOnly}
              onChange={(e) => setUniqueOnly(e.target.checked)}
            />{' '}
            Unique valid only
          </label>
          <label>
            <input
              type="checkbox"
              checked={withCode}
              onChange={(e) => setWithCode(e.target.checked)}
            />{' '}
            Show +91 format
          </label>
        </div>
        <div className="row">
          <Button type="submit" variant="primary" icon="ph:check-circle-bold">
            Validate
          </Button>
          <Button
            icon="ph:sparkle-bold"
            onClick={() => {
              setDraft(SAMPLE);
              setText(SAMPLE);
            }}
          >
            Load sample
          </Button>
          <Button
            icon="ph:eraser-bold"
            onClick={() => {
              setDraft('');
              setText('');
            }}
          >
            Clear
          </Button>
        </div>
      </form>

      <div className="pg__results">
        <div aria-live="polite" className="pg__stats">
          <StatGrid label="Summary">
            <Stat label="Found" value={String(result.total)} />
            <Stat label="Valid" value={String(result.valid)} tone="amber" />
            <Stat label="Invalid" value={String(result.invalid)} tone="coral" />
            <Stat label="Unique" value={String(result.unique)} tone="violet" />
          </StatGrid>
        </div>
        {rows.length ? (
          <Table caption="Validation results" columns={COLUMNS} rows={rows} maxHeight={420} />
        ) : (
          <Callout title="No phone numbers found">Paste some text, or use “Load sample”.</Callout>
        )}
        <div className="row">
          <span className="label">Download</span>
          {(['json', 'csv', 'md'] as const).map((k) => (
            <Button
              key={k}
              size="sm"
              icon="ph:download-simple-bold"
              disabled={!view.length}
              onClick={() => onDownload(k)}
            >
              {k === 'md' ? 'Markdown' : k.toUpperCase()}
            </Button>
          ))}
          <span className="sr-only" aria-live="polite">
            {notice}
          </span>
        </div>
      </div>
    </div>
  );
}
