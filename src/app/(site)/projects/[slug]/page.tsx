'use client';

import { useParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useProjectsData } from '@/components/theme/ProjectsProvider';
import {ArrowLeft, ChevronLeft, ChevronRight, AlertTriangle, Lightbulb} from 'lucide-react';
import { useLanguage } from '@/components/theme/LanguageProvider';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function ProjectDetail() {
    const params = useParams();
    const { t } = useLanguage();
    const slug = params?.slug as string;
    const shouldReduceMotion = useReducedMotion();
    const [imageIndex, setImageIndex] = useState(0);
    
    const { projects: projectsData, isLoading, error } = useProjectsData();
    
    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#020202]">
                <div aria-hidden="true" className="w-full max-w-4xl h-[600px] rounded-3xl bg-zinc-200/50 dark:bg-white/5 animate-pulse mx-4" />
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#020202]">
                <div className="text-zinc-500 dark:text-zinc-400 mx-4">{error}</div>
            </main>
        );
    }

    const currentIndex = projectsData.findIndex((p) => p.slug === slug);
    const project = currentIndex !== -1 ? projectsData[currentIndex] : undefined;

    if (!project) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#020202]">
                <div className="text-zinc-500 mx-4">{t('projects.detail.notfound')}</div>
            </main>
        );
    }

    const prevProject = currentIndex > 0 ? projectsData[currentIndex - 1] : null;
    const nextProject = currentIndex < projectsData.length - 1 ? projectsData[currentIndex + 1] : null;

    // Gradient dynamique basé sur la couleur du projet
    const themeColor = `rgb(${project.themeColor.r}, ${project.themeColor.g}, ${project.themeColor.b})`;

    // Construction du tableau d'images (gallery > coverImage > vide)
    const images = project.gallery && project.gallery.length > 0 
        ? project.gallery 
        : project.coverImage 
            ? [project.coverImage] 
            : [];

    return (
        <main className="relative flex min-h-screen flex-col items-center pt-28 pb-16 px-4 selection:bg-brand-blue/30 overflow-hidden bg-[#F8F9FA] dark:bg-[#050505]">
            
            {/* Bouton Retour */}
            <div className="w-full max-w-4xl flex items-center justify-between mb-6 relative z-50">
                <Link 
                    href="/#projects"
                    className="flex items-center gap-2 rounded-full border border-black/15 bg-white/80 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-800 backdrop-blur-md transition-[border-color,background-color] duration-200 hover:border-black/30 hover:bg-white dark:border-white/15 dark:bg-[#0A0C10]/85 dark:text-zinc-200 dark:hover:border-white/30"
                >
                    <ArrowLeft size={14} aria-hidden="true" />
                    {t('projects.detail.back')}
                </Link>
                <span className="font-mono text-xs font-bold tabular-nums uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    {`SYS.${String(currentIndex + 1).padStart(2, '0')} // ${project.year}`}
                </span>
            </div>

            {/* Conteneur principal avec le layoutId partagé pour la transition de Morphing Spatial */}
            <motion.div 
                layoutId={`project-${project.id}`}
                className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-black/15 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[#0A0C10]/95 md:p-12"
            >
                {/* Ligne de calibration supérieure */}
                <div 
                    className="absolute top-0 left-0 h-[2px] w-full"
                    style={{ background: `linear-gradient(90deg, ${themeColor}, transparent)` }}
                />

                {/* 1. Cover Image / Galerie (Optionnelle) */}
                {images.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="group relative mb-10 w-full overflow-hidden rounded-xl aspect-video border border-black/10 dark:border-white/10 bg-zinc-950 shadow-lg"
                    >
                        {/* Conteneur d'image swipeable */}
                        <motion.div
                            key={imageIndex}
                            drag={images.length > 1 ? "x" : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.15}
                            onDragEnd={(_, info) => {
                                const swipeThreshold = 50;
                                const velocityThreshold = 500;
                                if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
                                    setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                                } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
                                    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                                }
                            }}
                            className="relative h-full w-full touch-pan-y"
                        >
                            {/* Image principale non rognée */}
                            <Image 
                                src={images[imageIndex]} 
                                alt={`${project.title} - Vue ${imageIndex + 1}`} 
                                fill 
                                priority={imageIndex === 0} 
                                className="object-contain transition-transform duration-500 z-[1]"
                                sizes="(max-width: 896px) 100vw, 896px"
                            />
                        </motion.div>
                        
                        {/* Contrôles du carousel si plusieurs images */}
                        {images.length > 1 && (
                            <>
                                <button 
                                    onClick={(e) => { e.preventDefault(); setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
                                    aria-label={t('projects.detail.prevImage')}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white opacity-80 backdrop-blur-md transition-[transform,opacity,background-color] duration-200 active:scale-95 md:opacity-0 md:group-hover:opacity-100 md:hover:bg-black/80"
                                >
                                    <ChevronLeft size={20} aria-hidden="true" />
                                </button>
                                <button 
                                    onClick={(e) => { e.preventDefault(); setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
                                    aria-label={t('projects.detail.nextImage')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white opacity-80 backdrop-blur-md transition-[transform,opacity,background-color] duration-200 active:scale-95 md:opacity-0 md:group-hover:opacity-100 md:hover:bg-black/80"
                                >
                                    <ChevronRight size={20} aria-hidden="true" />
                                </button>
                                
                                {/* Indicateurs (dots) — zones tactiles 44px */}
                                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center rounded-full bg-black/50 backdrop-blur-sm opacity-80 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => { e.preventDefault(); setImageIndex(i); }}
                                            className="flex items-center justify-center p-[18px] -mx-[10px] first:ml-0 last:mr-0"
                                            aria-label={`Image ${i + 1}`}
                                        >
                                            <span className={`block rounded-full transition-[width,background-color] duration-200 ${
                                                i === imageIndex 
                                                    ? 'bg-white h-2 w-4' 
                                                    : 'bg-white/50 h-2 w-2'
                                            }`} />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                <header className="mb-10 border-b border-black/10 pb-8 dark:border-white/10">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span 
                            className="rounded border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest"
                            style={{ borderColor: `${themeColor}40`, backgroundColor: `${themeColor}15`, color: themeColor }}
                        >
                            {project.category}
                        </span>
                        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                            • {project.technologies.length} {t('projects.detail.modules')}
                        </span>
                    </div>

                    <motion.h1 
                        layoutId={`project-title-${project.id}`}
                        className="text-3xl font-black tracking-tight text-zinc-900 md:text-4xl lg:text-5xl dark:text-white"
                    >
                        {project.title}
                    </motion.h1>
                    
                    <motion.p 
                        layoutId={`project-desc-${project.id}`}
                        className="mt-6 text-base leading-relaxed text-zinc-700 dark:text-zinc-300 md:text-lg"
                    >
                        {project.detailedDescription}
                    </motion.p>

                    <motion.div layoutId={`project-techs-${project.id}`} className="mt-6 flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                            <span 
                                key={tech}
                                className="rounded border border-black/10 bg-black/[0.03] px-2.5 py-1 font-mono text-xs font-medium text-zinc-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200"
                            >
                                {tech}
                            </span>
                        ))}
                    </motion.div>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.02] md:p-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 28 }}
                        >
                            <h3 className="mb-3 text-base font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2.5 dark:text-white">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 bg-black/5 text-zinc-700 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200">
                                    <AlertTriangle size={14} aria-hidden="true" />
                                </span>
                                {t('projects.detail.analysis')}
                            </h3>
                            <p className="text-sm md:text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                                {project.technicalChallenges}
                            </p>
                        </motion.div>
                    </div>

                    <div className="rounded-xl border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.02] md:p-6">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18, type: 'spring', stiffness: 260, damping: 28 }}
                        >
                            <h3 className="mb-3 text-base font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2.5 dark:text-white">
                                <span 
                                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
                                >
                                    <Lightbulb size={14} aria-hidden="true" />
                                </span>
                                {t('projects.detail.impact')}
                            </h3>
                            <p className="text-sm md:text-base leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
                                {project.impact}
                            </p>
                        </motion.div>
                    </div>
                </div>

                <footer className="mt-10 flex items-center justify-between border-t border-black/10 pt-6 dark:border-white/10">
                    {project.githubUrl ? (
                         <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-bold uppercase tracking-wider text-brand-blue dark:text-[#00D2FF] hover:underline">
                             {t('projects.detail.github')}
                         </a>
                    ) : (
                         <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{t('projects.detail.private')}</span>
                    )}
                </footer>
            </motion.div>

            {/* Navigation inter-projets */}
            <div className="mt-6 flex w-full max-w-4xl flex-col sm:flex-row gap-4 relative z-10">
                {prevProject ? (
                    <Link href={`/projects/${prevProject.slug}`} className="group flex flex-1 flex-col items-start justify-center gap-1.5 rounded-2xl border border-black/10 bg-white/80 p-5 backdrop-blur-md transition-[border-color,background-color] duration-200 hover:border-black/25 hover:bg-white dark:border-white/10 dark:bg-[#0A0C10]/80 dark:hover:border-white/25 dark:hover:bg-[#0A0C10]">
                        <span className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500 transition-colors group-hover:text-brand-blue dark:text-zinc-400 dark:group-hover:text-[#00D2FF]">
                            <ChevronLeft size={14} aria-hidden="true" /> {t('projects.detail.prev')}
                        </span>
                        <span className="line-clamp-1 text-base font-bold text-zinc-900 dark:text-white">
                            {prevProject.title}
                        </span>
                    </Link>
                ) : <div className="hidden sm:block flex-1" />}

                {nextProject ? (
                    <Link href={`/projects/${nextProject.slug}`} className="group flex flex-1 flex-col items-end justify-center gap-1.5 rounded-2xl border border-black/10 bg-white/80 p-5 backdrop-blur-md transition-[border-color,background-color] duration-200 hover:border-black/25 hover:bg-white dark:border-white/10 dark:bg-[#0A0C10]/80 dark:hover:border-white/25 dark:hover:bg-[#0A0C10] text-right">
                        <span className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-500 transition-colors group-hover:text-brand-blue dark:text-zinc-400 dark:group-hover:text-[#00D2FF]">
                            {t('projects.detail.next')} <ChevronRight size={14} aria-hidden="true" />
                        </span>
                        <span className="line-clamp-1 text-base font-bold text-zinc-900 dark:text-white">
                            {nextProject.title}
                        </span>
                    </Link>
                ) : <div className="hidden sm:block flex-1" />}
            </div>
        </main>
    );
}
