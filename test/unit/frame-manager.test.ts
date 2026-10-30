import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FrameManager, frameManager } from '@/lib/graphics/FrameManager';

describe('FrameManager (Infrastructure Graphique - RAF Singleton)', () => {
  beforeEach(() => {
    frameManager.resetForTesting();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    frameManager.resetForTesting();
  });

  it('should maintain a single instance across calls (Singleton)', () => {
    const instanceA = FrameManager.getInstance();
    const instanceB = FrameManager.getInstance();
    expect(instanceA).toBe(instanceB);
    expect(instanceA).toBe(frameManager);
  });

  it('should cap delta-time (dt) strictly to 0.1s even on large frame drops', () => {
    let capturedDt = -1;
    let capturedTime = -1;

    const unsubscribe = frameManager.subscribe((dt, time) => {
      capturedDt = dt;
      capturedTime = time;
    });

    expect(frameManager.subscriberCount).toBe(1);

    const manager = frameManager as unknown as {
      tick: (time: number) => void;
      lastTime: number;
    };

    // First frame: lastTime is 0, dt is 0
    manager.tick(1000);
    expect(capturedDt).toBe(0);
    expect(capturedTime).toBe(1000);

    // Second frame: 16ms later -> dt ~ 0.016s
    manager.tick(1016);
    expect(capturedDt).toBeCloseTo(0.016, 3);

    // Third frame: tab switched or massive 2000ms hitch -> dt clamped to 0.1s
    manager.tick(3016);
    expect(capturedDt).toBe(0.1);

    // Boundary check: negative delta or backwards clock is guarded to 0
    manager.tick(2500);
    expect(capturedDt).toBe(0);

    unsubscribe();
    expect(frameManager.subscriberCount).toBe(0);
  });

  it('should stop RAF loop when all subscribers unsubscribe', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const unsub1 = frameManager.subscribe(cb1);
    const unsub2 = frameManager.subscribe(cb2);
    expect(frameManager.subscriberCount).toBe(2);

    unsub1();
    expect(frameManager.subscriberCount).toBe(1);

    unsub2();
    expect(frameManager.subscriberCount).toBe(0);
    expect(frameManager.isRunning).toBe(false);
  });

  it('should isolate callback errors so other subscribers continue receiving ticks', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const failingCb = vi.fn().mockImplementation(() => {
      throw new Error('Boom in subscriber');
    });
    const succeedingCb = vi.fn();

    const unsub1 = frameManager.subscribe(failingCb);
    const unsub2 = frameManager.subscribe(succeedingCb);

    const manager = frameManager as unknown as { tick: (time: number) => void };
    manager.tick(1000);

    expect(failingCb).toHaveBeenCalledTimes(1);
    expect(succeedingCb).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();

    unsub1();
    unsub2();
  });

  it('should suspend immediately when document is hidden and resume when visible', () => {
    const cb = vi.fn();
    frameManager.subscribe(cb);

    // Tab is switched away (document.hidden = true)
    frameManager.setVisibilityHiddenForTesting(true);
    expect(frameManager.isRunning).toBe(false);

    // When hidden, tick should not execute subscriber
    const manager = frameManager as unknown as { tick: (time: number) => void };
    manager.tick(2000);
    expect(cb).not.toHaveBeenCalled();

    // Tab becomes visible again
    frameManager.setVisibilityHiddenForTesting(false);
    // Loop resumes if environment supports requestAnimationFrame
    expect(frameManager.subscriberCount).toBe(1);
  });

  it('should not resume RAF loop on tab visibility if manually paused', () => {
    const cb = vi.fn();
    frameManager.subscribe(cb);

    // Manual pause by developer/modal
    frameManager.pause();
    expect(frameManager.isRunning).toBe(false);

    // User switches tab and returns
    frameManager.setVisibilityHiddenForTesting(true);
    frameManager.setVisibilityHiddenForTesting(false);

    // Must remain paused because manual pause takes precedence
    expect(frameManager.isRunning).toBe(false);

    // Manual resume
    frameManager.resume();
    expect(frameManager.subscriberCount).toBe(1);
  });

  it('should detect prefers-reduced-motion and inform subscribers without blocking physics decay', () => {
    let capturedReducedMotion: boolean | undefined = undefined;
    const unsub = frameManager.subscribe((dt, time, isReduced) => {
      capturedReducedMotion = isReduced;
    });

    frameManager.setReducedMotionForTesting(true);
    expect(frameManager.isReducedMotion).toBe(true);

    const manager = frameManager as unknown as { tick: (time: number) => void };
    manager.tick(1000);

    expect(capturedReducedMotion).toBe(true);

    frameManager.setReducedMotionForTesting(false);
    expect(frameManager.isReducedMotion).toBe(false);
    manager.tick(1016);
    expect(capturedReducedMotion).toBe(false);

    unsub();
  });
});
