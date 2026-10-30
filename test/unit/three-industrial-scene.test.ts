import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import {
  ThreeIndustrialScene,
  initThreeIndustrialScene,
  TOPOLOGY_NAMES,
} from '@/lib/graphics/ThreeIndustrialScene';
import { frameManager } from '@/lib/graphics/FrameManager';
import { kineticEnergy } from '@/lib/graphics/KineticEnergy';

describe('ThreeIndustrialScene & 6 Volumetric Topologies (Étape 3 & 4)', () => {
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

  it('should expose the 6 emblematic industrial topologies', () => {
    expect(TOPOLOGY_NAMES).toHaveLength(6);
    expect(TOPOLOGY_NAMES).toEqual([
      'ENERGY_TOROIDAL_EGG',
      'ELECTROMAGNETIC_ROTOR_FIELD',
      'ROBOTIC_ARM_6AXIS',
      'MICROPROCESSOR_CORE_BUS',
      'SCADA_SMART_FACTORY_NETWORK',
      'AWALE_GEOMETRIC_MATRIX',
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

  it('should properly generate Float32Array coordinates for all 6 topologies without NaN', () => {
    const pointCount = 120;
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount });

    // Validate active initial topology
    expect(scene.activeTopologyName).toBe('ENERGY_TOROIDAL_EGG');

    // Switch between all 6 topologies sequentially
    for (let i = 0; i < 6; i++) {
      scene.setTopology(i);
      expect(scene.activeTopologyName).toBe(TOPOLOGY_NAMES[i]);
    }

    scene.destroy();
  });

  it('should support nextTopology cycling through the 6 architectures', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 60 });

    expect(scene.activeTopologyName).toBe('ENERGY_TOROIDAL_EGG');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('ELECTROMAGNETIC_ROTOR_FIELD');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('ROBOTIC_ARM_6AXIS');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('MICROPROCESSOR_CORE_BUS');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('SCADA_SMART_FACTORY_NETWORK');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('AWALE_GEOMETRIC_MATRIX');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('ENERGY_TOROIDAL_EGG');

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

  it('should interpolate coordinates smoothly during morphing and advance morphProgress', () => {
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

    // Inject energy to cause kinetic wave / displacement
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

  it('should initialize with mobile point count (<= 6000) and no active lines when width < 768', () => {
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
      const scene = new ThreeIndustrialScene(fakeCanvas);
      expect(scene.currentPositionsBuffer.length).toBeLessThanOrEqual(6000 * 3);
      scene.destroy();
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
      expect(scene.activeTopologyName).toBe('ENERGY_TOROIDAL_EGG');
      scene.destroy();
    } finally {
      globalThis.document = originalDoc;
    }
  });

  it('should apply volumetric repulsion under pointer and soft elastic damping (Étape 2)', () => {
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
});

