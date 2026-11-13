import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Locale } from "@/lib/i18n";
import { Project } from "@/lib/data";
import { FALLBACK_PROJECTS } from "./fallback-projects";

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
  is_featured: number;
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

const FR_TO_EN_TECH_MAP: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>([
    ["Héritage ISO", "Inheritance & RAII"],
    ["Algorithmique Matérielle", "Collision Detection"],
    ["Graphes ML", "Data Visualization"],
    ["Linux Kernel", "Unix Syscalls"],
    ["Signaux ASync", "Signals"],
    ["Mémoire", "Memory Management"],
    ["Processus Posix", "POSIX Processes"],
  ]);

  for (const frProject of FALLBACK_PROJECTS.fr) {
    const enProject = FALLBACK_PROJECTS.en.find((p) => p.id === frProject.id);
    if (!enProject) continue;
    frProject.technologies.forEach((tech, idx) => {
      const enTech = enProject.technologies[idx];
      if (enTech) {
        map.set(tech, enTech);
      }
    });
  }

  return map;
})();

function mapRowToProject(row: D1ProjectRow): Project {
  const parsedTechs = JSON.parse(row.technologies) as string[];
  const localizedTechs =
    row.locale === "en"
      ? parsedTechs.map((t) => FR_TO_EN_TECH_MAP.get(t) ?? t)
      : parsedTechs;

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
    technologies: localizedTechs,
    isFeatured: Boolean(row.is_featured),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  try {
    const { env } = getCloudflareContext();
    db = env.portfolio_db;
  } catch {
    // Ignore error in next dev
  }

  if (!db) {
    console.warn("[projects] Base D1 'portfolio_db' non trouvée (mode dev local). Utilisation des projets de secours.");
    return FALLBACK_PROJECTS[locale] || FALLBACK_PROJECTS.fr;
  }

  const query = `
    SELECT p.*, t.* 
    FROM projects p
    JOIN project_translations t ON p.id = t.project_id
    WHERE t.locale = ? AND p.deleted_at IS NULL
    ORDER BY p.sort_order ASC
  `;

  try {
    const { results } = (await db.prepare(query).bind(locale).all()) as { results: D1ProjectRow[] };
    return results.map(mapRowToProject);
  } catch (error) {
    console.warn("[projects] Erreur lors de la requête D1 getProjects. Utilisation des projets de secours:", error);
    return FALLBACK_PROJECTS[locale] || FALLBACK_PROJECTS.fr;
  }
}

export async function getProjectBySlug(slug: string, locale: Locale): Promise<Project | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any;
  try {
    const { env } = getCloudflareContext();
    db = env.portfolio_db;
  } catch {
    // Ignore error in next dev
  }

  if (!db) {
    const list = FALLBACK_PROJECTS[locale] || FALLBACK_PROJECTS.fr;
    return list.find((p) => p.slug === slug) || null;
  }

  const query = `
    SELECT p.*, t.* 
    FROM projects p
    JOIN project_translations t ON p.id = t.project_id
    WHERE p.slug = ? AND t.locale = ? AND p.deleted_at IS NULL
  `;

  try {
    const project = (await db.prepare(query).bind(slug, locale).first()) as D1ProjectRow | null;

    if (!project) {
      return null;
    }

    return mapRowToProject(project);
  } catch (error) {
    console.warn("[projects] Erreur lors de la requête D1 getProjectBySlug. Utilisation des projets de secours:", error);
    const list = FALLBACK_PROJECTS[locale] || FALLBACK_PROJECTS.fr;
    return list.find((p) => p.slug === slug) || null;
  }
}
