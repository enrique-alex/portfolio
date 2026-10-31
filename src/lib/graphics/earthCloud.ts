/**
 * earthCloud.ts - Générateur déterministe de nuage de points pour le globe terrestre (Forme 2)
 *
 * Spécifications :
 * - Échantillonnage Blue Noise sur sphère de rayon R = 2.05
 * - Filtrage par masque bilinéaire Terre/Mer haute fidélité (landValue >= 0.5)
 * - Grille d'accélération spatiale 3D avec table de hachage Int32Array (head/next)
 * - Foyer Cameroun (4.5°N, 12.0°E) avec relief radial, onde d'Airy et atténuation gaussienne
 * - Tri cylindrique synchronisé (y * 10 + atan2(z, x)) pour morphing sans croisement
 * - PRNG mulberry32 déterministe (seed = 42 par défaut)
 */

import {
  LAND_W as DEFAULT_LAND_W,
  LAND_H as DEFAULT_LAND_H,
  LAND_AREA_FRAC as DEFAULT_LAND_AREA_FRAC,
  LAND_RLE as DEFAULT_LAND_RLE,
} from './landMask';

export interface LandMaskData {
  LAND_W: number;
  LAND_H: number;
  LAND_AREA_FRAC: number;
  LAND_RLE: number[][];
}

export interface EarthCloudResult {
  positions: Float32Array;
  highlights: Float32Array;
  distances: Float32Array;
}

let cachedDecodedMask: Uint8Array | null = null;
let cachedMaskWidth = 0;
let cachedMaskHeight = 0;

/**
 * Décode la représentation RLE en tampon binaire Uint8Array(W * H)
 * Mémorisé en cache une seule fois pour éviter toute allocation répétée.
 */
export function getDecodedLandMask(data?: LandMaskData): { mask: Uint8Array; width: number; height: number } {
  const width = data?.LAND_W ?? DEFAULT_LAND_W;
  const height = data?.LAND_H ?? DEFAULT_LAND_H;
  const rle = data?.LAND_RLE ?? DEFAULT_LAND_RLE;

  if (cachedDecodedMask && cachedMaskWidth === width && cachedMaskHeight === height) {
    return { mask: cachedDecodedMask, width, height };
  }

  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const row = rle[y];
    if (!row) continue;
    const rowLen = row.length;
    for (let i = 0; i < rowLen; i += 2) {
      const s = row[i];
      const len = row[i + 1];
      const end = s + len;
      for (let x = s; x < end; x++) {
        mask[y * width + x] = 1;
      }
    }
  }

  cachedDecodedMask = mask;
  cachedMaskWidth = width;
  cachedMaskHeight = height;

  return { mask, width, height };
}

/**
 * Échantillonnage bilinéaire continu sur la grille de terre/mer.
 * Bouclage en longitude [-π, π], clamp en latitude [-π/2, π/2].
 */
export function landValue(
  lon: number,
  lat: number,
  mask: Uint8Array,
  width: number,
  height: number
): number {
  const u = ((lon + Math.PI) / (2.0 * Math.PI)) * width - 0.5;
  const v = ((Math.PI * 0.5 - lat) / Math.PI) * height - 0.5;

  const x0 = Math.floor(u);
  const y0 = Math.floor(v);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const ix0 = x0 < 0 ? width - 1 : (x0 >= width ? x0 - width : x0);
  const ix1 = x1 >= width ? 0 : x1;
  const iy0 = y0 < 0 ? 0 : (y0 >= height ? height - 1 : y0);
  const iy1 = y1 < 0 ? 0 : (y1 >= height ? height - 1 : y1);

  const row0 = iy0 * width;
  const row1 = iy1 * width;

  const v00 = mask[row0 + ix0];
  const v10 = mask[row0 + ix1];
  const v01 = mask[row1 + ix0];
  const v11 = mask[row1 + ix1];

  if (v00 === 0 && v10 === 0 && v01 === 0 && v11 === 0) return 0.0;
  if (v00 === 1 && v10 === 1 && v01 === 1 && v11 === 1) return 1.0;

  const fx = u - x0;
  const fy = v - y0;

  return (
    (1.0 - fx) * (1.0 - fy) * v00 +
    fx * (1.0 - fy) * v10 +
    (1.0 - fx) * fy * v01 +
    fx * fy * v11
  );
}

/**
 * PRNG mulberry32 déterministe à 32 bits.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function (): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fonction smoothstep GLSL standard [0, 1].
 */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0.0, Math.min(1.0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3.0 - 2.0 * t);
}

/**
 * Clé de tri cylindrique universelle (y * 10 + atan2(z, x))
 * pour synchroniser les particules et éliminer tout croisement lors du morphing.
 */
export function computeCylindricalKey(x: number, y: number, z: number): number {
  return y * 10.0 + Math.atan2(z, x);
}

/**
 * Trie un tampon Float32Array(N * 3) en place selon la clé cylindrique (y * 10 + atan2(z, x)).
 */
export function sortBufferByCylindricalKey(buf: Float32Array, n: number): void {
  const keys = new Float64Array(n);
  const indices = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const i3 = i * 3;
    keys[i] = buf[i3 + 1] * 10.0 + Math.atan2(buf[i3 + 2], buf[i3]);
    indices[i] = i;
  }

  indices.sort((a, b) => keys[a] - keys[b]);

  const sorted = new Float32Array(n * 3);
  for (let k = 0; k < n; k++) {
    const src3 = indices[k] * 3;
    const dst3 = k * 3;
    sorted[dst3] = buf[src3];
    sorted[dst3 + 1] = buf[src3 + 1];
    sorted[dst3 + 2] = buf[src3 + 2];
  }
  buf.set(sorted);
}

/**
 * Générateur pur du nuage de points du globe terrestre (Forme 2).
 *
 * @param n Nombre de points souhaité (ex. 9000 sur Desktop / 4500 sur Mobile)
 * @param seed Graine aléatoire (42 par défaut pour déterminisme strict)
 * @param maskData Données de masque facultatives
 */
export function generateEarthCloud(
  n: number,
  seed = 42,
  maskData?: LandMaskData
): EarthCloudResult {
  const { mask, width: maskW, height: maskH } = getDecodedLandMask(maskData);
  const areaFrac = maskData?.LAND_AREA_FRAC ?? DEFAULT_LAND_AREA_FRAC;

  const rand = mulberry32(seed);
  const R = 2.05;
  const aTerre = areaFrac * 4.0 * Math.PI * R * R;
  let rMin = 0.65 * Math.sqrt(aTerre / n);

  const rawPos = new Float32Array(n * 3);
  const rawHighlights = new Float32Array(n);
  const rawDistances = new Float32Array(n);
  let accepted = 0;

  // Accélération spatiale 3D par table de hachage (65536 buckets pour minimiser les collisions)
  const TABLE_SIZE = 65536;
  const head = new Int32Array(TABLE_SIZE);
  const next = new Int32Array(n);

  let cellSize = rMin;
  let invCellSize = 1.0 / cellSize;
  const Rbox = 2.5;

  const buildGrid = (): void => {
    head.fill(-1);
    cellSize = rMin;
    invCellSize = 1.0 / cellSize;
    for (let i = 0; i < accepted; i++) {
      const px = rawPos[i * 3];
      const py = rawPos[i * 3 + 1];
      const pz = rawPos[i * 3 + 2];
      const cx = Math.floor((px + Rbox) * invCellSize);
      const cy = Math.floor((py + Rbox) * invCellSize);
      const cz = Math.floor((pz + Rbox) * invCellSize);
      const h =
        (Math.imul(cx, 73856093) ^ Math.imul(cy, 19349663) ^ Math.imul(cz, 83492791)) &
        (TABLE_SIZE - 1);
      next[i] = head[h];
      head[h] = i;
    }
  };

  head.fill(-1);

  const maxAttemptsPerStage = 120 * n;
  let stageAttempts = 0;
  let relaxations = 0;

  while (accepted < n) {
    if (stageAttempts >= maxAttemptsPerStage) {
      if (relaxations >= 5) {
        console.warn(`[generateEarthCloud] Plafond atteint : ${relaxations} relâchements effectués.`);
        break;
      }
      rMin *= 0.9;
      relaxations++;
      console.warn(
        `[generateEarthCloud] Relâchement n°${relaxations} de r_min à ${(rMin).toFixed(5)} (${accepted}/${n} points).`
      );
      buildGrid();
      stageAttempts = 0;
    }

    stageAttempts++;

    // Échantillonnage uniforme sur la sphère (sans accumulation aux pôles)
    const uLat = rand();
    const uLon = rand();
    const sinLat = 2.0 * uLat - 1.0;
    const lat = Math.asin(sinLat);
    const lon = (2.0 * uLon - 1.0) * Math.PI;

    // Test masque terre/mer (zéro point en mer)
    if (landValue(lon, lat, mask, maskW, maskH) < 0.5) {
      continue;
    }

    const cosLat = Math.sqrt(Math.max(0.0, 1.0 - sinLat * sinLat));
    const candX = R * cosLat * Math.sin(lon);
    const candY = R * sinLat;
    const candZ = R * cosLat * Math.cos(lon);

    const rMinSq = rMin * rMin;

    const ccx = ((candX + Rbox) * invCellSize) | 0;
    const ccy = ((candY + Rbox) * invCellSize) | 0;
    const ccz = ((candZ + Rbox) * invCellSize) | 0;

    let tooClose = false;

    // Test des 27 cellules voisines avec factorisation des multiplications de hash
    for (let dx = -1; dx <= 1 && !tooClose; dx++) {
      const hx = Math.imul(ccx + dx, 73856093);
      for (let dy = -1; dy <= 1 && !tooClose; dy++) {
        const hxy = hx ^ Math.imul(ccy + dy, 19349663);
        for (let dz = -1; dz <= 1 && !tooClose; dz++) {
          const h = (hxy ^ Math.imul(ccz + dz, 83492791)) & (TABLE_SIZE - 1);

          let pIdx = head[h];
          while (pIdx !== -1) {
            const p3 = pIdx * 3;
            const ex = rawPos[p3] - candX;
            const exSq = ex * ex;
            if (exSq < rMinSq) {
              const ey = rawPos[p3 + 1] - candY;
              const exySq = exSq + ey * ey;
              if (exySq < rMinSq) {
                const ez = rawPos[p3 + 2] - candZ;
                if (exySq + ez * ez < rMinSq) {
                  tooClose = true;
                  break;
                }
              }
            }
            pIdx = next[pIdx];
          }
        }
      }
    }

    if (!tooClose) {
      const idx = accepted * 3;
      rawPos[idx] = candX;
      rawPos[idx + 1] = candY;
      rawPos[idx + 2] = candZ;

      const candH =
        (Math.imul(ccx, 73856093) ^ Math.imul(ccy, 19349663) ^ Math.imul(ccz, 83492791)) &
        (TABLE_SIZE - 1);
      next[accepted] = head[candH];
      head[candH] = accepted;

      accepted++;
    }
  }

  // 3. Foyer Cameroun (4.5°N, 12.0°E) avec élévation continentale radiale et enveloppe d'Airy
  const latCam = (4.5 * Math.PI) / 180.0;
  const lonCam = (12.0 * Math.PI) / 180.0;
  const pCamX = R * Math.cos(latCam) * Math.sin(lonCam);
  const pCamY = R * Math.sin(latCam);
  const pCamZ = R * Math.cos(latCam) * Math.cos(lonCam);

  const rMax = 0.9;
  const sigma = 0.40;

  for (let i = 0; i < n; i++) {
    const idx = i * 3;
    const px = rawPos[idx];
    const py = rawPos[idx + 1];
    const pz = rawPos[idx + 2];

    const dx = px - pCamX;
    const dy = py - pCamY;
    const dz = pz - pCamZ;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const factor =
      d < rMax
        ? Math.exp(-((d / sigma) * (d / sigma))) * (1.0 - smoothstep(0.0, rMax, d))
        : 0.0;

    rawHighlights[i] = factor;
    rawDistances[i] = d;

    // Élévation continentale et relief radial (+ factor * 0.04)
    const pLen = Math.sqrt(px * px + py * py + pz * pz) || 1.0;
    const relief = factor * 0.04;
    rawPos[idx] = px + (px / pLen) * relief;
    rawPos[idx + 1] = py + (py / pLen) * relief;
    rawPos[idx + 2] = pz + (pz / pLen) * relief;
  }

  // 4. Tri cylindrique synchronisé : clé = y * 10 + atan2(z, x)
  const keys = new Float64Array(n);
  const indices = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const i3 = i * 3;
    keys[i] = rawPos[i3 + 1] * 10.0 + Math.atan2(rawPos[i3 + 2], rawPos[i3]);
    indices[i] = i;
  }

  indices.sort((a, b) => keys[a] - keys[b]);

  const positions = new Float32Array(n * 3);
  const highlights = new Float32Array(n);
  const distances = new Float32Array(n);

  for (let k = 0; k < n; k++) {
    const src = indices[k];
    const src3 = src * 3;
    const k3 = k * 3;
    positions[k3] = rawPos[src3];
    positions[k3 + 1] = rawPos[src3 + 1];
    positions[k3 + 2] = rawPos[src3 + 2];
    highlights[k] = rawHighlights[src];
    distances[k] = rawDistances[src];
  }

  return {
    positions,
    highlights,
    distances,
  };
}
