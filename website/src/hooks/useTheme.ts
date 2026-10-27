import { useCallback, useSyncExternalStore } from 'react';
import type { ThemeName } from '../types';

/**
 * Theme = explicit choice (data-theme on <html>, persisted in localStorage), light by default.
 * index.html applies the stored choice before first paint.
 */
const STORAGE_KEY = 'numsy-theme';
const listeners = new Set<() => void>();

const snapshot = (): ThemeName =>
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
const emit = () => {
  for (const l of listeners) l();
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function setTheme(next: ThemeName): void {
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // private mode / blocked storage: the choice just won't persist
  }
  emit();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, snapshot, (): ThemeName => 'light');
  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme]);
  return { theme, toggle };
}
