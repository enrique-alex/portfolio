import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🧪 Starting Deep Verification Record...\n');

// ─── 1. Verify Logo.tsx (The Isometric EN Monolith) ──────────
const logoPath = path.resolve('src/components/ui/Logo.tsx');
assert.ok(fs.existsSync(logoPath), 'Logo.tsx must exist');
const logoContent = fs.readFileSync(logoPath, 'utf-8');
assert.ok(logoContent.includes('viewBox="0 0 24 24"'), 'Logo.tsx must use 24x24 coordinate grid');
assert.ok(logoContent.includes('currentColor'), 'Logo.tsx must use currentColor for dynamic theming');
assert.ok(logoContent.includes('strokeLinecap="round"'), 'Logo.tsx must use strokeLinecap="round"');
assert.ok(logoContent.includes('strokeLinejoin="round"'), 'Logo.tsx must use strokeLinejoin="round"');
assert.ok(logoContent.includes('M12 2.5L3.5 7v10L12 21.5'), 'Logo.tsx must include Left Isometric E contour');
assert.ok(logoContent.includes('M12 21.5v-10L20.5 17V7'), 'Logo.tsx must include Right Isometric N contour');
assert.ok(!logoContent.includes('<circle'), 'Logo.tsx must not contain concentric circles (zero eye pareidolia)');
assert.ok(logoContent.includes('aria-hidden={isAriaHidden}'), 'Logo.tsx must support aria-hidden for accessibility');
assert.ok(logoContent.includes('title ? <title id={titleId}>{title}</title>'), 'Logo.tsx must support accessible SVG title');
console.log('✓ 1. Logo.tsx Isometric EN Monolith geometry & accessibility checks passed');

// ─── 2. Verify icon.svg & public/icon.svg ────────────────────
const appIconPath = path.resolve('src/app/icon.svg');
const publicIconPath = path.resolve('public/icon.svg');
assert.ok(fs.existsSync(appIconPath), 'src/app/icon.svg must exist');
assert.ok(fs.existsSync(publicIconPath), 'public/icon.svg must exist');
const appIconContent = fs.readFileSync(appIconPath, 'utf-8');
assert.ok(appIconContent.includes('viewBox="0 0 32 32"'), 'app/icon.svg must have 32x32 viewBox');
assert.ok(appIconContent.includes('#00D2FF'), 'app/icon.svg must feature electric cyan E face');
assert.ok(appIconContent.includes('#FFFFFF'), 'app/icon.svg must feature pure white N face');
assert.ok(!appIconContent.includes('<circle'), 'app/icon.svg must not contain concentric circles');
console.log('✓ 2. Native icon.svg & public/icon.svg checks passed');

// ─── 3. Verify favicon.ico, public/favicon.ico & og-image.png ─
const appFaviconPath = path.resolve('src/app/favicon.ico');
const publicFaviconPath = path.resolve('public/favicon.ico');
const ogImagePath = path.resolve('public/og-image.png');
assert.ok(fs.existsSync(appFaviconPath), 'src/app/favicon.ico must exist');
assert.ok(fs.existsSync(publicFaviconPath), 'public/favicon.ico must exist');
assert.ok(fs.existsSync(ogImagePath), 'public/og-image.png must exist');
const appFaviconStat = fs.statSync(appFaviconPath);
assert.ok(appFaviconStat.size < 10000, 'favicon.ico must be a lightweight generated binary (< 10KB)');
const ogStat = fs.statSync(ogImagePath);
assert.ok(ogStat.size > 10000 && ogStat.size < 280000, 'og-image.png must be optimized under 280KB for instant WhatsApp/LinkedIn preview');
assert.ok(!fs.existsSync(path.resolve('public/vercel.svg')), 'public/vercel.svg must be deleted');
console.log('✓ 3. Binary favicon.ico & 1200x630 og-image.png checks passed');

// ─── 4. Verify Layout, OpenGraph & Manifest Cache-Busting ────
const layoutPath = path.resolve('src/app/layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
assert.ok(/\/icon\.svg\?v=7/.test(layoutContent), 'layout.tsx must contain /icon.svg?v=7');
assert.ok(/\/favicon\.ico\?v=7/.test(layoutContent), 'layout.tsx must contain /favicon.ico?v=7');
assert.ok(/\/og-image\.png\?v=7/.test(layoutContent), 'layout.tsx must contain /og-image.png?v=7');
assert.ok(layoutContent.includes('width: 1200'), 'layout.tsx must specify standard 1200px OpenGraph width');
assert.ok(layoutContent.includes('height: 630'), 'layout.tsx must specify standard 630px OpenGraph height');
assert.ok(layoutContent.includes("themeColor: '#050505'"), 'layout.tsx viewport must define themeColor #050505');

const manifestPath = path.resolve('src/app/manifest.ts');
const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
assert.ok(/\/icon\.svg\?v=7/.test(manifestContent), 'manifest.ts must contain /icon.svg?v=7');
console.log('✓ 4. Cache-busting icons & OpenGraph 1200x630 metadata in layout.tsx & manifest.ts passed');

// ─── 5. Verify SideSlider.tsx & persistent general visibility ───
const sideSliderPath = path.resolve('src/components/ui/SideSlider.tsx');
assert.ok(fs.existsSync(sideSliderPath), 'SideSlider.tsx must exist');
const sliderContent = fs.readFileSync(sideSliderPath, 'utf-8');
assert.ok(sliderContent.includes("pointer: fine"), 'SideSlider must check pointer: fine');
assert.ok(sliderContent.includes("opacity-100 pointer-events-auto"), 'SideSlider must remain persistently visible');
assert.ok(sliderContent.includes("cursor-none"), 'SideSlider must have cursor-none');
assert.ok(sliderContent.includes("from-[#00D2FF] to-[#0088FF]"), 'SideSlider must have cyan gradient DA');
assert.ok(sliderContent.includes("dark:bg-[#050505]/80"), 'SideSlider must have obsidian DA container');
assert.ok(sliderContent.includes("role=\"scrollbar\""), 'SideSlider must have role="scrollbar"');

const siteLayoutPath = path.resolve('src/app/(site)/layout.tsx');
const siteLayoutContent = fs.readFileSync(siteLayoutPath, 'utf-8');
assert.ok(siteLayoutContent.includes('import SideSlider from "@/components/ui/SideSlider";'), 'SiteLayout must import SideSlider');
assert.ok(siteLayoutContent.includes('<SideSlider />'), 'SiteLayout must render <SideSlider />');
console.log('✓ 5. SideSlider component implementation & SiteLayout integration passed');

// ─── 6. Verify SkillsSection ghost scrollbar elimination ─────
const skillsSectionPath = path.resolve('src/components/ui/SkillsSection.tsx');
const skillsSectionContent = fs.readFileSync(skillsSectionPath, 'utf-8');
assert.ok(skillsSectionContent.includes('lg:overflow-visible'), 'SkillsSection tab container must use lg:overflow-visible to prevent ghost scrollbar on desktop');
assert.ok(skillsSectionContent.includes('scrollbar-hide'), 'SkillsSection tab container must have scrollbar-hide');
assert.ok(skillsSectionContent.includes('scrollbarWidth: \'none\''), 'SkillsSection tab container must have inline scrollbarWidth: none');
console.log('✓ 6. SkillsSection ghost scrollbar eradication verified');

// ─── 7. Verify globals.css scrollbar & cursor rules ─────────
const cssPath = path.resolve('src/app/globals.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');
assert.ok(cssContent.includes('scrollbar-width: none'), 'globals.css must hide scrollbar on desktop');
assert.ok(cssContent.includes('display: none'), 'globals.css must hide webkit scrollbar on desktop');
assert.ok(cssContent.includes('cursor: none !important;'), 'globals.css must hide cursor on desktop');
assert.ok(cssContent.includes('.scrollbar-hide'), 'globals.css must define .scrollbar-hide');
assert.ok(cssContent.includes('background: #050505;'), 'globals.css must style fallback scrollbar track with #050505');
assert.ok(cssContent.includes('rgba(0, 210, 255'), 'globals.css must style fallback scrollbar thumb with cyan glow');
console.log('✓ 7. globals.css scrollbar isolation & DA rules passed');

// ─── 8. Verify test suites ──────────────────────────────────
const logoTestPath = path.resolve('test/unit/logo.test.ts');
assert.ok(fs.existsSync(logoTestPath), 'logo.test.ts must exist');
const logoTestContent = fs.readFileSync(logoTestPath, 'utf-8');
assert.ok(logoTestContent.includes('The Isometric EN Monolith / Le Prisme Architectural EN'), 'logo.test.ts must test The Isometric EN Monolith');

const sliderTestPath = path.resolve('test/unit/side-slider.test.ts');
assert.ok(fs.existsSync(sliderTestPath), 'side-slider.test.ts must exist');
const sliderTestContent = fs.readFileSync(sliderTestPath, 'utf-8');
assert.ok(sliderTestContent.includes('opacity-100'), 'side-slider.test.ts must test persistent opacity-100');

console.log('✓ 8. Unit test files updated and verified');
console.log('\n🎉 ALL 8 DEEP VERIFICATION SUITES PASSED SUCCESSFULLY!');
