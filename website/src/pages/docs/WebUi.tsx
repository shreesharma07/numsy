import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import {
  CurlExample,
  DashboardSettings,
  RestEndpoints,
  ServeCommands,
} from '../../components/sections/RestApi';
import { Callout, Section } from '../../components/ui';
import { pages } from '../../content/pages';
import { usePageMeta } from '../../hooks/usePageMeta';

export function WebUiPage() {
  usePageMeta(pages.webui);
  return (
    <>
      <PageHeader
        label="Docs / Local dashboard & REST API"
        num="numsy dashboard"
        title="Your data, your machine."
        lede="numsy dashboard starts a local server with a browser dashboard and a REST API. Upload CSV or Excel files, filter, de-duplicate and export, without anything leaving your computer."
        art={false}
      />
      <Section id="serve" num="01" label="Start it" title="One command.">
        <ServeCommands />
        <div className="grid grid-2 mt-6">
          <Callout tone="note" title="Port 6789">
            <p>
              The dashboard opens on <code>http://localhost:6789</code>. If that port is busy the
              next free one is used. Change it with <code>--port</code> or the <code>PORT</code>{' '}
              environment variable.
            </p>
          </Callout>
          <Callout tone="tip" title="This machine only">
            <p>
              It listens on <code>127.0.0.1</code> and accepts same-origin requests only. Use{' '}
              <code>--host 0.0.0.0</code> to share it on a trusted network, never on the open
              internet.
            </p>
          </Callout>
        </div>
      </Section>
      <Section
        id="dashboard"
        num="02"
        label="The dashboard"
        title="Every CLI option, as a switch."
        tone="alt"
      >
        <p className="lede">
          The dashboard has the same filters and output options as the CLI, and its exports contain
          the same rows and columns that <code>numsy process</code> writes with the matching flags.
          The <Link to={pages.playground.path}>website playground</Link> uses the same interface and
          engine but runs in your browser instead of on the local server.
        </p>
        <DashboardSettings />
        <Callout tone="note" title="Privacy">
          <p>
            Uploads are parsed in memory and dropped an hour after last use or when the server
            stops. Numsy never stores, sells or shares file contents and never uses them for AI
            training. Read the <Link to={pages.privacy.path}>privacy &amp; data disclaimer</Link>.
          </p>
        </Callout>
      </Section>
      <Section id="rest" num="03" label="REST API" title="Scriptable, too.">
        <RestEndpoints />
        <CurlExample />
        <p className="muted">
          The running server also documents itself at <code>/api</code> and reports its status at{' '}
          <code>/api/health-page</code>.
        </p>
      </Section>
    </>
  );
}
