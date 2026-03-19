'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export default function CursorFluid() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fluidInstance = useRef<any>(null); // Référence pour l'instance WebGL fluide

    // On s'assure que le composant est monté pour Next.js (Hydration)
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !canvasRef.current || typeof window === 'undefined') return;

        let WebGLFluid: any;
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
                WebGLFluid = (await import('./webgl-fluid.js')).default || await import('./webgl-fluid.js');

                fluidInstance.current = WebGLFluid(canvasRef.current, {
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
                (window as any).__webglResonanceColor = color;
            } else {
                (window as any).__webglResonanceColor = null;
            }
        };

        window.addEventListener('webgl-resonance', handleResonance);

        return () => {
             cleaned = true;
             window.removeEventListener('preloader-complete', onPreloaderComplete);
             window.removeEventListener('webgl-resonance', handleResonance);
             window.removeEventListener('error', silentErrorGuard as EventListener);
        };
    }, [mounted]);



    // On attend l'hydratation avant d'afficher quoi que ce soit
    if (!mounted) return null;

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
