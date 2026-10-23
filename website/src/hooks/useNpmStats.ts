import { useEffect, useState } from 'react';
import { pkg } from '../content/site';
import { fetchJSON, isCount } from '../lib/cache';
import type { NpmStats } from '../types';

export function useNpmStats(): NpmStats {
  const [stats, setStats] = useState<NpmStats>({
    version: null,
    weeklyDownloads: null,
    state: 'loading',
  });
  useEffect(() => {
    let alive = true;
    const scoped = encodeURIComponent(pkg.name).replace('%40', '@');
    Promise.all([
      fetchJSON<{ version?: unknown }>(`https://registry.npmjs.org/${scoped}/latest`, 'numsy:npm'),
      fetchJSON<{ downloads?: unknown }>(
        `https://api.npmjs.org/downloads/point/last-week/${pkg.name}`,
        'numsy:dl',
      ),
    ]).then(([meta, dl]) => {
      if (!alive) return;
      const version =
        typeof meta?.version === 'string' && /^\d+\.\d+\.\d+/.test(meta.version)
          ? meta.version
          : null;
      const weeklyDownloads = isCount(dl?.downloads) ? dl.downloads : null;
      setStats({ version, weeklyDownloads, state: meta || dl ? 'ready' : 'error' });
    });
    return () => {
      alive = false;
    };
  }, []);
  return stats;
}
