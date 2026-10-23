import { type CreditCategory, credits } from '../../content/credits';
import { Badge, RichText, Table } from '../ui';

const order: CreditCategory[] = [
  'AI assistance',
  'UI components',
  'Icons',
  'Fonts',
  'Frameworks & libraries',
  'Build & tooling',
  'Data & APIs',
  'Hosting',
  'Design',
];

/** One table per category, generated from content/credits.ts. */
export function CreditsList() {
  return (
    <>
      {order.map((cat) => {
        const items = credits.filter((c) => c.category === cat);
        if (!items.length) return null;
        return (
          <Table
            key={cat}
            caption={cat}
            columns={[
              { key: 'name', header: 'Resource', rowHeader: true, width: '22%' },
              { key: 'license', header: 'License', width: '20%' },
              { key: 'use', header: 'Used for' },
            ]}
            rows={items.map((c) => ({
              name: (
                <a href={c.url} rel="noopener">
                  {c.name}
                </a>
              ),
              license: c.licenseUrl ? (
                <a href={c.licenseUrl} rel="noopener">
                  <Badge tone="neutral">{c.license}</Badge>
                </a>
              ) : (
                <Badge tone="neutral">{c.license}</Badge>
              ),
              use: <RichText text={c.usedFor} />,
            }))}
          />
        );
      })}
    </>
  );
}
