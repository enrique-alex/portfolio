'use client';

import { useState } from 'react';
import { motion, Variants, useReducedMotion, AnimatePresence } from 'framer-motion';
import MagneticProjectCard from './MagneticProjectCard';
import ProjectCardSkeleton from './ProjectCardSkeleton';
import { Project } from '@/lib/data';
import { useProjectsData } from '@/components/theme/ProjectsProvider';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/theme/LanguageProvider';

export default function ProjectsGrid() {
    const shouldReduceMotion = useReducedMotion();
    const router = useRouter();
    const { projects: rawProjectsData, isLoading, error } = useProjectsData();
    const projectsData = Array.isArray(rawProjectsData) ? rawProjectsData : [];
    const { t } = useLanguage();
    
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Extraction des catégories uniques (l'ordre d'apparition originel est conservé)
    const categories = Array.from(new Set(projectsData.map(p => p.category)));

    const filteredProjects = activeCategory 
        ? projectsData.filter(p => p.category === activeCategory)
        : projectsData;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.09,
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18, scale: 0.97 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: shouldReduceMotion ? 0 : undefined,
                type: shouldReduceMotion ? false : 'spring',
                stiffness: 260,
                damping: 26,
            }
        },
        exit: { opacity: 0, scale: 0.96, transition: { duration: 0.18 } }
    };

    const handleProjectClick = (project: Project) => {
        router.push(`/projects/${project.slug}`);
    };

    return (
        <div className="flex w-full flex-col gap-8 md:gap-12">
            {/* Système de filtres (Catégories) avec pilule ressort partagée */}
            <motion.div 
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: shouldReduceMotion ? false : 'spring', stiffness: 280, damping: 28 }}
                className="flex flex-wrap items-center justify-start gap-2 border-b border-black/10 pb-6 dark:border-white/10"
            >
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`relative rounded-full px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                        activeCategory === null
                            ? 'text-white dark:text-zinc-950'
                            : 'border border-black/10 bg-white/60 text-zinc-700 hover:border-black/25 hover:text-zinc-950 dark:border-white/10 dark:bg-[#0A0C10]/70 dark:text-zinc-300 dark:hover:border-white/25 dark:hover:text-white'
                    }`}
                >
                    {activeCategory === null && (
                        <motion.span
                            layoutId="project-filter-pill"
                            className="absolute inset-0 -z-10 rounded-full bg-zinc-900 dark:bg-white"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10">{t('projects.filters.all')}</span>
                </button>
                {categories.map((category) => {
                    const isSelected = activeCategory === category;
                    return (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`relative rounded-full px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                                isSelected
                                    ? 'text-white dark:text-zinc-950'
                                    : 'border border-black/10 bg-white/60 text-zinc-700 hover:border-black/25 hover:text-zinc-950 dark:border-white/10 dark:bg-[#0A0C10]/70 dark:text-zinc-300 dark:hover:border-white/25 dark:hover:text-white'
                            }`}
                        >
                            {isSelected && (
                                <motion.span
                                    layoutId="project-filter-pill"
                                    className="absolute inset-0 -z-10 rounded-full bg-zinc-900 dark:bg-white"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{category}</span>
                        </button>
                    );
                })}
            </motion.div>

            {/* Grille de projets */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="grid w-full auto-rows-[380px] grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:auto-rows-[410px]"
            >
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, index) => {
                            let spanClasses = "col-span-1 row-span-1";
                            const isFeatured = false; // Les squelettes sont uniformes
                            if (isFeatured) {
                                spanClasses = "md:col-span-2 md:row-span-1";
                            }
                            return (
                                <div key={`skeleton-${index}`} className={spanClasses}>
                                    <ProjectCardSkeleton isFeatured={isFeatured} />
                                </div>
                            );
                        })
                    ) : error ? (
                        <div className="col-span-1 md:col-span-3 lg:col-span-3 flex min-h-[380px] items-center justify-center rounded-[2rem] border border-black/5 bg-black/[0.02] dark:border-white/5 dark:bg-white/[0.02]">
                            <p className="text-zinc-500 dark:text-zinc-400">
                                {error}
                            </p>
                        </div>
                    ) : (
                        filteredProjects.map((project) => {
                            let spanClasses = "col-span-1 row-span-1";
                            
                            // Maintien de l'asymétrie Bento via le champ éditorial
                            if (project.isFeatured) {
                                spanClasses = "md:col-span-2 md:row-span-1"; // Rectangle large
                            } else {
                                spanClasses = "md:col-span-1 md:row-span-1"; // Carré normal
                            }

                            const canonicalIdx = projectsData.findIndex((p) => p.id === project.id);
                            const seqNum = String((canonicalIdx >= 0 ? canonicalIdx : 0) + 1).padStart(2, '0');

                            return (
                                <motion.div 
                                    layout
                                    key={project.id} 
                                    variants={itemVariants} 
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    className={spanClasses}
                                >
                                    <MagneticProjectCard 
                                        project={project} 
                                        isFeatured={project.isFeatured} 
                                        sequenceNumber={seqNum}
                                        onClick={handleProjectClick} 
                                    />
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
