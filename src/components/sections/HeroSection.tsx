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
      
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row lg:gap-20 pt-24 lg:pt-0">
        
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
          
          {/* Badge "Hardware Status" */}
          <div className="mt-6 mb-2">
            <Magnetic intensity={0.2}>
              <div className="group relative inline-flex cursor-pointer items-center gap-3 rounded-full border border-black/10 bg-black/5 px-5 py-2 text-sm font-medium text-zinc-900 backdrop-blur-md dark:border-white/5 dark:bg-[#050505]/60 dark:text-zinc-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] overflow-hidden">
                
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_2px_rgba(34,197,94,0.4)]"></span>
                </span>
                <span className="relative tracking-widest uppercase text-xs font-bold text-zinc-700 dark:text-zinc-300">{t('hero.badge')} <span className="mx-1">•</span> {t('hero.badge.company')}</span>
              </div>
            </Magnetic>
          </div>

          <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-zinc-600 md:text-xl dark:text-white/50">
            <span className="font-semibold text-zinc-900 dark:text-white/80">{t('hero.subtitle.line1')}</span><br/>
            {t('hero.subtitle.line2')} <span className="font-medium text-brand-blue dark:text-[#8AB4F8]">{t('hero.subtitle.company')}</span>{t('hero.subtitle.line3')}
          </p>

          {/* CTAs d'Exploration */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Magnetic intensity={0.25}>
              <button 
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} 
                className="group relative flex items-center gap-4 overflow-hidden rounded-full bg-zinc-900 px-8 py-4 font-semibold text-white active:scale-95 transition-transform duration-200 dark:bg-white dark:text-zinc-900"
              >
                
                <span className="relative z-10 tracking-wide uppercase text-sm">{t('hero.cta.explore')}</span>
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 dark:bg-black/10 transition-transform duration-300 group-hover:translate-x-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </button>
            </Magnetic>

            <Magnetic intensity={0.2}>
              <a 
                href="/cv-enrique-ndjakou.pdf"
                download="CV_Enrique_Ndjakou.pdf"
                className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-black/10 bg-black/5 px-8 py-4 font-semibold text-zinc-900 active:scale-95 transition-transform duration-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                
                <Download className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1" aria-hidden="true" />
                <span className="relative z-10 font-mono text-xs uppercase tracking-widest">{t('hero.cta.cv')}</span>
              </a>
            </Magnetic>
          </div>
        </div>

        {/* COLONNE DROITE : Emplacement Photo (Avatar de Haute Technologie) */}
        <div className="relative flex w-full max-w-[280px] sm:max-w-[320px] lg:max-w-md flex-1 items-center justify-center z-10">
          
          {/* L'Anneau Scientifique (Orbital Rings) - Isolés sur calques GPU */}
          <div aria-hidden="true" className="orbital-ring orbital-ring-clockwise pointer-events-none absolute inset-0 z-0 rounded-full border-[0.5px] border-black/10 border-t-brand-blue/40 dark:border-white/5 dark:border-t-brand-blue/60"></div>
          <div aria-hidden="true" className="orbital-ring orbital-ring-counter pointer-events-none absolute -inset-4 sm:-inset-6 z-0 rounded-full border-[0.5px] border-black/5 border-b-brand-red/30 dark:border-white/[0.03] dark:border-b-brand-red/40"></div>
          
          {/* Conteneur Capsule / Portrait */}
          <Magnetic intensity={0.1}>
            <div className="relative aspect-[3/4] w-full min-h-[350px] max-w-[300px] overflow-hidden rounded-[2.5rem] border border-black/5 bg-white/10 p-2 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-black/20 ring-1 ring-black/5 dark:ring-white/10">
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 group">
                
                {/* Overlay Cyberpunk */}
                <div className="absolute inset-0 bg-brand-blue/10 mix-blend-overlay z-30 pointer-events-none transition-opacity duration-500 group-hover:opacity-0"></div>
                
                {/* Photo de Profil */}
                <Image 
                  src="/photo.webp" 
                  alt="Enrique Alex NDJAKOU KEMAYOU" 
                  fill 
                  className="object-cover z-20 grayscale hover:grayscale-0 transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 300px"
                  priority
                  fetchPriority="high"
                />

              </div>
            </div>
          </Magnetic>
        </div>

      </div>
    </section>
  );
}
