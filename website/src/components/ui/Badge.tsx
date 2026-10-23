import type { ReactNode } from 'react';
import './Badge.css';

export type BadgeTone = 'ok' | 'bad' | 'neutral' | 'coral' | 'amber' | 'violet';

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
