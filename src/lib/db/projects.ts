import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Locale } from "@/lib/i18n";
import { Project } from "@/lib/data";

interface D1ProjectRow {
  id: string;
  slug: string;
  year: number;
  technologies: string;
  theme_color_r: number;
  theme_color_g: number;
  theme_color_b: number;
  github_url: string | null;
  cover_image: string | null;
  gallery: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  project_id: string;
  locale: string;
  title: string;
  category: string;
  short_description: string;
  detailed_description: string;
  technical_challenges: string;
  impact: string;
}

function mapRowToProject(row: D1ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    year: row.year,
    category: row.category,
    shortDescription: row.short_description,
    detailedDescription: row.detailed_description,
    technicalChallenges: row.technical_challenges,
    impact: row.impact,
    technologies: JSON.parse(row.technologies) as string[],
    themeColor: {
      r: row.theme_color_r,
      g: row.theme_color_g,
      b: row.theme_color_b,
    },
    githubUrl: row.github_url !== null ? row.github_url : undefined,
    coverImage: row.cover_image !== null ? row.cover_image : undefined,
    gallery: row.gallery !== null ? (JSON.parse(row.gallery) as string[]) : undefined,
  };
}

export async function getProjects(locale: Locale): Promise<Project[]> {
  const { env } = getCloudflareContext();
  const db = env.portfolio_db;

  const query = `
    SELECT p.*, t.* 
    FROM projects p
    JOIN project_translations t ON p.id = t.project_id
    WHERE t.locale = ?
    ORDER BY p.sort_order ASC
  `;

  const { results } = await db.prepare(query).bind(locale).all<D1ProjectRow>();

  return results.map(mapRowToProject);
}

export async function getProjectBySlug(slug: string, locale: Locale): Promise<Project | null> {
  const { env } = getCloudflareContext();
  const db = env.portfolio_db;

  const query = `
    SELECT p.*, t.* 
    FROM projects p
    JOIN project_translations t ON p.id = t.project_id
    WHERE p.slug = ? AND t.locale = ?
  `;

  const project = await db.prepare(query).bind(slug, locale).first<D1ProjectRow>();

  if (!project) {
    return null;
  }

  return mapRowToProject(project);
}
