'use client';

import { useEffect, useRef, useState } from 'react';
import { frameManager } from '@/lib/graphics/FrameManager';
import { magneticManager } from '@/lib/graphics/MagneticManager';

const LERP_SPEED = 18; // Vitesse de convergence exponentielle continue

interface LegacyMediaQueryList {
  addListener?: (listener: (e: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (e: MediaQueryListEvent) => void) => void;
}

export default function DualBodyCursor() {
  const [isFinePointer, setIsFinePointer] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Coordonnées et statuts mutables haute fréquence - AUCUN useState dans la boucle
  const targetX = useRef(-100);
  const targetY = useRef(-100);
  const currentRingX = useRef(-100);
  const currentRingY = useRef(-100);
  const hasMoved = useRef(false);
  const isFrameSubscribed = useRef(false);
  const unsubscribeFrameRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Conditionner l'activation exclusivement à window.matchMedia('(pointer: fine)').matches
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) {
      // Sur mobile/tactile, le composant retourne null et n'attache aucun écouteur
      return;
    }

    setIsFinePointer(true);

    const handlePointerChange = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handlePointerChange);
    } else {
      const legacy = mediaQuery as unknown as LegacyMediaQueryList;
      legacy.addListener?.(handlePointerChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handlePointerChange);
      } else {
        const legacy = mediaQuery as unknown as LegacyMediaQueryList;
        legacy.removeListener?.(handlePointerChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!isFinePointer) return;

    const stopFrameLoop = () => {
      if (unsubscribeFrameRef.current) {
        unsubscribeFrameRef.current();
        unsubscribeFrameRef.current = null;
      }
      isFrameSubscribed.current = false;
    };

    const startFrameLoop = () => {
      if (isFrameSubscribed.current) return;
      isFrameSubscribed.current = true;

      unsubscribeFrameRef.current = frameManager.subscribe((dt: number) => {
        if (!hasMoved.current || !ringRef.current) return;

        if (frameManager.isReducedMotion) {
          currentRingX.current = targetX.current;
          currentRingY.current = targetY.current;
          ringRef.current.style.transform = `translate3d(${targetX.current}px, ${targetY.current}px, 0)`;
          stopFrameLoop();
          return;
        }

        const dx = targetX.current - currentRingX.current;
        const dy = targetY.current - currentRingY.current;
        const dist = Math.hypot(dx, dy);

        // Stabilisation : si la distance est inférieure à 0.1px, alignement direct et extinction de la boucle
        if (dist < 0.1) {
          currentRingX.current = targetX.current;
          currentRingY.current = targetY.current;
          ringRef.current.style.transform = `translate3d(${targetX.current}px, ${targetY.current}px, 0)`;
          stopFrameLoop();
          return;
        }

        // Damping inertiel exponentiel 1 - exp(-k * dt) dans la boucle FrameManager
        const clampedDt = Math.min(Math.max(dt || 0.0117, 0.001), 0.1);
        const lerpFactor = 1.0 - Math.exp(-LERP_SPEED * clampedDt);
        currentRingX.current += dx * lerpFactor;
        currentRingY.current += dy * lerpFactor;

        ringRef.current.style.transform = `translate3d(${currentRingX.current}px, ${currentRingY.current}px, 0)`;
      });
    };

    // Écouteur passif pour le déplacement souris
    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      targetX.current = x;
      targetY.current = y;
      magneticManager.setCursor(x, y);

      const isReEntering = !hasMoved.current || (dotRef.current && dotRef.current.style.opacity === '0');
      if (isReEntering) {
        hasMoved.current = true;
        currentRingX.current = x;
        currentRingY.current = y;

        // Positionnement immédiat avant d'afficher pour éviter tout flash ou swoop
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          dotRef.current.style.opacity = '1';
        }
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          ringRef.current.style.opacity = '1';
        }
        return;
      }

      // 1. Rendu DOM direct instantané sur #cur
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        if (dotRef.current.style.opacity !== '1') {
          dotRef.current.style.opacity = '1';
        }
      }

      if (ringRef.current && ringRef.current.style.opacity !== '1') {
        ringRef.current.style.opacity = '1';
      }

      // Si l'utilisateur préfère réduire les mouvements, le ring s'aligne directement sans Lerp
      if (frameManager.isReducedMotion) {
        currentRingX.current = x;
        currentRingY.current = y;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
        stopFrameLoop();
      } else {
        startFrameLoop();
      }
    };

    const onMouseLeave = () => {
      magneticManager.setCursor(-9999, -9999);
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
      stopFrameLoop();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        onMouseLeave();
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('blur', onMouseLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('blur', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stopFrameLoop();
    };
  }, [isFinePointer]);

  // Si sur mobile / tactile ou sans pointeur fin : aucun DOM rendu et aucun listener attaché
  if (!isFinePointer) {
    return null;
  }

  return (
    <>
      {/* #cur-dot : Point direct instantané */}
      <div
        id="cur-dot"
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 -ml-1 -mt-1 rounded-full bg-white opacity-0 transition-opacity duration-150"
        style={{
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      {/* #ring : Anneau suiveur lissé */}
      <div
        id="ring"
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-8 w-8 -ml-4 -mt-4 rounded-full border border-white opacity-0 transition-opacity duration-150"
        style={{
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
    </>
  );
}
