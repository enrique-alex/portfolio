import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { getProjectsData } from "../src/lib/data";

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function sqlValue(value: string | undefined): string {
  if (value === undefined) {
    return "NULL";
  }
  return `'${escapeSqlString(value)}'`;
}

function sqlJsonValue(value: unknown): string {
  const json = JSON.stringify(value);
  return `'${escapeSqlString(json)}'`;
}

const projectsFr = getProjectsData("fr");
const projectsEn = getProjectsData("en");

const lines: string[] = [
  "-- ⚠️  Fichier généré automatiquement par scripts/generate-seed-sql.ts",
  "-- Ne pas éditer à la main. Relancer `npm run generate:seed` pour régénérer.",
  "",
];

// INSERT INTO projects
for (let i = 0; i < projectsFr.length; i++) {
  const p = projectsFr[i];
  lines.push(
    `INSERT INTO projects (id, slug, year, technologies, theme_color_r, theme_color_g, theme_color_b, github_url, cover_image, gallery, sort_order) VALUES (` +
      `'${escapeSqlString(p.id)}', ` +
      `'${escapeSqlString(p.slug)}', ` +
      `${p.year}, ` +
      `${sqlJsonValue(p.technologies)}, ` +
      `${p.themeColor.r}, ` +
      `${p.themeColor.g}, ` +
      `${p.themeColor.b}, ` +
      `${sqlValue(p.githubUrl)}, ` +
      `${sqlValue(p.coverImage)}, ` +
      `${p.gallery !== undefined ? sqlJsonValue(p.gallery) : "NULL"}, ` +
      `${i}` +
      `);`
  );
}

lines.push("");

// INSERT INTO project_translations (FR then EN)
for (const locale of ["fr", "en"] as const) {
  const projects = locale === "fr" ? projectsFr : projectsEn;
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    // Use the FR id as project_id (same project, same id across locales)
    const projectId = projectsFr[i].id;
    lines.push(
      `INSERT INTO project_translations (project_id, locale, title, category, short_description, detailed_description, technical_challenges, impact) VALUES (` +
        `'${escapeSqlString(projectId)}', ` +
        `'${locale}', ` +
        `'${escapeSqlString(p.title)}', ` +
        `'${escapeSqlString(p.category)}', ` +
        `'${escapeSqlString(p.shortDescription)}', ` +
        `'${escapeSqlString(p.detailedDescription)}', ` +
        `'${escapeSqlString(p.technicalChallenges)}', ` +
        `'${escapeSqlString(p.impact)}'` +
        `);`
    );
  }
}

lines.push("");

const outputPath = resolve(process.cwd(), "migrations", "0003_seed_projects.sql");
writeFileSync(outputPath, lines.join("\n"), "utf-8");

console.log(`✅ Seed SQL written to ${outputPath}`);
console.log(`   ${projectsFr.length} projects + ${projectsFr.length * 2} translations`);
