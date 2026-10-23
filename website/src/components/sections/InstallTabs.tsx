import { pkg } from '../../content/site';
import { CodeBlock, Tabs } from '../ui';

const managers = [
  { id: 'npm', label: 'npm', cmd: pkg.install.npm },
  { id: 'pnpm', label: 'pnpm', cmd: pkg.install.pnpm },
  { id: 'yarn', label: 'yarn', cmd: pkg.install.yarn },
  { id: 'npx', label: 'npx (no install)', cmd: pkg.install.npx },
];

export function InstallTabs() {
  return (
    <Tabs
      label="Package manager"
      items={managers.map((m) => ({
        id: m.id,
        label: m.label,
        content: <CodeBlock code={`$ ${m.cmd}`} lang="sh" label={m.label} />,
      }))}
    />
  );
}
