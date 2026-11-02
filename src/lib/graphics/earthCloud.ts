/**
 * earthCloud.ts - Générateur déterministe de nuage de points pour le globe terrestre (Forme 2)
 *
 * Spécifications :
 * - Géométrie mondiale réelle (Natural Earth 1:50m, tous les continents + Antarctique complet ~9-10% au sud de -60°)
 * - Frontière nationale officielle du Cameroun (Natural Earth admin-0, 350 sommets réels)
 * - N_cam = round(0.05 * N) : N_edge (40%) sur le contour régulier + N_in (60%) en Blue Noise intérieur
 * - Reste du monde : N_glob en Blue Noise sur grille spatiale 3D (27 cellules, zéro point en mer)
 * - Foyer de l'onde sortante à la capitale Yaoundé (3.848°N, 11.502°E)
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
 * Ray casting 2D pour vérifier si un point (lonDeg, latDeg) est dans le polygone du Cameroun.
 */
export function insideCameroon(
  lonDeg: number,
  latDeg: number,
  ring: [number, number][]
): boolean {
  let inside = false;
  const len = ring.length;
  for (let i = 0, j = len - 1; i < len; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > latDeg !== yj > latDeg &&
      lonDeg < ((xj - xi) * (latDeg - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Clé de tri cylindrique universelle (y * 10 + atan2(z, x))
 */
export function computeCylindricalKey(x: number, y: number, z: number): number {
  return y * 10.0 + Math.atan2(z, x);
}

/**
 * Générateur pur du nuage de points du globe terrestre (Forme 2).
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

  const rand = mulberry32(seed);
  const R = 2.05;

  // 1. Précalculs de l'anneau frontière 3D du Cameroun
  const ringLen = camRing.length;
  const cam3D = new Float32Array(ringLen * 3);
  let minCamLon = 180;
  let maxCamLon = -180;
  let minCamLat = 90;
  let maxCamLat = -90;

  for (let i = 0; i < ringLen; i++) {
    const lo = camRing[i][0];
    const la = camRing[i][1];
    if (lo < minCamLon) minCamLon = lo;
    if (lo > maxCamLon) maxCamLon = lo;
    if (la < minCamLat) minCamLat = la;
    if (la > maxCamLat) maxCamLat = la;

    const loRad = (lo * Math.PI) / 180.0;
    const laRad = (la * Math.PI) / 180.0;
    const cosLa = Math.cos(laRad);

    cam3D[i * 3] = R * cosLa * Math.sin(loRad);
    cam3D[i * 3 + 1] = R * Math.sin(laRad);
    cam3D[i * 3 + 2] = R * cosLa * Math.cos(loRad);
  }

  // Longueurs cumulées des segments pour échantillonnage régulier du contour
  const segLens = new Float32Array(ringLen - 1);
  let totalArcLen = 0;
  for (let i = 0; i < ringLen - 1; i++) {
    const i3 = i * 3;
    const next3 = (i + 1) * 3;
    const dx = cam3D[next3] - cam3D[i3];
    const dy = cam3D[next3 + 1] - cam3D[i3 + 1];
    const dz = cam3D[next3 + 2] - cam3D[i3 + 2];
    const len = Math.hypot(dx, dy, dz);
    segLens[i] = len;
    totalArcLen += len;
  }

  // Calcul numérique de l'aire du Cameroun sur la sphère R
  let aCam = 0;
  for (let i = 0; i < ringLen - 1; i++) {
    const lo1Rad = (camRing[i][0] * Math.PI) / 180.0;
    const la1Rad = (camRing[i][1] * Math.PI) / 180.0;
    const lo2Rad = (camRing[i + 1][0] * Math.PI) / 180.0;
    const la2Rad = (camRing[i + 1][1] * Math.PI) / 180.0;
    aCam += (lo2Rad - lo1Rad) * Math.sin((la1Rad + la2Rad) * 0.5);
  }
  aCam = Math.abs(aCam) * R * R;

  // Calcul de la distance 3D minimale d'un point à la frontière
  const distToBorder = (px: number, py: number, pz: number): number => {
    let minD = 9999.0;
    for (let i = 0; i < ringLen - 1; i++) {
      const i3 = i * 3;
      const next3 = (i + 1) * 3;
      const ax = cam3D[i3];
      const ay = cam3D[i3 + 1];
      const az = cam3D[i3 + 2];
      const bx = cam3D[next3];
      const by = cam3D[next3 + 1];
      const bz = cam3D[next3 + 2];

      const vx = bx - ax;
      const vy = by - ay;
      const vz = bz - az;

      const wx = px - ax;
      const wy = py - ay;
      const wz = pz - az;

      const c1 = wx * vx + wy * vy + wz * vz;
      const c2 = vx * vx + vy * vy + vz * vz;

      let t = 0.0;
      if (c1 <= 0.0) {
        t = 0.0;
      } else if (c2 <= c1) {
        t = 1.0;
      } else {
        t = c1 / c2;
      }

      const qx = ax + t * vx;
      const qy = ay + t * vy;
      const qz = az + t * vz;

      const d = Math.hypot(px - qx, py - qy, pz - qz);
      if (d < minD) {
        minD = d;
      }
    }
    return minD;
  };

  // 2. Budget de points
  const nCam = Math.round(0.05 * n);
  const nEdge = Math.round(0.40 * nCam);
  const nIn = nCam - nEdge;
  const nGlob = n - nCam;

  const positions = new Float32Array(n * 3);
  const highlights = new Float32Array(n);
  const distances = new Float32Array(n);

  // 3. Contour du Cameroun : N_edge points réguliers le long du périmètre
  const edgeSpacing = totalArcLen / nEdge;
  let segIdx = 0;
  let accArc = 0;

  for (let k = 0; k < nEdge; k++) {
    const targetArc = (k + 0.5) * edgeSpacing;
    const jitter = (rand() * 2.0 - 1.0) * (0.1 * edgeSpacing);
    const s = (targetArc + jitter + totalArcLen) % totalArcLen;

    while (segIdx < ringLen - 2 && accArc + segLens[segIdx] < s) {
      accArc += segLens[segIdx];
      segIdx++;
    }
    while (segIdx > 0 && accArc > s) {
      segIdx--;
      accArc -= segLens[segIdx];
    }

    const segL = segLens[segIdx] || 1.0;
    const t = Math.max(0.0, Math.min(1.0, (s - accArc) / segL));

    const i3 = segIdx * 3;
    const next3 = (i3 + 3);
    const ax = cam3D[i3];
    const ay = cam3D[i3 + 1];
    const az = cam3D[i3 + 2];
    const bx = cam3D[next3];
    const by = cam3D[next3 + 1];
    const bz = cam3D[next3 + 2];

    let px = ax + t * (bx - ax);
    let py = ay + t * (by - ay);
    let pz = az + t * (bz - az);

    const pLen = Math.hypot(px, py, pz) || 1.0;
    px = (px / pLen) * R;
    py = (py / pLen) * R;
    pz = (pz / pLen) * R;

    let pLat = Math.asin(Math.max(-1.0, Math.min(1.0, py / R)));
    let pLon = Math.atan2(px, pz);

    // Micro-ajustement pour points côtiers effleurant la mer (val < 0.5)
    if (landValue(pLon, pLat, mask, maskW, maskH) < 0.5) {
      const cLonRad = (camCenter[0] * Math.PI) / 180.0;
      const cLatRad = (camCenter[1] * Math.PI) / 180.0;
      for (let step = 0; step < 8; step++) {
        pLon += (cLonRad - pLon) * 0.03;
        pLat += (cLatRad - pLat) * 0.03;
        if (landValue(pLon, pLat, mask, maskW, maskH) >= 0.5) break;
      }
      const cosP = Math.cos(pLat);
      px = R * cosP * Math.sin(pLon);
      py = R * Math.sin(pLat);
      pz = R * cosP * Math.cos(pLon);
    }

    const k3 = k * 3;
    positions[k3] = px;
    positions[k3 + 1] = py;
    positions[k3 + 2] = pz;
    highlights[k] = 1.0;
  }

  // 4. Intérieur du Cameroun : N_in points Blue Noise
  let rCam = 0.70 * Math.sqrt(aCam / Math.max(1, nIn));
  let inAccepted = 0;
  let inAttempts = 0;

  const minLatRad = (minCamLat * Math.PI) / 180.0;
  const maxLatRad = (maxCamLat * Math.PI) / 180.0;
  const sinMin = Math.sin(minLatRad);
  const sinMax = Math.sin(maxLatRad);
  const minLonRad = (minCamLon * Math.PI) / 180.0;
  const maxLonRad = (maxCamLon * Math.PI) / 180.0;

  while (inAccepted < nIn) {
    inAttempts++;
    if (inAttempts > 400) {
      rCam *= 0.90;
      inAttempts = 0;
    }
    const sLat = sinMin + rand() * (sinMax - sinMin);
    const latRad = Math.asin(sLat);
    const lonRad = minLonRad + rand() * (maxLonRad - minLonRad);
    const latDeg = (latRad * 180.0) / Math.PI;
    const lonDeg = (lonRad * 180.0) / Math.PI;

    if (!insideCameroon(lonDeg, latDeg, camRing)) {
      continue;
    }
    if (landValue(lonRad, latRad, mask, maskW, maskH) < 0.5) {
      continue;
    }

    const cosLat = Math.cos(latRad);
    const px = R * cosLat * Math.sin(lonRad);
    const py = R * Math.sin(latRad);
    const pz = R * cosLat * Math.cos(lonRad);

    let tooClose = false;
    const rCamSq = rCam * rCam;
    const totalCurrentCam = nEdge + inAccepted;

    for (let c = 0; c < totalCurrentCam; c++) {
      const c3 = c * 3;
      const dx = px - positions[c3];
      const dy = py - positions[c3 + 1];
      const dz = pz - positions[c3 + 2];
      if (dx * dx + dy * dy + dz * dz < rCamSq) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      const curIdx = nEdge + inAccepted;
      const cur3 = curIdx * 3;
      positions[cur3] = px;
      positions[cur3 + 1] = py;
      positions[cur3 + 2] = pz;
      highlights[curIdx] = 1.0;
      inAccepted++;
    }
  }

  // 5. Reste du monde : N_glob points en Blue Noise sur grille spatiale 3D
  const aTerre = areaFrac * 4.0 * Math.PI * R * R - aCam;
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

  // Insertion préalable de tous les points du Cameroun dans la grille
  for (let i = 0; i < nCam; i++) {
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
      const totalPoints = nCam + globAccepted;
      for (let i = 0; i < totalPoints; i++) {
        const i3 = i * 3;
        addToGrid(i, positions[i3], positions[i3 + 1], positions[i3 + 2]);
      }
    }

    const sLat = 2.0 * rand() - 1.0;
    const latRad = Math.asin(sLat);
    const lonRad = (2.0 * rand() - 1.0) * Math.PI;

    if (landValue(lonRad, latRad, mask, maskW, maskH) < 0.5) {
      continue;
    }

    const latDeg = (latRad * 180.0) / Math.PI;
    const lonDeg = (lonRad * 180.0) / Math.PI;

    if (insideCameroon(lonDeg, latDeg, camRing)) {
      continue;
    }

    const cosLat = Math.sqrt(Math.max(0.0, 1.0 - sLat * sLat));
    const candX = R * cosLat * Math.sin(lonRad);
    const candY = R * sLat;
    const candZ = R * cosLat * Math.cos(lonRad);

    const rGSq = rG * rG;
    const rCamMarginSq = (0.6 * rG) * (0.6 * rG);

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
            const threshSq = pIdx < nCam ? rCamMarginSq : rGSq;
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
      const curIdx = nCam + globAccepted;
      const cur3 = curIdx * 3;
      positions[cur3] = candX;
      positions[cur3 + 1] = candY;
      positions[cur3 + 2] = candZ;

      // Atténuation gaussienne douce pour les pays limitrophes (< 0.35)
      if (
        lonDeg >= minCamLon - 10.0 &&
        lonDeg <= maxCamLon + 10.0 &&
        latDeg >= minCamLat - 10.0 &&
        latDeg <= maxCamLat + 10.0
      ) {
        const dB = distToBorder(candX, candY, candZ);
        highlights[curIdx] =
          dB < 0.35 ? Math.exp(-Math.pow(dB / 0.10, 2.0)) : 0.0;
      } else {
        highlights[curIdx] = 0.0;
      }

      addToGrid(curIdx, candX, candY, candZ);
      globAccepted++;
      attemptsSinceLastAccept = 0;
    }
  }

  // 6. Foyer de Yaoundé (onde) & Relief radial pur (ZÉRO distorsion tangentielle)
  const yLatRad = (yaoundeLat * Math.PI) / 180.0;
  const yLonRad = (yaoundeLon * Math.PI) / 180.0;
  const yCosLat = Math.cos(yLatRad);
  const yX = R * yCosLat * Math.sin(yLonRad);
  const yY = R * Math.sin(yLatRad);
  const yZ = R * yCosLat * Math.cos(yLonRad);

  for (let i = 0; i < n; i++) {
    const i3 = i * 3;
    const px = positions[i3];
    const py = positions[i3 + 1];
    const pz = positions[i3 + 2];

    // Distance 3D euclidienne à Yaoundé
    distances[i] = Math.hypot(px - yX, py - yY, pz - yZ);

    // Relief radial uniquement (+ highlight * 0.04)
    const h = highlights[i];
    if (h > 0.0) {
      const pLen = Math.hypot(px, py, pz) || 1.0;
      const relief = h * 0.04;
      positions[i3] = px + (px / pLen) * relief;
      positions[i3 + 1] = py + (py / pLen) * relief;
      positions[i3 + 2] = pz + (pz / pLen) * relief;
    }
  }

  // 7. Tri cylindrique unifié selon la clé universelle (y * 10.0 + atan2(z, x))
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
