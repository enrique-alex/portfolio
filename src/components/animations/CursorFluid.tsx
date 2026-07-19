'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

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
    const pathname = usePathname();
    const [shouldRender, setShouldRender] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fluidInstance = useRef<WebGLFluidInstance>(null); // Référence pour l'instance WebGL fluide

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobileOrTouch = window.matchMedia('(pointer: coarse)').matches;

        if (prefersReducedMotion || isMobileOrTouch) return;

        const enableFluid = () => setShouldRender(true);

        if ('requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(enableFluid, { timeout: 1500 });
            return () => window.cancelIdleCallback(idleId);
        } else {
            const timeoutId = setTimeout(enableFluid, 500);
            return () => clearTimeout(timeoutId);
        }
    }, []);

    useEffect(() => {
        if (!shouldRender || !canvasRef.current || typeof window === 'undefined') return;

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
        
        // Import dynamique pour s'assurer que ça ne tourne que côté client
        const loadFluid = async () => {
            if (cleaned) return;
            try {
                WebGLFluid = ((await import('./webgl-fluid.js')).default || await import('./webgl-fluid.js')) as WebGLFluidFn;

                if (WebGLFluid) {
                    fluidInstance.current = WebGLFluid(canvasRef.current!, {
                    TRIGGER: 'hover',
                    IMMEDIATE: true,
                    NUM_SPLATS: 3,
                    CURL: 20,
                    SUNRAYS: true,
                    SUNRAYS_RESOLUTION: 196,
                    SUNRAYS_WEIGHT: 0.5,
                    DENSITY_DISSIPATION: 3,
                    VELOCITY_DISSIPATION: 1.5,
                    PRESSURE: 0.2,
                    PRESSURE_ITERATIONS: 25,
                    SPLAT_RADIUS: 0.35,
                    SHADING: true,
                    COLORFUL: true,
                    COLOR_UPDATE_SPEED: 8,
                    BACK_COLOR: { r: 0, g: 0, b: 0 },
                    TRANSPARENT: true,
                    BLOOM: true,
                    BLOOM_ITERATIONS: 8,
                    BLOOM_RESOLUTION: 256,
                    BLOOM_INTENSITY: 0.8,
                    BLOOM_THRESHOLD: 0.6,
                    BLOOM_SOFT_KNEE: 0.7
                });
                }
            } catch (error) {
                console.error("Erreur de chargement du shader WebGL :", error);
            }
        };

        // Attendre la fin du preloader avant de lancer l'effet WebGL
        const onPreloaderComplete = () => loadFluid();
        window.addEventListener('preloader-complete', onPreloaderComplete);

        // Résonance WebGL via Custom Event
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

        return () => {
             cleaned = true;
             window.removeEventListener('preloader-complete', onPreloaderComplete);
             window.removeEventListener('webgl-resonance', handleResonance);
             window.removeEventListener('error', silentErrorGuard as EventListener);
        };
    }, [pathname, shouldRender]);

    if (!shouldRender) return null;

    return (
        <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden">
             {/* 
                Le Canvas Magique : 
                - Nuit (light) : Le noir devient transparent, les couleurs vives s'additionnent.
                - Jour (dark) : On inverse le comportement ou on utilise un filtre CSS (hue-rotate/invert) 
                  car webgl-fluid est conçu pour des fonds noirs.
             */}
            <canvas
                ref={canvasRef}
                style={{
                     width: '100vw',
                     height: '100vh',
                     filter: resolvedTheme === 'light' ? 'invert(1) hue-rotate(180deg) brightness(0.6)' : 'none',
                     mixBlendMode: resolvedTheme === 'light' ? 'multiply' : 'screen',
                     opacity: resolvedTheme === 'light' ? 0.4 : 0.6,
                     transition: 'filter 1s ease-in-out, opacity 1s ease-in-out'
                }}
                className="absolute inset-0 z-0 pointer-events-none"
                aria-hidden="true"
            />
        </div>
    );
}
