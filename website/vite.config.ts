import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { SITE_URL } from './src/content/pages.ts';
import { cloudflareAnalytics } from './vite/analytics.ts';
import { codecov } from './vite/codecov.ts';
import { routeShells } from './vite/route-shells.ts';

// One build-time setting drives the deployment target:
//   SITE_URL unset                                   → https://numsy.pages.dev (base "/")
//   SITE_URL=https://shreesharma07.github.io/numsy   → GitHub Pages (base "/numsy/")
const base = new URL(`${SITE_URL}/`).pathname;

// Exposed to index.html as %VITE_SITE_URL%
process.env.VITE_SITE_URL = SITE_URL;

export default defineConfig(({ mode }) => ({
  base,
  define: {
    __SITE_URL__: JSON.stringify(SITE_URL),
  },
  plugins: [react(), cloudflareAnalytics(mode), routeShells(), codecov('numsy-website', mode)],
  resolve: {
    // The shared Numsy engine (../src/engine) also used by the CLI and the local dashboard
    alias: { '@numsy/engine': fileURLToPath(new URL('../src/engine/index.ts', import.meta.url)) },
  },
  worker: { format: 'es' },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
}));
