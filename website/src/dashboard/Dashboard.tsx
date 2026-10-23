import type { RowSet, Settings, ViewQuery, ViewResult } from '@numsy/engine';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon } from '../components/ui';
import { DropZone } from './DropZone';
import { ExportBar } from './ExportBar';
import { ResultsTable } from './ResultsTable';
import type { LoadedSource, Runtime } from './runtime';
import { SAMPLE_TEXT, sampleCsv } from './sample';
import { SettingsPanel } from './SettingsPanel';
import { Summary } from './Summary';
import { useSettings } from './useSettings';
import './Dashboard.css';

export interface DashboardProps {
  runtime: Runtime;
  /** Link to the privacy & data disclaimer */
  privacyHref: string;
}

type Phase = 'idle' | 'loading' | 'ready' | 'error';

const SETS: Array<{ id: RowSet; label: string }> = [
  { id: 'all', label: 'All rows' },
  { id: 'valid', label: 'Valid' },
  { id: 'invalid', label: 'Invalid' },
  { id: 'unique', label: 'Unique' },
  { id: 'duplicates', label: 'Duplicates' },
];

const formatBytes = (bytes: number) =>
  bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : bytes >= 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${bytes} B`;

/**
 * The Numsy dashboard: load a file or paste text, tune filters, browse results, export.
 * The same component runs on the website (in a Web Worker) and in `numsy dashboard` (on the server).
 */
export function Dashboard({ runtime, privacyHref }: DashboardProps) {
  const { settings, update, reset } = useSettings();
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [text, setText] = useState(SAMPLE_TEXT);
  const [textMode, setTextMode] = useState<'extract' | 'validate'>('extract');
  const [source, setSource] = useState<LoadedSource | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewResult | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState<Required<ViewQuery>>({
    page: 1,
    pageSize: 50,
    search: '',
    allColumns: false,
  });
  const [search, setSearch] = useState('');
  const request = useRef(0);

  // Debounce the search box
  useEffect(() => {
    const timer = setTimeout(() => setQuery((q) => ({ ...q, search, page: 1 })), 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch the visible page whenever the source, settings or query change
  useEffect(() => {
    if (!source) return;
    const id = ++request.current;
    setBusy(true);
    runtime
      .view(source.sessionId, settings, query)
      .then((result) => {
        if (id !== request.current) return;
        setView(result);
        setViewError(null);
      })
      .catch((err: Error) => {
        if (id !== request.current) return;
        setView(null);
        setViewError(err.message);
      })
      .finally(() => id === request.current && setBusy(false));
  }, [runtime, source, settings, query]);

  const open = useCallback(
    async (load: () => Promise<LoadedSource>) => {
      setPhase('loading');
      setError(null);
      setView(null);
      setViewError(null);
      try {
        const loaded = await load();
        setSource((previous) => {
          if (previous) runtime.release(previous.sessionId);
          return loaded;
        });
        update('phoneColumn', '');
        update('nameColumn', '');
        setQuery((q) => ({ ...q, page: 1 }));
        setPhase('ready');
      } catch (err) {
        setPhase('error');
        setError((err as Error).message);
      }
    },
    [runtime, update],
  );

  const openFile = (file: File) => open(() => runtime.loadFile(file));
  const openSample = () =>
    openFile(new File([sampleCsv()], 'numsy-sample.csv', { type: 'text/csv' }));
  const openText = () => text.trim() && open(() => runtime.loadText(text, textMode));

  const clear = () => {
    if (source) runtime.release(source.sessionId);
    setSource(null);
    setView(null);
    setPhase('idle');
    setError(null);
  };

  const setOnly = (only: RowSet) => {
    update('only', only);
    setQuery((q) => ({ ...q, page: 1 }));
  };
  const change = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    update(key, value);
    setQuery((q) => ({ ...q, page: 1 }));
  };

  const timing = useMemo(() => {
    if (!source) return '';
    const parts = [
      `${source.totalRows.toLocaleString('en-IN')} ${source.kind === 'file' ? 'rows' : 'lines'}`,
    ];
    if (source.kind === 'file')
      parts.push(formatBytes(source.size), `read in ${source.parseMs} ms`);
    if (view?.analyzeMs) parts.push(`view in ${view.analyzeMs} ms`);
    return parts.join(' · ');
  }, [source, view]);

  return (
    <div className="dash" data-runtime={runtime.kind}>
      <div className="dash__privacy" role="note">
        <Icon name="ph:shield-check-bold" size={20} />
        <p>
          {runtime.kind === 'browser'
            ? 'Files are processed in this browser tab and are never uploaded.'
            : 'Files are processed by the numsy server on this computer and never leave it.'}{' '}
          Numsy does not store your data, never sells or shares it with third parties, and never
          uses it for AI training. <a href={privacyHref}>Privacy &amp; data disclaimer</a>
        </p>
      </div>

      <div className="dash__layout">
        <aside className="dash__side" aria-label="Input and settings">
          <section className="dash__panel" aria-labelledby="dash-input">
            <div className="dash__panel-head">
              <h2 id="dash-input" className="label">
                Input
              </h2>
              <div className="dash__seg" role="tablist" aria-label="Input type">
                {(['file', 'text'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    className={mode === m ? 'is-on' : undefined}
                    onClick={() => setMode(m)}
                  >
                    {m === 'file' ? 'File' : 'Paste'}
                  </button>
                ))}
              </div>
            </div>
            {mode === 'file' ? (
              <DropZone disabled={phase === 'loading'} onFile={openFile} onSample={openSample} />
            ) : (
              <div className="dash__paste">
                <label className="sr-only" htmlFor="dash-text">
                  Numbers or free text
                </label>
                <textarea
                  id="dash-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  spellCheck={false}
                  rows={8}
                />
                <fieldset className="dash__radios">
                  <legend className="sr-only">How to read the text</legend>
                  <label>
                    <input
                      type="radio"
                      name="dash-text-mode"
                      checked={textMode === 'extract'}
                      onChange={() => setTextMode('extract')}
                    />
                    Find numbers in text
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="dash-text-mode"
                      checked={textMode === 'validate'}
                      onChange={() => setTextMode('validate')}
                    />
                    One value per line
                  </label>
                </fieldset>
                <Button
                  variant="primary"
                  icon="ph:magnifying-glass-bold"
                  onClick={openText}
                  disabled={!text.trim() || phase === 'loading'}
                >
                  Analyse text
                </Button>
              </div>
            )}
          </section>

          <SettingsPanel
            settings={settings}
            source={source}
            detected={view ? { phone: view.phoneColumn, name: view.nameColumn } : null}
            onChange={change}
            onReset={reset}
          />
        </aside>

        <section
          className="dash__main"
          aria-label="Results"
          aria-busy={busy || phase === 'loading'}
        >
          {phase === 'idle' && (
            <div className="dash__empty">
              <Icon name="ph:table-bold" size={40} />
              <h2>Drop a CSV or Excel file to begin</h2>
              <p className="muted">
                Numsy finds the phone column, validates every number, flags duplicates and lets you
                export exactly the rows you need.
              </p>
              <Button icon="ph:sparkle-bold" onClick={openSample}>
                Try a sample file
              </Button>
            </div>
          )}

          {phase === 'loading' && (
            <div className="dash__empty" role="status">
              <span className="dash__spinner" aria-hidden="true" />
              <h2>Reading your data…</h2>
              <p className="muted">Large workbooks can take a few seconds.</p>
            </div>
          )}

          {phase === 'error' && (
            <div className="dash__alert" role="alert">
              <Icon name="ph:warning-circle-bold" size={22} />
              <div>
                <strong>Could not read this input</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {phase === 'ready' && source && (
            <>
              <header className="dash__source">
                <div>
                  <h2 className="dash__source-name">
                    <Icon name={source.kind === 'file' ? 'ph:file-text-bold' : 'ph:text-aa-bold'} />
                    {source.name}
                  </h2>
                  <p className="dash__meta" aria-live="polite">
                    {timing}
                  </p>
                </div>
                <Button size="sm" icon="ph:x-bold" onClick={clear}>
                  Close
                </Button>
              </header>

              {viewError ? (
                <div className="dash__alert" role="alert">
                  <Icon name="ph:warning-circle-bold" size={22} />
                  <div>
                    <strong>Could not analyse this data</strong>
                    <p>{viewError}</p>
                    {source.kind === 'file' && (
                      <p className="muted">Pick the phone column under Settings → Columns.</p>
                    )}
                  </div>
                </div>
              ) : (
                view && (
                  <>
                    <Summary view={view} kind={source.kind} />
                    <div className="dash__sets" role="tablist" aria-label="Row set">
                      {SETS.map((set) => (
                        <button
                          key={set.id}
                          type="button"
                          role="tab"
                          aria-selected={settings.only === set.id}
                          className={settings.only === set.id ? 'dash__set is-on' : 'dash__set'}
                          onClick={() => setOnly(set.id)}
                        >
                          {set.label}
                          <span className="dash__count">
                            {view.counts[set.id].toLocaleString('en-IN')}
                          </span>
                        </button>
                      ))}
                    </div>
                    <ResultsTable
                      view={view}
                      search={search}
                      onSearch={setSearch}
                      busy={busy}
                      allColumns={query.allColumns}
                      canShowAllColumns={source.kind === 'file' && settings.only !== 'unique'}
                      onAllColumns={(allColumns) => setQuery((q) => ({ ...q, allColumns }))}
                      onPage={(page) => setQuery((q) => ({ ...q, page }))}
                      onPageSize={(pageSize) => setQuery((q) => ({ ...q, pageSize, page: 1 }))}
                    />
                    <ExportBar
                      runtime={runtime}
                      sessionId={source.sessionId}
                      settings={settings}
                      rows={view.counts[settings.only]}
                      setLabel={SETS.find((s) => s.id === settings.only)?.label ?? ''}
                    />
                  </>
                )
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
