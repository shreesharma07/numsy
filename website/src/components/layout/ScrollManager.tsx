import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Router scroll handling: jump to #hash targets (after render), otherwise top of page.
 * On client-side navigation, focus moves to <main> so screen readers start at the new content.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: must re-run on every route change, not just hash changes
  useEffect(() => {
    const initial = first.current;
    first.current = false;
    const raf = requestAnimationFrame(() => {
      if (hash) {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (el) {
          el.scrollIntoView({ block: 'start' });
          return;
        }
      }
      if (!initial) {
        window.scrollTo(0, 0);
        document.getElementById('main')?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}
