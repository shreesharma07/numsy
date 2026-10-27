import { pkg } from '../../content/site';
import type { Tone } from '../../types';
import { Card, Icon } from '../ui';
import './SupplyChain.css';

interface ScanCardProps {
  provider: string;
  title: string;
  blurb: string;
  band: Exclude<Tone, 'surface'>;
  badge: { src: string; alt: string };
  facts: { label: string; value: string; href?: string }[];
  report: { label: string; href: string };
}

/* Socket and Snyk send no CORS headers, so the live values arrive as their badge images,
   seated in a themed pill rather than restyled. */
function ScanCard({ provider, title, blurb, band, badge, facts, report }: ScanCardProps) {
  return (
    <Card as="article" band={band} className="supply__card">
      <header className="supply__head">
        <span className="label">{provider}</span>
        <a className="supply__badge" href={report.href} rel="noopener">
          <img src={badge.src} alt={badge.alt} height="20" loading="lazy" />
        </a>
      </header>
      <h3 className="supply__title display">{title}</h3>
      <p className="supply__blurb muted">{blurb}</p>
      <dl className="supply__facts">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="label">{f.label}</dt>
            <dd>
              {f.href ? (
                <a href={f.href} rel="noopener">
                  {f.value}
                </a>
              ) : (
                f.value
              )}
            </dd>
          </div>
        ))}
      </dl>
      <a className="supply__link" href={report.href} rel="noopener">
        {report.label} <Icon name="ph:arrow-up-right-bold" />
      </a>
    </Card>
  );
}

/** Supply-chain trust signals for the published npm version: Socket score + Snyk scan. */
export function SupplyChain({ version }: { version: string }) {
  return (
    <section className="supply grid grid-2" aria-label="Supply-chain security">
      <ScanCard
        provider="Supply chain · Socket"
        title="Socket score"
        blurb="Each published version is checked for malware, typosquats, install scripts and risky dependencies."
        band="violet"
        badge={{ src: pkg.socketBadge(version), alt: `Socket security score for numsy ${version}` }}
        facts={[
          { label: 'Version', value: `v${version}`, href: pkg.socketReport(version) },
          { label: 'Install scripts', value: 'None' },
        ]}
        report={{ label: `Socket report for v${version}`, href: pkg.socketReport(version) }}
      />
      <ScanCard
        provider="Vulnerabilities · Snyk"
        title="Snyk scan"
        blurb="Dependency and static-analysis scans with Snyk, with every accepted risk explained in the audit report."
        band="coral"
        badge={{
          src: pkg.snykBadge(version),
          alt: `Snyk vulnerability status for numsy ${version}`,
        }}
        facts={[
          { label: 'Prod dependencies', value: '0 known vulns' },
          { label: 'Last audit', value: pkg.audit.date, href: pkg.audit.report },
        ]}
        report={{ label: 'Snyk package page', href: pkg.snykReport }}
      />
    </section>
  );
}
