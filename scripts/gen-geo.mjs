import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { feature } from 'topojson-client';

const W = 2048, H = 1024;
const INCLUDE_ANTARCTICA = true;

// ---- Terres émergées : rasterisation scanline (pair-impair, gère les lacs) ----
const topo = JSON.parse(readFileSync('node_modules/world-atlas/land-50m.json', 'utf8'));
const fc = feature(topo, topo.objects.land);
const geoms = fc.type === 'FeatureCollection' ? fc.features.map(f => f.geometry) : [fc.geometry];
const polys = geoms.flatMap(g => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates));
const mask = new Uint8Array(W * H);
for (const poly of polys) {
  let maxLat = -90;
  for (const ring of poly) for (const [, lat] of ring) maxLat = Math.max(maxLat, lat);
  if (!INCLUDE_ANTARCTICA && maxLat < -60) continue;
  for (let y = 0; y < H; y++) {
    const lat = 90 - ((y + 0.5) * 180) / H;
    const xs = [];
    for (const ring of poly) for (let i = 0; i < ring.length - 1; i++) {
      const [x1, y1] = ring[i], [x2, y2] = ring[i + 1];
      if ((y1 <= lat && y2 > lat) || (y2 <= lat && y1 > lat)) xs.push(x1 + ((lat - y1) / (y2 - y1)) * (x2 - x1));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const a = Math.max(0, Math.ceil(((xs[k] + 180) / 360) * W - 0.5));
      const b = Math.min(W - 1, Math.floor(((xs[k + 1] + 180) / 360) * W - 0.5));
      for (let x = a; x <= b; x++) mask[y * W + x] = 1;
    }
  }
}
// RLE + fraction de terre pondérée par l'aire (cos lat)
let num = 0, den = 0; const rows = [];
for (let y = 0; y < H; y++) {
  const w = Math.cos(((90 - ((y + 0.5) * 180) / H) * Math.PI) / 180);
  const r = []; let count = 0;
  for (let x = 0; x < W; ) {
    if (!mask[y * W + x]) { x++; continue; }
    const s = x; while (x < W && mask[y * W + x]) x++;
    r.push(s, x - s); count += x - s;
  }
  rows.push(r); num += w * count; den += w * W;
}
const areaFrac = num / den;
console.log('fraction de terre (aire):', areaFrac.toFixed(3)); // attendu ~0.28-0.30 avec Antarctique

// ---- Cameroun : vraie frontière (Natural Earth admin-0) ----
const ctopo = JSON.parse(readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const cf = feature(ctopo, ctopo.objects.countries).features
  .find(f => f.properties?.name === 'Cameroon' || String(f.id) === '120');
if (!cf) throw new Error('Cameroun introuvable dans countries-50m');
const cpolys = cf.geometry.type === 'Polygon' ? [cf.geometry.coordinates] : cf.geometry.coordinates;
const ring = cpolys.map(p => p[0]).sort((a, b) => b.length - a.length)[0]
  .map(([lo, la]) => [Math.round(lo * 1e4) / 1e4, Math.round(la * 1e4) / 1e4]);
// centroïde planaire (le pays est petit) : aire signée
let A = 0, cx = 0, cy = 0;
for (let i = 0; i < ring.length - 1; i++) {
  const [x1, y1] = ring[i], [x2, y2] = ring[i + 1], c = x1 * y2 - x2 * y1;
  A += c; cx += (x1 + x2) * c; cy += (y1 + y2) * c;
}
A /= 2; cx /= 6 * A; cy /= 6 * A;
const lons = ring.map(p => p[0]), lats = ring.map(p => p[1]);
console.log('Cameroun : centroïde', cx.toFixed(2), cy.toFixed(2),
  '| lon', Math.min(...lons), Math.max(...lons), '| lat', Math.min(...lats), Math.max(...lats));

mkdirSync('src/lib', { recursive: true });
writeFileSync('src/lib/geoData.ts',
`export const LAND_W = ${W};
export const LAND_H = ${H};
export const LAND_AREA_FRAC = ${areaFrac.toFixed(5)};
export const LAND_RLE: number[][] = ${JSON.stringify(rows)};
export const CAMEROON_RING: [number, number][] = ${JSON.stringify(ring)}; // [lon, lat] en degrés, anneau fermé
export const CAMEROON_CENTER: [number, number] = [${cx.toFixed(4)}, ${cy.toFixed(4)}]; // [lon, lat]
export const YAOUNDE_LAT = 3.848; // Yaoundé capitale (lat)
export const YAOUNDE_LON = 11.502; // Yaoundé capitale (lon)
`);
