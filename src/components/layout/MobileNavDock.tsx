'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Home, FolderGit2, Briefcase, SlidersHorizontal, Plus } from 'lucide-react';
import { useLanguage } from '../theme/LanguageProvider';

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
  const shouldReduceMotion = useReducedMotion();

  const primaryItems = [
    {
      id: 'home',
      name: t('nav.home'),
      href: '#home',
      code: '01',
      icon: Home,
    },
    {
      id: 'projects',
      name: t('nav.projects'),
      href: '#projects',
      code: '02',
      icon: FolderGit2,
    },
    {
      id: 'experience',
      name: t('nav.experience'),
      href: '#experience',
      code: '03',
      icon: Briefcase,
    },
  ];

  return (
    <aside
      aria-label="Navigation flottante mobile"
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 md:hidden pointer-events-auto"
      style={{
        transform: 'translate3d(-50%, 0, 0)',
        contain: 'layout style paint',
        willChange: 'transform',
      }}
    >
      <nav
        role="navigation"
        aria-label="Dock de navigation principal"
        className="flex items-center gap-1.5 rounded-full border border-cyan-500/25 bg-[#050505]/90 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_24px_rgba(0,210,255,0.12)] backdrop-blur-xl"
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
              className={`group relative flex h-12 min-h-[48px] min-w-[54px] flex-col items-center justify-center rounded-full px-2.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-95 ${
                isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {/* INDICATEUR DE SÉLECTION ACTIF GPU-ACCELERATED */}
              {isActive && (
                <motion.div
                  layoutId="mobile-dock-active-pill"
                  transition={{
                    type: shouldReduceMotion ? false : 'spring',
                    stiffness: 450,
                    damping: 35,
                  }}
                  className="absolute inset-0 z-0 rounded-full bg-gradient-to-b from-cyan-500/25 to-cyan-500/10 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,210,255,0.25)]"
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <Icon className={`h-4 w-4 transition-transform duration-300 ${
                  isActive ? 'scale-110 text-cyan-300' : 'text-zinc-400 group-hover:text-zinc-200'
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
        <div className="h-6 w-[1px] bg-white/10 mx-0.5" aria-hidden="true" />

        {/* DÉCLENCHEUR DU PUPITRE HUD (Cible >= 48x48px) */}
        <button
          ref={hudTriggerRef}
          type="button"
          onClick={onToggleHud}
          aria-haspopup="dialog"
          aria-expanded={isHudOpen}
          aria-controls="mobile-hud-drawer"
          aria-label={isHudOpen ? 'Fermer la console HUD' : 'Ouvrir la console HUD'}
          className={`group relative flex h-12 min-h-[48px] min-w-[54px] flex-col items-center justify-center rounded-full px-2.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-95 ${
            isHudOpen
              ? 'border border-cyan-400/60 bg-cyan-500/25 text-white shadow-[0_0_16px_rgba(0,210,255,0.3)]'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex flex-col items-center">
            {isHudOpen ? (
              <SlidersHorizontal className="h-4 w-4 text-cyan-300 transition-transform duration-300" />
            ) : (
              <Plus className="h-4 w-4 text-zinc-300 transition-transform duration-300 group-hover:rotate-90 group-hover:text-cyan-400" />
            )}
            <span className="font-mono text-[9px] tracking-tight mt-0.5 text-cyan-400 font-bold">
              HUD
            </span>
          </div>
        </button>
      </nav>
    </aside>
  );
}
