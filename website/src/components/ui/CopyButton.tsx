import { useEffect, useRef, useState } from 'react';
import { copyText } from '../../lib/clipboard';
import { Icon } from './Icon';
import './CopyButton.css';

export function CopyButton({
  text,
  label = 'Copy',
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const onClick = async () => {
    const ok = await copyText(text);
    setState(ok ? 'copied' : 'failed');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 1800);
  };
  return (
    <button
      type="button"
      className={className ? `copy-btn ${className}` : 'copy-btn'}
      onClick={onClick}
    >
      <Icon name={state === 'copied' ? 'ph:check-bold' : 'ph:copy-bold'} />
      <span aria-live="polite">
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Press Ctrl+C' : label}
      </span>
    </button>
  );
}
