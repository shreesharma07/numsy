import type { ReactNode } from 'react';
import { Container } from './Container';
import './Section.css';

export interface SectionProps {
  id?: string;
  /** Poster section number, e.g. "01" */
  num?: string;
  /** Small tracked-out label, e.g. "CLI / New in 1.2.0" */
  label?: string;
  title?: ReactNode;
  lede?: ReactNode;
  tone?: 'default' | 'alt';
  /** Heading level for the title (default h2) */
  level?: 2 | 3;
  className?: string;
  children?: ReactNode;
}

/** Numbered poster section: label + big number, rule, display title, lede, content. */
export function Section({
  id,
  num,
  label,
  title,
  lede,
  tone = 'default',
  level = 2,
  className,
  children,
}: SectionProps) {
  const H = level === 2 ? 'h2' : 'h3';
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      className={['section', `section--${tone}`, className].filter(Boolean).join(' ')}
      aria-labelledby={title ? headingId : undefined}
    >
      <Container>
        {(label || num) && (
          <div className="section__head">
            <span className="label">{label}</span>
            {num && (
              <span className="section__num" aria-hidden="true">
                {num}
              </span>
            )}
          </div>
        )}
        {title && (
          <H id={headingId} className="display section__title">
            {title}
          </H>
        )}
        {lede && <p className="lede section__lede">{lede}</p>}
        {children}
      </Container>
    </section>
  );
}
