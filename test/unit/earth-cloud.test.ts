import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { generateEarthCloud, getDecodedLandMask, landValue } from '@/lib/graphics/earthCloud';
import { ThreeIndustrialScene, initThreeIndustrialScene } from '@/lib/graphics/ThreeIndustrialScene';
import { frameManager } from '@/lib/graphics/FrameManager';
import { kineticEnergy } from '@/lib/graphics/KineticEnergy';

describe('Forme 2: Earth Geographic Point Cloud & Cameroon Focus', () => {
  let originalWindow: typeof globalThis.window;
  let originalDocument: typeof globalThis.document;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;
    frameManager.resetForTesting();
    kineticEnergy.resetForTesting();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    frameManager.resetForTesting();
    kineticEnergy.resetForTesting();
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });

  it('1. should generate exactly N points deterministically with seed=42', () => {
    const N_desktop = 9000;
    const run1 = generateEarthCloud(N_desktop, 42);
    const run2 = generateEarthCloud(N_desktop, 42);

    expect(run1.positions.length).toBe(N_desktop * 3);
    expect(run1.highlights.length).toBe(N_desktop);
    expect(run1.distances.length).toBe(N_desktop);

    // Bitwise determinism
    expect(run1.positions).toEqual(run2.positions);
    expect(run1.highlights).toEqual(run2.highlights);
    expect(run1.distances).toEqual(run2.distances);

    const N_mobile = 4500;
    const mobileRun = generateEarthCloud(N_mobile, 42);
    expect(mobileRun.positions.length).toBe(N_mobile * 3);
    expect(mobileRun.highlights.length).toBe(N_mobile);
  });

  it('2. should verify zero points fall into the ocean (all points have landValue >= 0.5)', () => {
    const N = 4500;
    const cloud = generateEarthCloud(N, 42);
    const { mask, width, height } = getDecodedLandMask();

    let oceanPoints = 0;
    for (let i = 0; i < N; i++) {
      const x = cloud.positions[i * 3];
      const y = cloud.positions[i * 3 + 1];
      const z = cloud.positions[i * 3 + 2];
      const r = Math.hypot(x, y, z);
      const lat = Math.asin(Math.max(-1.0, Math.min(1.0, y / r)));
      const lon = Math.atan2(x, z);

      const val = landValue(lon, lat, mask, width, height);
      if (val < 0.499) {
        oceanPoints++;
      }
    }

    expect(oceanPoints).toBe(0);
  });

  it('3. should verify execution time is < 150 ms on desktop and < 80 ms on mobile', () => {
    const t0 = performance.now();
    generateEarthCloud(9000, 42);
    const desktopTime = performance.now() - t0;

    const t1 = performance.now();
    generateEarthCloud(4500, 42);
    const mobileTime = performance.now() - t1;

    console.info(`[Benchmark] Desktop (9000 pts): ${desktopTime.toFixed(2)} ms (spec: < 150 ms)`);
    console.info(`[Benchmark] Mobile (4500 pts): ${mobileTime.toFixed(2)} ms (spec: < 80 ms)`);

    expect(desktopTime).toBeLessThan(150);
    expect(mobileTime).toBeLessThan(80);
  });

  it('4. should verify points are ordered by cylindrical sorting key (y * 10 + atan2(z, x))', () => {
    const cloud = generateEarthCloud(1000, 42);
    const pos = cloud.positions;

    for (let i = 0; i < 999; i++) {
      const xCurr = pos[i * 3];
      const yCurr = pos[i * 3 + 1];
      const zCurr = pos[i * 3 + 2];
      const keyCurr = yCurr * 10.0 + Math.atan2(zCurr, xCurr);

      const xNext = pos[(i + 1) * 3];
      const yNext = pos[(i + 1) * 3 + 1];
      const zNext = pos[(i + 1) * 3 + 2];
      const keyNext = yNext * 10.0 + Math.atan2(zNext, xNext);

      expect(keyCurr).toBeLessThanOrEqual(keyNext + 1e-5);
    }
  });

  it('5. should verify Cameroon focus (4.5°N, 12.0°E) exhibits peak highlight and radial relief', () => {
    const cloud = generateEarthCloud(4500, 42);
    let maxHighlight = 0;
    let minDistance = 999;
    let cameroonPointIdx = -1;

    for (let i = 0; i < 4500; i++) {
      const h = cloud.highlights[i];
      const d = cloud.distances[i];
      if (h > maxHighlight) {
        maxHighlight = h;
      }
      if (d < minDistance) {
        minDistance = d;
        cameroonPointIdx = i;
      }
    }

    expect(maxHighlight).toBeGreaterThan(0.95);
    expect(minDistance).toBeLessThan(0.08);

    // Relief is radial
    const px = cloud.positions[cameroonPointIdx * 3];
    const py = cloud.positions[cameroonPointIdx * 3 + 1];
    const pz = cloud.positions[cameroonPointIdx * 3 + 2];
    const rCam = Math.hypot(px, py, pz);
    expect(rCam).toBeGreaterThan(2.05);
    expect(rCam).toBeLessThanOrEqual(2.091);
  });

  it('6. should verify numerical alignment of Cameroon in NDC and frontal facing (> 0.9)', () => {
    const R = 2.05;
    const latCam = (4.5 * Math.PI) / 180;
    const lonCam = (12.0 * Math.PI) / 180;

    const pCam = new THREE.Vector3(
      R * Math.cos(latCam) * Math.sin(lonCam),
      R * Math.sin(latCam),
      R * Math.cos(latCam) * Math.cos(lonCam)
    );

    const normal = pCam.clone().normalize();
    pCam.addScaledVector(normal, 0.04);

    const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 60);
    camera.position.set(0, 0, 4.8);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    const mesh = new THREE.Object3D();
    mesh.rotation.order = 'YXZ';
    mesh.rotation.y = (-12.0 * Math.PI) / 180;
    mesh.rotation.x = (-4.5 * Math.PI) / 180;
    mesh.updateMatrixWorld();

    const pCamWorld = pCam.clone().applyMatrix4(mesh.matrixWorld);
    const pCamNDC = pCamWorld.clone().project(camera);
    const centerNDC = new THREE.Vector3(0, 0, 0).applyMatrix4(mesh.matrixWorld).project(camera);
    const distNDC = Math.hypot(pCamNDC.x - centerNDC.x, pCamNDC.y - centerNDC.y);

    expect(distNDC).toBeLessThan(0.30);

    // Facing
    const normalWorld = normal.clone().transformDirection(mesh.matrixWorld);
    const mvPos = pCamWorld.clone().applyMatrix4(camera.matrixWorldInverse);
    const viewDir = mvPos.clone().negate().normalize();
    const normalView = normalWorld.clone().transformDirection(camera.matrixWorldInverse);
    const facing = normalView.dot(viewDir);

    expect(facing).toBeGreaterThan(0.9);
  });

  it('7. should asynchronously load earth cloud and update topologyBuffers[1] in ThreeIndustrialScene', async () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 100 });
    expect(scene.isEarthCloudLoaded).toBe(false);

    await scene.loadEarthCloud();
    expect(scene.isEarthCloudLoaded).toBe(true);

    const earthBuf = scene.getTopologyBuffer(1);
    expect(earthBuf.length).toBe(100 * 3);
    for (let i = 0; i < earthBuf.length; i++) {
      expect(Number.isFinite(earthBuf[i])).toBe(true);
      expect(Number.isNaN(earthBuf[i])).toBe(false);
    }

    scene.destroy();
  });

  it('8. should verify all major geographic regions have points for clear visual recognition', () => {
    const { positions } = generateEarthCloud(9000, 42);
    const regions: Record<string, { latMin: number; latMax: number; lonMin: number; lonMax: number }> = {
      'Gulf of Guinea / Cameroon': { latMin: 2, latMax: 10, lonMin: 8, lonMax: 16 },
      'Horn of Africa': { latMin: 5, latMax: 15, lonMin: 40, lonMax: 52 },
      'Red Sea coast': { latMin: 18, latMax: 28, lonMin: 34, lonMax: 42 },
      'Madagascar': { latMin: -26, latMax: -12, lonMin: 43, lonMax: 51 },
      'Iberian Peninsula': { latMin: 36, latMax: 44, lonMin: -9, lonMax: 3 },
      'Italy': { latMin: 38, latMax: 46, lonMin: 8, lonMax: 18 },
      'Japan': { latMin: 31, latMax: 45, lonMin: 130, lonMax: 145 },
      'Indonesia': { latMin: -10, latMax: 5, lonMin: 95, lonMax: 141 },
      'Australia': { latMin: -39, latMax: -11, lonMin: 113, lonMax: 153 },
      'New Zealand': { latMin: -47, latMax: -34, lonMin: 166, lonMax: 178 },
      'Greenland': { latMin: 60, latMax: 83, lonMin: -73, lonMax: -12 },
    };

    const toDeg = 180 / Math.PI;
    const counts: Record<string, number> = {};
    for (const k of Object.keys(regions)) counts[k] = 0;

    for (let i = 0; i < 9000; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const r = Math.hypot(x, y, z);
      const latDeg = Math.asin(Math.max(-1, Math.min(1, y / r))) * toDeg;
      const lonDeg = Math.atan2(x, z) * toDeg;

      for (const [name, box] of Object.entries(regions)) {
        if (
          latDeg >= box.latMin &&
          latDeg <= box.latMax &&
          lonDeg >= box.lonMin &&
          lonDeg <= box.lonMax
        ) {
          counts[name]++;
        }
      }
    }

    for (const [name, count] of Object.entries(counts)) {
      expect(count).toBeGreaterThan(0);
    }
  });

  it('9. should verify minimum distance between neighbors is >= 0.9 * r_min', () => {
    const N = 4500;
    const { positions } = generateEarthCloud(N, 42);
    const R = 2.05;
    const aTerre = 0.26344 * 4.0 * Math.PI * R * R;
    const rMin = 0.65 * Math.sqrt(aTerre / N);

    const cellSize = rMin * 1.5;
    const invCell = 1.0 / cellSize;
    const grid: Record<string, number[]> = {};

    for (let i = 0; i < N; i++) {
      const cx = Math.floor(positions[i * 3] * invCell);
      const cy = Math.floor(positions[i * 3 + 1] * invCell);
      const cz = Math.floor(positions[i * 3 + 2] * invCell);
      const key = `${cx},${cy},${cz}`;
      if (!grid[key]) grid[key] = [];
      grid[key].push(i);
    }

    let minD = 999;
    for (let i = 0; i < N; i++) {
      const px = positions[i * 3];
      const py = positions[i * 3 + 1];
      const pz = positions[i * 3 + 2];
      const cx = Math.floor(px * invCell);
      const cy = Math.floor(py * invCell);
      const cz = Math.floor(pz * invCell);

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            const bucket = grid[`${cx + dx},${cy + dy},${cz + dz}`];
            if (!bucket) continue;
            for (let b = 0; b < bucket.length; b++) {
              const j = bucket[b];
              if (j <= i) continue;
              const ex = px - positions[j * 3];
              const ey = py - positions[j * 3 + 1];
              const ez = pz - positions[j * 3 + 2];
              const d = Math.hypot(ex, ey, ez);
              if (d < minD) minD = d;
            }
          }
        }
      }
    }

    console.info(`[Blue Noise] Observed min distance: ${minD.toFixed(5)} (r_min: ${rMin.toFixed(5)}, 0.9*r_min: ${(0.9 * rMin).toFixed(5)})`);
    expect(minD).toBeGreaterThanOrEqual(0.9 * rMin);
  });

  it('10. should smoothly handle switching to Form 2 before loadEarthCloud resolves and toggling prefers-reduced-motion', async () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 80 });
    expect(scene.isEarthCloudLoaded).toBe(false);

    // Switch to Form 2 BEFORE loadEarthCloud resolves and step frames until morph settles on Möbius fallback
    scene.setTopology(1);
    for (let f = 0; f < 60; f++) {
      scene.renderFrameForTesting(0.05, f * 50, true);
    }
    expect(scene.morphProgressValue).toBe(1.0);

    // Now await loadEarthCloud resolution while targetTopologyIndex is already 1
    await scene.loadEarthCloud();
    expect(scene.isEarthCloudLoaded).toBe(true);
    // morphProgress must have been reset to 0.0 so the newly decoded Earth cloud morphs in
    expect(scene.morphProgressValue).toBe(0.0);

    // Step frames with prefers-reduced-motion dynamically toggled
    scene.renderFrameForTesting(0.016, 3100, false);
    expect(scene.morphProgressValue).toBeGreaterThan(0.0);
    scene.renderFrameForTesting(0.05, 3150, true);

    scene.destroy();
  });
});
