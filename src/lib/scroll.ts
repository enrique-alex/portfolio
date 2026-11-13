/**
 * Smooth-scroll utilities respecting `prefers-reduced-motion: reduce`.
 */

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getScrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

export function scrollToElementById(id: string): boolean {
  if (typeof document === 'undefined') return false;
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ behavior: getScrollBehavior() });
  return true;
}

export function scrollToTop(): void {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, behavior: getScrollBehavior() });
}
