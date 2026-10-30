'use client';

import { useRef, ReactNode, useEffect } from 'react';
import { magneticManager } from '@/lib/graphics/MagneticManager';

interface MagneticProps {
  children: ReactNode;
  /** Puissance de l'attraction magnétique (valeur typique : 0.15 - 0.4) */
  intensity?: number;
  className?: string;
}

/**
 * Magnetic - Élément magnétique industrialisé haute performance
 * 
 * - Zéro écouteur local mousemove.
 * - Zéro instance Framer Motion (suppression intégrale de useSpring / useMotionValue).
 * - Délègue le calcul et le positionnement au contrôleur globalisé MagneticManager via translate3d.
 * - Bounding boxes mises en cache, évitant tout reflow forcé.
 */
export default function Magnetic({ children, intensity = 0.25, className = '' }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    // Sur écran tactile ou coarse pointer, l'attraction n'est pas activée
    if (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    magneticManager.register(el, intensity);

    return () => {
      magneticManager.unregister(el);
    };
  }, [intensity]);

  return (
    <div
      ref={ref}
      className={`industrial-mag inline-flex cursor-pointer relative z-40 will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
