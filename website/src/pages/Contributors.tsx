import { PageHeader } from '../components/layout/PageHeader';
import { CommunityLinks } from '../components/sections/CommunityLinks';
import { ContributorGrid } from '../components/sections/ContributorGrid';
import { Button, Section } from '../components/ui';
import { pages } from '../content/pages';
import { repo } from '../content/site';
import { usePageMeta } from '../hooks/usePageMeta';

export function ContributorsPage() {
  usePageMeta(pages.contributors);
  return (
    <>
      <PageHeader
        label="Community / Thank you"
        num="Open source"
        title="The people behind it."
        lede="Live from the GitHub API (bots excluded)."
      />
      <Section id="contributors" num="01" label="Contributors" title="Contributors.">
        <ContributorGrid />
        <Button href={repo.file('CONTRIBUTING.md')} iconRight="ph:arrow-right-bold">
          Become a contributor
        </Button>
      </Section>
      <Section
        id="community"
        num="02"
        label="Community / Get involved"
        title="Get involved."
        tone="alt"
      >
        <CommunityLinks />
      </Section>
    </>
  );
}
