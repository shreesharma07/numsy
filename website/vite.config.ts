import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { routeShells } from './vite/route-shells';

// The site is served from https://shreesharma07.github.io/numsy/
export default defineConfig({
  base: '/numsy/',
  plugins: [react(), routeShells()],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
