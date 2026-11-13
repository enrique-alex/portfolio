'use client';

import { useEffect, useRef, useState } from 'react';
import Logo from '@/components/ui/Logo';
import { useOptionalLanguage } from '@/components/theme/LanguageProvider';

declare global {
  interface Window {
    __preloaderDone?: boolean;
  }
}

export function checkHasBooted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      typeof sessionStorage !== 'undefined' &&
      (sessionStorage.getItem('plc_boot_done') === 'true' ||
       sessionStorage.getItem('seen-preloader') === 'true')
    );
  } catch {
    return false;
  }
}

export function executeBootCompletion(): void {
  if (typeof window !== 'undefined') {
    window.__preloaderDone = true;
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('plc_boot_done', 'true');
        sessionStorage.setItem('seen-preloader', 'true');
      }
    } catch {
      // Safe storage fallback
    }
    window.dispatchEvent(new CustomEvent('plc-boot-complete'));
    window.dispatchEvent(new CustomEvent('preloader-complete'));
  }
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
}

export default function Preloader() {
  const { t } = useOptionalLanguage();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completeBoot = () => {
    if (completedRef.current) return;
    completedRef.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    executeBootCompletion();

    setVisible(false);
    if (containerRef.current) {
      containerRef.current.style.display = 'none';
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (checkHasBooted() || prefersReducedMotion) {
      completeBoot();
      return;
    }

    setMounted(true);
    setVisible(true);
    document.body.style.overflow = 'hidden';

    timeoutRef.current = setTimeout(completeBoot, 1400);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      document.body.style.overflow = '';
    };
  }, []);

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.animationName === 'plc-curtain-exit') {
      completeBoot();
    }
  };

  if (!mounted || !visible) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes plc-bar-fill {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes plc-curtain-exit {
          0% {
            clip-path: inset(0 0 0% 0);
            opacity: 1;
          }
          99% {
            clip-path: inset(0 0 100% 0);
            opacity: 1;
          }
          100% {
            clip-path: inset(0 0 100% 0);
            opacity: 0;
            visibility: hidden;
          }
        }
        .plc-curtain-anim {
          animation: plc-curtain-exit 0.42s cubic-bezier(0.7, 0, 0.2, 1) 0.95s forwards;
          will-change: clip-path;
        }
        .plc-bar-progress {
          transform-origin: left center;
          animation: plc-bar-fill 0.85s cubic-bezier(0.23, 1, 0.32, 1) 0.05s forwards;
          will-change: transform;
        }
      `}</style>

      <div
        ref={containerRef}
        onAnimationEnd={handleAnimationEnd}
        aria-hidden="true"
        className="plc-curtain-anim fixed inset-0 z-[9999] flex flex-col justify-between bg-[#050505] p-6 sm:p-10 font-mono text-zinc-300 select-none overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 text-xs tracking-wider text-zinc-400">
          <span className="font-semibold text-zinc-200">ENRIQUE ALEX NDJAKOU</span>
          <span className="text-[11px] uppercase tracking-widest text-[#00D2FF]">
            Polytech Lille · Minakem
          </span>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center justify-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0A0C10]">
            <Logo className="h-9 w-9 text-[#00D2FF]" />
          </div>
          <div className="space-y-1.5">
            <p className="font-sans text-lg font-bold tracking-tight text-white sm:text-xl">
              Enrique Alex Ndjakou Kemayou
            </p>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
              {t('preloader.role')}
            </p>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-4">
          <div className="mb-2 flex items-center justify-between text-[11px] tracking-wider text-zinc-400">
            <span>{t('preloader.loading')}</span>
            <span className="font-semibold text-[#00D2FF] tabular-nums">{t('preloader.ready')}</span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#11141C]">
            <div className="plc-bar-progress absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#00D2FF]" />
          </div>
        </div>
      </div>
    </>
  );
}
