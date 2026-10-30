import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Preloader, { checkHasBooted, executeBootCompletion } from '@/components/ui/Preloader';

describe('Preloader - Industrial Boot Sequence (Étape 1)', () => {
  let originalWindow: typeof globalThis.window;
  let originalSessionStorage: typeof globalThis.sessionStorage;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalSessionStorage = globalThis.sessionStorage;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.sessionStorage = originalSessionStorage;
  });

  it('should render null on server (SSR safe)', () => {
    const html = renderToString(React.createElement(Preloader));
    expect(html).toBe('');
  });

  it('should export Preloader as default component', () => {
    expect(typeof Preloader).toBe('function');
  });

  describe('checkHasBooted', () => {
    it('should return false when window is undefined', () => {
      // @ts-expect-error Mocking window
      delete globalThis.window;
      expect(checkHasBooted()).toBe(false);
    });

    it('should return true when plc_boot_done is true in sessionStorage', () => {
      const fakeSessionStorage = {
        getItem: vi.fn((key: string) => (key === 'plc_boot_done' ? 'true' : null)),
        setItem: vi.fn(),
      };
      // @ts-expect-error Mocking sessionStorage
      globalThis.sessionStorage = fakeSessionStorage;
      // @ts-expect-error Mocking window
      globalThis.window = {};

      expect(checkHasBooted()).toBe(true);
      expect(fakeSessionStorage.getItem).toHaveBeenCalledWith('plc_boot_done');
    });

    it('should return true when seen-preloader is true in sessionStorage', () => {
      const fakeSessionStorage = {
        getItem: vi.fn((key: string) => (key === 'seen-preloader' ? 'true' : null)),
        setItem: vi.fn(),
      };
      // @ts-expect-error Mocking sessionStorage
      globalThis.sessionStorage = fakeSessionStorage;
      // @ts-expect-error Mocking window
      globalThis.window = {};

      expect(checkHasBooted()).toBe(true);
      expect(fakeSessionStorage.getItem).toHaveBeenCalledWith('seen-preloader');
    });

    it('should return false on first arrival (neither flag set)', () => {
      const fakeSessionStorage = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
      };
      // @ts-expect-error Mocking sessionStorage
      globalThis.sessionStorage = fakeSessionStorage;
      // @ts-expect-error Mocking window
      globalThis.window = {};

      expect(checkHasBooted()).toBe(false);
    });

    it('should return false gracefully if sessionStorage throws SecurityError', () => {
      const fakeSessionStorage = {
        getItem: vi.fn(() => {
          throw new Error('SecurityError: Access is denied');
        }),
        setItem: vi.fn(),
      };
      // @ts-expect-error Mocking sessionStorage
      globalThis.sessionStorage = fakeSessionStorage;
      // @ts-expect-error Mocking window
      globalThis.window = {};

      expect(checkHasBooted()).toBe(false);
    });
  });

  describe('executeBootCompletion', () => {
    it('should set sessionStorage plc_boot_done and dispatch completion events', () => {
      const dispatchSpy = vi.fn();
      const fakeSessionStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
      };
      const fakeWindow = {
        dispatchEvent: dispatchSpy,
        __preloaderDone: false,
      };

      // @ts-expect-error Mocking window
      globalThis.window = fakeWindow;
      // @ts-expect-error Mocking sessionStorage
      globalThis.sessionStorage = fakeSessionStorage;

      executeBootCompletion();

      expect(fakeSessionStorage.setItem).toHaveBeenCalledWith('plc_boot_done', 'true');
      expect(fakeSessionStorage.setItem).toHaveBeenCalledWith('seen-preloader', 'true');
      expect(fakeWindow.__preloaderDone).toBe(true);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);

      const dispatchedEventNames = dispatchSpy.mock.calls.map((call: unknown[]) => (call[0] as CustomEvent).type);
      expect(dispatchedEventNames).toContain('plc-boot-complete');
      expect(dispatchedEventNames).toContain('preloader-complete');
    });
  });
});

