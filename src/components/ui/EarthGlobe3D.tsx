'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Compass, RotateCcw, Crosshair, MapPin, Globe } from 'lucide-react';
import { generateEarthCloud } from '@/lib/graphics/earthCloud';

export interface EarthGlobe3DProps {
  className?: string;
  onCoordinatesChange?: (coords: { yawDeg: number; pitchDeg: number }) => void;
}

const CAMEROON_YAW = (-12.0 * Math.PI) / 180.0;
const CAMEROON_PITCH = (-4.5 * Math.PI) / 180.0;
const MAX_PITCH = (75.0 * Math.PI) / 180.0;

function computePointSize(pointCount: number): number {
  const R = 2.05;
  const aTerre = 0.26344 * 4.0 * Math.PI * R * R;
  const avgSpacing = Math.sqrt(aTerre / (Math.max(1, pointCount) * 0.866));
  return 0.70 * avgSpacing;
}

export default function EarthGlobe3D({ className = '', onCoordinatesChange }: EarthGlobe3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Coordonnées et état interactif
  const [coords, setCoords] = useState<{ lonDeg: number; latDeg: number }>({
    lonDeg: 12.0,
    latDeg: 4.5,
  });
  const [isInteracting, setIsInteracting] = useState(false);

  // Références d'animation et d'état (évite re-rendus dans la boucle RAF)
  const animStateRef = useRef({
    yaw: CAMEROON_YAW,
    pitch: CAMEROON_PITCH,
    velYaw: 0,
    velPitch: 0,
    isDragging: false,
    isRecentering: false,
    lastPointerX: 0,
    lastPointerY: 0,
    lastPointerTime: 0,
    isVisible: false,
    rafId: 0,
    lastFrameTime: 0,
  });

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const pointsMeshRef = useRef<THREE.Points | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  // Recentrer sur le Cameroun (4.5°N, 12.0°E)
  const handleRecenter = useCallback(() => {
    animStateRef.current.isRecentering = true;
    animStateRef.current.velYaw = 0;
    animStateRef.current.velPitch = 0;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let isDestroyed = false;

    // Détection mobile pour calibrer le point count (2500 mobile / 4500 desktop)
    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 ||
        (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches));
    const pointCount = isMobile ? 2500 : 4500;

    // 1. Initialisation Three.js
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 340;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, 4.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2));
      renderer.setSize(width, height, false);
      rendererRef.current = renderer;
    } catch (err) {
      console.warn('[EarthGlobe3D] Contexte WebGL inaccessible :', err);
      return;
    }

    // 2. Génération du nuage terrestre haute fidélité
    const earth = generateEarthCloud(pointCount, 42);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(earth.positions, 3));
    geometry.setAttribute('aHighlight', new THREE.BufferAttribute(earth.highlights, 1));
    geometry.setAttribute('aDist', new THREE.BufferAttribute(earth.distances, 1));
    geometryRef.current = geometry;

    const fovRad = (45 * Math.PI) / 180;
    const initialScale = height / (2.0 * Math.tan(fovRad * 0.5));
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uScale: { value: initialScale },
        uPointSize: { value: computePointSize(pointCount) },
        uMotion: { value: 1.0 },
        uBaseColor: { value: new THREE.Color(isDark ? 0xe5e3c0 : 0x524b38) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uScale;
        uniform float uPointSize;
        uniform float uMotion;
        attribute float aHighlight;
        attribute float aDist;
        varying float vHighlight;
        varying float vFade;
        varying float vDepth;

        void main() {
          vHighlight = aHighlight;
          float pLen = length(position);
          vec3 n = pLen > 0.0001 ? position / pLen : vec3(0.0, 1.0, 0.0);

          // Onde d'Airy rayonnante depuis le foyer Cameroun (4.5°N, 12.0°E)
          float wave = sin(uTime * 3.0 - aDist * 9.0) * 0.5 + 0.5;
          vec3 p = position + n * (aHighlight * wave * 0.04 * uMotion);

          vec4 mv = modelViewMatrix * vec4(p, 1.0);

          // Backface fading via normale et vue
          vec3 normal = normalize(normalMatrix * n);
          vec3 viewDir = normalize(-mv.xyz);
          float facing = dot(normal, viewDir);
          vFade = smoothstep(0.02, 0.45, facing);

          // Shading de profondeur
          vDepth = clamp((mv.z + 6.8) / 4.0, 0.0, 1.0);

          float pz = max(-mv.z, 0.001);
          float size = uPointSize * uScale * uPixelRatio / pz;
          size *= 1.0 + aHighlight * 0.5 * wave * uMotion;
          gl_PointSize = clamp(size, 1.5, 14.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        varying float vHighlight;
        varying float vFade;
        varying float vDepth;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float disc = 1.0 - smoothstep(0.22, 0.5, d);
          vec3 colDepth = uBaseColor * (0.76 + 0.32 * vDepth);
          vec3 colCameroon = vec3(1.0, 0.72, 0.14); // or ambré #FFB724
          vec3 col = mix(colDepth, colCameroon, vHighlight);
          float depthAlpha = 0.65 + 0.35 * vDepth;
          float a = disc * (0.75 + vHighlight * 0.25) * vFade * depthAlpha;
          if (a < 0.02) discard;
          gl_FragColor = vec4(col, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    materialRef.current = material;

    const pointsMesh = new THREE.Points(geometry, material);
    pointsMesh.rotation.order = 'YXZ';
    pointsMesh.rotation.y = CAMEROON_YAW;
    pointsMesh.rotation.x = CAMEROON_PITCH;
    scene.add(pointsMesh);
    pointsMeshRef.current = pointsMesh;

    // 3. Boucle d'animation avec contrôle d'exécution strict
    const state = animStateRef.current;
    state.yaw = CAMEROON_YAW;
    state.pitch = CAMEROON_PITCH;
    state.velYaw = 0;
    state.velPitch = 0;
    state.lastFrameTime = performance.now();

    const renderLoop = (now: number) => {
      if (isDestroyed) return;

      const dt = Math.min((now - state.lastFrameTime) * 0.001, 0.1);
      state.lastFrameTime = now;

      if (!state.isDragging) {
        if (state.isRecentering) {
          // Recentrage élastique amorti vers le Cameroun
          const lerpFactor = 1.0 - Math.exp(-6.0 * dt);
          state.yaw += (CAMEROON_YAW - state.yaw) * lerpFactor;
          state.pitch += (CAMEROON_PITCH - state.pitch) * lerpFactor;

          if (
            Math.abs(state.yaw - CAMEROON_YAW) < 0.001 &&
            Math.abs(state.pitch - CAMEROON_PITCH) < 0.001
          ) {
            state.yaw = CAMEROON_YAW;
            state.pitch = CAMEROON_PITCH;
            state.isRecentering = false;
          }
        } else if (Math.abs(state.velYaw) > 0.0001 || Math.abs(state.velPitch) > 0.0001) {
          // Décroissance inertielle continue 1 - exp(-k * dt)
          const decay = Math.exp(-4.0 * dt);
          state.yaw += state.velYaw * dt;
          state.pitch += state.velPitch * dt;
          state.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, state.pitch));
          state.velYaw *= decay;
          state.velPitch *= decay;
        } else {
          // Rotation planétaire lente et douce au repos (0.07 rad/s)
          state.yaw += 0.07 * dt;
          // Amortissement très doux du pitch vers l'équateur (0 rad)
          state.pitch += (0.0 - state.pitch) * (1.0 - Math.exp(-0.8 * dt));
        }
      }

      pointsMesh.rotation.y = state.yaw;
      pointsMesh.rotation.x = state.pitch;

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = now * 0.001;
      }

      renderer.render(scene, camera);

      // Calcul des coordonnées géographiques en direct
      const liveLon = (((-state.yaw * 180.0) / Math.PI) % 360 + 540) % 360 - 180;
      const liveLat = (-state.pitch * 180.0) / Math.PI;

      setCoords({
        lonDeg: Math.round(liveLon * 10) / 10,
        latDeg: Math.round(liveLat * 10) / 10,
      });

      if (onCoordinatesChange) {
        onCoordinatesChange({ yawDeg: liveLon, pitchDeg: liveLat });
      }

      if (state.isVisible) {
        state.rafId = requestAnimationFrame(renderLoop);
      }
    };

    const startAnimation = () => {
      if (state.rafId) return;
      state.lastFrameTime = performance.now();
      state.rafId = requestAnimationFrame(renderLoop);
    };

    const stopAnimation = () => {
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = 0;
      }
    };

    // 4. IntersectionObserver : suspendre totalement la boucle hors écran (0% CPU/GPU)
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            state.isVisible = entry.isIntersecting;
            if (entry.isIntersecting && !document.hidden) {
              startAnimation();
            } else {
              stopAnimation();
            }
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(container);
    } else {
      state.isVisible = true;
      startAnimation();
    }

    // 5. Coupure immédiate sur document.hidden
    const handleVisibility = () => {
      if (document.hidden) {
        stopAnimation();
      } else if (state.isVisible) {
        startAnimation();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    // 6. ResizeObserver pour ajuster la géométrie et la caméra
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const cr = entry.contentRect;
          const w = cr.width || 340;
          const h = cr.height || 340;
          if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
            const scale = h / (2.0 * Math.tan(fovRad * 0.5));
            if (materialRef.current) {
              materialRef.current.uniforms.uScale.value = scale;
              materialRef.current.uniforms.uPixelRatio.value = renderer.getPixelRatio();
            }
          }
        }
      });
      resizeObserver.observe(container);
    }

    // 7. Thème (sombre / clair)
    const updateTheme = () => {
      if (typeof document === 'undefined' || !materialRef.current) return;
      const isD = document.documentElement.classList.contains('dark');
      materialRef.current.uniforms.uBaseColor.value.setHex(isD ? 0xe5e3c0 : 0x524b38);
    };

    let themeObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      themeObserver = new MutationObserver(updateTheme);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    // Nettoyage complet
    return () => {
      isDestroyed = true;
      stopAnimation();
      if (observer) observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      if (themeObserver) themeObserver.disconnect();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (pointsMeshRef.current) {
        scene.remove(pointsMeshRef.current);
        pointsMeshRef.current = null;
      }
    };
  }, [onCoordinatesChange]);

  // 8. Gestionnaires d'interaction Drag-to-Rotate
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = animStateRef.current;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignorer si pointer capture n'est pas supporté
    }
    state.isDragging = true;
    state.isRecentering = false;
    state.lastPointerX = e.clientX;
    state.lastPointerY = e.clientY;
    state.lastPointerTime = performance.now();
    state.velYaw = 0;
    state.velPitch = 0;
    setIsInteracting(true);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = animStateRef.current;
    if (!state.isDragging) return;

    const now = performance.now();
    const dtPointer = Math.max(0.001, (now - state.lastPointerTime) * 0.001);

    const dx = e.clientX - state.lastPointerX;
    const dy = e.clientY - state.lastPointerY;

    // Sensibilité angulaire
    const sensitivity = 0.005;
    state.yaw += dx * sensitivity;
    state.pitch += dy * sensitivity;
    state.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, state.pitch));

    // Calcul de la vitesse angulaire pour l'inertie
    const rawVelYaw = (dx * sensitivity) / dtPointer;
    const rawVelPitch = (dy * sensitivity) / dtPointer;
    state.velYaw = state.velYaw * 0.6 + rawVelYaw * 0.4;
    state.velPitch = state.velPitch * 0.6 + rawVelPitch * 0.4;

    state.lastPointerX = e.clientX;
    state.lastPointerY = e.clientY;
    state.lastPointerTime = now;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = animStateRef.current;
    if (!state.isDragging) return;

    state.isDragging = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignorer
    }

    // Clamping de la vitesse initiale pour une inertie douce
    state.velYaw = Math.max(-8, Math.min(8, state.velYaw));
    state.velPitch = Math.max(-8, Math.min(8, state.velPitch));
    setIsInteracting(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-black/5 p-4 shadow-2xl backdrop-blur-sm dark:border-white/10 dark:bg-white/5 ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {/* HUD Header */}
      <div className="mb-3 flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-brand-blue">
            <Globe className="h-3.5 w-3.5" />
            <span className="font-mono text-[9px] font-bold tracking-widest uppercase">
              GEOGRAPHIC RADAR // LVL 5
            </span>
          </div>
          <span className="font-mono text-[8px] tracking-wider text-zinc-500 dark:text-zinc-400">
            NATURAL EARTH BLUE NOISE · CAMEROON FOCAL POINT
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-mono text-[8px] font-bold text-amber-500 uppercase tracking-wider">
            ACTIVE
          </span>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-black/10 bg-zinc-950/20 dark:border-white/10 dark:bg-zinc-900/40">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="h-full w-full cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: 'pan-y' }}
          aria-label="Globe 3D interactif terrestre avec foyer doré au Cameroun"
        />

        {/* Repère de visée discret */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
          <Crosshair className="h-10 w-10 text-brand-blue/60 stroke-[1]" />
        </div>

        {/* Badge Télémétrie Cameroun & France */}
        <div className="pointer-events-none absolute bottom-2 left-2 flex flex-col gap-1 rounded bg-black/60 px-2 py-1 font-mono text-[8px] text-zinc-300 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <MapPin className="h-2.5 w-2.5 text-amber-400" />
            <span>CAMEROUN : 4.5°N, 12.0°E</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-400">
            <Compass className="h-2.5 w-2.5 text-brand-blue" />
            <span>LILLE / DUNKERQUE : 50.6°N, 3.1°E</span>
          </div>
        </div>

        {/* Bouton Tactile de Recentrage */}
        <button
          type="button"
          onClick={handleRecenter}
          title="Recentrer sur le Cameroun"
          className="absolute top-2 right-2 flex items-center gap-1 rounded-md border border-black/10 bg-white/80 px-2 py-1 text-[9px] font-mono font-medium text-zinc-700 shadow-sm backdrop-blur hover:bg-white hover:text-black dark:border-white/10 dark:bg-black/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
        >
          <RotateCcw className="h-2.5 w-2.5 text-amber-400" />
          <span>Recentrer</span>
        </button>
      </div>

      {/* HUD Footer */}
      <div className="mt-3 flex items-center justify-between font-mono text-[9px] text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-1 text-[8px] tracking-wide text-zinc-500">
          <span className="text-brand-blue">✦</span>
          {isInteracting ? 'Contrôle orbital actif...' : 'Maintenir & glisser pour pivoter'}
        </span>
        <span className="rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/5 text-[9px] font-bold">
          {coords.latDeg >= 0 ? `${coords.latDeg}°N` : `${Math.abs(coords.latDeg)}°S`},{' '}
          {coords.lonDeg >= 0 ? `${coords.lonDeg}°E` : `${Math.abs(coords.lonDeg)}°W`}
        </span>
      </div>
    </div>
  );
}
