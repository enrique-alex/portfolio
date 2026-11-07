'use client';

import ProjectsGrid from "@/components/ui/ProjectsGrid";
import { Database } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/components/theme/LanguageProvider";

export default function ProjectsSection() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
      <section id="projects" className="section-contain relative w-full overflow-hidden pb-32 pt-32 scroll-mt-32">
        
        {/* Trame topographique subtile */}
        <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_100%_at_50%_0%,#000_10%,transparent_110%)] md:bg-[size:96px_96px]" />

        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 relative z-10">
          
          {/* HEADER - Engineered Systems */}
          <motion.div 
            className="mb-14 flex w-full flex-col items-start border-b border-black/10 pb-6 dark:border-white/10 lg:mb-16"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : undefined, type: shouldReduceMotion ? false : 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="flex items-center gap-3 mb-3 text-zinc-500 dark:text-zinc-400">
              <Database className="h-4 w-4 text-brand-blue dark:text-[#00D2FF]" aria-hidden="true" />
              <span className="font-mono text-[10px] font-semibold tracking-[0.3em] uppercase">
                {t('projects.header.tag')}
              </span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
              {t('projects.header.title')}
            </h2>
            <p className="mt-4 max-w-3xl font-mono text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t('projects.header.subtitle')}
            </p>
          </motion.div>
          
          {/* Grille Bento Asymétrique */}
          <ProjectsGrid />
        </div>
      </section>
  );
}
