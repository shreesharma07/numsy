import { curlExample, endpoints, serveCommands, settingsTable } from '../../content/webui';
import { Badge, CodeBlock, RichText, Table } from '../ui';

const METHOD_TONE = { GET: 'amber', POST: 'coral', DELETE: 'violet' } as const;

export function ServeCommands() {
  return <CodeBlock code={serveCommands} lang="sh" label="Shell" />;
}

export function RestEndpoints() {
  return (
    <Table
      caption="Endpoints"
      columns={[
        { key: 'method', header: 'Method', width: '6rem' },
        { key: 'path', header: 'Path', rowHeader: true },
        { key: 'purpose', header: 'Purpose' },
      ]}
      rows={endpoints.map((e) => ({
        method: <Badge tone={METHOD_TONE[e.method]}>{e.method}</Badge>,
        path: <code>{e.path}</code>,
        purpose: <RichText text={e.purpose} />,
      }))}
    />
  );
}

export function DashboardSettings() {
  return (
    <Table
      caption="Settings"
      columns={[
        { key: 'setting', header: 'Setting', rowHeader: true },
        { key: 'values', header: 'Choices' },
        { key: 'cli', header: 'CLI flag' },
      ]}
      rows={settingsTable.map((s) => ({
        setting: s.setting,
        values: s.values,
        cli: <RichText text={s.cli} />,
      }))}
    />
  );
}

export function CurlExample() {
  return <CodeBlock code={curlExample} lang="sh" label="curl" />;
}
