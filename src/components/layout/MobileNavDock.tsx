'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Home, User, GraduationCap, Briefcase, FolderGit2, Cpu, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../theme/LanguageProvider';
import { useTheme } from 'next-themes';

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

export interface MobileDockOffsetInput {
  innerHeight: number;
  visualViewportHeight?: number;
  visualViewportOffsetTop?: number;
  maxObservedViewportHeight?: number;
  scrollDirection?: 'up' | 'down' | 'idle';
  isInputFocused?: boolean;
}

interface MobileNavDockProps {
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
  const [isTouch, setIsTouch] = useState(false);
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

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrubScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const isScrubbingRef = useRef(false);
  const suppressNextClickRef = useRef(false);
  const lastScrubbedIdRef = useRef<string | null>(null);
  const maxViewportTrackerRef = useRef<{ width: number; maxH: number }>({ width: 0, maxH: 0 });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

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

  const isDark = resolvedTheme ? resolvedTheme === 'dark' : (theme ? theme === 'dark' : true);

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

  // Défilement doux automatique du dock si nécessaire sur écrans très étroits (< 340px)
  useEffect(() => {
    if (!navRef.current || isScrubbingRef.current) return;
    const activeEl = navRef.current.querySelector<HTMLElement>('[aria-current="page"]');
    if (activeEl && typeof activeEl.scrollIntoView === 'function') {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeSegment]);

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
          behavior: shouldReduceMotion || immediate ? 'auto' : 'smooth',
          block: 'start',
        });
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          window.history.replaceState(null, '', `#${sectionId}`);
        }
      };

      if (immediate) {
        performScroll();
      } else {
        scrubScrollTimerRef.current = setTimeout(performScroll, 50);
      }
    },
    [shouldReduceMotion]
  );

  const evaluateScrubAtClientX = useCallback(
    (clientX: number) => {
      const measuredRects: Array<{ item: DockNavItem; left: number; right: number }> = [];
      primaryItems.forEach((item, idx) => {
        const el = itemRefs.current[idx];
        if (el) {
          const rect = el.getBoundingClientRect();
          measuredRects.push({ item, left: rect.left, right: rect.right });
        }
      });

      const scrubState = resolveDockScrubStateFromClientX(clientX, measuredRects);
      if (!scrubState) return;

      setScrubIndex(scrubState.index);
      setScrubProximities(scrubState.proximities);

      if (navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const navCenterX = (navRect.left + navRect.right) / 2;
        setScrubLoupeOffsetX(Math.round(scrubState.clampedX - navCenterX));
      }

      if (lastScrubbedIdRef.current !== scrubState.item.id) {
        lastScrubbedIdRef.current = scrubState.item.id;
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          try {
            navigator.vibrate(8);
          } catch {
            // Ignore vibration restrictions
          }
        }
        onSelectSegment(scrubState.item.name, {
          fromScrub: true,
          immediate: true,
          sectionId: scrubState.item.id,
        });
        scrollToSection(scrubState.item.id, false);
      }
    },
    [primaryItems, onSelectSegment, scrollToSection]
  );

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const stopScrubbing = useCallback(() => {
    clearHoldTimer();
    if (isScrubbingRef.current) {
      isScrubbingRef.current = false;
      setIsScrubbing(false);
      setScrubIndex(null);
      setScrubProximities([]);
      setScrubLoupeOffsetX(0);
      if (lastScrubbedIdRef.current) {
        scrollToSection(lastScrubbedIdRef.current, false);
      }
    }
    pointerStartRef.current = null;
    lastScrubbedIdRef.current = null;
  }, [scrollToSection]);

  useEffect(() => {
    return () => {
      clearHoldTimer();
      if (scrubScrollTimerRef.current) clearTimeout(scrubScrollTimerRef.current);
    };
  }, []);

  const handleDockPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    // Ignore si le clic provient du bouton de réglages/menu
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-dock-settings="true"]')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    pointerStartRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    suppressNextClickRef.current = false;
    clearHoldTimer();

    // Un maintien (long-press ~135ms) sur un onglet active le mode bascule fluide type iOS
    holdTimerRef.current = setTimeout(() => {
      if (!pointerStartRef.current || !navRef.current) return;
      isScrubbingRef.current = true;
      suppressNextClickRef.current = true;
      setIsScrubbing(true);
      try {
        navRef.current.setPointerCapture(pointerStartRef.current.pointerId);
      } catch {
        // Ignore if pointer capture is unsupported
      }
      evaluateScrubAtClientX(pointerStartRef.current.x);
    }, 135);
  };

  const handleDockPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!pointerStartRef.current) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    // Activation immédiate du scrubbing si l'utilisateur glisse horizontalement sur la barre
    if (!isScrubbingRef.current) {
      if (Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy)) {
        clearHoldTimer();
        isScrubbingRef.current = true;
        suppressNextClickRef.current = true;
        setIsScrubbing(true);
        try {
          navRef.current?.setPointerCapture(e.pointerId);
        } catch {
          // Ignore if unsupported
        }
      } else if (Math.abs(dy) > 12) {
        // Mouvement vertical franc : annuler le timer de maintien
        clearHoldTimer();
        pointerStartRef.current = null;
        return;
      }
    }

    if (isScrubbingRef.current) {
      e.preventDefault();
      evaluateScrubAtClientX(e.clientX);
    }
  };

  const handleDockPointerUpOrCancel = (e: React.PointerEvent<HTMLElement>) => {
    if (isScrubbingRef.current && navRef.current) {
      try {
        navRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
    stopScrubbing();
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

  return (
    <aside
      data-mobile-dock="true"
      aria-label="Navigation flottante mobile"
      style={{
        transform: `translate3d(0, ${dynamicBottomTranslateY}px, 0)`,
      }}
      className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 md:hidden flex flex-col items-center justify-center pointer-events-none px-2.5 transition-all duration-300 ease-out ${
        isInputFocused ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* BULLE FLOTTANTE D'APERÇU TACTILE (Suit continûment le doigt lors du maintien / glissement type iOS) */}
      <AnimatePresence>
        {isScrubbing && activeScrubItem && (
          <motion.div
            key="scrub-loupe"
            data-testid="mobile-dock-scrub-pill"
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.94 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="mb-2.5 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-tight text-zinc-900 dark:text-white shadow-lg"
            style={{
              transform: `translate3d(${scrubLoupeOffsetX}px, 0, 0)`,
              backgroundColor: isDark ? 'rgba(18, 18, 22, 0.88)' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: isDark
                ? '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.18)'
                : '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
            }}
          >
            {React.createElement(activeScrubItem.icon, {
              className: 'h-3.5 w-3.5 text-brand-blue',
            })}
            <span>{activeScrubItem.name}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        ref={navRef}
        role="navigation"
        aria-label="Dock de navigation principal"
        onPointerDown={handleDockPointerDown}
        onPointerMove={handleDockPointerMove}
        onPointerUp={handleDockPointerUpOrCancel}
        onPointerCancel={handleDockPointerUpOrCancel}
        onContextMenu={(e) => e.preventDefault()}
        className={`pointer-events-auto flex items-center gap-1 rounded-full p-1.5 transition-transform duration-300 overflow-x-auto max-w-[calc(100vw-1rem)] scrollbar-none select-none ${
          isScrubbing ? 'scale-[1.03]' : 'scale-100'
        }`}
        style={{
          touchAction: 'pan-y',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          background: isDark
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.68) 100%)',
          backgroundColor: isDark
            ? 'rgba(10, 10, 14, 0.75)'
            : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: isTouch ? 'blur(16px) saturate(1.6)' : 'blur(20px) saturate(1.8)',
          WebkitBackdropFilter: isTouch ? 'blur(16px) saturate(1.6)' : 'blur(20px) saturate(1.8)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: isDark
            ? '0 10px 36px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 0 0 0.5px rgba(255, 255, 255, 0.06)'
            : '0 10px 32px rgba(0, 0, 0, 0.10), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 0 0 0.5px rgba(255, 255, 255, 0.8)',
        }}
      >
        {primaryItems.map((item, idx) => {
          const isActive = activeSegment === item.name;
          const Icon = item.icon;
          const proximity = isScrubbing ? (scrubProximities[idx] ?? 0) : 0;
          const iconScale = isScrubbing ? Number((1 + proximity * 0.22).toFixed(3)) : 1;
          const iconLiftY = isScrubbing ? Number((-proximity * 4).toFixed(2)) : 0;

          return (
            <a
              key={item.id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              href={item.href}
              data-dock-item={item.id}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onClick={(e) => {
                if (suppressNextClickRef.current) {
                  e.preventDefault();
                  suppressNextClickRef.current = false;
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
              className={`group relative flex h-12 min-h-[48px] items-center justify-center rounded-full flex-shrink-0 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue active:scale-95 ${
                isActive
                  ? 'px-3 sm:px-3.5 text-zinc-900 dark:text-white font-semibold'
                  : 'min-w-[40px] sm:min-w-[44px] px-2.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {/* CAPSULE ACTIVE DYNAMIQUE STYLE iOS LIQUID GLASS */}
              {isActive && (
                <motion.div
                  layoutId="mobile-dock-active-pill"
                  transition={{
                    type: shouldReduceMotion ? false : 'spring',
                    stiffness: 420,
                    damping: 32,
                    mass: 0.75,
                  }}
                  className="absolute inset-0 z-0 rounded-full"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(0, 0, 0, 0.07) 0%, rgba(0, 0, 0, 0.03) 100%)',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.14)'
                      : '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: isDark
                      ? '0 2px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.18)'
                      : '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}

              <div
                className="relative z-10 flex items-center gap-1.5 transition-transform duration-150"
                style={
                  isScrubbing
                    ? {
                        transform: `translate3d(0, ${iconLiftY}px, 0) scale(${iconScale})`,
                      }
                    : undefined
                }
              >
                <Icon
                  className={`h-4 w-4 flex-shrink-0 transition-colors duration-300 ${
                    isActive
                      ? 'text-brand-blue dark:text-white'
                      : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                  }`}
                />
                <span
                  className={
                    isActive
                      ? 'text-[11px] font-semibold tracking-tight whitespace-nowrap text-zinc-900 dark:text-white'
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
          className="h-5 w-[1px] bg-black/10 dark:bg-white/10 mx-0.5 flex-shrink-0"
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
          className={`group relative flex h-12 min-h-[48px] min-w-[44px] items-center justify-center rounded-full px-2.5 flex-shrink-0 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue active:scale-95 ${
            isHudOpen || isContactActive
              ? 'bg-black/8 dark:bg-white/15 text-zinc-900 dark:text-white border border-black/10 dark:border-white/15'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <SlidersHorizontal
            className={`h-4 w-4 transition-transform duration-300 ${
              isHudOpen
                ? 'rotate-90 text-brand-blue dark:text-white'
                : 'text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white'
            }`}
          />
        </button>
      </nav>
    </aside>
  );
}
