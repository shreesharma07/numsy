import { constructorOptions, exporters, helpers, methods } from '../../content/api';
import { CodeBlock, RichText, Table } from '../ui';

export function ApiMethods() {
  return (
    <Table
      caption="Numsy class: new Numsy(options?)"
      columns={[
        { key: 'sig', header: 'Method', rowHeader: true },
        { key: 'ret', header: 'Returns' },
        { key: 'desc', header: 'Description' },
      ]}
      rows={methods.map((m) => ({
        sig: <code>{m.signature}</code>,
        ret: <code>{m.returns}</code>,
        desc: <RichText text={m.description} />,
      }))}
    />
  );
}

export function ApiMethodExamples() {
  const code = methods
    .filter((m) => m.example)
    .map((m) => m.example)
    .join('\n');
  return <CodeBlock code={code} lang="ts" label="One-liners" />;
}

export function ApiExporters() {
  return (
    <Table
      caption="Exporters"
      columns={[
        { key: 'fn', header: 'Function', rowHeader: true },
        { key: 'out', header: 'Output' },
      ]}
      rows={exporters.map((e) => ({ fn: <code>{e.name}</code>, out: e.output }))}
    />
  );
}

export function ApiOptions() {
  return (
    <Table
      caption="Constructor options"
      columns={[
        { key: 'name', header: 'Option', rowHeader: true },
        { key: 'type', header: 'Type' },
        { key: 'def', header: 'Default' },
      ]}
      rows={constructorOptions.map((o) => ({
        name: <code>{o.name}</code>,
        type: <RichText text={o.type} />,
        def: <RichText text={o.defaultValue} />,
      }))}
    />
  );
}

export function ApiHelpers() {
  return (
    <p className="muted">
      Prefer functions? Standalone helpers are exported too:{' '}
      {helpers.map((h, i) => (
        <span key={h}>
          <code>{h}</code>
          {i < helpers.length - 1 ? ', ' : '.'}
        </span>
      ))}{' '}
      Full typings ship with the package.
    </p>
  );
}
