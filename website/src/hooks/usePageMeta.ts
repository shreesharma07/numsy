import { useEffect } from 'react';
import { canonicalUrl, fullTitle, type PageMeta } from '../content/pages';

const setMeta = (selector: string, attr: string, value: string) => {
  const el = document.head.querySelector<HTMLElement>(selector);
  if (el) el.setAttribute(attr, value);
};

/**
 * Keeps <title>, description, canonical and Open Graph tags in sync on client-side
 * navigation. The build also bakes the same values into each route's HTML shell.
 */
export function usePageMeta(meta: PageMeta): void {
  useEffect(() => {
    const title = fullTitle(meta);
    const url = canonicalUrl(meta);
    document.title = title;
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', meta.description);
  }, [meta]);
}
