import type { ReactNode } from 'react';
import { Container } from '../ui';
import './PageHeader.css';

export interface PageHeaderProps {
  /** Tracked label left of the rule, e.g. "Docs / Reference" */
  label: string;
  /** Poster number right of the rule */
  num?: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  /** Decorative poster composition on the right */
  art?: boolean;
}

/** Top-of-page poster header. Every page except Home uses it for its single <h1>. */
export function PageHeader({ label, num, title, lede, children, art = true }: PageHeaderProps) {
  return (
    <header className="page-header">
      <Container>
        <div className="page-header__rule">
          <span className="label">{label}</span>
          {num && <span className="label">{num}</span>}
        </div>
        <div className={art ? 'page-header__grid' : undefined}>
          <div>
            <h1 className="display page-header__title">{title}</h1>
            {lede && <p className="lede page-header__lede">{lede}</p>}
            {children}
          </div>
          {art && (
            <svg
              className="page-header__art"
              viewBox="0 0 240 160"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="0" y="0" width="116" height="76" fill="#8338EC" />
              <path d="M0 76 A58 58 0 0 1 116 76 Z" fill="#FF4D6D" />
              <rect x="124" y="0" width="116" height="76" fill="#FFB703" />
              <circle cx="182" cy="38" r="22" fill="#111111" />
              <rect x="0" y="84" width="116" height="76" fill="#FFB703" />
              <path d="M0 84 L116 160 L0 160 Z" fill="#111111" />
              <rect x="124" y="84" width="116" height="76" fill="#FF4D6D" />
              <path d="M124 84 A76 76 0 0 1 200 160 L124 160 Z" fill="#8338EC" />
            </svg>
          )}
        </div>
      </Container>
    </header>
  );
}
