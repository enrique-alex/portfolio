'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';

const emptySubscribe = () => () => {};
const getClientMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Home, User, GraduationCap, Briefcase, FolderGit2, Cpu, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../theme/LanguageProvider';
import { useTheme } from 'next-themes';
import { getScrollBehavior } from '@/lib/scroll';

export interface DockNavItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SelectSegmentOptions {
  fromScrub?: boolean;
  immediate?: boolean;
  sectionId?: string;
}

export interface DockScrubState<T extends { id: string }> {
  item: T;
  index: number;
  centerX: number;
  clampedX: number;
  proximities: number[];
}

export interface DockRectInput<T extends { id: string }> {
  item: T;
  left: number;
  right: number;
}

export interface LiquidLensGeometry {
  localX: number;
  width: number;
  centerX: number;
  scaleX: number;
  scaleY: number;
}

export interface LiquidLensInput<T extends { id: string }> {
  clientX: number;
  navLeft: number;
  navClientLeft?: number;
  navScrollLeft?: number;
  rects: Array<DockRectInput<T>>;
  velocityPxPerMs?: number;
  isPressed?: boolean;
  isScrubbing?: boolean;
  reducedMotion?: boolean;
  minLensWidth?: number;
  magnetism?: number;
}

export interface MobileDockOffsetInput {
  innerHeight: number;
  visualViewportHeight?: number;
  visualViewportOffsetTop?: number;
  maxObservedViewportHeight?: number;
  scrollDirection?: 'up' | 'down' | 'idle';
  isInputFocused?: boolean;
}

export interface MobileNavDockProps {
  activeSegment: string;
  onSelectSegment: (segmentName: string, options?: SelectSegmentOptions) => void;
  isHudOpen: boolean;
  onToggleHud: () => void;
  hudTriggerRef: React.RefObject<HTMLButtonElement | null>;
  scrollDirection?: 'up' | 'down' | 'idle';
}

/**
 * Pure hit-testing helper for iOS-style horizontal scrubbing across dock tabs.
 * Clamps to the first or last tab when the finger slides slightly beyond the dock edges.
 */
export function resolveDockItemFromClientX<T extends { id: string }>(
  clientX: number,
  rects: Array<{ item: T; left: number; right: number }>
): { item: T; index: number; centerX: number } | null {
  if (!rects || rects.length === 0 || !Number.isFinite(clientX)) return null;

  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (clientX >= r.left && clientX <= r.right) {
      return { item: r.item, index: i, centerX: (r.left + r.right) / 2 };
    }
  }

  // Clamp to nearest tab when sliding along the bar
  const first = rects[0];
  if (clientX < first.left) {
    return { item: first.item, index: 0, centerX: (first.left + first.right) / 2 };
  }

  const lastIdx = rects.length - 1;
  const last = rects[lastIdx];
  if (clientX > last.right) {
    return { item: last.item, index: lastIdx, centerX: (last.left + last.right) / 2 };
  }

  // Fallback: closest center
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < rects.length; i++) {
    const center = (rects[i].left + rects[i].right) / 2;
    const dist = Math.abs(clientX - center);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  const best = rects[bestIdx];
  return { item: best.item, index: bestIdx, centerX: (best.left + best.right) / 2 };
}

/**
 * Continuous iOS-style scrub state calculator.
 * Computes the active tab, continuous clamped finger position (for the floating preview loupe),
 * and raised-cosine proximity weights (0..1) for smooth magnification of neighboring icons.
 */
export function resolveDockScrubStateFromClientX<T extends { id: string }>(
  clientX: number,
  rects: Array<{ item: T; left: number; right: number }>
): DockScrubState<T> | null {
  const hit = resolveDockItemFromClientX(clientX, rects);
  if (!hit) return null;

  const firstCenter = (rects[0].left + rects[0].right) / 2;
  const lastRect = rects[rects.length - 1];
  const lastCenter = (lastRect.left + lastRect.right) / 2;
  const minBound = Math.min(firstCenter, lastCenter);
  const maxBound = Math.max(firstCenter, lastCenter);
  const clampedX = Math.min(Math.max(clientX, minBound), maxBound);

  const proximities = rects.map((r) => {
    const center = (r.left + r.right) / 2;
    const width = Math.max(36, r.right - r.left);
    const influenceRadius = width * 1.65;
    const dist = Math.abs(clampedX - center);
    if (dist >= influenceRadius) return 0;
    const normalized = dist / influenceRadius;
    const cosineWeight = 0.5 * (1 + Math.cos(Math.PI * normalized));
    return Number(cosineWeight.toFixed(4));
  });

  return {
    item: hit.item,
    index: hit.index,
    centerX: hit.centerX,
    clampedX,
    proximities,
  };
}

/**
 * Computes continuous iOS 26/27 Liquid Lens pill geometry (position, morphed width,
 * smooth monotonic magnetic attraction toward tab centers, and velocity-driven liquid stretch).
 */
export function computeLiquidLensGeometry<T extends { id: string }>({
  clientX,
  navLeft,
  navClientLeft = 0,
  navScrollLeft = 0,
  rects,
  velocityPxPerMs = 0,
  isPressed = false,
  isScrubbing = false,
  reducedMotion = false,
  minLensWidth = 46,
  magnetism = 0.08,
}: LiquidLensInput<T>): LiquidLensGeometry | null {
  if (!rects || rects.length === 0 || !Number.isFinite(clientX) || !Number.isFinite(navLeft)) {
    return null;
  }

  for (let i = 0; i < rects.length; i++) {
    if (!Number.isFinite(rects[i].left) || !Number.isFinite(rects[i].right)) {
      return null;
    }
  }

  const safeScrollLeft = Number.isFinite(navScrollLeft) ? Math.max(0, navScrollLeft) : 0;
  const safeClientLeft = Number.isFinite(navClientLeft) ? Math.max(0, navClientLeft) : 0;
  const safeMinWidth = Math.max(36, minLensWidth);

  const centers = rects.map((r) => (r.left + r.right) / 2);
  const widths = rects.map((r) => Math.max(safeMinWidth, r.right - r.left));

  const firstCenter = centers[0];
  const lastCenter = centers[centers.length - 1];
  const clampedX = Math.min(
    Math.max(clientX, Math.min(firstCenter, lastCenter)),
    Math.max(firstCenter, lastCenter)
  );

  let lensCenterScreenX = centers[0];
  let lensWidth = widths[0];

  if (rects.length > 1) {
    let segIdx = 0;
    for (let i = 0; i < centers.length - 1; i++) {
      const a = centers[i];
      const b = centers[i + 1];
      if ((clampedX >= a && clampedX <= b) || (clampedX <= a && clampedX >= b)) {
        segIdx = i;
        break;
      }
      if (clampedX > b) {
        segIdx = i;
      }
    }

    const startCenter = centers[segIdx];
    const endCenter = centers[segIdx + 1];
    const span = endCenter - startCenter;
    const rawT = Math.abs(span) > 0.001 ? Math.min(1, Math.max(0, (clampedX - startCenter) / span)) : 0;

    // C-infinity monotonic detent curve: 2*pi*0.14 < 1 preserves strict monotonicity with zero jumps
    const safeMagnetism = Math.min(0.14, Math.max(0, magnetism));
    const magneticT =
      safeMagnetism > 0
        ? Math.min(1, Math.max(0, rawT - safeMagnetism * Math.sin(2 * Math.PI * rawT)))
        : rawT;

    lensCenterScreenX = startCenter + magneticT * (endCenter - startCenter);
    lensWidth = widths[segIdx] + magneticT * (widths[segIdx + 1] - widths[segIdx]);
  }

  const firstLocalLeft = rects[0].left - navLeft - safeClientLeft + safeScrollLeft;
  const lastLocalRight = rects[rects.length - 1].right - navLeft - safeClientLeft + safeScrollLeft;
  const rawLocalX = lensCenterScreenX - lensWidth / 2 - navLeft - safeClientLeft + safeScrollLeft;
  const maxLocalX = Math.max(firstLocalLeft, lastLocalRight - lensWidth);
  const localX = Math.min(Math.max(rawLocalX, firstLocalLeft), maxLocalX);

  let scaleX = 1;
  let scaleY = 1;
  if (!reducedMotion) {
    if (isScrubbing) {
      const speed = Number.isFinite(velocityPxPerMs) ? Math.abs(velocityPxPerMs) : 0;
      const stretch = Math.min(0.07, speed * 0.045);
      scaleX = Number((1.08 + stretch).toFixed(4));
      scaleY = Number((1.08 - stretch * 0.45).toFixed(4));
    } else if (isPressed) {
      scaleX = 1.07;
      scaleY = 1.07;
    }
  }

  return {
    localX: Number(localX.toFixed(2)),
    width: Number(lensWidth.toFixed(2)),
    centerX: Number(lensCenterScreenX.toFixed(2)),
    scaleX,
    scaleY,
  };
}

/**
 * Computes the vertical upward offset (in pixels) needed to keep the floating dock
 * clear of mobile browser bottom toolbars (Safari iOS / Chrome Android) when scrolling up.
 */
export function computeMobileDockBottomOffset({
  innerHeight,
  visualViewportHeight,
  visualViewportOffsetTop = 0,
  maxObservedViewportHeight,
  scrollDirection = 'idle',
  isInputFocused = false,
}: MobileDockOffsetInput): number {
  if (isInputFocused || !Number.isFinite(innerHeight) || innerHeight <= 0) {
    return 0;
  }

  const vvHeight =
    typeof visualViewportHeight === 'number' && Number.isFinite(visualViewportHeight) && visualViewportHeight > 0
      ? visualViewportHeight
      : innerHeight;
  const vvOffsetTop =
    typeof visualViewportOffsetTop === 'number' && Number.isFinite(visualViewportOffsetTop)
      ? Math.max(0, visualViewportOffsetTop)
      : 0;

  // Gap between layout viewport and visual viewport
  const layoutViewportGap = Math.max(0, Math.round(innerHeight - (vvHeight + vvOffsetTop)));

  // Gap between maximum observed viewport height (toolbar collapsed) and current height (toolbar expanded)
  const observedMax = Math.max(
    innerHeight,
    typeof maxObservedViewportHeight === 'number' && Number.isFinite(maxObservedViewportHeight)
      ? maxObservedViewportHeight
      : innerHeight,
    vvHeight
  );
  const chromeExpansionGap = Math.max(0, Math.round(observedMax - vvHeight));

  const browserBarOcclusion = Math.min(
    36,
    Math.max(layoutViewportGap, Math.round(chromeExpansionGap * 0.45))
  );
  const scrollUpLift = scrollDirection === 'up' ? 14 : 0;

  return Math.min(48, browserBarOcclusion + scrollUpLift);
}

export default function MobileNavDock({
  activeSegment,
  onSelectSegment,
  isHudOpen,
  onToggleHud,
  hudTriggerRef,
  scrollDirection = 'idle',
}: MobileNavDockProps) {
  const { locale, t } = useLanguage();
  const { theme, resolvedTheme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const [scrubProximities, setScrubProximities] = useState<number[]>([]);
  const [scrubLoupeOffsetX, setScrubLoupeOffsetX] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [viewportMetrics, setViewportMetrics] = useState({
    innerHeight: 0,
    vvHeight: 0,
    vvOffsetTop: 0,
    maxObservedHeight: 0,
  });
  const [lensTarget, setLensTarget] = useState<{
    localX: number;
    width: number;
    scaleX: number;
    scaleY: number;
    measured: boolean;
  }>({
    localX: 0,
    width: 0,
    scaleX: 1,
    scaleY: 1,
    measured: false,
  });

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrubScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const velocityDecayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrubRafRef = useRef<number | null>(null);
  const pendingScrubRef = useRef<{ clientX: number; velocityX: number } | null>(null);
  const pointerStartRef = useRef<{
    x: number;
    y: number;
    pointerId: number;
    lastX: number;
    lastTime: number;
    velocityX: number;
  } | null>(null);
  const isScrubbingRef = useRef(false);
  const suppressClickUntilRef = useRef(0);
  const lastScrubbedItemRef = useRef<DockNavItem | null>(null);
  const maxViewportTrackerRef = useRef<{ width: number; maxH: number }>({ width: 0, maxH: 0 });
  const shouldReduceMotion = useReducedMotion();

  const isClientMounted = useSyncExternalStore(
    emptySubscribe,
    getClientMountedSnapshot,
    getServerMountedSnapshot
  );

  const resolvedMode =
    resolvedTheme === 'dark' || resolvedTheme === 'light'
      ? resolvedTheme
      : theme === 'dark' || theme === 'light'
        ? theme
        : undefined;
  const effectiveThemeMode =
    typeof window === 'undefined' ? resolvedMode : isClientMounted ? resolvedMode : undefined;

  const primaryItems: DockNavItem[] = useMemo(
    () => [
      { id: 'home', name: t('nav.home'), href: '#home', icon: Home },
      { id: 'profile', name: t('nav.about'), href: '#profile', icon: User },
      { id: 'academic', name: t('nav.academic'), href: '#academic', icon: GraduationCap },
      { id: 'experience', name: t('nav.experience'), href: '#experience', icon: Briefcase },
      { id: 'projects', name: t('nav.projects'), href: '#projects', icon: FolderGit2 },
      { id: 'skills', name: t('nav.skills'), href: '#skills', icon: Cpu },
    ],
    [t]
  );

  const activeItemIndex = useMemo(
    () => primaryItems.findIndex((item) => item.name === activeSegment),
    [primaryItems, activeSegment]
  );

  const measureActiveLens = useCallback(() => {
    if (isScrubbingRef.current || !navRef.current) return;
    if (activeItemIndex < 0) {
      setLensTarget((prev) => (prev.measured ? { ...prev, measured: false } : prev));
      return;
    }

    const activeEl = itemRefs.current[activeItemIndex];
    if (!activeEl) return;

    const localX = activeEl.offsetLeft;
    const width = activeEl.offsetWidth;
    if (width <= 0) return;

    setLensTarget((prev) => {
      if (prev.measured && prev.localX === localX && prev.width === width) {
        return prev;
      }
      return {
        localX,
        width,
        scaleX: prev.scaleX,
        scaleY: prev.scaleY,
        measured: true,
      };
    });
  }, [activeItemIndex]);

  useEffect(() => {
    measureActiveLens();
    const rafId = requestAnimationFrame(measureActiveLens);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && navRef.current) {
      observer = new ResizeObserver(() => {
        measureActiveLens();
      });
      observer.observe(navRef.current);
      const activeEl = activeItemIndex >= 0 ? itemRefs.current[activeItemIndex] : null;
      if (activeEl) {
        observer.observe(activeEl);
      }
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [measureActiveLens, primaryItems, activeItemIndex]);

  // Adaptation dynamique au visualViewport (barre inférieure Safari iOS / Chrome Mobile & clavier virtuel)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = () => {
      setIsInputFocused(false);
    };

    const updateVisualViewport = () => {
      const innerH = window.innerHeight;
      const innerW = window.innerWidth;
      const vv = window.visualViewport;
      const vvH = vv ? vv.height : innerH;
      const vvTop = vv ? vv.offsetTop : 0;

      // Si le clavier virtuel réduit fortement la hauteur visible (> 25%), masquer le dock pour ne rien cacher
      if (vv && vv.height < innerH * 0.75) {
        setIsInputFocused(true);
        return;
      }

      if (Math.abs(innerW - maxViewportTrackerRef.current.width) > 40) {
        maxViewportTrackerRef.current = { width: innerW, maxH: Math.max(innerH, vvH) };
      } else {
        maxViewportTrackerRef.current.maxH = Math.max(
          maxViewportTrackerRef.current.maxH,
          innerH,
          vvH
        );
      }

      setViewportMetrics({
        innerHeight: innerH,
        vvHeight: vvH,
        vvOffsetTop: vvTop,
        maxObservedHeight: maxViewportTrackerRef.current.maxH,
      });
    };

    updateVisualViewport();
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    window.addEventListener('resize', updateVisualViewport, { passive: true });
    window.visualViewport?.addEventListener('resize', updateVisualViewport);
    window.visualViewport?.addEventListener('scroll', updateVisualViewport);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('resize', updateVisualViewport);
      window.visualViewport?.removeEventListener('resize', updateVisualViewport);
      window.visualViewport?.removeEventListener('scroll', updateVisualViewport);
    };
  }, []);

  // Défilement horizontal doux dans le dock sans impacter le scroll vertical de la page
  useEffect(() => {
    if (!navRef.current || isScrubbingRef.current) return;
    const activeEl = navRef.current.querySelector<HTMLElement>('[aria-current="page"]');
    if (activeEl && typeof navRef.current.scrollTo === 'function') {
      const nav = navRef.current;
      const targetLeft = activeEl.offsetLeft - (nav.clientWidth - activeEl.clientWidth) / 2;
      nav.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
      });
    }
  }, [activeSegment, shouldReduceMotion]);

  const scrollToSection = useCallback(
    (sectionId: string, immediate = false) => {
      if (typeof document === 'undefined') return;
      const el = document.getElementById(sectionId);
      if (!el) return;

      if (scrubScrollTimerRef.current) {
        clearTimeout(scrubScrollTimerRef.current);
      }

      const performScroll = () => {
        el.scrollIntoView({
          behavior: shouldReduceMotion || immediate ? 'auto' : getScrollBehavior(),
          block: 'start',
        });
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          window.history.replaceState(null, '', `#${sectionId}`);
        }
      };

      if (immediate) {
        performScroll();
      } else {
        scrubScrollTimerRef.current = setTimeout(performScroll, 40);
      }
    },
    [shouldReduceMotion]
  );

  const measureItemRects = useCallback(() => {
    const measuredRects: Array<DockRectInput<DockNavItem>> = [];
    primaryItems.forEach((item, idx) => {
      const el = itemRefs.current[idx];
      if (el) {
        const rect = el.getBoundingClientRect();
        measuredRects.push({ item, left: rect.left, right: rect.right });
      }
    });
    return measuredRects;
  }, [primaryItems]);

  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate?.(6);
      } catch {
        // Ignore vibration restrictions
      }
    }
  }, []);

  const evaluateScrubAtClientX = useCallback(
    (clientX: number, velocityPxPerMs = 0) => {
      const measuredRects = measureItemRects();
      const scrubState = resolveDockScrubStateFromClientX(clientX, measuredRects);
      if (!scrubState) return;

      setScrubIndex(scrubState.index);
      setScrubProximities(scrubState.proximities);

      if (navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const navCenterX = (navRect.left + navRect.right) / 2;
        const maxOffset = Math.max(0, navRect.width / 2 - 56);
        const rawOffset = Math.round(scrubState.clampedX - navCenterX);
        setScrubLoupeOffsetX(Math.min(Math.max(rawOffset, -maxOffset), maxOffset));

        const lensGeometry = computeLiquidLensGeometry({
          clientX,
          navLeft: navRect.left,
          navClientLeft: navRef.current.clientLeft,
          navScrollLeft: navRef.current.scrollLeft,
          rects: measuredRects,
          velocityPxPerMs,
          isPressed: true,
          isScrubbing: true,
          reducedMotion: Boolean(shouldReduceMotion),
        });

        if (lensGeometry) {
          setLensTarget({
            localX: lensGeometry.localX,
            width: lensGeometry.width,
            scaleX: lensGeometry.scaleX,
            scaleY: lensGeometry.scaleY,
            measured: true,
          });
        }
      }

      if (lastScrubbedItemRef.current?.id !== scrubState.item.id) {
        lastScrubbedItemRef.current = scrubState.item;
        triggerHaptic();
      }
    },
    [measureItemRects, shouldReduceMotion, triggerHaptic]
  );

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const clearVelocityDecayTimer = () => {
    if (velocityDecayTimerRef.current) {
      clearTimeout(velocityDecayTimerRef.current);
      velocityDecayTimerRef.current = null;
    }
  };

  const enterScrubMode = useCallback(
    (pointerId: number, clientX: number) => {
      if (!navRef.current || isScrubbingRef.current) return;
      isScrubbingRef.current = true;
      suppressClickUntilRef.current = Date.now() + 260;
      setIsScrubbing(true);
      try {
        navRef.current.setPointerCapture(pointerId);
      } catch {
        // Ignore if pointer capture is unsupported
      }
      evaluateScrubAtClientX(clientX, 0);
    },
    [evaluateScrubAtClientX]
  );

  const stopScrubbing = useCallback(
    (cancelled = false) => {
      clearHoldTimer();
      clearVelocityDecayTimer();
      if (scrubRafRef.current !== null) {
        cancelAnimationFrame(scrubRafRef.current);
        scrubRafRef.current = null;
      }
      pendingScrubRef.current = null;
      setIsPressed(false);

      if (isScrubbingRef.current) {
        isScrubbingRef.current = false;
        setIsScrubbing(false);
        setScrubIndex(null);
        setScrubProximities([]);
        setScrubLoupeOffsetX(0);

        const targetItem = lastScrubbedItemRef.current;
        if (!cancelled && targetItem) {
          suppressClickUntilRef.current = Date.now() + 260;
          onSelectSegment(targetItem.name, {
            fromScrub: true,
            immediate: false,
            sectionId: targetItem.id,
          });
          scrollToSection(targetItem.id, false);
        }
        setLensTarget((prev) => ({ ...prev, scaleX: 1, scaleY: 1 }));
        requestAnimationFrame(measureActiveLens);
      } else {
        setLensTarget((prev) => ({ ...prev, scaleX: 1, scaleY: 1 }));
        requestAnimationFrame(measureActiveLens);
      }

      pointerStartRef.current = null;
      lastScrubbedItemRef.current = null;
    },
    [measureActiveLens, onSelectSegment, scrollToSection]
  );

  useEffect(() => {
    const handleWindowPointerEnd = (e: PointerEvent) => {
      const start = pointerStartRef.current;
      if (!start || start.pointerId !== e.pointerId) return;
      if (isScrubbingRef.current && navRef.current) {
        try {
          if (navRef.current.hasPointerCapture?.(e.pointerId)) {
            navRef.current.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Ignore
        }
      }
      stopScrubbing(e.type === 'pointercancel');
    };

    const handleWindowBlur = () => {
      if (pointerStartRef.current || isScrubbingRef.current) {
        stopScrubbing(true);
      }
    };

    window.addEventListener('pointerup', handleWindowPointerEnd);
    window.addEventListener('pointercancel', handleWindowPointerEnd);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('pointerup', handleWindowPointerEnd);
      window.removeEventListener('pointercancel', handleWindowPointerEnd);
      window.removeEventListener('blur', handleWindowBlur);
      clearHoldTimer();
      clearVelocityDecayTimer();
      if (scrubScrollTimerRef.current) clearTimeout(scrubScrollTimerRef.current);
      if (scrubRafRef.current !== null) cancelAnimationFrame(scrubRafRef.current);
    };
  }, [stopScrubbing]);

  const handleDockPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    // Ignore si le clic provient du bouton de réglages/menu ou si un premier doigt est déjà actif
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-dock-settings="true"]')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (pointerStartRef.current !== null) return;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
      lastX: e.clientX,
      lastTime: now,
      velocityX: 0,
    };
    suppressClickUntilRef.current = 0;
    clearHoldTimer();
    setIsPressed(true);

    // Réaction optique immédiate dès le toucher (t=0ms) centrée sous l'onglet ciblé
    const measuredRects = measureItemRects();
    const pressedState = resolveDockScrubStateFromClientX(e.clientX, measuredRects);
    if (pressedState) {
      const pressedEl = itemRefs.current[pressedState.index];
      if (pressedEl && pressedEl.offsetWidth > 0) {
        const targetWidth = Math.max(46, pressedEl.offsetWidth);
        const rawLocalX = pressedEl.offsetLeft - (targetWidth - pressedEl.offsetWidth) / 2;
        const maxLocalX = navRef.current
          ? Math.max(0, navRef.current.scrollWidth - targetWidth)
          : rawLocalX;
        const centeredLocalX = Math.max(0, Math.min(rawLocalX, maxLocalX));
        setLensTarget({
          localX: centeredLocalX,
          width: targetWidth,
          scaleX: shouldReduceMotion ? 1 : 1.07,
          scaleY: shouldReduceMotion ? 1 : 1.07,
          measured: true,
        });
      } else if (navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const lensGeometry = computeLiquidLensGeometry({
          clientX: e.clientX,
          navLeft: navRect.left,
          navClientLeft: navRef.current.clientLeft,
          navScrollLeft: navRef.current.scrollLeft,
          rects: measuredRects,
          velocityPxPerMs: 0,
          isPressed: true,
          isScrubbing: false,
          reducedMotion: Boolean(shouldReduceMotion),
        });
        if (lensGeometry) {
          setLensTarget({
            localX: lensGeometry.localX,
            width: lensGeometry.width,
            scaleX: lensGeometry.scaleX,
            scaleY: lensGeometry.scaleY,
            measured: true,
          });
        }
      }
    }

    // Maintien (long-press ~135ms) : engagement en mode Liquid Lens Scrubbing
    holdTimerRef.current = setTimeout(() => {
      if (!pointerStartRef.current) return;
      enterScrubMode(pointerStartRef.current.pointerId, pointerStartRef.current.x);
    }, 135);
  };

  const handleDockPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const start = pointerStartRef.current;
    if (!start || start.pointerId !== e.pointerId) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    // Activation immédiate du scrubbing si l'utilisateur glisse horizontalement sur la barre
    if (!isScrubbingRef.current) {
      if (Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy)) {
        clearHoldTimer();
        enterScrubMode(e.pointerId, e.clientX);
      } else if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) {
        // Mouvement vertical franc : annuler l'engagement pour laisser défiler la page
        clearHoldTimer();
        setIsPressed(false);
        pointerStartRef.current = null;
        setLensTarget((prev) => ({ ...prev, scaleX: 1, scaleY: 1 }));
        requestAnimationFrame(measureActiveLens);
        return;
      }
    }

    if (isScrubbingRef.current) {
      e.preventDefault();
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const dt = Math.max(1, now - start.lastTime);
      const instVx = (e.clientX - start.lastX) / dt;
      const smoothedVx = start.velocityX * 0.55 + instVx * 0.45;
      start.lastX = e.clientX;
      start.lastTime = now;
      start.velocityX = smoothedVx;

      pendingScrubRef.current = { clientX: e.clientX, velocityX: smoothedVx };

      clearVelocityDecayTimer();
      velocityDecayTimerRef.current = setTimeout(() => {
        if (isScrubbingRef.current && pointerStartRef.current) {
          pointerStartRef.current.velocityX = 0;
          evaluateScrubAtClientX(pointerStartRef.current.lastX, 0);
        }
      }, 65);

      if (scrubRafRef.current === null) {
        scrubRafRef.current = requestAnimationFrame(() => {
          scrubRafRef.current = null;
          if (pendingScrubRef.current && isScrubbingRef.current) {
            const { clientX, velocityX } = pendingScrubRef.current;
            pendingScrubRef.current = null;
            evaluateScrubAtClientX(clientX, velocityX);
          }
        });
      }
    }
  };

  const handleDockPointerUpOrCancel = (e: React.PointerEvent<HTMLElement>) => {
    if (!pointerStartRef.current || pointerStartRef.current.pointerId !== e.pointerId) return;
    if (isScrubbingRef.current && navRef.current) {
      try {
        navRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
    stopScrubbing(e.type === 'pointercancel');
  };

  const bottomOffset = computeMobileDockBottomOffset({
    innerHeight: viewportMetrics.innerHeight || 800,
    visualViewportHeight: viewportMetrics.vvHeight || viewportMetrics.innerHeight || 800,
    visualViewportOffsetTop: viewportMetrics.vvOffsetTop,
    maxObservedViewportHeight:
      viewportMetrics.maxObservedHeight || viewportMetrics.innerHeight || 800,
    scrollDirection,
    isInputFocused,
  });

  const dynamicBottomTranslateY = isInputFocused ? 96 : -bottomOffset;
  const activeScrubItem = scrubIndex !== null ? primaryItems[scrubIndex] : null;
  const isContactActive = activeSegment === t('nav.contact');
  const isLensEngaged = isPressed || isScrubbing;
  const showLiquidLens =
    lensTarget.measured && (isScrubbing || isPressed || activeItemIndex !== -1);

  const lensTransition = shouldReduceMotion
    ? { duration: 0 }
    : isScrubbing
      ? { type: 'spring' as const, stiffness: 950, damping: 42, mass: 0.45 }
      : isPressed
        ? { type: 'spring' as const, stiffness: 620, damping: 34, mass: 0.55 }
        : { type: 'spring' as const, stiffness: 520, damping: 36, mass: 0.65 };

  const lensSurfaceStyle: React.CSSProperties =
    effectiveThemeMode === 'dark'
      ? {
          backgroundColor: isLensEngaged
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(255, 255, 255, 0.12)',
          backgroundImage: isLensEngaged
            ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.02) 45%, rgba(0, 210, 255, 0.20) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.05) 55%, rgba(0, 210, 255, 0.12) 100%)',
          border: isLensEngaged
            ? '1px solid rgba(255, 255, 255, 0.44)'
            : '1px solid rgba(255, 255, 255, 0.24)',
          boxShadow: isLensEngaged
            ? '0 8px 24px rgba(0, 0, 0, 0.52), 0 0 22px rgba(0, 210, 255, 0.28), inset 0 1.5px 0 rgba(255, 255, 255, 0.65), inset 0 -1px 0 rgba(0, 210, 255, 0.36)'
            : '0 4px 14px rgba(0, 0, 0, 0.38), 0 0 14px rgba(0, 210, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.34), inset 0 -1px 0 rgba(0, 210, 255, 0.18)',
        }
      : effectiveThemeMode === 'light'
        ? {
            backgroundColor: isLensEngaged
              ? 'rgba(220, 234, 255, 0.36)'
              : 'rgba(226, 236, 252, 0.72)',
            backgroundImage: isLensEngaged
              ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.68) 0%, rgba(224, 239, 255, 0.18) 50%, rgba(66, 133, 244, 0.20) 100%)'
              : 'linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(235, 243, 255, 0.32) 56%, rgba(66, 133, 244, 0.14) 100%)',
            border: isLensEngaged
              ? '1px solid rgba(66, 133, 244, 0.42)'
              : '1px solid rgba(15, 23, 42, 0.12)',
            boxShadow: isLensEngaged
              ? '0 8px 20px rgba(15, 23, 42, 0.14), 0 0 16px rgba(66, 133, 244, 0.24), inset 0 1.5px 0 rgba(255, 255, 255, 1), inset 0 -1px 0 rgba(66, 133, 244, 0.26)'
              : '0 3px 10px rgba(15, 23, 42, 0.09), 0 1px 3px rgba(66, 133, 244, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.98), inset 0 -1px 0 rgba(66, 133, 244, 0.14)',
          }
        : {};

  const loupeThemeInlineStyle: React.CSSProperties =
    effectiveThemeMode === 'dark'
      ? {
          backgroundColor: 'rgba(10, 10, 10, 0.85)',
          backgroundImage:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(0, 210, 255, 0.05) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow:
            '0 10px 28px rgba(0, 0, 0, 0.55), 0 0 18px rgba(0, 210, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.24)',
        }
      : effectiveThemeMode === 'light'
        ? {
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backgroundImage:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(240, 246, 255, 0.35) 100%)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow:
              '0 10px 28px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
          }
        : {};

  const navThemeInlineStyle: React.CSSProperties =
    effectiveThemeMode === 'dark'
      ? {
          backgroundColor: 'rgba(10, 10, 10, 0.75)',
          backgroundImage:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(10, 10, 10, 0.02) 55%, rgba(0, 210, 255, 0.05) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow:
            '0 14px 36px rgba(0, 0, 0, 0.65), 0 0 24px rgba(0, 210, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
        }
      : effectiveThemeMode === 'light'
        ? {
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backgroundImage:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.24) 0%, rgba(248, 249, 250, 0.04) 55%, rgba(66, 133, 244, 0.06) 100%)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow:
              '0 10px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.04)',
          }
        : {};

  return (
    <aside
      data-mobile-dock="true"
      aria-label={t('nav.mobileDock')}
      style={{
        transform: `translate3d(0, ${dynamicBottomTranslateY}px, 0)`,
      }}
      className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 md:hidden flex flex-col items-center justify-center pointer-events-none px-2 sm:px-2.5 transition-[transform,opacity] duration-300 ease-out ${
        isInputFocused ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* BULLE FLOTTANTE D'APERÇU TACTILE (Suit continûment le doigt lors du maintien / glissement type iOS) */}
      <AnimatePresence>
        {isScrubbing && activeScrubItem && (
          <div
            className="pointer-events-none mb-2.5"
            style={{
              transform: `translate3d(${scrubLoupeOffsetX}px, 0, 0)`,
            }}
          >
            <motion.div
              key="scrub-loupe"
              data-testid="mobile-dock-scrub-pill"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.94 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' }}
              className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-tight text-zinc-900 dark:text-white backdrop-blur-2xl backdrop-saturate-180 bg-white/90 dark:bg-[#0a0a0a]/85 border border-black/10 dark:border-white/18 shadow-lg"
              style={{
                backdropFilter: 'blur(20px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                ...loupeThemeInlineStyle,
              }}
            >
              {React.createElement(activeScrubItem.icon, {
                className: 'h-3.5 w-3.5 text-[#2563EB] dark:text-[#00D2FF]',
              })}
              <span>{activeScrubItem.name}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav
        ref={navRef}
        role="navigation"
        aria-label={locale === 'fr' ? 'Dock de navigation principal' : 'Primary navigation dock'}
        onPointerDown={handleDockPointerDown}
        onPointerMove={handleDockPointerMove}
        onPointerUp={handleDockPointerUpOrCancel}
        onPointerCancel={handleDockPointerUpOrCancel}
        onContextMenu={(e) => e.preventDefault()}
        className={`pointer-events-auto relative flex items-center gap-0 sm:gap-1 rounded-full px-1.5 py-1.5 overflow-x-auto max-w-[calc(100vw-0.75rem)] sm:max-w-[calc(100vw-1rem)] scrollbar-none select-none backdrop-blur-2xl backdrop-saturate-180 bg-white/75 dark:bg-[#0a0a0a]/75 border border-black/10 dark:border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_14px_36px_rgba(0,0,0,0.65)] transition-transform duration-200 ease-[var(--ease-out)] ${
          !shouldReduceMotion && isScrubbing
            ? 'scale-[1.015]'
            : !shouldReduceMotion && isPressed
              ? 'scale-[1.008]'
              : 'scale-100'
        }`}
        style={{
          touchAction: 'pan-y',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          backdropFilter: 'blur(20px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
          ...navThemeInlineStyle,
        }}
      >
        {/* PILULE ACTIVE "LIQUID LENS" CONTINUE (Suit le doigt en temps réel + lift optique iOS 26/27) */}
        {showLiquidLens && (
          <motion.div
            data-testid="mobile-dock-liquid-lens"
            aria-hidden="true"
            initial={false}
            animate={{
              x: lensTarget.localX,
              width: lensTarget.width,
              scaleX: shouldReduceMotion
                ? 1
                : isScrubbing
                  ? lensTarget.scaleX
                  : isPressed
                    ? 1.07
                    : 1,
              scaleY: shouldReduceMotion
                ? 1
                : isScrubbing
                  ? lensTarget.scaleY
                  : isPressed
                    ? 1.07
                    : 1,
              y: shouldReduceMotion ? 0 : isLensEngaged ? -1 : 0,
            }}
            transition={lensTransition}
            className="pointer-events-none absolute top-1.5 left-0 z-0 h-12 rounded-full overflow-hidden bg-slate-200/70 dark:bg-white/12 border border-slate-900/12 dark:border-white/24 shadow-[0_3px_10px_rgba(15,23,42,0.09)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.38)]"
            style={lensSurfaceStyle}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-1.5 top-[1px] h-[44%] rounded-full bg-gradient-to-b from-white/90 to-transparent dark:from-white/32 dark:to-transparent transition-opacity duration-150"
              style={{ opacity: isLensEngaged ? 1 : 0.68 }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-2 bottom-[1px] h-[28%] rounded-full bg-gradient-to-t from-[#4285F4]/16 to-transparent dark:from-[#00D2FF]/24 dark:to-transparent transition-opacity duration-150"
              style={{ opacity: isLensEngaged ? 0.95 : 0.5 }}
            />
          </motion.div>
        )}

        {primaryItems.map((item, idx) => {
          const isActive = activeSegment === item.name;
          const isHoveredInScrub = isScrubbing && scrubIndex === idx;
          const isIconHighlighted = isHoveredInScrub || (!isScrubbing && isActive);
          const Icon = item.icon;
          const proximity = !shouldReduceMotion && isScrubbing ? (scrubProximities[idx] ?? 0) : 0;
          const iconScale =
            !shouldReduceMotion && isScrubbing ? Number((1 + proximity * 0.22).toFixed(3)) : 1;
          const iconLiftY =
            !shouldReduceMotion && isScrubbing ? Number((-proximity * 4).toFixed(2)) : 0;

          return (
            <a
              key={item.id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              href={item.href}
              data-dock-item={item.id}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              onClick={(e) => {
                if (Date.now() < suppressClickUntilRef.current) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                onSelectSegment(item.name, { sectionId: item.id });
                scrollToSection(item.id, false);
              }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.name}
              style={{
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }}
              className={`group relative flex h-12 min-h-[48px] items-center justify-center rounded-full flex-shrink-0 select-none transition-[color,transform] duration-200 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4] dark:focus-visible:ring-[#00D2FF] active:scale-[0.97] ${
                isActive
                  ? 'px-2.5 sm:px-3.5 text-zinc-900 dark:text-white font-semibold'
                  : 'min-w-[34px] sm:min-w-[44px] px-1.5 sm:px-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {/* REPLI STATIQUE SSR / PRÉ-MESURE POUR LA PILULE ACTIVE */}
              {!lensTarget.measured && isActive && (
                <div
                  data-testid="mobile-dock-active-pill"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-0 rounded-full overflow-hidden bg-slate-200/70 dark:bg-white/12 border border-slate-900/12 dark:border-white/24 shadow-[0_3px_10px_rgba(15,23,42,0.09)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.38)]"
                  style={lensSurfaceStyle}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-1.5 top-[1px] h-[44%] rounded-full bg-gradient-to-b from-white/90 to-transparent dark:from-white/32 dark:to-transparent opacity-70"
                  />
                </div>
              )}

              <div
                className="relative z-10 flex items-center gap-1.5 transition-transform duration-150 ease-[var(--ease-out)]"
                style={
                  isScrubbing && !shouldReduceMotion
                    ? {
                        transform: `translate3d(0, ${iconLiftY}px, 0) scale(${iconScale})`,
                      }
                    : undefined
                }
              >
                <Icon
                  className={`h-4 w-4 flex-shrink-0 transition-colors duration-150 ${
                    isIconHighlighted
                      ? 'text-[#2563EB] dark:text-[#00D2FF]'
                      : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                  }`}
                />
                <span
                  className={
                    isActive
                      ? 'text-[11px] font-semibold tracking-tight whitespace-nowrap text-zinc-900 dark:text-white max-w-[74px] sm:max-w-none truncate'
                      : 'sr-only'
                  }
                >
                  {item.name}
                </span>
              </div>
            </a>
          );
        })}

        {/* SÉPARATEUR SUBTIL */}
        <div
          className="h-5 w-[1px] bg-black/10 dark:bg-white/15 mx-0.5 flex-shrink-0"
          aria-hidden="true"
        />

        {/* BOUTON RÉGLAGES & ACCÈS RAPIDE (Cible >= 48x48px) */}
        <button
          ref={hudTriggerRef}
          type="button"
          data-dock-settings="true"
          onClick={onToggleHud}
          aria-haspopup="dialog"
          aria-expanded={isHudOpen}
          aria-controls="mobile-hud-drawer"
          aria-label={
            isHudOpen
              ? locale === 'fr'
                ? 'Fermer le menu de navigation et réglages'
                : 'Close navigation and settings menu'
              : locale === 'fr'
                ? 'Ouvrir le menu de navigation et réglages'
                : 'Open navigation and settings menu'
          }
          className={`group relative flex h-12 min-h-[48px] min-w-[38px] sm:min-w-[44px] items-center justify-center rounded-full px-1.5 sm:px-2.5 flex-shrink-0 select-none transition-[color,background-color,border-color,transform] duration-200 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4] dark:focus-visible:ring-[#00D2FF] active:scale-[0.97] ${
            isHudOpen || isContactActive
              ? 'bg-black/10 dark:bg-white/15 text-zinc-900 dark:text-white border border-black/15 dark:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
          }`}
        >
          <SlidersHorizontal
            className={`h-4 w-4 transition-transform duration-300 ease-[var(--ease-out)] ${
              isHudOpen
                ? 'rotate-90 text-[#2563EB] dark:text-[#00D2FF]'
                : isContactActive
                  ? 'text-[#2563EB] dark:text-[#00D2FF]'
                  : 'text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white'
            }`}
          />
        </button>
      </nav>
    </aside>
  );
}
