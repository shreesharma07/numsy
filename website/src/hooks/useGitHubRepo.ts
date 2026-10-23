import { useEffect, useState } from 'react';
import { repo } from '../content/site';
import { fetchJSON, isCount } from '../lib/cache';
import type { RepoStats } from '../types';

interface GitHubRepoResponse {
  stargazers_count?: unknown;
  forks_count?: unknown;
  open_issues_count?: unknown;
}

export function useGitHubRepo(): RepoStats {
  const [stats, setStats] = useState<RepoStats>({
    stars: null,
    forks: null,
    openIssues: null,
    state: 'loading',
  });
  useEffect(() => {
    let alive = true;
    fetchJSON<GitHubRepoResponse>(`https://api.github.com/repos/${repo.slug}`, 'numsy:gh').then(
      (d) => {
        if (!alive) return;
        if (!d) return setStats((s) => ({ ...s, state: 'error' }));
        setStats({
          stars: isCount(d.stargazers_count) ? d.stargazers_count : null,
          forks: isCount(d.forks_count) ? d.forks_count : null,
          openIssues: isCount(d.open_issues_count) ? d.open_issues_count : null,
          state: 'ready',
        });
      },
    );
    return () => {
      alive = false;
    };
  }, []);
  return stats;
}
