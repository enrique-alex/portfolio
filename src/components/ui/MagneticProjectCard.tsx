'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Project } from '@/lib/data';

// --- Mapping Categorie -> Icone SVG ---
function CategoryIcon({ category }: { category: string }) {
    if (category === 'Systèmes Embarqués' || category === 'Embedded Systems') {
        // Chip / CPU
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
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
    if (category === 'Algorithmique' || category === 'Algorithms') {
        // Graph / Nodes
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="12" cy="18" r="3" />
                <line x1="8.5" y1="7.5" x2="10.5" y2="16" />
                <line x1="15.5" y1="7.5" x2="13.5" y2="16" />
                <line x1="9" y1="6" x2="15" y2="6" />
            </svg>
        );
    }
    if (category === 'Électronique' || category === 'Electronics') {
        // Circuit / Resistor
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                <path d="M2 12h4l1.5-3 3 6 3-6 3 6 1.5-3h4" />
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
            </svg>
        );
    }
    if (category === 'Automatisme & Régulation' || category === 'Automation & Control') {
        // Feedback loop / Control
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                <rect x="3" y="8" width="6" height="8" rx="1" />
                <rect x="15" y="8" width="6" height="8" rx="1" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <polyline points="13 10 15 12 13 14" />
                <path d="M18 16v3H6v-3" strokeOpacity="0.5" />
                <polyline points="8 19 6 16 4 19" strokeOpacity="0.5" />
            </svg>
        );
    }
    if (category === 'Informatique Bas Niveau' || category === 'Low-Level Computing') {
        // Microprocessor / Register
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                <rect x="5" y="5" width="14" height="14" rx="2" />
                <line x1="8" y1="9" x2="16" y2="9" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="15" x2="12" y2="15" />
                <line x1="9" y1="2" x2="9" y2="5" />
                <line x1="15" y1="2" x2="15" y2="5" />
                <line x1="9" y1="19" x2="9" y2="22" />
                <line x1="15" y1="19" x2="15" y2="22" />
            </svg>
        );
    }
    // Developpement Logiciel / Software Engineering -> Code brackets
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
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
    const rectRef = useRef<DOMRect | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        setMounted(true);
        const isTouch = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
        setIsTouchDevice(isTouch);
    }, []);

    // --- Animation Tilt allégée par variables CSS pures (--rx, --ry) : zéro useSpring / useMotionValue ---
    function handleMouseEnter() {
        if (isTouchDevice || !cardRef.current) return;
        rectRef.current = cardRef.current.getBoundingClientRect();
        setIsHovered(true);
    }

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!cardRef.current || isTouchDevice) return;
        if (!rectRef.current) {
            rectRef.current = cardRef.current.getBoundingClientRect();
        }
        const rect = rectRef.current;
        const width = rect.width || 1;
        const height = rect.height || 1;
        const px = (e.clientX - rect.left) / width - 0.5;
        const py = (e.clientY - rect.top) / height - 0.5;

        // Déflexion angulaire légère plafonnée à ±5 deg
        const rx = (-py * 8).toFixed(2);
        const ry = (px * 8).toFixed(2);

        cardRef.current.style.setProperty('--rx', `${rx}deg`);
        cardRef.current.style.setProperty('--ry', `${ry}deg`);
        cardRef.current.style.setProperty('--mx', `${(e.clientX - rect.left).toFixed(0)}px`);
        cardRef.current.style.setProperty('--my', `${(e.clientY - rect.top).toFixed(0)}px`);
    }

    function handleMouseLeave() {
        rectRef.current = null;
        if (!cardRef.current || isTouchDevice) return;
        setIsHovered(false);
        cardRef.current.style.setProperty('--rx', '0deg');
        cardRef.current.style.setProperty('--ry', '0deg');
    }

    // --- WebGL Resonance (Heritage) ---
    useEffect(() => {
        if (isHovered && !isTouchDevice) {
             const event = new CustomEvent('webgl-resonance', { detail: { color: project.themeColor } });
             window.dispatchEvent(event);
        } else {
             const event = new CustomEvent('webgl-resonance', { detail: { color: null } });
             window.dispatchEvent(event);
        }
    }, [isHovered, isTouchDevice, project.themeColor]);

    const tc = project.themeColor;
    const hasCover = Boolean(project.coverImage);

    return (
        <motion.div
            ref={cardRef}
            layoutId={`project-${project.id}`}
            onClick={() => onClick(project)}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            whileTap={{ scale: 0.98 }}
            style={{
                transform: (!isTouchDevice && isHovered)
                    ? 'perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))'
                    : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                transition: 'transform 0.18s cubic-bezier(0.2, 0, 0.2, 1)',
            }}
            className={`group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[2rem] border ${
                isFeatured 
                ? "border-zinc-300 dark:border-white/10 bg-zinc-100/90 dark:bg-zinc-900/90 hover:bg-zinc-100 dark:hover:bg-zinc-900 p-8 lg:p-12" 
                : "border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80 p-8 md:p-10"
            } transition-colors duration-200`}
        >
            {/* COVER IMAGE (conditional) */}
            {hasCover && (
                <>
                    <Image
                        src={project.coverImage!}
                        alt={project.title}
                        fill
                        className="object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                        sizes={isFeatured
                            ? "(max-width: 768px) 100vw, 66vw"
                            : "(max-width: 768px) 100vw, 33vw"
                        }
                    />
                    {/* Dark gradient overlay for text readability (WCAG AA compliant) */}
                    <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/90 via-black/60 to-black/30 dark:from-black/95 dark:via-black/70 dark:to-black/40 pointer-events-none" />
                </>
            )}

            {/* 1. ACCENT VERTICAL GAUCHE (Theme Color, toujours visible) */}
            <div 
                className="absolute left-0 top-0 h-full w-[3px] origin-left transition-transform duration-300 group-hover:scale-x-[1.67] z-[2]"
                style={{ 
                    background: `linear-gradient(180deg, rgb(${tc.r},${tc.g},${tc.b}), transparent)`,
                    opacity: isTouchDevice ? 0.7 : (isHovered ? 1 : 0.4),
                    boxShadow: (isTouchDevice || isHovered) ? `0 0 20px rgba(${tc.r},${tc.g},${tc.b},0.3)` : 'none'
                }}
            />

            {/* Glow ambiante au hover */}
            {!hasCover && (
                <div 
                    className="absolute inset-0 rounded-[2rem] transition-opacity duration-700 pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse at 0% 0%, rgba(${tc.r},${tc.g},${tc.b},0.06), transparent 60%)`,
                        opacity: isTouchDevice ? 0.5 : (isHovered ? 1 : 0)
                    }}
                />
            )}

            {/* Texture Noise SVG (only when no cover image) */}
            {!hasCover && (
                <div 
                    className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
                    style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}
                ></div>
            )}

            {/* 2. ICONE DE CATEGORIE (arriere-plan, rotation au hover) */}
            {!hasCover && (
                <motion.div 
                    className="absolute right-6 bottom-20 h-14 w-14 pointer-events-none z-0"
                    style={{ color: `rgb(${tc.r},${tc.g},${tc.b})` }}
                    animate={{ 
                        rotate: isTouchDevice ? 4 : (isHovered ? 8 : 0),
                        opacity: isTouchDevice ? 0.4 : (isHovered ? 0.5 : 0.2),
                        scale: isTouchDevice ? 1.05 : (isHovered ? 1.1 : 1)
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                    <CategoryIcon category={project.category} />
                </motion.div>
            )}

            {/* 5. NUMERO DE SEQUENCE (Featured cards uniquement) */}
            {sequenceNumber && !hasCover && (
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

            {/* Dynamic Spotlight en CSS natif */}
            {mounted && !isTouchDevice && (
                <div
                    className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:mix-blend-screen"
                    style={{
                        background: 'radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.06), transparent 80%)',
                    }}
                />
            )}

            {/* CONTENU PRINCIPAL */}
            <div className={`relative z-10 flex h-full flex-col justify-between ${hasCover ? 'text-white' : ''}`}>
                <div>
                    {/* 3. HEADER : Annee + Badge Compteur Modules */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-sm font-semibold tracking-wider ${hasCover ? 'text-white/80' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {project.year}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${
                            hasCover 
                                ? 'border-white/20 bg-white/10 text-white/90 backdrop-blur-sm' 
                                : 'border-black/10 bg-black/5 text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300'
                        }`}>
                            {project.technologies.length} Mod. · {project.category}
                        </span>
                    </div>

                    <motion.h3 
                        layoutId={`project-title-${project.id}`}
                        className={`mb-4 text-lg font-bold tracking-tight md:text-xl ${hasCover ? 'text-white drop-shadow-lg' : 'text-zinc-900 dark:text-white'}`}
                    >
                        {project.title}
                    </motion.h3>
                    
                    <motion.p
                        layoutId={`project-desc-${project.id}`}
                        className={`max-w-md text-sm leading-relaxed ${hasCover ? 'text-white/80' : 'text-zinc-600 dark:text-zinc-400'}`}
                    >
                        {project.shortDescription}
                    </motion.p>

                    <p 
                        className="mt-4 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: `rgb(${tc.r}, ${tc.g}, ${tc.b})` }}
                    >
                        {project.impact}
                    </p>
                </div>

                {/* BAS : Technologies + Fleche CTA */}
                <div className="mt-auto pt-8 flex items-end justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, isFeatured ? 6 : 4).map((tech) => (
                            <span 
                                key={tech}
                                className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                                    hasCover
                                        ? 'border-white/20 bg-white/10 text-white/90 backdrop-blur-sm'
                                        : 'border-black/10 bg-black/5 text-zinc-800 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200'
                                }`}
                            >
                                {tech}
                            </span>
                        ))}
                    </div>

                    {/* 4. FLECHE CTA ANIMEE */}
                    <motion.div 
                        className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full border ${
                            hasCover
                                ? 'border-white/20 bg-white/10'
                                : 'border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5'
                        }`}
                        animate={{ 
                            x: isTouchDevice ? 2 : (isHovered ? 4 : 0),
                            scale: isTouchDevice ? 1.05 : (isHovered ? 1.1 : 1)
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={hasCover ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}>
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
