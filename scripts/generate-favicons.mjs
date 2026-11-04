import fs from 'node:fs';
import path from 'node:path';

// ─── 1. Native SVG Favicon (32x32) ─────────────────────────
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none">
  <!-- Obsidian container badge for high-contrast visibility on all browser tab backgrounds -->
  <rect width="32" height="32" rx="7" fill="#050505" />
  
  <!-- Concept 1: The Feedback Core / Closed-Loop PID Control -->
  <g transform="translate(4, 4)" stroke="#00D2FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <!-- Setpoint Reference Vector -->
    <path d="M2 12h7" />
    <!-- Controlled Output Vector -->
    <path d="M15 12h7" />
    <!-- Feedforward Direct Transfer Arc -->
    <path d="M5 12a7 7 0 0 1 14 0" />
    <path d="m17 10 2 2 2-2" />
    <!-- Feedback Return Loop Arc -->
    <path d="M19 12a7 7 0 0 1-14 0" />
    <path d="m3 14 2-2 2 2" />
  </g>
  <!-- Central Feedback Core Nucleus (High-contrast pure white) -->
  <circle cx="16" cy="16" r="3.2" stroke="#FFFFFF" stroke-width="2" />
</svg>
`;

fs.writeFileSync(path.resolve('src/app/icon.svg'), svgContent, 'utf-8');
fs.writeFileSync(path.resolve('public/icon.svg'), svgContent, 'utf-8');
console.log('✓ Wrote src/app/icon.svg & public/icon.svg');

// ─── 2. Multi-layer High-Precision 32x32 ICO Generator ─────
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function samplePoint(x, y) {
  // Rounded rectangle check for 32x32 with rx=7
  const qx = Math.max(0, Math.max(7 - x, x - 24));
  const qy = Math.max(0, Math.max(7 - y, y - 24));
  if (Math.hypot(qx, qy) > 7.2) {
    return [0, 0, 0, 0]; // Transparent
  }

  // Base background: Obsidian #050505
  let r = 5, g = 5, b = 5, a = 255;

  // Geometry coordinates:
  // Center is (15.5, 15.5) or 16
  const cx = 15.5;
  const cy = 15.5;

  // 1. Central Core circle: radius 3.5, strokeWidth 2
  const dCenter = Math.hypot(x - cx, y - cy);
  const dCircle = Math.abs(dCenter - 3.5);
  if (dCircle <= 1.0) {
    return [255, 255, 255, 255]; // White Core
  }

  // 2. Horizontal Vectors (Cyan #00D2FF: [0, 210, 255])
  // Input: (5.5, 15.5) to (12.0, 15.5)
  // Output: (19.0, 15.5) to (25.5, 15.5)
  if (distToSegment(x, y, 5.5, cy, 12.0, cy) <= 1.0 || distToSegment(x, y, 19.0, cy, 25.5, cy) <= 1.0) {
    return [0, 210, 255, 255];
  }

  // 3. Upper Arc (y <= cy) radius 7.5
  if (y <= cy + 0.5) {
    const dArc = Math.abs(dCenter - 7.5);
    if (dArc <= 1.0 && x >= 7.5 && x <= 23.5) {
      return [0, 210, 255, 255];
    }
  }

  // 4. Upper Arrow: from (21, 13.5) to (23, 15.5) and (25, 13.5) to (23, 15.5)
  if (distToSegment(x, y, 20.5, 13.5, 23.0, 15.5) <= 1.0 || distToSegment(x, y, 25.5, 13.5, 23.0, 15.5) <= 1.0) {
    return [0, 210, 255, 255];
  }

  // 5. Lower Arc (y >= cy) radius 7.5
  if (y >= cy - 0.5) {
    const dArc = Math.abs(dCenter - 7.5);
    if (dArc <= 1.0 && x >= 7.5 && x <= 23.5) {
      return [0, 210, 255, 255];
    }
  }

  // 6. Lower Arrow: from (6.0, 17.5) to (8.0, 15.5) and (10.0, 17.5) to (8.0, 15.5)
  if (distToSegment(x, y, 5.5, 17.5, 8.0, 15.5) <= 1.0 || distToSegment(x, y, 10.5, 17.5, 8.0, 15.5) <= 1.0) {
    return [0, 210, 255, 255];
  }

  return [r, g, b, a];
}

// 4x Supersampling for clean anti-aliasing
const WIDTH = 32;
const HEIGHT = 32;
const SUB = 4;
const pixels = new Uint8Array(WIDTH * HEIGHT * 4);

for (let py = 0; py < HEIGHT; py++) {
  for (let px = 0; px < WIDTH; px++) {
    let totR = 0, totG = 0, totB = 0, totA = 0;
    for (let sy = 0; sy < SUB; sy++) {
      for (let sx = 0; sx < SUB; sx++) {
        const x = px + (sx + 0.5) / SUB;
        const y = py + (sy + 0.5) / SUB;
        const [r, g, b, a] = samplePoint(x, y);
        totR += r * (a / 255);
        totG += g * (a / 255);
        totB += b * (a / 255);
        totA += a;
      }
    }
    const samples = SUB * SUB;
    const finalA = totA / samples;
    const finalR = finalA > 0 ? (totR / samples) / (finalA / 255) : 0;
    const finalG = finalA > 0 ? (totG / samples) / (finalA / 255) : 0;
    const finalB = finalA > 0 ? (totB / samples) / (finalA / 255) : 0;

    const idx = (py * WIDTH + px) * 4;
    pixels[idx] = Math.round(finalR);
    pixels[idx + 1] = Math.round(finalG);
    pixels[idx + 2] = Math.round(finalB);
    pixels[idx + 3] = Math.round(finalA);
  }
}

// Construct Windows BMP DIB ICO format (4286 bytes)
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // Reserved
header.writeUInt16LE(1, 2); // Type 1 = Icon
header.writeUInt16LE(1, 4); // 1 Image
header.writeUInt8(WIDTH, 6); // Width 32
header.writeUInt8(HEIGHT, 7); // Height 32
header.writeUInt8(0, 8); // Color Palette
header.writeUInt8(0, 9); // Reserved
header.writeUInt16LE(1, 10); // Color Planes
header.writeUInt16LE(32, 12); // Bits per Pixel
header.writeUInt32LE(4264, 14); // Image data size (40 DIB + 4096 pixels + 128 mask)
header.writeUInt32LE(22, 18); // Offset to image data

const dibHeader = Buffer.alloc(40);
dibHeader.writeUInt32LE(40, 0); // Header size
dibHeader.writeInt32LE(WIDTH, 4); // Width
dibHeader.writeInt32LE(HEIGHT * 2, 8); // Height * 2 (BMP convention in ICO)
dibHeader.writeUInt16LE(1, 12); // Planes
dibHeader.writeUInt16LE(32, 14); // 32 bpp
dibHeader.writeUInt32LE(0, 16); // BI_RGB (no compression)
dibHeader.writeUInt32LE(4224, 20); // Image size (4096 + 128)
dibHeader.writeInt32LE(0, 24); // XPelsPerMeter
dibHeader.writeInt32LE(0, 28); // YPelsPerMeter
dibHeader.writeUInt32LE(0, 32); // ColorsUsed
dibHeader.writeUInt32LE(0, 36); // ColorsImportant

// DIB pixels (stored bottom-to-top, BGRA)
const dibPixels = Buffer.alloc(WIDTH * HEIGHT * 4);
for (let y = 0; y < HEIGHT; y++) {
  const srcY = HEIGHT - 1 - y; // Bottom-to-top
  for (let x = 0; x < WIDTH; x++) {
    const srcIdx = (srcY * WIDTH + x) * 4;
    const dstIdx = (y * WIDTH + x) * 4;
    dibPixels[dstIdx] = pixels[srcIdx + 2];     // B
    dibPixels[dstIdx + 1] = pixels[srcIdx + 1]; // G
    dibPixels[dstIdx + 2] = pixels[srcIdx];     // R
    dibPixels[dstIdx + 3] = pixels[srcIdx + 3]; // A
  }
}

// 1-bit AND mask (32 rows * 4 bytes = 128 bytes, all 0)
const andMask = Buffer.alloc(128, 0);

const icoBuffer = Buffer.concat([header, dibHeader, dibPixels, andMask]);
fs.writeFileSync(path.resolve('src/app/favicon.ico'), icoBuffer);
fs.writeFileSync(path.resolve('public/favicon.ico'), icoBuffer);
console.log('✓ Wrote src/app/favicon.ico & public/favicon.ico (' + icoBuffer.length + ' bytes)');
