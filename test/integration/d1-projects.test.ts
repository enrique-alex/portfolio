/// <reference types="@cloudflare/vitest-plugin/types" />
/// <reference path="../../worker-configuration.d.ts" />
import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";

interface ProjectRow {
  id: string;
  slug: string;
  year: number;
  sort_order: number;
  is_featured: number;
  technologies: string;
  cover_image: string | null;
  gallery: string | null;
}

interface TranslationRow {
  project_id: string;
  locale: string;
  title: string;
  category: string;
  short_description: string;
  detailed_description: string;
  technical_challenges: string;
  impact: string;
}

describe("D1 Database Seeded Projects Integration", () => {
  it("should have exactly 15 active projects seeded in D1", async () => {
    const { results } = await env.portfolio_db
      .prepare("SELECT id, slug, year, sort_order, is_featured, technologies, cover_image, gallery FROM projects WHERE deleted_at IS NULL ORDER BY sort_order ASC")
      .all<ProjectRow>();

    expect(results).toBeDefined();
    expect(results?.length).toBe(15);
  });

  it("should have exactly 30 translations (15 FR, 15 EN) seeded in D1", async () => {
    const frCount = await env.portfolio_db
      .prepare("SELECT count(*) as count FROM project_translations WHERE locale = 'fr'")
      .first<{ count: number }>();
    expect(frCount?.count).toBe(15);

    const enCount = await env.portfolio_db
      .prepare("SELECT count(*) as count FROM project_translations WHERE locale = 'en'")
      .first<{ count: number }>();
    expect(enCount?.count).toBe(15);
  });

  it("should contain the 4 academic projects with complete metadata in D1", async () => {
    const academicIds = [
      "cellule-robotique",
      "toyota-prius-bond-graph",
      "vehicule-electrique-rem",
      "iot-network-infra",
    ];

    for (const id of academicIds) {
      const proj = await env.portfolio_db
        .prepare("SELECT id, slug, technologies, gallery, is_featured FROM projects WHERE id = ?")
        .bind(id)
        .first<ProjectRow>();

      expect(proj, `Project ${id} not found in D1`).not.toBeNull();
      expect(proj?.is_featured).toBe(1);

      // Verify JSON parses
      const techs = JSON.parse(proj!.technologies);
      expect(Array.isArray(techs)).toBe(true);
      expect(techs.length).toBeGreaterThan(0);

      // Verify translations exist for both FR and EN
      const { results: trs } = await env.portfolio_db
        .prepare("SELECT locale, title, category, technical_challenges, impact FROM project_translations WHERE project_id = ? ORDER BY locale ASC")
        .bind(id)
        .all<TranslationRow>();

      expect(trs?.length).toBe(2);
      expect(trs?.[0].locale).toBe("en");
      expect(trs?.[0].title).toBeTruthy();
      expect(trs?.[0].category).toBeTruthy();
      expect(trs?.[1].locale).toBe("fr");
      expect(trs?.[1].title).toBeTruthy();
      expect(trs?.[1].category).toBeTruthy();
    }
  });

  it("should have exactly the 7 featured projects flagged with is_featured = 1 in D1", async () => {
    const { results } = await env.portfolio_db
      .prepare("SELECT id FROM projects WHERE is_featured = 1 ORDER BY sort_order ASC")
      .all<{ id: string }>();

    const featuredIds = results?.map((r) => r.id);
    expect(featuredIds).toEqual([
      "controle-hydraulique",
      "cellule-robotique",
      "toyota-prius-bond-graph",
      "vehicule-electrique-rem",
      "iot-network-infra",
      "filtre-tchebychev",
      "lyngk",
    ]);
  });
});
