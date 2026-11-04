import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

vi.mock('framer-motion', () => ({
  useReducedMotion: () => false,
}));

import SideSlider from '@/components/ui/SideSlider';

describe('SideSlider Navigation & Scroll Progress Indicator', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should export SideSlider component correctly as a function', () => {
    expect(SideSlider).toBeDefined();
    expect(typeof SideSlider).toBe('function');
  });

  it('should render null on initial server render (SSR-safe, zero hydration mismatch)', () => {
    const html = renderToString(React.createElement(SideSlider));
    expect(html).toBe('');
  });

  it('should remain inactive and render empty when rendered without a fine pointer (touch/mobile devices)', () => {
    const mediaQueryMock = {
      matches: false, // Touch / coarse pointer
      media: '(pointer: fine)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    const originalWindow = globalThis.window;
    const fakeWindow = {
      matchMedia: vi.fn().mockReturnValue(mediaQueryMock),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // @ts-expect-error Mocking window in unit test
    globalThis.window = fakeWindow;

    try {
      const html = renderToString(React.createElement(SideSlider));
      expect(html).toBe('');
    } finally {
      globalThis.window = originalWindow;
    }
  });

  it('should contain obsidian DA styling, cyan glow, and cursor-none in component definition', () => {
    const componentCode = SideSlider.toString();
    expect(componentCode).toContain('cursor-none');
    expect(componentCode).toContain('pointer: fine');
    expect(componentCode).toContain('skills');
    expect(componentCode).toContain('#00D2FF');
    expect(componentCode).toContain('scrollbar');
  });
});
