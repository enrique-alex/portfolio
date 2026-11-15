import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Preloader, {
  checkHasBooted,
  executeBootCompletion,
  isAutomatedAuditEnvironment,
  PRELOADER_DURATION_MS,
  PRELOADER_EXIT_START_MS,
  PRELOADER_REVEAL_DISPATCH_MS,
  PRELOADER_FAILSAFE_MS,
} from '@/components/ui/Preloader';
import { ISOMETRIC_EN_MONOLITH_PATHS } from '@/components/ui/Logo';

// @ts-expect-error Vite raw query import
import preloaderContent from '@/components/ui/Preloader.tsx?raw';
// @ts-expect-error Vite raw query import
import useDirectScrambleContent from '@/lib/hooks/useDirectScramble.ts?raw';
// @ts-expect-error Vite raw query import
import rootLayoutContent from '@/app/layout.tsx?raw';

describe('Preloader - Isometric EN Monolith Intro Sequence', () => {
  let originalWindow: typeof globalThis.window;
  let originalDocument: typeof globalThis.document;
  let originalNavigator: typeof globalThis.navigator;
  let originalSessionStorage: typeof globalThis.sessionStorage;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;
    originalNavigator = globalThis.navigator;
    originalSessionStorage = globalThis.sessionStorage;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    if (originalNavigator !== undefined) {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        configurable: true,
        writable: true,
      });
    }
    globalThis.sessionStorage = originalSessionStorage;
  });

  it('should render null on server (SSR safe, zero hydration mismatch)', () => {
    const html = renderToString(React.createElement(Preloader));
    expect(html).toBe('');
  });

  it('should export Preloader as default component', () => {
    expect(typeof Preloader).toBe('function');
  });

  it('should enforce calibrated duration budget strictly between 2200ms and 2600ms', () => {
    expect(PRELOADER_DURATION_MS).toBeGreaterThanOrEqual(2200);
    expect(PRELOADER_DURATION_MS).toBeLessThanOrEqual(2600);
    expect(PRELOADER_EXIT_START_MS).toBeLessThan(PRELOADER_REVEAL_DISPATCH_MS);
    expect(PRELOADER_REVEAL_DISPATCH_MS).toBeLessThan(PRELOADER_DURATION_MS);
    expect(PRELOADER_FAILSAFE_MS).toBeGreaterThan(PRELOADER_DURATION_MS);
  });

  describe('checkHasBooted (Runtime Memory Lifecycle)', () => {
    it('should return false when window is undefined (SSR)', () => {
      // @ts-expect-error Mocking window
      delete globalThis.window;
      expect(checkHasBooted()).toBe(false);
    });

    it('should return false on initial arrival or hard reload (window.__preloaderDone unset), ignoring legacy sessionStorage flags', () => {
      const fakeSessionStorage = {
        getItem: vi.fn(() => 'true'),
        setItem: vi.fn(),
      };
      // @ts-expect-error Mocking sessionStorage
      globalThis.sessionStorage = fakeSessionStorage;
      // @ts-expect-error Mocking window
      globalThis.window = {};

      expect(checkHasBooted()).toBe(false);
      expect(fakeSessionStorage.getItem).not.toHaveBeenCalled();
    });

    it('should return false when window.__preloaderDone is explicitly false', () => {
      // @ts-expect-error Mocking window
      globalThis.window = { __preloaderDone: false };
      expect(checkHasBooted()).toBe(false);
    });

    it('should return true only when window.__preloaderDone is true (SPA internal navigation)', () => {
      // @ts-expect-error Mocking window
      globalThis.window = { __preloaderDone: true };
      expect(checkHasBooted()).toBe(true);
    });
  });

  describe('isAutomatedAuditEnvironment', () => {
    it('should return true for crawlers and Lighthouse user agents', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 Chrome-Lighthouse' },
        configurable: true,
        writable: true,
      });
      expect(isAutomatedAuditEnvironment()).toBe(true);

      Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
        configurable: true,
        writable: true,
      });
      expect(isAutomatedAuditEnvironment()).toBe(true);
    });

    it('should return false for standard desktop and mobile browsers', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
        configurable: true,
        writable: true,
      });
      expect(isAutomatedAuditEnvironment()).toBe(false);
    });
  });

  describe('executeBootCompletion', () => {
    it('should set window.__preloaderDone, release scroll & pre-paint mask, emit completion events, and never touch sessionStorage', () => {
      const dispatchSpy = vi.fn();
      const removeAttributeSpy = vi.fn();
      const fakeSessionStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
      };
      const fakeWindow = {
        dispatchEvent: dispatchSpy,
        __preloaderDone: false,
      };
      const fakeDocument = {
        documentElement: {
          removeAttribute: removeAttributeSpy,
        },
        body: {
          style: { overflow: 'hidden' },
        },
      };

      // @ts-expect-error Mocking window
      globalThis.window = fakeWindow;
      // @ts-expect-error Mocking document
      globalThis.document = fakeDocument;
      // @ts-expect-error Mocking sessionStorage
      globalThis.sessionStorage = fakeSessionStorage;

      executeBootCompletion();

      expect(fakeWindow.__preloaderDone).toBe(true);
      expect(fakeSessionStorage.setItem).not.toHaveBeenCalled();
      expect(fakeSessionStorage.getItem).not.toHaveBeenCalled();
      expect(removeAttributeSpy).toHaveBeenCalledWith('data-en-boot');
      expect(fakeDocument.body.style.overflow).toBe('');
      expect(dispatchSpy).toHaveBeenCalledTimes(2);

      const dispatchedEventNames = dispatchSpy.mock.calls.map(
        (call: unknown[]) => (call[0] as CustomEvent).type
      );
      expect(dispatchedEventNames).toContain('plc-boot-complete');
      expect(dispatchedEventNames).toContain('preloader-complete');
    });
  });

  describe('Choreography, Design Craft & Anti-Flash Architectural Invariants', () => {
    it('should center the sequence on all 5 canonical Isometric EN Monolith paths with staggered E/N stroke drawing and specular sweep', () => {
      expect(preloaderContent).toContain('ISOMETRIC_EN_MONOLITH_PATHS');
      for (const pathKey of Object.keys(ISOMETRIC_EN_MONOLITH_PATHS)) {
        expect(preloaderContent).toContain(`ISOMETRIC_EN_MONOLITH_PATHS.${pathKey}`);
      }

      // Vector stroke drawing choreography
      expect(preloaderContent).toContain('pathLength={100}');
      expect(preloaderContent).toContain('stroke-dasharray');
      expect(preloaderContent).toContain('stroke-dashoffset');
      expect(preloaderContent).toContain('en-specular-sweep');
      expect(preloaderContent).toContain('en-facet-shimmer');
      expect(preloaderContent).toContain('en-node-lock');
      expect(preloaderContent).toContain('en-prism-echo');
      expect(preloaderContent).toContain('en-curtain-exit');
      expect(preloaderContent).not.toContain('max-w-[34ch]');

      // Ensure optical pulse & prism echo finish cleanly before content/curtain exit begins
      const prismMatch = preloaderContent.match(
        /\.en-prism-echo\s*\{[\s\S]*?animation:\s*en-prism-echo\s+([\d.]+)s[\s\S]*?([\d.]+)s\s+both/
      );
      const exitMatch = preloaderContent.match(
        /\.en-center-assembly\s*\{[\s\S]*?animation:\s*en-content-exit\s+[\d.]+s[\s\S]*?([\d.]+)s\s+forwards/
      );
      expect(prismMatch).not.toBeNull();
      expect(exitMatch).not.toBeNull();
      const prismEnd = parseFloat(prismMatch![1]) + parseFloat(prismMatch![2]);
      const exitStart = parseFloat(exitMatch![1]);
      expect(prismEnd).toBeLessThanOrEqual(exitStart + 0.001);
    });

    it('should obey emilkowalski/skills, pbakaus/impeccable, and Leonxlnx/taste-skill rules (custom cubic-bezier curves, no scale(0), zero violet, dark/light contrast)', () => {
      expect(preloaderContent).toContain('cubic-bezier(0.23, 1, 0.32, 1)');
      expect(preloaderContent).toContain('cubic-bezier(0.16, 1, 0.3, 1)');
      expect(preloaderContent).toContain('cubic-bezier(0.77, 0, 0.175, 1)');
      expect(preloaderContent).not.toContain('scale(0)');

      // Light Mode (#F8F9FA / #09090B) and Dark Mode (#050505 / #00D2FF / #FFFFFF) parity
      expect(preloaderContent).toContain('#F8F9FA');
      expect(preloaderContent).toContain('#050505');
      expect(preloaderContent).toContain('#00D2FF');
      expect(preloaderContent).toContain('#FFFFFF');
      expect(preloaderContent).toContain('#09090B');

      // Zero violet / zero sessionStorage
      expect(preloaderContent).not.toContain('#8B5CF6');
      expect(preloaderContent).not.toContain('#7C3AED');
      expect(preloaderContent).not.toContain('indigo-');
      expect(preloaderContent).not.toContain('sessionStorage');
      expect(useDirectScrambleContent).not.toContain('sessionStorage');
      expect(useDirectScrambleContent).toContain('window.__preloaderDone');
    });

    it('should configure pre-paint anti-flash boot guard exclusively on (site) routes while preserving prefers-reduced-motion', () => {
      expect(preloaderContent).toContain('prefers-reduced-motion: reduce');
      expect(preloaderContent).toContain("removeAttribute('data-en-boot')");
      expect(preloaderContent).toContain('if (!mounted || !visible) return;');
      expect(rootLayoutContent).toContain('data-en-boot');
      expect(rootLayoutContent).toContain("p!=='/'&&p.indexOf('/projects/')!==0");
      expect(rootLayoutContent).toContain('prefers-reduced-motion: reduce');
    });
  });
});
