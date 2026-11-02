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

  it('should only activate magnetic attraction when cursor is strictly within capture radius (d < 40px)', () => {
    // Element centered at (150, 150)
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

    // 1. Cursor at (175, 150): dx = 25, dy = 0 -> d = 25px (< 40px) -> MUST activate
    magneticManager.setCursor(175, 150);
    magneticManager.updateForTesting(0.016, false);
    expect(fakeElement.style.transform).toContain('translate3d');

    // Reset element
    magneticManager.resetForTesting();
    fakeElement.style.transform = '';

    magneticManager.register(fakeElement, 0.3);

    // 2. Cursor at (195, 150): dx = 45, dy = 0 -> d = 45px (>= 40px) -> MUST NOT activate
    magneticManager.setCursor(195, 150);
    magneticManager.updateForTesting(0.016, false);
    expect(fakeElement.style.transform).toBe('');

    // 3. Cursor at (250, 250): dx = 100, dy = 100 -> d ≈ 141px (>= 40px) -> MUST NOT activate
    magneticManager.setCursor(250, 250);
    magneticManager.updateForTesting(0.016, false);
    expect(fakeElement.style.transform).toBe('');

    magneticManager.unregister(fakeElement);
  });

  it('should cap magnetic displacement to a maximum of 6px', () => {
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

    // High intensity to attempt large displacement
    magneticManager.register(fakeElement, 1.0);
    magneticManager.setCursor(170, 150); // dx = 20px

    // Run multiple frames to approach target
    for (let i = 0; i < 50; i++) {
      magneticManager.updateForTesting(0.016, false);
    }

    // Extract translate3d values
    const match = fakeElement.style.transform.match(/translate3d\(([-0-9.]+)px,\s*([-0-9.]+)px,\s*0\)/);
    expect(match).not.toBeNull();
    if (match) {
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      const displacement = Math.hypot(x, y);
      expect(displacement).toBeLessThanOrEqual(6.01);
    }

    magneticManager.unregister(fakeElement);
  });

  it('should mute all magnetic effects immediately during scrolling', () => {
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

    magneticManager.register(fakeElement, 0.5);
    magneticManager.setCursor(170, 150); // within 40px radius

    // Run frame: should activate
    magneticManager.updateForTesting(0.016, false);
    expect(fakeElement.style.transform).toContain('translate3d');

    // Trigger scroll
    magneticManager.handleScroll();
    expect(magneticManager.getIsScrolling()).toBe(true);
    expect(fakeElement.style.transform).toBe('');
    expect(magneticManager.isSubscribed).toBe(false);

    // During scrolling, update should keep transform empty and unsubscribed
    magneticManager.updateForTesting(0.016, false);
    expect(fakeElement.style.transform).toBe('');
    expect(magneticManager.isSubscribed).toBe(false);

    magneticManager.unregister(fakeElement);
  });

  it('should disable magnetic displacement on touch screens (pointer: coarse)', () => {
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
        transform: 'translate3d(5px, 5px, 0)',
      },
    } as unknown as HTMLElement;

    // Mock window and matchMedia for pointer: coarse
    globalThis.window = {
      matchMedia: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(pointer: coarse)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
      scrollX: 0,
      scrollY: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Window & typeof globalThis;

    magneticManager.register(fakeElement, 0.5);
    magneticManager.setCursor(150, 150);
    magneticManager.updateForTesting(0.016, false);

    expect(fakeElement.style.transform).toBe('');

    magneticManager.unregister(fakeElement);
  });
});

