import { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Callout, CodeBlock, Section } from '../components/ui';
import { pages } from '../content/pages';
import { createBrowserRuntime } from '../dashboard/browserRuntime';
import { Dashboard } from '../dashboard/Dashboard';
import { usePageMeta } from '../hooks/usePageMeta';

export function PlaygroundPage() {
  usePageMeta(pages.playground);
  // One worker for the lifetime of the page
  const [runtime] = useState(createBrowserRuntime);

  return (
    <>
      <PageHeader
        label="Playground / Runs in your browser"
        num="Live"
        title="Upload. Filter. Export."
        lede="The real Numsy engine, compiled for the browser. Drop a CSV or Excel file, or paste text: nothing you add leaves this tab."
      />
      <Section id="tool" tone="alt">
        <Dashboard runtime={runtime} privacyHref={pages.privacy.path} />
      </Section>
      <Section id="rules" num="01" label="Rules" title="How a number passes.">
        <div className="grid grid-2">
          <Callout tone="note" title="Sanitize">
            <p>
              Strip everything except digits, then drop a <code>+91</code> / <code>91</code> country
              code or a leading <code>0</code>.
            </p>
          </Callout>
          <Callout tone="tip" title="Validate">
            <p>
              Exactly 10 digits starting with 6–9. With <strong>Reject dummy numbers</strong> on,
              all-same digits (<code>9999999999</code>), <code>1234567890</code> and similar test
              patterns fail too.
            </p>
          </Callout>
        </div>
      </Section>
      <Section
        id="local"
        num="02"
        label="Same tool, on your machine"
        title="Big files? Run it locally."
      >
        <p className="lede">
          The playground and the local dashboard share one engine and one interface. Locally the
          Numsy server does the work, so very large workbooks stay fast and nothing touches the
          internet at all.
        </p>
        <CodeBlock
          lang="sh"
          label="Shell"
          code={'npx numsy dashboard --open\n# → http://localhost:6789'}
        />
      </Section>
    </>
  );
}
