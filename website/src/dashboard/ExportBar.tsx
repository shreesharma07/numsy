import type { Settings } from '@numsy/engine';
import { useState } from 'react';
import { Button } from '../components/ui';
import { downloadBlob } from './download';
import type { ExportFormat, Runtime } from './runtime';

const FORMATS: Array<{ id: ExportFormat; label: string }> = [
  { id: 'csv', label: 'CSV' },
  { id: 'xlsx', label: 'Excel' },
  { id: 'json', label: 'JSON' },
  { id: 'md', label: 'Markdown' },
  { id: 'txt', label: 'Text' },
];

interface ExportBarProps {
  runtime: Runtime;
  sessionId: string;
  settings: Settings;
  /** Rows in the selected set */
  rows: number;
  setLabel: string;
}

/**
 * Downloads the selected row set in any format, shaped by the output settings
 */
export function ExportBar({ runtime, sessionId, settings, rows, setLabel }: ExportBarProps) {
  const [working, setWorking] = useState<ExportFormat | null>(null);
  const [message, setMessage] = useState('');
  const exported = settings.maxRows > 0 ? Math.min(rows, settings.maxRows) : rows;

  const download = async (format: ExportFormat) => {
    setWorking(format);
    setMessage('');
    try {
      const file = await runtime.exportFile(sessionId, settings, format);
      downloadBlob(file.blob, file.fileName);
      setMessage(`Downloaded ${file.fileName} (${file.rows.toLocaleString('en-IN')} rows)`);
    } catch (error) {
      setMessage(`Export failed: ${(error as Error).message}`);
    } finally {
      setWorking(null);
    }
  };

  return (
    <section className="exportbar" aria-label="Export">
      <div className="exportbar__info">
        <span className="label">Export</span>
        <span>
          {setLabel} · {exported.toLocaleString('en-IN')} rows
          {settings.columns === 'numbers' ? ' · name + number' : ''}
          {settings.numberHeader ? ` · header “${settings.numberHeader}”` : ''}
          {settings.header ? '' : ' · no header row'}
        </span>
      </div>
      <div className="exportbar__buttons">
        {FORMATS.map((format) => (
          <Button
            key={format.id}
            size="sm"
            variant={format.id === 'csv' ? 'primary' : 'ghost'}
            icon="ph:download-simple-bold"
            disabled={working !== null || exported === 0}
            onClick={() => download(format.id)}
          >
            {working === format.id ? 'Preparing…' : format.label}
          </Button>
        ))}
      </div>
      <p className="exportbar__message" role="status">
        {message}
      </p>
    </section>
  );
}
