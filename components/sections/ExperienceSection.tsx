'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Terminal, Activity, CheckCircle2, Cpu, Network } from 'lucide-react';

interface ExperienceData {
  id: string;
  title: string;
  company: string;
  period: string;
  status: 'ACTIVE' | 'COMPLETED';
  missions: string;
  skills: string[];
}

const experiencesData: ExperienceData[] = [
  {
    id: 'minakem',
    title: 'Ingénieur Apprenti en Automatisme et Informatique Industrielle',
    company: 'Minakem Dunkerque',
    period: 'Actuellement',
    status: 'ACTIVE',
    missions: 'Déploiement, maintenance et optimisation de solutions d\'informatique industrielle. Création de passerelles entre l\'intelligence logicielle et les architectures matérielles critiques de production.',
    skills: ['Automatisme', 'Informatique Industrielle', 'C/C++', 'Python']
  },
  {
    id: 'carrefour',
    title: 'Assistant Vente Drive',
    company: 'Carrefour (Charleville-Mézières)',
    period: 'Depuis février 2024',
    status: 'COMPLETED',
    missions: 'Gestion logistique rigoureuse en flux tendu. Collaboration en équipe pour l\'optimisation des processus de préparation de commandes lors des pics de charge. Développement de compétences organisationnelles en environnement dynamique.',
    skills: ['Logistique', 'Travail en équipe', 'Gestion du stress', 'Optimisation des flux']
  }
];

export default function ExperienceSection() {
  const [expandedId, setExpandedId] = useState<string | null>(experiencesData[0].id);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section id="experience" className="relative w-full py-24 lg:py-32">
      {/* Background Grid & Blur */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(128,128,128,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128,128,128,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 relative z-10">
        
        {/* Header - System Process Monitor Style */}
        <motion.div 
          className="mb-16 flex flex-col items-start border-b border-black/10 pb-6 dark:border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-3 text-zinc-500 dark:text-zinc-400">
            <Activity className="h-4 w-4" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.3em] uppercase">
              System.Process.Monitor
            </span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
            Expérience Professionnelle
          </h2>
          <p className="mt-4 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            {'>'} Initializing historical data routines...
          </p>
        </motion.div>

        {/* Spatial Accordion List */}
        <div className="flex flex-col gap-2">
          {experiencesData.map((exp, index) => {
            const isExpanded = expandedId === exp.id;
            const isActive = exp.status === 'ACTIVE';

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                className="group relative flex flex-col"
              >
                {/* Accordion Header Row */}
                <button
                  onClick={() => toggleExpand(exp.id)}
                  className={`
                    relative z-10 flex w-full flex-col items-start gap-4 border-l-[3px] bg-black/[0.01] px-6 py-6 
                    text-left transition-all duration-500 hover:bg-black/[0.03] 
                    dark:bg-white/[0.01] dark:hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between
                    ${isExpanded ? 'backdrop-blur-sm' : ''}
                    ${isActive ? 'border-emerald-500' : 'border-zinc-300 dark:border-zinc-700'}
                  `}
                >
                  {/* Subtle hover glow for the active border */}
                  {isActive && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-[1px] bg-emerald-500 opacity-0 shadow-[0_0_15px_2px_rgba(16,185,129,0.5)] transition-opacity duration-300 group-hover:opacity-100" />
                  )}

                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        [{exp.period}]
                      </span>
                      
                      {/* LED Status Badge */}
                      <div className={`
                        flex items-center gap-2 rounded border px-2 py-1 font-mono text-[10px] font-bold tracking-widest
                        ${isActive 
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'border-zinc-400/30 bg-zinc-400/10 text-zinc-600 dark:text-zinc-400'}
                      `}>
                        {isActive ? (
                          <>
                            <span className="relative flex h-2 w-2 items-center justify-center">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            </span>
                            ACTIVE
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            COMPLETED
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-zinc-900 transition-colors duration-300 group-hover:text-brand-blue dark:text-zinc-100 dark:group-hover:text-brand-blue sm:text-2xl">
                        {exp.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Network className="h-3.5 w-3.5 text-zinc-400" />
                        <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                          @ {exp.company}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/5 bg-black/[0.02] text-zinc-400 transition-all duration-300 group-hover:border-black/10 group-hover:bg-black/[0.04] group-hover:text-zinc-900 dark:border-white/5 dark:bg-white/[0.02] dark:group-hover:border-white/10 dark:group-hover:bg-white/[0.04] dark:group-hover:text-white sm:mt-0">
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </motion.div>
                  </div>
                </button>

                {/* Expanded Liquid Glass Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      className="overflow-hidden"
                    >
                      <div className={`
                        border-l-[3px] px-6 py-8 backdrop-blur-md sm:px-8
                        ${isActive ? 'border-emerald-500/50 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01]' : 'border-zinc-300 bg-black/[0.02] dark:border-zinc-700 dark:bg-white/[0.02]'}
                      `}>
                        <div className="grid gap-10 md:grid-cols-3">
                          
                          {/* Missions */}
                          <div className="md:col-span-2">
                            <div className="mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                              <Terminal className="h-4 w-4 text-zinc-500" />
                              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                Output.Missions
                              </h4>
                            </div>
                            <p className="border-l-2 border-black/10 pl-4 text-sm leading-relaxed text-zinc-600 dark:border-white/10 dark:text-zinc-400">
                              {exp.missions}
                            </p>
                          </div>

                          {/* Tech Stack / Skills */}
                          <div>
                            <div className="mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                              <Cpu className="h-4 w-4 text-zinc-500" />
                              <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                Sys.Tech_Stack
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {exp.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded border border-black/5 bg-black/[0.03] px-2.5 py-1 font-mono text-xs font-semibold text-zinc-700 transition-colors hover:bg-black/[0.05] dark:border-white/5 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.05]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subtle Divider between items */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-black/5 to-transparent dark:via-white/5" />
              </motion.div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
