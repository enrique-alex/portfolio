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

interface WebGLFluidInstance {
    destroy?: () => void;
}

type WebGLFluidFn = (canvas: HTMLCanvasElement, options: WebGLFluidOptions) => WebGLFluidInstance | void;

declare global {
    interface Window {
        __webglResonanceColor: { r: number; g: number; b: number } | string | null;
    }
}

export default function CursorFluid() {
    const { resolvedTheme } = useTheme();
    const [shouldRender, setShouldRender] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fluidInstance = useRef<WebGLFluidInstance | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const coarseQuery = window.matchMedia('(pointer: coarse)');

        const updateShouldRender = () => {
            setShouldRender(!motionQuery.matches && !coarseQuery.matches);
        };

        updateShouldRender();
        motionQuery.addEventListener('change', updateShouldRender);
        coarseQuery.addEventListener('change', updateShouldRender);

        return () => {
            motionQuery.removeEventListener('change', updateShouldRender);
            coarseQuery.removeEventListener('change', updateShouldRender);
        };
    }, []);

    useEffect(() => {
        if (!shouldRender || !canvasRef.current || typeof window === 'undefined') return;
        if (fluidInstance.current) return;

        let cleaned = false;

        const loadFluid = async () => {
            if (cleaned || !canvasRef.current) return;
            try {
                const mod = await import('./webgl-fluid.js');
                const WebGLFluid = (mod.default || mod) as unknown as WebGLFluidFn;

                if (typeof WebGLFluid === 'function' && !cleaned && canvasRef.current) {
                    const instance = WebGLFluid(canvasRef.current, {
                        TRIGGER: 'hover',
                        IMMEDIATE: false,
                        NUM_SPLATS: 2,
                        CURL: 20,
                        SUNRAYS: false,
                        SUNRAYS_RESOLUTION: 196,
                        SUNRAYS_WEIGHT: 0.1,
                        DENSITY_DISSIPATION: 3.5,
                        VELOCITY_DISSIPATION: 2.0,
                        PRESSURE: 0.2,
                        PRESSURE_ITERATIONS: 20,
                        SPLAT_RADIUS: 0.25,
                        SHADING: true,
                        COLORFUL: true,
                        COLOR_UPDATE_SPEED: 8,
                        BACK_COLOR: { r: 0, g: 0, b: 0 },
                        TRANSPARENT: true,
                        BLOOM: false,
                        BLOOM_ITERATIONS: 4,
                        BLOOM_RESOLUTION: 256,
                        BLOOM_INTENSITY: 0.2,
                        BLOOM_THRESHOLD: 0.7,
                        BLOOM_SOFT_KNEE: 0.7
                    });
                    fluidInstance.current = instance || {};
                }
            } catch (error) {
                console.error('Erreur de chargement du shader WebGL :', error);
            }
        };

        // Planification asynchrone hors du chemin critique LCP
        let idleId: number | null = null;
        let timerId: ReturnType<typeof setTimeout> | null = null;

        if ('requestIdleCallback' in window) {
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
            window.__webglResonanceColor = color ?? null;
        };

        window.addEventListener('webgl-resonance', handleResonance);
        const currentCanvas = canvasRef.current;

        return () => {
            cleaned = true;
            if (idleId !== null && 'cancelIdleCallback' in window) {
                (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
            }
            if (timerId !== null) {
                clearTimeout(timerId);
            }
            window.removeEventListener('webgl-resonance', handleResonance);
            fluidInstance.current?.destroy?.();
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
            <canvas
                ref={canvasRef}
                style={{
                    width: '100vw',
                    height: '100dvh',
                    minHeight: '100vh',
                    mixBlendMode: resolvedTheme === 'light' ? 'multiply' : 'screen',
                    opacity: resolvedTheme === 'light' ? 0.28 : 0.45,
                    transition: 'opacity 200ms ease-out'
                }}
                className="pointer-events-none absolute inset-0 z-0 h-screen h-[100dvh] w-screen"
                aria-hidden="true"
            />
        </div>
    );
}
