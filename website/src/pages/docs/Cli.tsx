import { PageHeader } from '../../components/layout/PageHeader';
import {
  CliCommands,
  CliExamples,
  CliExitCodes,
  CliOptions,
} from '../../components/sections/CliReference';
import { Callout, CodeBlock, Section } from '../../components/ui';
import { synopsis } from '../../content/cli';
import { pages } from '../../content/pages';
import { usePageMeta } from '../../hooks/usePageMeta';

export function CliPage() {
  usePageMeta(pages.cli);
  return (
    <>
      <PageHeader
        label="Docs / CLI reference"
        num="New in 1.2.0"
        title="The numsy command."
        lede="Validate, extract and process files from your terminal or CI — with one or many output formats."
        art={false}
      >
        <CodeBlock code={synopsis} lang="text" label="Synopsis" copy={false} />
      </PageHeader>
      <Section id="commands" num="01" label="Commands" title="Five commands.">
        <CliCommands />
      </Section>
      <Section id="options" num="02" label="Options" title="Every flag." tone="alt">
        <CliOptions />
        <Callout tone="tip" title="Several formats at once">
          <p>
            <code>-f json,csv,xlsx</code> writes one file per format into <code>--out-dir</code>,
            named after <code>--name</code>. With a single <code>-o leads.csv</code> the format is
            inferred from the extension.
          </p>
        </Callout>
      </Section>
      <Section id="examples" num="03" label="Examples" title="Copy, paste, run.">
        <CliExamples />
      </Section>
      <Section
        id="exit-codes"
        num="04"
        label="Exit codes / CI"
        title="Fail the build on bad data."
        tone="alt"
      >
        <CliExitCodes />
      </Section>
    </>
  );
}
