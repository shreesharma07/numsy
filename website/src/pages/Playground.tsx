import { PageHeader } from '../components/layout/PageHeader';
import { PlaygroundTool } from '../components/sections/PlaygroundTool';
import { Callout, Section } from '../components/ui';
import { pages } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';

export function PlaygroundPage() {
  usePageMeta(pages.playground);
  return (
    <>
      <PageHeader
        label="Playground / Runs in your browser"
        num="Live"
        title="Paste. Validate. Download."
        lede="A JavaScript port of Numsy's rules. Nothing you paste leaves this page."
      />
      <Section id="tool" tone="alt">
        <PlaygroundTool />
      </Section>
      <Section id="rules" num="01" label="Rules" title="How a number passes.">
        <div className="grid grid-2">
          <Callout tone="note" title="Sanitize">
            <p>
              Strip everything except digits, then drop a <code>+91</code> / <code>0091</code>{' '}
              country code or a leading <code>0</code>.
            </p>
          </Callout>
          <Callout tone="tip" title="Validate">
            <p>
              Exactly 10 digits, starting with 6–9 — and not all-same, sequential (
              <code>9876543210</code>) or repeating (<code>9898989898</code>).
            </p>
          </Callout>
        </div>
        <p className="muted">
          The playground mirrors the library closely but the npm package is the source of truth —
          use the CLI or API for production data.
        </p>
      </Section>
    </>
  );
}
