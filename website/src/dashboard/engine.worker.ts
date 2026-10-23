/// <reference lib="webworker" />
/**
 * Runs the Numsy engine off the main thread for the website dashboard.
 * Files are read here, in the visitor's browser, and never leave it.
 */
import {
  AnalysisSession,
  buildWorkbook,
  datasetSheets,
  parseCsv,
  resolveSettings,
  serializeDataset,
  worksheetToRows,
  type FileParseResult,
  type ViewQuery,
} from '@numsy/engine';
import { type ExportFormat, exportName } from './runtime';

export type WorkerRequest =
  | { type: 'loadFile'; file: File }
  | { type: 'loadText'; text: string; mode: 'validate' | 'extract' }
  | { type: 'view'; sessionId: string; settings: unknown; query: ViewQuery }
  | { type: 'export'; sessionId: string; settings: unknown; format: ExportFormat }
  | { type: 'release'; sessionId: string };

const scope = self as unknown as DedicatedWorkerGlobalScope;
const sessions = new Map<string, AnalysisSession>();
let counter = 0;

const now = () => performance.now();

/** ExcelJS is ~900 kB, so it only loads when a workbook is opened or exported */
const loadExcel = async () => {
  const mod = (await import('exceljs')) as unknown as { default?: typeof import('exceljs') };
  return (mod.default ?? mod) as typeof import('exceljs');
};

async function readFile(file: File): Promise<FileParseResult> {
  if (/\.csv$/i.test(file.name)) return parseCsv(await file.text());

  const ExcelJS = await loadExcel();
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(await file.arrayBuffer());
  } catch {
    throw new Error(
      /\.xls$/i.test(file.name)
        ? 'Legacy Excel 97-2003 (.xls) files are not supported: save it as .xlsx or .csv.'
        : 'This is not a valid .xlsx workbook (it may be truncated or corrupted; try re-saving it in Excel).',
    );
  }
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error('No worksheet found in this workbook.');
  return worksheetToRows(worksheet);
}

const session = (id: string) => {
  const found = sessions.get(id);
  if (!found) throw new Error('This session has expired. Load the file again.');
  return found;
};

const open = (created: AnalysisSession, size: number, parseMs: number) => {
  const sessionId = `s${++counter}`;
  // Keep only the latest few sources in memory
  sessions.set(sessionId, created);
  while (sessions.size > 4) sessions.delete(sessions.keys().next().value as string);
  return { sessionId, ...created.info(), size, parseMs };
};

async function handle(request: WorkerRequest): Promise<unknown> {
  switch (request.type) {
    case 'loadFile': {
      const started = now();
      const parsed = await readFile(request.file);
      const created = new AnalysisSession({
        kind: 'file',
        fileName: request.file.name,
        rows: parsed.data,
        columns: parsed.detectedColumns,
      });
      return open(created, request.file.size, Math.round(now() - started));
    }
    case 'loadText': {
      const created = new AnalysisSession({ kind: 'text', mode: request.mode, text: request.text });
      return open(created, request.text.length, 0);
    }
    case 'view':
      return session(request.sessionId).view(resolveSettings(request.settings), request.query);
    case 'export': {
      const current = session(request.sessionId);
      const settings = resolveSettings(request.settings);
      const dataset = current.exportDataset(settings);
      const { source } = current;
      const fileName = exportName(
        source.kind === 'file' ? source.fileName : `numsy-${source.mode}`,
        settings.only,
        request.format,
      );
      let blob: Blob;
      if (request.format === 'xlsx') {
        const ExcelJS = await loadExcel();
        const workbook = buildWorkbook(ExcelJS, datasetSheets(dataset), {
          header: settings.header,
        });
        blob = new Blob([await workbook.xlsx.writeBuffer()], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      } else {
        const mime = {
          csv: 'text/csv',
          json: 'application/json',
          md: 'text/markdown',
          txt: 'text/plain',
        };
        blob = new Blob(
          [serializeDataset(dataset, request.format, true, { header: settings.header })],
          { type: `${mime[request.format]};charset=utf-8` },
        );
      }
      return { blob, fileName, rows: dataset.rows.length };
    }
    case 'release':
      sessions.delete(request.sessionId);
      return null;
  }
}

scope.onmessage = async (event: MessageEvent<{ id: number; request: WorkerRequest }>) => {
  const { id, request } = event.data;
  try {
    scope.postMessage({ id, ok: true, result: await handle(request) });
  } catch (error) {
    scope.postMessage({ id, ok: false, error: (error as Error).message || String(error) });
  }
};
