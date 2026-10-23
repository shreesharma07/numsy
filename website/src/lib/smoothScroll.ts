import Lenis from 'lenis';

/**
 * Smooth scrolling for the website, powered by Lenis.
 * One instance per page; it follows the user's `prefers-reduced-motion` setting (instant,
 * 1:1 scrolling) and lets scrollable tables and panels scroll on their own.
 */
let lenis: Lenis | null = null;

/** Height of the sticky navbar plus a little breathing room, for #hash targets */
const anchorOffset = () => {
  const nav = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
  );
  return -((Number.isFinite(nav) ? nav : 64) + 12);
};

export function startSmoothScroll(): () => void {
  if (typeof window === 'undefined' || lenis) return () => {};
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.12,
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
  });
  return () => {
    lenis?.destroy();
    lenis = null;
  };
}

/** Scroll to the top of the page or to an element, through Lenis when it is running */
export function scrollToTarget(target: HTMLElement | 0, options: { immediate?: boolean } = {}) {
  if (lenis) {
    lenis.scrollTo(target, {
      offset: target === 0 ? 0 : anchorOffset(),
      immediate: options.immediate,
      force: true,
    });
    return;
  }
  if (target === 0) window.scrollTo(0, 0);
  else target.scrollIntoView({ block: 'start' });
}
