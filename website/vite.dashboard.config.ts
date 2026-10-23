import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Builds the local dashboard served by `numsy dashboard` into the npm package (../dist/dashboard).
 * Same components as the website playground, but with the server runtime, no router, no site
 * chrome and no external requests.
 */
export default defineConfig({
  root: fileURLToPath(new URL('./local', import.meta.url)),
  base: '/',
  publicDir: false,
  plugins: [react()],
  resolve: {
    alias: { '@numsy/engine': fileURLToPath(new URL('../src/engine/index.ts', import.meta.url)) },
  },
  build: {
    outDir: fileURLToPath(new URL('../dist/dashboard', import.meta.url)),
    emptyOutDir: true,
    // public/ pages own /assets on the server, so the bundle lives under /app
    assetsDir: 'app',
    target: 'es2020',
    sourcemap: false,
  },
});
