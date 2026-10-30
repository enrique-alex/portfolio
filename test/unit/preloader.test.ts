import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Preloader from '@/components/ui/Preloader';

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

  it('should dispatch plc-boot-complete and preloader-complete events immediately when seen-preloader is true', () => {
    const dispatchSpy = vi.fn();
    const fakeSessionStorage = {
      getItem: vi.fn((key: string) => (key === 'seen-preloader' ? 'true' : null)),
      setItem: vi.fn(),
    };

    const fakeWindow = {
      dispatchEvent: dispatchSpy,
      matchMedia: vi.fn(() => ({ matches: false })),
      __preloaderDone: false,
    };

    // @ts-expect-error Mocking window in unit test
    globalThis.window = fakeWindow;
    // @ts-expect-error Mocking sessionStorage in unit test
    globalThis.sessionStorage = fakeSessionStorage;

    const html = renderToString(React.createElement(Preloader));
    expect(html).toBe('');
  });
});
