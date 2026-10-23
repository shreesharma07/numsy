import type { Settings, ViewQuery, ViewResult } from '@numsy/engine';
import type { WorkerRequest } from './engine.worker';
import type { ExportFormat, ExportedFile, LoadedSource, Runtime } from './runtime';

type Pending = { resolve: (value: any) => void; reject: (error: Error) => void };

/**
 * Runtime for the website: a Web Worker runs the engine, so files never leave the browser
 */
export function createBrowserRuntime(): Runtime {
  const worker = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });
  const pending = new Map<number, Pending>();
  let next = 0;

  worker.onmessage = (
    event: MessageEvent<{ id: number; ok: boolean; result?: unknown; error?: string }>,
  ) => {
    const { id, ok, result, error } = event.data;
    const call = pending.get(id);
    if (!call) return;
    pending.delete(id);
    if (ok) call.resolve(result);
    else call.reject(new Error(error));
  };
  worker.onerror = (event) => {
    for (const call of pending.values()) call.reject(new Error(event.message || 'Worker failed'));
    pending.clear();
  };

  const call = <T>(request: WorkerRequest): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const id = ++next;
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, request });
    });

  return {
    kind: 'browser',
    label: 'In your browser',
    loadFile: (file: File) => call<LoadedSource>({ type: 'loadFile', file }),
    loadText: (text, mode) => call<LoadedSource>({ type: 'loadText', text, mode }),
    view: (sessionId: string, settings: Settings, query: ViewQuery) =>
      call<ViewResult>({ type: 'view', sessionId, settings, query }),
    exportFile: (sessionId: string, settings: Settings, format: ExportFormat) =>
      call<ExportedFile>({ type: 'export', sessionId, settings, format }),
    release: (sessionId) => {
      call({ type: 'release', sessionId }).catch(() => {});
    },
  };
}
