import { curlExample, endpoints, serveCommands } from '../../content/webui';
import { Badge, CodeBlock, RichText, Table } from '../ui';

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
        method: <Badge tone={e.method === 'GET' ? 'amber' : 'coral'}>{e.method}</Badge>,
        path: <code>{e.path}</code>,
        purpose: <RichText text={e.purpose} />,
      }))}
    />
  );
}

export function CurlExample() {
  return <CodeBlock code={curlExample} lang="sh" label="curl" />;
}
