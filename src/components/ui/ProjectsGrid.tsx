'use client';

import { useState } from 'react';
import { motion, Variants, useReducedMotion, AnimatePresence } from 'framer-motion';
import MagneticProjectCard from './MagneticProjectCard';
import { useProjectsData, Project } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/theme/LanguageProvider';

export default function ProjectsGrid() {
    const shouldReduceMotion = useReducedMotion();
    const router = useRouter();
    const projectsData = useProjectsData();
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
                staggerChildren: shouldReduceMotion ? 0 : 0.15, // Effet d'apparition en cascade
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9, filter: shouldReduceMotion ? 'blur(0px)' : 'blur(10px)' },
        show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: shouldReduceMotion ? 0 : 0.4, type: shouldReduceMotion ? false : 'spring', stiffness: 100, damping: 20 } },
        exit: { opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.2 } }
    };

    const handleProjectClick = (project: Project) => {
        // Redirection vers la page détaillée pour le Shared Layout (Morphing Spatial)
        router.push(`/projects/${project.slug}`);
    };

    return (
        <div className="flex w-full flex-col gap-8 md:gap-12">
            {/* Système de filtres (Catégories) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-wrap items-center justify-center gap-3"
            >
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                        activeCategory === null
                            ? 'bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                >
                    {t('projects.filters.all')}
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                            activeCategory === category
                                ? 'bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </motion.div>

            {/* Grille de projets */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid w-full auto-rows-[380px] grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:auto-rows-[420px]"
            >
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project, index) => {
                        let spanClasses = "col-span-1 row-span-1";
                        
                        // Maintien de l'asymétrie Bento sur les éléments filtrés
                        if (index === 0 || index === 4) {
                            spanClasses = "md:col-span-2 md:row-span-1"; // Rectangle large
                        } else {
                            spanClasses = "md:col-span-1 md:row-span-1"; // Carré normal
                        }

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
                                    isFeatured={index === 0 || index === 4} 
                                    sequenceNumber={index === 0 ? '01' : index === 4 ? '02' : undefined}
                                    onClick={handleProjectClick} 
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
