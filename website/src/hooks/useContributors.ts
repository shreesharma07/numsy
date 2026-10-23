import { useEffect, useState } from 'react';
import { author, repo } from '../content/site';
import { fetchJSON, isCount } from '../lib/cache';
import type { Contributor, LoadState } from '../types';

interface ApiContributor {
  login?: unknown;
  type?: unknown;
  avatar_url?: unknown;
  html_url?: unknown;
  contributions?: unknown;
}

const BOTS = new Set(['semantic-release-bot', 'dependabot', 'renovate', 'github-actions']);

/** Shown when the API is unreachable or rate-limited. */
export const FALLBACK_CONTRIBUTORS: Contributor[] = [
  {
    login: author.github,
    avatarUrl: `https://avatars.githubusercontent.com/${author.github}?s=128`,
    profileUrl: `https://github.com/${author.github}`,
    contributions: 0,
  },
];

function toContributor(u: ApiContributor): Contributor | null {
  if (typeof u.login !== 'string' || !u.login) return null;
  if (u.type === 'Bot' || /\[bot\]$/i.test(u.login) || BOTS.has(u.login)) return null;
  const avatar =
    typeof u.avatar_url === 'string' &&
    u.avatar_url.startsWith('https://avatars.githubusercontent.com/')
      ? `${u.avatar_url}${u.avatar_url.includes('?') ? '&' : '?'}s=128`
      : `https://avatars.githubusercontent.com/${encodeURIComponent(u.login)}?s=128`;
  const profile =
    typeof u.html_url === 'string' && u.html_url.startsWith('https://github.com/')
      ? u.html_url
      : `https://github.com/${encodeURIComponent(u.login)}`;
  return {
    login: u.login,
    avatarUrl: avatar,
    profileUrl: profile,
    contributions: isCount(u.contributions) ? u.contributions : 0,
  };
}

export function useContributors(): { people: Contributor[]; state: LoadState } {
  const [people, setPeople] = useState<Contributor[]>(FALLBACK_CONTRIBUTORS);
  const [state, setState] = useState<LoadState>('loading');
  useEffect(() => {
    let alive = true;
    fetchJSON<ApiContributor[]>(
      `https://api.github.com/repos/${repo.slug}/contributors?per_page=100`,
      'numsy:contrib',
    ).then((list) => {
      if (!alive) return;
      const humans = Array.isArray(list)
        ? list.map(toContributor).filter((c): c is Contributor => c !== null)
        : [];
      if (humans.length) {
        setPeople(humans);
        setState('ready');
      } else {
        setState('error');
      }
    });
    return () => {
      alive = false;
    };
  }, []);
  return { people, state };
}
