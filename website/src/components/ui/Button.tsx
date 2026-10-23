import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconProps } from './Icon';
import './Button.css';

export type ButtonVariant = 'primary' | 'coral' | 'violet' | 'ghost';

interface BaseProps {
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: IconProps['name'];
  iconRight?: IconProps['name'];
  /** Icon-only button: children become the accessible label */
  iconOnly?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps &
  (
    | ({ to: string; href?: never } & { 'aria-label'?: string })
    | ({ href: string; to?: never } & { 'aria-label'?: string })
    | ({ to?: never; href?: never } & Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        'children' | 'className'
      >)
  );

export function Button(props: ButtonProps) {
  const {
    variant = 'ghost',
    size = 'md',
    icon,
    iconRight,
    iconOnly,
    className,
    children,
    ...rest
  } = props;
  const cls = ['btn', `btn--${variant}`, `btn--${size}`, iconOnly && 'btn--icon', className]
    .filter(Boolean)
    .join(' ');
  const inner = (
    <>
      {icon && <Icon name={icon} />}
      {iconOnly ? <span className="sr-only">{children}</span> : children}
      {iconRight && <Icon name={iconRight} />}
    </>
  );
  if ('to' in rest && rest.to) {
    const { to, ...a } = rest;
    return (
      <Link className={cls} to={to} {...a}>
        {inner}
      </Link>
    );
  }
  if ('href' in rest && rest.href) {
    const { href, ...a } = rest;
    const external = /^https?:\/\//.test(href);
    return (
      <a className={cls} href={href} {...(external ? { rel: 'noopener' } : {})} {...a}>
        {inner}
      </a>
    );
  }
  const { type = 'button', ...b } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={cls} type={type} {...b}>
      {inner}
    </button>
  );
}
