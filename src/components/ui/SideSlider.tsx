'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * SideSlider - Minimalist High-End Navigation & Scroll Progress Slider
 *
 * Designed to strictly match the portfolio's Obsidian / Electric Cyan DA:
 * - Obsidian #050505 glassmorphic container with subtle white borders.
 * - Electric cyan #00D2FF / brand-blue glow thumb indicator.
 * - Auto-hides gracefully when viewing the 'Compétences' section (#skills).
 * - Interactive: Draggable thumb and clickable track for direct smooth scrolling.
 * - Cursor Isolation: Strict cursor-none enforcement ensures DualBodyCursor never reverts to OS pointer.
 * - Mobile safe: Exclusively active on devices with a fine pointer (mouse/trackpad).
 */
export default function SideSlider() {
  const shouldReduceMotion = useReducedMotion();
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isSkillsVisible, setIsSkillsVisible] = useState(false);
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

  // 3. Masquage automatique au niveau de la section Compétences (#skills)
  useEffect(() => {
    if (!isFinePointer) return;

    let observer: IntersectionObserver | null = null;
    const checkSkills = () => {
      const skillsElement = document.getElementById('skills');
      if (!skillsElement) return false;

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            setIsSkillsVisible(entry.isIntersecting);
          }
        },
        {
          root: null,
          threshold: [0, 0.05, 0.1, 0.5],
          rootMargin: '60px 0px 60px 0px',
        }
      );

      observer.observe(skillsElement);
      return true;
    };

    if (!checkSkills()) {
      const timer = setTimeout(checkSkills, 250);
      return () => {
        clearTimeout(timer);
        if (observer) observer.disconnect();
      };
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [isFinePointer]);

  // 4. Interaction Glisser-Déposer (Drag & Drop) et Clic sur la piste
  const scrollFromPointerY = useCallback((clientY: number, behavior: ScrollBehavior = 'instant') => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clampedY = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    const targetProgress = clampedY / rect.height;

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

    scrollFromPointerY(e.clientY, 'auto');

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      moveEvent.preventDefault();
      scrollFromPointerY(moveEvent.clientY, 'instant');
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const docElem = document.documentElement;
    const maxScroll = docElem.scrollHeight - window.innerHeight;
    const step = 200;

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      window.scrollBy({ top: -step, behavior: 'smooth' });
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      window.scrollBy({ top: step, behavior: 'smooth' });
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
    } else if (e.key === 'Home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      window.scrollTo({ top: maxScroll, behavior: 'smooth' });
    }
  };

  if (!isFinePointer) {
    return null;
  }

  // Calcul du placement du curseur sur la piste
  const TRACK_HEIGHT = 180;
  const THUMB_HEIGHT = 28;
  const maxThumbOffset = TRACK_HEIGHT - THUMB_HEIGHT;
  const thumbTop = scrollProgress * maxThumbOffset;
  const percentText = Math.round(scrollProgress * 100);

  return (
    <aside
      aria-label="Navigation latérale et progression du défilement"
      className={`fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 select-none cursor-none transition-all duration-300 ease-out ${
        isSkillsVisible
          ? 'opacity-0 pointer-events-none translate-x-6 scale-90'
          : 'opacity-100 pointer-events-auto translate-x-0 scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isDragging) setIsHovered(false);
      }}
    >
      <div className="relative flex items-center">
        {/* HUD Micro-Badge (pourcentage de défilement au survol ou pendant le drag) */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute right-full mr-3.5 flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-[#050505]/95 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.25)] backdrop-blur-md transition-all duration-200 ${
            isHovered || isDragging
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-2'
          }`}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
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
          aria-label={`Position de défilement : ${percentText}%`}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          style={{ height: `${TRACK_HEIGHT}px`, cursor: 'none' }}
          className="group relative flex w-3 sm:w-3.5 items-center justify-center rounded-full border border-black/10 bg-white/70 p-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md transition-colors duration-200 hover:border-cyan-500/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 dark:border-white/10 dark:bg-[#050505]/80 dark:shadow-[0_4px_24px_rgba(0,0,0,0.6)] cursor-none"
        >
          {/* Rail interne fin */}
          <div 
            aria-hidden="true"
            className="h-full w-0.5 rounded-full bg-black/10 transition-colors duration-200 group-hover:bg-cyan-500/20 dark:bg-white/10" 
          />

          {/* Curseur de défilement (Thumb) électrique Cyan Glow */}
          <div
            aria-hidden="true"
            style={{
              height: `${THUMB_HEIGHT}px`,
              transform: `translate3d(0, ${thumbTop}px, 0)`,
              transition: shouldReduceMotion || isDragging ? 'none' : 'transform 0.08s linear',
              cursor: 'none',
            }}
            className="absolute top-0 w-1.5 sm:w-2 rounded-full bg-gradient-to-b from-[#00D2FF] to-[#0088FF] shadow-[0_0_12px_rgba(0,210,255,0.8),0_0_2px_#FFFFFF] group-hover:scale-110 active:scale-95 cursor-none transition-transform duration-150"
          >
            {/* Ligne médiane de préhension */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
              <div className="h-2 w-0.5 rounded-full bg-white/80" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
