'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

// Palette de couleurs signature Google
const GOOGLE_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];

// --- CONFIGURATION DU CORTÈGE DE RUBANS (SOIE MAGIQUE) ---
const RIBBON_COUNT = 4;            // 4 bandes de soie (aux couleurs Google)
const POINTS_PER_RIBBON = 55;      // Longueur de "mémoire" du ruban (longueur de l'effet)
const DRAW_STEP = 6;               // Distance inter-noeuds : plus c'est petit, plus c'est lisse
const SPRING_CONSTANT = 0.05;      // Force magnétique vers le curseur
const FRICTION = 0.88;             // Glissement dans l'air (très peu de friction = hyper fluide)
const BASE_THICKNESS = 45;         // Épaisseur de la tête (aura lumineuse)
const TRAIL_ELASTICITY = 0.6;      // Flexibilité de la file indienne pour le mouvement "fouet"

class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class SilkRibbon {
    points: Point[];
    color: string;
    headVx: number;
    headVy: number;
    index: number;
    
    // Précacul RGB pour appliquer l'Alpha (opacité)
    r: number; g: number; b: number;

    constructor(color: string, startX: number, startY: number, index: number) {
        this.color = color;
        this.index = index;
        
        const hex = color.replace('#', '');
        this.r = parseInt(hex.substring(0, 2), 16);
        this.g = parseInt(hex.substring(2, 4), 16);
        this.b = parseInt(hex.substring(4, 6), 16);

        this.points = [];
        // Tous les points démarrent à la même position
        for (let i = 0; i < POINTS_PER_RIBBON; i++) {
            this.points.push(new Point(startX, startY));
        }
        this.headVx = 0;
        this.headVy = 0;
    }

    update(targetX: number, targetY: number, time: number) {
        // --- 1. Mouvement de la "Tête" du ruban ---
        // Chaque ruban orbite doucement le curseur avec un décalage de phase (Spirale / ADN)
        const phase = (this.index / RIBBON_COUNT) * Math.PI * 2;
        
        // Rayon de l'orbite qui "respire" (gonfle et se rétracte)
        const orbitRadius = 30 + Math.sin(time * 0.0015 + phase) * 80;
        
        const desiredX = targetX + Math.cos(time * 0.002 + phase) * orbitRadius;
        const desiredY = targetY + Math.sin(time * 0.002 + phase) * orbitRadius;

        // Force de ressort qui attire la tête vers sa destination sur l'orbite
        const ax = (desiredX - this.points[0].x) * SPRING_CONSTANT;
        const ay = (desiredY - this.points[0].y) * SPRING_CONSTANT;

        this.headVx += ax;
        this.headVy += ay;

        // Amortissement de la vélocité pour simuler la fluidité (liquide ou air dense)
        this.headVx *= FRICTION;
        this.headVy *= FRICTION;

        this.points[0].x += this.headVx;
        this.points[0].y += this.headVy;

        // --- 2. Cinématique Inverse (Kinematics) de la Traîne ---
        // Chaque point de la traîne suit le point précédent de manière séquentielle
        for (let i = 1; i < POINTS_PER_RIBBON; i++) {
            const current = this.points[i];
            const prev = this.points[i - 1];

            const dx = prev.x - current.x;
            const dy = prev.y - current.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1; // || 1 évite la division par zéro

            // Si la distance dépasse notre contrainte physique (DRAW_STEP)
            if (distance > DRAW_STEP) {
                const ratio = ((distance - DRAW_STEP) / distance) * TRAIL_ELASTICITY;
                // Le point est tiré vers l'avant proportionnellement au ratio d'élasticité
                current.x += dx * ratio;
                current.y += dy * ratio;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, theme: string) {
        const isDark = theme === 'dark';
        
        // Vitesse de la tête pour déterminer l'épaisseur (affûtée quand ça va vite, gonflée à l'arrêt)
        const speed = Math.sqrt(this.headVx * this.headVx + this.headVy * this.headVy);
        
        // En mode clair (encre), l'épaisseur de base est un peu plus généreuse pour un effet marqueur/calligraphie
        const currentBaseThickness = isDark ? BASE_THICKNESS : BASE_THICKNESS * 1.2;
        const dynamicThickness = Math.max(8, currentBaseThickness - speed * 0.9);

        // Dessiner le ruban segment par segment pour affiner la queue
        for (let i = 0; i < POINTS_PER_RIBBON - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];

            // factor de 0 (tête de ruban) à quasi 1 (queue de ruban)
            const factor = i / (POINTS_PER_RIBBON - 1);
            
            // Le ruban s'affine dramatiquement et artistiquement vers la pointe (pow 1.5 pour une courbe belle)
            const thickness = dynamicThickness * Math.pow(1 - factor, 1.5);
            
            // L'opacité diminue progressivement pour un effet de disparition fondue
            const opacity = Math.pow(1 - factor, 2);

            // Optimisation : on ne dessine pas les bouts invisibles/trop fins
            if (thickness <= 0.1 || opacity <= 0.01) continue;

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            // --- Cœur et Aura ---
            // 1) L'Aura extra large (lumineuse la nuit, pigmentée le jour)
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            if (isDark) {
                // Néon
                ctx.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${opacity * 0.25})`;
            } else {
                // Encre liquide (plus saturée, car mix-blend-multiply "mange" la lumière)
                ctx.strokeStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${opacity * 0.45})`;
            }
            ctx.lineWidth = thickness;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // 2) Le filament interne
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            if (isDark) {
                // Cœur éclatant électrisé
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`; 
            } else {
                // Cœur d'encre pure sombre de la même couleur (très dense)
                // Pour que ce soit harmonieux avec le multiply, on mixe la couleur vers le noir
                const inkR = Math.max(0, this.r - 80);
                const inkG = Math.max(0, this.g - 80);
                const inkB = Math.max(0, this.b - 80);
                ctx.strokeStyle = `rgba(${inkR}, ${inkG}, ${inkB}, ${opacity * 0.9})`; 
            }
            
            ctx.lineWidth = Math.max(0.5, thickness * 0.15); // 15% de l'épaisseur pour un fil central
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
    }
}

export default function CursorStars() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ribbonsRef = useRef<SilkRibbon[]>([]);
    // Position cible (le curseur)
    const targetRef = useRef({ x: 0, y: 0 });
    // Référence mutable du thème pour éviter de relancer l'effet
    const themeRef = useRef(resolvedTheme || 'dark');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        themeRef.current = resolvedTheme || 'dark';
    }, [resolvedTheme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        // Fonction d'initialisation (gère aussi le resize)
        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Démarrage au centre
            targetRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

            // Instancier nos 4 rubans avec leurs couleurs
            ribbonsRef.current = [];
            for (let i = 0; i < RIBBON_COUNT; i++) {
                ribbonsRef.current.push(
                    new SilkRibbon(GOOGLE_COLORS[i], targetRef.current.x, targetRef.current.y, i)
                );
            }
        };
        
        // Configuration initiale
        init();
        window.addEventListener('resize', init);

        // Suivi de la souris
        const onMouseMove = (e: MouseEvent) => {
            targetRef.current = {
                x: e.clientX,
                y: e.clientY
            };
        };
        window.addEventListener('mousemove', onMouseMove);

        let animationId: number;

        const render = (time: DOMHighResTimeStamp) => {
            // Nettoyage complet à chaque frame avec fond transparent
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Mise à jour de la physique et rendu
            const currentTheme = themeRef.current;
            ribbonsRef.current.forEach(ribbon => {
                ribbon.update(targetRef.current.x, targetRef.current.y, time);
                ribbon.draw(ctx, currentTheme);
            });

            animationId = requestAnimationFrame(render);
        };
        animationId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', init);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`pointer-events-none fixed inset-0 z-0 h-full w-full transition-opacity duration-1000 ${
                !mounted || resolvedTheme !== 'light' 
                  ? 'mix-blend-screen opacity-70'
                  : 'mix-blend-multiply opacity-50' 
            }`}
            aria-hidden="true"
        />
    );
}