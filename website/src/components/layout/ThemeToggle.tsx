import { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui';

/** Typing targets keep the T key; the shortcut only fires on the page itself. */
const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 't' || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTyping(e.target)) return;
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  return (
    <Button
      iconOnly
      icon={theme === 'dark' ? 'ph:sun-bold' : 'ph:moon-bold'}
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      aria-keyshortcuts="t"
      title={`Switch to ${next} theme (T)`}
    >
      {`Switch to ${next} theme`}
    </Button>
  );
}
