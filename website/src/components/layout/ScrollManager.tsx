import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTarget, startSmoothScroll } from '../../lib/smoothScroll';

/**
 * Router scroll handling with Lenis: glide to #hash targets (after render), otherwise jump to
 * the top of the new page. On client-side navigation, focus moves to <main> so screen readers
 * start at the new content.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => startSmoothScroll(), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: must re-run on every route change, not just hash changes
  useEffect(() => {
    const initial = first.current;
    first.current = false;
    const raf = requestAnimationFrame(() => {
      if (hash) {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (el) {
          // Land directly on deep links; animate in-page jumps
          scrollToTarget(el, { immediate: initial });
          return;
        }
      }
      if (!initial) {
        scrollToTarget(0, { immediate: true });
        document.getElementById('main')?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}
