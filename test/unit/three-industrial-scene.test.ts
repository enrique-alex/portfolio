import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import {
  ThreeIndustrialScene,
  initThreeIndustrialScene,
  TOPOLOGY_NAMES,
} from '@/lib/graphics/ThreeIndustrialScene';
import { frameManager } from '@/lib/graphics/FrameManager';
import { kineticEnergy } from '@/lib/graphics/KineticEnergy';

describe('ThreeIndustrialScene & 4 Parametric Topologies (Étape 4)', () => {
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

  it('should expose the 4 emblematic industrial topologies', () => {
    expect(TOPOLOGY_NAMES).toHaveLength(4);
    expect(TOPOLOGY_NAMES).toEqual([
      'SMART_GRID_NODAL_MESH',
      'MULTILAYER_PCB_BUS_ROUTING',
      'ELECTROMAGNETIC_ROTOR_STATOR',
      'SEQUENTIAL_PETRI_AUTOMATON',
    ]);
  });

  it('should configure KineticEnergy with decay = 0.93 upon initialization', () => {
    // Mock canvas
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    // Verify decay rate before
    kineticEnergy.setDecayRate(2.5);

    new ThreeIndustrialScene(fakeCanvas, { pointCount: 100, decayRate: 0.93 });
    expect(kineticEnergy.getDecayRate()).toBe(0.93);
  });

  it('should properly generate Float32Array coordinates for all 4 topologies without NaN', () => {
    const pointCount = 120;
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount });

    // Validate active initial topology
    expect(scene.activeTopologyName).toBe('SMART_GRID_NODAL_MESH');

    // Switch between all 4 topologies sequentially
    for (let i = 0; i < 4; i++) {
      scene.setTopology(i);
      expect(scene.activeTopologyName).toBe(TOPOLOGY_NAMES[i]);
    }

    scene.destroy();
  });

  it('should support nextTopology cycling through the 4 architectures', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 60 });

    expect(scene.activeTopologyName).toBe('SMART_GRID_NODAL_MESH');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('MULTILAYER_PCB_BUS_ROUTING');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('ELECTROMAGNETIC_ROTOR_STATOR');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('SEQUENTIAL_PETRI_AUTOMATON');
    scene.nextTopology();
    expect(scene.activeTopologyName).toBe('SMART_GRID_NODAL_MESH');

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

    // After displacement frame, coordinate was displaced
    // Now decay energy completely to 0
    kineticEnergy.setEnergy(0);
    scene.renderFrameForTesting(0.016, 600, false);

    // Final frame with energy = 0 cleanly restores baseline without freeze
    expect(buf[2]).toBeCloseTo(initialZ, 4);

    scene.destroy();
  });
});
