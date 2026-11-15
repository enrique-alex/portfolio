'use client';

import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Languages, Lock, Home, User, GraduationCap, Briefcase, FolderGit2, Cpu, Send } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../theme/LanguageProvider';
import { Logo } from '../ui/Logo';
import Link from 'next/link';
import MobileNavDock, { type SelectSegmentOptions } from './MobileNavDock';
import MobileHudDrawer from './MobileHudDrawer';
import { scrollToElementById } from '@/lib/scroll';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function resolveDesktopNavIndexFromClientX(
  clientX: number,
  rects: Array<{ left: number; right: number }>
): number {
  if (!rects || rects.length === 0 || !Number.isFinite(clientX)) return -1;

  let bestIdx = -1;
  let bestDist = Infinity;

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    if (!rect || rect.right <= rect.left) continue;
    if (clientX >= rect.left && clientX <= rect.right) {
      return i;
    }
    const center = (rect.left + rect.right) / 2;
    const dist = Math.abs(clientX - center);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }

  return bestIdx;
}

export interface PortfolioSection {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SectionBounds {
  id: string;
  name: string;
  top: number;
  bottom: number;
}

export interface ProgrammaticScrollLock {
  targetId: string;
  targetName: string;
  expiresAt: number;
}

/**
 * Determines whether a programmatic scroll lock should remain active.
 * Keeps the target tab locked while smooth-scrolling across intermediate sections,
 * and unlocks as soon as the target section reaches the reading line (`probeY`) or expires.
 */
export function isProgrammaticScrollLockActive({
  lock,
  now,
  targetBounds,
  probeY,
}: {
  lock: ProgrammaticScrollLock | null;
  now: number;
  targetBounds?: SectionBounds | null;
  probeY: number;
}): boolean {
  if (!lock) return false;
  if (now >= lock.expiresAt) return false;
  if (!targetBounds) return true;

  const hasReachedTarget =
    targetBounds.top <= probeY + 24 && targetBounds.bottom >= probeY - 24;
  return !hasReachedTarget;
}

/**
 * Pure, deterministic scroll-spy resolver.
 * Works identically on short or very tall mobile sections (> 2500px) and in both scroll directions.
 */
export function resolveActiveSectionOnScroll({
  scrollY,
  innerHeight,
  scrollHeight,
  documentHeight,
  sections,
}: {
  scrollY: number;
  innerHeight: number;
  scrollHeight?: number;
  documentHeight?: number;
  sections: SectionBounds[];
}): SectionBounds | null {
  if (!sections || sections.length === 0) return null;

  if (scrollY < 60) {
    return sections[0];
  }

  const totalHeight =
    typeof documentHeight === 'number' && documentHeight > 0
      ? documentHeight
      : typeof scrollHeight === 'number' && scrollHeight > 0
        ? scrollHeight
        : 0;

  if (totalHeight > innerHeight && innerHeight + scrollY >= totalHeight - 40) {
    return sections[sections.length - 1];
  }

  // Fallback bottom check using last section bounds when near the bottom of the viewport
  const lastSection = sections[sections.length - 1];
  if (
    lastSection &&
    lastSection.top < innerHeight * 0.72 &&
    lastSection.bottom <= innerHeight + 24 &&
    scrollY > 120
  ) {
    return lastSection;
  }

  // Ligne de lecture naturelle située à 35% du haut de la fenêtre d'affichage
  const probeY = innerHeight * 0.35;

  // 1. Priorité à la section qui traverse directement la ligne de lecture
  let straddling: SectionBounds | null = null;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (s.top <= probeY && s.bottom >= probeY) {
      straddling = s;
    }
  }
  if (straddling) return straddling;

  // 2. Si probeY tombe dans un séparateur entre deux sections, retenir la dernière section dont le haut a franchi probeY
  let lastPassed: SectionBounds | null = null;
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].top <= probeY) {
      lastPassed = sections[i];
    }
  }

  return lastPassed || sections[0];
}

export function usePortfolioSections(): PortfolioSection[] {
  const { t } = useLanguage();
  return useMemo(
    () => [
      { id: 'home', name: t('nav.home'), href: '/#home', icon: Home },
      { id: 'profile', name: t('nav.about'), href: '/#profile', icon: User },
      { id: 'academic', name: t('nav.academic'), href: '/#academic', icon: GraduationCap },
      { id: 'experience', name: t('nav.experience'), href: '/#experience', icon: Briefcase },
      { id: 'projects', name: t('nav.projects'), href: '/#projects', icon: FolderGit2 },
      { id: 'skills', name: t('nav.skills'), href: '/#skills', icon: Cpu },
      { id: 'contact', name: t('nav.contact'), href: '/#contact', icon: Send },
    ],
    [t]
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const portfolioSections = usePortfolioSections();
  const NAV_LINKS = useMemo(() => portfolioSections.slice(0, 6), [portfolioSections]);
  const { locale, setLocale, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | 'idle'>('idle');
  const [isMobileHudOpen, setIsMobileHudOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('home');

  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const hudTriggerRef = useRef<HTMLButtonElement>(null);
  const scrollLockRef = useRef<ProgrammaticScrollLock | null>(null);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollYRef = useRef(0);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [isNavPressed, setIsNavPressed] = useState(false);
  const [pillGeometry, setPillGeometry] = useState<{
    x: number;
    width: number;
    measured: boolean;
    visible: boolean;
    snap: boolean;
  }>({ x: 0, width: 0, measured: false, visible: false, snap: true });

  const isDark = resolvedTheme ? resolvedTheme === 'dark' : (theme ? theme === 'dark' : true);

  const currentSection = useMemo(() => {
    return portfolioSections.find((s) => s.id === activeSectionId) || portfolioSections[0];
  }, [portfolioSections, activeSectionId]);

  const activeSegment = currentSection?.name || portfolioSections[0]?.name || 'Accueil';
  const ActiveIcon = currentSection?.icon || Home;

  const activeLinkIndex = useMemo(
    () => NAV_LINKS.findIndex((link) => link.id === activeSectionId),
    [NAV_LINKS, activeSectionId]
  );

  const hoveredLinkIndex = useMemo(
    () => (hoveredSectionId ? NAV_LINKS.findIndex((link) => link.id === hoveredSectionId) : -1),
    [NAV_LINKS, hoveredSectionId]
  );

  const targetLinkIndex = hoveredLinkIndex !== -1 ? hoveredLinkIndex : activeLinkIndex;
  const showDesktopLens = pillGeometry.measured;
  const isLensVisible = targetLinkIndex !== -1;
  const isLensEngaged = hoveredLinkIndex !== -1 || isNavPressed;

  const handleSelectSegment = useCallback(
    (segmentName: string, options?: SelectSegmentOptions) => {
      const matched = options?.sectionId
        ? portfolioSections.find((s) => s.id === options.sectionId)
        : portfolioSections.find((s) => s.name === segmentName);
      const targetId = options?.sectionId || matched?.id || 'home';
      const targetName = matched?.name || segmentName;
      const lockDuration = options?.fromScrub ? 1100 : 1200;

      scrollLockRef.current = {
        targetId,
        targetName,
        expiresAt: Date.now() + lockDuration,
      };
      setActiveSectionId(targetId);

      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = setTimeout(() => {
        scrollLockRef.current = null;
      }, lockDuration);
    },
    [portfolioSections]
  );

  useEffect(() => {
    setMounted(true);
    lastScrollYRef.current = window.scrollY;

    let rafPending = false;

    const syncScrollState = () => {
      rafPending = false;
      const scrollY = window.scrollY;
      const innerHeight = window.innerHeight;
      setIsScrolled(scrollY > 20);

      // Détection de la direction de défilement (zone morte de 6px contre les micro-rebonds)
      const delta = scrollY - lastScrollYRef.current;
      if (scrollY < 40) {
        setScrollDirection('idle');
      } else if (delta < -6) {
        setScrollDirection('up');
        lastScrollYRef.current = scrollY;
      } else if (delta > 6) {
        setScrollDirection('down');
        lastScrollYRef.current = scrollY;
      }

      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current);
      }
      scrollIdleTimerRef.current = setTimeout(() => {
        setScrollDirection('idle');
      }, 520);

      const measuredSections: SectionBounds[] = [];
      for (let i = 0; i < portfolioSections.length; i++) {
        const s = portfolioSections[i];
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          measuredSections.push({
            id: s.id,
            name: s.name,
            top: rect.top,
            bottom: rect.bottom,
          });
        }
      }

      const probeY = innerHeight * 0.35;
      if (scrollLockRef.current) {
        const targetBounds =
          measuredSections.find((s) => s.id === scrollLockRef.current?.targetId) || null;
        const keepLocked = isProgrammaticScrollLockActive({
          lock: scrollLockRef.current,
          now: Date.now(),
          targetBounds,
          probeY,
        });
        if (keepLocked) {
          return;
        }
        scrollLockRef.current = null;
      }

      const active = resolveActiveSectionOnScroll({
        scrollY,
        innerHeight,
        scrollHeight: document.documentElement.scrollHeight,
        sections: measuredSections,
      });

      if (active) {
        setActiveSectionId((prev) => (prev === active.id ? prev : active.id));
      }
    };

    const handleScrollOrResize = () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(syncScrollState);
      }
    };

    // Déverrouillage immédiat de la synchro si l'utilisateur reprend la main manuellement
    const clearProgrammaticLock = (e?: Event) => {
      if (e && e.target instanceof Element && e.target.closest('[data-mobile-dock="true"]')) {
        return;
      }
      if (scrollLockRef.current) {
        scrollLockRef.current = null;
        if (navTimeoutRef.current) {
          clearTimeout(navTimeoutRef.current);
          navTimeoutRef.current = null;
        }
      }
    };

    syncScrollState();
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('wheel', clearProgrammaticLock, { passive: true });
    window.addEventListener('touchstart', clearProgrammaticLock, { passive: true });

    const rafId = requestAnimationFrame(syncScrollState);
    const timeoutId = setTimeout(syncScrollState, 250);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('wheel', clearProgrammaticLock);
      window.removeEventListener('touchstart', clearProgrammaticLock);
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      if (scrollIdleTimerRef.current) clearTimeout(scrollIdleTimerRef.current);
    };
  }, [portfolioSections, pathname]);

  // Measure and synchronize Desktop Liquid Glass pill geometry synchronously before paint using offsetLeft/offsetWidth + ResizeObserver
  const measureDesktopLens = useCallback(() => {
    if (!navRef.current) return;
    if (targetLinkIndex < 0) {
      setPillGeometry((prev) =>
        !prev.measured || !prev.visible ? prev : { ...prev, visible: false, snap: false }
      );
      return;
    }

    const targetEl = itemRefs.current[targetLinkIndex];
    if (!targetEl) return;

    const x = targetEl.offsetLeft;
    const width = targetEl.offsetWidth;
    if (width <= 0) return;

    setPillGeometry((prev) => {
      const shouldSnap = !prev.measured || !prev.visible;
      if (
        prev.measured &&
        prev.visible &&
        prev.x === x &&
        prev.width === width &&
        prev.snap === shouldSnap
      ) {
        return prev;
      }
      return { x, width, measured: true, visible: true, snap: shouldSnap };
    });
  }, [targetLinkIndex]);

  useIsomorphicLayoutEffect(() => {
    measureDesktopLens();
    const rafId = requestAnimationFrame(measureDesktopLens);
    const settleTimerId = setTimeout(measureDesktopLens, 180);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && navRef.current) {
      observer = new ResizeObserver(() => {
        measureDesktopLens();
      });
      observer.observe(navRef.current);
      for (let i = 0; i < itemRefs.current.length; i++) {
        const el = itemRefs.current[i];
        if (el) observer.observe(el);
      }
    }

    let fontCancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!fontCancelled) measureDesktopLens();
      });
    }

    return () => {
      fontCancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(settleTimerId);
      observer?.disconnect();
    };
  }, [measureDesktopLens, NAV_LINKS, targetLinkIndex, locale, isScrolled]);

  const handleNavPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'touch') return;
      const rects = itemRefs.current.map((el) => {
        if (!el) return { left: 0, right: 0 };
        const rect = el.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      });
      const hitIdx = resolveDesktopNavIndexFromClientX(e.clientX, rects);
      if (hitIdx !== -1 && NAV_LINKS[hitIdx]) {
        const nextId = NAV_LINKS[hitIdx].id;
        setHoveredSectionId((prev) => (prev === nextId ? prev : nextId));
      }
    },
    [NAV_LINKS]
  );

  useEffect(() => {
    if (!isNavPressed) return;
    const releasePress = () => setIsNavPressed(false);
    window.addEventListener('pointerup', releasePress);
    window.addEventListener('pointercancel', releasePress);
    window.addEventListener('blur', releasePress);
    return () => {
      window.removeEventListener('pointerup', releasePress);
      window.removeEventListener('pointercancel', releasePress);
      window.removeEventListener('blur', releasePress);
    };
  }, [isNavPressed]);

  const desktopBaseSpring = isNavPressed
    ? { type: 'spring' as const, stiffness: 760, damping: 36, mass: 0.48 }
    : hoveredLinkIndex !== -1
      ? { type: 'spring' as const, stiffness: 620, damping: 38, mass: 0.52 }
      : { type: 'spring' as const, stiffness: 520, damping: 36, mass: 0.62 };

  const desktopLensTransition = shouldReduceMotion
    ? { duration: 0 }
    : pillGeometry.snap
      ? {
          x: { duration: 0 },
          width: { duration: 0 },
          opacity: { duration: 0.16, ease: 'easeOut' as const },
          scaleX: desktopBaseSpring,
          scaleY: desktopBaseSpring,
          y: desktopBaseSpring,
        }
      : desktopBaseSpring;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none dark:focus:bg-[#00D2FF] dark:focus:text-[#050505]"
      >
        {t('nav.skipToContent')}
      </a>
      <header
        className={`pointer-events-none fixed top-0 left-0 right-0 z-50 w-full transition-[padding] duration-300 ease-[var(--ease-out)] ${
          isScrolled
            ? 'pb-2 pt-[calc(0.6rem+env(safe-area-inset-top,0px))]'
            : 'pb-2 md:pb-3 pt-[calc(0.85rem+env(safe-area-inset-top,0px))] md:pt-[calc(1rem+env(safe-area-inset-top,0px))]'
        }`}
      >
        <div
          className={`pointer-events-auto mx-auto flex items-center justify-between transition-[background-color,border-color,box-shadow,padding,max-width,border-radius] duration-300 ease-[var(--ease-out)] relative z-50 ${
            isScrolled
              ? 'max-w-6xl gap-1.5 lg:gap-4 xl:gap-6 rounded-full mx-2 sm:mx-3 lg:mx-auto px-3 lg:px-5 py-1.5 backdrop-blur-2xl backdrop-saturate-[1.8] bg-white/80 [background-image:linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(248,249,250,0.08)_55%,rgba(37,99,235,0.05)_100%)] border border-black/10 shadow-[0_10px_32px_rgba(15,23,42,0.10),0_1px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(0,0,0,0.04)] dark:bg-[#0A0C10]/80 dark:[background-image:linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(10,12,16,0.02)_55%,rgba(0,210,255,0.05)_100%)] dark:border-white/14 dark:shadow-[0_12px_36px_rgba(0,0,0,0.55),0_0_24px_rgba(0,210,255,0.07),inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(255,255,255,0.04)]'
              : 'max-w-7xl gap-2 lg:gap-4 bg-transparent border border-transparent px-3 sm:px-4 lg:px-6 xl:px-10 py-1'
          }`}
        >
          {/* LOGO */}
          <Link
            href="/#home"
            className="group relative z-50 flex items-center gap-1.5 lg:gap-2 text-[15px] lg:text-lg xl:text-xl font-bold tracking-tighter text-zinc-900 transition-opacity hover:opacity-90 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF] rounded-lg py-1 px-1 -ml-1 lg:px-1.5 lg:-ml-1.5 shrink-0"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                scrollToElementById('home');
              }
              handleSelectSegment(portfolioSections[0]?.name || 'Accueil', { sectionId: 'home' });
            }}
            aria-label="Enrique.Ndjakou"
          >
            <Logo className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-zinc-900 transition-transform duration-300 group-hover:scale-105 group-hover:text-blue-600 dark:text-white dark:group-hover:text-[#00D2FF] shrink-0" />
            <span className="relative">
              Enrique<span className="text-blue-600 dark:text-[#00D2FF]">.Ndjakou</span>
              <span className="absolute -bottom-1 left-0 h-[1px] w-full origin-left scale-x-0 bg-gradient-to-r from-blue-600 dark:from-[#00D2FF] to-transparent transition-transform duration-300 group-hover:scale-x-100"></span>
            </span>
          </Link>

          {/* NAVIGATION DESKTOP — Liquid Glass Capsule & Glide Physics */}
          <nav
            ref={navRef}
            aria-label={locale === 'fr' ? 'Navigation principale' : 'Primary navigation'}
            onPointerMove={handleNavPointerMove}
            onPointerLeave={() => {
              setHoveredSectionId(null);
              setIsNavPressed(false);
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setHoveredSectionId(null);
              }
            }}
            className={`hidden md:flex items-center gap-0 lg:gap-0.5 xl:gap-1 relative rounded-full p-0.5 lg:p-1 select-none transition-[background-color,border-color,box-shadow] duration-300 ease-[var(--ease-out)] ${
              isScrolled
                ? 'bg-black/[0.03] border border-black/[0.06] dark:bg-white/[0.04] dark:border-white/[0.08]'
                : 'backdrop-blur-2xl backdrop-saturate-[1.8] bg-white/75 [background-image:linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(248,249,250,0.08)_55%,rgba(37,99,235,0.05)_100%)] border border-black/10 shadow-[0_8px_24px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.05),inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(0,0,0,0.04)] dark:bg-[#0a0a0a]/75 dark:[background-image:linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(10,10,10,0.02)_55%,rgba(0,210,255,0.05)_100%)] dark:border-white/15 dark:shadow-[0_12px_32px_rgba(0,0,0,0.55),0_0_20px_rgba(0,210,255,0.07),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.05)]'
            }`}
          >
            {showDesktopLens && (
              <motion.div
                data-testid="desktop-nav-liquid-lens"
                aria-hidden="true"
                initial={false}
                animate={{
                  x: pillGeometry.x,
                  width: pillGeometry.width,
                  opacity: isLensVisible ? 1 : 0,
                  scaleX: shouldReduceMotion
                    ? 1
                    : !isLensVisible
                      ? 0.94
                      : isNavPressed
                        ? 1.045
                        : hoveredLinkIndex !== -1
                          ? 1.015
                          : 1,
                  scaleY: shouldReduceMotion
                    ? 1
                    : !isLensVisible
                      ? 0.94
                      : isNavPressed
                        ? 0.965
                        : hoveredLinkIndex !== -1
                          ? 1.04
                          : 1,
                  y: shouldReduceMotion ? 0 : isNavPressed ? 0 : hoveredLinkIndex !== -1 ? -0.5 : 0,
                }}
                transition={desktopLensTransition}
                className={`pointer-events-none absolute top-0.5 bottom-0.5 lg:top-1 lg:bottom-1 left-0 z-0 rounded-full overflow-hidden transition-[background-color,border-color,box-shadow] duration-150 ${
                  isLensEngaged
                    ? 'bg-[rgba(220,234,255,0.56)] [background-image:linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(224,239,255,0.26)_52%,rgba(66,133,244,0.20)_100%)] border border-[#4285F4]/38 shadow-[0_6px_18px_rgba(15,23,42,0.12),0_0_14px_rgba(66,133,244,0.20),inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(66,133,244,0.24)] dark:bg-[rgba(255,255,255,0.09)] dark:[background-image:linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.03)_46%,rgba(0,210,255,0.20)_100%)] dark:border-white/40 dark:shadow-[0_8px_22px_rgba(0,0,0,0.48),0_0_20px_rgba(0,210,255,0.24),inset_0_1.5px_0_rgba(255,255,255,0.58),inset_0_-1px_0_rgba(0,210,255,0.34)]'
                    : 'bg-[rgba(226,236,252,0.72)] [background-image:linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(235,243,255,0.34)_56%,rgba(66,133,244,0.14)_100%)] border border-slate-900/12 shadow-[0_3px_10px_rgba(15,23,42,0.09),0_1px_3px_rgba(66,133,244,0.16),inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(66,133,244,0.14)] dark:bg-[rgba(255,255,255,0.12)] dark:[background-image:linear-gradient(180deg,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.05)_55%,rgba(0,210,255,0.12)_100%)] dark:border-white/24 dark:shadow-[0_4px_14px_rgba(0,0,0,0.38),0_0_14px_rgba(0,210,255,0.12),inset_0_1px_0_rgba(255,255,255,0.34),inset_0_-1px_0_rgba(0,210,255,0.18)]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-1.5 top-[1px] h-[44%] rounded-full bg-gradient-to-b from-white/90 to-transparent dark:from-white/32 dark:to-transparent transition-opacity duration-150 ${
                    isLensEngaged ? 'opacity-100' : 'opacity-70'
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-2 bottom-[1px] h-[28%] rounded-full bg-gradient-to-t from-[#4285F4]/16 to-transparent dark:from-[#00D2FF]/24 dark:to-transparent transition-opacity duration-150 ${
                    isLensEngaged ? 'opacity-95' : 'opacity-50'
                  }`}
                />
              </motion.div>
            )}

            {NAV_LINKS.map((link, idx) => {
              const isActive = activeSectionId === link.id;
              const isHovered = hoveredSectionId === link.id;
              const isHighlighted = isHovered || (!hoveredSectionId && isActive);
              return (
                <a
                  key={link.id}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  href={link.href}
                  data-segment={link.name}
                  aria-current={isActive ? 'page' : undefined}
                  onPointerEnter={() => setHoveredSectionId(link.id)}
                  onFocus={() => setHoveredSectionId(link.id)}
                  onPointerDown={() => setIsNavPressed(true)}
                  onPointerUp={() => setIsNavPressed(false)}
                  onClick={(e) => {
                    if (pathname === '/') {
                      e.preventDefault();
                      scrollToElementById(link.id);
                    }
                    handleSelectSegment(link.name, { sectionId: link.id });
                  }}
                  className={`relative z-10 flex h-8 lg:h-9 items-center justify-center rounded-full px-1.5 lg:px-2.5 xl:px-3.5 text-[11.5px] lg:text-[13px] xl:text-sm font-medium whitespace-nowrap transition-[color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF] ${
                    isHighlighted
                      ? 'text-zinc-900 dark:text-white'
                      : isActive
                        ? 'text-zinc-800 dark:text-white/90'
                        : 'text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white'
                  }`}
                >
                  {/* Repli statique SSR / pré-mesure sans écart Hydratation */}
                  {!pillGeometry.measured && isActive && (
                    <span
                      data-testid="desktop-nav-active-pill"
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-0 rounded-full overflow-hidden bg-[rgba(226,236,252,0.72)] [background-image:linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(235,243,255,0.34)_56%,rgba(66,133,244,0.14)_100%)] border border-slate-900/12 shadow-[0_3px_10px_rgba(15,23,42,0.09),0_1px_3px_rgba(66,133,244,0.16),inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(66,133,244,0.14)] dark:bg-[rgba(255,255,255,0.12)] dark:[background-image:linear-gradient(180deg,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.05)_55%,rgba(0,210,255,0.12)_100%)] dark:border-white/24 dark:shadow-[0_4px_14px_rgba(0,0,0,0.38),0_0_14px_rgba(0,210,255,0.12),inset_0_1px_0_rgba(255,255,255,0.34),inset_0_-1px_0_rgba(0,210,255,0.18)]"
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-1.5 top-[1px] h-[44%] rounded-full bg-gradient-to-b from-white/90 to-transparent dark:from-white/32 dark:to-transparent opacity-70"
                      />
                    </span>
                  )}
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute bottom-[3px] left-1/2 -translate-x-1/2 h-[2px] w-3 rounded-full bg-blue-600/85 dark:bg-[#00D2FF]/85 transition-opacity duration-150 ${
                        hoveredSectionId && hoveredSectionId !== link.id ? 'opacity-90' : 'opacity-0'
                      }`}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* ACTIONS DESKTOP (Theme, Lang, Contact, Admin) */}
          <div className="hidden items-center gap-1 lg:gap-1.5 xl:gap-2 md:flex shrink-0">
            <button
              type="button"
              onClick={() => mounted && setTheme(isDark ? 'light' : 'dark')}
              className="group relative flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center overflow-hidden rounded-full text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white bg-white/75 [background-image:linear-gradient(180deg,rgba(255,255,255,0.85)_0%,rgba(241,245,249,0.45)_100%)] border border-black/10 shadow-[0_2px_8px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.92)] hover:border-black/15 hover:bg-white/95 dark:bg-white/[0.06] dark:[background-image:linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_100%)] dark:border-white/12 dark:shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.18)] dark:hover:border-white/22 dark:hover:bg-white/[0.11] backdrop-blur-xl transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF]"
              aria-label={mounted ? (isDark ? t('nav.themeDay') : t('nav.themeNight')) : t('nav.themeDay')}
            >
              <Sun className="hidden dark:block h-3.5 w-3.5 lg:h-4 lg:w-4 transition-transform duration-500 group-hover:rotate-90 group-hover:text-amber-400" aria-hidden="true" />
              <Moon className="block dark:hidden h-3.5 w-3.5 lg:h-4 lg:w-4 transition-transform duration-500 group-hover:-rotate-12 group-hover:text-blue-600" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className="group relative flex h-8 lg:h-9 items-center gap-1 lg:gap-1.5 rounded-full px-2 lg:px-3 text-[11px] lg:text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white bg-white/75 [background-image:linear-gradient(180deg,rgba(255,255,255,0.85)_0%,rgba(241,245,249,0.45)_100%)] border border-black/10 shadow-[0_2px_8px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.92)] hover:border-black/15 hover:bg-white/95 dark:bg-white/[0.06] dark:[background-image:linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_100%)] dark:border-white/12 dark:shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.18)] dark:hover:border-white/22 dark:hover:bg-white/[0.11] backdrop-blur-xl transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF]"
              aria-label={t('nav.langToggle')}
            >
              <Languages className="h-3 w-3 lg:h-3.5 lg:w-3.5 transition-transform duration-300 group-hover:scale-110" />
              <span>{locale === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            <Link
              href="/#contact"
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  scrollToElementById('contact');
                }
                handleSelectSegment(portfolioSections[6]?.name || t('nav.contact'), { sectionId: 'contact' });
              }}
              className="relative group overflow-hidden rounded-full p-[1px] shrink-0 transition-transform duration-200 ease-[var(--ease-out)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500/60 to-blue-600 dark:from-[#00D2FF] dark:via-[#00D2FF]/50 dark:to-[#00D2FF] rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-200"></span>
              <span className="relative block px-2.5 lg:px-3 xl:px-4 py-1 lg:py-1.5 rounded-full bg-white dark:bg-[#0A0C10] text-[11px] lg:text-xs font-semibold whitespace-nowrap text-zinc-900 dark:text-white transition-colors duration-200 group-hover:bg-transparent group-hover:text-white dark:group-hover:text-[#050505]">
                {t('nav.contact')}
              </span>
            </Link>

            <Link
              href="/admin/login"
              className="group relative flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center overflow-hidden rounded-full text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white bg-white/75 [background-image:linear-gradient(180deg,rgba(255,255,255,0.85)_0%,rgba(241,245,249,0.45)_100%)] border border-black/10 shadow-[0_2px_8px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.92)] hover:border-black/15 hover:bg-white/95 dark:bg-white/[0.06] dark:[background-image:linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.03)_100%)] dark:border-white/12 dark:shadow-[0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.18)] dark:hover:border-white/22 dark:hover:bg-white/[0.11] backdrop-blur-xl transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF]"
              aria-label={t('nav.admin')}
            >
              <Lock className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* CAPSULE DE SECTION ACTIVE MOBILE */}
          <div
            className="flex items-center gap-1.5 rounded-full border border-black/10 dark:border-white/12 bg-white/75 dark:bg-white/[0.06] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_8px_rgba(0,0,0,0.25)] px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-200 md:hidden transition-colors duration-200"
          >
            <ActiveIcon className="h-3.5 w-3.5 text-blue-600 dark:text-[#00D2FF] flex-shrink-0 transition-transform duration-300" />
            <span className="tracking-tight font-medium text-[11px] max-w-[115px] truncate">
              {activeSegment}
            </span>
          </div>
        </div>
      </header>

      {/* FLOATING MOBILE DOCK & CONTEXTUAL DRAWER */}
      <MobileNavDock
        activeSegment={activeSegment}
        onSelectSegment={handleSelectSegment}
        isHudOpen={isMobileHudOpen}
        onToggleHud={() => setIsMobileHudOpen(!isMobileHudOpen)}
        hudTriggerRef={hudTriggerRef}
        scrollDirection={scrollDirection}
      />

      <MobileHudDrawer
        isOpen={isMobileHudOpen}
        onClose={() => setIsMobileHudOpen(false)}
        triggerRef={hudTriggerRef}
        activeSegment={activeSegment}
        onSelectSegment={handleSelectSegment}
      />
    </>
  );
}