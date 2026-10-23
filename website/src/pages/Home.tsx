import { AuthorCard } from '../components/sections/AuthorCard';
import { BuiltWithClaude } from '../components/sections/BuiltWithClaude';
import { DocsIndex } from '../components/sections/DocsIndex';
import { FeatureGrid } from '../components/sections/FeatureGrid';
import { HomeHero } from '../components/sections/HomeHero';
import { LiveStats } from '../components/sections/LiveStats';
import { Ticker } from '../components/sections/Ticker';
import { UsageTrio } from '../components/sections/UsageTrio';
import { Button, Section } from '../components/ui';
import { pages } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';

export function HomePage() {
  usePageMeta(pages.home);
  return (
    <>
      <HomeHero />
      <Ticker />
      <Section id="stats" className="section--compact">
        <LiveStats />
      </Section>
      <Section
        id="features"
        num="01"
        label="Features / What's inside"
        title="Small package. Serious cleanup."
        lede="Phone columns in real spreadsheets are chaos. Numsy turns them into clean 10-digit Indian mobile numbers and tells you exactly why the rest were rejected."
        tone="alt"
      >
        <FeatureGrid />
      </Section>
      <Section
        id="usage"
        num="02"
        label="Usage / Three ways in"
        title="Terminal, code, or browser."
      >
        <UsageTrio />
      </Section>
      <Section
        id="playground-teaser"
        num="03"
        label="Playground / Runs in your browser"
        title="Paste. Validate. Download."
        lede="Try the rules on your own data without installing anything. Nothing you add leaves the page."
        tone="alt"
      >
        <div className="row">
          <Button variant="violet" to={pages.playground.path} icon="ph:play-bold">
            Open the playground
          </Button>
          <Button to={pages.faq.path} icon="ph:question-bold">
            Which numbers are valid?
          </Button>
        </div>
      </Section>
      <Section id="docs" num="04" label="Docs / Everything in one place" title="Read the manual.">
        <DocsIndex />
      </Section>
      <Section id="author" num="05" label="Author / Who builds it" tone="alt">
        <AuthorCard />
      </Section>
      <Section id="built-with" className="section--compact">
        <BuiltWithClaude id="built-with-claude" />
      </Section>
    </>
  );
}
