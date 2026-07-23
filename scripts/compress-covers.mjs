/**
 * Compress & convert project cover images to .webp
 * - Max width: 1600px
 * - Quality: 80
 * - Target: 80-200 KB per cover
 * - Fixes naming: "tchebytchev" → "tchebychev"
 */
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import path from 'path';

const PROJECTS_DIR = path.resolve('public/image/projects');
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 80;

// Mapping: source filename → target .webp filename
const COVER_MAP = {
  'lyngk-cover.webp': 'lyngk-cover.webp',
  'filtre-tchebytchev-cover.jpeg': 'filtre-tchebychev-cover.webp',   // fix typo
  'controle-hydraulique-cover.jpeg': 'controle-hydraulique-cover.webp',
  'microprocesseurs-cover.png': 'microprocesseurs-cover.webp',
  'robotino-cover.png': 'robotino-cover.webp',
  'pygroove-cover.JPG': 'pygroove-cover.webp',
};

async function processImage(srcName, dstName) {
  const srcPath = path.join(PROJECTS_DIR, srcName);
  const dstPath = path.join(PROJECTS_DIR, dstName);

  // Get source info
  const srcStats = await stat(srcPath);
  const metadata = await sharp(srcPath).metadata();
  const srcWidth = metadata.width;
  const srcHeight = metadata.height;
  const srcSizeKB = (srcStats.size / 1024).toFixed(0);

  // Resize only if wider than MAX_WIDTH
  let pipeline = sharp(srcPath);
  if (srcWidth > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  // Convert to webp
  await pipeline
    .webp({ quality: WEBP_QUALITY })
    .toFile(dstPath);

  // Get output info
  const dstStats = await stat(dstPath);
  const dstSizeKB = (dstStats.size / 1024).toFixed(0);
  const dstMeta = await sharp(dstPath).metadata();

  console.log(`✅ ${srcName} (${srcWidth}x${srcHeight}, ${srcSizeKB} KB) → ${dstName} (${dstMeta.width}x${dstMeta.height}, ${dstSizeKB} KB)`);
}

async function main() {
  console.log(`\n📁 Processing covers in: ${PROJECTS_DIR}\n`);

  for (const [src, dst] of Object.entries(COVER_MAP)) {
    try {
      await processImage(src, dst);
    } catch (err) {
      console.error(`❌ FAILED: ${src} → ${dst}: ${err.message}`);
    }
  }

  // Final summary: list all .webp files with sizes
  console.log('\n📊 Final .webp cover files:\n');
  const files = await readdir(PROJECTS_DIR);
  const coverWebps = files.filter(f => f.endsWith('.webp') && f.includes('cover'));
  for (const f of coverWebps.sort()) {
    const s = await stat(path.join(PROJECTS_DIR, f));
    console.log(`   ${f} — ${(s.size / 1024).toFixed(0)} KB`);
  }
}

main().catch(console.error);
