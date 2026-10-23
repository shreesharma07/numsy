import { PageHeader } from '../../components/layout/PageHeader';
import { CurlExample, RestEndpoints, ServeCommands } from '../../components/sections/RestApi';
import { Callout, Section } from '../../components/ui';
import { pages } from '../../content/pages';
import { usePageMeta } from '../../hooks/usePageMeta';

export function WebUiPage() {
  usePageMeta(pages.webui);
  return (
    <>
      <PageHeader
        label="Docs / Web UI & REST API"
        num="numsy serve"
        title="Drag, drop, download."
        lede="The package bundles a NestJS server with an upload page and a small REST API — for teammates who prefer a browser to a terminal."
        art={false}
      />
      <Section id="serve" num="01" label="Start the server" title="One command.">
        <ServeCommands />
        <Callout tone="note" title="Port">
          <p>
            Defaults to <code>3000</code>. Use <code>--port</code>, or the <code>PORT</code>{' '}
            environment variable.
          </p>
        </Callout>
      </Section>
      <Section id="rest" num="02" label="REST API" title="Three endpoints." tone="alt">
        <RestEndpoints />
        <CurlExample />
        <Callout tone="tip" title="Local only">
          <p>Uploaded files are processed on your machine and cleaned up automatically.</p>
        </Callout>
      </Section>
    </>
  );
}
