'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Home, User, GraduationCap, Briefcase, FolderGit2, Cpu, SlidersHorizontal, Plus } from 'lucide-react';
import { useLanguage } from '../theme/LanguageProvider';
import { useTheme } from 'next-themes';

interface MobileNavDockProps {
  activeSegment: string;
  onSelectSegment: (segmentName: string) => void;
  isHudOpen: boolean;
  onToggleHud: () => void;
  hudTriggerRef: React.RefObject<HTMLButtonElement | null>;
}

export default function MobileNavDock({
  activeSegment,
  onSelectSegment,
  isHudOpen,
  onToggleHud,
  hudTriggerRef,
}: MobileNavDockProps) {
  const { t } = useLanguage();
  const { theme, resolvedTheme } = useTheme();
  const [isTouch, setIsTouch] = useState(false);
  const navRef = React.useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // Défilement doux automatique du dock pour centrer le segment actif sur les écrans étroits
  useEffect(() => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector<HTMLElement>('[aria-current="page"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeSegment]);

  const isDark = resolvedTheme ? resolvedTheme === 'dark' : (theme ? theme === 'dark' : true);

  const primaryItems = [
    {
      id: 'home',
      name: t('nav.home'),
      href: '#home',
      code: '01',
      icon: Home,
    },
    {
      id: 'profile',
      name: t('nav.about'),
      href: '#profile',
      code: '02',
      icon: User,
    },
    {
      id: 'academic',
      name: t('nav.academic'),
      href: '#academic',
      code: '03',
      icon: GraduationCap,
    },
    {
      id: 'experience',
      name: t('nav.experience'),
      href: '#experience',
      code: '04',
      icon: Briefcase,
    },
    {
      id: 'projects',
      name: t('nav.projects'),
      href: '#projects',
      code: '05',
      icon: FolderGit2,
    },
    {
      id: 'skills',
      name: t('nav.skills'),
      href: '#skills',
      code: '06',
      icon: Cpu,
    },
  ];

  return (
    <aside
      aria-label="Navigation flottante mobile"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 md:hidden flex justify-center pointer-events-none px-2"
    >
      <nav
        ref={navRef}
        role="navigation"
        aria-label="Dock de navigation principal"
        className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 rounded-full p-1 sm:p-1.5 transition-all duration-500 overflow-x-auto max-w-[calc(100vw-1rem)] scrollbar-none"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.60) 100%)',
          backgroundColor: isDark
            ? 'rgba(10, 10, 14, 0.75)'
            : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: isTouch ? 'blur(12px) saturate(1.5)' : 'blur(20px) saturate(1.8)',
          WebkitBackdropFilter: isTouch ? 'blur(12px) saturate(1.5)' : 'blur(20px) saturate(1.8)',
          border: isDark
            ? '1px solid rgba(0, 210, 255, 0.25)'
            : '1px solid rgba(0, 210, 255, 0.30)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 0 0 0.5px rgba(255, 255, 255, 0.08), 0 0 20px rgba(0, 210, 255, 0.10)'
            : '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 0 0 0.5px rgba(255, 255, 255, 0.8), 0 0 16px rgba(0, 210, 255, 0.12)',
        }}
      >
        {primaryItems.map((item) => {
          const isActive = activeSegment === item.name;
          const Icon = item.icon;

          return (
            <a
              key={item.id}
              href={item.href}
              onClick={() => onSelectSegment(item.name)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.code} ${item.name}`}
              className={`group relative flex h-12 min-h-[48px] min-w-[36px] sm:min-w-[42px] flex-col items-center justify-center rounded-full px-1.5 sm:px-2 flex-shrink-0 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-95 ${
                isActive ? 'text-zinc-900 dark:text-white font-semibold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {/* INDICATEUR DE SÉLECTION ACTIF APPLE LIQUID GLASS */}
              {isActive && (
                <motion.div
                  layoutId="mobile-dock-active-pill"
                  transition={{
                    type: shouldReduceMotion ? false : 'spring',
                    stiffness: 450,
                    damping: 35,
                  }}
                  className="absolute inset-0 z-0 rounded-full"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(0, 210, 255, 0.28) 0%, rgba(0, 210, 255, 0.08) 100%)'
                      : 'linear-gradient(135deg, rgba(0, 180, 255, 0.20) 0%, rgba(0, 180, 255, 0.06) 100%)',
                    border: isDark
                      ? '1px solid rgba(0, 210, 255, 0.45)'
                      : '1px solid rgba(0, 180, 255, 0.35)',
                    boxShadow: isDark
                      ? '0 0 12px rgba(0, 210, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.20)'
                      : '0 0 10px rgba(0, 180, 255, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.90)',
                    backdropFilter: 'blur(8px)',
                  }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <Icon className={`h-4 w-4 transition-transform duration-300 ${
                  isActive ? 'scale-110 text-cyan-600 dark:text-cyan-300 drop-shadow-[0_0_8px_rgba(0,210,255,0.4)]' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                }`} />
                <span className="font-mono text-[9px] tracking-tight mt-0.5 font-medium">
                  {item.code}
                </span>

                {/* CYAN LED INDICATOR */}
                {isActive && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#00D2FF]" />
                )}
              </div>
            </a>
          );
        })}

        {/* SÉPARATEUR TACTIQUE SCADA */}
        <div className="h-6 w-[1px] bg-black/10 dark:bg-white/10 mx-0.5 flex-shrink-0" aria-hidden="true" />

        {/* DÉCLENCHEUR DU PUPITRE HUD (Cible >= 48x48px) */}
        <button
          ref={hudTriggerRef}
          type="button"
          onClick={onToggleHud}
          aria-haspopup="dialog"
          aria-expanded={isHudOpen}
          aria-controls="mobile-hud-drawer"
          aria-label={isHudOpen ? 'Fermer la console HUD' : 'Ouvrir la console HUD'}
          className={`group relative flex h-12 min-h-[48px] min-w-[38px] sm:min-w-[44px] flex-col items-center justify-center rounded-full px-1.5 sm:px-2 flex-shrink-0 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-95 ${
            isHudOpen
              ? 'border border-cyan-400/60 bg-cyan-500/20 text-cyan-700 dark:text-white shadow-[0_0_16px_rgba(0,210,255,0.3)]'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <div className="flex flex-col items-center">
            {isHudOpen ? (
              <SlidersHorizontal className="h-4 w-4 text-cyan-600 dark:text-cyan-300 transition-transform duration-300" />
            ) : (
              <Plus className="h-4 w-4 text-zinc-600 dark:text-zinc-300 transition-transform duration-300 group-hover:rotate-90 group-hover:text-cyan-500 dark:group-hover:text-cyan-400" />
            )}
            <span className="font-mono text-[9px] tracking-tight mt-0.5 text-cyan-600 dark:text-cyan-400 font-bold">
              HUD
            </span>
          </div>
        </button>
      </nav>
    </aside>
  );
}
