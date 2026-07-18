'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Magnetic from "@/components/ui/Magnetic";
import { Download } from "lucide-react";
import { useLanguage } from "@/components/theme/LanguageProvider";

const TARGET_TEXT = "Enrique Alex\nNDJAKOU KEMAYOU";
const CYCLES_PER_LETTER = 3; // Augmenté pour ralentir le décryptage par lettre
const SHUFFLE_TIME = 45; // Lègèrement augmenté pour rendre les caractères plus lisibles pendant le shuffle
const CHARS = "0101010189ABCDEF!@#$%^&*()_+-=[]{}|;':,./<>?";

export default function HeroSection() {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let pos = 0;
    let frame = 0;
    let intervalId: ReturnType<typeof setInterval>;
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const startAnimation = () => {
      // Petit délai pour laisser la transition de sortie du preloader se terminer
      timeoutId = setTimeout(() => {
        intervalId = setInterval(() => {
          if (frame >= TARGET_TEXT.length * CYCLES_PER_LETTER) {
            clearInterval(intervalId);
            setDisplayText(TARGET_TEXT);
            return;
          }

          const scramble = TARGET_TEXT.split("").map((char, index) => {
            if (char === '\n') return '\n';
            if (pos >= index) return TARGET_TEXT[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join("");

          setDisplayText(scramble);
          frame++;
          if (frame % CYCLES_PER_LETTER === 0) pos++;
        }, SHUFFLE_TIME);
      }, 600); // Attend la fin de la transition de sortie du preloader (0.8s)
    };

    window.addEventListener('preloader-complete', startAnimation);

    return () => {
      window.removeEventListener('preloader-complete', startAnimation);
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  const { t } = useLanguage();

  return (
      <section id="home" className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-4">
        
        <div className="mx-auto flex w-full max-w-7xl flex-col-reverse items-center justify-between gap-12 lg:flex-row lg:gap-20">
          
          {/* COLONNE GAUCHE : Typographie & Informations */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left z-10 w-full">
            
            {/* Badge "Hardware Status" */}
            <div className="mb-6">
              <Magnetic intensity={0.2}>
                <div className="group relative inline-flex cursor-pointer items-center gap-3 rounded-full border border-black/10 bg-black/5 px-5 py-2 text-sm font-medium text-zinc-900 backdrop-blur-md transition-colors hover:bg-black/10 dark:border-white/5 dark:bg-[#050505]/60 dark:text-zinc-200 dark:hover:bg-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_2px_rgba(34,197,94,0.4)]"></span>
                  </span>
                  <span className="tracking-widest uppercase text-xs font-bold text-zinc-700 dark:text-zinc-300">{t('hero.badge')} <span className="mx-1">•</span> {t('hero.badge.company')}</span>
                </div>
              </Magnetic>
            </div>

            {/* Titre Principal (Scramble Hardware Reveal) */}
            <h1 className="z-10 w-full text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] tracking-tighter leading-[1.05] font-extrabold">
              <div className={`flex flex-col ${displayText !== TARGET_TEXT ? "font-mono font-normal tracking-tight text-2xl sm:text-4xl md:text-5xl lg:text-6xl" : ""}`}>
                {displayText ? displayText.split('\n').map((line, i) => (
                  <span 
                    key={i} 
                    className={`block whitespace-nowrap text-transparent bg-clip-text ${
                      displayText === TARGET_TEXT 
                        ? (i === 0 
                            ? 'bg-gradient-to-r from-zinc-700 to-zinc-400 dark:from-white/90 dark:to-white/50' 
                            : 'bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400')
                        : 'bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-white/60'
                    }`}
                  >
                    {line}
                    {i === 1 && displayText === TARGET_TEXT && (
                      <span className="text-brand-blue animate-pulse ml-1 inline-block">_</span>
                    )}
                  </span>
                )) : (
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-white/60">INITIALIZING...</span>
                )}
              </div>
            </h1>
            
            <p className="mt-8 max-w-2xl text-base font-light leading-relaxed text-zinc-600 md:text-xl dark:text-white/50">
              <span className="font-semibold text-zinc-900 dark:text-white/80">{t('hero.subtitle.line1')}</span><br/>
              {t('hero.subtitle.line2')} <span className="font-medium text-brand-blue dark:text-[#8AB4F8]">{t('hero.subtitle.company')}</span>{t('hero.subtitle.line3')}
            </p>

            {/* CTAs d'Exploration */}
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Magnetic intensity={0.25}>
                <button 
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="group relative flex items-center gap-4 overflow-hidden rounded-full bg-zinc-900 px-8 py-4 font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <span className="relative z-10 tracking-wide uppercase text-sm">{t('hero.cta.explore')}</span>
                  <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 dark:bg-black/10 transition-transform group-hover:translate-x-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </button>
              </Magnetic>

              <Magnetic intensity={0.2}>
                <a 
                  href="/cv-enrique-ndjakou.pdf"
                  download="CV_Enrique_Ndjakou.pdf"
                  className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-black/10 bg-black/5 px-8 py-4 font-semibold text-zinc-900 transition-all hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  <Download className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
                  <span className="font-mono text-xs uppercase tracking-widest">{t('hero.cta.cv')}</span>
                </a>
              </Magnetic>
            </div>
          </div>

          {/* COLONNE DROITE : Emplacement Photo (Avatar de Haute Technologie) */}
          <div className="relative flex w-full max-w-[280px] sm:max-w-[320px] lg:max-w-md flex-1 items-center justify-center z-10">
            
            {/* L'Anneau Scientifique (Orbital Rings) */}
            <div className="absolute inset-0 z-0 animate-[spin_20s_linear_infinite] rounded-full border-[0.5px] border-black/10 border-t-brand-blue/40 dark:border-white/5 dark:border-t-brand-blue/60"></div>
            <div className="absolute -inset-6 z-0 animate-[spin_30s_linear_infinite_reverse] rounded-full border-[0.5px] border-black/5 border-b-brand-red/30 dark:border-white/[0.03] dark:border-b-brand-red/40"></div>
            
            {/* Conteneur Capsule / Portrait */}
            <Magnetic intensity={0.1}>
              <div className="relative aspect-[3/4] w-full min-h-[350px] max-w-[300px] overflow-hidden rounded-[2.5rem] border border-black/5 bg-white/10 p-2 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-black/20 ring-1 ring-black/5 dark:ring-white/10">
                <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 group">
                  
                  {/* Overlay Cyberpunk */}
                  <div className="absolute inset-0 bg-brand-blue/10 mix-blend-overlay z-30 pointer-events-none transition-opacity group-hover:opacity-0"></div>
                  
                  {/* Photo de Profil */}
                  <Image 
                    src="/photo.jpeg" 
                    alt="Enrique Alex NDJAKOU KEMAYOU" 
                    fill 
                    className="object-cover z-20 grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 300px"
                    priority
                  />

                </div>
              </div>
            </Magnetic>
          </div>

        </div>
      </section>
  );
}
