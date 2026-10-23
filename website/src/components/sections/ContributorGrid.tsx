import { author } from '../../content/site';
import { useContributors } from '../../hooks/useContributors';
import { Avatar, Badge } from '../ui';
import './ContributorGrid.css';

export function ContributorGrid() {
  const { people, state } = useContributors();
  return (
    <>
      <ul className="people" aria-busy={state === 'loading'}>
        {people.map((p) => (
          <li key={p.login}>
            <a className="people__card" href={p.profileUrl} rel="noopener">
              <Avatar src={p.avatarUrl} alt="" name={p.login} size={64} />
              <b>{p.login}</b>
              <span className="people__meta">
                {p.login === author.github && <Badge tone="amber">Maintainer</Badge>}
                {p.contributions > 0 && (
                  <span className="label">
                    {p.contributions} {p.contributions === 1 ? 'commit' : 'commits'}
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {state === 'error' && (
        <p className="muted">
          Live contributor list unavailable right now (GitHub API limit), so only the maintainer is
          shown.
        </p>
      )}
    </>
  );
}
