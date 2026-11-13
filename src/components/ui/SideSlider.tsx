'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useOptionalLanguage } from '../theme/LanguageProvider';
import { getScrollBehavior } from '@/lib/scroll';

/**
 * SideSlider - Minimalist Navigation & Scroll Progress Slider
 */
export default function SideSlider() {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useOptionalLanguage();
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // 1. Détection stricte pointer: fine (Desktop uniquement)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsFinePointer(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 2. Écoute du défilement de la page & calcul de la progression (0 à 1)
  const updateScrollProgress = useCallback(() => {
    const docElem = document.documentElement;
    const totalHeight = docElem.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) {
      setScrollProgress(0);
      return;
    }
    const currentScroll = window.scrollY;
    const progress = Math.min(Math.max(currentScroll / totalHeight, 0), 1);
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    if (!isFinePointer) return;

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, [isFinePointer, updateScrollProgress]);

  // 3. Interaction Glisser-Déposer (Drag & Drop) et Clic sur la piste
  const scrollFromPointerY = useCallback((clientY: number, behavior: ScrollBehavior = 'instant') => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const TRACK_HEIGHT = 180;
    const THUMB_HEIGHT = 28;
    const maxThumbOffset = TRACK_HEIGHT - THUMB_HEIGHT;

    const clampedY = Math.min(Math.max(clientY - rect.top - THUMB_HEIGHT / 2, 0), maxThumbOffset);
    const targetProgress = maxThumbOffset > 0 ? clampedY / maxThumbOffset : 0;

    const docElem = document.documentElement;
    const maxScroll = docElem.scrollHeight - window.innerHeight;
    const targetScroll = targetProgress * maxScroll;

    window.scrollTo({
      top: targetScroll,
      behavior,
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    setIsDragging(true);

    const targetEl = e.currentTarget;
    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch {
      // In case environment does not support pointer capture
    }

    scrollFromPointerY(e.clientY, 'auto');

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      moveEvent.preventDefault();
      scrollFromPointerY(moveEvent.clientY, 'instant');
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      isDraggingRef.current = false;
      setIsDragging(false);
      try {
        targetEl.releasePointerCapture(upEvent.pointerId);
      } catch {
        // Safe disposal
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Navigation au clavier accessible
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const docElem = document.documentElement;
    const maxScroll = docElem.scrollHeight - window.innerHeight;
    const step = 200;
    const scrollBehavior = getScrollBehavior();

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      window.scrollBy({ top: -step, behavior: scrollBehavior });
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      window.scrollBy({ top: step, behavior: scrollBehavior });
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      window.scrollBy({ top: -window.innerHeight * 0.8, behavior: scrollBehavior });
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: scrollBehavior });
    } else if (e.key === 'Home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: scrollBehavior });
    } else if (e.key === 'End') {
      e.preventDefault();
      window.scrollTo({ top: maxScroll, behavior: scrollBehavior });
    }
  };

  if (!isFinePointer) {
    return null;
  }

  const TRACK_HEIGHT = 180;
  const THUMB_HEIGHT = 28;
  const maxThumbOffset = TRACK_HEIGHT - THUMB_HEIGHT;
  const thumbTop = scrollProgress * maxThumbOffset;
  const percentText = Math.round(scrollProgress * 100);

  return (
    <aside
      aria-label={t('slider.ariaLabel')}
      className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 select-none cursor-none opacity-100 pointer-events-auto translate-x-0 scale-100 transition-[opacity,transform] duration-300 ease-out"
      style={{ cursor: 'none' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isDragging) setIsHovered(false);
      }}
    >
      <div className="relative flex items-center" style={{ cursor: 'none' }}>
        {/* HUD Micro-Badge (pourcentage de défilement au survol ou pendant le drag) */}
        <div
          aria-hidden="true"
          style={{ cursor: 'none' }}
          className={`pointer-events-none absolute right-full mr-3.5 flex items-center gap-1.5 rounded-lg border border-blue-600/25 bg-white/95 px-2.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-blue-700 shadow-sm dark:border-[#00D2FF]/25 dark:bg-[#050505]/95 dark:text-[#00D2FF] transition-[opacity,transform] duration-200 ${
            isHovered || isDragging
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-2'
          }`}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-[#00D2FF]" />
          <span>{percentText}%</span>
        </div>

        {/* Capsule Obsidian DA & Piste de Défilement */}
        <div
          ref={trackRef}
          role="scrollbar"
          tabIndex={0}
          aria-controls="main-content"
          aria-orientation="vertical"
          aria-valuenow={percentText}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${t('slider.progressLabel')} : ${percentText}%`}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          style={{ height: `${TRACK_HEIGHT}px`, cursor: 'none' }}
          className="group relative flex w-3 sm:w-3.5 items-center justify-center rounded-full border border-black/10 bg-white/85 p-0.5 shadow-md transition-colors duration-200 hover:border-blue-600/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-white/10 dark:bg-[#050505]/80 dark:hover:border-[#00D2FF]/40 dark:focus-visible:ring-[#00D2FF] cursor-none"
        >
          {/* Rail interne fin */}
          <div
            aria-hidden="true"
            style={{ cursor: 'none' }}
            className="h-full w-0.5 rounded-full bg-black/10 transition-colors duration-200 group-hover:bg-blue-600/20 dark:bg-white/10 dark:group-hover:bg-[#00D2FF]/25 cursor-none"
          />

          {/* Curseur de défilement (Thumb) Cyan */}
          <div
            aria-hidden="true"
            style={{
              height: `${THUMB_HEIGHT}px`,
              transform: `translate3d(0, ${thumbTop}px, 0)`,
              transition: shouldReduceMotion || isDragging ? 'none' : 'transform 0.08s linear',
              cursor: 'none',
            }}
            className="absolute top-0 w-1.5 sm:w-2 rounded-full bg-gradient-to-b from-[#00D2FF] to-[#0088FF] shadow-[0_0_8px_rgba(0,210,255,0.45)] group-hover:scale-110 active:scale-95 cursor-none transition-transform duration-150"
          >
            <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center" style={{ cursor: 'none' }}>
              <div className="h-2 w-0.5 rounded-full bg-white/80" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
