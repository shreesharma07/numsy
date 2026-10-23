import { features } from '../../content/home';
import { Card, Icon, RichText } from '../ui';
import './FeatureGrid.css';

export function FeatureGrid() {
  return (
    <div className="grid grid-3">
      {features.map((f) => (
        <Card key={f.title} as="article" spotlight>
          <span className={`feature__icon feature__icon--${f.tone}`}>
            <Icon name={f.icon} size={26} />
          </span>
          <h3>{f.title}</h3>
          <p className="muted">
            <RichText text={f.body} />
          </p>
        </Card>
      ))}
    </div>
  );
}
