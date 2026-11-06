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

const FEATURED_IDS = [
  'controle-hydraulique',
  'cellule-robotique',
  'toyota-prius-bond-graph',
  'vehicule-electrique-rem',
  'iot-network-infra',
  'filtre-tchebychev',
  'lyngk'
];

function generateSyncMigration(): string {
  const lines: string[] = [
    '-- Migration 0007: Synchronisation des 15 projets academiques et industriels',
    '-- Supprime l ancien projet unitaire robotino pour laisser place a la cellule-robotique',
    "DELETE FROM project_translations WHERE project_id = 'robotino';",
    "DELETE FROM projects WHERE id = 'robotino';",
    '',
  ];

  const frProjects = FALLBACK_PROJECTS.fr;
  const enProjects = FALLBACK_PROJECTS.en;

  // 1. INSERT OR REPLACE INTO projects
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
    const isFeatured = FEATURED_IDS.includes(proj.id) ? 1 : 0;

    lines.push(
      `INSERT OR REPLACE INTO projects (id, slug, year, technologies, theme_color_r, theme_color_g, theme_color_b, github_url, cover_image, gallery, sort_order, is_featured, deleted_at) VALUES (${id}, ${slug}, ${year}, ${technologies}, ${r}, ${g}, ${b}, ${githubUrl}, ${coverImage}, ${gallery}, ${sortOrder}, ${isFeatured}, NULL);`
    );
  });

  lines.push('');

  // 2. INSERT OR REPLACE INTO project_translations (FR)
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
      `INSERT OR REPLACE INTO project_translations (project_id, locale, title, category, short_description, detailed_description, technical_challenges, impact) VALUES (${id}, ${locale}, ${title}, ${category}, ${shortDesc}, ${detailedDesc}, ${techChallenges}, ${impact});`
    );
  });

  lines.push('');

  // 3. INSERT OR REPLACE INTO project_translations (EN)
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
      `INSERT OR REPLACE INTO project_translations (project_id, locale, title, category, short_description, detailed_description, technical_challenges, impact) VALUES (${id}, ${locale}, ${title}, ${category}, ${shortDesc}, ${detailedDesc}, ${techChallenges}, ${impact});`
    );
  });

  lines.push('');
  return lines.join('\n');
}

const outputPath = path.resolve(process.cwd(), 'migrations/0007_sync_academic_projects.sql');
const sqlContent = generateSyncMigration();
fs.writeFileSync(outputPath, sqlContent, 'utf-8');
console.log(`✅ Migration 0007 générée dans : ${outputPath}`);
