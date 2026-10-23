import { community } from '../../content/site';
import { Icon } from '../ui';
import './CommunityLinks.css';

export function CommunityLinks() {
  return (
    <ul className="community">
      {community.map((c) => (
        <li key={c.label}>
          <a href={c.href} rel="noopener" className="community__link">
            <Icon name={c.icon} size={26} />
            <b>{c.label}</b>
            <span className="muted">{c.blurb}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
