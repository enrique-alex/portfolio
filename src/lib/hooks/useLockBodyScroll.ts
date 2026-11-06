'use client';

import { useEffect, useRef } from 'react';

/**
 * useLockBodyScroll - Hook universel anti-fuite de défilement (Scroll Bleed)
 * et anti-effet ressort (Rubber-Banding) pour iOS WebKit et Android.
 *
 * Gèle le défilement de l'arrière-plan avec overscroll-behavior: contain
 * tout en neutralisant le décalage de layout lié à la scrollbar desktop/tablette.
 * Intercepte les événements touchmove non-passifs hors conteneur scrollable sur iOS WebKit.
 * Restaure l'état d'origine du DOM de manière atomique lors de la fermeture ou du démontage.
 */
export function useLockBodyScroll(
  isLocked: boolean,
  scrollContainerRef?: React.RefObject<HTMLElement | null>
): void {
  const originalStylesRef = useRef<{
    htmlOverflow: string;
    htmlOverscroll: string;
    bodyOverflow: string;
    bodyOverscroll: string;
    bodyPaddingRight: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isLocked) {
      if (originalStylesRef.current) {
        document.documentElement.style.overflow = originalStylesRef.current.htmlOverflow;
        document.documentElement.style.overscrollBehavior = originalStylesRef.current.htmlOverscroll;
        document.body.style.overflow = originalStylesRef.current.bodyOverflow;
        document.body.style.overscrollBehavior = originalStylesRef.current.bodyOverscroll;
        document.body.style.paddingRight = originalStylesRef.current.bodyPaddingRight;
        originalStylesRef.current = null;
      }
      return;
    }

    // Sauvegarde des styles précédents
    originalStylesRef.current = {
      htmlOverflow: document.documentElement.style.overflow,
      htmlOverscroll: document.documentElement.style.overscrollBehavior,
      bodyOverflow: document.body.style.overflow,
      bodyOverscroll: document.body.style.overscrollBehavior,
      bodyPaddingRight: document.body.style.paddingRight,
    };

    // Compensation de la largeur de la scrollbar pour prévenir le layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Verrouillage strict anti-défilement et anti-rubber-banding
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'contain';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'contain';

    // Interception des touchmove sur iOS WebKit pour neutraliser le scroll bleed d'arrière-plan
    const handleTouchMove = (e: TouchEvent) => {
      // Si un conteneur défilant est fourni et que le geste démarre dedans, on autorise le défilement interne
      if (scrollContainerRef?.current) {
        const target = e.target as Node | null;
        if (target && scrollContainerRef.current.contains(target)) {
          return;
        }
      }
      // Bloque tout glissement sur le backdrop ou l'arrière-plan non scrollable
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      if (originalStylesRef.current) {
        document.documentElement.style.overflow = originalStylesRef.current.htmlOverflow;
        document.documentElement.style.overscrollBehavior = originalStylesRef.current.htmlOverscroll;
        document.body.style.overflow = originalStylesRef.current.bodyOverflow;
        document.body.style.overscrollBehavior = originalStylesRef.current.bodyOverscroll;
        document.body.style.paddingRight = originalStylesRef.current.bodyPaddingRight;
        originalStylesRef.current = null;
      }
    };
  }, [isLocked, scrollContainerRef]);
}
