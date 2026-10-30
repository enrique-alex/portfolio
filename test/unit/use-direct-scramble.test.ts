import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { useDirectScramble, computeScrambleText, DEFAULT_CHARS } from '@/lib/hooks/useDirectScramble';
import { frameManager } from '@/lib/graphics/FrameManager';

describe('useDirectScramble - Découplage Texte du Hero (Étape 2)', () => {
  let originalWindow: typeof globalThis.window;
  let originalSessionStorage: typeof globalThis.sessionStorage;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalSessionStorage = globalThis.sessionStorage;
    frameManager.resetForTesting();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    frameManager.resetForTesting();
    globalThis.window = originalWindow;
    globalThis.sessionStorage = originalSessionStorage;
  });

  it('should export useDirectScramble function and computeScrambleText helper', () => {
    expect(typeof useDirectScramble).toBe('function');
    expect(typeof computeScrambleText).toBe('function');
  });

  describe('computeScrambleText pure helper', () => {
    it('should return exactly targetText when progress is >= 1.0', () => {
      const text = 'Enrique Alex NDJAKOU KEMAYOU';
      const result = computeScrambleText(text, 1.0);
      expect(result).toBe(text);
    });

    it('should preserve spaces and newlines even at progress 0', () => {
      const text = 'Line One\nLine Two';
      const result = computeScrambleText(text, 0.0);
      expect(result.length).toBe(text.length);
      expect(result[4]).toBe(' ');
      expect(result[8]).toBe('\n');
    });

    it('should partially decode text proportionally at progress 0.5', () => {
      const text = 'AUTOMATION SYSTEM';
      const result = computeScrambleText(text, 0.5);
      const decodedHalfIndex = Math.floor(0.5 * text.length);

      // First half should match exactly
      expect(result.slice(0, decodedHalfIndex)).toBe(text.slice(0, decodedHalfIndex));
      expect(result.length).toBe(text.length);
    });

    it('should use custom chars if supplied', () => {
      const text = 'ABCDEF';
      const result = computeScrambleText(text, 0, '1');
      expect(result).toBe('111111');
    });
  });

  describe('Hook Lifecycle and Event Integration', () => {
    it('should render safely during SSR without errors', () => {
      function TestComponent() {
        const ref = useRef<HTMLSpanElement>(null);
        useDirectScramble({
          refs: [ref],
          lines: ['Enrique Alex'],
          duration: 800,
        });
        return React.createElement('span', { ref }, 'Initial SSR');
      }

      const html = renderToString(React.createElement(TestComponent));
      expect(html).toContain('Initial SSR');
    });
  });
});
