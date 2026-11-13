'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { frameManager } from '@/lib/graphics/FrameManager';
import { magneticManager } from '@/lib/graphics/MagneticManager';

const LERP_SPEED = 18;

interface LegacyMediaQueryList {
  addListener?: (listener: (e: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (e: MediaQueryListEvent) => void) => void;
}

export default function DualBodyCursor() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;
  const [isActive, setIsActive] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const targetX = useRef(-100);
  const targetY = useRef(-100);
  const currentRingX = useRef(-100);
  const currentRingY = useRef(-100);
  const hasMoved = useRef(false);
  const isFrameSubscribed = useRef(false);
  const unsubscribeFrameRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isAdminRoute) {
      setIsActive(false);
      return;
    }

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const pointerQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncCursorEligibility = () => {
      setIsActive(pointerQuery.matches && !motionQuery.matches);
    };

    syncCursorEligibility();

    if (typeof pointerQuery.addEventListener === 'function') {
      pointerQuery.addEventListener('change', syncCursorEligibility);
    } else {
      const legacy = pointerQuery as unknown as LegacyMediaQueryList;
      legacy.addListener?.(syncCursorEligibility);
    }

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', syncCursorEligibility);
    } else {
      const legacyMotion = motionQuery as unknown as LegacyMediaQueryList;
      legacyMotion.addListener?.(syncCursorEligibility);
    }

    return () => {
      if (typeof pointerQuery.removeEventListener === 'function') {
        pointerQuery.removeEventListener('change', syncCursorEligibility);
      } else {
        const legacy = pointerQuery as unknown as LegacyMediaQueryList;
        legacy.removeListener?.(syncCursorEligibility);
      }

      if (typeof motionQuery.removeEventListener === 'function') {
        motionQuery.removeEventListener('change', syncCursorEligibility);
      } else {
        const legacyMotion = motionQuery as unknown as LegacyMediaQueryList;
        legacyMotion.removeListener?.(syncCursorEligibility);
      }
    };
  }, [isAdminRoute]);

  useEffect(() => {
    if (!isActive) return;

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

        if (dist < 0.1) {
          currentRingX.current = targetX.current;
          currentRingY.current = targetY.current;
          ringRef.current.style.transform = `translate3d(${targetX.current}px, ${targetY.current}px, 0)`;
          stopFrameLoop();
          return;
        }

        const clampedDt = Math.min(Math.max(dt || 0.0117, 0.001), 0.1);
        const lerpFactor = 1.0 - Math.exp(-LERP_SPEED * clampedDt);
        currentRingX.current += dx * lerpFactor;
        currentRingY.current += dy * lerpFactor;

        ringRef.current.style.transform = `translate3d(${currentRingX.current}px, ${currentRingY.current}px, 0)`;
      });
    };

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

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        if (dotRef.current.style.opacity !== '1') {
          dotRef.current.style.opacity = '1';
        }
      }

      if (ringRef.current && ringRef.current.style.opacity !== '1') {
        ringRef.current.style.opacity = '1';
      }

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
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <>
      <div
        id="cur-dot"
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] -ml-1 -mt-1 h-2 w-2 rounded-full bg-white opacity-0 transition-opacity duration-150"
        style={{
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      <div
        id="ring"
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] -ml-4 -mt-4 h-8 w-8 rounded-full border border-white opacity-0 transition-opacity duration-150"
        style={{
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
    </>
  );
}
