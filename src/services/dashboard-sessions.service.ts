import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AnalysisSession, Source } from '../engine/session';

interface Entry {
  session: AnalysisSession;
  createdAt: number;
  usedAt: number;
}

/** Sessions expire an hour after their last use */
const TTL_MS = 60 * 60 * 1000;
/** Least recently used sessions are dropped beyond this many */
const MAX_SESSIONS = 8;

/**
 * In-memory store of loaded sources for the dashboard. Nothing is written to disk, and a
 * session is gone as soon as it expires, is replaced, or the server stops.
 */
@Injectable()
export class DashboardSessions {
  private readonly entries = new Map<string, Entry>();

  create(source: Source): { id: string; session: AnalysisSession } {
    this.prune();
    const id = randomUUID();
    const session = new AnalysisSession(source);
    this.entries.set(id, { session, createdAt: Date.now(), usedAt: Date.now() });
    while (this.entries.size > MAX_SESSIONS) {
      const oldest = [...this.entries].sort((a, b) => a[1].usedAt - b[1].usedAt)[0][0];
      this.entries.delete(oldest);
    }
    return { id, session };
  }

  get(id: string): AnalysisSession | undefined {
    this.prune();
    const entry = this.entries.get(id);
    if (entry) entry.usedAt = Date.now();
    return entry?.session;
  }

  /** Sessions currently held in memory */
  count(): number {
    this.prune();
    return this.entries.size;
  }

  delete(id: string): boolean {
    return this.entries.delete(id);
  }

  private prune(): void {
    const cutoff = Date.now() - TTL_MS;
    for (const [id, entry] of this.entries) {
      if (entry.usedAt < cutoff) this.entries.delete(id);
    }
  }
}
