import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { magneticManager, MagneticManager } from '@/lib/graphics/MagneticManager';
import { frameManager } from '@/lib/graphics/FrameManager';

describe('MagneticManager - Contrôleur Magnétique Globalisé (Étape 3)', () => {
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    originalWindow = globalThis.window;
    frameManager.resetForTesting();
    magneticManager.resetForTesting();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    frameManager.resetForTesting();
    magneticManager.resetForTesting();
    globalThis.window = originalWindow;
  });

  it('should be a singleton instance', () => {
    const instance1 = MagneticManager.getInstance();
    const instance2 = MagneticManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should register and unregister elements without throwing', () => {
    const fakeElement = {
      getBoundingClientRect: vi.fn(() => ({
        left: 100,
        top: 200,
        width: 150,
        height: 50,
        right: 250,
        bottom: 250,
      })),
      style: {
        transform: '',
      },
    } as unknown as HTMLElement;

    magneticManager.register(fakeElement, 0.3);
    expect(magneticManager.getActiveCount()).toBe(1);

    // Initial bounding box calculation on mount (NOT on mousemove)
    expect(fakeElement.getBoundingClientRect).toHaveBeenCalledTimes(1);

    magneticManager.unregister(fakeElement);
    expect(magneticManager.getActiveCount()).toBe(0);
    expect(fakeElement.style.transform).toBe('');
  });

  it('should update element transform via translate3d on frame tick when cursor is nearby', () => {
    const fakeElement = {
      getBoundingClientRect: vi.fn(() => ({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        right: 200,
        bottom: 200,
      })),
      style: {
        transform: '',
      },
    } as unknown as HTMLElement;

    magneticManager.register(fakeElement, 0.3);

    // Position cursor near center (150, 150)
    magneticManager.setCursor(160, 160);

    // Advance frame
    frameManager.setReducedMotionForTesting(false);
    // getBoundingClientRect should NOT have been called again on mouse move
    expect(fakeElement.getBoundingClientRect).toHaveBeenCalledTimes(1);

    // Simulate update
    magneticManager.updateForTesting(0.016, false);

    // Transform should be applied with translate3d
    expect(fakeElement.style.transform).toContain('translate3d');

    magneticManager.unregister(fakeElement);
  });

  it('should reset transform when reduced motion is preferred', () => {
    const fakeElement = {
      getBoundingClientRect: vi.fn(() => ({
        left: 50,
        top: 50,
        width: 100,
        height: 100,
        right: 150,
        bottom: 150,
      })),
      style: {
        transform: 'translate3d(10px, 10px, 0)',
      },
    } as unknown as HTMLElement;

    magneticManager.register(fakeElement, 0.3);
    magneticManager.updateForTesting(0.016, true);

    expect(fakeElement.style.transform).toBe('');
    magneticManager.unregister(fakeElement);
  });

  it('should not drift when refreshAllBounds is called while element is displaced', () => {
    let currentLeft = 100;
    let currentTop = 100;
    const fakeElement = {
      getBoundingClientRect: vi.fn(() => ({
        left: currentLeft,
        top: currentTop,
        width: 100,
        height: 100,
        right: currentLeft + 100,
        bottom: currentTop + 100,
      })),
      style: {
        transform: '',
      },
    } as unknown as HTMLElement;

    magneticManager.register(fakeElement, 0.3);

    // Simulate attracting the element
    magneticManager.setCursor(160, 160);
    magneticManager.updateForTesting(0.016, false);

    // Element is translated, so getBoundingClientRect now reflects +10px displacement
    currentLeft = 110;
    currentTop = 110;

    // Trigger refreshAllBounds (e.g. on window resize)
    magneticManager.refreshAllBounds();

    // Now move cursor far away so element returns to (0,0)
    magneticManager.setCursor(-9999, -9999);
    for (let i = 0; i < 30; i++) {
      magneticManager.updateForTesting(0.016, false);
    }

    // Element should be back at rest
    expect(fakeElement.style.transform).toBe('');
    magneticManager.unregister(fakeElement);
  });

  it('should suspend frame subscription when all elements return to rest (0,0)', () => {
    const fakeElement = {
      getBoundingClientRect: vi.fn(() => ({
        left: 50,
        top: 50,
        width: 100,
        height: 100,
        right: 150,
        bottom: 150,
      })),
      style: {
        transform: '',
      },
    } as unknown as HTMLElement;

    magneticManager.register(fakeElement, 0.3);
    magneticManager.setCursor(100, 100);

    // Run frame ticks to attract
    magneticManager.updateForTesting(0.016, false);

    // Move cursor away
    magneticManager.setCursor(-9999, -9999);
    for (let i = 0; i < 40; i++) {
      magneticManager.updateForTesting(0.016, false);
    }

    // Once settled at (0,0), isSubscribed must be false
    expect(magneticManager.isSubscribed).toBe(false);

    magneticManager.unregister(fakeElement);
  });
});
