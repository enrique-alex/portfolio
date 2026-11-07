'use client';

import { useState } from 'react';
import { motion, Variants, useReducedMotion, AnimatePresence } from 'framer-motion';
import MagneticProjectCard from './MagneticProjectCard';
import ProjectCardSkeleton from './ProjectCardSkeleton';
import { Project } from '@/lib/data';
import { useProjectsData } from '@/components/theme/ProjectsProvider';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/theme/LanguageProvider';

/**
 * Calcule les classes d'occupation Bento (Mobile 1 col / Tablette 2 cols / Desktop 3 cols)
 * en garantissant zéro cellule orpheline quel que soit le filtre actif et en alternant
 * gauche/droite les cartes larges sur grand écran.
 */
function getAdaptiveBentoSpan(index: number, list: Project[]): { spanClasses: string; isCardWide: boolean } {
    const total = list.length;
    const project = list[index];

    if (total === 1) {
        return {
            spanClasses: 'col-span-1 md:col-span-2 lg:col-span-3',
            isCardWide: true,
        };
    }

    if (total === 2) {
        return index === 0
            ? { spanClasses: 'col-span-1 md:col-span-1 lg:col-span-2', isCardWide: true }
            : { spanClasses: 'col-span-1 md:col-span-1 lg:col-span-1', isCardWide: false };
    }

    if (total === 3) {
        return index === 0
            ? { spanClasses: 'col-span-1 md:col-span-2 lg:col-span-1', isCardWide: project.isFeatured }
            : { spanClasses: 'col-span-1 md:col-span-1 lg:col-span-1', isCardWide: false };
    }

    // Pour N > 3 (ex: les 15 projets) :
    // Sur Tablette (2 colonnes) : les projets isFeatured prennent 2 colonnes; si le nombre de projets
    // non-featured est impair, le dernier s'étend sur 2 colonnes pour fermer la grille proprement.
    const nonFeaturedIndices = list.map((p, i) => (!p.isFeatured ? i : -1)).filter((i) => i !== -1);
    const isLastOddNonFeaturedOnTablet =
        !project.isFeatured &&
        nonFeaturedIndices.length % 2 === 1 &&
        index === nonFeaturedIndices[nonFeaturedIndices.length - 1];
    const mdClass = project.isFeatured || isLastOddNonFeaturedOnTablet ? 'md:col-span-2' : 'md:col-span-1';

    // Sur Desktop (3 colonnes) : chaque carte 2-colonnes doit être appariée avec une carte 1-colonne (2 + 1 = 3),
    // et le reste des cartes 1-colonne doit être un multiple de 3 ((total + wideCount) % 3 === 0).
    const featuredIndices = list.map((p, i) => (p.isFeatured ? i : -1)).filter((i) => i !== -1);
    const maxPairableWide = Math.min(featuredIndices.length, Math.floor(total / 2));
    let wideCount = maxPairableWide;
    while (wideCount > 0 && (total + wideCount) % 3 !== 0) {
        wideCount--;
    }

    const wideRank = featuredIndices.indexOf(index);
    const isDesktopWide = wideRank !== -1 && wideRank < wideCount;

    let lgClass = 'lg:col-span-1';
    if (isDesktopWide) {
        // Alternance gauche (cols 1-2) / droite (cols 2-3) pour un rythme Bento asymétrique équilibré
        lgClass = wideRank % 2 === 1 ? 'lg:col-start-2 lg:col-span-2' : 'lg:col-span-2';
    }

    return {
        spanClasses: `col-span-1 ${mdClass} ${lgClass}`,
        isCardWide: project.isFeatured || isDesktopWide,
    };
}

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
            {/* Système de filtres (Catégories) : défilement horizontal fluide sur mobile, retour à la ligne sur tablette/desktop */}
            <motion.div 
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: shouldReduceMotion ? false : 'spring', stiffness: 280, damping: 28 }}
                className="flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide border-b border-black/10 pb-4 md:flex-wrap md:overflow-visible md:pb-6 dark:border-white/10"
                style={{ scrollbarWidth: 'none' }}
            >
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`relative flex-shrink-0 rounded-full px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider active:scale-[0.97] transition-[transform,color,border-color,background-color] duration-150 ease-[var(--ease-out)] ${
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
                    <span className="relative z-10 inline-flex items-center gap-1.5">
                        <span>{t('projects.filters.all')}</span>
                        <span className="text-[10px] opacity-70 tabular-nums">({projectsData.length})</span>
                    </span>
                </button>
                {categories.map((category) => {
                    const isSelected = activeCategory === category;
                    const count = projectsData.filter((p) => p.category === category).length;
                    return (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`relative flex-shrink-0 rounded-full px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider active:scale-[0.97] transition-[transform,color,border-color,background-color] duration-150 ease-[var(--ease-out)] ${
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
                            <span className="relative z-10 inline-flex items-center gap-1.5">
                                <span>{category}</span>
                                <span className="text-[10px] opacity-70 tabular-nums">({count})</span>
                            </span>
                        </button>
                    );
                })}
            </motion.div>

            {/* Grille Bento adaptative : 1 col Mobile, 2 cols Tablette, 3 cols Desktop avec remplissage dense sans trou */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="grid w-full grid-cols-1 gap-4 auto-rows-[minmax(360px,auto)] md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:auto-rows-[minmax(405px,auto)] grid-flow-row-dense"
            >
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, index) => {
                            const spanClasses = index === 0 ? "col-span-1 md:col-span-2 lg:col-span-2" : "col-span-1";
                            return (
                                <div key={`skeleton-${index}`} className={spanClasses}>
                                    <ProjectCardSkeleton isFeatured={index === 0} />
                                </div>
                            );
                        })
                    ) : error ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex min-h-[360px] items-center justify-center rounded-2xl border border-black/5 bg-black/[0.02] dark:border-white/5 dark:bg-white/[0.02]">
                            <p className="text-zinc-500 dark:text-zinc-400">
                                {error}
                            </p>
                        </div>
                    ) : (
                        filteredProjects.map((project, index) => {
                            const { spanClasses, isCardWide } = getAdaptiveBentoSpan(index, filteredProjects);
                            const canonicalIdx = projectsData.findIndex((p) => p.id === project.id);
                            const seqNum = String((canonicalIdx >= 0 ? canonicalIdx : 0) + 1).padStart(2, '0');

                            return (
                                <motion.div 
                                    key={project.id} 
                                    variants={itemVariants} 
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    className={spanClasses}
                                >
                                    <MagneticProjectCard 
                                        project={project} 
                                        isFeatured={isCardWide} 
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

