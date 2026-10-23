import type { ReactNode } from 'react';
import { Icon } from './Icon';
import './Callout.css';

const ICONS = {
  tip: 'ph:lightbulb-bold',
  note: 'ph:info-bold',
  warn: 'ph:warning-bold',
} as const;

export function Callout({
  tone = 'note',
  title,
  children,
}: {
  tone?: keyof typeof ICONS;
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className={`callout callout--${tone}`}>
      <span className="callout__icon">
        <Icon name={ICONS[tone]} size={22} />
      </span>
      <div className="callout__body">
        {title && <p className="callout__title">{title}</p>}
        {children}
      </div>
    </aside>
  );
}
