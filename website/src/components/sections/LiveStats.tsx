import { pkg, repo } from '../../content/site';
import { useGitHubRepo } from '../../hooks/useGitHubRepo';
import { useNpmStats } from '../../hooks/useNpmStats';
import { Stat, StatGrid } from '../ui';

/** Live GitHub + npm numbers with static fallbacks (never "undefined"/NaN). */
export function LiveStats() {
  const gh = useGitHubRepo();
  const npm = useNpmStats();
  return (
    <StatGrid label="Live project stats">
      <Stat label="GitHub stars" value={gh.stars} href={repo.stargazers} tone="amber" />
      <Stat label="Forks" value={gh.forks} href={repo.forks} tone="coral" />
      <Stat
        label="npm version"
        value={npm.version ?? pkg.fallbackVersion}
        prefix="v"
        href={pkg.npmUrl}
        tone="violet"
      />
      <Stat label="Downloads / week" value={npm.weeklyDownloads} href={pkg.npmUrl} />
      <Stat label="License" value={pkg.license} href={repo.file('LICENSE')} />
    </StatGrid>
  );
}
