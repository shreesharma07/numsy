import type { NavLink, SitemapGroup } from '../types';
import { pages } from './pages';

export const repo = {
  slug: 'shreesharma07/numsy',
  url: 'https://github.com/shreesharma07/numsy',
  issues: 'https://github.com/shreesharma07/numsy/issues',
  discussions: 'https://github.com/shreesharma07/numsy/discussions',
  stargazers: 'https://github.com/shreesharma07/numsy/stargazers',
  forks: 'https://github.com/shreesharma07/numsy/network/members',
  file: (name: string) => `https://github.com/shreesharma07/numsy/blob/main/${name}`,
} as const;

export const pkg = {
  name: '@numsy/numsy',
  npmUrl: 'https://www.npmjs.com/package/@numsy/numsy',
  /** Shown until the npm registry answers */
  fallbackVersion: '2.0.0',
  /** Socket supply-chain score badge and report for a published version */
  socketBadge: (version: string) => `https://badge.socket.dev/npm/package/@numsy/numsy/${version}`,
  license: 'MIT',
  node: '20',
  install: {
    npm: 'npm i @numsy/numsy',
    pnpm: 'pnpm add @numsy/numsy',
    yarn: 'yarn add @numsy/numsy',
    npx: 'npx @numsy/numsy --help',
    global: 'npm i -g @numsy/numsy',
  },
} as const;

export const author = {
  name: 'Shri Kumar Sharma',
  github: 'shreesharma07',
  website: 'https://shrikumarsharma.in',
  linkedin: 'https://www.linkedin.com/in/shreesharma07/',
  githubUrl: 'https://github.com/shreesharma07',
  avatar: 'https://github.com/shreesharma07.png?size=440',
  role: 'Creator & maintainer',
  bio: 'Software engineer from India building practical, open-source developer tools. Numsy grew out of cleaning one too many contact spreadsheets by hand.',
} as const;

export const tagline = 'Bold numbers / Cleaner data';

/** Top navigation (desktop bar + mobile menu). */
export const primaryNav: NavLink[] = [
  { label: 'About', to: `${pages.docs.path}#about` },
  { label: 'Install', to: `${pages.docs.path}#install` },
  { label: 'Usage', to: `${pages.docs.path}#usage` },
  { label: 'CLI', to: pages.cli.path },
  { label: 'API', to: pages.api.path },
  { label: 'Formats', to: pages.formats.path },
  { label: 'Playground', to: pages.playground.path },
  { label: 'FAQ', to: pages.faq.path },
  { label: 'Author', to: pages.about.path },
];

/** Docs sidebar. */
export const docsNav: { title: string; links: NavLink[] }[] = [
  {
    title: 'Getting started',
    links: [
      { label: 'About Numsy', to: `${pages.docs.path}#about` },
      { label: 'Installation', to: `${pages.docs.path}#install` },
      { label: 'Quick start', to: `${pages.docs.path}#usage` },
    ],
  },
  {
    title: 'Reference',
    links: [
      { label: 'CLI', to: pages.cli.path },
      { label: 'Library API', to: pages.api.path },
      { label: 'Output formats', to: pages.formats.path },
      { label: 'Web UI & REST API', to: pages.webui.path },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'FAQ', to: pages.faq.path },
      { label: 'Playground', to: pages.playground.path },
      { label: 'Changelog', href: repo.file('CHANGELOG.md') },
    ],
  },
];

export const community: { label: string; href: string; blurb: string; icon: `ph:${string}` }[] = [
  {
    label: 'Contributing',
    href: repo.file('CONTRIBUTING.md'),
    blurb: 'Set up, branch, test and open a PR.',
    icon: 'ph:git-pull-request-bold',
  },
  {
    label: 'Code of Conduct',
    href: repo.file('CODE_OF_CONDUCT.md'),
    blurb: 'How we treat each other.',
    icon: 'ph:handshake-bold',
  },
  {
    label: 'Security',
    href: repo.file('SECURITY.md'),
    blurb: 'Report a vulnerability privately.',
    icon: 'ph:shield-check-bold',
  },
  {
    label: 'License',
    href: repo.file('LICENSE'),
    blurb: 'MIT — free for commercial use.',
    icon: 'ph:scales-bold',
  },
  {
    label: 'Changelog',
    href: repo.file('CHANGELOG.md'),
    blurb: 'Every release, every change.',
    icon: 'ph:clock-counter-clockwise-bold',
  },
  {
    label: 'Issues',
    href: repo.issues,
    blurb: 'Bugs and feature requests.',
    icon: 'ph:bug-beetle-bold',
  },
  {
    label: 'Discussions',
    href: repo.discussions,
    blurb: 'Questions, ideas and show-and-tell.',
    icon: 'ph:chats-circle-bold',
  },
  {
    label: 'npm package',
    href: pkg.npmUrl,
    blurb: '@numsy/numsy on the registry.',
    icon: 'ph:package-bold',
  },
];

export const sitemap: SitemapGroup[] = [
  {
    title: 'Product',
    links: [
      { label: 'Home', to: pages.home.path },
      { label: 'Playground', to: pages.playground.path },
      { label: 'Web UI & REST API', to: pages.webui.path },
      { label: 'npm', href: pkg.npmUrl },
      { label: 'GitHub', href: repo.url },
    ],
  },
  {
    title: 'Docs',
    links: [
      { label: 'Getting started', to: pages.docs.path },
      { label: 'Installation', to: `${pages.docs.path}#install` },
      { label: 'CLI reference', to: pages.cli.path },
      { label: 'Library API', to: pages.api.path },
      { label: 'Output formats', to: pages.formats.path },
      { label: 'FAQ', to: pages.faq.path },
      { label: 'Changelog', href: repo.file('CHANGELOG.md') },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Contributors', to: pages.contributors.path },
      { label: 'Contributing', href: repo.file('CONTRIBUTING.md') },
      { label: 'Code of Conduct', href: repo.file('CODE_OF_CONDUCT.md') },
      { label: 'Security', href: repo.file('SECURITY.md') },
      { label: 'Issues', href: repo.issues },
      { label: 'Discussions', href: repo.discussions },
      { label: 'License', href: repo.file('LICENSE') },
    ],
  },
  {
    title: 'Author',
    links: [
      { label: author.name, to: pages.about.path },
      { label: 'Website', href: author.website },
      { label: 'LinkedIn', href: author.linkedin },
      { label: 'GitHub', href: author.githubUrl },
      { label: 'Credits', to: pages.credits.path },
    ],
  },
];

/** "Built with Claude" credit — shown on Home, Credits, About and in the footer. */
export const builtWithClaude = {
  claudeUrl: 'https://claude.ai',
  claudeCodeUrl: 'https://claude.com/claude-code',
  label: 'Credits / AI pair programmer',
  title: 'Built with Claude.',
  body: "Numsy's v1.2 work was vibe-coded with **Claude** via **Claude Code**, directed by Shri Kumar Sharma.",
  built: ['The new CLI', 'Exporters', 'Biome migration', 'Docs', 'Brand assets', 'This website'],
  aboutLine:
    'Numsy 1.2 — the CLI, exporters, docs, brand and this website — was built in collaboration with Claude, an AI assistant, via Claude Code.',
  disclaimer:
    'Claude and Claude Code are products of Anthropic. This is a credit for how the project was made, not an endorsement by Anthropic.',
} as const;
