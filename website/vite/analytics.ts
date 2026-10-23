import { fileURLToPath } from 'node:url';
import { loadEnv, type Plugin } from 'vite';

/**
 * Cloudflare Web Analytics (cookieless, no personal data) for the website build only. The
 * beacon token comes from CF_WEB_ANALYTICS_TOKEN in the environment or the git-ignored repo-root
 * .env; without it the site builds with no analytics at all. The local dashboard never loads it.
 */
export function cloudflareAnalytics(mode: string): Plugin {
  const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
  const token = (
    process.env.CF_WEB_ANALYTICS_TOKEN ||
    loadEnv(mode, repoRoot, 'CF_').CF_WEB_ANALYTICS_TOKEN ||
    ''
  ).trim();

  if (token && !/^[a-f0-9]{32}$/i.test(token)) {
    throw new Error('CF_WEB_ANALYTICS_TOKEN must be the 32-character beacon token from Cloudflare');
  }

  return {
    name: 'numsy:cloudflare-analytics',
    apply: 'build',
    transformIndexHtml(html) {
      if (!token) return html;
      const beacon = `<!-- Cloudflare Web Analytics --><script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${token}"}'></script><!-- End Cloudflare Web Analytics -->`;
      return html.replace('</body>', `  ${beacon}\n  </body>`);
    },
  };
}
