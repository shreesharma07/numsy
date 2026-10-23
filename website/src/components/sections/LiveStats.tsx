import { pkg, repo } from '../../content/site';
import { useGitHubRepo } from '../../hooks/useGitHubRepo';
import { useNpmStats } from '../../hooks/useNpmStats';
import { Stat, StatGrid } from '../ui';
import './LiveStats.css';

/** Live GitHub + npm numbers with static fallbacks (never "undefined"/NaN). */
export function LiveStats() {
  const gh = useGitHubRepo();
  const npm = useNpmStats();
  const version = npm.version ?? pkg.fallbackVersion;
  const socket = pkg.socketBadge(version);
  return (
    <>
      <StatGrid label="Live project stats">
        <Stat label="GitHub stars" value={gh.stars} href={repo.stargazers} tone="amber" />
        <Stat label="Forks" value={gh.forks} href={repo.forks} tone="coral" />
        <Stat label="npm version" value={version} prefix="v" href={pkg.npmUrl} tone="violet" />
        <Stat label="Downloads / week" value={npm.weeklyDownloads} href={pkg.npmUrl} />
        <Stat label="License" value={pkg.license} href={repo.file('LICENSE')} />
      </StatGrid>
      <p className="live-stats__badges">
        <span className="label">Supply-chain security</span>
        <a href={socket} rel="noopener">
          <img src={socket} alt={`Socket security score for @numsy/numsy ${version}`} height="20" />
        </a>
      </p>
    </>
  );
}
