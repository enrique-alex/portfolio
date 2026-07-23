'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useProjectsData } from '@/lib/data';
import {ArrowLeft, ChevronLeft, ChevronRight, AlertTriangle, Lightbulb} from 'lucide-react';
import { useLanguage } from '@/components/theme/LanguageProvider';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function ProjectDetail() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const slug = params?.slug as string;
    const shouldReduceMotion = useReducedMotion();
    const [imageIndex, setImageIndex] = useState(0);
    
    const projectsData = useProjectsData();
    const currentIndex = projectsData.findIndex((p) => p.slug === slug);
    const project = currentIndex !== -1 ? projectsData[currentIndex] : undefined;

    if (!project) {
        return <div className="flex min-h-screen items-center justify-center text-zinc-500">{t('projects.detail.notfound')}</div>;
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
        <main className="relative flex min-h-screen flex-col items-center pt-24 pb-12 px-4 selection:bg-brand-blue/30 overflow-hidden bg-zinc-50 dark:bg-[#020202]">
            
            {/* Bouton Retour */}
            <Link 
                href="/#projects"
                className="absolute top-8 left-8 z-50 flex items-center gap-2 rounded-full border border-zinc-200 bg-white/50 px-4 py-2 text-sm font-medium backdrop-blur-md transition-hover hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
            >
                <ArrowLeft size={16} />
                {t('projects.detail.back')}
            </Link>

            {/* Arrière-plan coloré (Glow lointain) basé sur la couleur du projet */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                className="absolute top-[10%] left-1/2 -z-10 h-[60vw] w-[60vw] -translate-x-1/2 rounded-full blur-[120px]"
                style={{ backgroundColor: themeColor }}
            />

            {/* Conteneur principal avec le layoutId partagé pour la transition de Morphing Spatial */}
            <motion.div 
                layoutId={`project-${project.id}`}
                className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-[#0a0a0a] md:p-12"
            >
                {/* 1. Cover Image / Galerie (Optionnelle) */}
                {images.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
                        className="group relative mb-10 w-full overflow-hidden rounded-2xl aspect-video border border-black/5 dark:border-white/5 shadow-md"
                    >
                        {/* Arrière-plan flou pour un cadrage pro */}
                        <Image 
                            src={images[imageIndex]} 
                            alt="" 
                            fill 
                            priority={imageIndex === 0} 
                            className="object-cover scale-110 blur-2xl opacity-50 dark:opacity-30 transition-all duration-500"
                            aria-hidden="true"
                            sizes="(max-width: 896px) 100vw, 896px"
                        />
                        {/* Image principale non rognée */}
                        <Image 
                            src={images[imageIndex]} 
                            alt={`${project.title} - Vue ${imageIndex + 1}`} 
                            fill 
                            priority={imageIndex === 0} 
                            className="object-contain transition-all duration-500 drop-shadow-2xl z-[1]"
                            sizes="(max-width: 896px) 100vw, 896px"
                        />
                        
                        {/* Contrôles du carousel si plusieurs images */}
                        {images.length > 1 && (
                            <>
                                <button 
                                    onClick={(e) => { e.preventDefault(); setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-md transition-all hover:bg-black/70 hover:scale-110 group-hover:opacity-100"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button 
                                    onClick={(e) => { e.preventDefault(); setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-md transition-all hover:bg-black/70 hover:scale-110 group-hover:opacity-100"
                                >
                                    <ChevronRight size={24} />
                                </button>
                                
                                {/* Indicateurs (dots) */}
                                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => { e.preventDefault(); setImageIndex(i); }}
                                            className={`h-2 w-2 rounded-full transition-all ${
                                                i === imageIndex 
                                                    ? 'bg-white w-4' 
                                                    : 'bg-white/50 hover:bg-white/80'
                                            }`}
                                            aria-label={`Aller à l'image ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                <header className="mb-12">
                    <motion.div layoutId={`project-techs-${project.id}`} className="mb-6 flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                            <span 
                                key={tech}
                                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold tracking-wide text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
                            >
                                {tech}
                            </span>
                        ))}
                    </motion.div>

                    <motion.h1 
                        layoutId={`project-title-${project.id}`}
                        className="text-4xl font-black tracking-tight text-zinc-900 md:text-5xl lg:text-6xl dark:text-white"
                    >
                        {project.title}
                    </motion.h1>
                    
                    <motion.p 
                        layoutId={`project-desc-${project.id}`}
                        className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-xl"
                    >
                        {project.detailedDescription}
                    </motion.p>
                </header>

                <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-white/5 dark:bg-white/[0.02]">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="mb-4 text-xl font-bold text-zinc-900 flex items-center gap-3 dark:text-white/90">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:text-zinc-300">
                                <AlertTriangle size={16} />
                            </span>
                            {t('projects.detail.analysis')}
                        </h3>
                        <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {project.technicalChallenges}
                        </p>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ scaleX: 0 }} 
                    animate={{ scaleX: 1 }} 
                    transition={{ delay: 0.5, duration: 0.8, ease: "circOut" }}
                    className="mt-12 h-[1px] w-full origin-left bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-white/20"
                />

                <footer className="mt-8 flex items-center justify-between">
                    {project.githubUrl ? (
                         <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-blue hover:underline">
                             {t('projects.detail.github')}
                         </a>
                    ) : (
                         <span className="text-sm italic text-zinc-500">{t('projects.detail.private')}</span>
                    )}
                </footer>

                 {/* Barre de couleur identitaire du bas (comme sur les cartes) */}
                 <div 
                    className="absolute bottom-0 left-0 h-2 w-full"
                    style={{ background: themeColor }}
                />
            </motion.div>

            {/* Navigation inter-projets */}
            <div className="mt-8 flex w-full max-w-4xl flex-col sm:flex-row gap-4 relative z-10">
                {prevProject ? (
                    <Link href={`/projects/${prevProject.slug}`} className="group flex flex-1 flex-col items-start justify-center gap-1 rounded-3xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-md transition-all hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-[#0a0a0a]/50 dark:hover:bg-[#0a0a0a]">
                        <span className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors group-hover:text-brand-blue dark:text-zinc-400">
                            <ChevronLeft size={16} /> {t('projects.detail.prev')}
                        </span>
                        <span className="line-clamp-1 text-base font-semibold text-zinc-900 dark:text-white/90">
                            {prevProject.title}
                        </span>
                    </Link>
                ) : <div className="hidden sm:block flex-1" />}

                {nextProject ? (
                    <Link href={`/projects/${nextProject.slug}`} className="group flex flex-1 flex-col items-end justify-center gap-1 rounded-3xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-md transition-all hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-[#0a0a0a]/50 dark:hover:bg-[#0a0a0a] text-right">
                        <span className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors group-hover:text-brand-blue dark:text-zinc-400">
                            {t('projects.detail.next')} <ChevronRight size={16} />
                        </span>
                        <span className="line-clamp-1 text-base font-semibold text-zinc-900 dark:text-white/90">
                            {nextProject.title}
                        </span>
                    </Link>
                ) : <div className="hidden sm:block flex-1" />}
            </div>
        </main>
    );
}
