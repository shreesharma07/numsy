import { Link } from 'react-router-dom';
import { usageWays } from '../../content/home';
import { Card, CodeBlock, Icon, RichText } from '../ui';
import './UsageTrio.css';

/** "Three ways in": CLI, library, local dashboard. */
export function UsageTrio() {
  return (
    <div className="grid grid-3">
      {usageWays.map((w) => (
        <Card key={w.title} band={w.tone} className="usage">
          <span className={`usage__step usage__step--${w.tone}`} aria-hidden="true">
            {w.step}
          </span>
          <h3>{w.title}</h3>
          <p className="usage__body muted">
            <RichText text={w.body} />
          </p>
          <CodeBlock code={w.code} lang={w.lang} label={w.label} className="usage__code" />
          <Link to={w.link.to} className="usage__link">
            {w.link.label} <Icon name="ph:arrow-right-bold" />
          </Link>
        </Card>
      ))}
    </div>
  );
}
