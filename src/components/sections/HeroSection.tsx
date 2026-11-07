'use client';

import { useRef } from "react";
import Image from "next/image";
import Magnetic from "@/components/ui/Magnetic";
import { Download } from "lucide-react";
import { useLanguage } from "@/components/theme/LanguageProvider";
import { useDirectScramble } from "@/lib/hooks/useDirectScramble";

export default function HeroSection() {
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);

  // Décodage matériel direct : zéro cycle de réconciliation React, manipulation textContent directe
  useDirectScramble({
    refs: [line1Ref, line2Ref],
    lines: ["Enrique Alex", "NDJAKOU KEMAYOU"],
    duration: 850,
  });

  const { t } = useLanguage();

  return (
    <section id="home" className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 overflow-x-clip">
      
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row lg:gap-20 pt-24 pb-24 lg:py-0">
        
        {/* COLONNE GAUCHE : Typographie & Informations */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left z-10 w-full">
          {/* Titre Principal (Scramble Hardware Reveal) */}
          <h1 className="z-10 w-full text-2xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] tracking-tighter leading-[1.05] font-extrabold font-mono sm:font-sans">
            <div className="flex flex-col">
              <span 
                ref={line1Ref}
                className="block break-words sm:whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-zinc-700 to-zinc-400 dark:from-white/90 dark:to-white/50"
              >
                Enrique Alex
              </span>
              <span 
                className="block break-words sm:whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400"
              >
                <span ref={line2Ref}>NDJAKOU KEMAYOU</span>
                <span className="text-brand-blue animate-pulse ml-1 inline-block">_</span>
              </span>
            </div>
          </h1>
          
          {/* Badge "Telemetry Status" */}
          <div className="mt-6 mb-2">
            <Magnetic intensity={0.2}>
              <div className="group relative inline-flex items-center gap-3 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-mono uppercase tracking-widest text-zinc-800 backdrop-blur-md dark:border-white/10 dark:bg-[#0A0C10]/85 dark:text-zinc-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">{t('hero.badge')}</span>
                <span className="text-zinc-400 dark:text-zinc-600" aria-hidden="true">/</span>
                <span className="text-brand-blue dark:text-[#00D2FF] font-semibold">{t('hero.badge.company')}</span>
              </div>
            </Magnetic>
          </div>

          <p className="mt-6 max-w-[65ch] text-base leading-relaxed text-zinc-600 md:text-lg dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{t('hero.subtitle.line1')}</span><br/>
            {t('hero.subtitle.line2')}{' '}
            <span className="font-semibold text-brand-blue dark:text-[#00D2FF]">{t('hero.subtitle.company')}</span>
            {t('hero.subtitle.line3')}
          </p>

          {/* CTAs d'Exploration Tactiles */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Magnetic intensity={0.22}>
              <button 
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} 
                className="group relative flex items-center gap-4 rounded-full bg-zinc-900 px-7 py-4 font-mono text-xs font-bold uppercase tracking-widest text-white active:scale-[0.97] transition-[transform,background-color,box-shadow] duration-200 ease-[var(--ease-out)] hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                <span>{t('hero.cta.explore')}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 dark:bg-black/10 transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-y-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                </span>
              </button>
            </Magnetic>

            <Magnetic intensity={0.18}>
              <a 
                href="/cv-enrique-ndjakou.pdf"
                download="CV_Enrique_Ndjakou.pdf"
                className="group relative flex items-center gap-3 rounded-full border border-black/15 bg-white/70 px-7 py-4 font-mono text-xs font-bold uppercase tracking-widest text-zinc-900 backdrop-blur-md active:scale-[0.97] transition-[transform,border-color,background-color] duration-200 ease-[var(--ease-out)] hover:border-black/30 hover:bg-white dark:border-white/15 dark:bg-[#0A0C10]/80 dark:text-zinc-100 dark:hover:border-white/30 dark:hover:bg-white/10"
              >
                <Download className="h-4 w-4 text-brand-blue dark:text-[#00D2FF] transition-transform duration-200 ease-[var(--ease-out)] group-hover:-translate-y-0.5" aria-hidden="true" />
                <span>{t('hero.cta.cv')}</span>
              </a>
            </Magnetic>
          </div>

          {/* Télémétrie & Indicateurs Clés d'Ingénierie Multidisciplinaire */}
          <div className="mt-12 grid w-full max-w-xl grid-cols-3 gap-4 border-t border-black/10 pt-6 text-left dark:border-white/10">
            <div>
              <div className="font-mono text-lg font-bold tabular-nums text-zinc-900 dark:text-white sm:text-xl">15</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t('hero.kpi.systems')}</div>
            </div>
            <div className="border-l border-black/10 pl-4 dark:border-white/10">
              <div className="font-mono text-lg font-bold tabular-nums text-brand-blue dark:text-[#00D2FF] sm:text-xl">4 Axes</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t('hero.kpi.domains')}</div>
            </div>
            <div className="border-l border-black/10 pl-4 dark:border-white/10">
              <div className="font-mono text-lg font-bold tabular-nums text-zinc-900 dark:text-white sm:text-xl">R&D · Intl</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t('hero.kpi.mobility')}</div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : Cadre Optique de Précision & Télémétrie */}
        <div className="relative flex w-full max-w-[280px] sm:max-w-[320px] lg:max-w-md flex-1 items-center justify-center z-10">
          <Magnetic intensity={0.08}>
            <div className="relative aspect-[3/4] w-full min-h-[360px] max-w-[310px] rounded-2xl border border-black/15 bg-white/80 p-2.5 shadow-2xl backdrop-blur-md dark:border-white/15 dark:bg-[#0A0C10]/90">
              {/* Repères d'alignement optique (Fiducials) */}
              <span aria-hidden="true" className="pointer-events-none absolute -left-1.5 -top-1.5 h-3 w-3 border-l-2 border-t-2 border-brand-blue dark:border-[#00D2FF]" />
              <span aria-hidden="true" className="pointer-events-none absolute -right-1.5 -top-1.5 h-3 w-3 border-r-2 border-t-2 border-brand-blue dark:border-[#00D2FF]" />
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-1.5 -left-1.5 h-3 w-3 border-b-2 border-l-2 border-brand-blue dark:border-[#00D2FF]" />
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-3 w-3 border-b-2 border-r-2 border-brand-blue dark:border-[#00D2FF]" />

              <div className="relative h-full w-full overflow-hidden rounded-xl border border-black/10 bg-zinc-900 dark:border-white/10 group">
                <Image 
                  src="/photo.webp" 
                  alt="Enrique Alex NDJAKOU KEMAYOU" 
                  fill 
                  className="object-cover z-10 transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 310px"
                  priority
                  fetchPriority="high"
                  decoding="sync"
                />

                {/* Bandeau de télémétrie inférieur */}
                <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-white/10 bg-black/75 px-3.5 py-2.5 backdrop-blur-md">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-200">
                    POLYTECH // GEM · R&D
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-[#00D2FF]">
                    51.03°N 02.37°E
                  </span>
                </div>
              </div>
            </div>
          </Magnetic>
        </div>

      </div>
    </section>
  );
}
