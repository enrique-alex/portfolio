'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCcw, Crosshair, Activity } from 'lucide-react';
import { generateEarthCloud } from '@/lib/graphics/earthCloud';
import {
  DUAL_AXIS_LAT,
  DUAL_AXIS_LON,
  GEODESIC_DISTANCE_KM,
} from '@/lib/geoData';

export interface EarthGlobe3DProps {
  className?: string;
  onCoordinatesChange?: (coords: { yawDeg: number; pitchDeg: number }) => void;
}

const DUAL_AXIS_YAW = (-DUAL_AXIS_LON * Math.PI) / 180.0;
const DUAL_AXIS_PITCH = (DUAL_AXIS_LAT * Math.PI) / 180.0;
const MAX_PITCH = (75.0 * Math.PI) / 180.0;

function computePointSize(pointCount: number): number {
  const R = 2.05;
  const aTerre = 0.28324 * 4.0 * Math.PI * R * R;
  const avgSpacing = Math.sqrt(aTerre / (Math.max(1, pointCount) * 0.866));
  return 0.60 * avgSpacing;
}

export default function EarthGlobe3D({ className = '', onCoordinatesChange }: EarthGlobe3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coordsSpanRef = useRef<HTMLSpanElement>(null);

  const [isInteracting, setIsInteracting] = useState(false);

  // Références d'animation et d'état (évite re-rendus dans la boucle RAF)
  const animStateRef = useRef({
    yaw: DUAL_AXIS_YAW,
    pitch: DUAL_AXIS_PITCH,
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

  // Aligner sur l'axe Cameroun - France
  const handleRecenter = useCallback(() => {
    animStateRef.current.isRecentering = true;
    animStateRef.current.velYaw = 0;
    animStateRef.current.velPitch = 0;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const canvasContainer = canvasContainerRef.current;
    if (!canvas || !container || !canvasContainer) return;

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

    const width = canvasContainer.clientWidth || 300;
    const height = canvasContainer.clientHeight || width || 300;

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

    // 2. Génération du nuage terrestre Dual-Hub haute fidélité
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
        varying float vDist;
        varying float vFade;
        varying float vPhoton;

        void main() {
          vHighlight = aHighlight;
          vDist = aDist;

          vec3 n = normalize(position);
          vec3 p = position;
          float photon = 0.0;

          if (aHighlight > 2.5) {
            // Arc géodésique : impulsion photonique circulant le long du grand cercle (aDist = t in [0, 1])
            float photonPhase = fract(uTime * 0.35);
            float pDiff = abs(aDist - photonPhase);
            if (pDiff > 0.5) pDiff = 1.0 - pDiff;
            photon = exp(-pow(pDiff / 0.055, 2.0));
            vPhoton = photon;
          } else {
            // Ondes sonar rayonnant depuis Yaoundé et Lille
            float wave = sin(uTime * 3.0 - aDist * 9.0) * 0.5 + 0.5;
            float amp = (aHighlight > 0.5) ? 0.025 : 0.008;
            p = position + n * (wave * amp * uMotion);
            vPhoton = 0.0;
          }

          vec4 mv = modelViewMatrix * vec4(p, 1.0);

          // Vrai vecteur de vue : horizon correct en perspective
          vec3 vn = normalize(normalMatrix * n);
          float facing = dot(vn, normalize(-mv.xyz));

          if (aHighlight > 2.5) {
            vFade = smoothstep(-0.15, 0.35, facing);
          } else {
            vFade = smoothstep(0.01, 0.45, facing);
          }

          float pz = max(-mv.z, 0.001);
          float size = uPointSize * uScale * uPixelRatio / pz;

          if (aHighlight > 2.5) {
            size *= 1.15 + 1.85 * photon * uMotion;
          } else if (aHighlight > 0.5) {
            size *= 1.35; // Frontières vectorielles fines et précises
          }

          gl_PointSize = clamp(size, 1.5, 14.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        varying float vHighlight;
        varying float vDist;
        varying float vFade;
        varying float vPhoton;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float disc = 1.0 - smoothstep(0.20, 0.50, d);

          vec3 colCameroon = vec3(1.0, 0.72, 0.14); // or ambré #FFB724
          vec3 colFrance = vec3(0.22, 0.74, 0.97);   // cyan / cobalt #38BDF8
          vec3 colBase = uBaseColor;

          vec3 col;
          float alphaMult = 1.0;

          if (vHighlight > 2.5) {
            // Arc géodésique : dégradé ambre -> cyan + éclat photonique
            vec3 arcGrad = mix(colCameroon, colFrance, vDist);
            col = mix(arcGrad, vec3(1.0, 1.0, 1.0), vPhoton * 0.75);
            alphaMult = 0.95 + 0.05 * vPhoton;
          } else if (vHighlight > 1.5) {
            // Frontière vectorielle France
            col = colFrance;
            alphaMult = 1.0;
          } else if (vHighlight > 0.5) {
            // Frontière vectorielle Cameroun
            col = colCameroon;
            alphaMult = 1.0;
          } else {
            // Terres continentales globales
            col = colBase;
            alphaMult = 0.75;
          }

          float a = disc * alphaMult * vFade;
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
    pointsMesh.rotation.order = 'XYZ';
    pointsMesh.rotation.y = DUAL_AXIS_YAW;
    pointsMesh.rotation.x = DUAL_AXIS_PITCH;
    scene.add(pointsMesh);
    pointsMeshRef.current = pointsMesh;

    // 3. Boucle d'animation avec contrôle d'exécution strict
    const state = animStateRef.current;
    state.yaw = DUAL_AXIS_YAW;
    state.pitch = DUAL_AXIS_PITCH;
    state.velYaw = 0;
    state.velPitch = 0;
    state.lastFrameTime = performance.now();

    const renderLoop = (now: number) => {
      if (isDestroyed) return;

      const dt = Math.min((now - state.lastFrameTime) * 0.001, 0.1);
      state.lastFrameTime = now;

      if (!state.isDragging) {
        if (state.isRecentering) {
          // Recentrage élastique amorti sur l'axe Cameroun-France
          let diffYaw = (DUAL_AXIS_YAW - state.yaw) % (2.0 * Math.PI);
          if (diffYaw > Math.PI) diffYaw -= 2.0 * Math.PI;
          if (diffYaw < -Math.PI) diffYaw += 2.0 * Math.PI;

          const diffPitch = DUAL_AXIS_PITCH - state.pitch;
          const lerpFactor = 1.0 - Math.exp(-6.0 * dt);
          state.yaw += diffYaw * lerpFactor;
          state.pitch += diffPitch * lerpFactor;

          if (Math.abs(diffYaw) < 0.001 && Math.abs(diffPitch) < 0.001) {
            state.yaw = DUAL_AXIS_YAW;
            state.pitch = DUAL_AXIS_PITCH;
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
          // Rotation planétaire douce au repos (0.05 rad/s)
          state.yaw += 0.05 * dt;
          // Maintien du pitch vers l'axe médian d'observation
          state.pitch += (DUAL_AXIS_PITCH - state.pitch) * (1.0 - Math.exp(-0.8 * dt));
        }

        // Maintien de l'angle yaw dans [-PI, PI]
        if (state.yaw > Math.PI) state.yaw -= 2.0 * Math.PI;
        if (state.yaw < -Math.PI) state.yaw += 2.0 * Math.PI;
      }

      pointsMesh.rotation.y = state.yaw;
      pointsMesh.rotation.x = state.pitch;

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = now * 0.001;
      }

      renderer.render(scene, camera);

      // Notification des coordonnées orbitales
      if (coordsSpanRef.current) {
        const yawDeg = (-state.yaw * 180) / Math.PI;
        const pitchDeg = (state.pitch * 180) / Math.PI;
        coordsSpanRef.current.textContent = `${Math.abs(pitchDeg).toFixed(1)}°${pitchDeg >= 0 ? 'N' : 'S'}, ${Math.abs(yawDeg).toFixed(1)}°${yawDeg >= 0 ? 'E' : 'W'}`;
        if (onCoordinatesChange) {
          onCoordinatesChange({ yawDeg, pitchDeg });
        }
      }

      if (state.isVisible) {
        state.rafId = requestAnimationFrame(renderLoop);
      }
    };

    const startAnimation = () => {
      if (!state.rafId && !isDestroyed) {
        state.lastFrameTime = performance.now();
        state.rafId = requestAnimationFrame(renderLoop);
      }
    };

    const stopAnimation = () => {
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = 0;
      }
    };

    // 4. IntersectionObserver pour couper le rendu hors viewport
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            state.isVisible = entry.isIntersecting;
            if (entry.isIntersecting) {
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

    // 6. ResizeObserver sur le conteneur carré du canvas
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const cr = entry.contentRect;
          const w = cr.width || 300;
          const h = cr.height || w || 300;
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
      resizeObserver.observe(canvasContainer);
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
      try {
        renderer.forceContextLoss();
      } catch {
        // Safe disposal
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

  // 8. Interaction Drag-to-Rotate (ZÉRO répulsion particulaire)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = animStateRef.current;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignorer
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

    const sensitivity = 0.005;
    state.yaw += dx * sensitivity;
    state.pitch += dy * sensitivity;
    state.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, state.pitch));

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

    const now = performance.now();
    if (now - state.lastPointerTime > 80) {
      state.velYaw = 0;
      state.velPitch = 0;
    } else {
      state.velYaw = Math.max(-8, Math.min(8, state.velYaw));
      state.velPitch = Math.max(-8, Math.min(8, state.velPitch));
    }
    setIsInteracting(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-black/5 p-4 shadow-2xl backdrop-blur-sm dark:border-white/10 dark:bg-white/5 ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {/* HUD Header d'Ingénierie Télémétrique */}
      <div className="mb-3 flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-brand-blue">
            <Activity className="h-3.5 w-3.5" />
            <span className="font-mono text-[9px] font-bold tracking-widest uppercase">
              GEODETIC TELEMETRY // WGS-84 DUAL-HUB
            </span>
          </div>
          <span className="font-mono text-[8px] tracking-wider text-zinc-500 dark:text-zinc-400">
            GREAT-CIRCLE ORBITAL TRAJECTORY · {GEODESIC_DISTANCE_KM.toLocaleString()} KM · RESOLUTION 0.05°
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[8px] font-bold text-emerald-500 uppercase tracking-wider">
            SYS_ONLINE
          </span>
        </div>
      </div>

      {/* 3D Canvas Container (ratio carré 1:1 strict) */}
      <div
        ref={canvasContainerRef}
        className="relative aspect-square w-full overflow-hidden rounded-xl border border-black/10 bg-zinc-950/20 dark:border-white/10 dark:bg-zinc-900/40"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="h-full w-full cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: 'pan-y' }}
          aria-label="Globe 3D interactif géodésique reliant le Cameroun et la France"
        />

        {/* Repère de visée discret */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
          <Crosshair className="h-10 w-10 text-brand-blue/60 stroke-[1]" />
        </div>

        {/* Badge Télémétrie Dual-Hub (Cameroun & France) */}
        <div className="pointer-events-none absolute bottom-2 left-2 flex flex-col gap-1 rounded bg-black/70 px-2.5 py-1.5 font-mono text-[8px] text-zinc-300 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            <span>NODE 01 : YAOUNDÉ [CM] · 03°50&apos;N 11°30&apos;E</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400"></span>
            <span>NODE 02 : LILLE-DUNKERQUE [FR] · 50°38&apos;N 03°03&apos;E</span>
          </div>
          <div className="mt-0.5 border-t border-white/10 pt-1 text-[7.5px] text-zinc-400 flex items-center justify-between gap-3">
            <span>ORTHODROMIE : {GEODESIC_DISTANCE_KM.toLocaleString()} KM</span>
            <span className="text-zinc-500">Δσ = 47.3°</span>
          </div>
        </div>

        {/* Bouton Tactile d'Alignement Dual-Hub */}
        <button
          type="button"
          onClick={handleRecenter}
          title="Aligner sur l'axe Cameroun - France"
          className="absolute top-2 right-2 flex items-center gap-1 rounded-md border border-black/10 bg-white/80 px-2 py-1 text-[9px] font-mono font-medium text-zinc-700 shadow-sm backdrop-blur hover:bg-white hover:text-black dark:border-white/10 dark:bg-black/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
        >
          <RotateCcw className="h-2.5 w-2.5 text-brand-blue" />
          <span>ALIGN DUAL-AXIS</span>
        </button>
      </div>

      {/* HUD Footer */}
      <div className="mt-3 flex items-center justify-between font-mono text-[9px] text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-1 text-[8px] tracking-wide text-zinc-500">
          <span className="text-brand-blue">✦</span>
          {isInteracting ? 'Contrôle orbital actif...' : 'Maintenir & glisser pour pivoter'}
        </span>
        <span
          ref={coordsSpanRef}
          className="rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/5 text-[9px] font-bold"
        >
          27.3°N, 8.2°E
        </span>
      </div>
    </div>
  );
}
