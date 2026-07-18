'use client';

import ProjectsGrid from "@/components/ui/ProjectsGrid";
import { Database } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/components/theme/LanguageProvider";

export default function ProjectsSection() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
      <section id="projects" className="relative w-full overflow-hidden pb-32 pt-32 scroll-mt-32">
        
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
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
          >
            <div className="flex items-center gap-3 mb-3 text-zinc-500 dark:text-zinc-400">
              <Database className="h-4 w-4" />
              <span className="font-mono text-[10px] font-semibold tracking-[0.3em] uppercase">
                {t('projects.header.tag')}
              </span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
              {t('projects.header.title')}
            </h2>
            <p className="mt-4 font-mono text-sm text-zinc-500 dark:text-zinc-400">
              {t('projects.header.subtitle')}
            </p>
          </motion.div>
          
          {/* Grille Bento Box (Effet Glassmorphism Cards) */}
          <ProjectsGrid />
        </div>
      </section>
  );
}
