'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface WebGLFluidOptions {
    TRIGGER?: 'hover' | 'click';
    IMMEDIATE?: boolean;
    NUM_SPLATS?: number;
    CURL?: number;
    SUNRAYS?: boolean;
    SUNRAYS_RESOLUTION?: number;
    SUNRAYS_WEIGHT?: number;
    DENSITY_DISSIPATION?: number;
    VELOCITY_DISSIPATION?: number;
    PRESSURE?: number;
    PRESSURE_ITERATIONS?: number;
    SPLAT_RADIUS?: number;
    SHADING?: boolean;
    COLORFUL?: boolean;
    COLOR_UPDATE_SPEED?: number;
    BACK_COLOR?: { r: number; g: number; b: number };
    TRANSPARENT?: boolean;
    BLOOM?: boolean;
    BLOOM_ITERATIONS?: number;
    BLOOM_RESOLUTION?: number;
    BLOOM_INTENSITY?: number;
    BLOOM_THRESHOLD?: number;
    BLOOM_SOFT_KNEE?: number;
}

type WebGLFluidInstance = unknown;
type WebGLFluidFn = (canvas: HTMLCanvasElement, options: WebGLFluidOptions) => WebGLFluidInstance;

declare global {
    interface Window {
        __webglResonanceColor: string | null;
    }
}

export default function CursorFluid() {
    const { resolvedTheme } = useTheme();
    const [shouldRender, setShouldRender] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fluidInstance = useRef<WebGLFluidInstance>(null);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Activation immediate sur PC et mobile des le montage cote client
        setShouldRender(true);
    }, []);

    useEffect(() => {
        if (!shouldRender || !canvasRef.current || typeof window === 'undefined') return;
        if (fluidInstance.current) return; // Prevent multiple initializations

        let WebGLFluid: WebGLFluidFn | undefined;
        let cleaned = false;
        
        // Garde silencieuse: l'handler touchend de webgl-fluid appelle rt(undefined) si un
        // touch point ne se trouve pas dans le tableau. On l'intercepte globalement.
        const silentErrorGuard = (event: ErrorEvent) => {
            if (
                event.message?.includes("Cannot set properties of undefined") &&
                event.filename?.includes("webgl-fluid")
            ) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return true;
            }
        };
        window.addEventListener('error', silentErrorGuard as EventListener);
        
        // Import dynamique pour s'assurer que ca ne tourne que cote client
        const loadFluid = async () => {
            if (cleaned) return;
            try {
                WebGLFluid = ((await import('./webgl-fluid.js')).default || await import('./webgl-fluid.js')) as WebGLFluidFn;

                if (WebGLFluid) {
                    const isTouch = window.matchMedia('(pointer: coarse)').matches;
                    fluidInstance.current = WebGLFluid(canvasRef.current!, {
                        TRIGGER: 'hover',
                        IMMEDIATE: false,
                        NUM_SPLATS: isTouch ? 1 : 2,
                        CURL: 20,
                        SUNRAYS: false, // Desactive les rayons centraux eblouissants qui forment un disque pixelise
                        SUNRAYS_RESOLUTION: 196,
                        SUNRAYS_WEIGHT: 0.1,
                        DENSITY_DISSIPATION: 3.5,
                        VELOCITY_DISSIPATION: 2.0,
                        PRESSURE: 0.2,
                        PRESSURE_ITERATIONS: isTouch ? 10 : 20,
                        SPLAT_RADIUS: 0.2,
                        SHADING: false,
                        COLORFUL: false,
                        COLOR_UPDATE_SPEED: 4,
                        BACK_COLOR: { r: 5, g: 5, b: 5 },
                        TRANSPARENT: true,
                        BLOOM: false,
                        BLOOM_ITERATIONS: 4,
                        BLOOM_RESOLUTION: 256,
                        BLOOM_INTENSITY: 0.2,
                        BLOOM_THRESHOLD: 0.7,
                        BLOOM_SOFT_KNEE: 0.7
                    });
                }
            } catch (error) {
                console.error("Erreur de chargement du shader WebGL :", error);
            }
        };

        // Planification asynchrone hors du chemin critique LCP
        let idleId: number | null = null;
        let timerId: ReturnType<typeof setTimeout> | null = null;

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            idleId = (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
                .requestIdleCallback(() => {
                    if (!cleaned) loadFluid();
                }, { timeout: 1200 });
        } else {
            timerId = setTimeout(() => {
                if (!cleaned) loadFluid();
            }, 300);
        }

        // Resonance WebGL via Custom Event
        const handleResonance = (e: Event) => {
            const customEvent = e as CustomEvent;
            const color = customEvent.detail?.color;
            if (color) {
                window.__webglResonanceColor = color;
            } else {
                window.__webglResonanceColor = null;
            }
        };

        window.addEventListener('webgl-resonance', handleResonance);
        const currentCanvas = canvasRef.current;

        return () => {
             cleaned = true;
             if (idleId !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
                 (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
             }
             if (timerId !== null) {
                 clearTimeout(timerId);
             }
             window.removeEventListener('webgl-resonance', handleResonance);
             window.removeEventListener('error', silentErrorGuard as EventListener);
             if (currentCanvas && typeof currentCanvas.getContext === 'function') {
                 const gl = currentCanvas.getContext('webgl2') || currentCanvas.getContext('webgl');
                 const loseContextExt = gl?.getExtension('WEBGL_lose_context');
                 if (loseContextExt) {
                     loseContextExt.loseContext();
                 }
             }
             fluidInstance.current = null;
        };
    }, [shouldRender]);

    if (!shouldRender) return null;

    return (
        <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden">
             {/* 
                Le Canvas Magique : 
                - Nuit (dark) : Fond sombre, voile fluide subtil et contraste
                - Jour (light) : Filtre CSS adapte
             */}
            <canvas
                ref={canvasRef}
                style={{
                     width: '100vw',
                     height: '100dvh',
                     minHeight: '100vh',
                     filter: resolvedTheme === 'light' ? 'invert(1) hue-rotate(180deg) brightness(0.6)' : 'none',
                     mixBlendMode: resolvedTheme === 'light' ? 'multiply' : 'screen',
                     opacity: resolvedTheme === 'light' ? 0.35 : 0.45,
                     transition: 'filter 1s ease-in-out, opacity 1s ease-in-out'
                }}
                className="absolute inset-0 z-0 pointer-events-none h-screen h-[100dvh] w-screen"
                aria-hidden="true"
            />
        </div>
    );
}
