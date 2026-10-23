import { Link } from 'react-router-dom';
import { usageWays } from '../../content/home';
import { Card, CodeBlock, Icon, RichText } from '../ui';
import './UsageTrio.css';

/** "Three ways in": CLI, library, web UI. */
export function UsageTrio() {
  return (
    <div className="grid grid-3">
      {usageWays.map((w) => (
        <Card key={w.title} band={w.tone}>
          <span className={`usage__step usage__step--${w.tone}`} aria-hidden="true">
            {w.step}
          </span>
          <h3>{w.title}</h3>
          <p className="muted">
            <RichText text={w.body} />
          </p>
          <CodeBlock code={w.code} lang={w.lang} label={w.label} />
          <Link to={w.link.to} className="usage__link">
            {w.link.label} <Icon name="ph:arrow-right-bold" />
          </Link>
        </Card>
      ))}
    </div>
  );
}
