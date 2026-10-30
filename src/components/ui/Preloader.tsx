'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    __preloaderDone?: boolean;
  }
}

const BOOT_LOGS = [
  { tag: 'BOOT_ROM', msg: 'ARM Cortex-M7 @ 480MHz // RTOS Kernel Init', status: '[OK]', delay: '0.10s' },
  { tag: 'BUS_SCAN', msg: 'CANopen (1Mbps) / MODBUS-RTU RS-485 Transceiver', status: '[SYNCED]', delay: '0.35s' },
  { tag: 'FIELD_IO', msg: '32-Ch Optoisolated High-Speed Digital I/O Ring', status: '[VERIFIED]', delay: '0.65s' },
  { tag: 'ANALOG_IN', msg: '16-Ch 24-Bit ADC (4-20mA / 0-10V RTD Instrumentation)', status: '[CALIBRATED]', delay: '0.95s' },
  { tag: 'SYS_RTC', msg: 'PTP IEEE 1588 Hardware Clock Synchronization', status: '[LOCKED]', delay: '1.25s' },
  { tag: 'SCADA_NET', msg: 'Industrial Ethernet IP Stack // Telemetry Link Active', status: '[ONLINE]', delay: '1.55s' },
];

export default function Preloader() {
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
    setVisible(false);
    if (containerRef.current) {
      containerRef.current.style.display = 'none';
    }
  };

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return;

    // Vérification de la session : absent -> joue la séquence ; présent -> masque immédiatement
    const hasBooted =
      typeof sessionStorage !== 'undefined' &&
      (sessionStorage.getItem('plc_boot_done') === 'true' ||
       sessionStorage.getItem('seen-preloader') === 'true');

    if (hasBooted) {
      completeBoot();
      return;
    }

    // Premier chargement client : activation immédiate
    setMounted(true);
    setVisible(true);
    document.body.style.overflow = 'hidden';

    // Sécurité temporelle de secours : débloque exactement à 2.3s
    timeoutRef.current = setTimeout(completeBoot, 2300);

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
        @keyframes plc-step-reveal {
          0% { opacity: 0; transform: translateY(3px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes plc-bar-fill {
          0% { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0% 0 0); }
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
          animation: plc-curtain-exit 0.5s cubic-bezier(0.7, 0, 0.2, 1) 1.8s forwards;
          will-change: clip-path;
        }
        .plc-bar-progress {
          animation: plc-bar-fill 1.7s steps(16) 0.1s forwards;
          will-change: clip-path;
        }
      `}</style>

      <div
        ref={containerRef}
        onAnimationEnd={handleAnimationEnd}
        aria-hidden="true"
        className="plc-curtain-anim fixed inset-0 z-[9999] flex flex-col justify-between bg-[#07090E] p-6 sm:p-10 font-mono text-zinc-300 select-none overflow-hidden"
      >
        {/* Grille technique de fond & scanlines d'atelier */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px)',
          }}
        />

        {/* Header Terminal */}
        <div className="relative z-10 flex flex-wrap items-center justify-between border-b border-zinc-800 pb-4 text-xs tracking-wider text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 items-center justify-center">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <span className="font-bold text-zinc-200">PLC-SYS // INDUSTRIAL BOOT SEQUENCE</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <span>CORE: M7-480MHZ</span>
            <span>BUS: ISO 11898</span>
            <span className="text-emerald-400 font-semibold">WATCHDOG ARMED</span>
          </div>
        </div>

        {/* Corps Central : Séquence d'initialisation pas-à-pas (Zéro JS, pur CSS steps(1)) */}
        <div className="relative z-10 my-auto flex flex-col justify-center max-w-3xl space-y-2.5 py-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            --- TELEMETRY EXECUTION FLOW ---
          </div>

          {BOOT_LOGS.map((log) => (
            <div
              key={log.tag}
              style={{
                opacity: 0,
                animation: `plc-step-reveal 0.01s steps(1) ${log.delay} forwards`,
              }}
              className="flex items-start justify-between text-xs sm:text-sm font-mono leading-tight gap-4"
            >
              <div className="flex items-center gap-3 truncate">
                <span className="text-sky-400 font-semibold tracking-wide">[{log.tag}]</span>
                <span className="text-zinc-300 truncate">{log.msg}</span>
              </div>
              <span className="text-emerald-400 font-bold shrink-0">{log.status}</span>
            </div>
          ))}
        </div>

        {/* Footer : Barre crénelée animée via clip-path: inset() avec steps(16) */}
        <div className="relative z-10 border-t border-zinc-800 pt-4">
          <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400 tracking-wider">
            <span>BUS INTEGRITY & IO FIRMWARE REVISION: 4.12.0</span>
            <span className="font-bold text-sky-400">100% READY</span>
          </div>

          {/* Rail de la barre crénelée */}
          <div className="relative h-3 w-full rounded-xs bg-zinc-900 border border-zinc-800 overflow-hidden">
            {/* Texture de créneaux (16 crans réguliers) */}
            <div
              className="plc-bar-progress absolute inset-0 bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent, transparent 6.25%, rgba(0,0,0,0.4) 6.25%, rgba(0,0,0,0.4) 6.7%)',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
