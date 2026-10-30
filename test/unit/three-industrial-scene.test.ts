import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import {
  ThreeIndustrialScene,
  initThreeIndustrialScene,
  TOPOLOGY_NAMES,
} from '@/lib/graphics/ThreeIndustrialScene';
import { frameManager } from '@/lib/graphics/FrameManager';
import { kineticEnergy } from '@/lib/graphics/KineticEnergy';

describe('ThreeIndustrialScene & 5 Pure Mathematical Topologies', () => {
  let originalWindow: typeof globalThis.window;
  let originalDocument: typeof globalThis.document;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;
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

  it('should expose the 5 pure mathematical art topologies', () => {
    expect(TOPOLOGY_NAMES).toHaveLength(5);
    expect(TOPOLOGY_NAMES).toEqual([
      'GOLDEN_TOROIDAL_OVOID',
      'MOBIUS_VOLUMETRIC_STRIP',
      'INTERTWINED_TORUS_KNOT',
      'MINIMAL_GYROID_SHEET',
      'FERMAT_VORTEX_NEBULA',
    ]);
  });

  it('should configure KineticEnergy with decay = 0.93 upon initialization', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    kineticEnergy.setDecayRate(2.5);

    new ThreeIndustrialScene(fakeCanvas, { pointCount: 100, decayRate: 0.93 });
    expect(kineticEnergy.getDecayRate()).toBe(0.93);
  });

  it('should properly generate Float32Array coordinates for all 5 topologies without NaN and normalized inside R ≈ 2.0', () => {
    const pointCount = 120;
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount });

    // Verify camera is positioned at z = 4.8
    expect(scene.cameraInstance.position.z).toBeCloseTo(4.8, 2);
    expect(scene.cameraInstance.fov).toBe(45);

    // Initial topology is Golden Toroidal Ovoid
    expect(scene.activeTopologyName).toBe('GOLDEN_TOROIDAL_OVOID');

    // Switch between all 5 topologies sequentially and verify coordinates
    for (let i = 0; i < 5; i++) {
      scene.setTopology(i);
      expect(scene.activeTopologyName).toBe(TOPOLOGY_NAMES[i]);

      const tBuf = scene.getTopologyBuffer(i);
      expect(tBuf.length).toBe(pointCount * 3);

      let cx = 0;
      let cy = 0;
      let cz = 0;
      let maxR = 0;

      for (let p = 0; p < pointCount; p++) {
        const px = tBuf[p * 3];
        const py = tBuf[p * 3 + 1];
        const pz = tBuf[p * 3 + 2];
        expect(Number.isFinite(px)).toBe(true);
        expect(Number.isFinite(py)).toBe(true);
        expect(Number.isFinite(pz)).toBe(true);

        cx += px;
        cy += py;
        cz += pz;
        const r = Math.hypot(px, py, pz);
        if (r > maxR) maxR = r;
      }

      cx /= pointCount;
      cy /= pointCount;
      cz /= pointCount;

      // Centered at (0, 0, 0)
      expect(Math.abs(cx)).toBeLessThan(0.02);
      expect(Math.abs(cy)).toBeLessThan(0.02);
      expect(Math.abs(cz)).toBeLessThan(0.02);

      // Bounding sphere radius R ≈ 1.95 - 2.0
      expect(maxR).toBeGreaterThanOrEqual(1.90);
      expect(maxR).toBeLessThanOrEqual(2.05);
    }

    const buf = scene.currentPositionsBuffer;
    expect(buf.length).toBe(pointCount * 3);
    for (let j = 0; j < buf.length; j++) {
      expect(Number.isFinite(buf[j])).toBe(true);
      expect(Number.isNaN(buf[j])).toBe(false);
    }

    scene.destroy();
  });

  it('should verify Golden Toroidal Ovoid features a pronounced central oblique toroidal cavity and volumetric thickness', () => {
    const pointCount = 1000;
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount });
    const ovoidBuf = scene.getTopologyBuffer(0); // Topologie 1: GOLDEN_TOROIDAL_OVOID

    // Oblique axis unit vector
    const tiltX = 0.48;
    const tiltY = 0.28;
    const rawAx = Math.sin(tiltY);
    const rawAy = Math.sin(tiltX) * Math.cos(tiltY);
    const rawAz = Math.cos(tiltX) * Math.cos(tiltY);
    const aLen = Math.hypot(rawAx, rawAy, rawAz);
    const ax = rawAx / aLen, ay = rawAy / aLen, az = rawAz / aLen;

    let minDperp = 999;
    let maxDperp = 0;

    for (let i = 0; i < pointCount; i++) {
      const x = ovoidBuf[i * 3];
      const y = ovoidBuf[i * 3 + 1];
      const z = ovoidBuf[i * 3 + 2];

      const h = x * ax + y * ay + z * az;
      const px = x - h * ax;
      const py = y - h * ay;
      const pz = z - h * az;
      const dPerp = Math.hypot(px, py, pz);

      if (dPerp < minDperp) minDperp = dPerp;
      if (dPerp > maxDperp) maxDperp = dPerp;
    }

    // Cavity must be clearly carved (min perpendicular distance to axis > 0.5)
    expect(minDperp).toBeGreaterThanOrEqual(0.50);
    // Outer lip reaches radius ~1.7 - 2.0
    expect(maxDperp).toBeGreaterThanOrEqual(1.70);

    scene.destroy();
  });

  it('should support nextTopology cycling through the 5 mathematical topologies', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 60 });

    expect(scene.activeTopologyName).toBe('GOLDEN_TOROIDAL_OVOID');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('MOBIUS_VOLUMETRIC_STRIP');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('INTERTWINED_TORUS_KNOT');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('MINIMAL_GYROID_SHEET');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('FERMAT_VORTEX_NEBULA');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('GOLDEN_TOROIDAL_OVOID');

    scene.destroy();
  });

  it('should clean up subscriptions and resources on destroy', () => {
    const removeEventListenerSpy = vi.fn();
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerSpy,
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 50 });
    scene.destroy();

    expect(removeEventListenerSpy).toHaveBeenCalled();
  });

  it('should export initThreeIndustrialScene factory returning cleanup callback', () => {
    expect(typeof initThreeIndustrialScene).toBe('function');
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const cleanup = initThreeIndustrialScene(fakeCanvas);
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('should interpolate coordinates smoothly during morphing with micro-dephasing and advance morphProgress', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 40 });
    expect(scene.morphProgressValue).toBe(1.0);

    // Switch topology
    scene.setTopology(1);
    expect(scene.morphProgressValue).toBe(0.0);

    // Run a frame tick (dt = 0.1s)
    scene.renderFrameForTesting(0.1, 100, false);
    expect(scene.morphProgressValue).toBeGreaterThan(0.0);
    expect(scene.morphProgressValue).toBeLessThanOrEqual(1.0);

    scene.destroy();
  });

  it('should restore coordinates to baseline topology without displacement freeze when energy decays to 0', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 30 });
    const buf = scene.currentPositionsBuffer;
    const initialZ = buf[2];

    // Inject energy to cause kinetic wave / micro-harmonic swimming
    kineticEnergy.setEnergy(0.8);
    scene.renderFrameForTesting(0.016, 500, false);

    // Decay energy completely to 0
    kineticEnergy.setEnergy(0);
    // Step a few frames to let elastic dampening (* 0.88) settle
    for (let f = 0; f < 10; f++) {
      scene.renderFrameForTesting(0.016, 600 + f * 16, false);
    }

    // Final frame with energy = 0 cleanly restores baseline without freeze
    expect(buf[2]).toBeCloseTo(initialZ, 2);

    scene.destroy();
  });

  it('should initialize with mobile point count (5000) when width < 768 and desktop point count (9000)', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    // Simulate mobile window
    const originalWindow = globalThis.window;
    // @ts-expect-error Mocking window
    globalThis.window = {
      innerWidth: 390,
      innerHeight: 844,
      devicePixelRatio: 3,
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    try {
      const mobileScene = new ThreeIndustrialScene(fakeCanvas);
      expect(mobileScene.currentPositionsBuffer.length).toBe(5000 * 3);
      mobileScene.destroy();
    } finally {
      globalThis.window = originalWindow;
    }

    // Desktop scenario
    // @ts-expect-error Mocking desktop window
    globalThis.window = {
      innerWidth: 1920,
      innerHeight: 1080,
      devicePixelRatio: 1,
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    try {
      const desktopScene = new ThreeIndustrialScene(fakeCanvas);
      expect(desktopScene.currentPositionsBuffer.length).toBe(9000 * 3);
      desktopScene.destroy();
    } finally {
      globalThis.window = originalWindow;
    }
  });

  it('should support dynamic theme contrast adaptation without crash', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const fakeDocument = {
      documentElement: {
        classList: {
          contains: vi.fn((cls: string) => cls === 'dark'),
        },
      },
      hidden: false,
    };

    const originalDoc = globalThis.document;
    // @ts-expect-error Mocking document
    globalThis.document = fakeDocument;

    try {
      const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 40 });
      expect(scene.activeTopologyName).toBe('GOLDEN_TOROIDAL_OVOID');
      scene.destroy();
    } finally {
      globalThis.document = originalDoc;
    }
  });

  it('should apply volumetric repulsion under pointer and soft elastic damping', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 50 });

    // Position pointer near the center (0, 0)
    scene.setPointerForTesting(0, 0, true);
    scene.renderFrameForTesting(0.016, 100, false);

    const { offsetX, offsetY, offsetZ } = scene.getOffsetsForTesting();

    // Verify some particles were displaced by repulsion force
    let hasRepulsionDisplacement = false;
    for (let i = 0; i < 50; i++) {
      if (Math.abs(offsetX[i]) > 0.001 || Math.abs(offsetY[i]) > 0.001 || offsetZ[i] > 0.001) {
        hasRepulsionDisplacement = true;
        break;
      }
    }
    expect(hasRepulsionDisplacement).toBe(true);

    // Release pointer and run frames to check elastic damping (* 0.88 per frame)
    const initialMaxOffset = Math.max(...Array.from(offsetZ));
    scene.setPointerForTesting(0, 0, false);
    scene.renderFrameForTesting(0.016, 116, false);
    const dampedOffset = Math.max(...Array.from(offsetZ));

    expect(dampedOffset).toBeLessThan(initialMaxOffset);
    expect(dampedOffset).toBeCloseTo(initialMaxOffset * 0.88, 3);

    scene.destroy();
  });

  it('should induce flocking micro-swimming wave under scroll velocity vy', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 40 });
    const buf = scene.currentPositionsBuffer;
    const initialZ = buf[2];

    // Simulate scroll velocity by directly injecting kinetic energy and running frame
    kineticEnergy.setEnergy(0.5);
    scene.renderFrameForTesting(0.016, 1000, false);

    // Particle Z must have dispersion wave component
    expect(buf[2]).not.toBe(initialZ);

    // Reset energy and allow settling
    kineticEnergy.setEnergy(0);
    for (let f = 0; f < 15; f++) {
      scene.renderFrameForTesting(0.016, 1016 + f * 16, false);
    }
    expect(buf[2]).toBeCloseTo(initialZ, 2);

    scene.destroy();
  });
});
