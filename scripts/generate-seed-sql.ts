import fs from 'fs';
import path from 'path';
import { FALLBACK_PROJECTS } from '../src/lib/db/fallback-projects';

function escapeSqlString(str: string | null | undefined): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function escapeJsonArray(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) return 'NULL';
  return escapeSqlString(JSON.stringify(arr));
}

function generateSeedSql(): string {
  const lines: string[] = [
    '-- ⚠️  Fichier généré automatiquement par scripts/generate-seed-sql.ts',
    '-- Ne pas éditer à la main. Relancer `npm run generate:seed` pour régénérer.',
    '',
  ];

  const frProjects = FALLBACK_PROJECTS.fr;
  const enProjects = FALLBACK_PROJECTS.en;

  // 1. INSERT INTO projects
  frProjects.forEach((proj, index) => {
    const id = escapeSqlString(proj.id);
    const slug = escapeSqlString(proj.slug);
    const year = proj.year;
    const technologies = escapeJsonArray(proj.technologies);
    const r = proj.themeColor.r;
    const g = proj.themeColor.g;
    const b = proj.themeColor.b;
    const githubUrl = escapeSqlString(proj.githubUrl ?? null);
    const coverImage = escapeSqlString(proj.coverImage ?? null);
    const gallery = escapeJsonArray(proj.gallery ?? null);
    const sortOrder = index;

    lines.push(
      `INSERT INTO projects (id, slug, year, technologies, theme_color_r, theme_color_g, theme_color_b, github_url, cover_image, gallery, sort_order) VALUES (${id}, ${slug}, ${year}, ${technologies}, ${r}, ${g}, ${b}, ${githubUrl}, ${coverImage}, ${gallery}, ${sortOrder});`
    );
  });

  lines.push('');

  // 2. INSERT INTO project_translations (FR)
  frProjects.forEach((proj) => {
    const id = escapeSqlString(proj.id);
    const locale = escapeSqlString('fr');
    const title = escapeSqlString(proj.title);
    const category = escapeSqlString(proj.category);
    const shortDesc = escapeSqlString(proj.shortDescription);
    const detailedDesc = escapeSqlString(proj.detailedDescription);
    const techChallenges = escapeSqlString(proj.technicalChallenges);
    const impact = escapeSqlString(proj.impact);

    lines.push(
      `INSERT INTO project_translations (project_id, locale, title, category, short_description, detailed_description, technical_challenges, impact) VALUES (${id}, ${locale}, ${title}, ${category}, ${shortDesc}, ${detailedDesc}, ${techChallenges}, ${impact});`
    );
  });

  // 3. INSERT INTO project_translations (EN)
  enProjects.forEach((proj) => {
    const id = escapeSqlString(proj.id);
    const locale = escapeSqlString('en');
    const title = escapeSqlString(proj.title);
    const category = escapeSqlString(proj.category);
    const shortDesc = escapeSqlString(proj.shortDescription);
    const detailedDesc = escapeSqlString(proj.detailedDescription);
    const techChallenges = escapeSqlString(proj.technicalChallenges);
    const impact = escapeSqlString(proj.impact);

    lines.push(
      `INSERT INTO project_translations (project_id, locale, title, category, short_description, detailed_description, technical_challenges, impact) VALUES (${id}, ${locale}, ${title}, ${category}, ${shortDesc}, ${detailedDesc}, ${techChallenges}, ${impact});`
    );
  });

  lines.push('');
  return lines.join('\n');
}

const outputPath = path.resolve(process.cwd(), 'migrations/0003_seed_projects.sql');
const sqlContent = generateSeedSql();
fs.writeFileSync(outputPath, sqlContent, 'utf-8');
console.log(`✅ Seed SQL généré avec succès dans : ${outputPath} (${FALLBACK_PROJECTS.fr.length} projets)`);
