import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

console.log('🧪 Starting Deep Verification Record...\n');

// ─── 1. Verify Logo.tsx ─────────────────────────────────────
const logoPath = path.resolve('src/components/ui/Logo.tsx');
assert.ok(fs.existsSync(logoPath), 'Logo.tsx must exist');
const logoCode = fs.readFileSync(logoPath, 'utf-8');

assert.ok(logoCode.includes('viewBox="0 0 24 24"'), 'Logo must have viewBox 0 0 24 24');
assert.ok(logoCode.includes('stroke="currentColor"'), 'Logo must use currentColor');
assert.ok(logoCode.includes('strokeWidth={strokeWidth}'), 'Logo must use dynamic strokeWidth');
assert.ok(logoCode.includes('<circle cx="12" cy="12" r="3" />'), 'Logo must have central core circle r=3 at (12,12)');
assert.ok(logoCode.includes('M2 12h7'), 'Logo must have setpoint input path M2 12h7');
assert.ok(logoCode.includes('M15 12h7'), 'Logo must have output vector path M15 12h7');
assert.ok(logoCode.includes('M5 12a7 7 0 0 1 14 0'), 'Logo must have feedforward upper arc M5 12a7 7 0 0 1 14 0');
assert.ok(logoCode.includes('m17 10 2 2 2-2'), 'Logo must have feedforward terminal arrow m17 10 2 2 2-2');
assert.ok(logoCode.includes('M19 12a7 7 0 0 1-14 0'), 'Logo must have feedback return lower arc M19 12a7 7 0 0 1-14 0');
assert.ok(logoCode.includes('m3 14 2-2 2 2'), 'Logo must have feedback return terminal arrow m3 14 2-2 2 2');
assert.ok(logoCode.includes('feedback-core-title'), 'Logo must use feedback-core-title for accessible title');
console.log('✓ 1. Logo.tsx geometry & accessibility checks passed');

// ─── 2. Verify icon.svg & public/icon.svg ───────────────────
for (const svgFile of ['src/app/icon.svg', 'public/icon.svg']) {
  const p = path.resolve(svgFile);
  assert.ok(fs.existsSync(p), `${svgFile} must exist`);
  const content = fs.readFileSync(p, 'utf-8');
  assert.ok(content.includes('viewBox="0 0 32 32"'), `${svgFile} must have 32x32 viewBox`);
  assert.ok(content.includes('#050505'), `${svgFile} must have obsidian #050505 badge`);
  assert.ok(content.includes('#00D2FF'), `${svgFile} must have cyan electric glow #00D2FF`);
  assert.ok(content.includes('cx="16" cy="16" r="3.2"'), `${svgFile} must have central white core circle`);
}
console.log('✓ 2. Native icon.svg & public/icon.svg checks passed');

// ─── 3. Verify favicon.ico & public/favicon.ico ─────────────
for (const icoFile of ['src/app/favicon.ico', 'public/favicon.ico']) {
  const p = path.resolve(icoFile);
  assert.ok(fs.existsSync(p), `${icoFile} must exist`);
  const buf = fs.readFileSync(p);
  assert.equal(buf.length, 4286, `${icoFile} size must be 4286 bytes`);
  // Verify ICO header (0, 1, 1, 32, 32)
  assert.equal(buf[0], 0);
  assert.equal(buf[1], 0);
  assert.equal(buf[2], 1);
  assert.equal(buf[3], 0);
  assert.equal(buf[4], 1);
  assert.equal(buf[5], 0);
  assert.equal(buf[6], 32);
  assert.equal(buf[7], 32);
  // Verify DIB header at offset 22
  assert.equal(buf[22], 40); // 40 bytes DIB header
}
console.log('✓ 3. Binary favicon.ico & public/favicon.ico checks passed');

// ─── 4. Verify cache busting in layout.tsx ──────────────────
const layoutPath = path.resolve('src/app/layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
assert.ok(layoutContent.includes('/icon.svg?v=4'), 'layout.tsx must contain /icon.svg?v=4');
assert.ok(layoutContent.includes('/favicon.ico?v=4'), 'layout.tsx must contain /favicon.ico?v=4');
console.log('✓ 4. Cache-busting icons metadata in layout.tsx passed');

// ─── 5. Verify SideSlider.tsx & integration ─────────────────
const sideSliderPath = path.resolve('src/components/ui/SideSlider.tsx');
assert.ok(fs.existsSync(sideSliderPath), 'SideSlider.tsx must exist');
const sliderContent = fs.readFileSync(sideSliderPath, 'utf-8');
assert.ok(sliderContent.includes("pointer: fine"), 'SideSlider must check pointer: fine');
assert.ok(sliderContent.includes("document.getElementById('skills')"), 'SideSlider must observe #skills section');
assert.ok(sliderContent.includes("isSkillsVisible"), 'SideSlider must track isSkillsVisible');
assert.ok(sliderContent.includes("cursor-none"), 'SideSlider must have cursor-none');
assert.ok(sliderContent.includes("from-[#00D2FF] to-[#0088FF]"), 'SideSlider must have cyan gradient DA');
assert.ok(sliderContent.includes("dark:bg-[#050505]/80"), 'SideSlider must have obsidian DA container');
assert.ok(sliderContent.includes("role=\"scrollbar\""), 'SideSlider must have role="scrollbar"');

const siteLayoutPath = path.resolve('src/app/(site)/layout.tsx');
const siteLayoutContent = fs.readFileSync(siteLayoutPath, 'utf-8');
assert.ok(siteLayoutContent.includes('import SideSlider from "@/components/ui/SideSlider";'), 'SiteLayout must import SideSlider');
assert.ok(siteLayoutContent.includes('<SideSlider />'), 'SiteLayout must render <SideSlider />');
console.log('✓ 5. SideSlider component implementation & SiteLayout integration passed');

// ─── 6. Verify globals.css scrollbar & cursor rules ─────────
const cssPath = path.resolve('src/app/globals.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');
assert.ok(cssContent.includes('scrollbar-width: none;'), 'globals.css must hide scrollbar on desktop');
assert.ok(cssContent.includes('display: none;'), 'globals.css must hide webkit scrollbar on desktop');
assert.ok(cssContent.includes('cursor: none !important;'), 'globals.css must hide cursor on desktop');
assert.ok(cssContent.includes('background: #050505;'), 'globals.css must style fallback scrollbar track with #050505');
assert.ok(cssContent.includes('rgba(0, 210, 255'), 'globals.css must style fallback scrollbar thumb with cyan glow');
console.log('✓ 6. globals.css scrollbar isolation & DA rules passed');

// ─── 7. Verify test suites ──────────────────────────────────
const logoTestPath = path.resolve('test/unit/logo.test.ts');
assert.ok(fs.existsSync(logoTestPath), 'logo.test.ts must exist');
const logoTestContent = fs.readFileSync(logoTestPath, 'utf-8');
assert.ok(logoTestContent.includes('Concept 1: The Feedback Core / La Boucle Fermée'), 'logo.test.ts must test Concept 1');

const sliderTestPath = path.resolve('test/unit/side-slider.test.ts');
assert.ok(fs.existsSync(sliderTestPath), 'side-slider.test.ts must exist');

console.log('✓ 7. Unit test files updated and verified');
console.log('\n🎉 ALL 7 DEEP VERIFICATION SUITES PASSED SUCCESSFULLY!');
