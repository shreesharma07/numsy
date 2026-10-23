import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <Button
      iconOnly
      icon={theme === 'dark' ? 'ph:sun-bold' : 'ph:moon-bold'}
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      title={`Switch to ${next} theme`}
    >
      {`Switch to ${next} theme`}
    </Button>
  );
}
