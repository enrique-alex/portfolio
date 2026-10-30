import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KineticEnergy, kineticEnergy } from '@/lib/graphics/KineticEnergy';
import { frameManager } from '@/lib/graphics/FrameManager';

describe('KineticEnergy (Accumulateur cinétique & Amortissement continu)', () => {
  beforeEach(() => {
    frameManager.resetForTesting();
    kineticEnergy.resetForTesting();
  });

  afterEach(() => {
    frameManager.resetForTesting();
    kineticEnergy.resetForTesting();
  });

  it('should maintain a single instance across calls (Singleton)', () => {
    const inst1 = KineticEnergy.getInstance();
    const inst2 = KineticEnergy.getInstance();
    expect(inst1).toBe(inst2);
    expect(inst1).toBe(kineticEnergy);
  });

  it('should accumulate energy strictly bounded between 0.0 and 1.0', () => {
    expect(kineticEnergy.getEnergy()).toBe(0);

    // Adding reasonable amounts
    kineticEnergy.addEnergy(0.35);
    expect(kineticEnergy.getEnergy()).toBeCloseTo(0.35, 4);

    kineticEnergy.addEnergy(0.5);
    expect(kineticEnergy.getEnergy()).toBeCloseTo(0.85, 4);

    // Overshoot: adding 0.5 more when at 0.85 must clamp strictly to 1.0
    kineticEnergy.addEnergy(0.5);
    expect(kineticEnergy.getEnergy()).toBe(1.0);

    // Negative amounts or NaN must not corrupt energy
    kineticEnergy.addEnergy(-0.2);
    expect(kineticEnergy.getEnergy()).toBe(1.0);

    kineticEnergy.addEnergy(NaN);
    expect(kineticEnergy.getEnergy()).toBe(1.0);
  });

  it('should dynamically subscribe to FrameManager when energy > 0 and sleep when energy decays to 0', () => {
    // Initially at 0 energy -> not subscribed
    expect(kineticEnergy.getEnergy()).toBe(0);
    expect(kineticEnergy.isSubscribed).toBe(false);
    expect(frameManager.subscriberCount).toBe(0);

    // Adding energy triggers subscription
    kineticEnergy.addEnergy(0.5);
    expect(kineticEnergy.isSubscribed).toBe(true);
    expect(frameManager.subscriberCount).toBe(1);

    // Decay until threshold reached -> automatically detaches to spare CPU
    kineticEnergy.update(10); // 10s decay -> drops below threshold
    expect(kineticEnergy.getEnergy()).toBe(0);
    expect(kineticEnergy.isSubscribed).toBe(false);
    expect(frameManager.subscriberCount).toBe(0);
  });

  it('should follow continuous exponential decay formula: E(t+dt) = E(t) * exp(-decay * dt)', () => {
    kineticEnergy.setDecayRate(2.0); // 2.0 s^-1
    kineticEnergy.setEnergy(1.0);

    // dt = 0.5s -> expected = 1.0 * exp(-2.0 * 0.5) = exp(-1.0) ~= 0.367879
    const afterFirstDecay = kineticEnergy.update(0.5);
    expect(afterFirstDecay).toBeCloseTo(Math.exp(-1.0), 4);
    expect(kineticEnergy.getEnergy()).toBeCloseTo(Math.exp(-1.0), 4);

    // dt = 0.5s again -> expected = exp(-1) * exp(-1) = exp(-2) ~= 0.135335
    const afterSecondDecay = kineticEnergy.update(0.5);
    expect(afterSecondDecay).toBeCloseTo(Math.exp(-2.0), 4);
  });

  it('should yield identical decay whether updated in one chunk or multiple sub-steps (framerate independence)', () => {
    kineticEnergy.setDecayRate(2.5);

    // Approach 1: Single step of 0.1s
    kineticEnergy.setEnergy(0.8);
    kineticEnergy.update(0.1);
    const singleStepResult = kineticEnergy.getEnergy();

    // Approach 2: Ten micro-steps of 0.01s (e.g. 100fps simulation)
    kineticEnergy.setEnergy(0.8);
    for (let i = 0; i < 10; i++) {
      kineticEnergy.update(0.01);
    }
    const microStepsResult = kineticEnergy.getEnergy();

    expect(microStepsResult).toBeCloseTo(singleStepResult, 5);
  });

  it('should clamp energy to exactly 0 when it drops below the perceptual threshold', () => {
    kineticEnergy.setEnergy(0.00005);
    kineticEnergy.update(0.016);
    expect(kineticEnergy.getEnergy()).toBe(0);
  });

  it('should accumulate energy on mousemove proportionally to Euclidean distance', () => {
    // Initial movement sets anchor without adding energy
    kineticEnergy.handleMouseMove(100, 100);
    expect(kineticEnergy.getEnergy()).toBe(0);

    // Move diagonally by (300, 400) -> distance = 500px -> energy added = 500 * 0.002 = 1.0
    kineticEnergy.handleMouseMove(400, 500);
    expect(kineticEnergy.getEnergy()).toBe(1.0);
  });

  it('should accumulate energy on scroll proportionally to delta', () => {
    // Initial scroll sets anchor
    kineticEnergy.handleScroll(0);
    expect(kineticEnergy.getEnergy()).toBe(0);

    // Scroll by 200px -> delta = 200 -> energy added = 200 * 0.002 = 0.4
    kineticEnergy.handleScroll(200);
    expect(kineticEnergy.getEnergy()).toBeCloseTo(0.4, 4);
  });

  it('should decay automatically when FrameManager ticks', () => {
    kineticEnergy.setEnergy(1.0);
    expect(kineticEnergy.getEnergy()).toBe(1.0);

    // FrameManager tick with dt = 0.1s
    const manager = frameManager as unknown as { tick: (time: number) => void };
    manager.tick(1000);
    manager.tick(1100); // 100ms later (dt = 0.1s)

    // With default decay rate = 2.5 and dt = 0.1: exp(-0.25) ~= 0.7788
    expect(kineticEnergy.getEnergy()).toBeLessThan(1.0);
    expect(kineticEnergy.getEnergy()).toBeCloseTo(Math.exp(-0.25), 2);
  });

  it('should keep energy at 0 and detach when prefers-reduced-motion is active', () => {
    frameManager.setReducedMotionForTesting(true);

    kineticEnergy.addEnergy(0.8);
    expect(kineticEnergy.getEnergy()).toBe(0);
    expect(kineticEnergy.isSubscribed).toBe(false);

    kineticEnergy.handleMouseMove(500, 500);
    expect(kineticEnergy.getEnergy()).toBe(0);

    frameManager.setReducedMotionForTesting(false);
  });
});
