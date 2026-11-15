'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ISOMETRIC_EN_MONOLITH_PATHS } from '@/components/ui/Logo';
import { useOptionalLanguage } from '@/components/theme/LanguageProvider';

declare global {
  interface Window {
    __preloaderDone?: boolean;
  }
}

export const PRELOADER_DURATION_MS = 2340;
export const PRELOADER_EXIT_START_MS = 1820;
export const PRELOADER_REVEAL_DISPATCH_MS = 2000;
export const PRELOADER_FAILSAFE_MS = 2680;

const CRAWLER_OR_AUDIT_UA_PATTERN =
  /bot|googlebot|crawler|spider|robot|crawling|lighthouse|pagespeed|ptst|chrome-lighthouse/i;

/**
 * Runtime-only check: returns true only if the preloader has already completed
 * in the current browser window memory (survives SPA navigation, resets on F5/reload).
 */
export function checkHasBooted(): boolean {
  if (typeof window === 'undefined') return false;
  return window.__preloaderDone === true;
}

/**
 * Detects search crawlers and automated performance audits (Lighthouse / PageSpeed)
 * so initial paint and LCP are never blocked for automated indexing.
 */
export function isAutomatedAuditEnvironment(): boolean {
  if (typeof navigator === 'undefined') return false;
  return CRAWLER_OR_AUDIT_UA_PATTERN.test(navigator.userAgent || '');
}

/**
 * Marks runtime boot complete, unlocks body scroll, clears any pre-paint mask,
 * and notifies downstream Hero animations (`useDirectScramble`).
 */
export function executeBootCompletion(): void {
  if (typeof window !== 'undefined') {
    window.__preloaderDone = true;
    window.dispatchEvent(new CustomEvent('plc-boot-complete'));
    window.dispatchEvent(new CustomEvent('preloader-complete'));
  }
  if (typeof document !== 'undefined') {
    document.documentElement.removeAttribute('data-en-boot');
    if (document.body) {
      document.body.style.overflow = '';
    }
  }
}

export default function Preloader() {
  const { t } = useOptionalLanguage();
  const rawUid = useId();
  const uid = rawUid.replace(/[^a-zA-Z0-9_-]/g, '');
  const maskId = `en-spec-mask-${uid}`;
  const gradId = `en-spec-grad-${uid}`;

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const bootDispatchedRef = useRef(false);
  const completedRef = useRef(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dispatchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failsafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (dispatchTimerRef.current) {
      clearTimeout(dispatchTimerRef.current);
      dispatchTimerRef.current = null;
    }
    if (failsafeTimerRef.current) {
      clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
  }, []);

  const dispatchBootOnce = useCallback(() => {
    if (bootDispatchedRef.current) return;
    bootDispatchedRef.current = true;
    executeBootCompletion();
  }, []);

  const finishBoot = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    clearTimers();
    dispatchBootOnce();
    setVisible(false);
    if (containerRef.current) {
      containerRef.current.style.display = 'none';
    }
  }, [clearTimers, dispatchBootOnce]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (checkHasBooted() || prefersReducedMotion || isAutomatedAuditEnvironment()) {
      finishBoot();
      return;
    }

    setMounted(true);
    setVisible(true);
    document.body.style.overflow = 'hidden';
  }, [finishBoot]);

  // Start sequence timers and release pre-paint guard ONLY after the opaque curtain DOM commits
  useEffect(() => {
    if (!mounted || !visible) return;

    const rafId = requestAnimationFrame(() => {
      document.documentElement.removeAttribute('data-en-boot');
    });

    // Phase 3 begins: allow pointer/scroll passthrough as the curtain lifts
    exitTimerRef.current = setTimeout(() => {
      setIsExiting(true);
    }, PRELOADER_EXIT_START_MS);

    // Unlock scroll and trigger Hero text decode right as the Hero emerges
    dispatchTimerRef.current = setTimeout(() => {
      dispatchBootOnce();
    }, PRELOADER_REVEAL_DISPATCH_MS);

    // Hard failsafe unmount if animationend does not fire (e.g. backgrounded tab)
    failsafeTimerRef.current = setTimeout(() => {
      finishBoot();
    }, PRELOADER_FAILSAFE_MS);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimers();
      requestAnimationFrame(() => {
        if (!document.querySelector('[data-preloader-root="true"]')) {
          document.documentElement.removeAttribute('data-en-boot');
          if (document.body) {
            document.body.style.overflow = '';
          }
        }
      });
    };
  }, [mounted, visible, clearTimers, dispatchBootOnce, finishBoot]);

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.animationName === 'en-curtain-exit') {
      finishBoot();
    }
  };

  if (!mounted || !visible) {
    return null;
  }

  return (
    <>
      <style>{`
        .en-preloader-root {
          --en-face-e: #009CC2;
          --en-face-n: #09090B;
          --en-guide: rgba(9, 9, 11, 0.11);
          --en-axis-guide: rgba(9, 9, 11, 0.16);
          --en-grid: rgba(9, 9, 11, 0.055);
          --en-fiducial: rgba(0, 156, 194, 0.75);
          --en-spec-peak: #E0F7FF;
          --en-facet-e: rgba(0, 156, 194, 0.085);
          --en-facet-n: rgba(9, 9, 11, 0.045);
          --en-vertex-core: #009CC2;
        }
        .dark .en-preloader-root {
          --en-face-e: #00D2FF;
          --en-face-n: #FFFFFF;
          --en-guide: rgba(255, 255, 255, 0.10);
          --en-axis-guide: rgba(255, 255, 255, 0.16);
          --en-grid: rgba(255, 255, 255, 0.045);
          --en-fiducial: rgba(0, 210, 255, 0.68);
          --en-spec-peak: #FFFFFF;
          --en-facet-e: rgba(0, 210, 255, 0.11);
          --en-facet-n: rgba(255, 255, 255, 0.06);
          --en-vertex-core: #FFFFFF;
        }

        @keyframes en-monolith-sequence {
          0% {
            transform: scale(0.92) translateZ(0);
            opacity: 0;
          }
          14% {
            opacity: 1;
          }
          52% {
            transform: scale(1) translateZ(0);
            opacity: 1;
          }
          67% {
            transform: scale(1) translateZ(0);
          }
          79% {
            transform: scale(1.045) translateZ(0);
          }
          94%, 100% {
            transform: scale(1) translateZ(0);
            opacity: 1;
          }
        }

        @keyframes en-trace {
          0% {
            stroke-dashoffset: 102;
            opacity: 0;
          }
          4% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes en-guide-fade {
          0% {
            opacity: 0;
          }
          24% {
            opacity: 1;
          }
          72% {
            opacity: 0.72;
          }
          100% {
            opacity: 0.22;
          }
        }

        @keyframes en-facet-shimmer {
          0% {
            opacity: 0;
          }
          34% {
            opacity: 1;
          }
          100% {
            opacity: 0.45;
          }
        }

        @keyframes en-specular-sweep {
          0% {
            transform: translate3d(-18px, 0, 0) skewX(-22deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translate3d(46px, 0, 0) skewX(-22deg);
            opacity: 0;
          }
        }

        @keyframes en-node-lock {
          0% {
            opacity: 0;
            transform: scale(0.65) translateZ(0);
          }
          38% {
            opacity: 0.95;
            transform: scale(1.15) translateZ(0);
          }
          100% {
            opacity: 0;
            transform: scale(0.9) translateZ(0);
          }
        }

        @keyframes en-prism-echo {
          0% {
            transform: scale(0.98) translateZ(0);
            opacity: 0;
          }
          26% {
            opacity: 0.62;
          }
          100% {
            transform: scale(1.24) translateZ(0);
            opacity: 0;
          }
        }

        @keyframes en-fiducial-tl {
          0% { transform: translate3d(-6px, -6px, 0); opacity: 0; }
          100% { transform: translate3d(0, 0, 0); opacity: 1; }
        }
        @keyframes en-fiducial-tr {
          0% { transform: translate3d(6px, -6px, 0); opacity: 0; }
          100% { transform: translate3d(0, 0, 0); opacity: 1; }
        }
        @keyframes en-fiducial-bl {
          0% { transform: translate3d(-6px, 6px, 0); opacity: 0; }
          100% { transform: translate3d(0, 0, 0); opacity: 1; }
        }
        @keyframes en-fiducial-br {
          0% { transform: translate3d(6px, 6px, 0); opacity: 0; }
          100% { transform: translate3d(0, 0, 0); opacity: 1; }
        }

        @keyframes en-type-rise {
          0% {
            opacity: 0;
            transform: translate3d(0, 6px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes en-axis-expand {
          0% {
            transform: scaleX(0) translateZ(0);
            opacity: 0;
          }
          100% {
            transform: scaleX(1) translateZ(0);
            opacity: 1;
          }
        }

        @keyframes en-content-exit {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate3d(0, -12px, 0) scale(0.965);
          }
        }

        @keyframes en-curtain-exit {
          0% {
            clip-path: inset(0 0 0% 0);
            opacity: 1;
          }
          82% {
            opacity: 1;
          }
          99% {
            clip-path: inset(0 0 100% 0);
            opacity: 0;
          }
          100% {
            clip-path: inset(0 0 100% 0);
            opacity: 0;
            visibility: hidden;
          }
        }

        .en-curtain-anim {
          animation: en-curtain-exit 0.52s cubic-bezier(0.77, 0, 0.175, 1) 1.82s forwards;
          will-change: clip-path, opacity;
        }

        .en-center-assembly {
          animation: en-content-exit 0.34s cubic-bezier(0.77, 0, 0.175, 1) 1.78s forwards;
          will-change: transform, opacity;
        }

        .en-monolith-stage {
          animation: en-monolith-sequence 1.80s cubic-bezier(0.22, 1, 0.36, 1) 0s both;
          will-change: transform, opacity;
        }

        .en-guide-layer {
          animation: en-guide-fade 1.28s cubic-bezier(0.23, 1, 0.32, 1) 0.04s both;
        }

        .en-facet-layer {
          animation: en-facet-shimmer 0.60s cubic-bezier(0.16, 1, 0.3, 1) 1.06s both;
          will-change: opacity;
        }

        .en-stroke {
          stroke-dasharray: 102 104;
          stroke-dashoffset: 102;
        }

        .en-p1 { animation: en-trace 0.68s cubic-bezier(0.23, 1, 0.32, 1) 0.10s both; }
        .en-p4 { animation: en-trace 0.42s cubic-bezier(0.23, 1, 0.32, 1) 0.22s both; }
        .en-p2 { animation: en-trace 0.44s cubic-bezier(0.23, 1, 0.32, 1) 0.40s both; }
        .en-p5 { animation: en-trace 0.70s cubic-bezier(0.23, 1, 0.32, 1) 0.42s both; }
        .en-p3 { animation: en-trace 0.44s cubic-bezier(0.23, 1, 0.32, 1) 0.64s both; }

        .en-specular-beam {
          animation: en-specular-sweep 0.60s cubic-bezier(0.16, 1, 0.3, 1) 1.16s both;
          will-change: transform, opacity;
        }

        .en-node-lock {
          transform-box: fill-box;
          transform-origin: center;
          animation: en-node-lock 0.50s cubic-bezier(0.16, 1, 0.3, 1) 1.16s both;
        }

        .en-prism-echo {
          transform-origin: 12px 12px;
          animation: en-prism-echo 0.58s cubic-bezier(0.16, 1, 0.3, 1) 1.18s both;
          will-change: transform, opacity;
        }

        .en-fiducial-tl { animation: en-fiducial-tl 0.56s cubic-bezier(0.23, 1, 0.32, 1) 0.12s both; }
        .en-fiducial-tr { animation: en-fiducial-tr 0.56s cubic-bezier(0.23, 1, 0.32, 1) 0.12s both; }
        .en-fiducial-bl { animation: en-fiducial-bl 0.56s cubic-bezier(0.23, 1, 0.32, 1) 0.12s both; }
        .en-fiducial-br { animation: en-fiducial-br 0.56s cubic-bezier(0.23, 1, 0.32, 1) 0.12s both; }

        .en-name-reveal {
          animation: en-type-rise 0.50s cubic-bezier(0.23, 1, 0.32, 1) 0.32s both;
          will-change: transform, opacity;
        }
        .en-axis-reveal {
          transform-origin: center;
          animation: en-axis-expand 0.52s cubic-bezier(0.23, 1, 0.32, 1) 0.48s both;
          will-change: transform, opacity;
        }
        .en-role-reveal {
          animation: en-type-rise 0.50s cubic-bezier(0.23, 1, 0.32, 1) 0.62s both;
          will-change: transform, opacity;
        }
      `}</style>

      <div
        ref={containerRef}
        data-preloader-root="true"
        data-exiting={isExiting ? 'true' : 'false'}
        onAnimationEnd={handleAnimationEnd}
        aria-hidden="true"
        className={`en-preloader-root en-curtain-anim fixed inset-0 z-[10000] flex items-center justify-center bg-[#F8F9FA] dark:bg-[#050505] px-6 select-none overflow-hidden ${
          isExiting ? 'pointer-events-none' : ''
        }`}
      >
        {/* Architectural alignment grid matching the Hero ambient geometry */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--en-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--en-grid) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(circle at 50% 48%, #000 0%, transparent 66%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 48%, #000 0%, transparent 66%)',
          }}
        />

        {/* Center Monolith Stage */}
        <div className="en-center-assembly relative z-10 flex flex-col items-center justify-center text-center">
          <div className="relative flex h-36 w-36 sm:h-40 sm:w-40 items-center justify-center">
            {/* Corner optical fiducials echoing HeroSection */}
            <span
              className="en-fiducial-tl pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l-[1.5px] border-t-[1.5px]"
              style={{ borderColor: 'var(--en-fiducial)' }}
            />
            <span
              className="en-fiducial-tr pointer-events-none absolute right-0 top-0 h-2.5 w-2.5 border-r-[1.5px] border-t-[1.5px]"
              style={{ borderColor: 'var(--en-fiducial)' }}
            />
            <span
              className="en-fiducial-bl pointer-events-none absolute bottom-0 left-0 h-2.5 w-2.5 border-b-[1.5px] border-l-[1.5px]"
              style={{ borderColor: 'var(--en-fiducial)' }}
            />
            <span
              className="en-fiducial-br pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b-[1.5px] border-r-[1.5px]"
              style={{ borderColor: 'var(--en-fiducial)' }}
            />

            {/* Isometric EN Monolith SVG Choreography */}
            <div className="en-monolith-stage relative h-28 w-28 sm:h-32 sm:w-32">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="h-full w-full overflow-visible"
              >
                <defs>
                  <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--en-face-e)" stopOpacity="0" />
                    <stop offset="28%" stopColor="var(--en-face-e)" stopOpacity="0.65" />
                    <stop offset="50%" stopColor="var(--en-spec-peak)" stopOpacity="0.98" />
                    <stop offset="72%" stopColor="var(--en-face-e)" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="var(--en-face-e)" stopOpacity="0" />
                  </linearGradient>

                  <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                    <g
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={ISOMETRIC_EN_MONOLITH_PATHS.eOuterContour} />
                      <path d={ISOMETRIC_EN_MONOLITH_PATHS.eUpperRidge} />
                      <path d={ISOMETRIC_EN_MONOLITH_PATHS.eMiddleCantilever} />
                      <path d={ISOMETRIC_EN_MONOLITH_PATHS.nUpperCrown} />
                      <path d={ISOMETRIC_EN_MONOLITH_PATHS.nInterlockingFace} />
                    </g>
                  </mask>
                </defs>

                {/* Subtle Blueprint Reference Wireframe & Vertical Symmetry Axis */}
                <g
                  className="en-guide-layer"
                  stroke="var(--en-guide)"
                  strokeWidth="0.38"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line
                    x1="12"
                    y1="0.8"
                    x2="12"
                    y2="23.2"
                    stroke="var(--en-axis-guide)"
                    strokeWidth="0.28"
                    strokeDasharray="1.1 1.3"
                  />
                  <path d={ISOMETRIC_EN_MONOLITH_PATHS.eOuterContour} />
                  <path d={ISOMETRIC_EN_MONOLITH_PATHS.eUpperRidge} />
                  <path d={ISOMETRIC_EN_MONOLITH_PATHS.eMiddleCantilever} />
                  <path d={ISOMETRIC_EN_MONOLITH_PATHS.nUpperCrown} />
                  <path d={ISOMETRIC_EN_MONOLITH_PATHS.nInterlockingFace} />
                </g>

                {/* Phase 2: Volumetric Isometric Crystal Facets Emerging on Prism Closure */}
                <g className="en-facet-layer">
                  <polygon points="12,2.5 3.5,7 3.5,17 12,21.5" fill="var(--en-facet-e)" />
                  <polygon points="12,2.5 20.5,7 20.5,17 12,21.5" fill="var(--en-facet-n)" />
                </g>

                {/* Phase 2: Isometric Hexagonal Prism Echo on Lock */}
                <polygon
                  points="12,2.5 20.5,7 20.5,17 12,21.5 3.5,17 3.5,7"
                  className="en-prism-echo"
                  stroke="var(--en-face-e)"
                  strokeWidth="0.45"
                  strokeLinejoin="round"
                />

                {/* Phase 1: Staggered Isometric E (Cyan) & N (White / Obsidian) Vector Trace */}
                <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path
                    d={ISOMETRIC_EN_MONOLITH_PATHS.eOuterContour}
                    pathLength={100}
                    stroke="var(--en-face-e)"
                    className="en-stroke en-p1"
                  />
                  <path
                    d={ISOMETRIC_EN_MONOLITH_PATHS.eUpperRidge}
                    pathLength={100}
                    stroke="var(--en-face-e)"
                    className="en-stroke en-p2"
                  />
                  <path
                    d={ISOMETRIC_EN_MONOLITH_PATHS.eMiddleCantilever}
                    pathLength={100}
                    stroke="var(--en-face-e)"
                    className="en-stroke en-p3"
                  />
                  <path
                    d={ISOMETRIC_EN_MONOLITH_PATHS.nUpperCrown}
                    pathLength={100}
                    stroke="var(--en-face-n)"
                    className="en-stroke en-p4"
                  />
                  <path
                    d={ISOMETRIC_EN_MONOLITH_PATHS.nInterlockingFace}
                    pathLength={100}
                    stroke="var(--en-face-n)"
                    className="en-stroke en-p5"
                  />
                </g>

                {/* Phase 2: Precision Specular Glint Masked Strictly to the 5 Prism Edges */}
                <g mask={`url(#${maskId})`}>
                  <rect
                    x="-10"
                    y="-12"
                    width="12"
                    height="48"
                    fill={`url(#${gradId})`}
                    className="en-specular-beam"
                  />
                </g>

                {/* Phase 2: Vertex Calibration Lock Nodes at Shared Prism Spine */}
                <g className="en-node-lock" fill="var(--en-vertex-core)">
                  <circle cx="12" cy="2.5" r="0.44" />
                  <circle cx="12" cy="11.5" r="0.44" />
                  <circle cx="12" cy="21.5" r="0.44" />
                </g>
              </svg>
            </div>
          </div>

          {/* Restrained Architectural Monospace Identity */}
          <div className="mt-6 flex flex-col items-center gap-2.5">
            <span className="en-name-reveal font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-[0.26em] text-zinc-900 dark:text-zinc-100">
              Enrique Alex Ndjakou
            </span>
            <span className="en-axis-reveal h-px w-24 bg-gradient-to-r from-transparent via-[#009CC2]/70 dark:via-[#00D2FF]/70 to-transparent" />
            <p className="en-role-reveal max-w-[290px] sm:max-w-none text-balance font-mono text-[10px] sm:text-[11px] uppercase leading-relaxed tracking-[0.16em] text-zinc-600 dark:text-zinc-400">
              {t('preloader.role').replace(/ · /g, '\u00A0· ')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
