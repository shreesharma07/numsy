import type { ViewResult } from '@numsy/engine';

const fmt = (value: number) => value.toLocaleString('en-IN');
const pct = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;

/**
 * Key figures plus a valid / duplicate / invalid distribution bar
 */
export function Summary({ view, kind }: { view: ViewResult; kind: 'file' | 'text' }) {
  const s = view.summary;
  const valid = Number(s.Valid ?? 0);
  const invalid = Number(s.Invalid ?? 0);
  const unique = Number(s.Unique ?? 0);
  const duplicates = Number(s.Duplicates ?? Math.max(valid - unique, 0));
  const total = Number(s.Records ?? s.Total ?? s.Found ?? valid + invalid);
  const removed = Number(s['Duplicates removed'] ?? 0);

  const tiles = [
    { label: kind === 'file' ? 'Records' : 'Checked', value: total, tone: 'ink' },
    { label: 'Valid', value: valid, tone: 'ok' },
    { label: 'Invalid', value: invalid, tone: 'bad' },
    { label: 'Unique', value: unique, tone: 'violet' },
    { label: 'Duplicates', value: duplicates, tone: 'amber' },
    ...(removed ? [{ label: 'Removed', value: removed, tone: 'coral' }] : []),
  ];

  const bar = valid + invalid;
  const segments = [
    { key: 'unique', label: 'Unique valid', value: unique },
    { key: 'dupe', label: 'Duplicates', value: duplicates },
    { key: 'invalid', label: 'Invalid', value: invalid },
  ];

  return (
    <section className="summary" aria-label="Summary">
      <dl className="summary__tiles">
        {tiles.map((tile) => (
          <div key={tile.label} className={`summary__tile summary__tile--${tile.tone}`}>
            <dt>{tile.label}</dt>
            <dd>{fmt(tile.value)}</dd>
          </div>
        ))}
      </dl>
      {bar > 0 && (
        <div className="summary__dist">
          <div
            className="summary__bar"
            role="img"
            aria-label={segments.map((seg) => `${seg.label} ${pct(seg.value, bar)}%`).join(', ')}
          >
            {segments.map(
              (seg) =>
                seg.value > 0 && (
                  <span
                    key={seg.key}
                    className={`summary__seg summary__seg--${seg.key}`}
                    style={{ flexGrow: seg.value }}
                  />
                ),
            )}
          </div>
          <ul className="summary__legend">
            {segments.map((seg) => (
              <li key={seg.key}>
                <span className={`summary__dot summary__seg--${seg.key}`} aria-hidden="true" />
                {seg.label} <b>{pct(seg.value, bar)}%</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
