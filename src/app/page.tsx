'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import ProjectsGrid from "@/components/ui/ProjectsGrid";
import Magnetic from "@/components/ui/Magnetic";
import AcademicJourney from "@/components/ui/AcademicJourney";
import SkillsSection from "@/components/ui/SkillsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import { Database } from "lucide-react";
import { motion } from "framer-motion";

const TARGET_TEXT = "Enrique Alex\nNDJAKOU KEMAYOU";
const CYCLES_PER_LETTER = 3; // Augmenté pour ralentir le décryptage par lettre
const SHUFFLE_TIME = 45; // Lègèrement augmenté pour rendre les caractères plus lisibles pendant le shuffle
const CHARS = "0101010189ABCDEF!@#$%^&*()_+-=[]{}|;':,./<>?";

export default function Home() {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let pos = 0;
    let frame = 0;
    
    // Délai initial court pour laisser le temps au rendu WebGL de s'afficher
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (frame >= TARGET_TEXT.length * CYCLES_PER_LETTER) {
          clearInterval(interval);
          setDisplayText(TARGET_TEXT);
          return;
        }

        const scramble = TARGET_TEXT.split("").map((char, index) => {
          if (char === '\n') return '\n'; // Ne jamais mélanger le saut de ligne
          if (pos >= index) return TARGET_TEXT[index];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("");

        setDisplayText(scramble);
        frame++;
        if (frame % CYCLES_PER_LETTER === 0) pos++;
      }, SHUFFLE_TIME);
      
      return () => clearInterval(interval);
    }, 300);

    return () => clearTimeout(timeout);
  }, []);
  return (
    <main className="relative flex flex-col items-center justify-center overflow-hidden">
      
      {/* 
        Le Background Ambient
        Un maillage très subtil (Grid) couplé à des halos lumineux qui se fondent avec l'animation de fond
      */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Halos lumineux (Glows) */}
      <div className="absolute top-0 -z-10 h-[500px] w-[500px] rounded-full bg-brand-blue/20 blur-[120px]"></div>
      <div className="absolute top-[20%] right-[10%] -z-10 h-[300px] w-[300px] translate-x-1/2 rounded-full bg-brand-red/10 blur-[100px]"></div>

      {/* Section Home (Prend 100% de la hauteur de l'écran) */}
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
                  <span className="tracking-widest uppercase text-xs font-bold text-zinc-700 dark:text-zinc-300">System Online <span className="mx-1">•</span> En poste chez Minakem</span>
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
              <span className="font-semibold text-zinc-900 dark:text-white/80">Élève Ingénieur en Énergie & Industrie du Futur (Polytech Lille).</span><br/>
              Actuellement Ingénieur Apprenti en Automatisme et Informatique Industrielle chez <span className="font-medium text-brand-blue dark:text-[#8AB4F8]">Minakem Dunkerque</span>. Je conçois et déploie des solutions reliant l'intelligence logicielle (C/C++, Python) aux architectures matérielles et industrielles critiques.
            </p>

            {/* CTA d'Exploration */}
            <div className="mt-12 flex items-center justify-center lg:justify-start">
              <Magnetic intensity={0.25}>
                <button 
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="group relative flex items-center gap-4 overflow-hidden rounded-full bg-zinc-900 px-8 py-4 font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <span className="relative z-10 tracking-wide uppercase text-sm">Séquence d'Amorçage</span>
                  <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 dark:bg-black/10 transition-transform group-hover:translate-x-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </button>
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

      {/* 
       * LIGNE LASER ANIMÉE (Séparateur Technologique)
       */}
      <div className="relative h-[1px] w-full bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent dark:via-brand-blue/30">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] w-[150px] bg-brand-blue blur-[2px]"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[4px] w-[50px] bg-white blur-[4px] dark:bg-brand-blue/80"></div>
      </div>

      {/* 
       * SECTION PARCOURS ACADEMIQUE (PCB Trace & Typography)
       */}
      <AcademicJourney />

      {/* 
       * LIGNE LASER ANIMÉE (Séparateur Technologique)
       */}
      <div className="relative h-[1px] w-full bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent dark:via-brand-blue/30">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] w-[150px] bg-brand-blue blur-[2px]"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[4px] w-[50px] bg-white blur-[4px] dark:bg-brand-blue/80"></div>
      </div>

      {/* 
       * SECTION EXPÉRIENCE (System Process Monitor)
       */}
      <ExperienceSection />

      {/* 
       * LIGNE LASER ANIMÉE (Séparateur Technologique)
       */}
      <div className="relative h-[1px] w-full bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent dark:via-brand-blue/30">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] w-[150px] bg-brand-blue blur-[2px]"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[4px] w-[50px] bg-white blur-[4px] dark:bg-brand-blue/80"></div>
      </div>

      {/* 
       * SECTION PROJETS (Cinematic Engineering Architecture)
       * Plus de fond plein, on intègre un espace tridimensionnel 
       */}
      <section id="projects" className="relative w-full overflow-hidden pb-32 pt-32">
        
        {/* 1. GLASS GRID INFINIE & REVEAL TOPOGRAPHIQUE */}
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_100%_at_50%_0%,#000_10%,transparent_110%)] md:bg-[size:100px_100px]"></div>
        
        {/* 2. TYPOGRAPHY "OUTLINE" FLOTTANTE (Parallax Background) */}
        <div className="pointer-events-none absolute left-1/2 top-40 -z-10 -translate-x-1/2 select-none opacity-[0.03] dark:opacity-[0.02]">
           <h2 className="text-[15vw] font-black tracking-[0.2em] text-transparent outline-none" style={{ WebkitTextStroke: "2px currentColor", color: "black" }}>
             <span className="dark:hidden">ENGINEER</span>
           </h2>
           {/* Version Dark Mode car WebkitTextStroke gère mal les classes dynamiques */}
           <h2 className="absolute inset-0 hidden text-[15vw] font-black tracking-[0.2em] text-transparent outline-none dark:block" style={{ WebkitTextStroke: "2px white" }}>
             ENGINEER
           </h2>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 relative z-10">
          
          {/* HEADER - System Process Monitor Style */}
          <motion.div 
            className="mb-16 flex w-full flex-col items-start border-b border-black/10 pb-6 dark:border-white/10 lg:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-3 text-zinc-500 dark:text-zinc-400">
              <Database className="h-4 w-4" />
              <span className="font-mono text-[10px] font-semibold tracking-[0.3em] uppercase">
                System.Process.Monitor
              </span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
              Mes Projets
            </h2>
            <p className="mt-4 font-mono text-sm text-zinc-500 dark:text-zinc-400">
              {'>'} 8 modules logiciels et matériels conçus du sol au plafond.
            </p>
          </motion.div>
          
          {/* Grille Bento Box (Effet Glassmorphism Cards) */}
          <ProjectsGrid />
        </div>
      </section>

      {/* LIGNE LASER ANIMÉE (Séparateur Projets → Compétences) */}
      <div className="relative h-[1px] w-full bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent dark:via-brand-blue/30">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] w-[150px] bg-brand-blue blur-[2px]"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[4px] w-[50px] bg-white blur-[4px] dark:bg-brand-blue/80"></div>
      </div>

      {/* ────────── SECTION 4: COMPETENCES ────────── */}
      <SkillsSection />
    </main>
  );
}