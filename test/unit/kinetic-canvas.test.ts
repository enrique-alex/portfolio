import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import KineticCanvas, {
  initKineticWebGL,
  QUAD_VERTICES,
  KINETIC_WEBGL_CONTEXT_OPTIONS,
} from '@/components/animations/KineticCanvas';
import { frameManager } from '@/lib/graphics/FrameManager';
import { kineticEnergy, KineticEnergy } from '@/lib/graphics/KineticEnergy';
import {
  quadVertexShaderWebGL2,
  quadVertexShaderWebGL1,
  getQuadVertexShader,
} from '@/lib/graphics/shaders/quad.vert';
import {
  kineticFluidFragmentShaderWebGL2,
  kineticFluidFragmentShaderWebGL1,
  getKineticFluidFragmentShader,
} from '@/lib/graphics/shaders/kinetic-fluid.frag';

interface MockGLCalls {
  viewportCalls: Array<[number, number, number, number]>;
  drawArraysCalls: Array<[number, number, number]>;
  uniform1fCalls: Array<[string, number]>;
  uniform2fCalls: Array<[string, number, number]>;
  deletedBuffers: unknown[];
  deletedPrograms: unknown[];
  deletedShaders: unknown[];
  deletedVertexArrays: unknown[];
  bufferDataCalls: Array<{ target: number; data: Float32Array; usage: number }>;
  createdVertexArrays: unknown[];
  boundVertexArrays: unknown[];
}

function createMockWebGLContext(isWebGL2 = true) {
  const calls: MockGLCalls = {
    viewportCalls: [],
    drawArraysCalls: [],
    uniform1fCalls: [],
    uniform2fCalls: [],
    deletedBuffers: [],
    deletedPrograms: [],
    deletedShaders: [],
    deletedVertexArrays: [],
    bufferDataCalls: [],
    createdVertexArrays: [],
    boundVertexArrays: [],
  };

  const uniformMap = new Map<string, { name: string }>();

  let contextLostState = false;

  const mockGL = {
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    FLOAT: 5126,
    TRIANGLES: 4,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,

    calls,
    isWebGL2,

    createShader: vi.fn((type: number) => ({ type })),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn((_shader, pname: number) => {
      if (pname === 35713) return true; // COMPILE_STATUS
      return true;
    }),
    getShaderInfoLog: vi.fn(() => ''),
    deleteShader: vi.fn((shader: unknown) => {
      calls.deletedShaders.push(shader);
    }),

    createProgram: vi.fn(() => ({ id: 'prog-1' })),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn((_program, pname: number) => {
      if (pname === 35714) return true; // LINK_STATUS
      return true;
    }),
    getProgramInfoLog: vi.fn(() => ''),
    useProgram: vi.fn(),
    deleteProgram: vi.fn((prog: unknown) => {
      calls.deletedPrograms.push(prog);
    }),

    createBuffer: vi.fn(() => ({ id: 'vbo-1' })),
    bindBuffer: vi.fn(),
    bufferData: vi.fn((target: number, data: Float32Array, usage: number) => {
      calls.bufferDataCalls.push({ target, data, usage });
    }),
    deleteBuffer: vi.fn((buf: unknown) => {
      calls.deletedBuffers.push(buf);
    }),

    createVertexArray: vi.fn(() => {
      const vao = { id: `vao-${calls.createdVertexArrays.length + 1}` };
      calls.createdVertexArrays.push(vao);
      return vao;
    }),
    bindVertexArray: vi.fn((vao: unknown) => {
      calls.boundVertexArrays.push(vao);
    }),
    deleteVertexArray: vi.fn((vao: unknown) => {
      calls.deletedVertexArrays.push(vao);
    }),

    getAttribLocation: vi.fn((_prog, name: string) => (name === 'a_position' ? 0 : -1)),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),

    getUniformLocation: vi.fn((_prog, name: string) => {
      if (!uniformMap.has(name)) {
        uniformMap.set(name, { name });
      }
      return uniformMap.get(name)!;
    }),
    uniform1f: vi.fn((loc: { name: string } | null, val: number) => {
      if (loc) calls.uniform1fCalls.push([loc.name, val]);
    }),
    uniform2f: vi.fn((loc: { name: string } | null, x: number, y: number) => {
      if (loc) calls.uniform2fCalls.push([loc.name, x, y]);
    }),

    viewport: vi.fn((x: number, y: number, w: number, h: number) => {
      calls.viewportCalls.push([x, y, w, h]);
    }),
    drawArrays: vi.fn((mode: number, first: number, count: number) => {
      calls.drawArraysCalls.push([mode, first, count]);
    }),
    isContextLost: vi.fn(() => contextLostState),
    setContextLost: (val: boolean) => {
      contextLostState = val;
    },
  };

  return mockGL;
}

function setupMockDOMEnvironment(options?: {
  webgl2Supported?: boolean;
  webgl1Supported?: boolean;
  isMobile?: boolean;
}) {
  const {
    webgl2Supported = true,
    webgl1Supported = true,
    isMobile = false,
  } = options || {};

  const gl2 = webgl2Supported ? createMockWebGLContext(true) : null;
  const gl1 = webgl1Supported ? createMockWebGLContext(false) : null;

  const canvasListeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn((contextId: string) => {
      if (contextId === 'webgl2') return gl2;
      if (contextId === 'webgl' || contextId === 'experimental-webgl') return gl1;
      return null;
    }),
    addEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      if (!canvasListeners.has(type)) {
        canvasListeners.set(type, new Set());
      }
      canvasListeners.get(type)!.add(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      canvasListeners.get(type)?.delete(listener);
    }),
    dispatchEvent: vi.fn((event: Event) => {
      canvasListeners.get(event.type)?.forEach((l) => {
        if (typeof l === 'function') l(event);
        else l.handleEvent(event);
      });
      return !event.defaultPrevented;
    }),
  } as unknown as HTMLCanvasElement & {
    dispatchEvent: (event: Event) => boolean;
  };

  const windowListeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
  const mediaQueryListeners = new Map<string, Set<(e: MediaQueryListEvent) => void>>();

  const fakeWindow = {
    innerWidth: isMobile ? 390 : 1920,
    innerHeight: isMobile ? 844 : 1080,
    devicePixelRatio: isMobile ? 3.0 : 2.0, // Mobile device with 3x display

    addEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      if (!windowListeners.has(type)) {
        windowListeners.set(type, new Set());
      }
      windowListeners.get(type)!.add(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      windowListeners.get(type)?.delete(listener);
    }),
    dispatchEvent: vi.fn((event: Event) => {
      windowListeners.get(event.type)?.forEach((l) => {
        if (typeof l === 'function') l(event);
        else l.handleEvent(event);
      });
      return true;
    }),

    matchMedia: vi.fn((query: string) => {
      const isCoarse = query.includes('pointer: coarse');
      const matches = isMobile ? isCoarse : false;

      return {
        matches,
        media: query,
        addEventListener: vi.fn((_type: string, handler: (e: MediaQueryListEvent) => void) => {
          if (!mediaQueryListeners.has(query)) mediaQueryListeners.set(query, new Set());
          mediaQueryListeners.get(query)!.add(handler);
        }),
        removeEventListener: vi.fn((_type: string, handler: (e: MediaQueryListEvent) => void) => {
          mediaQueryListeners.get(query)?.delete(handler);
        }),
      };
    }),
  };

  return {
    mockCanvas,
    gl2,
    gl1,
    fakeWindow,
    windowListeners,
    canvasListeners,
  };
}

describe('KineticCanvas & Shaders GLSL (Phases 3 & 4)', () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  beforeEach(() => {
    frameManager.resetForTesting();
    kineticEnergy.resetForTesting();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    frameManager.resetForTesting();
    kineticEnergy.resetForTesting();
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });

  describe('1. Shaders GLSL minimaux (quad.vert.ts & kinetic-fluid.frag.ts)', () => {
    it('should generate a fullscreen quad vertex shader without MVP matrix', () => {
      const vert2 = getQuadVertexShader(true);
      const vert1 = getQuadVertexShader(false);

      expect(vert2).toContain('#version 300 es');
      expect(vert2).toContain('in vec2 a_position;');
      expect(vert2).toContain('out vec2 v_uv;');
      expect(vert2).toContain('gl_Position = vec4(a_position, 0.0, 1.0);');
      // No MVP matrix calculation
      expect(vert2).not.toContain('u_mvp');
      expect(vert2).not.toContain('u_matrix');
      expect(vert2).not.toContain('mat4');

      expect(vert1).toContain('attribute vec2 a_position;');
      expect(vert1).toContain('varying vec2 v_uv;');
      expect(vert1).toContain('gl_Position = vec4(a_position, 0.0, 1.0);');
      expect(vert1).not.toContain('u_mvp');
      expect(vert2).toBe(quadVertexShaderWebGL2);
      expect(vert1).toBe(quadVertexShaderWebGL1);
    });

    it('should export all 4 required uniforms in kinetic fluid fragment shader', () => {
      const frag2 = getKineticFluidFragmentShader(true);
      const frag1 = getKineticFluidFragmentShader(false);

      expect(frag2).toBe(kineticFluidFragmentShaderWebGL2);
      expect(frag1).toBe(kineticFluidFragmentShaderWebGL1);

      for (const shader of [frag2, frag1]) {
        expect(shader).toContain('uniform float u_time;');
        expect(shader).toContain('uniform float u_energy;');
        expect(shader).toContain('uniform vec2 u_mouse;');
        expect(shader).toContain('uniform vec2 u_resolution;');
      }

      expect(frag2).toContain('#version 300 es');
      expect(frag2).toContain('out vec4 fragColor;');
      expect(frag1).toContain('varying vec2 v_uv;');
      expect(frag1).toContain('gl_FragColor');
    });

    it('should conditionally handle highp float precision in WebGL 1.0 fragment shader', () => {
      const frag1 = getKineticFluidFragmentShader(false);
      expect(frag1).toContain('#ifdef GL_FRAGMENT_PRECISION_HIGH');
      expect(frag1).toContain('precision highp float;');
      expect(frag1).toContain('#else');
      expect(frag1).toContain('precision mediump float;');
      expect(frag1).toContain('#endif');
    });

    it('should modulate turbulence, deformation speed and luminescence with u_energy', () => {
      const shader = kineticFluidFragmentShaderWebGL2;

      // Speed modulation
      expect(shader).toContain('float speed = 0.12 + u_energy * 1.0;');
      // Turbulence modulation
      expect(shader).toContain('float turbulence = 0.25 + u_energy * 0.85;');
      // Luminescence modulation
      expect(shader).toContain('float lum = 0.12 + u_energy * 0.55');
    });
  });

  describe('2. KineticCanvas React Component & SSR safety', () => {
    it('should render a valid canvas with strictly defined Tailwind classes on server (SSR)', () => {
      const html = renderToString(React.createElement(KineticCanvas));
      expect(html).toContain('<canvas');
      expect(html).toContain('fixed inset-0 -z-10 pointer-events-none w-full h-full');
      expect(html).toContain('aria-hidden="true"');
    });

    it('should export KineticCanvas as default component and initKineticWebGL as helper', () => {
      expect(typeof KineticCanvas).toBe('function');
      expect(typeof initKineticWebGL).toBe('function');
    });
  });

  describe('3. Native WebGL Context & Geometry Initialization', () => {
    it('should request WebGL2 with strict high-performance context attributes', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);

      expect(env.mockCanvas.getContext).toHaveBeenCalledWith(
        'webgl2',
        KINETIC_WEBGL_CONTEXT_OPTIONS
      );
      expect(KINETIC_WEBGL_CONTEXT_OPTIONS).toEqual({
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance',
      });

      cleanup();
    });

    it('should fallback cleanly to WebGL1 when WebGL2 is unsupported', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: false, webgl1Supported: true });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);

      expect(env.mockCanvas.getContext).toHaveBeenCalledWith('webgl2', expect.any(Object));
      expect(env.mockCanvas.getContext).toHaveBeenCalledWith('webgl', expect.any(Object));
      expect(env.gl1?.useProgram).toHaveBeenCalled();

      cleanup();
    });

    it('should gracefully handle environments where no WebGL context is available', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: false, webgl1Supported: false });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('should initialize exactly 1 fixed VBO with 2 triangles (6 vertices) and 12 floats', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);

      expect(env.gl2?.createBuffer).toHaveBeenCalledTimes(1);
      expect(env.gl2?.calls.bufferDataCalls.length).toBe(1);

      const bufferCall = env.gl2!.calls.bufferDataCalls[0];
      expect(bufferCall.data).toEqual(QUAD_VERTICES);
      expect(bufferCall.data.length).toBe(12); // 6 vertices * (x, y) = 12 floats

      // Position attribute bound to location
      expect(env.gl2?.enableVertexAttribArray).toHaveBeenCalledWith(0);
      expect(env.gl2?.vertexAttribPointer).toHaveBeenCalledWith(0, 2, env.gl2!.FLOAT, false, 0, 0);

      cleanup();
    });
  });

  describe('4. FrameManager Connection & Uniform Updates', () => {
    it('should subscribe to FrameManager on init and unsubscribe on cleanup', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      expect(frameManager.subscriberCount).toBe(0);
      const cleanup = initKineticWebGL(env.mockCanvas);

      expect(frameManager.subscriberCount).toBe(1);

      cleanup();
      expect(frameManager.subscriberCount).toBe(0);
    });

    it('should update uniforms and execute exactly 1 draw call per FrameManager tick', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);

      // Inject kinetic energy
      kineticEnergy.setEnergy(0.75);
      expect(KineticEnergy.getInstance().getEnergy()).toBeCloseTo(0.75, 2);

      const manager = frameManager as unknown as { tick: (time: number) => void };

      // Frame 1: dt = 0, time = 1000ms
      manager.tick(1000);

      expect(env.gl2?.calls.drawArraysCalls.length).toBe(1);
      expect(env.gl2?.calls.drawArraysCalls[0]).toEqual([env.gl2!.TRIANGLES, 0, 6]);

      // Check uniform1f calls
      const energyCall = env.gl2?.calls.uniform1fCalls.find(([name]) => name === 'u_energy');
      expect(energyCall).toBeDefined();
      expect(energyCall![1]).toBeCloseTo(0.75, 2);

      const timeCall = env.gl2?.calls.uniform1fCalls.find(([name]) => name === 'u_time');
      expect(timeCall).toBeDefined();

      // Check uniform2f calls (mouse & resolution)
      const resolutionCall = env.gl2?.calls.uniform2fCalls.find(([name]) => name === 'u_resolution');
      expect(resolutionCall).toBeDefined();

      const mouseCall = env.gl2?.calls.uniform2fCalls.find(([name]) => name === 'u_mouse');
      expect(mouseCall).toBeDefined();
      expect(mouseCall![1]).toBe(0.5); // default center X
      expect(mouseCall![2]).toBe(0.5); // default center Y

      // Frame 2: 16ms later -> second draw call
      manager.tick(1016);
      expect(env.gl2?.calls.drawArraysCalls.length).toBe(2);

      cleanup();
    });

    it('should delete WebGL resources upon cleanup', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);
      cleanup();

      expect(env.gl2?.calls.deletedBuffers.length).toBe(1);
      expect(env.gl2?.calls.deletedPrograms.length).toBe(1);
      expect(env.gl2?.calls.deletedShaders.length).toBe(2); // Vertex and Fragment shaders
      expect(env.gl2?.calls.deletedVertexArrays.length).toBe(1); // VAO in WebGL2
    });
  });

  describe('5. Accessibility (prefers-reduced-motion)', () => {
    it('should lock energy to 0.0, freeze u_time, and reset accumulation when prefers-reduced-motion is active', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);

      // Force high kinetic energy
      kineticEnergy.setEnergy(1.0);

      // Activate reduced motion
      frameManager.setReducedMotionForTesting(true);

      const manager = frameManager as unknown as { tick: (time: number) => void };
      manager.tick(1000);
      manager.tick(1016);

      const energyCalls = env.gl2?.calls.uniform1fCalls.filter(([name]) => name === 'u_energy');
      const timeCalls = env.gl2?.calls.uniform1fCalls.filter(([name]) => name === 'u_time');

      expect(energyCalls).toBeDefined();
      expect(energyCalls!.length).toBeGreaterThan(0);
      // All energy uniforms must be clamped to 0.0
      for (const call of energyCalls!) {
        expect(call[1]).toBe(0.0);
      }

      // Time must be frozen at 0.0
      for (const call of timeCalls!) {
        expect(call[1]).toBe(0.0);
      }

      frameManager.setReducedMotionForTesting(false);
      cleanup();
    });
  });

  describe('6. Viewport Resizing & Mobile Fill-Rate Protection', () => {
    it('should cap devicePixelRatio strictly at 1.5 on mobile to protect fill-rate', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true, isMobile: true });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);

      // Mobile screen: 390 x 844, devicePixelRatio = 3.0
      // With DPR capped at 1.5: target width = 390 * 1.5 = 585, height = 844 * 1.5 = 1266
      expect(env.mockCanvas.width).toBe(585);
      expect(env.mockCanvas.height).toBe(1266);
      expect(env.gl2?.viewport).toHaveBeenCalledWith(0, 0, 585, 1266);

      cleanup();
    });

    it('should update canvas dimensions and viewport when window resize event fires', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true, isMobile: false });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);

      expect(env.mockCanvas.width).toBe(1920 * 2.0); // 3840
      expect(env.mockCanvas.height).toBe(1080 * 2.0); // 2160

      // Simulate window resize
      env.fakeWindow.innerWidth = 1280;
      env.fakeWindow.innerHeight = 720;
      env.fakeWindow.dispatchEvent(new Event('resize'));

      expect(env.mockCanvas.width).toBe(1280 * 2.0); // 2560
      expect(env.mockCanvas.height).toBe(720 * 2.0); // 1440
      expect(env.gl2?.viewport).toHaveBeenCalledWith(0, 0, 2560, 1440);

      cleanup();
    });
  });

  describe('7. Pointer Interaction', () => {
    it('should track pointer movement and update normalized u_mouse uniform [0.0, 1.0]', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true, isMobile: false });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);

      // Simulate pointer movement to (960, 270) on a 1920x1080 screen
      const pointerEvent = new Event('pointermove') as unknown as PointerEvent;
      Object.defineProperty(pointerEvent, 'clientX', { value: 960 });
      Object.defineProperty(pointerEvent, 'clientY', { value: 270 }); // 270 from top -> in WebGL, 1 - 270/1080 = 0.75
      env.fakeWindow.dispatchEvent(pointerEvent);

      const manager = frameManager as unknown as { tick: (time: number) => void };
      manager.tick(1000);

      const mouseCalls = env.gl2?.calls.uniform2fCalls.filter(([name]) => name === 'u_mouse');
      expect(mouseCalls).toBeDefined();
      expect(mouseCalls!.length).toBeGreaterThan(0);

      const lastMouseCall = mouseCalls![mouseCalls!.length - 1];
      expect(lastMouseCall[1]).toBeCloseTo(0.5, 2); // 960 / 1920 = 0.5
      expect(lastMouseCall[2]).toBeCloseTo(0.75, 2); // 1.0 - (270 / 1080) = 0.75

      cleanup();
    });

    it('should update normalized mouse position immediately upon pointerdown (touch tap)', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true, isMobile: true });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);

      // Simulate tap at (195, 422) on 390x844 mobile viewport
      const pointerDown = new Event('pointerdown') as unknown as PointerEvent;
      Object.defineProperty(pointerDown, 'clientX', { value: 195 });
      Object.defineProperty(pointerDown, 'clientY', { value: 422 });
      env.fakeWindow.dispatchEvent(pointerDown);

      const manager = frameManager as unknown as { tick: (time: number) => void };
      manager.tick(1000);

      const mouseCalls = env.gl2?.calls.uniform2fCalls.filter(([name]) => name === 'u_mouse');
      expect(mouseCalls).toBeDefined();
      const lastCall = mouseCalls![mouseCalls!.length - 1];
      expect(lastCall[1]).toBeCloseTo(0.5, 2); // 195 / 390 = 0.5
      expect(lastCall[2]).toBeCloseTo(0.5, 2); // 1 - (422 / 844) = 0.5

      cleanup();
    });
  });

  describe('8. WebGL Context Loss & Restoration Handling', () => {
    it('should call preventDefault on webglcontextlost event to allow recovery', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);

      const lostEvent = new Event('webglcontextlost', { cancelable: true });
      const preventDefaultSpy = vi.spyOn(lostEvent, 'preventDefault');

      env.mockCanvas.dispatchEvent(lostEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();

      cleanup();
    });

    it('should recreate pipeline upon webglcontextrestored event', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);

      const initialProgramCount = env.gl2?.createProgram.mock.calls.length || 0;
      expect(initialProgramCount).toBe(1);

      // Fire restored event
      const restoredEvent = new Event('webglcontextrestored');
      env.mockCanvas.dispatchEvent(restoredEvent);

      expect(env.gl2?.createProgram).toHaveBeenCalledTimes(2);

      cleanup();
    });
  });

  describe('9. WebGL 2.0 Vertex Array Object (VAO) Management', () => {
    it('should create and bind VAO in WebGL 2.0 mode', () => {
      const env = setupMockDOMEnvironment({ webgl2Supported: true });
      // @ts-expect-error Mocking window in unit test
      globalThis.window = env.fakeWindow;

      const cleanup = initKineticWebGL(env.mockCanvas);

      expect(env.gl2?.createVertexArray).toHaveBeenCalledTimes(1);
      expect(env.gl2?.calls.boundVertexArrays.length).toBeGreaterThanOrEqual(1);

      cleanup();
    });
  });
});
