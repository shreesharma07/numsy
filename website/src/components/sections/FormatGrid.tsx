import { formats } from '../../content/formats';
import { Card, RichText } from '../ui';
import './FormatGrid.css';

export function FormatGrid() {
  return (
    <div className="grid grid-3">
      {formats.map((f) => (
        <Card key={f.id} as="article" className="format">
          <div className={`format__top format__top--${f.tone}`}>
            <h3 className="format__name">{f.name}</h3>
            <span className="label">{f.ext}</span>
          </div>
          <p className="muted">
            <RichText text={f.description} />
          </p>
          <pre className="format__sample">{f.sample}</pre>
        </Card>
      ))}
    </div>
  );
}
