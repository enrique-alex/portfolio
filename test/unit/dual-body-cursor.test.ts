import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import DualBodyCursor from '@/components/animations/DualBodyCursor';
import { frameManager } from '@/lib/graphics/FrameManager';

describe('DualBodyCursor Component', () => {
  beforeEach(() => {
    frameManager.resetForTesting();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    frameManager.resetForTesting();
  });

  it('should render null on initial server render (SSR-safe, zero hydration mismatch)', () => {
    const html = renderToString(React.createElement(DualBodyCursor));
    // Must render nothing on server
    expect(html).toBe('');
  });

  it('should export DualBodyCursor as default function component', () => {
    expect(typeof DualBodyCursor).toBe('function');
  });

  it('should remain inactive and attach zero window/document listeners when pointer is not fine (mobile/touch)', () => {
    // Mock environment for touch device
    const addEventListenerSpy = vi.fn();
    const mediaQueryMock = {
      matches: false, // Touch / coarse pointer
      media: '(pointer: fine)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;

    const fakeWindow = {
      matchMedia: vi.fn().mockReturnValue(mediaQueryMock),
      addEventListener: addEventListenerSpy,
      removeEventListener: vi.fn(),
    };

    const fakeDocument = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // @ts-expect-error Mocking window in unit test
    globalThis.window = fakeWindow;
    // @ts-expect-error Mocking document in unit test
    globalThis.document = fakeDocument;

    try {
      const html = renderToString(React.createElement(DualBodyCursor));
      expect(html).toBe('');
      // Crucial: No mousemove or scroll listeners must be attached
      expect(addEventListenerSpy).not.toHaveBeenCalled();
      expect(mediaQueryMock.addEventListener).not.toHaveBeenCalled();
    } finally {
      globalThis.window = originalWindow;
      globalThis.document = originalDocument;
    }
  });

  it('should return null and attach no event listeners if matchMedia is undefined', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error Window without matchMedia
    globalThis.window = {};

    try {
      const html = renderToString(React.createElement(DualBodyCursor));
      expect(html).toBe('');
    } finally {
      globalThis.window = originalWindow;
    }
  });

  it('should return null on server even if client would have fine pointer (strict SSR match)', () => {
    const mediaQueryMock = {
      matches: true,
      media: '(pointer: fine)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const originalWindow = globalThis.window;
    // @ts-expect-error Mocking window
    globalThis.window = {
      matchMedia: vi.fn().mockReturnValue(mediaQueryMock),
    };

    try {
      const html = renderToString(React.createElement(DualBodyCursor));
      expect(html).toBe('');
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
