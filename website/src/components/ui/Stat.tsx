import type { ReactNode } from 'react';
import type { Tone } from '../../types';
import CountUp from '../reactbits/CountUp/CountUp';
import './Stat.css';

export interface StatProps {
  label: string;
  /** Numbers animate with React Bits CountUp; strings render as-is; null shows the fallback. */
  value: number | string | null;
  fallback?: string;
  prefix?: string;
  href?: string;
  tone?: Tone;
}

export function Stat({
  label,
  value,
  fallback = '-',
  prefix = '',
  href,
  tone = 'surface',
}: StatProps) {
  let display: ReactNode = fallback;
  if (typeof value === 'number') {
    display = (
      <CountUp
        to={value}
        from={0}
        duration={1.4}
        prefix={prefix}
        separator=","
        trigger="load"
        format={value >= 10000 ? 'compact' : 'standard'}
      />
    );
  } else if (typeof value === 'string' && value) {
    display = `${prefix}${value}`;
  }
  const body = (
    <>
      <span className="label">{label}</span>
      <b className="stat__value">{display}</b>
    </>
  );
  const cls = `stat stat--${tone}`;
  return href ? (
    <a className={cls} href={href} rel="noopener">
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function StatGrid({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <section className="stat-grid" aria-label={label}>
      {children}
    </section>
  );
}
