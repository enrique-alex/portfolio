'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Project } from '@/lib/data';

// --- Signature télémétrique propre à chacun des 15 projets ---
const PROJECT_SPECS: Record<string, string> = {
    'controle-hydraulique': 'HIL · Δt 10 ms',
    'cellule-robotique': 'TCP < 0.2 mm · I/O',
    'toyota-prius-bond-graph': 'SCAP · 2.83 L/100',
    'vehicule-electrique-rem': 'REM/SMC · 18.5 ms',
    'iot-network-infra': 'mTLS X.509 · LoRa',
    'filtre-tchebychev': 'Ordre 4 · 4.5 kHz',
    'lyngk': 'Bitmask 64b · O(1)',
    'microprocesseurs': 'AVR8 Bare-Metal',
    'awale': 'Anneau Z/12Z · C99',
    'pygroove': 'Multi-Thread DMA',
    'terminal-c': 'POSIX · fork/pipe',
    'ferme-poo': 'RAII · Smart Ptr',
    'snake': 'Delta-Time · 2D',
    'budget': 'Vectorisation Num.',
    'voiture-bluetooth': 'PWM · Opto-Isolé',
};

// --- Schéma technique vectoriel unique pour chacun des 15 projets (avec repli par catégorie) ---
function ProjectSchematic({ projectId, category }: { projectId: string; category: string }) {
    switch (projectId) {
        case 'controle-hydraulique':
            // Bicuve hydraulique couplée + vanne d'interconnexion & boucle PID
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <path d="M3 5v13a1 1 0 0 0 1 1h5V5" />
                    <path d="M15 5v13h5a1 1 0 0 0 1-1V5" />
                    <path d="M3 11c2-1 4 1 6 0" strokeOpacity="0.7" />
                    <path d="M15 14c2-1 4 1 6 0" strokeOpacity="0.7" />
                    <line x1="9" y1="16" x2="15" y2="16" />
                    <circle cx="12" cy="16" r="1.5" />
                    <path d="M6 3h12" strokeDasharray="2 2" strokeOpacity="0.55" />
                </svg>
            );
        case 'cellule-robotique':
            // Bras cinématique 6 axes + cible TCP & navette AMR
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <rect x="2" y="19" width="9" height="3" rx="1" />
                    <circle cx="6.5" cy="16" r="2" />
                    <line x1="7.5" y1="14.2" x2="12" y2="7.5" />
                    <circle cx="13" cy="6.5" r="2" />
                    <line x1="14.8" y1="7.2" x2="19" y2="11" />
                    <path d="M18 13l2-2 2 2" />
                    <rect x="15" y="18" width="7" height="3" rx="1.5" strokeOpacity="0.75" />
                    <circle cx="17" cy="21.5" r="0.8" />
                    <circle cx="20" cy="21.5" r="0.8" />
                </svg>
            );
        case 'toyota-prius-bond-graph':
            // Train épicycloïdal PSD + jonctions énergétiques Bond Graph (0 / 1)
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="12" cy="6" r="1.6" />
                    <circle cx="6.8" cy="15" r="1.6" />
                    <circle cx="17.2" cy="15" r="1.6" />
                    <path d="M2 12h4l-1.5-1.5" />
                    <path d="M18 12h4l-1.5-1.5" />
                </svg>
            );
        case 'vehicule-electrique-rem':
            // Formalisme REM / EMR : éléments de conversion couplés & boucle d'inversion SMC
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <ellipse cx="5.5" cy="10" rx="3.5" ry="2.5" />
                    <rect x="13" y="7.5" width="7" height="5" rx="1" />
                    <line x1="9" y1="9" x2="13" y2="9" />
                    <line x1="13" y1="11" x2="9" y2="11" />
                    <path d="M16.5 12.5v5H5.5v-5" strokeOpacity="0.65" />
                    <polygon points="10.5,16 13.5,17.5 10.5,19" />
                </svg>
            );
        case 'iot-network-infra':
            // Bouclier cryptographique mTLS X.509 + topologie maillée & ondes LoRa
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <path d="M12 21s7-3.5 7-9V6l-7-3-7 3v6c0 5.5 7 9 7 9z" />
                    <circle cx="12" cy="11.5" r="2" />
                    <path d="M9 9a4.2 4.2 0 0 1 6 0" strokeOpacity="0.7" />
                    <path d="M7.5 7a6.5 6.5 0 0 1 9 0" strokeOpacity="0.45" />
                    <line x1="12" y1="13.5" x2="12" y2="16.5" />
                </svg>
            );
        case 'filtre-tchebychev':
            // Gabarit fréquentiel passe-bas d'ordre 4 (ondulation Tchebychev + coupure raide)
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <line x1="3" y1="19" x2="21" y2="19" strokeOpacity="0.45" />
                    <line x1="3" y1="5" x2="3" y2="19" strokeOpacity="0.45" />
                    <path d="M3 8c1.8-2 3.2 2 5 0s3.2-2 4.5 0c1.2 1.8 2 7 4.5 9.5 1.2 1.2 2.5 1.5 4 1.5" />
                    <line x1="12.5" y1="5" x2="12.5" y2="19" strokeDasharray="2 2" strokeOpacity="0.6" />
                </svg>
            );
        case 'lyngk':
            // Pavage hexagonal en coordonnées axiales + graphe de parcours DFS
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <polygon points="12,3 19,7 19,15 12,19 5,15 5,7" />
                    <polyline points="8.5,9.5 12,7 15.5,11 12,15 8.5,13" strokeOpacity="0.8" />
                    <circle cx="12" cy="7" r="1.3" fill="currentColor" />
                    <circle cx="15.5" cy="11" r="1.3" fill="currentColor" />
                    <circle cx="12" cy="15" r="1.3" fill="currentColor" />
                </svg>
            );
        case 'microprocesseurs':
            // Microcontrôleur ATmega2560 bare-metal + bus d'interruption matériel ISR
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <rect x="6" y="6" width="12" height="12" rx="1.5" />
                    <rect x="9" y="9" width="6" height="6" rx="0.5" strokeOpacity="0.7" />
                    <line x1="9" y1="2" x2="9" y2="6" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="15" y1="2" x2="15" y2="6" />
                    <line x1="9" y1="18" x2="9" y2="22" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="15" y1="18" x2="15" y2="22" />
                    <line x1="2" y1="9" x2="6" y2="9" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="2" y1="15" x2="6" y2="15" />
                    <line x1="18" y1="9" x2="22" y2="9" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="18" y1="15" x2="22" y2="15" />
                </svg>
            );
        case 'awale':
            // Anneau cyclique modulaire (Z/12Z) & grenier de stratégie combinatoire
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <rect x="2" y="7" width="20" height="10" rx="5" />
                    <circle cx="7" cy="10" r="1.2" /><circle cx="12" cy="10" r="1.2" /><circle cx="17" cy="10" r="1.2" />
                    <circle cx="7" cy="14" r="1.2" /><circle cx="12" cy="14" r="1.2" /><circle cx="17" cy="14" r="1.2" />
                    <path d="M8 4.5h8l-1.5-1.5" strokeOpacity="0.65" />
                    <path d="M16 19.5H8l1.5 1.5" strokeOpacity="0.65" />
                </svg>
            );
        case 'pygroove':
            // Spectre audio DMA multi-threadé & onde acoustique vocale
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <line x1="4" y1="10" x2="4" y2="14" />
                    <line x1="8" y1="6" x2="8" y2="18" />
                    <line x1="12" y1="3" x2="12" y2="21" />
                    <line x1="16" y1="7" x2="16" y2="17" />
                    <line x1="20" y1="9" x2="20" y2="15" />
                    <circle cx="12" cy="12" r="9.5" strokeOpacity="0.28" />
                </svg>
            );
        case 'terminal-c':
            // Shell Kernel-Space POSIX : invite $_ et pipeline de processus fork/dup2
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <rect x="2.5" y="4" width="19" height="16" rx="2" />
                    <polyline points="6.5,9.5 9.5,12 6.5,14.5" />
                    <line x1="11.5" y1="14.5" x2="16.5" y2="14.5" />
                    <line x1="2.5" y1="7.5" x2="21.5" y2="7.5" strokeOpacity="0.4" />
                </svg>
            );
        case 'ferme-poo':
            // Graphe d'héritage polymorphe C++ & comptage de références RAII
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <rect x="8.5" y="3" width="7" height="4.5" rx="1" />
                    <rect x="2.5" y="15.5" width="7" height="4.5" rx="1" />
                    <rect x="14.5" y="15.5" width="7" height="4.5" rx="1" />
                    <path d="M12 7.5v4M12 11.5H6v4M12 11.5h6v4" />
                </svg>
            );
        case 'snake':
            // Matrice vectorielle temps réel & trajectoire segmentée Delta-Time
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeOpacity="0.35" />
                    <path d="M7 16h5v-4h4V8h3" strokeWidth="1.8" />
                    <circle cx="19" cy="8" r="1.4" fill="currentColor" />
                    <circle cx="8" cy="8" r="1.2" strokeOpacity="0.7" />
                </svg>
            );
        case 'budget':
            // Pipeline analytique vectorisé : histogramme matriciel & courbe prédictive
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <line x1="3" y1="20" x2="21" y2="20" />
                    <rect x="5" y="13" width="3" height="7" rx="0.5" strokeOpacity="0.6" />
                    <rect x="10.5" y="9" width="3" height="11" rx="0.5" strokeOpacity="0.6" />
                    <rect x="16" y="6" width="3" height="14" rx="0.5" strokeOpacity="0.6" />
                    <polyline points="4.5,11 10,7.5 14,9 19.5,4" />
                    <circle cx="19.5" cy="4" r="1.3" fill="currentColor" />
                </svg>
            );
        case 'voiture-bluetooth':
            // Châssis mécatronique mobile 4 roues + modulation PWM & onde RF Bluetooth
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                    <rect x="6" y="8" width="12" height="10" rx="2" />
                    <rect x="3.5" y="9" width="2.5" height="3.5" rx="0.5" />
                    <rect x="18" y="9" width="2.5" height="3.5" rx="0.5" />
                    <rect x="3.5" y="13.5" width="2.5" height="3.5" rx="0.5" />
                    <rect x="18" y="13.5" width="2.5" height="3.5" rx="0.5" />
                    <path d="M9 5.5a4.5 4.5 0 0 1 6 0" />
                    <path d="M7.5 3.5a7 7 0 0 1 9 0" strokeOpacity="0.55" />
                    <path d="M8.5 13h2v-2h2v2h3" strokeOpacity="0.8" />
                </svg>
            );
        default:
            break;
    }

    // Repli par catégorie pour tout futur projet ajouté via l'interface Admin
    if (category === 'Systèmes Embarqués' || category === 'Embedded Systems') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
                <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-full w-full">
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

    const isHoveredRef = useRef(false);

    // --- Suivi radial léger (--mx, --my) sans tilt 3D artificiel (Leonxlnx/taste-skill & emilkowalski/skills) ---
    function handleMouseEnter() {
        if (isTouchDevice || !cardRef.current) return;
        rectRef.current = cardRef.current.getBoundingClientRect();
        isHoveredRef.current = true;
        setIsHovered(true);
        window.dispatchEvent(new CustomEvent('webgl-resonance', { detail: { color: project.themeColor } }));
    }

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!cardRef.current || isTouchDevice) return;
        if (!rectRef.current) {
            rectRef.current = cardRef.current.getBoundingClientRect();
        }
        const rect = rectRef.current;
        cardRef.current.style.setProperty('--mx', `${(e.clientX - rect.left).toFixed(0)}px`);
        cardRef.current.style.setProperty('--my', `${(e.clientY - rect.top).toFixed(0)}px`);
    }

    function handleMouseLeave() {
        rectRef.current = null;
        if (!cardRef.current || isTouchDevice) return;
        isHoveredRef.current = false;
        setIsHovered(false);
        window.dispatchEvent(new CustomEvent('webgl-resonance', { detail: { color: null } }));
    }

    // --- Nettoyage de la résonance WebGL uniquement si la carte était survolée au démontage ---
    useEffect(() => {
        return () => {
            if (isHoveredRef.current) {
                window.dispatchEvent(new CustomEvent('webgl-resonance', { detail: { color: null } }));
            }
        };
    }, []);

    const tc = project.themeColor;
    const rgbStr = `${tc.r}, ${tc.g}, ${tc.b}`;
    const hasCover = Boolean(project.coverImage);
    const specLabel = PROJECT_SPECS[project.id];
    const visibleTechLimit = isFeatured ? 6 : 4;
    const visibleTechs = project.technologies.slice(0, visibleTechLimit);
    const extraTechCount = Math.max(0, project.technologies.length - visibleTechLimit);

    return (
        <div
            ref={cardRef}
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
            className={`group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border outline-none hover:-translate-y-0.5 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-brand-blue dark:focus-visible:ring-[#00D2FF] ${
                isFeatured 
                ? "border-black/15 dark:border-white/15 bg-white/95 dark:bg-[#0A0C10]/95 hover:border-black/30 dark:hover:border-white/25 p-5 sm:p-7 lg:p-9" 
                : "border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#080A0E]/95 hover:border-black/25 dark:hover:border-white/20 p-5 sm:p-6 md:p-7"
            } shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-[transform,border-color,background-color,box-shadow] duration-200 ease-[var(--ease-out)]`}
        >
            {/* COVER IMAGE (conditional) */}
            {hasCover ? (
                <>
                    <Image
                        src={project.coverImage!}
                        alt={project.title}
                        fill
                        className="object-cover z-0 transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]"
                        sizes={isFeatured
                            ? "(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 66vw"
                            : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        }
                    />
                    {/* Multi-stop obsidian overlay + subtle project-color vignette for WCAG AAA readability */}
                    <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#050505]/95 via-[#050505]/80 to-[#050505]/50 pointer-events-none" />
                    <div
                        className="absolute inset-0 z-[1] pointer-events-none opacity-35 transition-opacity duration-300 group-hover:opacity-55"
                        style={{
                            background: `radial-gradient(420px circle at 0% 100%, rgba(${rgbStr}, 0.28), transparent 70%)`,
                        }}
                    />
                </>
            ) : (
                <>
                    {/* Trame blueprint cyber-physique pour les cartes sans image de couverture */}
                    <div
                        className="pointer-events-none absolute inset-0 z-0 opacity-60 dark:opacity-100"
                        style={{
                            backgroundImage: `radial-gradient(rgba(${rgbStr}, 0.22) 1px, transparent 1px)`,
                            backgroundSize: '18px 18px',
                            maskImage: 'radial-gradient(circle at 100% 0%, black 0%, transparent 72%)',
                            WebkitMaskImage: 'radial-gradient(circle at 100% 0%, black 0%, transparent 72%)',
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
                        style={{
                            background: `radial-gradient(280px circle at 100% 0%, rgba(${rgbStr}, 0.11), transparent 75%)`,
                        }}
                    />
                </>
            )}

            {/* 1. ACCENT VERTICAL GAUCHE + LIGNE SUPÉRIEURE CALIBRÉE */}
            <div 
                className="absolute left-0 top-0 h-full w-[2.5px] origin-left transition-transform duration-300 group-hover:scale-x-150 z-[2]"
                style={{ 
                    background: `linear-gradient(180deg, rgb(${rgbStr}), rgba(${rgbStr}, 0.15))`,
                    opacity: isTouchDevice ? 0.85 : (isHovered ? 1 : 0.65),
                }}
            />

            {/* 2. SCHÉMA VECTORIEL EN FILIGRANE (Propre à chaque projet sans coverImage) */}
            {!hasCover && (
                <motion.div 
                    className="absolute right-5 bottom-16 h-20 w-20 sm:h-24 sm:w-24 pointer-events-none z-0"
                    style={{ color: `rgb(${rgbStr})` }}
                    animate={{ 
                        rotate: isTouchDevice ? 0 : (isHovered ? 4 : 0),
                        opacity: isTouchDevice ? 0.22 : (isHovered ? 0.36 : 0.14),
                        scale: isTouchDevice ? 1 : (isHovered ? 1.06 : 1)
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                >
                    <ProjectSchematic projectId={project.id} category={project.category} />
                </motion.div>
            )}

            {/* Dynamic Spotlight en CSS natif */}
            {mounted && !isTouchDevice && (
                <div
                    className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), rgba(${rgbStr}, 0.08), transparent 80%)`,
                    }}
                />
            )}

            {/* CONTENU PRINCIPAL */}
            <div className={`relative z-10 flex h-full flex-col justify-between gap-4 ${hasCover ? 'text-white' : ''}`}>
                <div className="flex flex-col">
                    {/* 3. HEADER : Emblème Vectoriel Unique + Séquence SYS.XX + Année + Catégorie */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span
                                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border p-1 ${
                                    hasCover
                                        ? 'border-white/20 bg-black/45 backdrop-blur-sm'
                                        : 'border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]'
                                }`}
                                style={{ color: hasCover ? '#ffffff' : `rgb(${rgbStr})` }}
                            >
                                <ProjectSchematic projectId={project.id} category={project.category} />
                            </span>

                            {sequenceNumber && (
                                <span
                                    className={`font-mono text-[10px] font-bold tabular-nums uppercase tracking-widest px-2 py-0.5 rounded border ${
                                        hasCover
                                            ? 'border-white/25 bg-black/45 text-white backdrop-blur-sm'
                                            : 'border-black/15 bg-black/[0.04] text-zinc-900 dark:border-white/15 dark:bg-white/[0.06] dark:text-zinc-100'
                                    }`}
                                >
                                    {`SYS.${sequenceNumber}`}
                                </span>
                            )}

                            <span className={`font-mono text-xs font-bold tabular-nums tracking-wider ${hasCover ? 'text-white/85' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                {project.year}
                            </span>

                            {specLabel && (
                                <span
                                    className={`hidden sm:inline-block font-mono text-[10px] font-semibold tabular-nums tracking-wider px-2 py-0.5 rounded border ${
                                        hasCover
                                            ? 'border-white/15 bg-black/40 text-zinc-200 backdrop-blur-sm'
                                            : 'border-black/10 bg-black/[0.02] text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300'
                                    }`}
                                >
                                    {specLabel}
                                </span>
                            )}
                        </div>

                        <span className={`max-w-[210px] sm:max-w-[260px] truncate rounded-md border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                            hasCover 
                                ? 'border-white/20 bg-black/50 text-white/95 backdrop-blur-sm' 
                                : 'border-black/10 bg-black/[0.03] text-zinc-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300'
                        }`}>
                            {project.category}
                        </span>
                    </div>

                    <h3 
                        className={`mb-2.5 font-bold tracking-tight leading-snug ${
                            isFeatured ? 'text-lg sm:text-xl lg:text-2xl' : 'text-base sm:text-lg md:text-xl'
                        } ${hasCover ? 'text-white' : 'text-zinc-900 dark:text-white'}`}
                    >
                        {project.title}
                    </h3>
                    
                    <p
                        className={`max-w-[65ch] text-xs sm:text-sm leading-relaxed line-clamp-3 ${hasCover ? 'text-zinc-200' : 'text-zinc-600 dark:text-zinc-400'}`}
                    >
                        {project.shortDescription}
                    </p>

                    {/* Barre de lecture d'impact à contraste garanti WCAG AAA (Light & Dark) */}
                    <div
                        className="mt-3.5 border-l-2 pl-3 py-0.5"
                        style={{ borderColor: `rgb(${rgbStr})` }}
                    >
                        <p 
                            className={`font-mono text-[11px] font-semibold leading-snug line-clamp-2 ${
                                hasCover ? 'text-zinc-100' : 'text-zinc-800 dark:text-zinc-200'
                            }`}
                        >
                            {project.impact}
                        </p>
                    </div>
                </div>

                {/* BAS : Technologies + Compteur de modules + Flèche CTA */}
                <div className={`mt-auto pt-4 flex items-end justify-between gap-3 border-t ${
                    hasCover ? 'border-white/15' : 'border-black/5 dark:border-white/5'
                }`}>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {visibleTechs.map((tech) => (
                            <span 
                                key={tech}
                                className={`rounded border px-2 py-0.5 font-mono text-[10px] sm:text-[11px] font-medium ${
                                    hasCover
                                        ? 'border-white/20 bg-black/50 text-white/95 backdrop-blur-sm'
                                        : 'border-black/10 bg-black/[0.03] text-zinc-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200'
                                }`}
                            >
                                {tech}
                            </span>
                        ))}
                        {extraTechCount > 0 && (
                            <span
                                className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums ${
                                    hasCover
                                        ? 'border-white/25 bg-white/15 text-white backdrop-blur-sm'
                                        : 'border-black/15 bg-black/[0.05] text-zinc-700 dark:border-white/15 dark:bg-white/[0.08] dark:text-zinc-300'
                                }`}
                            >
                                {`+${extraTechCount}`}
                            </span>
                        )}
                    </div>

                    {/* 4. FLÈCHE CTA ANIMÉE */}
                    <motion.div 
                        className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200 ${
                            hasCover
                                ? 'border-white/25 bg-white/10 group-hover:border-white/45 group-hover:bg-white/20'
                                : 'border-black/10 bg-black/[0.03] group-hover:border-black/25 dark:border-white/15 dark:bg-white/[0.04] dark:group-hover:border-white/30'
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
        </div>
    );
}

