'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Languages, Lock } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../theme/LanguageProvider';
import { Logo } from '../ui/Logo';
import Link from 'next/link';
import MobileNavDock from './MobileNavDock';
import MobileHudDrawer from './MobileHudDrawer';

function useNavLinks() {
  const { t } = useLanguage();
  return useMemo(() => [
    { name: t('nav.home'), href: '/#home' },
    { name: t('nav.about'), href: '/#profile' },
    { name: t('nav.academic'), href: '/#academic' },
    { name: t('nav.experience'), href: '/#experience' },
    { name: t('nav.projects'), href: '/#projects' },
    { name: t('nav.skills'), href: '/#skills' },
  ], [t]);
}

export default function Navbar() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const NAV_LINKS = useNavLinks();
  const { locale, setLocale, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileHudOpen, setIsMobileHudOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState(t('nav.home'));
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Refs for the pill indicator & HUD trigger
  const navRef = useRef<HTMLElement>(null);
  const hudTriggerRef = useRef<HTMLButtonElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Intersection Observer to update active navigation segment on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const matchingLink = NAV_LINKS.find((l) => l.href.replace('/', '') === `#${entry.target.id}`);
            if (matchingLink) {
              setActiveSegment(matchingLink.name);
            }
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px' } 
    );

    const timeoutId = setTimeout(() => {
      NAV_LINKS.forEach((link) => {
        const hash = link.href.replace('/', '');
        if (!hash.startsWith('#')) return;
        const sect = document.querySelector(hash);
        if (sect) observer.observe(sect);
      });
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [NAV_LINKS, pathname]);

  // Animate pill position to active link
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
        className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-700 ease-out ${
          isScrolled ? 'pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]' : 'pb-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))]'
        }`}
      >
        <div 
          className={`mx-auto flex items-center justify-between transition-all duration-700 ease-out relative z-50 ${
            isScrolled 
              ? 'max-w-6xl gap-4 lg:gap-8 rounded-[22px] px-6 py-2.5' 
              : 'max-w-7xl bg-transparent px-6 lg:px-12 py-2'
          }`}
          style={isScrolled ? {
            background: mounted && theme === 'dark' 
              ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.5) 100%)',
            backdropFilter: isTouch ? 'blur(12px) saturate(1.4)' : 'blur(24px) saturate(1.6)',
            WebkitBackdropFilter: isTouch ? 'blur(12px) saturate(1.4)' : 'blur(24px) saturate(1.6)',
            boxShadow: mounted && theme === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 0.5px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.8)',
          } : undefined}
        >
          
          {/* LOGO */}
          <a 
            href="#home" 
            className="group relative z-50 flex items-center gap-2.5 text-xl font-bold tracking-tighter text-zinc-900 transition-all hover:opacity-90 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg py-1 px-1.5 -ml-1.5"
            onClick={() => setActiveSegment(NAV_LINKS[0]?.name || 'Accueil')}
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
            {/* Sliding Pill Indicator (animated) */}
            <motion.div 
              className="absolute top-0 h-full rounded-full z-0"
              animate={{ left: pillStyle.left, width: pillStyle.width }}
              transition={{ duration: shouldReduceMotion ? 0 : undefined, type: shouldReduceMotion ? false : 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
              style={{
                background: mounted && theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)'
                  : 'linear-gradient(135deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 100%)',
                boxShadow: mounted && theme === 'dark'
                  ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.2)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06)',
                border: mounted && theme === 'dark'
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(0,0,0,0.04)',
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
                  onClick={() => setActiveSegment(link.name)}
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
            {/* THEME TOGGLE */}
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-zinc-500 transition-all duration-300 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white"
                style={{
                  background: mounted && theme === 'dark'
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                  border: mounted && theme === 'dark'
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(0,0,0,0.06)',
                  backdropFilter: 'blur(12px)',
                }}
                aria-label="Changer de thème"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90 group-hover:text-brand-yellow" />
                ) : (
                  <Moon className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-12 group-hover:text-brand-blue" />
                )}
              </button>
            )}

            {/* LANGUAGE TOGGLE */}
            <button
              type="button"
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className="group relative flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-zinc-500 transition-all duration-300 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white"
              style={{
                background: mounted && theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                  : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                border: mounted && theme === 'dark'
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(0,0,0,0.06)',
                backdropFilter: 'blur(12px)',
              }}
              aria-label={locale === 'fr' ? "Switch to English (EN)" : "Passer en Français (FR)"}
            >
              <Languages className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
              <span>{locale === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            {/* CONTACT CTA */}
            <a
              href="#contact"
              className="relative group overflow-hidden rounded-full p-[1px] focus:outline-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-blue/50 to-brand-blue rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative block px-4 py-1.5 rounded-full bg-white dark:bg-[#0a0a0a] text-xs font-semibold text-zinc-900 dark:text-white transition-colors duration-300 group-hover:bg-transparent group-hover:text-white">
                {t('nav.contact')}
              </span>
            </a>

            {/* ADMIN LOGIN ICON */}
            <Link
              href="/admin/login"
              className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-zinc-500 transition-all duration-300 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white"
              style={{
                background: mounted && theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                  : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                border: mounted && theme === 'dark'
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(0,0,0,0.06)',
                backdropFilter: 'blur(12px)',
              }}
              aria-label="Accès administrateur"
            >
              <Lock className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* INDICATEUR D'ÉTAT MOBILE ÉPURÉ (Zéro burger encombrant, cockpit fluide) */}
          <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-[11px] font-mono text-cyan-400 md:hidden">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            <span className="tracking-widest uppercase font-semibold">ONLINE</span>
          </div>
        </div>
      </header>

      {/* FLOATING MOBILE DOCK & CONTEXTUAL HUD DRAWER (Découplé du header pour isoler le stacking context) */}
      <MobileNavDock
        activeSegment={activeSegment}
        onSelectSegment={(seg) => setActiveSegment(seg)}
        isHudOpen={isMobileHudOpen}
        onToggleHud={() => setIsMobileHudOpen(!isMobileHudOpen)}
        hudTriggerRef={hudTriggerRef}
      />

      <MobileHudDrawer
        isOpen={isMobileHudOpen}
        onClose={() => setIsMobileHudOpen(false)}
        triggerRef={hudTriggerRef}
        activeSegment={activeSegment}
        onSelectSegment={(seg) => setActiveSegment(seg)}
      />
    </>
  );
}