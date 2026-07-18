'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Project } from '@/lib/data';

// --- Mapping Categorie -> Icone SVG ---
function CategoryIcon({ category }: { category: string }) {
    if (category === 'Systèmes Embarqués') {
        // Chip / CPU
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
                <line x1="9" y1="1" x2="9" y2="4" />
                <line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" />
                <line x1="15" y1="20" x2="15" y2="23" />
                <line x1="20" y1="9" x2="23" y2="9" />
                <line x1="20" y1="15" x2="23" y2="15" />
                <line x1="1" y1="9" x2="4" y2="9" />
                <line x1="1" y1="15" x2="4" y2="15" />
            </svg>
        );
    }
    if (category === 'Algorithmie') {
        // Graph / Nodes
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="12" cy="18" r="3" />
                <line x1="8.5" y1="7.5" x2="10.5" y2="16" />
                <line x1="15.5" y1="7.5" x2="13.5" y2="16" />
                <line x1="9" y1="6" x2="15" y2="6" />
            </svg>
        );
    }
    // Developpement Logiciel -> Code brackets
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
            <line x1="14" y1="4" x2="10" y2="20" />
        </svg>
    );
}

export default function MagneticProjectCard({ 
    project, 
    isFeatured = false,
    sequenceNumber,
    onClick
}: { 
    project: Project;
    isFeatured?: boolean;
    sequenceNumber?: string;
    onClick: (p: Project) => void;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // --- Animation 1: Magnetic Tilt 3D ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
    const xSpring = useSpring(mouseX, springConfig);
    const ySpring = useSpring(mouseY, springConfig);

    const rotateX = useTransform(ySpring, [0, 500], [5, -5]);
    const rotateY = useTransform(xSpring, [0, 500], [-5, 5]);

    // --- Animation 2: Dynamic Spotlight ---
    const spotlightTemplate = useMotionTemplate`
        radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent 80%)
    `;

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    }

    function handleMouseLeave() {
        setIsHovered(false);
        mouseX.set(250);
        mouseY.set(250);
    }

    // --- WebGL Resonance (Heritage) ---
    useEffect(() => {
        if (isHovered) {
             const event = new CustomEvent('webgl-resonance', { detail: { color: project.themeColor } });
             window.dispatchEvent(event);
        } else {
             const event = new CustomEvent('webgl-resonance', { detail: { color: null } });
             window.dispatchEvent(event);
        }
    }, [isHovered, project.themeColor]);

    const tc = project.themeColor;

    return (
        <motion.div
            ref={cardRef}
            layoutId={`project-${project.id}`}
            onClick={() => onClick(project)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: isHovered ? rotateX : 0,
                rotateY: isHovered ? rotateY : 0,
                transformStyle: "preserve-3d",
            }}
            className={`group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[2rem] border ${
                isFeatured 
                ? "border-zinc-300 dark:border-white/10 bg-zinc-100/60 dark:bg-zinc-900/50 hover:bg-zinc-100/90 dark:hover:bg-zinc-900/80 p-8 lg:p-12" 
                : "border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] p-8 md:p-10"
            } backdrop-blur-xl transition-all duration-500 will-change-transform`}
        >
            {/* 1. ACCENT VERTICAL GAUCHE (Theme Color, toujours visible) */}
            <div 
                className="absolute left-0 top-0 h-full w-[3px] transition-all duration-500 group-hover:w-[5px] group-hover:shadow-lg"
                style={{ 
                    background: `linear-gradient(180deg, rgb(${tc.r},${tc.g},${tc.b}), transparent)`,
                    opacity: isHovered ? 1 : 0.4,
                    boxShadow: isHovered ? `0 0 20px rgba(${tc.r},${tc.g},${tc.b},0.3)` : 'none'
                }}
            />

            {/* Glow ambiante au hover */}
            <div 
                className="absolute inset-0 rounded-[2rem] transition-opacity duration-700 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse at 0% 0%, rgba(${tc.r},${tc.g},${tc.b},0.06), transparent 60%)`,
                    opacity: isHovered ? 1 : 0
                }}
            />

            {/* Texture Noise SVG */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
                style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}
            ></div>

            {/* 2. ICONE DE CATEGORIE (arriere-plan, rotation au hover) */}
            <motion.div 
                className="absolute right-6 bottom-20 h-14 w-14 pointer-events-none z-0"
                style={{ color: `rgb(${tc.r},${tc.g},${tc.b})` }}
                animate={{ 
                    rotate: isHovered ? 8 : 0,
                    opacity: isHovered ? 0.5 : 0.2,
                    scale: isHovered ? 1.1 : 1
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
                <CategoryIcon category={project.category} />
            </motion.div>

            {/* 5. NUMERO DE SEQUENCE (Featured cards uniquement) */}
            {sequenceNumber && (
                <div 
                    className="absolute bottom-4 right-6 text-[7rem] lg:text-[9rem] font-black leading-none pointer-events-none select-none z-0 opacity-[0.03] dark:opacity-[0.04]"
                    style={{ 
                        WebkitTextStroke: '2px currentColor',
                        color: 'transparent'
                    }}
                >
                    {sequenceNumber}
                </div>
            )}

            {/* Dynamic Spotlight */}
            {mounted && (
                <motion.div
                    className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:mix-blend-screen"
                    style={{ background: spotlightTemplate }}
                />
            )}

            {/* CONTENU PRINCIPAL */}
            <div className="relative z-10 flex h-full flex-col justify-between" style={{ transform: "translateZ(30px)" }}>
                <div>
                    {/* 3. HEADER : Annee + Badge Compteur Modules */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold tracking-wider text-zinc-500 dark:text-zinc-400">
                            {project.year}
                        </span>
                        <span className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                            {project.technologies.length} Mod. · {project.category}
                        </span>
                    </div>

                    <motion.h3 
                        layoutId={`project-title-${project.id}`}
                        className="mb-4 text-lg font-bold tracking-tight text-zinc-900 md:text-xl dark:text-white"
                    >
                        {project.title}
                    </motion.h3>
                    
                    <motion.p
                        layoutId={`project-desc-${project.id}`}
                        className="max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
                    >
                        {project.shortDescription}
                    </motion.p>
                </div>

                {/* BAS : Technologies + Fleche CTA */}
                <div className="mt-auto pt-8 flex items-end justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, isFeatured ? 6 : 4).map((tech) => (
                            <span 
                                key={tech}
                                className="rounded-md border border-black/10 bg-black/5 px-2.5 py-1 text-xs font-medium text-zinc-800 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>

                    {/* 4. FLECHE CTA ANIMEE */}
                    <motion.div 
                        className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
                        animate={{ 
                            x: isHovered ? 4 : 0,
                            scale: isHovered ? 1.1 : 1
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 dark:text-zinc-300">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
