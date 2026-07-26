import type { ProjectFormInput } from "@/lib/validation/project";

export async function getProjectByIdForAdmin(
  db: D1Database,
  id: string
): Promise<(ProjectFormInput & { id: string }) | null> {
  const statement = db.prepare(`
    SELECT 
      p.id, p.slug, p.year, p.technologies, p.theme_color_r, p.theme_color_g, p.theme_color_b,
      p.github_url, p.cover_image, p.gallery, p.sort_order,
      t_fr.title as titleFr, t_fr.category as categoryFr, t_fr.short_description as shortDescriptionFr,
      t_fr.detailed_description as detailedDescriptionFr, t_fr.technical_challenges as technicalChallengesFr, t_fr.impact as impactFr,
      t_en.title as titleEn, t_en.category as categoryEn, t_en.short_description as shortDescriptionEn,
      t_en.detailed_description as detailedDescriptionEn, t_en.technical_challenges as technicalChallengesEn, t_en.impact as impactEn
    FROM projects p
    LEFT JOIN project_translations t_fr ON p.id = t_fr.project_id AND t_fr.locale = 'fr'
    LEFT JOIN project_translations t_en ON p.id = t_en.project_id AND t_en.locale = 'en'
    WHERE p.id = ?
  `);

  const result = await statement.bind(id).first<any>();

  if (!result) {
    return null;
  }

  return {
    id: result.id as string,
    slug: result.slug as string,
    year: result.year as number,
    technologies: typeof result.technologies === 'string' ? JSON.parse(result.technologies) : (result.technologies || []),
    themeColorR: result.theme_color_r as number,
    themeColorG: result.theme_color_g as number,
    themeColorB: result.theme_color_b as number,
    githubUrl: result.github_url as string | null,
    coverImage: result.cover_image as string | null,
    gallery: result.gallery ? (typeof result.gallery === 'string' ? JSON.parse(result.gallery) : result.gallery) : null,
    sortOrder: result.sort_order as number,
    titleFr: result.titleFr as string || "",
    categoryFr: result.categoryFr as string || "",
    shortDescriptionFr: result.shortDescriptionFr as string || "",
    detailedDescriptionFr: result.detailedDescriptionFr as string || "",
    technicalChallengesFr: result.technicalChallengesFr as string || "",
    impactFr: result.impactFr as string || "",
    titleEn: result.titleEn as string || "",
    categoryEn: result.categoryEn as string || "",
    shortDescriptionEn: result.shortDescriptionEn as string || "",
    detailedDescriptionEn: result.detailedDescriptionEn as string || "",
    technicalChallengesEn: result.technicalChallengesEn as string || "",
    impactEn: result.impactEn as string || "",
  };
}

/**
 * Creates a project and its translations in an atomic batch.
 * It strictly respects the order:
 * 1. Update sort_order to make room (shift down).
 * 2. Insert into projects table.
 * 3. Insert FR translation.
 * 4. Insert EN translation.
 */
export async function createProjectAtomic(
  db: D1Database,
  id: string,
  input: ProjectFormInput
): Promise<void> {
  const statements = [];

  // a. Shift sort_order for existing projects that come after or at the requested order
  statements.push(
    db
      .prepare(`UPDATE projects SET sort_order = sort_order + 1 WHERE sort_order >= ?`)
      .bind(input.sortOrder)
  );

  // b. Insert new project
  statements.push(
    db
      .prepare(
        `INSERT INTO projects (
          id, slug, year, technologies, theme_color_r, theme_color_g, theme_color_b,
          github_url, cover_image, gallery, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        input.slug,
        input.year,
        JSON.stringify(input.technologies),
        input.themeColorR,
        input.themeColorG,
        input.themeColorB,
        input.githubUrl,
        input.coverImage,
        input.gallery ? JSON.stringify(input.gallery) : null,
        input.sortOrder
      )
  );

  // c. Insert FR translations
  statements.push(
    db
      .prepare(
        `INSERT INTO project_translations (
          project_id, locale, title, category, short_description, detailed_description, technical_challenges, impact
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        "fr",
        input.titleFr,
        input.categoryFr,
        input.shortDescriptionFr,
        input.detailedDescriptionFr,
        input.technicalChallengesFr,
        input.impactFr
      )
  );

  // d. Insert EN translations
  statements.push(
    db
      .prepare(
        `INSERT INTO project_translations (
          project_id, locale, title, category, short_description, detailed_description, technical_challenges, impact
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        "en",
        input.titleEn,
        input.categoryEn,
        input.shortDescriptionEn,
        input.detailedDescriptionEn,
        input.technicalChallengesEn,
        input.impactEn
      )
  );

  // Execute atomically
  await db.batch(statements);
}

/**
 * Updates an existing project atomically.
 * It compares the old sort_order to determine if shifting is needed,
 * then updates the project and its translations in the same batch.
 */
export async function updateProjectAtomic(
  db: D1Database,
  id: string,
  input: ProjectFormInput
): Promise<void> {
  // First, read the current sort_order before batch execution (read-only)
  const oldProject = await db
    .prepare("SELECT sort_order FROM projects WHERE id = ?")
    .bind(id)
    .first<{ sort_order: number }>();

  if (!oldProject) {
    throw new Error("Project not found");
  }

  const oldSortOrder = oldProject.sort_order;
  const statements = [];

  // Conditional sort_order update if the project was moved
  if (input.sortOrder < oldSortOrder) {
    // Moved up the list
    statements.push(
      db
        .prepare(
          `UPDATE projects SET sort_order = sort_order + 1 
           WHERE sort_order >= ? AND sort_order < ? AND id != ?`
        )
        .bind(input.sortOrder, oldSortOrder, id)
    );
  } else if (input.sortOrder > oldSortOrder) {
    // Moved down the list
    statements.push(
      db
        .prepare(
          `UPDATE projects SET sort_order = sort_order - 1 
           WHERE sort_order > ? AND sort_order <= ? AND id != ?`
        )
        .bind(oldSortOrder, input.sortOrder, id)
    );
  }

  // Update projects table
  statements.push(
    db
      .prepare(
        `UPDATE projects SET 
          slug = ?, year = ?, technologies = ?, theme_color_r = ?, theme_color_g = ?, theme_color_b = ?,
          github_url = ?, cover_image = ?, gallery = ?, sort_order = ?, updated_at = datetime('now')
        WHERE id = ?`
      )
      .bind(
        input.slug,
        input.year,
        JSON.stringify(input.technologies),
        input.themeColorR,
        input.themeColorG,
        input.themeColorB,
        input.githubUrl,
        input.coverImage,
        input.gallery ? JSON.stringify(input.gallery) : null,
        input.sortOrder,
        id
      )
  );

  // Update project_translations FR
  statements.push(
    db
      .prepare(
        `UPDATE project_translations SET 
          title = ?, category = ?, short_description = ?, detailed_description = ?, technical_challenges = ?, impact = ?
        WHERE project_id = ? AND locale = 'fr'`
      )
      .bind(
        input.titleFr,
        input.categoryFr,
        input.shortDescriptionFr,
        input.detailedDescriptionFr,
        input.technicalChallengesFr,
        input.impactFr,
        id
      )
  );

  // Update project_translations EN
  statements.push(
    db
      .prepare(
        `UPDATE project_translations SET 
          title = ?, category = ?, short_description = ?, detailed_description = ?, technical_challenges = ?, impact = ?
        WHERE project_id = ? AND locale = 'en'`
      )
      .bind(
        input.titleEn,
        input.categoryEn,
        input.shortDescriptionEn,
        input.detailedDescriptionEn,
        input.technicalChallengesEn,
        input.impactEn,
        id
      )
  );

  // Execute atomically
  await db.batch(statements);
}

/**
 * Supprime un projet en douceur (soft-delete) et réorganise le sort_order des projets restants.
 */
export async function deleteProjectAtomic(db: D1Database, id: string): Promise<boolean> {
  // 1. Lire le sort_order du projet à supprimer
  const project = await db
    .prepare("SELECT sort_order FROM projects WHERE id = ? AND deleted_at IS NULL")
    .bind(id)
    .first<{ sort_order: number }>();

  if (!project) {
    return false; // Projet introuvable ou déjà supprimé
  }

  const sortOrder = project.sort_order;

  // 2. Préparer le batch de soft-delete et de décalage
  const statements = [
    // a. Soft-delete le projet
    db.prepare("UPDATE projects SET deleted_at = datetime('now') WHERE id = ?").bind(id),
    
    // b. Décaler le sort_order des projets actifs suivants
    db.prepare("UPDATE projects SET sort_order = sort_order - 1 WHERE sort_order > ? AND deleted_at IS NULL").bind(sortOrder),
  ];

  // 3. Exécuter la transaction
  await db.batch(statements);

  return true;
}

export async function restoreProject(db: D1Database, id: string): Promise<boolean> {
  const project = await db
    .prepare("SELECT id, sort_order FROM projects WHERE id = ? AND deleted_at IS NOT NULL")
    .bind(id)
    .first<{ id: string, sort_order: number }>();

  if (!project) {
    return false;
  }

  const originalSortOrder = project.sort_order;

  // L'approche par batch permet de décaler correctement les projets actifs 
  // (>= originalSortOrder) même si d'autres suppressions ou créations ont eu lieu
  const statements = [
    // a. Fait de la place à la position d'origine parmi les projets actuellement actifs
    db.prepare("UPDATE projects SET sort_order = sort_order + 1 WHERE sort_order >= ? AND deleted_at IS NULL").bind(originalSortOrder),
    
    // b. Restaure le projet (on ne modifie pas son sort_order qui est déjà resté figé)
    db.prepare("UPDATE projects SET deleted_at = NULL WHERE id = ?").bind(id),
  ];

  await db.batch(statements);

  return true;
}

export async function purgeExpiredProjects(db: D1Database): Promise<number> {
  const expired = await db
    .prepare("SELECT id FROM projects WHERE deleted_at IS NOT NULL AND deleted_at < datetime('now', '-90 days')")
    .all<{ id: string }>();

  const ids = expired.results?.map(r => r.id) || [];

  if (ids.length === 0) {
    return 0;
  }

  const statements = [];
  for (const id of ids) {
    statements.push(db.prepare("DELETE FROM project_translations WHERE project_id = ?").bind(id));
    statements.push(db.prepare("DELETE FROM projects WHERE id = ?").bind(id));
  }

  await db.batch(statements);

  return ids.length;
}

export interface TrashedProjectItem {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  deletedAt: string;
}

export async function getTrashedProjects(db: D1Database): Promise<TrashedProjectItem[]> {
  const statement = db.prepare(`
    SELECT 
      p.id, 
      p.slug, 
      p.deleted_at as deletedAt,
      t_fr.title as titleFr, 
      t_en.title as titleEn
    FROM projects p
    LEFT JOIN project_translations t_fr ON p.id = t_fr.project_id AND t_fr.locale = 'fr'
    LEFT JOIN project_translations t_en ON p.id = t_en.project_id AND t_en.locale = 'en'
    WHERE p.deleted_at IS NOT NULL
    ORDER BY p.deleted_at DESC
  `);

  const { results } = await statement.all<TrashedProjectItem>();
  return results || [];
}

export async function countTrashedProjects(db: D1Database): Promise<number> {
  const result = await db
    .prepare("SELECT COUNT(*) as count FROM projects WHERE deleted_at IS NOT NULL")
    .first<{ count: number }>();
    
  return result?.count || 0;
}
