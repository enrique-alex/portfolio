'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, Variants, useReducedMotion } from 'framer-motion';
import { LayoutGrid, ListFilter, ChevronLeft, ChevronRight, Sparkles, ArrowUpRight, Terminal } from 'lucide-react';
import Link from 'next/link';
import MagneticProjectCard, { PROJECT_SPECS, ProjectSchematic } from './MagneticProjectCard';
import ProjectCardSkeleton from './ProjectCardSkeleton';
import { Project } from '@/lib/data';
import { useProjectsData } from '@/components/theme/ProjectsProvider';
import { useLanguage } from '@/components/theme/LanguageProvider';

export const DECK_PAGE_SIZE = 6;
const FEATURED_FILTER_KEY = '__featured__';

/**
 * Découpe une liste de projets en plateaux bornés (ex: 6 cartes max par plateau)
 * afin d'éliminer tout tunnel de scroll vertical, quel que soit le nombre total de projets (15, 25, 50+).
 */
export function paginateProjectsDeck(list: Project[], pageSize: number = DECK_PAGE_SIZE): Project[][] {
    const safePageSize = Math.max(1, Math.floor(pageSize));
    if (!Array.isArray(list) || list.length === 0) return [];
    const pages: Project[][] = [];
    for (let i = 0; i < list.length; i += safePageSize) {
        pages.push(list.slice(i, i + safePageSize));
    }
    return pages;
}

/**
 * Calcule les classes d'occupation Bento (Mobile 1 col / Tablette 2 cols / Desktop 3 cols)
 * en garantissant zéro cellule orpheline quel que soit le filtre actif (N = 1..15+), en plafonnant
 * les cartes pleine largeur sur Tablette (max 2 par plateau de 6) et en répartissant les cartes larges
 * par paires disjointes sur Desktop pour préserver l'ordre séquentiel strict (SYS.01 -> SYS.06).
 */
export function getAdaptiveBentoSpan(index: number, list: Project[]): { spanClasses: string; isCardWide: boolean } {
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

    const featuredIndices = list.map((p, i) => (p.isFeatured ? i : -1)).filter((i) => i !== -1);
    const nonFeaturedIndices = list.map((p, i) => (!p.isFeatured ? i : -1)).filter((i) => i !== -1);
    const candidateWideIndices = [...featuredIndices, ...nonFeaturedIndices];

    // 1. Sur Tablette (2 colonnes) :
    // Plafonne le nombre de cartes pleine largeur (md:col-span-2) à 1 (si total impair) ou 2 (si total >= 6 pair
    // avec >= 2 projets phares), évitant d'empiler 6 rangées pleine largeur lorsque tous les projets du plateau sont phares,
    // tout en garantissant (total + tabletWideIndices.length) % 2 === 0 (zéro trou).
    const tabletWideIndices: number[] = [];
    if (total % 2 === 1) {
        tabletWideIndices.push(candidateWideIndices[0]);
    } else if (total >= 6 && featuredIndices.length >= 2) {
        const firstTab = featuredIndices[0];
        const secondTab = featuredIndices.find((idx) => idx !== firstTab && idx >= 3) ?? featuredIndices[1];
        tabletWideIndices.push(firstTab, secondTab);
    }
    const isTabletWide = tabletWideIndices.includes(index);
    const mdClass = isTabletWide ? 'md:col-span-2' : 'md:col-span-1';

    // 2. Sur Desktop (3 colonnes) :
    // Garantit (total + wideCount) % 3 === 0 (zéro trou) et sélectionne au plus 1 carte large par paire disjointe
    // [2*p, 2*p+1] afin que chaque paire forme une rangée complète de 3 colonnes ([2+1] ou [1+2]) sans jamais
    // mélanger l'ordre visuel et l'ordre DOM/clavier (SYS.01 -> SYS.02 -> SYS.03 -> SYS.04 -> SYS.05 -> SYS.06).
    const maxPairableWide = Math.floor(total / 2);
    let wideCount = Math.min(featuredIndices.length, maxPairableWide);
    while (wideCount > 0 && (total + wideCount) % 3 !== 0) {
        wideCount--;
    }
    if ((total + wideCount) % 3 !== 0) {
        for (let w = 1; w <= maxPairableWide; w++) {
            if ((total + w) % 3 === 0) {
                wideCount = w;
                break;
            }
        }
    }

    const pairs: Array<{ pairIdx: number; a: number; b: number; hasFeatured: boolean }> = [];
    for (let p = 0; p < maxPairableWide; p++) {
        const a = 2 * p;
        const b = 2 * p + 1;
        pairs.push({
            pairIdx: p,
            a,
            b,
            hasFeatured: Boolean(list[a]?.isFeatured || list[b]?.isFeatured),
        });
    }

    const prioritizedPairs = [
        ...pairs.filter((pair) => pair.hasFeatured),
        ...pairs.filter((pair) => !pair.hasFeatured),
    ]
        .slice(0, wideCount)
        .sort((x, y) => x.pairIdx - y.pairIdx);

    const activeWideIndices: number[] = [];
    prioritizedPairs.forEach((pair, rank) => {
        const { a, b } = pair;
        const aFeat = Boolean(list[a]?.isFeatured);
        const bFeat = Boolean(list[b]?.isFeatured);
        if (rank % 2 === 0) {
            // Rangée paire : carte large à gauche (colonnes 1-2) en privilégiant l'élément a
            activeWideIndices.push(aFeat || !bFeat ? a : b);
        } else {
            // Rangée impaire : carte large à droite (colonnes 2-3) en privilégiant l'élément b (ordre séquentiel [a(1col), b(2cols)])
            activeWideIndices.push(bFeat || !aFeat ? b : a);
        }
    });

    const wideRank = activeWideIndices.indexOf(index);
    const isDesktopWide = wideRank !== -1;

    let lgClass = 'lg:col-span-1';
    if (isDesktopWide) {
        // Si sur une rangée impaire (wideRank % 2 === 1) l'élément pair (a) a été choisi parce qu'il était le seul phare de la paire,
        // on le place en colonnes 2-3 (lg:col-start-2) pour que b occupe la colonne 1 de la même rangée.
        // Si l'élément impair (b) a été choisi, l'élément a (1 col) occupe déjà naturellement la colonne 1 et b s'étend sur les colonnes 2-3 !
        lgClass = wideRank % 2 === 1 && index % 2 === 0 ? 'lg:col-start-2 lg:col-span-2' : 'lg:col-span-2';
    }

    return {
        spanClasses: `col-span-1 ${mdClass} ${lgClass}`,
        isCardWide: isDesktopWide || isTabletWide,
    };
}

export default function ProjectsGrid() {
    const shouldReduceMotion = useReducedMotion();
    const { projects: rawProjectsData, isLoading, error } = useProjectsData();
    const projectsData = Array.isArray(rawProjectsData) ? rawProjectsData : [];
    const { locale, t } = useLanguage();
    
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeCategoryProjectId, setActiveCategoryProjectId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'bento' | 'matrix'>('bento');
    const [deckPage, setDeckPage] = useState<number>(0);
    const [inspectedId, setInspectedId] = useState<string | null>(null);
    const [pendingJump, setPendingJump] = useState<{
        page: number;
        indexWithinPage: number;
        projectId: string;
        seq: number;
    } | null>(null);
    const mobileTrackRefs = useRef<Array<HTMLDivElement | null>>([]);

    // Extraction des catégories uniques (l'ordre d'apparition originel est conservé)
    const categories = Array.from(new Set(projectsData.map(p => p.category)));
    const featuredCount = projectsData.filter(p => p.isFeatured).length;

    // Préservation transparente du filtre de catégorie lors d'une bascule de langue FR <-> EN
    // grâce à la résolution par identifiant de projet témoin (activeCategoryProjectId).
    const translatedCategoryFromProject = activeCategoryProjectId
        ? projectsData.find(p => p.id === activeCategoryProjectId)?.category ?? null
        : null;

    const effectiveCategory =
        activeCategory === FEATURED_FILTER_KEY
            ? FEATURED_FILTER_KEY
            : activeCategory && categories.includes(activeCategory)
            ? activeCategory
            : translatedCategoryFromProject && categories.includes(translatedCategoryFromProject)
            ? translatedCategoryFromProject
            : null;

    const filteredProjects =
        effectiveCategory === FEATURED_FILTER_KEY
            ? projectsData.filter(p => p.isFeatured)
            : effectiveCategory
            ? projectsData.filter(p => p.category === effectiveCategory)
            : projectsData;

    const deckPages = paginateProjectsDeck(filteredProjects, DECK_PAGE_SIZE);
    const totalPages = Math.max(1, deckPages.length);
    const safeDeckPage = Math.min(Math.max(0, deckPage), totalPages - 1);

    const activeInspectedProject =
        filteredProjects.find(p => p.id === inspectedId) ?? filteredProjects[0] ?? null;

    const resetTrackScrollOnPage = (pageIdx: number) => {
        const track = mobileTrackRefs.current[pageIdx];
        if (track && typeof track.scrollTo === 'function') {
            track.scrollTo({ left: 0, behavior: 'auto' });
        }
    };

    const handleSelectFilter = (nextCat: string | null) => {
        setActiveCategory(nextCat);
        if (nextCat && nextCat !== FEATURED_FILTER_KEY) {
            const sampleProj = projectsData.find(p => p.category === nextCat);
            setActiveCategoryProjectId(sampleProj?.id ?? null);
        } else {
            setActiveCategoryProjectId(null);
        }
        setDeckPage(0);
        resetTrackScrollOnPage(0);
    };

    const handleSelectDeckPage = (nextPage: number) => {
        const clamped = Math.min(Math.max(0, nextPage), totalPages - 1);
        setDeckPage(clamped);
        const firstOnPage = deckPages[clamped]?.[0];
        if (firstOnPage) {
            setInspectedId(firstOnPage.id);
        }
        requestAnimationFrame(() => {
            resetTrackScrollOnPage(clamped);
        });
    };

    const handleSwitchViewMode = (nextMode: 'bento' | 'matrix') => {
        if (nextMode === 'bento' && activeInspectedProject) {
            const idx = filteredProjects.findIndex(p => p.id === activeInspectedProject.id);
            if (idx >= 0) {
                setDeckPage(Math.floor(idx / DECK_PAGE_SIZE));
            }
        }
        setViewMode(nextMode);
    };

    const handleJumpToProjectIndex = (filteredIdx: number, projectId: string) => {
        const targetPage = Math.floor(filteredIdx / DECK_PAGE_SIZE);
        const indexWithinPage = filteredIdx % DECK_PAGE_SIZE;
        setDeckPage(targetPage);
        setInspectedId(projectId);
        setPendingJump((prev) => ({
            page: targetPage,
            indexWithinPage,
            projectId,
            seq: (prev?.seq ?? 0) + 1,
        }));
    };

    // Exécute le défilement horizontal mobile APRÈS validation DOM du plateau cible (lorsqu'il n'est plus display:none)
    useEffect(() => {
        if (!pendingJump || safeDeckPage !== pendingJump.page) return;
        const { page, indexWithinPage } = pendingJump;
        const rafId = requestAnimationFrame(() => {
            const track = mobileTrackRefs.current[page];
            if (track && typeof track.scrollTo === 'function') {
                const cards = track.querySelectorAll<HTMLElement>('[data-deck-card="true"]');
                const targetCard = cards[indexWithinPage];
                if (targetCard) {
                    const left = Math.max(0, targetCard.offsetLeft - track.offsetLeft - 4);
                    track.scrollTo({
                        left,
                        behavior: shouldReduceMotion ? 'auto' : 'smooth',
                    });
                }
            }
            setPendingJump(null);
        });
        return () => cancelAnimationFrame(rafId);
    }, [safeDeckPage, pendingJump, shouldReduceMotion]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.06,
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14, scale: shouldReduceMotion ? 1 : 0.985 },
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
        }
    };

    const pillSpring = shouldReduceMotion
        ? { duration: 0 }
        : { type: 'spring' as const, stiffness: 380, damping: 30 };

    const currentStartIdx = safeDeckPage * DECK_PAGE_SIZE;
    const currentPageItems = deckPages[safeDeckPage] ?? [];
    const firstCanonicalSeq = currentPageItems.length > 0
        ? String(Math.max(0, projectsData.findIndex(p => p.id === currentPageItems[0].id)) + 1).padStart(2, '0')
        : '00';
    const lastCanonicalSeq = currentPageItems.length > 0
        ? String(Math.max(0, projectsData.findIndex(p => p.id === currentPageItems[currentPageItems.length - 1].id)) + 1).padStart(2, '0')
        : '00';

    return (
        <div className="flex w-full flex-col gap-6 md:gap-8">
            {/* BARRE DE COMMANDE GLASS-CHROME (Vengeance UI / Skiper UI) : Filtres + Sélecteur de Mode */}
            <motion.div 
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: shouldReduceMotion ? 0 : undefined, type: shouldReduceMotion ? false : 'spring', stiffness: 280, damping: 28 }}
                className="flex flex-col gap-4 border-b border-black/10 pb-4 lg:flex-row lg:items-center lg:justify-between lg:pb-5 dark:border-white/10"
            >
                {/* Pilules de filtrage par axe / domaine */}
                <div
                    className="flex items-center justify-start gap-2 overflow-x-auto scrollbar-hide pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {/* Tous les systèmes */}
                    <button
                        type="button"
                        aria-pressed={effectiveCategory === null}
                        onClick={() => handleSelectFilter(null)}
                        className={`relative flex-shrink-0 rounded-full px-3.5 py-2 font-mono text-xs font-semibold uppercase tracking-wider active:scale-[0.97] transition-[transform,color,border-color,background-color] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F9FA] dark:focus-visible:ring-[#00D2FF] dark:focus-visible:ring-offset-[#050505] ${
                            effectiveCategory === null
                                ? 'text-white dark:text-zinc-950'
                                : 'border border-black/10 bg-white/80 text-zinc-700 hover:border-black/25 hover:text-zinc-950 dark:border-white/10 dark:bg-[#0A0C10]/80 dark:text-zinc-300 dark:hover:border-white/25 dark:hover:text-white'
                        }`}
                    >
                        {effectiveCategory === null && (
                            <motion.span
                                layoutId="project-filter-pill"
                                className="absolute inset-0 -z-10 rounded-full bg-zinc-900 dark:bg-white"
                                transition={pillSpring}
                            />
                        )}
                        <span className="relative z-10 inline-flex items-center gap-1.5">
                            <span>{t('projects.filters.all')}</span>
                            <span className="text-[11px] opacity-80 tabular-nums">({projectsData.length})</span>
                        </span>
                    </button>

                    {/* Filtre rapide : Architectures Phares (Flagship) */}
                    {featuredCount > 0 && (
                        <button
                            type="button"
                            aria-pressed={effectiveCategory === FEATURED_FILTER_KEY}
                            onClick={() => handleSelectFilter(FEATURED_FILTER_KEY)}
                            className={`relative flex-shrink-0 rounded-full px-3.5 py-2 font-mono text-xs font-semibold uppercase tracking-wider active:scale-[0.97] transition-[transform,color,border-color,background-color] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F9FA] dark:focus-visible:ring-[#00D2FF] dark:focus-visible:ring-offset-[#050505] ${
                                effectiveCategory === FEATURED_FILTER_KEY
                                    ? 'text-white dark:text-zinc-950'
                                    : 'border border-blue-600/25 bg-blue-600/[0.04] text-blue-700 hover:border-blue-600/45 hover:text-blue-900 dark:border-[#00D2FF]/25 dark:bg-[#00D2FF]/[0.05] dark:text-[#00D2FF] dark:hover:border-[#00D2FF]/50 dark:hover:text-white'
                            }`}
                        >
                            {effectiveCategory === FEATURED_FILTER_KEY && (
                                <motion.span
                                    layoutId="project-filter-pill"
                                    className="absolute inset-0 -z-10 rounded-full bg-zinc-900 dark:bg-white"
                                    transition={pillSpring}
                                />
                            )}
                            <span className="relative z-10 inline-flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3" aria-hidden="true" />
                                <span>{t('projects.filters.featured')}</span>
                                <span className="text-[11px] opacity-80 tabular-nums">({featuredCount})</span>
                            </span>
                        </button>
                    )}

                    {/* Domaines techniques */}
                    {categories.map((category) => {
                        const isSelected = effectiveCategory === category;
                        const count = projectsData.filter((p) => p.category === category).length;
                        return (
                            <button
                                key={category}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => handleSelectFilter(category)}
                                className={`relative flex-shrink-0 rounded-full px-3.5 py-2 font-mono text-xs font-semibold uppercase tracking-wider active:scale-[0.97] transition-[transform,color,border-color,background-color] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F9FA] dark:focus-visible:ring-[#00D2FF] dark:focus-visible:ring-offset-[#050505] ${
                                    isSelected
                                        ? 'text-white dark:text-zinc-950'
                                        : 'border border-black/10 bg-white/80 text-zinc-700 hover:border-black/25 hover:text-zinc-950 dark:border-white/10 dark:bg-[#0A0C10]/80 dark:text-zinc-300 dark:hover:border-white/25 dark:hover:text-white'
                                }`}
                            >
                                {isSelected && (
                                    <motion.span
                                        layoutId="project-filter-pill"
                                        className="absolute inset-0 -z-10 rounded-full bg-zinc-900 dark:bg-white"
                                        transition={pillSpring}
                                    />
                                )}
                                <span className="relative z-10 inline-flex items-center gap-1.5">
                                    <span>{category}</span>
                                    <span className="text-[11px] opacity-80 tabular-nums">({count})</span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Sélecteur de Mode d'Exploration (Bento Deck Borné vs Index Système Compact) */}
                <div
                    role="group"
                    aria-label={t('projects.view.ariaLabel')}
                    className="flex shrink-0 items-center self-start lg:self-auto rounded-full border border-black/10 bg-white/85 p-1 backdrop-blur-md dark:border-white/12 dark:bg-[#0A0C10]/90"
                >
                    <button
                        type="button"
                        aria-pressed={viewMode === 'bento'}
                        onClick={() => handleSwitchViewMode('bento')}
                        className={`relative flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider active:scale-[0.97] transition-[transform,color] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF] ${
                            viewMode === 'bento'
                                ? 'text-white dark:text-zinc-950'
                                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                        }`}
                    >
                        {viewMode === 'bento' && (
                            <motion.span
                                layoutId="project-view-mode-pill"
                                className="absolute inset-0 -z-10 rounded-full bg-zinc-900 dark:bg-white"
                                transition={pillSpring}
                            />
                        )}
                        <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t('projects.view.bento')}</span>
                    </button>

                    <button
                        type="button"
                        aria-pressed={viewMode === 'matrix'}
                        onClick={() => handleSwitchViewMode('matrix')}
                        className={`relative flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider active:scale-[0.97] transition-[transform,color] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF] ${
                            viewMode === 'matrix'
                                ? 'text-white dark:text-zinc-950'
                                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                        }`}
                    >
                        {viewMode === 'matrix' && (
                            <motion.span
                                layoutId="project-view-mode-pill"
                                className="absolute inset-0 -z-10 rounded-full bg-zinc-900 dark:bg-white"
                                transition={pillSpring}
                            />
                        )}
                        <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t('projects.view.matrix')}</span>
                    </button>
                </div>
            </motion.div>

            {/* CONTENU PRINCIPAL : VITRINE BENTO PAGINÉE (ZÉRO SCROLL INFINI) OU MATRICE TÉLÉMÉTRIQUE */}
            {isLoading ? (
                <div className="grid w-full grid-cols-1 gap-4 auto-rows-[minmax(360px,auto)] md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:auto-rows-[minmax(360px,auto)] grid-flow-row-dense">
                    {Array.from({ length: DECK_PAGE_SIZE }).map((_, index) => {
                        const spanClasses =
                            index === 0
                                ? "col-span-1 md:col-span-2 lg:col-span-2"
                                : "col-span-1 md:col-span-1 lg:col-span-1";
                        return (
                            <div key={`skeleton-${index}`} className={spanClasses}>
                                <ProjectCardSkeleton isFeatured={index === 0} />
                            </div>
                        );
                    })}
                </div>
            ) : error ? (
                <div className="flex min-h-[360px] w-full items-center justify-center rounded-2xl border border-black/10 bg-white/75 p-8 dark:border-white/10 dark:bg-[#0A0C10]/80">
                    <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                        {error}
                    </p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="flex min-h-[240px] w-full items-center justify-center rounded-2xl border border-black/10 bg-white/75 p-8 dark:border-white/10 dark:bg-[#0A0C10]/80">
                    <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                        {t('projects.empty')}
                    </p>
                </div>
            ) : viewMode === 'matrix' ? (
                /* ─── MODE 2 : INDEX SYSTÈME & INSPECTEUR TÉLÉMÉTRIQUE (Skiper UI / Vengeance UI) ─── */
                <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12 items-start">
                    {/* Colonne Gauche : Registre Compact à Hauteur Bornée */}
                    <div
                        onMouseLeave={() => {
                            if (typeof window !== 'undefined') {
                                window.dispatchEvent(new CustomEvent('webgl-resonance', { detail: { color: null } }));
                            }
                        }}
                        className="lg:col-span-7 flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/90 dark:border-white/12 dark:bg-[#0A0C10]/90"
                    >
                        <div className="flex items-center justify-between border-b border-black/10 bg-black/[0.025] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-3.5 w-3.5 text-blue-600 dark:text-[#00D2FF]" aria-hidden="true" />
                                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200">
                                    {t('projects.matrix.directory')}
                                </span>
                            </div>
                            <span className="font-mono text-[11px] font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">
                                {filteredProjects.length} {filteredProjects.length === 1 ? t('projects.count.one') : t('projects.count.many')}
                            </span>
                        </div>

                        <div className="max-h-[520px] overflow-y-auto divide-y divide-black/8 dark:divide-white/8">
                            {filteredProjects.map((project) => {
                                const canonicalIdx = projectsData.findIndex((p) => p.id === project.id);
                                const seqNum = String((canonicalIdx >= 0 ? canonicalIdx : 0) + 1).padStart(2, '0');
                                const specLabel = PROJECT_SPECS[locale]?.[project.id] ?? PROJECT_SPECS.fr[project.id];
                                const isSelected = activeInspectedProject?.id === project.id;
                                const tc = project.themeColor;
                                const rgbStr = `${tc.r}, ${tc.g}, ${tc.b}`;

                                return (
                                    <div
                                        key={project.id}
                                        onMouseEnter={() => {
                                            setInspectedId(project.id);
                                            if (typeof window !== 'undefined') {
                                                window.dispatchEvent(new CustomEvent('webgl-resonance', { detail: { color: project.themeColor } }));
                                            }
                                        }}
                                        onFocus={() => setInspectedId(project.id)}
                                        className={`group relative flex items-center justify-between gap-3 px-4 py-3.5 transition-[background-color] duration-150 ease-[var(--ease-out)] ${
                                            isSelected
                                                ? 'bg-blue-600/[0.06] dark:bg-[#00D2FF]/[0.08]'
                                                : 'hover:bg-black/[0.025] dark:hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        {/* Indicateur latéral de sélection */}
                                        <span
                                            aria-hidden="true"
                                            className="absolute inset-y-0 left-0 w-[3px] transition-opacity duration-150"
                                            style={{
                                                backgroundColor: `rgb(${rgbStr})`,
                                                opacity: isSelected ? 1 : 0,
                                            }}
                                        />

                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <span
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-black/[0.03] p-1.5 text-zinc-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-[rgb(var(--row-rgb))]"
                                                style={{ '--row-rgb': rgbStr } as React.CSSProperties}
                                            >
                                                <ProjectSchematic projectId={project.id} category={project.category} />
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono text-[11px] font-bold tabular-nums uppercase tracking-wider text-blue-600 dark:text-[#00D2FF]">
                                                        {`SYS.${seqNum}`}
                                                    </span>
                                                    <span className="font-mono text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                                                        {project.year}
                                                    </span>
                                                    {specLabel && (
                                                        <span className="hidden sm:inline-block rounded border border-black/10 bg-black/[0.03] px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-zinc-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">
                                                            {specLabel}
                                                        </span>
                                                    )}
                                                </div>
                                                <Link
                                                    href={`/projects/${project.slug}`}
                                                    className="mt-0.5 block truncate text-sm font-bold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-[#00D2FF] focus-visible:outline-none"
                                                >
                                                    {project.title}
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2.5">
                                            <span className="hidden md:inline-block max-w-[160px] truncate rounded border border-black/10 bg-black/[0.02] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400">
                                                {project.category}
                                            </span>
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                aria-label={`${t('projects.card.open')} ${project.title}`}
                                                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-zinc-700 active:scale-[0.97] transition-[transform,border-color,color] duration-150 ease-[var(--ease-out)] hover:border-blue-600/40 hover:text-blue-600 dark:border-white/12 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:border-[#00D2FF]/40 dark:hover:text-[#00D2FF]"
                                            >
                                                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Colonne Droite : Inspecteur Télémétrique Temps Réel */}
                    <div className="lg:col-span-5 lg:sticky lg:top-28 w-full">
                        {activeInspectedProject && (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between px-1">
                                    <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                                        {t('projects.matrix.inspector')}
                                    </span>
                                    <span className="font-mono text-[11px] font-bold tabular-nums text-blue-600 dark:text-[#00D2FF]">
                                        {`SYS.${String(Math.max(0, projectsData.findIndex(p => p.id === activeInspectedProject.id)) + 1).padStart(2, '0')}`}
                                    </span>
                                </div>
                                <div className="min-h-[360px]">
                                    <MagneticProjectCard
                                        project={activeInspectedProject}
                                        isFeatured={true}
                                        sequenceNumber={String(Math.max(0, projectsData.findIndex(p => p.id === activeInspectedProject.id)) + 1).padStart(2, '0')}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ─── MODE 1 : VITRINE BENTO BORNÉE PAR PLATEAU (6 SYSTÈMES MAX / PAGE + CARROUSEL TACTILE MOBILE) ─── */
                <div className="flex w-full flex-col gap-6">
                    <motion.div
                        key={effectiveCategory ?? 'all'}
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="w-full"
                    >
                        {deckPages.map((pageProjects, pageIdx) => {
                            const isPageActive = pageIdx === safeDeckPage;
                            return (
                                <div
                                    key={`deck-page-${pageIdx}`}
                                    ref={(el) => {
                                        mobileTrackRefs.current[pageIdx] = el;
                                    }}
                                    aria-hidden={!isPageActive}
                                    className={
                                        isPageActive
                                            ? "max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:gap-4 max-md:pb-3 max-md:-mx-1 max-md:px-1 scrollbar-hide grid w-full grid-cols-1 gap-4 auto-rows-[minmax(360px,auto)] md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:auto-rows-[minmax(360px,auto)] grid-flow-row-dense"
                                            : "hidden"
                                    }
                                >
                                    {pageProjects.map((project, index) => {
                                        const { spanClasses, isCardWide } = getAdaptiveBentoSpan(index, pageProjects);
                                        const canonicalIdx = projectsData.findIndex((p) => p.id === project.id);
                                        const seqNum = String((canonicalIdx >= 0 ? canonicalIdx : 0) + 1).padStart(2, '0');
                                        const isJumpHighlighted = inspectedId === project.id;

                                        return (
                                            <motion.div
                                                key={project.id}
                                                data-deck-card="true"
                                                data-project-id={project.id}
                                                variants={itemVariants}
                                                className={`${spanClasses} max-md:w-[86vw] max-md:max-w-[350px] max-md:shrink-0 max-md:snap-center rounded-2xl transition-shadow duration-200 ${
                                                    isJumpHighlighted
                                                        ? 'ring-2 ring-blue-600/70 dark:ring-[#00D2FF]/75'
                                                        : ''
                                                }`}
                                            >
                                                <MagneticProjectCard
                                                    project={project}
                                                    isFeatured={isCardWide}
                                                    sequenceNumber={seqNum}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </motion.div>

                    {/* RAIL DE PILOTAGE DU DECK & ACCÈS DIRECT SYS.01..SYS.15 (Scalable 15..50+ systèmes) */}
                    <div className="flex flex-col gap-3.5 rounded-2xl border border-black/10 bg-white/85 px-4 py-3.5 backdrop-blur-md dark:border-white/10 dark:bg-[#0A0C10]/90 sm:px-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* Statut du plateau actif */}
                            <div className="flex items-center gap-2.5">
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-600/25 bg-blue-600/10 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums uppercase tracking-widest text-blue-700 dark:border-[#00D2FF]/30 dark:bg-[#00D2FF]/10 dark:text-[#00D2FF]">
                                    {`${t('projects.deck.page')} ${String(safeDeckPage + 1).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`}
                                </span>
                                <span className="font-mono text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
                                    {`SYS.${firstCanonicalSeq}–SYS.${lastCanonicalSeq}`}
                                </span>
                                <span className="hidden sm:inline-block font-mono text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                                    {`(${currentStartIdx + 1}–${Math.min(currentStartIdx + DECK_PAGE_SIZE, filteredProjects.length)} / ${filteredProjects.length})`}
                                </span>
                            </div>

                            {/* Indication tactile sur mobile */}
                            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 md:hidden dark:text-zinc-400">
                                {`↔ ${t('projects.deck.swipeHint')}`}
                            </span>

                            {/* Contrôles de pagination Précédent / Plateaux / Suivant */}
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => handleSelectDeckPage(safeDeckPage > 0 ? safeDeckPage - 1 : totalPages - 1)}
                                        aria-label={t('projects.deck.prev')}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-black/[0.03] text-zinc-700 active:scale-[0.97] transition-[transform,border-color,background-color,color] duration-150 ease-[var(--ease-out)] hover:border-black/25 hover:text-zinc-950 dark:border-white/12 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:border-white/30 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF]"
                                    >
                                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                    </button>

                                    <div className="flex items-center gap-1 px-1">
                                        {deckPages.map((_, idx) => {
                                            const isCurrent = idx === safeDeckPage;
                                            return (
                                                <button
                                                    key={`page-btn-${idx}`}
                                                    type="button"
                                                    aria-label={`${t('projects.deck.page')} ${idx + 1}`}
                                                    aria-current={isCurrent ? 'page' : undefined}
                                                    onClick={() => handleSelectDeckPage(idx)}
                                                    className={`h-8 min-w-[32px] rounded-lg px-2 font-mono text-xs font-bold tabular-nums active:scale-[0.97] transition-[transform,background-color,color,border-color] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF] ${
                                                        isCurrent
                                                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                                                            : 'border border-black/10 bg-transparent text-zinc-600 hover:border-black/25 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:border-white/25 dark:hover:text-white'
                                                    }`}
                                                >
                                                    {String(idx + 1).padStart(2, '0')}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleSelectDeckPage((safeDeckPage + 1) % totalPages)}
                                        aria-label={t('projects.deck.next')}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-black/[0.03] text-zinc-700 active:scale-[0.97] transition-[transform,border-color,background-color,color] duration-150 ease-[var(--ease-out)] hover:border-black/25 hover:text-zinc-950 dark:border-white/12 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:border-white/30 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF]"
                                    >
                                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Matrice d'accès direct O(1) par index système (SYS.01 .. SYS.15+) */}
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide border-t border-black/8 pt-2.5 dark:border-white/8">
                            <span className="mr-1 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                {t('projects.deck.quickJump')} :
                            </span>
                            {filteredProjects.map((project, fIdx) => {
                                const canonicalIdx = projectsData.findIndex((p) => p.id === project.id);
                                const seqNum = String((canonicalIdx >= 0 ? canonicalIdx : 0) + 1).padStart(2, '0');
                                const belongsToCurrentPage = Math.floor(fIdx / DECK_PAGE_SIZE) === safeDeckPage;
                                const isTargetProject = inspectedId === project.id;

                                return (
                                    <button
                                        key={`jump-${project.id}`}
                                        type="button"
                                        title={`SYS.${seqNum} — ${project.title}`}
                                        aria-label={`SYS.${seqNum} — ${project.title}`}
                                        aria-pressed={isTargetProject}
                                        onClick={() => handleJumpToProjectIndex(fIdx, project.id)}
                                        className={`shrink-0 rounded-md border px-2 py-1 font-mono text-[10px] font-bold tabular-nums active:scale-[0.97] transition-[transform,border-color,background-color,color] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF] ${
                                            isTargetProject
                                                ? 'border-blue-600 bg-blue-600 text-white dark:border-[#00D2FF] dark:bg-[#00D2FF] dark:text-zinc-950'
                                                : belongsToCurrentPage
                                                ? 'border-blue-600/40 bg-blue-600/10 text-blue-700 dark:border-[#00D2FF]/45 dark:bg-[#00D2FF]/15 dark:text-[#00D2FF]'
                                                : 'border-black/10 bg-black/[0.02] text-zinc-600 hover:border-black/25 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:border-white/25 dark:hover:text-white'
                                        }`}
                                    >
                                        {seqNum}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
