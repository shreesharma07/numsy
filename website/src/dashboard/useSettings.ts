import { DEFAULT_SETTINGS, resolveSettings, type Settings } from '@numsy/engine';
import { useCallback, useEffect, useState } from 'react';

const KEY = 'numsy.dashboard.settings.v1';

/** Column choices belong to one file, so they are never remembered */
const remembered = (settings: Settings) => ({ ...settings, phoneColumn: '', nameColumn: '' });

const load = (): Settings => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? remembered(resolveSettings(JSON.parse(raw))) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

/**
 * Dashboard settings, remembered in this browser between visits
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(remembered(settings)));
    } catch {
      // private mode or blocked storage: settings just aren't remembered
    }
  }, [settings]);

  const update = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) =>
      setSettings((current) => ({ ...current, [key]: value })),
    [],
  );
  const reset = useCallback(
    () =>
      setSettings((current) => ({
        ...DEFAULT_SETTINGS,
        phoneColumn: current.phoneColumn,
        nameColumn: current.nameColumn,
      })),
    [],
  );

  return { settings, setSettings, update, reset };
}
