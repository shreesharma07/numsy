import { PageHeader } from '../../components/layout/PageHeader';
import {
  ApiExporters,
  ApiHelpers,
  ApiMethodExamples,
  ApiMethods,
  ApiOptions,
} from '../../components/sections/ApiReference';
import { CodeBlock, Section } from '../../components/ui';
import { exportersExample, quickStart } from '../../content/api';
import { pages } from '../../content/pages';
import { usePageMeta } from '../../hooks/usePageMeta';

export function ApiPage() {
  usePageMeta(pages.api);
  return (
    <>
      <PageHeader
        label="Docs / Library API"
        num="TypeScript"
        title="Typed, tiny, predictable."
        lede="Use Numsy from Node.js or TypeScript: single values, batches, whole files, and exporters for every format."
        art={false}
      />
      <Section id="quick-start" num="01" label="Quick start" title="In ten lines.">
        <CodeBlock code={quickStart} lang="ts" label="quick-start.ts" />
      </Section>
      <Section id="methods" num="02" label="Numsy class" title="Methods." tone="alt">
        <ApiMethods />
        <ApiMethodExamples />
      </Section>
      <Section id="exporters" num="03" label="Exporters / New in 1.2.0" title="Write any format.">
        <ApiExporters />
        <CodeBlock code={exportersExample} lang="ts" label="export.ts" />
      </Section>
      <Section id="options" num="04" label="Constructor options" title="Configure." tone="alt">
        <ApiOptions />
        <ApiHelpers />
      </Section>
    </>
  );
}
