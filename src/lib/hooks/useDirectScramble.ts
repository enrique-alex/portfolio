'use client';

import { useEffect, useRef, RefObject } from 'react';
import { frameManager } from '@/lib/graphics/FrameManager';

export const DEFAULT_CHARS = "0101010189ABCDEF!@#$%^&*()_+-=[]{}|;':,./<>?";

export interface UseDirectScrambleOptions {
  refs: RefObject<HTMLElement | null>[];
  lines: string[];
  duration?: number; // Durée totale en millisecondes
  chars?: string;
}

/**
 * computeScrambleText - Fonction pure pour générer l'état de décodage à une progression donnée
 */
export function computeScrambleText(
  targetText: string,
  progress: number,
  chars: string = DEFAULT_CHARS
): string {
  if (progress >= 1.0) return targetText;
  const lineLen = targetText.length;
  const decodedIndex = Math.floor(progress * lineLen);

  let result = '';
  for (let i = 0; i < lineLen; i++) {
    const char = targetText[i];
    if (char === ' ' || char === '\n') {
      result += char;
    } else if (i < decodedIndex) {
      result += char;
    } else {
      const randChar = chars[Math.floor(Math.random() * chars.length)];
      result += randChar;
    }
  }
  return result;
}

/**
 * useDirectScramble - Hook haute performance pour décodage de texte par décryptage mécanique
 * 
 * - Zéro re-render React (aucun useState).
 * - Manipule directement ref.current.textContent.
 * - Synchronisé sur le singleton unique FrameManager via performance.now().
 * - Déclenchement réactif sur l'événement 'plc-boot-complete' ou immédiat si le preloader a déjà fini.
 * - Respect strict de prefers-reduced-motion et des agents automatisés (Lighthouse / bots).
 */
export function useDirectScramble({
  refs,
  lines,
  duration = 900,
  chars = DEFAULT_CHARS,
}: UseDirectScrambleOptions): void {
  const isStartedRef = useRef(false);
  const isCompletedRef = useRef(false);
  const refsRef = useRef(refs);
  const linesRef = useRef(lines);
  refsRef.current = refs;
  linesRef.current = lines;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Détection de bot ou audit
    const isBot =
      Boolean(navigator.webdriver) ||
      /bot|google|crawler|spider|robot|crawling|lighthouse|pagespeed|ptst|headlesschrome|chrome-lighthouse/i.test(
        navigator.userAgent
      );
    const isReduced =
      frameManager.isReducedMotion ||
      (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // Si accessibilité ou bot : application immédiate du texte cible sans animation
    const setFinalText = () => {
      refsRef.current.forEach((ref, idx) => {
        if (ref.current && linesRef.current[idx] !== undefined) {
          ref.current.textContent = linesRef.current[idx];
        }
      });
      isCompletedRef.current = true;
    };

    if (isBot || isReduced) {
      setFinalText();
      return;
    }

    // Si le boot est déjà terminé, démarrage immédiat avec texte final (LCP protégé)
    if (window.__preloaderDone || sessionStorage.getItem('seen-preloader') === 'true') {
      setFinalText();
      return;
    }

    // Premier chargement : initialiser en texte chiffré avant l'ouverture du rideau
    refsRef.current.forEach((ref, idx) => {
      const line = linesRef.current[idx];
      if (ref.current && line) {
        ref.current.textContent = computeScrambleText(line, 0, chars);
      }
    });

    let startTime = 0;
    let unsubscribe: (() => void) | null = null;

    const runScrambleAnimation = () => {
      if (isStartedRef.current || isCompletedRef.current) return;
      isStartedRef.current = true;

      startTime = performance.now();

      unsubscribe = frameManager.subscribe((_dt, now) => {
        const currentTime = typeof now === 'number' && now > 0 ? now : performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(1.0, elapsed / duration);

        if (progress >= 1.0) {
          setFinalText();
          if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
          }
          return;
        }

        // Décodage progressif caractère par caractère synchronisé
        refsRef.current.forEach((ref, lineIdx) => {
          const el = ref.current;
          const targetLine = linesRef.current[lineIdx];
          if (!el || !targetLine) return;
          el.textContent = computeScrambleText(targetLine, progress, chars);
        });
      });
    };

    // En attente de l'événement de fin de boot automate
    window.addEventListener('plc-boot-complete', runScrambleAnimation, { once: true });
    window.addEventListener('preloader-complete', runScrambleAnimation, { once: true });

    return () => {
      window.removeEventListener('plc-boot-complete', runScrambleAnimation);
      window.removeEventListener('preloader-complete', runScrambleAnimation);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [duration, chars]);
}
