'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
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
    const isHoveredRef = useRef(false);
    const { resolvedTheme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    // --- COUCHE 1 : SPOTLIGHT (Halo lumineux) ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // On utilise un composant client-side only pour éviter l'Hydration error sur le Spotlight
    const [mounted, setMounted] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    useEffect(() => {
        setMounted(true);
        setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
        return () => {
            if (isHoveredRef.current) {
                window.dispatchEvent(new CustomEvent('webgl-resonance', { detail: { color: null } }));
            }
        };
    }, []);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    }

    // Format du spotlight (masque radial)
    const spotlightColor = resolvedTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
    const backgroundTemplate = useMotionTemplate`
        radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)
    `;

    return (
        <div
            ref={cardRef}
            onClick={() => onClick(project)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => {
                isHoveredRef.current = true;
                setIsHovered(true);
                window.dispatchEvent(new CustomEvent('webgl-resonance', { detail: { color: project.themeColor } }));
            }}
            onMouseLeave={() => {
                isHoveredRef.current = false;
                setIsHovered(false);
                window.dispatchEvent(new CustomEvent('webgl-resonance', { detail: { color: null } }));
            }}
            className={cn(
                "group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-zinc-200/50 bg-white/40 p-8 shadow-sm backdrop-blur-md hover:-translate-y-0.5 active:scale-[0.985] transition-[transform,border-color,background-color,box-shadow] duration-200 ease-[var(--ease-out)] dark:border-white/10 dark:bg-white/5",
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

            {/* Contenu textuel */}
            <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl dark:text-white">
                        {project.title}
                    </h3>
                    
                    <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {project.shortDescription}
                    </p>
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
            <div 
                className={`absolute bottom-0 left-0 h-1 w-full transition-opacity duration-300 ${isTouchDevice ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'}`}
                style={{ 
                    background: `linear-gradient(90deg, transparent, rgb(${project.themeColor.r},${project.themeColor.g},${project.themeColor.b}), transparent)`
                }}
            />
        </div>
    );
}
