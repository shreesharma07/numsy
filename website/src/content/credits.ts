/** Everything external this website (and its brand assets) relies on. Rendered on /credits. */

export type CreditCategory =
  | 'AI assistance'
  | 'UI components'
  | 'Icons'
  | 'Fonts'
  | 'Frameworks & libraries'
  | 'Build & tooling'
  | 'Data & APIs'
  | 'Hosting'
  | 'Design';

export interface Credit {
  name: string;
  url: string;
  license: string;
  licenseUrl?: string;
  usedFor: string;
  category: CreditCategory;
}

export const credits: Credit[] = [
  {
    name: 'Claude (via Claude Code)',
    url: 'https://claude.com/claude-code',
    license: 'Anthropic Terms of Service',
    licenseUrl: 'https://www.anthropic.com/legal/consumer-terms',
    usedFor:
      'AI pair programmer. Numsy 1.2 — the CLI, exporters, Biome migration, docs, brand assets and this website — was vibe-coded with Claude in Claude Code, directed by Shri Kumar Sharma. Claude: https://claude.ai. A credit, not an endorsement by Anthropic.',
    category: 'AI assistance',
  },
  {
    name: 'React Bits',
    url: 'https://reactbits.dev',
    license: 'MIT + Commons Clause',
    licenseUrl: 'https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md',
    usedFor:
      'RotatingText (home hero), CountUp (live stats), SpotlightCard (feature & docs cards) and ScrollVelocity (poster ticker). Vendored unmodified in `src/components/reactbits/`. Free to use inside this site; the components themselves may not be sold or redistributed on their own.',
    category: 'UI components',
  },
  {
    name: 'Iconify',
    url: 'https://iconify.design',
    license: 'MIT',
    licenseUrl: 'https://github.com/iconify/iconify/blob/main/license.txt',
    usedFor:
      '`@iconify/react` renders every icon; an offline subset is generated at build time, so no icon API calls.',
    category: 'Icons',
  },
  {
    name: 'Phosphor Icons',
    url: 'https://phosphoricons.com',
    license: 'MIT',
    licenseUrl: 'https://github.com/phosphor-icons/core/blob/main/LICENSE',
    usedFor: 'The only icon set on the site (`ph:*-bold`), via the `@iconify-json/ph` collection.',
    category: 'Icons',
  },
  {
    name: 'Anton',
    url: 'https://fonts.google.com/specimen/Anton',
    license: 'SIL Open Font License 1.1',
    licenseUrl: 'https://openfontlicense.org',
    usedFor:
      'Display headlines and section numbers; banner & social-card headlines (converted to paths).',
    category: 'Fonts',
  },
  {
    name: 'Space Grotesk',
    url: 'https://fonts.google.com/specimen/Space+Grotesk',
    license: 'SIL Open Font License 1.1',
    licenseUrl: 'https://openfontlicense.org',
    usedFor: 'Body text and UI labels.',
    category: 'Fonts',
  },
  {
    name: 'JetBrains Mono',
    url: 'https://fonts.google.com/specimen/JetBrains+Mono',
    license: 'SIL Open Font License 1.1',
    licenseUrl: 'https://openfontlicense.org',
    usedFor: 'Code blocks, tables and tracked-out labels.',
    category: 'Fonts',
  },
  {
    name: 'Space Mono',
    url: 'https://fonts.google.com/specimen/Space+Mono',
    license: 'SIL Open Font License 1.1',
    licenseUrl: 'https://openfontlicense.org',
    usedFor: 'Small labels in the README banner and social card (converted to vector paths).',
    category: 'Fonts',
  },
  {
    name: 'Google Fonts',
    url: 'https://fonts.google.com',
    license: 'Google APIs Terms of Service',
    licenseUrl: 'https://developers.google.com/terms',
    usedFor: 'Serves the web fonts above.',
    category: 'Fonts',
  },
  {
    name: 'React & React DOM',
    url: 'https://react.dev',
    license: 'MIT',
    licenseUrl: 'https://github.com/facebook/react/blob/main/LICENSE',
    usedFor: 'UI framework (v18).',
    category: 'Frameworks & libraries',
  },
  {
    name: 'React Router',
    url: 'https://reactrouter.com',
    license: 'MIT',
    licenseUrl: 'https://github.com/remix-run/react-router/blob/main/LICENSE.md',
    usedFor: 'Client-side routing (`react-router-dom`).',
    category: 'Frameworks & libraries',
  },
  {
    name: 'Motion',
    url: 'https://motion.dev',
    license: 'MIT',
    licenseUrl: 'https://github.com/motiondivision/motion/blob/main/LICENSE.md',
    usedFor: 'Animation engine required by the React Bits components.',
    category: 'Frameworks & libraries',
  },
  {
    name: 'Vite',
    url: 'https://vite.dev',
    license: 'MIT',
    licenseUrl: 'https://github.com/vitejs/vite/blob/main/LICENSE',
    usedFor: 'Dev server and production build (with `@vitejs/plugin-react`, MIT).',
    category: 'Build & tooling',
  },
  {
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org',
    license: 'Apache-2.0',
    licenseUrl: 'https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt',
    usedFor: 'Type checking for the whole site.',
    category: 'Build & tooling',
  },
  {
    name: 'Biome',
    url: 'https://biomejs.dev',
    license: 'MIT OR Apache-2.0',
    licenseUrl: 'https://github.com/biomejs/biome/blob/main/LICENSE-MIT',
    usedFor: 'Linting and formatting.',
    category: 'Build & tooling',
  },
  {
    name: 'opentype.js',
    url: 'https://opentype.js.org',
    license: 'MIT',
    licenseUrl: 'https://github.com/opentypejs/opentype.js/blob/master/LICENSE',
    usedFor:
      'One-off conversion of banner/social-card text to vector paths when the brand assets were drawn.',
    category: 'Build & tooling',
  },
  {
    name: 'GitHub REST API',
    url: 'https://docs.github.com/rest',
    license: 'GitHub Terms of Service',
    licenseUrl: 'https://docs.github.com/site-policy/github-terms/github-terms-of-service',
    usedFor: 'Live stars, forks and the contributors list (unauthenticated, cached per session).',
    category: 'Data & APIs',
  },
  {
    name: 'npm registry & downloads API',
    url: 'https://github.com/npm/registry/blob/main/docs/download-counts.md',
    license: 'npm Terms of Use',
    licenseUrl: 'https://docs.npmjs.com/policies/terms',
    usedFor: 'Latest published version and weekly download count.',
    category: 'Data & APIs',
  },
  {
    name: 'Iconify API',
    url: 'https://iconify.design/docs/api/',
    license: 'MIT (API source); icons MIT (Phosphor)',
    licenseUrl: 'https://github.com/iconify/api',
    usedFor:
      'Pre-colouring the Phosphor icons in `assets/icons/` used by the Markdown docs. The website itself makes no Iconify API calls.',
    category: 'Data & APIs',
  },
  {
    name: 'Shields.io',
    url: 'https://shields.io',
    license: 'MIT / Apache-2.0 (service source)',
    licenseUrl: 'https://github.com/badges/shields',
    usedFor: 'Version, downloads, license and CI badges in the README.',
    category: 'Data & APIs',
  },
  {
    name: 'contrib.rocks',
    url: 'https://contrib.rocks',
    license: 'Free hosted service (no license declared)',
    licenseUrl: 'https://github.com/lacolaco/contributors-img',
    usedFor: 'The contributors avatar image in the README.',
    category: 'Data & APIs',
  },
  {
    name: 'GitHub Pages & Actions',
    url: 'https://pages.github.com',
    license: 'GitHub Terms of Service',
    licenseUrl: 'https://docs.github.com/site-policy/github-terms/github-terms-of-service',
    usedFor: 'Hosting and the build/deploy workflow.',
    category: 'Hosting',
  },
  {
    name: '“Creative Energy” poster palette',
    url: 'https://github.com/shreesharma07/numsy/tree/main/assets/brand',
    license: 'Inspiration only',
    usedFor:
      'Colour template — coral #FF4D6D, amber #FFB703, violet #8338EC and ink #111111 on cream paper — and the Swiss/Bauhaus poster style.',
    category: 'Design',
  },
];
