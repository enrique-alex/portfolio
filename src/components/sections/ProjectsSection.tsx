'use client';

import ProjectsGrid, { DECK_PAGE_SIZE } from "@/components/ui/ProjectsGrid";
import { Database, Layers } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/components/theme/LanguageProvider";
import { useProjectsData } from "@/components/theme/ProjectsProvider";

export default function ProjectsSection() {
  const { locale, t } = useLanguage();
  const { projects } = useProjectsData();
  const shouldReduceMotion = useReducedMotion();

  const totalSystems = Array.isArray(projects) && projects.length > 0 ? projects.length : 15;
  const flagshipSystems = Array.isArray(projects) ? projects.filter((p) => p.isFeatured).length : 7;

  return (
      <section id="projects" className="section-contain relative w-full overflow-x-clip py-24 lg:py-32 scroll-mt-32">
        
        {/* Trame topographique subtile */}
        <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_100%_at_50%_0%,#000_10%,transparent_110%)] md:bg-[size:96px_96px]" />

        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 relative z-10">
          
          {/* HEADER - Engineered Systems + Bounded Telemetry Summary */}
          <motion.div 
            className="mb-10 flex w-full flex-col justify-between gap-6 border-b border-black/10 pb-6 dark:border-white/10 lg:mb-12 lg:flex-row lg:items-end"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : undefined, type: shouldReduceMotion ? false : 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-3 mb-3 text-zinc-600 dark:text-zinc-400">
                <Database className="h-4 w-4 text-blue-600 dark:text-[#00D2FF]" aria-hidden="true" />
                <span className="font-mono text-[11px] font-semibold tracking-[0.3em] uppercase">
                  {t('projects.header.tag')}
                </span>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
                {t('projects.header.title')}
              </h2>
              <p className="mt-4 max-w-[65ch] font-mono text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {t('projects.header.subtitle')}
              </p>
            </div>

            {/* Cartouche Télémétrique Haute-Précision (Vengeance UI / Skiper UI) */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-end rounded-xl border border-black/10 bg-white/80 px-4 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-[#0A0C10]/85">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-[#00D2FF]" aria-hidden="true" />
                <span className="font-mono text-xs font-bold tabular-nums text-zinc-900 dark:text-white">
                  {totalSystems}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  {t('projects.count.many')}
                </span>
              </div>
              <span aria-hidden="true" className="h-3.5 w-px bg-black/10 dark:bg-white/15" />
              <div className="font-mono text-[11px] font-semibold tabular-nums text-blue-600 dark:text-[#00D2FF]">
                {flagshipSystems} {locale === 'fr' ? 'Phares' : 'Flagship'}
              </div>
              <span aria-hidden="true" className="h-3.5 w-px bg-black/10 dark:bg-white/15" />
              <div className="font-mono text-[11px] tabular-nums text-zinc-600 dark:text-zinc-400">
                {locale === 'fr' ? `Plateau ≤ ${DECK_PAGE_SIZE} / vue` : `Deck ≤ ${DECK_PAGE_SIZE} / view`}
              </div>
            </div>
          </motion.div>
          
          {/* Architecture d'Exploration Scalable (Vitrine Bento Paginée + Index Système) */}
          <ProjectsGrid />
        </div>
      </section>
  );
}
