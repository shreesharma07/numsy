import { commands, examples, exitCodes, optionGroups } from '../../content/cli';
import { Badge, CodeBlock, RichText, Table } from '../ui';

export function CliCommands() {
  return (
    <Table
      caption="Commands"
      columns={[
        { key: 'cmd', header: 'Command', rowHeader: true },
        { key: 'desc', header: 'What it does' },
      ]}
      rows={commands.map((c) => ({
        cmd: <code>{c.name}</code>,
        desc: <RichText text={c.description} />,
      }))}
    />
  );
}

export function CliOptions() {
  return optionGroups.map((group) => (
    <Table
      key={group.title}
      caption={group.title}
      columns={[
        { key: 'flag', header: 'Option', rowHeader: true },
        { key: 'desc', header: 'Description' },
        { key: 'def', header: 'Default' },
      ]}
      rows={group.options.map((o) => ({
        flag: (
          <>
            <code>{o.flag}</code>
            {o.scope && (
              <>
                {' '}
                <Badge tone={o.scope === 'process' ? 'violet' : 'amber'}>{o.scope}</Badge>
              </>
            )}
          </>
        ),
        desc: <RichText text={o.description} />,
        def: <RichText text={o.defaultValue} />,
      }))}
    />
  ));
}

export function CliExamples() {
  const script = examples.map((e) => `# ${e.title}\n${e.command}`).join('\n\n');
  return <CodeBlock code={script} lang="sh" label="Examples" />;
}

export function CliExitCodes() {
  return (
    <Table
      caption="Exit codes"
      columns={[
        { key: 'code', header: 'Code', rowHeader: true, width: '6rem' },
        { key: 'meaning', header: 'Meaning' },
      ]}
      rows={exitCodes.map((c) => ({
        code: <code>{c.code}</code>,
        meaning: <RichText text={c.meaning} />,
      }))}
    />
  );
}
