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

  it('should initialize with mobile point count (4500) when width < 768 and desktop point count (9000)', () => {
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
      expect(mobileScene.currentPositionsBuffer.length).toBe(4500 * 3);
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

  it('should synchronize the sorting of all 5 topologies using the cylindrical key (y * 10 + atan2(z, x))', () => {
    const pointCount = 300;
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene1 = new ThreeIndustrialScene(fakeCanvas, { pointCount });
    const scene2 = new ThreeIndustrialScene(fakeCanvas, { pointCount });

    for (let t = 0; t < 5; t++) {
      const buf1 = scene1.getTopologyBuffer(t);
      const buf2 = scene2.getTopologyBuffer(t);

      // Deterministic generation with mulberry32(42)
      expect(buf1).toEqual(buf2);

      for (let i = 0; i < pointCount - 1; i++) {
        const x0 = buf1[i * 3];
        const y0 = buf1[i * 3 + 1];
        const z0 = buf1[i * 3 + 2];
        const key0 = y0 * 10.0 + Math.atan2(z0, x0);

        const x1 = buf1[(i + 1) * 3];
        const y1 = buf1[(i + 1) * 3 + 1];
        const z1 = buf1[(i + 1) * 3 + 2];
        const key1 = y1 * 10.0 + Math.atan2(z1, x1);

        expect(key0).toBeLessThanOrEqual(key1 + 1e-5);
      }
    }

    scene1.destroy();
    scene2.destroy();
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

  it('should initialize with safe off-screen mousePos (-9999, -9999, active: false) and zero initial offsets', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 50 });
    const pos = scene.getMousePosForTesting();

    expect(pos.x).toBe(-9999.0);
    expect(pos.y).toBe(-9999.0);
    expect(pos.active).toBe(false);

    // Initial render before any pointer movement
    scene.renderFrameForTesting(0.016, 0, false);
    const { offsetX, offsetY, offsetZ } = scene.getOffsetsForTesting();

    // All offsets must be strictly 0.0
    for (let i = 0; i < 50; i++) {
      expect(offsetX[i]).toBe(0.0);
      expect(offsetY[i]).toBe(0.0);
      expect(offsetZ[i]).toBe(0.0);
    }

    scene.destroy();
  });

  it('should guarantee zero repulsion force when pointer is inactive or outside r_max ≈ 0.55', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 50 });

    // 1. Pointer active but far outside r_max (e.g. at screen corner normX = 1.0, normY = 1.0)
    // which in world coords is around ~2.4 units away from origin
    scene.setPointerForTesting(1.0, 1.0, true);
    scene.renderFrameForTesting(0.016, 100, false);
    const { offsetX, offsetY, offsetZ } = scene.getOffsetsForTesting();

    // Verify all offsets remain strictly 0.0 because d >= r_max (0.55)
    for (let i = 0; i < 50; i++) {
      expect(offsetX[i]).toBe(0.0);
      expect(offsetY[i]).toBe(0.0);
      expect(offsetZ[i]).toBe(0.0);
    }

    // 2. Pointer inactive: even at (0, 0), force must be strictly 0.0
    scene.setPointerForTesting(0.0, 0.0, false);
    scene.renderFrameForTesting(0.016, 116, false);
    for (let i = 0; i < 50; i++) {
      expect(offsetX[i]).toBe(0.0);
      expect(offsetY[i]).toBe(0.0);
      expect(offsetZ[i]).toBe(0.0);
    }

    scene.destroy();
  });

  it('should apply repulsion strictly within r_max = 0.55 and decay smoothly back to zero without jitter', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 100 });

    // Place pointer at center (0, 0) active
    scene.setPointerForTesting(0.0, 0.0, true);
    scene.renderFrameForTesting(0.016, 50, false);
    const { offsetX, offsetY, offsetZ } = scene.getOffsetsForTesting();

    let localDisplacedCount = 0;
    let outsideUndisturbedCount = 0;

    for (let i = 0; i < 100; i++) {
      const mag = Math.hypot(offsetX[i], offsetY[i], offsetZ[i]);
      if (mag > 0.0) {
        localDisplacedCount++;
      } else {
        outsideUndisturbedCount++;
      }
    }

    // Must have displaced only local points within r_max while leaving points outside r_max at 0.0
    expect(localDisplacedCount).toBeGreaterThan(0);
    expect(outsideUndisturbedCount).toBeGreaterThan(0);

    // Deactivate pointer (simulate mouseleave / blur)
    scene.setPointerForTesting(-9999.0, -9999.0, false);

    // After enough damping frames (* 0.88), all offsets must snap strictly to 0.0
    for (let f = 0; f < 60; f++) {
      scene.renderFrameForTesting(0.016, 50 + f * 16, false);
    }

    const decayed = scene.getOffsetsForTesting();
    for (let i = 0; i < 100; i++) {
      expect(decayed.offsetX[i]).toBe(0.0);
      expect(decayed.offsetY[i]).toBe(0.0);
      expect(decayed.offsetZ[i]).toBe(0.0);
    }

    scene.destroy();
  });
});

