/**
 * earthCloud.ts - Générateur déterministe de nuage de points pour la Télémétrie Géodésique Dual-Hub
 *
 * Spécifications :
 * - Géométrie mondiale réelle (Natural Earth 1:50m, tous les continents + Antarctique complet ~7.3% au sud de -60°)
 * - Frontière vectorielle officielle du Cameroun (Natural Earth admin-0, 350 sommets réels)
 * - Frontière vectorielle officielle de la France métropolitaine (Hexagone, Natural Earth admin-0, 534 sommets réels)
 * - Trajectoire orbitale 3D (arc géodésique de grand cercle de 5 262 km entre Yaoundé et Lille) avec paquet photonique
 * - Reste du monde : Blue Noise naturel sur tous les continents (densité homogène sans coloriage grossier)
 * - Deux balises focales / sonars : Yaoundé (3.848°N, 11.502°E) et Lille (50.629°N, 3.057°E)
 * - ZÉRO répulsion particulaire sous le curseur (silhouette stable et fidèle)
 * - Tri cylindrique universel (y * 10 + atan2(z, x)) appliqué simultanément aux 3 tampons
 * - PRNG mulberry32 déterministe (seed = 42)
 */

import {
  LAND_W as DEFAULT_LAND_W,
  LAND_H as DEFAULT_LAND_H,
  LAND_AREA_FRAC as DEFAULT_LAND_AREA_FRAC,
  LAND_RLE as DEFAULT_LAND_RLE,
  CAMEROON_RING as DEFAULT_CAMEROON_RING,
  CAMEROON_CENTER as DEFAULT_CAMEROON_CENTER,
  YAOUNDE_LAT as DEFAULT_YAOUNDE_LAT,
  YAOUNDE_LON as DEFAULT_YAOUNDE_LON,
  FRANCE_RING as DEFAULT_FRANCE_RING,
  FRANCE_CENTER as DEFAULT_FRANCE_CENTER,
  LILLE_LAT as DEFAULT_LILLE_LAT,
  LILLE_LON as DEFAULT_LILLE_LON,
  DUAL_AXIS_LAT as DEFAULT_DUAL_AXIS_LAT,
  DUAL_AXIS_LON as DEFAULT_DUAL_AXIS_LON,
  GEODESIC_DISTANCE_KM as DEFAULT_GEODESIC_DISTANCE_KM,
} from '../geoData';

export interface GeoDataModule {
  LAND_W?: number;
  LAND_H?: number;
  LAND_AREA_FRAC?: number;
  LAND_RLE?: number[][];
  CAMEROON_RING?: [number, number][];
  CAMEROON_CENTER?: [number, number];
  YAOUNDE_LAT?: number;
  YAOUNDE_LON?: number;
  FRANCE_RING?: [number, number][];
  FRANCE_CENTER?: [number, number];
  LILLE_LAT?: number;
  LILLE_LON?: number;
  DUAL_AXIS_LAT?: number;
  DUAL_AXIS_LON?: number;
  GEODESIC_DISTANCE_KM?: number;
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
 * Décode la représentation RLE en Uint8Array(W * H) mémorisé en cache.
 */
export function getDecodedLandMask(data?: GeoDataModule): { mask: Uint8Array; width: number; height: number } {
  const width = data?.LAND_W ?? DEFAULT_LAND_W;
  const height = data?.LAND_H ?? DEFAULT_LAND_H;
  const rle = data?.LAND_RLE ?? DEFAULT_LAND_RLE;

  if (cachedDecodedMask && cachedMaskWidth === width && cachedMaskHeight === height) {
    return { mask: cachedDecodedMask, width, height };
  }

  const mask = new Uint8Array(width * height);
  const rowCount = Math.min(height, rle.length);

  for (let y = 0; y < rowCount; y++) {
    const row = rle[y];
    const rowOffset = y * width;
    const len = row.length;
    for (let k = 0; k < len; k += 2) {
      const start = row[k];
      const span = row[k + 1];
      const end = Math.min(width, start + span);
      for (let x = start; x < end; x++) {
        mask[rowOffset + x] = 1;
      }
    }
  }

  cachedDecodedMask = mask;
  cachedMaskWidth = width;
  cachedMaskHeight = height;

  return { mask, width, height };
}

/**
 * Échantillonnage bilinéaire continu sur la grille terre/mer.
 * Bouclage en longitude [-π, π], clamp en latitude [-π/2, π/2].
 */
export function landValue(
  lon: number,
  lat: number,
  mask: Uint8Array,
  width: number,
  height: number
): number {
  let u = (lon + Math.PI) / (2.0 * Math.PI);
  u = u - Math.floor(u); // wrap [0, 1)

  const v = Math.max(0.0, Math.min(1.0, (Math.PI * 0.5 - lat) / Math.PI));

  const xFloat = u * width - 0.5;
  const yFloat = v * height - 0.5;

  const x0 = Math.floor(xFloat);
  const y0 = Math.floor(yFloat);

  const fx = xFloat - x0;
  const fy = yFloat - y0;

  const x0c = ((x0 % width) + width) % width;
  const x1c = (((x0 + 1) % width) + width) % width;

  const y0c = Math.max(0, Math.min(height - 1, y0));
  const y1c = Math.max(0, Math.min(height - 1, y0 + 1));

  const p00 = mask[y0c * width + x0c];
  const p10 = mask[y0c * width + x1c];
  const p01 = mask[y1c * width + x0c];
  const p11 = mask[y1c * width + x1c];

  const top = p00 + (p10 - p00) * fx;
  const bot = p01 + (p11 - p01) * fx;

  return top + (bot - top) * fy;
}

/**
 * PRNG déterministe Mulberry32
 */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return function (): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296.0;
  };
}

/**
 * Clé de tri cylindrique universelle (y * 10 + atan2(z, x))
 */
export function computeCylindricalKey(x: number, y: number, z: number): number {
  return y * 10.0 + Math.atan2(z, x);
}

/**
 * Générateur pur du nuage de points du globe terrestre (Forme 2 / Télémétrie Dual-Hub).
 *
 * @param n Nombre de points souhaité (ex. 9000 sur Desktop / 4500 sur Mobile)
 * @param seed Graine aléatoire (42 par défaut pour déterminisme strict)
 * @param geoData Données géographiques facultatives
 */
export function generateEarthCloud(
  n: number,
  seed = 42,
  geoData?: unknown
): EarthCloudResult {
  const geo = (geoData as GeoDataModule | undefined) ?? {};
  const { mask, width: maskW, height: maskH } = getDecodedLandMask(geo);
  const areaFrac = geo.LAND_AREA_FRAC ?? DEFAULT_LAND_AREA_FRAC;
  const camRing = geo.CAMEROON_RING ?? DEFAULT_CAMEROON_RING;
  const camCenter = geo.CAMEROON_CENTER ?? DEFAULT_CAMEROON_CENTER;
  const yaoundeLat = geo.YAOUNDE_LAT ?? DEFAULT_YAOUNDE_LAT;
  const yaoundeLon = geo.YAOUNDE_LON ?? DEFAULT_YAOUNDE_LON;

  const fraRing = geo.FRANCE_RING ?? DEFAULT_FRANCE_RING;
  const fraCenter = geo.FRANCE_CENTER ?? DEFAULT_FRANCE_CENTER;
  const lilleLat = geo.LILLE_LAT ?? DEFAULT_LILLE_LAT;
  const lilleLon = geo.LILLE_LON ?? DEFAULT_LILLE_LON;

  const rand = mulberry32(seed);
  const R = 2.05;
  const toRad = Math.PI / 180.0;

  const positions = new Float32Array(n * 3);
  const highlights = new Float32Array(n);
  const distances = new Float32Array(n);

  // 1. Budget de points
  const nArc = 80;
  const nCam = Math.max(20, Math.round(0.025 * n));
  const nFra = Math.max(20, Math.round(0.025 * n));
  const nGlob = n - nArc - nCam - nFra;

  // 2. Coordonnées 3D des deux balises focales
  const yLatRad = yaoundeLat * toRad;
  const yLonRad = yaoundeLon * toRad;
  const yCos = Math.cos(yLatRad);
  const yX = R * yCos * Math.sin(yLonRad);
  const yY = R * Math.sin(yLatRad);
  const yZ = R * yCos * Math.cos(yLonRad);

  const lLatRad = lilleLat * toRad;
  const lLonRad = lilleLon * toRad;
  const lCos = Math.cos(lLatRad);
  const lX = R * lCos * Math.sin(lLonRad);
  const lY = R * Math.sin(lLatRad);
  const lZ = R * lCos * Math.cos(lLonRad);

  // 3. Trajectoire géodésique orbitale 3D (Grand Cercle / SLERP)
  const dotYL = (yX * lX + yY * lY + yZ * lZ) / (R * R);
  const omega = Math.acos(Math.max(-1.0, Math.min(1.0, dotYL)));
  const sinOmega = Math.sin(omega);

  for (let k = 0; k < nArc; k++) {
    const t = (k + 0.5) / nArc;
    const a = Math.sin((1.0 - t) * omega) / sinOmega;
    const b = Math.sin(t * omega) / sinOmega;
    const px = a * yX + b * lX;
    const py = a * yY + b * lY;
    const pz = a * yZ + b * lZ;
    const pLen = Math.hypot(px, py, pz) || 1.0;

    // Élévation orbitale parabolique au-dessus de l'atmosphère (apex à +0.16)
    const rT = R + 0.16 * Math.sin(Math.PI * t);
    const k3 = k * 3;
    positions[k3] = (px / pLen) * rT;
    positions[k3 + 1] = (py / pLen) * rT;
    positions[k3 + 2] = (pz / pLen) * rT;
    highlights[k] = 3.0; // Code 3.0 = Arc géodésique
    distances[k] = t;    // Paramètre t pour l'animation photonique
  }

  // 4. Échantillonnage régulier des contours vectoriels (Cameroun & France)
  const sampleBorder = (
    ring: [number, number][],
    count: number,
    center: [number, number],
    outStartIdx: number,
    highlightVal: number,
    refX: number,
    refY: number,
    refZ: number
  ) => {
    const len = ring.length;
    const pts3D = new Float32Array(len * 3);
    const segDists = new Float64Array(len);
    let totalP = 0;

    for (let i = 0; i < len; i++) {
      const [lo, la] = ring[i];
      const loRad = lo * toRad;
      const laRad = la * toRad;
      const cLa = Math.cos(laRad);
      const i3 = i * 3;
      pts3D[i3] = R * cLa * Math.sin(loRad);
      pts3D[i3 + 1] = R * Math.sin(laRad);
      pts3D[i3 + 2] = R * cLa * Math.cos(loRad);
      if (i > 0) {
        const p3 = (i - 1) * 3;
        totalP += Math.hypot(
          pts3D[i3] - pts3D[p3],
          pts3D[i3 + 1] - pts3D[p3 + 1],
          pts3D[i3 + 2] - pts3D[p3 + 2]
        );
        segDists[i] = totalP;
      }
    }
    const last3 = (len - 1) * 3;
    totalP += Math.hypot(
      pts3D[0] - pts3D[last3],
      pts3D[1] - pts3D[last3 + 1],
      pts3D[2] - pts3D[last3 + 2]
    );

    const delta = totalP / Math.max(1, count);
    let curSeg = 0;
    for (let k = 0; k < count; k++) {
      const target = k * delta;
      while (curSeg < len - 1 && segDists[curSeg + 1] < target) curSeg++;
      const d0 = segDists[curSeg];
      const d1 = curSeg === len - 1 ? totalP : segDists[curSeg + 1];
      const sLen = d1 - d0;
      const t = sLen > 1e-5 ? (target - d0) / sLen : 0;
      const nextIdx = (curSeg + 1) % len;
      const a3 = curSeg * 3;
      const b3 = nextIdx * 3;

      let px = pts3D[a3] + t * (pts3D[b3] - pts3D[a3]);
      let py = pts3D[a3 + 1] + t * (pts3D[b3 + 1] - pts3D[a3 + 1]);
      let pz = pts3D[a3 + 2] + t * (pts3D[b3 + 2] - pts3D[a3 + 2]);
      const pLen = Math.hypot(px, py, pz) || 1.0;
      px = (px / pLen) * R;
      py = (py / pLen) * R;
      pz = (pz / pLen) * R;

      let pLat = Math.asin(Math.max(-1.0, Math.min(1.0, py / R)));
      let pLon = Math.atan2(px, pz);

      // Micro-ajustement pour points côtiers effleurant la mer (val < 0.5)
      if (landValue(pLon, pLat, mask, maskW, maskH) < 0.5) {
        const cLon = center[0] * toRad;
        const cLat = center[1] * toRad;
        for (let s = 0; s < 8; s++) {
          pLon += (cLon - pLon) * 0.03;
          pLat += (cLat - pLat) * 0.03;
          if (landValue(pLon, pLat, mask, maskW, maskH) >= 0.5) break;
        }
        const cP = Math.cos(pLat);
        px = R * cP * Math.sin(pLon);
        py = R * Math.sin(pLat);
        pz = R * cP * Math.cos(pLon);
      }

      // Léger relief vectoriel (+0.025)
      const relief = 0.025;
      const outIdx = outStartIdx + k;
      const out3 = outIdx * 3;
      positions[out3] = px + (px / R) * relief;
      positions[out3 + 1] = py + (py / R) * relief;
      positions[out3 + 2] = pz + (pz / R) * relief;
      highlights[outIdx] = highlightVal;
      distances[outIdx] = Math.hypot(px - refX, py - refY, pz - refZ);
    }
  };

  // Frontière vectorielle Cameroun (code 1.0 = or ambré)
  sampleBorder(camRing, nCam, camCenter, nArc, 1.0, yX, yY, yZ);

  // Frontière vectorielle France Métropolitaine (code 2.0 = cyan / bleu)
  sampleBorder(fraRing, nFra, fraCenter, nArc + nCam, 2.0, lX, lY, lZ);

  // 5. Continents du Monde (Blue Noise naturel uniforme sans coloriage grossier)
  const aTerre = areaFrac * 4.0 * Math.PI * R * R;
  let rG = 0.65 * Math.sqrt(aTerre / Math.max(1, nGlob));

  const TABLE_SIZE = 65536;
  const head = new Int32Array(TABLE_SIZE).fill(-1);
  const next = new Int32Array(n);
  let cellSize = rG;
  let invCellSize = 1.0 / cellSize;
  const Rbox = 2.5;

  const addToGrid = (idx: number, px: number, py: number, pz: number): void => {
    const cx = Math.floor((px + Rbox) * invCellSize);
    const cy = Math.floor((py + Rbox) * invCellSize);
    const cz = Math.floor((pz + Rbox) * invCellSize);
    const h =
      (Math.imul(cx, 73856093) ^ Math.imul(cy, 19349663) ^ Math.imul(cz, 83492791)) &
      (TABLE_SIZE - 1);
    next[idx] = head[h];
    head[h] = idx;
  };

  const preCount = nArc + nCam + nFra;
  for (let i = 0; i < preCount; i++) {
    const i3 = i * 3;
    addToGrid(i, positions[i3], positions[i3 + 1], positions[i3 + 2]);
  }

  let globAccepted = 0;
  let attemptsSinceLastAccept = 0;

  while (globAccepted < nGlob) {
    attemptsSinceLastAccept++;
    if (attemptsSinceLastAccept > 2500) {
      rG *= 0.93;
      attemptsSinceLastAccept = 0;
      head.fill(-1);
      cellSize = rG;
      invCellSize = 1.0 / cellSize;
      const totalPoints = preCount + globAccepted;
      for (let i = 0; i < totalPoints; i++) {
        const i3 = i * 3;
        addToGrid(i, positions[i3], positions[i3 + 1], positions[i3 + 2]);
      }
    }

    const sLat = 2.0 * rand() - 1.0;
    const latRad = Math.asin(sLat);
    const lonRad = (2.0 * rand() - 1.0) * Math.PI;

    if (landValue(lonRad, latRad, mask, maskW, maskH) < 0.5) continue;

    const cosLat = Math.sqrt(Math.max(0.0, 1.0 - sLat * sLat));
    const candX = R * cosLat * Math.sin(lonRad);
    const candY = R * sLat;
    const candZ = R * cosLat * Math.cos(lonRad);

    const rGSq = rG * rG;
    const rBorderMarginSq = (0.6 * rG) * (0.6 * rG);

    const ccx = ((candX + Rbox) * invCellSize) | 0;
    const ccy = ((candY + Rbox) * invCellSize) | 0;
    const ccz = ((candZ + Rbox) * invCellSize) | 0;

    let tooClose = false;
    for (let dx = -1; dx <= 1 && !tooClose; dx++) {
      const hx = Math.imul(ccx + dx, 73856093);
      for (let dy = -1; dy <= 1 && !tooClose; dy++) {
        const hxy = hx ^ Math.imul(ccy + dy, 19349663);
        for (let dz = -1; dz <= 1 && !tooClose; dz++) {
          const h = (hxy ^ Math.imul(ccz + dz, 83492791)) & (TABLE_SIZE - 1);
          let pIdx = head[h];
          while (pIdx !== -1) {
            const p3 = pIdx * 3;
            const ex = positions[p3] - candX;
            const ey = positions[p3 + 1] - candY;
            const ez = positions[p3 + 2] - candZ;
            const d2 = ex * ex + ey * ey + ez * ez;
            const threshSq = pIdx < preCount ? rBorderMarginSq : rGSq;
            if (d2 < threshSq) {
              tooClose = true;
              break;
            }
            pIdx = next[pIdx];
          }
        }
      }
    }

    if (!tooClose) {
      const curIdx = preCount + globAccepted;
      const cur3 = curIdx * 3;
      positions[cur3] = candX;
      positions[cur3 + 1] = candY;
      positions[cur3 + 2] = candZ;
      highlights[curIdx] = 0.0;

      // Distance au foyer le plus proche (Yaoundé en Afrique vs Lille en Europe)
      const dY = Math.hypot(candX - yX, candY - yY, candZ - yZ);
      const dL = Math.hypot(candX - lX, candY - lY, candZ - lZ);
      distances[curIdx] = Math.min(dY, dL);

      addToGrid(curIdx, candX, candY, candZ);
      globAccepted++;
      attemptsSinceLastAccept = 0;
    }
  }

  // 6. Tri cylindrique unifié selon la clé universelle (y * 10.0 + atan2(z, x))
  const keys = new Float64Array(n);
  const indices = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const i3 = i * 3;
    keys[i] = positions[i3 + 1] * 10.0 + Math.atan2(positions[i3 + 2], positions[i3]);
    indices[i] = i;
  }

  indices.sort((a, b) => keys[a] - keys[b]);

  const sortedPositions = new Float32Array(n * 3);
  const sortedHighlights = new Float32Array(n);
  const sortedDistances = new Float32Array(n);

  for (let k = 0; k < n; k++) {
    const src = indices[k];
    const src3 = src * 3;
    const k3 = k * 3;
    sortedPositions[k3] = positions[src3];
    sortedPositions[k3 + 1] = positions[src3 + 1];
    sortedPositions[k3 + 2] = positions[src3 + 2];
    sortedHighlights[k] = highlights[src];
    sortedDistances[k] = distances[src];
  }

  return {
    positions: sortedPositions,
    highlights: sortedHighlights,
    distances: sortedDistances,
  };
}
