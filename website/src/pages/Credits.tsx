import { PageHeader } from '../components/layout/PageHeader';
import { BuiltWithClaude } from '../components/sections/BuiltWithClaude';
import { CreditsList } from '../components/sections/CreditsList';
import { Callout, Section } from '../components/ui';
import { pages } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';

export function CreditsPage() {
  usePageMeta(pages.credits);
  return (
    <>
      <PageHeader
        label="Credits / Standing on shoulders"
        num="Thanks"
        title="Credits."
        lede="Every external library, font, icon set, API and inspiration this site uses, with licenses."
      />
      <Section id="credits">
        <div className="mb-6">
          <BuiltWithClaude id="built-with-claude" />
        </div>
        <Callout tone="note" title="React Bits license">
          <p>
            React Bits components are MIT + Commons Clause: free to use inside this website, but the
            components themselves may not be sold or redistributed on their own. Their source in
            this repo keeps the copyright notice.
          </p>
        </Callout>
        <CreditsList />
      </Section>
    </>
  );
}
