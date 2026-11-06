'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Languages, Lock, Home, User, GraduationCap, Briefcase, FolderGit2, Cpu, Send } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../theme/LanguageProvider';
import { Logo } from '../ui/Logo';
import Link from 'next/link';
import MobileNavDock, { type SelectSegmentOptions } from './MobileNavDock';
import MobileHudDrawer from './MobileHudDrawer';

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
  const [activeSegment, setActiveSegment] = useState(t('nav.home'));

  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const hudTriggerRef = useRef<HTMLButtonElement>(null);
  const scrollLockRef = useRef<ProgrammaticScrollLock | null>(null);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollYRef = useRef(0);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  const isDark = resolvedTheme ? resolvedTheme === 'dark' : (theme ? theme === 'dark' : true);

  const currentSection = useMemo(() => {
    return portfolioSections.find((s) => s.name === activeSegment) || portfolioSections[0];
  }, [portfolioSections, activeSegment]);

  const ActiveIcon = currentSection?.icon || Home;

  // Synchronisation active lors d'un changement de langue
  const prevSectionsRef = useRef(portfolioSections);
  useEffect(() => {
    if (prevSectionsRef.current !== portfolioSections) {
      const prevActive = prevSectionsRef.current.find((s) => s.name === activeSegment);
      if (prevActive) {
        const newMatching = portfolioSections.find((s) => s.id === prevActive.id);
        if (newMatching) {
          setActiveSegment(newMatching.name);
        }
      }
      prevSectionsRef.current = portfolioSections;
    }
  }, [portfolioSections, activeSegment]);

  const handleSelectSegment = useCallback(
    (segmentName: string, options?: SelectSegmentOptions) => {
      const matched = portfolioSections.find((s) => s.name === segmentName);
      const targetId = options?.sectionId || matched?.id || 'home';
      const lockDuration = options?.fromScrub ? 1100 : 1200;

      scrollLockRef.current = {
        targetId,
        targetName: segmentName,
        expiresAt: Date.now() + lockDuration,
      };
      setActiveSegment(segmentName);

      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = setTimeout(() => {
        scrollLockRef.current = null;
      }, lockDuration);
    },
    [portfolioSections]
  );

  useEffect(() => {
    setMounted(true);
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
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
        setActiveSegment((prev) => (prev === active.name ? prev : active.name));
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

  // Animate desktop pill position to active link
  useEffect(() => {
    if (!navRef.current) return;
    const rafId = requestAnimationFrame(() => {
      if (!navRef.current) return;
      const activeEl = navRef.current.querySelector(`[data-segment="${activeSegment}"]`) as HTMLElement;
      if (activeEl) {
        const navRect = navRef.current.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        setPillStyle({
          left: elRect.left - navRect.left,
          width: elRect.width,
        });
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [activeSegment, mounted]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-500 ease-out ${
          isScrolled
            ? 'pb-2.5 pt-[calc(0.6rem+env(safe-area-inset-top,0px))]'
            : 'pb-4 md:pb-6 pt-[calc(1rem+env(safe-area-inset-top,0px))] md:pt-[calc(1.5rem+env(safe-area-inset-top,0px))]'
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-500 ease-out relative z-50 ${
            isScrolled
              ? 'max-w-6xl gap-4 lg:gap-8 rounded-[22px] mx-3 sm:mx-auto px-4 sm:px-6 py-2'
              : 'max-w-7xl bg-transparent px-5 sm:px-6 lg:px-12 py-1.5'
          }`}
          style={
            isScrolled
              ? {
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.5) 100%)',
                  backgroundColor: isDark ? 'rgba(10, 10, 14, 0.75)' : 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: isTouch ? 'blur(12px) saturate(1.4)' : 'blur(24px) saturate(1.6)',
                  WebkitBackdropFilter: isTouch ? 'blur(12px) saturate(1.4)' : 'blur(24px) saturate(1.6)',
                  boxShadow: isDark
                    ? '0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 0.5px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.8)',
                }
              : undefined
          }
        >
          {/* LOGO */}
          <a
            href="#home"
            className="group relative z-50 flex items-center gap-2.5 text-xl font-bold tracking-tighter text-zinc-900 transition-all hover:opacity-90 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg py-1 px-1.5 -ml-1.5"
            onClick={() => handleSelectSegment(portfolioSections[0]?.name || 'Accueil', { sectionId: 'home' })}
            aria-label="Enrique.Ndjakou"
          >
            <Logo className="h-7 w-7 text-zinc-900 transition-transform duration-300 group-hover:scale-105 group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-blue" />
            <span className="relative">
              Enrique<span className="text-brand-blue">.Ndjakou</span>
              <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-gradient-to-r from-brand-blue to-transparent transition-all duration-300 group-hover:w-full"></span>
            </span>
          </a>

          {/* NAVIGATION DESKTOP, Liquid Glass Segmented Control */}
          <nav ref={navRef} className="hidden items-center gap-2 md:flex relative">
            <motion.div
              className="absolute top-0 h-full rounded-full z-0"
              animate={{ left: pillStyle.left, width: pillStyle.width }}
              transition={{
                duration: shouldReduceMotion ? 0 : undefined,
                type: shouldReduceMotion ? false : 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.8,
              }}
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)'
                  : 'linear-gradient(135deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 100%)',
                boxShadow: isDark
                  ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.2)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.04)',
                backdropFilter: 'blur(12px)',
              }}
            />

            {NAV_LINKS.map((link) => {
              const isActive = activeSegment === link.name;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  data-segment={link.name}
                  onClick={() => handleSelectSegment(link.name, { sectionId: link.id })}
                  className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-white/60 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* ACTIONS DESKTOP (Theme, Lang, Contact, Admin) */}
          <div className="hidden items-center gap-2 md:flex">
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-zinc-500 transition-all duration-300 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                  backdropFilter: 'blur(12px)',
                }}
                aria-label={isDark ? t('nav.themeDay') : t('nav.themeNight')}
              >
                {isDark ? (
                  <Sun className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90 group-hover:text-brand-yellow" />
                ) : (
                  <Moon className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-12 group-hover:text-brand-blue" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className="group relative flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-zinc-500 transition-all duration-300 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                  : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                backdropFilter: 'blur(12px)',
              }}
              aria-label={locale === 'fr' ? 'Switch to English (EN)' : 'Passer en Français (FR)'}
            >
              <Languages className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
              <span>{locale === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            <a
              href="#contact"
              onClick={() =>
                handleSelectSegment(portfolioSections[6]?.name || t('nav.contact'), { sectionId: 'contact' })
              }
              className="relative group overflow-hidden rounded-full p-[1px] focus:outline-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-blue/50 to-brand-blue rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative block px-4 py-1.5 rounded-full bg-white dark:bg-[#0a0a0a] text-xs font-semibold text-zinc-900 dark:text-white transition-colors duration-300 group-hover:bg-transparent group-hover:text-white">
                {t('nav.contact')}
              </span>
            </a>

            <Link
              href="/admin/login"
              className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-zinc-500 transition-all duration-300 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                  : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                backdropFilter: 'blur(12px)',
              }}
              aria-label="Accès administrateur"
            >
              <Lock className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* CAPSULE DE SECTION ACTIVE MOBILE (Apple Liquid Glass sobre et synchronisée) */}
          <div
            className="flex items-center gap-1.5 rounded-full border border-black/8 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.06] px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-200 md:hidden transition-all duration-300"
            style={{
              backdropFilter: isTouch ? 'blur(12px) saturate(1.4)' : 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: isTouch ? 'blur(12px) saturate(1.4)' : 'blur(20px) saturate(1.8)',
              boxShadow: isDark
                ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.25)'
                : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <ActiveIcon className="h-3.5 w-3.5 text-brand-blue flex-shrink-0 transition-transform duration-300" />
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