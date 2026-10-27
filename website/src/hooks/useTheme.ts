import { useCallback, useSyncExternalStore } from 'react';
import type { ThemeName } from '../types';

/**
 * Theme = explicit choice (data-theme on <html>, persisted in localStorage) or, when unset,
 * the OS preference. index.html applies the stored choice before first paint.
 */
const STORAGE_KEY = 'numsy-theme';
const listeners = new Set<() => void>();
const mq =
  typeof window !== 'undefined' ? window.matchMedia?.('(prefers-color-scheme: dark)') : undefined;

const explicit = (): ThemeName | null => {
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'light' || t === 'dark' ? t : null;
};
const snapshot = () => `${explicit() ?? 'system'}|${mq?.matches ? 'dark' : 'light'}`;
const emit = () => {
  for (const l of listeners) l();
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  mq?.addEventListener?.('change', cb);
  return () => {
    listeners.delete(cb);
    mq?.removeEventListener?.('change', cb);
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
  const snap = useSyncExternalStore(subscribe, snapshot, () => 'system|light');
  const [pref, system] = snap.split('|') as [ThemeName | 'system', ThemeName];
  const theme: ThemeName = pref === 'system' ? system : pref;
  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme]);
  return { theme, isSystem: pref === 'system', toggle };
}
