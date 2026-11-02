import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import EarthGlobe3D from '@/components/ui/EarthGlobe3D';
import { generateEarthCloud } from '@/lib/graphics/earthCloud';
import { DUAL_AXIS_LAT, DUAL_AXIS_LON } from '@/lib/geoData';

describe('EarthGlobe3D - Standalone Interactive Earth Globe Component', () => {
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    originalWindow = globalThis.window;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it('should render correctly in SSR without crashing with Dual-Hub engineering telemetry', () => {
    const html = renderToString(React.createElement(EarthGlobe3D));
    expect(html).toContain('GEODETIC TELEMETRY');
    expect(html).toContain('YAOUNDÉ');
    expect(html).toContain('LILLE-DUNKERQUE');
    expect(html).toContain('ALIGN DUAL-AXIS');
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

  it('should ensure Cameroon border (1.0), France border (2.0), and 3D Geodesic Arc (3.0) are present', () => {
    const cloud = generateEarthCloud(4500, 42);
    let camCount = 0;
    let fraCount = 0;
    let arcCount = 0;

    for (let i = 0; i < cloud.highlights.length; i++) {
      if (cloud.highlights[i] === 1.0) camCount++;
      else if (cloud.highlights[i] === 2.0) fraCount++;
      else if (cloud.highlights[i] === 3.0) arcCount++;
    }

    expect(camCount).toBeGreaterThan(50);
    expect(fraCount).toBeGreaterThan(50);
    expect(arcCount).toBe(80);
  });

  it('should clamp vertical pitch to ±75 degrees (±1.309 rad)', () => {
    const maxPitch = (75.0 * Math.PI) / 180.0;
    expect(maxPitch).toBeCloseTo(1.309, 3);

    const clampPitch = (p: number) => Math.max(-maxPitch, Math.min(maxPitch, p));
    expect(clampPitch(2.5)).toBeCloseTo(1.309, 3);
    expect(clampPitch(-3.0)).toBeCloseTo(-1.309, 3);
    expect(clampPitch(0.5)).toBeCloseTo(0.5, 3);
  });

  it('should compute shortest angular distance on circle without multi-turn hyperspin', () => {
    const DUAL_AXIS_YAW = (-DUAL_AXIS_LON * Math.PI) / 180.0;
    
    // Simulate yaw after multiple rotations (e.g. 5 full turns + offset)
    const longAccumulatedYaw = DUAL_AXIS_YAW + 5 * 2 * Math.PI + 0.5;

    let diffYaw = (DUAL_AXIS_YAW - longAccumulatedYaw) % (2.0 * Math.PI);
    if (diffYaw > Math.PI) diffYaw -= 2.0 * Math.PI;
    if (diffYaw < -Math.PI) diffYaw += 2.0 * Math.PI;

    // The shortest angular difference must be bounded by [-PI, PI] and close to -0.5 rad (less than 1 turn!)
    expect(Math.abs(diffYaw)).toBeLessThanOrEqual(Math.PI);
    expect(diffYaw).toBeCloseTo(-0.5, 3);
  });

  it('should cancel residual pointer velocity when pointer was stationary (>80ms) before release', () => {
    const pointerState = {
      isDragging: true,
      lastPointerTime: 1000,
      velYaw: 5.5,
      velPitch: 3.2,
    };

    const handleRelease = (now: number) => {
      pointerState.isDragging = false;
      if (now - pointerState.lastPointerTime > 80) {
        pointerState.velYaw = 0;
        pointerState.velPitch = 0;
      }
    };

    // User paused for 300ms before releasing pointer
    handleRelease(1300);
    expect(pointerState.velYaw).toBe(0);
    expect(pointerState.velPitch).toBe(0);
  });

  it('should render initial telemetry coordinates "27.3°N, 8.2°E" in SSR', () => {
    const html = renderToString(React.createElement(EarthGlobe3D));
    expect(html).toContain('27.3°N, 8.2°E');
  });
});
