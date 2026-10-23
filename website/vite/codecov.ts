import { fileURLToPath } from 'node:url';
import { codecovVitePlugin } from '@codecov/vite-plugin';
import { loadEnv } from 'vite';

/**
 * Codecov bundle analysis. Uploads only when CODECOV_TOKEN is set, either in the environment
 * (CI) or in the repo-root .env (git-ignored). The token is used at build time only and is
 * never exposed to client code: loadEnv() is limited to CODECOV_* and nothing is `define`d.
 * Keep it last in the plugin list.
 */
export function codecov(bundleName: string, mode: string) {
  const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
  const token = process.env.CODECOV_TOKEN || loadEnv(mode, repoRoot, 'CODECOV_').CODECOV_TOKEN;
  return codecovVitePlugin({
    enableBundleAnalysis: Boolean(token),
    bundleName,
    uploadToken: token,
    telemetry: false,
  });
}
