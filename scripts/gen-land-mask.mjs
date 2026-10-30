import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { feature } from 'topojson-client';

const W = 1024, H = 512;
const topo = JSON.parse(readFileSync('node_modules/world-atlas/land-50m.json', 'utf8'));
const fc = feature(topo, topo.objects.land);
const geoms = fc.type === 'FeatureCollection' ? fc.features.map(f => f.geometry) : [fc.geometry];
const polys = geoms.flatMap(g => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates));

/**
 * Découpe propre des anneaux qui traversent l'antiméridien (±180°),
 * éliminant tout artefact de ligne traversante sur l'océan Pacifique / Arctique.
 */
function splitRingAtAntimeridian(ring) {
  let hasJump = false;
  for (let i = 0; i < ring.length - 1; i++) {
    if (Math.abs(ring[i][0] - ring[i + 1][0]) > 180) {
      hasJump = true;
      break;
    }
  }
  if (!hasJump) return [ring];

  const paths = [];
  let currentPath = [ring[0]];

  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i], p2 = ring[i + 1];
    if (Math.abs(p1[0] - p2[0]) > 180) {
      if (p2[0] > p1[0]) {
        // De négatif vers positif : traverse -180
        const dist = 360 - (p2[0] - p1[0]);
        const t = (p1[0] + 180) / dist;
        const yCross = p1[1] + t * (p2[1] - p1[1]);
        currentPath.push([-180, yCross]);
        paths.push({ side: -1, points: currentPath });
        currentPath = [[180, yCross], p2];
      } else {
        // De positif vers négatif : traverse +180
        const dist = 360 - (p1[0] - p2[0]);
        const t = (180 - p1[0]) / dist;
        const yCross = p1[1] + t * (p2[1] - p1[1]);
        currentPath.push([180, yCross]);
        paths.push({ side: 1, points: currentPath });
        currentPath = [[-180, yCross], p2];
      }
    } else {
      currentPath.push(p2);
    }
  }

  paths.push({
    side: currentPath[currentPath.length - 1][0] >= 0 ? 1 : -1,
    points: currentPath,
  });

  const negPaths = paths.filter(p => p.side === -1);
  const posPaths = paths.filter(p => p.side === 1);
  const result = [];

  if (negPaths.length > 0) {
    const pts = [];
    for (const p of negPaths) pts.push(...p.points);
    if (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1]) {
      pts.push(pts[0]);
    }
    result.push(pts);
  }

  if (posPaths.length > 0) {
    const pts = [];
    for (const p of posPaths) pts.push(...p.points);
    if (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1]) {
      pts.push(pts[0]);
    }
    result.push(pts);
  }

  return result;
}

const splitPolys = [];
for (const poly of polys) {
  let maxLat = -90;
  for (const ring of poly) {
    for (const [, lat] of ring) maxLat = Math.max(maxLat, lat);
  }
  if (maxLat < -60) continue; // exclut l'Antarctique

  const rings = [];
  for (const ring of poly) {
    const sr = splitRingAtAntimeridian(ring);
    for (const r of sr) rings.push(r);
  }
  splitPolys.push(rings);
}

const mask = new Uint8Array(W * H);
for (const poly of splitPolys) {
  for (let y = 0; y < H; y++) {
    const lat = 90 - ((y + 0.5) * 180) / H;
    const xs = [];
    for (const ring of poly) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [x1, y1] = ring[i], [x2, y2] = ring[i + 1];
        if ((y1 <= lat && y2 > lat) || (y2 <= lat && y1 > lat)) {
          xs.push(x1 + ((lat - y1) / (y2 - y1)) * (x2 - x1));
        }
      }
    }
    xs.sort((a, b) => a - b); // pair-impair : gère les lacs (trous)
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const a = Math.max(0, Math.ceil(((xs[k] + 180) / 360) * W - 0.5));
      const b = Math.min(W - 1, Math.floor(((xs[k + 1] + 180) / 360) * W - 0.5));
      for (let x = a; x <= b; x++) mask[y * W + x] = 1;
    }
  }
}

// Fraction de terre PONDÉRÉE PAR L'AIRE (cos(lat)), et non par pixels
let num = 0, den = 0;
const rows = [];
for (let y = 0; y < H; y++) {
  const w = Math.cos(((90 - ((y + 0.5) * 180) / H) * Math.PI) / 180);
  const r = [];
  let count = 0;
  for (let x = 0; x < W; ) {
    if (!mask[y * W + x]) { x++; continue; }
    const s = x; while (x < W && mask[y * W + x]) x++;
    r.push(s, x - s); count += x - s;
  }
  rows.push(r); num += w * count; den += w * W;
}
const areaFrac = num / den;
console.log('fraction de terre (aire) :', areaFrac.toFixed(5)); // attendu ~0.23 à 0.27 sans Antarctique

mkdirSync('src/lib', { recursive: true });
mkdirSync('src/lib/graphics', { recursive: true });

const content = `export const LAND_W = ${W};
export const LAND_H = ${H};
export const LAND_AREA_FRAC = ${areaFrac.toFixed(5)};
export const LAND_RLE: number[][] = ${JSON.stringify(rows)};
`;

writeFileSync('src/lib/graphics/landMask.ts', content);
writeFileSync('src/lib/landMask.ts', `export * from './graphics/landMask';\n`);
console.log('Fichiers landMask.ts générés avec succès sans artefacts antiméridien.');
