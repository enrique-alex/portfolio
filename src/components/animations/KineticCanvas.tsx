'use client';

import React, { useEffect, useRef } from 'react';
import { frameManager } from '@/lib/graphics/FrameManager';
import { KineticEnergy } from '@/lib/graphics/KineticEnergy';
import { getQuadVertexShader } from '@/lib/graphics/shaders/quad.vert';
import { getKineticFluidFragmentShader } from '@/lib/graphics/shaders/kinetic-fluid.frag';
import { initThreeIndustrialScene } from '@/lib/graphics/ThreeIndustrialScene';

export const QUAD_VERTICES = new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
  -1,  1,
   1, -1,
   1,  1,
]);

export const KINETIC_WEBGL_CONTEXT_OPTIONS: WebGLContextAttributes = {
  alpha: true,
  antialias: false,
  depth: false,
  stencil: false,
  powerPreference: 'high-performance',
};

function compileShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[KineticCanvas] Erreur de compilation shader :', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vertShader: WebGLShader,
  fragShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[KineticCanvas] Erreur de linkage programme :', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function initKineticWebGL(canvas: HTMLCanvasElement): () => void {
  if (typeof window === 'undefined') return () => {};

  // 1. Initialiser le contexte WebGL 2.0 avec fallback WebGL 1.0
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  let isWebGL2 = false;

  const getContext = (): WebGLRenderingContext | WebGL2RenderingContext | null => {
    try {
      const ctx2 = canvas.getContext('webgl2', KINETIC_WEBGL_CONTEXT_OPTIONS) as WebGL2RenderingContext | null;
      if (ctx2) {
        isWebGL2 = true;
        return ctx2;
      }
      const ctx1 = (canvas.getContext('webgl', KINETIC_WEBGL_CONTEXT_OPTIONS) ||
                    canvas.getContext('experimental-webgl', KINETIC_WEBGL_CONTEXT_OPTIONS)) as WebGLRenderingContext | null;
      if (ctx1) {
        isWebGL2 = false;
        return ctx1;
      }
    } catch (e) {
      console.warn('[KineticCanvas] Impossible d\'initialiser le contexte WebGL :', e);
    }
    return null;
  };

  gl = getContext();

  if (!gl) {
    console.warn('[KineticCanvas] Contexte WebGL non disponible.');
    return () => {};
  }

  // Pipeline resources
  let vertShader: WebGLShader | null = null;
  let fragShader: WebGLShader | null = null;
  let program: WebGLProgram | null = null;
  let vbo: WebGLBuffer | null = null;
  let vao: WebGLVertexArrayObject | null = null;

  let uTimeLoc: WebGLUniformLocation | null = null;
  let uEnergyLoc: WebGLUniformLocation | null = null;
  let uMouseLoc: WebGLUniformLocation | null = null;
  let uResolutionLoc: WebGLUniformLocation | null = null;

  const deleteResources = () => {
    if (!gl) return;
    if (vao && isWebGL2 && typeof (gl as WebGL2RenderingContext).deleteVertexArray === 'function') {
      try {
        (gl as WebGL2RenderingContext).deleteVertexArray(vao);
      } catch {
        // Safe disposal
      }
      vao = null;
    }
    if (vbo) {
      try { gl.deleteBuffer(vbo); } catch { /* noop */ }
      vbo = null;
    }
    if (program) {
      try { gl.deleteProgram(program); } catch { /* noop */ }
      program = null;
    }
    if (vertShader) {
      try { gl.deleteShader(vertShader); } catch { /* noop */ }
      vertShader = null;
    }
    if (fragShader) {
      try { gl.deleteShader(fragShader); } catch { /* noop */ }
      fragShader = null;
    }
  };

  const setupPipeline = (): boolean => {
    if (!gl || gl.isContextLost()) return false;

    deleteResources();

    // 2. Compilation des shaders GLSL minimaux
    const vertSource = getQuadVertexShader(isWebGL2);
    const fragSource = getKineticFluidFragmentShader(isWebGL2);

    vertShader = compileShader(gl, gl.VERTEX_SHADER, vertSource);
    fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);

    if (!vertShader || !fragShader) {
      deleteResources();
      return false;
    }

    program = createProgram(gl, vertShader, fragShader);
    if (!program) {
      deleteResources();
      return false;
    }

    gl.useProgram(program);

    // 3. Géométrie : 1 seul buffer VBO fixe pour le quad plein écran (+ VAO si WebGL2)
    if (isWebGL2 && typeof (gl as WebGL2RenderingContext).createVertexArray === 'function') {
      vao = (gl as WebGL2RenderingContext).createVertexArray();
      if (vao) {
        (gl as WebGL2RenderingContext).bindVertexArray(vao);
      }
    }

    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTICES, gl.STATIC_DRAW);

    const aPosLocation = gl.getAttribLocation(program, 'a_position');
    if (aPosLocation !== -1) {
      gl.enableVertexAttribArray(aPosLocation);
      gl.vertexAttribPointer(aPosLocation, 2, gl.FLOAT, false, 0, 0);
    }

    // 4. Emplacements d'uniforms
    uTimeLoc = gl.getUniformLocation(program, 'u_time');
    uEnergyLoc = gl.getUniformLocation(program, 'u_energy');
    uMouseLoc = gl.getUniformLocation(program, 'u_mouse');
    uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');

    return true;
  };

  setupPipeline();

  // Suivi de la souris et du touch (coordonnées normalisées [0.0, 1.0])
  let mouseX = 0.5;
  let mouseY = 0.5;

  const handlePointerEvent = (e: MouseEvent | PointerEvent) => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    mouseX = Math.min(1.0, Math.max(0.0, e.clientX / w));
    mouseY = Math.min(1.0, Math.max(0.0, 1.0 - (e.clientY / h)));
  };

  window.addEventListener('pointermove', handlePointerEvent, { passive: true });
  window.addEventListener('pointerdown', handlePointerEvent, { passive: true });

  // Redimensionnement adapté au viewport (DPR plafonné à 1.5 sur mobile sans reflow DOM)
  const updateSize = () => {
    if (!canvas || !gl || gl.isContextLost()) return;
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;
    const isMobile =
      width < 768 ||
      (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches);

    const rawDpr = window.devicePixelRatio || 1;
    const maxDpr = isMobile ? 1.5 : 2.0;
    const dpr = Math.min(rawDpr, maxDpr);

    const targetWidth = Math.max(1, Math.floor(width * dpr));
    const targetHeight = Math.max(1, Math.floor(height * dpr));

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      gl.viewport(0, 0, targetWidth, targetHeight);
    }
  };

  updateSize();
  window.addEventListener('resize', updateSize, { passive: true });

  // Gestion de la perte et restauration de contexte GPU (webglcontextlost & webglcontextrestored)
  const handleContextLost = (e: Event) => {
    e.preventDefault();
  };

  const handleContextRestored = () => {
    gl = getContext();
    if (gl) {
      setupPipeline();
      updateSize();
    }
  };

  if (typeof canvas.addEventListener === 'function') {
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
  }

  // 5. Raccordement au FrameManager
  let accumulatedTime = 0;

  const unsubscribeFrame = frameManager.subscribe((dt: number, _now: number, isReducedMotion?: boolean) => {
    if (!gl || gl.isContextLost() || !program) return;

    const isReduced = Boolean(
      isReducedMotion ??
      frameManager.isReducedMotion ??
      (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    );

    let currentEnergy = 0.0;
    let currentUtime = 0.0;

    // Accessibilité : si prefers-reduced-motion est actif, bloquer l'énergie à 0 et figer u_time
    if (isReduced) {
      currentEnergy = 0.0;
      currentUtime = 0.0;
      accumulatedTime = 0.0;
    } else {
      currentEnergy = KineticEnergy.getInstance().getEnergy();
      accumulatedTime += dt;
      currentUtime = accumulatedTime;
    }

    gl.useProgram(program);

    if (uTimeLoc !== null) {
      gl.uniform1f(uTimeLoc, currentUtime);
    }
    if (uEnergyLoc !== null) {
      gl.uniform1f(uEnergyLoc, currentEnergy);
    }
    if (uMouseLoc !== null) {
      gl.uniform2f(uMouseLoc, mouseX, mouseY);
    }
    if (uResolutionLoc !== null) {
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
    }

    if (vao && isWebGL2 && typeof (gl as WebGL2RenderingContext).bindVertexArray === 'function') {
      (gl as WebGL2RenderingContext).bindVertexArray(vao);
    }

    // 1 seul draw call par trame
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });

  // Nettoyage au démontage
  return () => {
    unsubscribeFrame();
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointermove', handlePointerEvent);
      window.removeEventListener('pointerdown', handlePointerEvent);
      window.removeEventListener('resize', updateSize);
    }

    if (typeof canvas.removeEventListener === 'function') {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    }

    deleteResources();
  };
}

export { initThreeIndustrialScene };

export default function KineticCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return;

    return initThreeIndustrialScene(canvas);
  }, []);

  return (
    <canvas
      id="gl"
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      style={{ zIndex: 0, touchAction: 'pan-y' }}
      aria-hidden="true"
    />
  );
}
