import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import { canonicalUrl, fullTitle, OG_IMAGE, type PageMeta, pages } from '../src/content/pages';

/**
 * GitHub Pages has no SPA rewrites. Instead of the "?/" redirect hack we emit a real
 * HTML shell per route (dist/docs/cli/index.html, ...) with that route's <title> and meta
 * baked in, so deep links return HTTP 200 with correct social previews. Unknown URLs get
 * dist/404.html — the same SPA shell — and React Router renders the NotFound page.
 * Also writes sitemap.xml from the same route manifest.
 */

const START = '<!-- route-meta:start -->';
const END = '<!-- route-meta:end -->';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderHead(meta: PageMeta, opts: { noindex?: boolean } = {}): string {
  const title = esc(fullTitle(meta));
  const desc = esc(meta.description);
  const url = canonicalUrl(meta);
  return [
    START,
    `<title>${title}</title>`,
    `<meta name="description" content="${desc}" />`,
    opts.noindex
      ? '<meta name="robots" content="noindex" />'
      : `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Numsy" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Numsy — Validate. Extract. De-dupe." />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    END,
  ].join('\n    ');
}

const replaceHead = (html: string, head: string) => {
  const a = html.indexOf(START);
  const b = html.indexOf(END);
  if (a === -1 || b === -1)
    throw new Error('[route-shells] route-meta markers missing in index.html');
  return html.slice(0, a) + head + html.slice(b + END.length);
};

export function routeShells(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'numsy-route-shells',
    configResolved(c) {
      config = c;
    },
    transformIndexHtml(html) {
      return replaceHead(html, renderHead(pages.home));
    },
    closeBundle() {
      if (config.command !== 'build') return;
      const out = config.build.outDir;
      const base = readFileSync(join(out, 'index.html'), 'utf8');
      const all = Object.values(pages) as PageMeta[];
      for (const meta of all) {
        if (meta.path === '/' || meta.hidden) continue;
        const dir = join(out, meta.path);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'index.html'), replaceHead(base, renderHead(meta)));
      }
      writeFileSync(
        join(out, '404.html'),
        replaceHead(base, renderHead(pages.notFound, { noindex: true })),
      );
      const today = new Date().toISOString().slice(0, 10);
      const urls = all
        .filter((m) => !m.hidden)
        .map(
          (m) =>
            `  <url>\n    <loc>${canonicalUrl(m)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${(m.priority ?? 0.5).toFixed(1)}</priority>\n  </url>`,
        )
        .join('\n');
      writeFileSync(
        join(out, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
      config.logger.info(`[route-shells] ${all.length - 2} route shells, 404.html, sitemap.xml`);
    },
  };
}
