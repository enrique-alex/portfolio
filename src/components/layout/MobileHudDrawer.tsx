'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  X, 
  Sun, 
  Moon, 
  Languages, 
  Lock, 
  User, 
  GraduationCap, 
  Cpu, 
  Send, 
  Home, 
  FolderGit2, 
  Briefcase,
  ChevronRight,
  Sliders,
  Terminal
} from 'lucide-react';
import { useLanguage } from '../theme/LanguageProvider';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';

interface MobileHudDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  activeSegment: string;
  onSelectSegment: (segmentName: string) => void;
}

export default function MobileHudDrawer({
  isOpen,
  onClose,
  triggerRef,
  activeSegment,
  onSelectSegment,
}: MobileHudDrawerProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef<boolean>(false);

  const isDark = resolvedTheme ? resolvedTheme === 'dark' : (theme ? theme === 'dark' : true);

  // Verrouillage universel du scroll body lors de l'ouverture avec isolation du conteneur
  useLockBodyScroll(isOpen, drawerRef);

  // Gestion du focus trap et de la touche Escape pour conformité WCAG 2.1 AA/AAA
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!drawerRef.current) return;
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Si le focus est hors du tiroir, le ramener immédiatement sur le premier élément
        if (!drawerRef.current.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
          return;
        }

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      window.addEventListener('keydown', handleKeyDown);
      // Auto-focus sur le bouton de fermeture à l'ouverture pour une navigation clavier immédiate
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    } else if (wasOpenRef.current) {
      // Restauration du focus sur le déclencheur UNIQUEMENT lors d'une fermeture (jamais au chargement initial)
      wasOpenRef.current = false;
      triggerRef?.current?.focus();
    }
  }, [isOpen, handleKeyDown, triggerRef]);

  const secondaryLinks = [
    {
      code: '04/PRF',
      name: t('nav.about'),
      href: '/#profile',
      desc: locale === 'fr' ? 'Ingénierie & Vision' : 'Engineering & Vision',
      icon: User,
    },
    {
      code: '05/ACD',
      name: t('nav.academic'),
      href: '/#academic',
      desc: locale === 'fr' ? 'Polytech Lille & Formation' : 'Polytech Lille & Education',
      icon: GraduationCap,
    },
    {
      code: '06/SKL',
      name: t('nav.skills'),
      href: '/#skills',
      desc: locale === 'fr' ? 'SCADA, PLCs & Logiciel' : 'SCADA, PLCs & Software',
      icon: Cpu,
    },
  ];

  const primaryShortcuts = [
    { code: '01', name: t('nav.home'), href: '/#home', icon: Home },
    { code: '02', name: t('nav.projects'), href: '/#projects', icon: FolderGit2 },
    { code: '03', name: t('nav.experience'), href: '/#experience', icon: Briefcase },
  ];

  const handleLinkClick = (name: string) => {
    onSelectSegment(name);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
          {/* BACKDROP FLUIDE & TACTILE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            style={{ touchAction: 'none' }}
            aria-hidden="true"
          />

          {/* TIROIR HUD CONTEXTUEL (Apple Liquid Glass SCADA Cockpit) */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={locale === 'fr' ? 'Console Système // Pupitre HUD' : 'System Console // HUD Operator'}
            id="mobile-hud-drawer"
            tabIndex={-1}
            initial={{ y: '100%', opacity: 0, z: 0 }}
            animate={{ y: 0, opacity: 1, z: 0 }}
            exit={{ y: '100%', opacity: 0, z: 0 }}
            transition={{
              type: shouldReduceMotion ? false : 'spring',
              damping: 30,
              stiffness: 350,
              mass: 0.8,
            }}
            className="relative z-10 w-full max-h-[88vh] max-h-[88dvh] overflow-y-auto rounded-t-[28px] border-t border-cyan-500/30 dark:border-cyan-400/25 bg-white/90 dark:bg-[#08080b]/95 text-zinc-900 dark:text-zinc-100 shadow-[0_-12px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_-12px_48px_rgba(0,210,255,0.14)] overscroll-contain backdrop-blur-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            style={{
              willChange: 'transform, opacity',
              backdropFilter: 'blur(24px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
              boxShadow: isDark
                ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 -12px 48px rgba(0,210,255,0.14)'
                : 'inset 0 1px 0 rgba(255,255,255,0.95), 0 -12px 48px rgba(0,0,0,0.10)',
            }}
          >
            {/* LINGOT DE DRAG SUPÉRIEUR */}
            <div className="flex w-full items-center justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-black/20 dark:bg-white/20" />
            </div>

            <div className="px-5 pt-2 pb-6 space-y-6">
              {/* EN-TÊTE COCKPIT SCADA & TÉLÉMÉTRIE */}
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-semibold">
                      <Terminal className="h-3 w-3" />
                      <span>HUD // SYS.OPERATOR</span>
                    </div>
                    <p className="text-xs font-semibold tracking-tight text-zinc-700 dark:text-white/90">
                      {locale === 'fr' ? 'Console Système & Navigation' : 'System Console & Navigation'}
                    </p>
                  </div>
                </div>

                {/* BOUTON FERMER (Cible >= 48x48px) */}
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label={locale === 'fr' ? 'Fermer la console HUD' : 'Close HUD console'}
                  className="group relative flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 transition-all hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-zinc-900 dark:hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <X className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90 text-zinc-600 dark:text-zinc-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-300" />
                </button>
              </div>

              {/* ACCÈS RAPIDES PRIMAIRES */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  {locale === 'fr' ? '// Raccourcis Principaux' : '// Primary Shortcuts'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {primaryShortcuts.map((item) => {
                    const isActive = activeSegment === item.name;
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.code}
                        href={item.href}
                        onClick={() => handleLinkClick(item.name)}
                        className={`flex min-h-[48px] flex-col items-center justify-center rounded-xl border p-2 text-center transition-all active:scale-95 ${
                          isActive
                            ? 'border-cyan-500/60 dark:border-cyan-400/60 bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                            : 'border-black/5 dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 hover:border-black/15 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-mono text-[9px] text-zinc-500 dark:text-zinc-400">
                          <span>{item.code}</span>
                        </div>
                        <div className="flex items-center gap-1 font-medium text-xs mt-0.5">
                          <Icon className="h-3.5 w-3.5" />
                          <span>{item.name}</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* SECTIONS SECONDAIRES HUD (Cibles tactiles >= 48px) */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  {locale === 'fr' ? "// Modules d'Ingénierie Spécialisés" : '// Specialized Engineering Modules'}
                </p>
                <div className="flex flex-col gap-2">
                  {secondaryLinks.map((link) => {
                    const isActive = activeSegment === link.name;
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.code}
                        href={link.href}
                        onClick={() => handleLinkClick(link.name)}
                        className={`group relative flex min-h-[52px] items-center justify-between rounded-xl border px-3.5 py-2.5 transition-all active:scale-[0.98] ${
                          isActive
                            ? 'border-cyan-500/60 dark:border-cyan-400/60 bg-cyan-500/15 text-zinc-900 dark:text-white shadow-[0_0_16px_rgba(0,210,255,0.18)]'
                            : 'border-black/5 dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 hover:border-black/15 dark:hover:border-white/15 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                            isActive
                              ? 'border-cyan-500/50 dark:border-cyan-400/50 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                              : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
                                [{link.code}]
                              </span>
                              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-white">
                                {link.name}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {link.desc}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                          isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-zinc-400 dark:text-zinc-500'
                        }`} />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* TÉLÉMÉTRIE & PARAMÈTRES SYSTÈME */}
              <div>
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  <Sliders className="h-3 w-3" />
                  {locale === 'fr' ? '// Télémesure & Configuration' : '// Telemetry & Settings'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {/* SÉLECTEUR DE THÈME */}
                  <button
                    type="button"
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className="flex min-h-[48px] flex-col items-center justify-center rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.03] p-2 text-zinc-700 dark:text-zinc-300 transition-all hover:border-cyan-400/40 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white active:scale-95"
                    aria-label={isDark ? t('nav.themeDay') : t('nav.themeNight')}
                  >
                    {isDark ? (
                      <Sun className="h-4 w-4 text-amber-400 mb-1" />
                    ) : (
                      <Moon className="h-4 w-4 text-cyan-500 mb-1" />
                    )}
                    <span className="font-mono text-[10px]">
                      {isDark ? (locale === 'fr' ? 'JOUR' : 'DAY') : (locale === 'fr' ? 'NUIT' : 'NIGHT')}
                    </span>
                  </button>

                  {/* SÉLECTEUR DE LANGUE */}
                  <button
                    type="button"
                    onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
                    className="flex min-h-[48px] flex-col items-center justify-center rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.03] p-2 text-zinc-700 dark:text-zinc-300 transition-all hover:border-cyan-400/40 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white active:scale-95"
                    aria-label={locale === 'fr' ? 'Switch to English (EN)' : 'Passer en Français (FR)'}
                  >
                    <Languages className="h-4 w-4 text-brand-blue mb-1" />
                    <span className="font-mono text-[10px] font-bold">
                      {locale === 'fr' ? 'EN' : 'FR'}
                    </span>
                  </button>

                  {/* LIEN ADMINISTRATION */}
                  <Link
                    href="/admin/login"
                    onClick={onClose}
                    className="flex min-h-[48px] flex-col items-center justify-center rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.03] p-2 text-zinc-700 dark:text-zinc-300 transition-all hover:border-cyan-400/40 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white active:scale-95"
                    aria-label="Accès administrateur"
                  >
                    <Lock className="h-4 w-4 text-zinc-600 dark:text-zinc-400 mb-1" />
                    <span className="font-mono text-[10px]">ADMIN</span>
                  </Link>
                </div>
              </div>

              {/* BOUTON TRANSMISSION PRIORITAIRE (CONTACT) */}
              <div className="pt-1">
                <a
                  href="#contact"
                  onClick={() => handleLinkClick(t('nav.contact'))}
                  className="group relative flex min-h-[50px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-cyan-500/60 dark:border-cyan-400/60 bg-gradient-to-r from-cyan-500/15 via-brand-blue/20 to-cyan-500/15 dark:from-cyan-500/20 dark:via-brand-blue/30 dark:to-cyan-500/20 px-5 py-3 font-semibold text-sm text-cyan-800 dark:text-cyan-200 shadow-[0_0_24px_rgba(0,210,255,0.2)] transition-all active:scale-[0.98] hover:text-zinc-900 dark:hover:text-white hover:border-cyan-500 dark:hover:border-cyan-400"
                >
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  <span className="font-mono tracking-wider text-xs uppercase">
                    {t('nav.contact')} {'// Signal Uplink'}
                  </span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
