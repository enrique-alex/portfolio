export interface ProjectAdminListItem {
  id: string;
  slug: string;
  year: number;
  sortOrder: number;
  titleFr: string;
  titleEn: string;
  category: string;
}

/**
 * Récupère tous les projets pour le panel d'administration, incluant les traductions FR et EN.
 * Trie par sort_order croissant.
 * Ne filtre pas par langue, retourne toutes les informations d'identification essentielles.
 */
export async function getProjectsForAdmin(db: D1Database): Promise<ProjectAdminListItem[]> {
  const statement = db.prepare(`
    SELECT 
      p.id, 
      p.slug, 
      p.year, 
      p.sort_order as sortOrder,
      t_fr.title as titleFr, 
      t_en.title as titleEn,
      t_fr.category as category
    FROM projects p
    LEFT JOIN project_translations t_fr ON p.id = t_fr.project_id AND t_fr.locale = 'fr'
    LEFT JOIN project_translations t_en ON p.id = t_en.project_id AND t_en.locale = 'en'
    ORDER BY p.sort_order ASC
  `);

  const { results } = await statement.all<ProjectAdminListItem>();
  return results || [];
}
