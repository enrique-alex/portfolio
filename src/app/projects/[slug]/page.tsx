'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { projectsData } from '@/lib/data';
import {ArrowLeft, AlertTriangle, Lightbulb} from 'lucide-react';

export default function ProjectDetail() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    
    const project = projectsData.find((p) => p.slug === slug);

    if (!project) {
        return <div className="flex min-h-screen items-center justify-center text-zinc-500">Projet introuvable</div>;
    }

    // Gradient dynamique basé sur la couleur du projet
    const themeColor = `rgb(${project.themeColor.r}, ${project.themeColor.g}, ${project.themeColor.b})`;

    return (
        <main className="relative flex min-h-screen flex-col items-center pt-24 pb-12 px-4 selection:bg-brand-blue/30 overflow-hidden bg-zinc-50 dark:bg-[#020202]">
            
            {/* Bouton Retour */}
            <button 
                onClick={() => router.back()}
                className="absolute top-8 left-8 z-50 flex items-center gap-2 rounded-full border border-zinc-200 bg-white/50 px-4 py-2 text-sm font-medium backdrop-blur-md transition-hover hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
            >
                <ArrowLeft size={16} />
                Retour
            </button>

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
                            Analyse de l'Ingénierie & Solutions
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
                         <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-blue hover:underline">
                             Voir le repo GitHub →
                         </a>
                    ) : (
                         <span className="text-sm italic text-zinc-500">Source privée / académique</span>
                    )}
                </footer>

                 {/* Barre de couleur identitaire du bas (comme sur les cartes) */}
                 <div 
                    className="absolute bottom-0 left-0 h-2 w-full"
                    style={{ background: themeColor }}
                />
            </motion.div>
        </main>
    );
}
