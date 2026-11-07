import fs from 'node:fs';
import path from 'node:path';

// ─── 1. Native SVG Favicon (32x32) — The Isometric EN Monolith ─────────
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none">
  <defs>
    <radialGradient id="obsidianGlow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#0A1926" />
      <stop offset="100%" stop-color="#050505" />
    </radialGradient>
    <linearGradient id="rimHighlight" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00D2FF" stop-opacity="0.45" />
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#00D2FF" stop-opacity="0.25" />
    </linearGradient>
  </defs>
  <!-- Obsidian squircle badge with specular rim for high-contrast visibility on dark and light browser tabs -->
  <rect width="32" height="32" rx="7" fill="url(#obsidianGlow)" />
  <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" stroke="url(#rimHighlight)" stroke-width="1" />

  <!-- The Isometric EN Monolith / Le Prisme Architectural EN -->
  <g transform="translate(3.2, 3.2) scale(1.0667)" stroke-linecap="round" stroke-linejoin="round">
    <!-- Left Isometric Face (E) in Electric Cyan #00D2FF -->
    <path d="M12 2.5L3.5 7v10L12 21.5" stroke="#00D2FF" stroke-width="2.3" />
    <path d="M3.5 7L12 11.5" stroke="#00D2FF" stroke-width="2.3" />
    <path d="M3.5 12L9 15" stroke="#00D2FF" stroke-width="2.3" />
    <!-- Right Isometric Face (N) in Pure White #FFFFFF -->
    <path d="M12 2.5L20.5 7" stroke="#FFFFFF" stroke-width="2.3" />
    <path d="M12 21.5v-10L20.5 17V7" stroke="#FFFFFF" stroke-width="2.3" />
  </g>
</svg>
`;

fs.writeFileSync(path.resolve('src/app/icon.svg'), svgContent, 'utf-8');
fs.writeFileSync(path.resolve('public/icon.svg'), svgContent, 'utf-8');
console.log('✓ Wrote src/app/icon.svg & public/icon.svg (The Isometric EN Monolith)');
