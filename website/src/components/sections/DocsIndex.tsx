import { Link } from 'react-router-dom';
import { docsCards } from '../../content/home';
import { Card, Icon } from '../ui';
import './DocsIndex.css';

export function DocsIndex() {
  return (
    <div className="grid grid-3">
      {docsCards.map((d) => (
        <Card key={d.to} spotlight>
          <Link to={d.to} className="docs-index__link">
            <Icon name={d.icon} size={28} />
            <span className="docs-index__title">{d.title}</span>
            <span className="muted">{d.body}</span>
          </Link>
        </Card>
      ))}
    </div>
  );
}
