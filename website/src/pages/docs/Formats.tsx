import { PageHeader } from '../../components/layout/PageHeader';
import { FormatGrid } from '../../components/sections/FormatGrid';
import { CodeBlock, Section, Table } from '../../components/ui';
import { rowSets } from '../../content/formats';
import { pages } from '../../content/pages';
import { usePageMeta } from '../../hooks/usePageMeta';

export function FormatsPage() {
  usePageMeta(pages.formats);
  return (
    <>
      <PageHeader
        label="Docs / Output formats"
        num="-f, --format"
        title="Six ways out."
        lede="Pick one format or several. Samples are illustrative; exact columns depend on the command."
        art={false}
      />
      <Section id="formats" num="01" label="Formats" title="Pick your output.">
        <FormatGrid />
      </Section>
      <Section id="filters" num="02" label="Filters / --only" title="Choose the rows." tone="alt">
        <Table
          caption="--only <set>"
          columns={[
            { key: 'set', header: 'Set', rowHeader: true, width: '8rem' },
            { key: 'desc', header: 'Exports' },
          ]}
          rows={rowSets.map((r) => ({ set: <code>{r.name}</code>, desc: r.description }))}
        />
        <CodeBlock
          code={
            '$ numsy process leads.csv --only unique -o unique.csv\n$ numsy process leads.csv -f json,xlsx --country-code -d out'
          }
          lang="sh"
          label="Shell"
        />
      </Section>
    </>
  );
}
