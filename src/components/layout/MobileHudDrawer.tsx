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
} from 'lucide-react';
import { useLanguage } from '../theme/LanguageProvider';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';
import type { SelectSegmentOptions } from './MobileNavDock';

interface MobileHudDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  activeSegment: string;
  onSelectSegment: (segmentName: string, options?: SelectSegmentOptions) => void;
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
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef?.current?.focus();
    }
  }, [isOpen, handleKeyDown, triggerRef]);

  const secondaryLinks = [
    {
      id: 'profile',
      name: t('nav.about'),
      href: '/#profile',
      desc: locale === 'fr' ? 'Ingénierie & Vision' : 'Engineering & Vision',
      icon: User,
    },
    {
      id: 'academic',
      name: t('nav.academic'),
      href: '/#academic',
      desc: locale === 'fr' ? 'Polytech Lille & Formation' : 'Polytech Lille & Education',
      icon: GraduationCap,
    },
    {
      id: 'skills',
      name: t('nav.skills'),
      href: '/#skills',
      desc: locale === 'fr' ? 'Embarqué, Robotique & Logiciel' : 'Embedded, Robotics & Software',
      icon: Cpu,
    },
  ];

  const primaryShortcuts = [
    { id: 'home', name: t('nav.home'), href: '/#home', icon: Home },
    { id: 'projects', name: t('nav.projects'), href: '/#projects', icon: FolderGit2 },
    { id: 'experience', name: t('nav.experience'), href: '/#experience', icon: Briefcase },
  ];

  const handleLinkClick = (name: string, sectionId: string) => {
    onSelectSegment(name, { sectionId });
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
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            style={{ touchAction: 'none' }}
            aria-hidden="true"
          />

          {/* TIROIR CONTEXTUEL iOS LIQUID GLASS */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={locale === 'fr' ? 'Navigation et réglages' : 'Navigation and settings'}
            id="mobile-hud-drawer"
            tabIndex={-1}
            initial={{ y: '100%', opacity: 0, z: 0 }}
            animate={{ y: 0, opacity: 1, z: 0 }}
            exit={{ y: '100%', opacity: 0, z: 0 }}
            transition={{
              type: shouldReduceMotion ? false : 'spring',
              damping: 32,
              stiffness: 360,
              mass: 0.8,
            }}
            className="relative z-10 w-full max-h-[86vh] max-h-[86dvh] overflow-y-auto rounded-t-[28px] border-t border-black/10 dark:border-white/10 bg-white/92 dark:bg-[#0a0a0e]/95 text-zinc-900 dark:text-zinc-100 overscroll-contain backdrop-blur-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            style={{
              willChange: 'transform, opacity',
              backdropFilter: 'blur(24px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
              boxShadow: isDark
                ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 -12px 48px rgba(0,0,0,0.6)'
                : 'inset 0 1px 0 rgba(255,255,255,0.95), 0 -12px 48px rgba(0,0,0,0.12)',
            }}
          >
            {/* POIGNÉE SUPÉRIEURE */}
            <div className="flex w-full items-center justify-center pt-3 pb-1">
              <div className="h-1.5 w-10 rounded-full bg-black/15 dark:bg-white/20" />
            </div>

            <div className="px-5 pt-2 pb-6 space-y-5">
              {/* EN-TÊTE SOBRE */}
              <div className="flex items-center justify-between border-b border-black/8 dark:border-white/8 pb-3">
                <div>
                  <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                    {locale === 'fr' ? 'Navigation & Préférences' : 'Navigation & Preferences'}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {locale === 'fr' ? 'Accès direct aux sections et réglages' : 'Direct section access and settings'}
                  </p>
                </div>

                {/* BOUTON FERMER (Cible >= 48x48px) */}
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label={locale === 'fr' ? 'Fermer le menu' : 'Close menu'}
                  className="group relative flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 transition-[transform,background-color,color] duration-150 ease-[var(--ease-out)] hover:bg-black/10 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                >
                  <X className="h-5 w-5 transition-transform duration-300 text-zinc-600 dark:text-zinc-300" />
                </button>
              </div>

              {/* ACCÈS RAPIDES PRIMAIRES */}
              <div>
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                  {locale === 'fr' ? 'Sections principales' : 'Primary sections'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {primaryShortcuts.map((item) => {
                    const isActive = activeSegment === item.name;
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={() => handleLinkClick(item.name, item.id)}
                        className={`flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center transition-[transform,border-color,background-color,color] duration-150 ease-[var(--ease-out)] active:scale-95 ${
                          isActive
                            ? 'border-brand-blue/40 bg-brand-blue/10 text-zinc-900 dark:text-white font-semibold'
                            : 'border-black/6 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 hover:border-black/15 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-brand-blue' : 'text-zinc-500 dark:text-zinc-400'}`} />
                        <span className="text-xs font-medium tracking-tight">{item.name}</span>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* SECTIONS COMPLÉMENTAIRES */}
              <div>
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                  {locale === 'fr' ? 'Parcours & Expertise' : 'Background & Expertise'}
                </p>
                <div className="flex flex-col gap-2">
                  {secondaryLinks.map((link) => {
                    const isActive = activeSegment === link.name;
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.id}
                        href={link.href}
                        onClick={() => handleLinkClick(link.name, link.id)}
                        className={`group relative flex min-h-[52px] items-center justify-between rounded-xl border px-3.5 py-2.5 transition-[transform,border-color,background-color,color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] ${
                          isActive
                            ? 'border-brand-blue/40 bg-brand-blue/10 text-zinc-900 dark:text-white'
                            : 'border-black/6 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 hover:border-black/15 dark:hover:border-white/15 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                              isActive
                                ? 'border-brand-blue/30 bg-brand-blue/15 text-brand-blue dark:text-white'
                                : 'border-black/8 dark:border-white/10 bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-white block">
                              {link.name}
                            </span>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {link.desc}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${
                            isActive ? 'text-brand-blue' : 'text-zinc-400 dark:text-zinc-500'
                          }`}
                        />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* PRÉFÉRENCES D'AFFICHAGE */}
              <div>
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                  {locale === 'fr' ? 'Préférences' : 'Preferences'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {/* SÉLECTEUR DE THÈME */}
                  <button
                    type="button"
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className="flex min-h-[48px] flex-col items-center justify-center rounded-xl border border-black/6 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] p-2 text-zinc-700 dark:text-zinc-300 transition-[transform,border-color,background-color,color] duration-150 ease-[var(--ease-out)] hover:border-black/15 dark:hover:border-white/20 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white active:scale-95"
                    aria-label={isDark ? t('nav.themeDay') : t('nav.themeNight')}
                  >
                    {isDark ? (
                      <Sun className="h-4 w-4 text-amber-400 mb-1" />
                    ) : (
                      <Moon className="h-4 w-4 text-brand-blue mb-1" />
                    )}
                    <span className="text-[11px] font-medium">
                      {isDark ? (locale === 'fr' ? 'Jour' : 'Light') : (locale === 'fr' ? 'Nuit' : 'Dark')}
                    </span>
                  </button>

                  {/* SÉLECTEUR DE LANGUE */}
                  <button
                    type="button"
                    onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
                    className="flex min-h-[48px] flex-col items-center justify-center rounded-xl border border-black/6 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] p-2 text-zinc-700 dark:text-zinc-300 transition-[transform,border-color,background-color,color] duration-150 ease-[var(--ease-out)] hover:border-black/15 dark:hover:border-white/20 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white active:scale-95"
                    aria-label={locale === 'fr' ? 'Switch to English (EN)' : 'Passer en Français (FR)'}
                  >
                    <Languages className="h-4 w-4 text-brand-blue mb-1" />
                    <span className="text-[11px] font-semibold">
                      {locale === 'fr' ? 'EN' : 'FR'}
                    </span>
                  </button>

                  {/* LIEN ADMINISTRATION */}
                  <Link
                    href="/admin/login"
                    onClick={onClose}
                    className="flex min-h-[48px] flex-col items-center justify-center rounded-xl border border-black/6 dark:border-white/8 bg-black/[0.02] dark:bg-white/[0.03] p-2 text-zinc-700 dark:text-zinc-300 transition-[transform,border-color,background-color,color] duration-150 ease-[var(--ease-out)] hover:border-black/15 dark:hover:border-white/20 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-white active:scale-95"
                    aria-label="Accès administrateur"
                  >
                    <Lock className="h-4 w-4 text-zinc-500 dark:text-zinc-400 mb-1" />
                    <span className="text-[11px] font-medium">Admin</span>
                  </Link>
                </div>
              </div>

              {/* BOUTON CONTACT DIRECT */}
              <div className="pt-1">
                <a
                  href="#contact"
                  onClick={() => handleLinkClick(t('nav.contact'), 'contact')}
                  className="group relative flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-zinc-900 dark:bg-white px-5 py-3 font-semibold text-sm text-white dark:text-zinc-900 transition-[transform,opacity] duration-150 ease-[var(--ease-out)] active:scale-[0.98] hover:opacity-95"
                >
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  <span>{t('nav.contact')}</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
