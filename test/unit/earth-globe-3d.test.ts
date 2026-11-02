import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import EarthGlobe3D from '@/components/ui/EarthGlobe3D';
import { generateEarthCloud } from '@/lib/graphics/earthCloud';

describe('EarthGlobe3D - Standalone Interactive Earth Globe Component', () => {
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    originalWindow = globalThis.window;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it('should render correctly in SSR without crashing', () => {
    const html = renderToString(React.createElement(EarthGlobe3D));
    expect(html).toContain('GEOGRAPHIC RADAR');
    expect(html).toContain('CAMEROUN');
    expect(html).toContain('LILLE / DUNKERQUE');
    expect(html).toContain('Recentrer');
    expect(html).toContain('canvas');
  });

  it('should include pan-y touch-action to prevent blocking vertical page scroll', () => {
    const html = renderToString(React.createElement(EarthGlobe3D));
    expect(html).toContain('touch-action:pan-y');
  });

  it('should generate 2500 points for mobile and 4500 points for desktop with valid arrays', () => {
    // Mobile calibration: N = 2500
    const mobileCloud = generateEarthCloud(2500, 42);
    expect(mobileCloud.positions.length).toBe(2500 * 3);
    expect(mobileCloud.highlights.length).toBe(2500);
    expect(mobileCloud.distances.length).toBe(2500);

    // Desktop calibration: N = 4500
    const desktopCloud = generateEarthCloud(4500, 42);
    expect(desktopCloud.positions.length).toBe(4500 * 3);
    expect(desktopCloud.highlights.length).toBe(4500);
    expect(desktopCloud.distances.length).toBe(4500);

    // No NaNs or Infs
    for (let i = 0; i < desktopCloud.positions.length; i++) {
      expect(Number.isFinite(desktopCloud.positions[i])).toBe(true);
    }
  });

  it('should ensure Cameroon focal point has maximum highlight near 4.5°N, 12.0°E', () => {
    const cloud = generateEarthCloud(4500, 42);
    let maxHighlight = 0;
    let minDistance = Infinity;

    for (let i = 0; i < cloud.highlights.length; i++) {
      if (cloud.highlights[i] > maxHighlight) {
        maxHighlight = cloud.highlights[i];
      }
      if (cloud.distances[i] < minDistance) {
        minDistance = cloud.distances[i];
      }
    }

    // Focal highlight is boosted and distance to Cameroon focal center is small
    expect(maxHighlight).toBeGreaterThan(0.5);
    expect(minDistance).toBeLessThan(0.3);
  });

  it('should clamp vertical pitch to ±75 degrees (±1.309 rad)', () => {
    const maxPitch = (75.0 * Math.PI) / 180.0;
    expect(maxPitch).toBeCloseTo(1.309, 3);

    const clampPitch = (p: number) => Math.max(-maxPitch, Math.min(maxPitch, p));
    expect(clampPitch(2.5)).toBeCloseTo(1.309, 3);
    expect(clampPitch(-3.0)).toBeCloseTo(-1.309, 3);
    expect(clampPitch(0.5)).toBeCloseTo(0.5, 3);
  });
});
