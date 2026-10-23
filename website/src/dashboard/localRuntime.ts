import type { Settings, ViewQuery, ViewResult } from '@numsy/engine';
import type { ExportFormat, ExportedFile, LoadedSource, Runtime } from './runtime';

const failure = async (res: Response): Promise<Error> => {
  try {
    const body = await res.json();
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    return new Error(message || `Request failed (${res.status})`);
  } catch {
    return new Error(`Request failed (${res.status})`);
  }
};

const post = async <T>(path: string, body: unknown): Promise<T> => {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await failure(res);
  return res.json() as Promise<T>;
};

const fileNameFrom = (res: Response, fallback: string) =>
  /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? fallback;

/**
 * Runtime for `numsy dashboard`: the local server parses, analyses and exports
 */
export function createLocalRuntime(version: string): Runtime {
  return {
    kind: 'local',
    label: `Local · v${version}`,

    async loadFile(file) {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/parse', { method: 'POST', body: form });
      if (!res.ok) throw await failure(res);
      return res.json() as Promise<LoadedSource>;
    },

    loadText(text, mode) {
      return post<LoadedSource>('/api/text', { text, mode });
    },

    view(sessionId: string, settings: Settings, query: ViewQuery) {
      return post<ViewResult>('/api/view', { sessionId, settings, query });
    },

    async exportFile(sessionId: string, settings: Settings, format: ExportFormat) {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, settings, format }),
      });
      if (!res.ok) throw await failure(res);
      const result: ExportedFile = {
        blob: await res.blob(),
        fileName: fileNameFrom(res, `numsy-${settings.only}.${format}`),
        rows: Number(res.headers.get('X-Numsy-Rows') ?? 0),
      };
      return result;
    },

    release(sessionId) {
      fetch(`/api/session/${encodeURIComponent(sessionId)}`, { method: 'DELETE' }).catch(() => {});
    },
  };
}
