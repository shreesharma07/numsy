import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useTheme } from '../../hooks/useTheme';
import SpotlightCard from '../reactbits/SpotlightCard/SpotlightCard';
import type { Tone } from '../../types';
import './Card.css';

export interface CardProps {
  as?: ElementType;
  tone?: Tone;
  /** Adds the React Bits SpotlightCard pointer glow (coral), themed to the poster palette. */
  spotlight?: boolean;
  /** Top band colour strip */
  band?: Exclude<Tone, 'surface'>;
  className?: string;
  children: ReactNode;
}

const SPOTLIGHT_VARS = {
  '--spotlight-card-surface': 'var(--surface)',
  '--spotlight-card-border': 'transparent',
  '--spotlight-card-shadow': 'none',
} as CSSProperties;

export function Card({
  as: Tag = 'div',
  tone = 'surface',
  spotlight,
  band,
  className,
  children,
}: CardProps) {
  const { theme } = useTheme();
  const cls = ['card', `card--${tone}`, band && `card--band-${band}`, className]
    .filter(Boolean)
    .join(' ');
  if (spotlight) {
    return (
      <Tag className="card-spot">
        <SpotlightCard
          className={cls}
          theme={theme}
          spotlightColor="#FF4D6D"
          intensity={theme === 'dark' ? 0.22 : 0.5}
          spotlightSize={280}
          borderGlow={0}
          style={SPOTLIGHT_VARS}
        >
          {children}
        </SpotlightCard>
      </Tag>
    );
  }
  return <Tag className={cls}>{children}</Tag>;
}
