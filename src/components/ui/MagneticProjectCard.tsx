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
    if (category === 'Robotique & Systèmes Autonomes' || category === 'Robotics & Autonomous Systems') {
        // Robotic arm / Joint kinematics
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                <rect x="3" y="19" width="18" height="3" rx="1" />
                <circle cx="8" cy="16" r="2" />
                <line x1="8" y1="14" x2="13" y2="8" />
                <circle cx="13" cy="8" r="2" />
                <line x1="14.5" y1="9.5" x2="19" y2="12" />
                <circle cx="19" cy="12" r="1.5" />
                <path d="M19 10.5v3" />
            </svg>
        );
    }
    if (category === 'Modélisation Multiphysique' || category === 'Multiphysics Modeling') {
        // Energy bond / Multi-domain flux
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                <path d="M2 12h3l3-7 4 14 3-9 2 4h5" />
                <circle cx="8" cy="5" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
            </svg>
        );
    }
    if (category === 'Réseaux Embarqués & Cybersécurité' || category === 'Embedded Networks & Cybersecurity') {
        // Secure Network / Shielded node
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <circle cx="12" cy="11" r="2" />
                <path d="M12 7v2" />
                <path d="M12 13v2" />
                <path d="M9 11H7" />
                <path d="M17 11h-2" />
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
            role="link"
            tabIndex={0}
            aria-label={project.title}
            onClick={() => onClick(project)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(project);
                }
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            whileTap={{ scale: 0.985 }}
            style={{
                transform: (!isTouchDevice && isHovered)
                    ? 'perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))'
                    : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                transition: 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            className={`group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border outline-none focus-visible:ring-2 focus-visible:ring-brand-blue dark:focus-visible:ring-[#00D2FF] ${
                isFeatured 
                ? "border-black/15 dark:border-white/15 bg-white/90 dark:bg-[#0A0C10]/90 hover:border-black/30 dark:hover:border-white/25 p-7 lg:p-10" 
                : "border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#080A0E]/90 hover:border-black/25 dark:hover:border-white/20 p-7 md:p-8"
            } shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-[border-color,background-color] duration-200`}
        >
            {/* COVER IMAGE (conditional) */}
            {hasCover && (
                <>
                    <Image
                        src={project.coverImage!}
                        alt={project.title}
                        fill
                        className="object-cover z-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        sizes={isFeatured
                            ? "(max-width: 768px) 100vw, 66vw"
                            : "(max-width: 768px) 100vw, 33vw"
                        }
                    />
                    {/* Dark gradient overlay for text readability (WCAG AA compliant) */}
                    <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/95 via-black/70 to-black/35 pointer-events-none" />
                </>
            )}

            {/* 1. ACCENT VERTICAL GAUCHE (Indicateur chromatique calibré) */}
            <div 
                className="absolute left-0 top-0 h-full w-[2px] origin-left transition-transform duration-300 group-hover:scale-x-150 z-[2]"
                style={{ 
                    background: `linear-gradient(180deg, rgb(${tc.r},${tc.g},${tc.b}), transparent)`,
                    opacity: isTouchDevice ? 0.8 : (isHovered ? 1 : 0.55),
                }}
            />

            {/* 2. ICONE DE CATEGORIE (Schéma technique en filigrane) */}
            {!hasCover && (
                <motion.div 
                    className="absolute right-6 bottom-20 h-14 w-14 pointer-events-none z-0"
                    style={{ color: `rgb(${tc.r},${tc.g},${tc.b})` }}
                    animate={{ 
                        rotate: isTouchDevice ? 0 : (isHovered ? 6 : 0),
                        opacity: isTouchDevice ? 0.28 : (isHovered ? 0.42 : 0.16),
                        scale: isTouchDevice ? 1 : (isHovered ? 1.06 : 1)
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                >
                    <CategoryIcon category={project.category} />
                </motion.div>
            )}

            {/* Dynamic Spotlight en CSS natif */}
            {mounted && !isTouchDevice && (
                <div
                    className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background: 'radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.045), transparent 80%)',
                    }}
                />
            )}

            {/* CONTENU PRINCIPAL */}
            <div className={`relative z-10 flex h-full flex-col justify-between ${hasCover ? 'text-white' : ''}`}>
                <div>
                    {/* 3. HEADER : Annee + Séquence + Badge Compteur Modules */}
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className={`font-mono text-xs font-bold tabular-nums tracking-wider ${hasCover ? 'text-white/85' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                {project.year}
                            </span>
                            {sequenceNumber && (
                                <span className={`font-mono text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border ${
                                    hasCover
                                        ? 'border-white/20 bg-white/10 text-white/90'
                                        : 'border-brand-blue/30 bg-brand-blue/10 text-brand-blue dark:border-[#00D2FF]/30 dark:bg-[#00D2FF]/10 dark:text-[#00D2FF]'
                                }`}>
                                    {`SYS.${sequenceNumber}`}
                                </span>
                            )}
                        </div>
                        <span className={`rounded-md border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${
                            hasCover 
                                ? 'border-white/20 bg-black/40 text-white/90 backdrop-blur-sm' 
                                : 'border-black/10 bg-black/[0.03] text-zinc-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300'
                        }`}>
                            {project.technologies.length} Mod. · {project.category}
                        </span>
                    </div>

                    <motion.h3 
                        layoutId={`project-title-${project.id}`}
                        className={`mb-3 text-lg font-bold tracking-tight md:text-xl ${hasCover ? 'text-white' : 'text-zinc-900 dark:text-white'}`}
                    >
                        {project.title}
                    </motion.h3>
                    
                    <motion.p
                        layoutId={`project-desc-${project.id}`}
                        className={`max-w-xl text-sm leading-relaxed line-clamp-3 ${hasCover ? 'text-zinc-200' : 'text-zinc-600 dark:text-zinc-400'}`}
                    >
                        {project.shortDescription}
                    </motion.p>

                    <p 
                        className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-wider line-clamp-2"
                        style={{ color: hasCover ? '#38BDF8' : `rgb(${tc.r}, ${tc.g}, ${tc.b})` }}
                    >
                        {project.impact}
                    </p>
                </div>

                {/* BAS : Technologies + Fleche CTA */}
                <div className="mt-auto pt-6 flex items-end justify-between gap-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex flex-wrap gap-1.5">
                        {project.technologies.slice(0, isFeatured ? 6 : 4).map((tech) => (
                            <span 
                                key={tech}
                                className={`rounded border px-2 py-0.5 font-mono text-[11px] font-medium ${
                                    hasCover
                                        ? 'border-white/20 bg-black/40 text-white/90 backdrop-blur-sm'
                                        : 'border-black/10 bg-black/[0.03] text-zinc-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200'
                                }`}
                            >
                                {tech}
                            </span>
                        ))}
                    </div>

                    {/* 4. FLECHE CTA ANIMEE */}
                    <motion.div 
                        className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full border ${
                            hasCover
                                ? 'border-white/25 bg-white/10'
                                : 'border-black/10 bg-black/[0.03] dark:border-white/15 dark:bg-white/[0.04]'
                        }`}
                        animate={{ 
                            x: isTouchDevice ? 0 : (isHovered ? 3 : 0),
                            scale: isTouchDevice ? 1 : (isHovered ? 1.08 : 1)
                        }}
                        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={hasCover ? 'text-white' : 'text-zinc-700 dark:text-zinc-200'}>
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
