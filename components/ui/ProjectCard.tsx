'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Project } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export default function ProjectCard({ 
    project, 
    onClick 
}: { 
    project: Project;
    onClick: (p: Project) => void;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    // --- COUCHE 1 : SPOTLIGHT (Halo lumineux) ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // On utilise un composant client-side only pour éviter l'Hydration error sur le Spotlight
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    }

    // --- COUCHE 2 : PHYSIQUE MAGNÉTIQUE 3D (Tilt) ---
    // Les springs donnent un effet "rebond" organique et pèsent la carte.
    const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
    const xSpring = useSpring(mouseX, springConfig);
    const ySpring = useSpring(mouseY, springConfig);

    // Transformation de la position de la souris en angles de rotation 3D limités à +- 8 degrés
    const rotateX = useTransform(ySpring, [0, 500], [8, -8]);
    const rotateY = useTransform(xSpring, [0, 500], [-8, 8]);

    // Format du spotlight (masque radial)
    const spotlightColor = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
    const backgroundTemplate = useMotionTemplate`
        radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)
    `;

    // --- COUCHE 3 : RÉSONANCE WEBGL ---
    // On envoie un évènement global quand la carte est survolée
    useEffect(() => {
        if (isHovered) {
             const event = new CustomEvent('webgl-resonance', { detail: { color: project.themeColor } });
             window.dispatchEvent(event);
        } else {
             const event = new CustomEvent('webgl-resonance', { detail: { color: null } });
             window.dispatchEvent(event);
        }
    }, [isHovered, project.themeColor]);

    return (
        <motion.div
            ref={cardRef}
            layoutId={`project-${project.id}`}
            onClick={() => onClick(project)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                // Reset du tilt quand on quitte la carte
                mouseX.set(250); 
                mouseY.set(250);
            }}
            style={{
                // Appliquer la rotation 3D seulement au survol pour plus de contrôle
                rotateX: isHovered ? rotateX : 0,
                rotateY: isHovered ? rotateY : 0,
                transformStyle: "preserve-3d",
            }}
            className={cn(
                "group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-zinc-200/50 bg-white/40 p-8 shadow-sm backdrop-blur-md transition-all duration-500 will-change-transform dark:border-white/10 dark:bg-white/5",
                isHovered && "shadow-xl border-zinc-300 dark:border-white/20"
            )}
        >
            {/* Effet Spotlight */}
            {mounted && (
                <motion.div
                    className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
                    style={{ background: backgroundTemplate, opacity: isHovered ? 1 : 0 }}
                />
            )}

            {/* Contenu textuel avec translation sur Z (Effet Parallaxe 3D) */}
            <div className="relative z-10 flex h-full flex-col justify-between" style={{ transform: "translateZ(30px)" }}>
                <div>
                    <motion.h3 
                        layoutId={`project-title-${project.id}`}
                        className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl dark:text-white"
                    >
                        {project.title}
                    </motion.h3>
                    
                    <motion.p
                        layoutId={`project-desc-${project.id}`}
                        className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
                    >
                        {project.shortDescription}
                    </motion.p>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                    {project.technologies.map((tech: string) => (
                        <span 
                            key={tech}
                            className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* Accent d'Ingénierie : Ligne brillante dynamique */}
            <motion.div 
                className="absolute bottom-0 left-0 h-1 w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ 
                    background: `linear-gradient(90deg, transparent, rgb(${project.themeColor.r},${project.themeColor.g},${project.themeColor.b}), transparent)`
                }}
            />
        </motion.div>
    );
}
