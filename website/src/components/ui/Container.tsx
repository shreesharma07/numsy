import type { ElementType, ReactNode } from 'react';
import './Container.css';

export function Container({
  as: Tag = 'div',
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={className ? `container ${className}` : 'container'}>{children}</Tag>;
}
