/// <reference types="@cloudflare/vitest-plugin/types" />
/// <reference path="../../worker-configuration.d.ts" />
import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";
import {
  createProjectAtomic,
  updateProjectAtomic,
  deleteProjectAtomic,
  restoreProject,
} from "@/lib/db/admin-projects-write";
import type { ProjectFormInput } from "@/lib/validation/project";

interface ProjectRow {
  id: string;
  slug: string;
  sort_order: number;
  deleted_at: string | null;
}

interface TranslationRow {
  project_id: string;
  locale: string;
  title: string;
}

function makeProjectInput(
  slug: string,
  sortOrder: number,
  overrides?: Partial<ProjectFormInput>
): ProjectFormInput {
  return {
    slug,
    year: 2026,
    technologies: ["TypeScript", "Next.js"],
    themeColorR: 66,
    themeColorG: 133,
    themeColorB: 244,
    githubUrl: "https://github.com/enrique-alex/test",
    coverImage: null,
    gallery: null,
    sortOrder,
    isFeatured: false,
    titleFr: `Titre ${slug} FR`,
    categoryFr: "Catégorie FR",
    shortDescriptionFr: "Description courte FR",
    detailedDescriptionFr: "Description détaillée FR",
    technicalChallengesFr: "Défis FR",
    impactFr: "Impact FR",
    titleEn: `Title ${slug} EN`,
    categoryEn: "Category EN",
    shortDescriptionEn: "Short description EN",
    detailedDescriptionEn: "Detailed description EN",
    technicalChallengesEn: "Challenges EN",
    impactEn: "Impact EN",
    ...overrides,
  };
}

async function getActiveProjects(db: D1Database): Promise<ProjectRow[]> {
  const { results } = await db
    .prepare("SELECT id, slug, sort_order, deleted_at FROM projects WHERE deleted_at IS NULL ORDER BY sort_order ASC")
    .all<ProjectRow>();
  return results || [];
}

async function getAllProjects(db: D1Database): Promise<ProjectRow[]> {
  const { results } = await db
    .prepare("SELECT id, slug, sort_order, deleted_at FROM projects ORDER BY sort_order ASC")
    .all<ProjectRow>();
  return results || [];
}

describe("Sort Order and Project Lifecycle Integration Tests", () => {
  beforeEach(async () => {
    // 1. Clean up existing test data
    await env.portfolio_db.prepare("DELETE FROM project_translations").run();
    await env.portfolio_db.prepare("DELETE FROM projects").run();

    // 2. Seed 5 distinct synthetic projects with sort_order 0 through 4
    for (let i = 0; i < 5; i++) {
      const id = `p${i}`;
      const slug = `project-${i}`;
      const input = makeProjectInput(slug, i);

      await env.portfolio_db
        .prepare(
          `INSERT INTO projects (
            id, slug, year, technologies, theme_color_r, theme_color_g, theme_color_b,
            github_url, cover_image, gallery, sort_order, is_featured, deleted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`
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
          i,
          0
        )
        .run();

      await env.portfolio_db
        .prepare(
          `INSERT INTO project_translations (
            project_id, locale, title, category, short_description, detailed_description, technical_challenges, impact
          ) VALUES (?, 'fr', ?, 'Cat FR', 'Desc FR', 'Detail FR', 'Challenges FR', 'Impact FR'),
                   (?, 'en', ?, 'Cat EN', 'Desc EN', 'Detail EN', 'Challenges EN', 'Impact EN')`
        )
        .bind(id, `Titre ${i} FR`, id, `Title ${i} EN`)
        .run();
    }
  });

  describe("createProjectAtomic", () => {
    it("should insert at sort_order=0 and shift all 5 existing projects by +1", async () => {
      const newId = "p-new-0";
      const newInput = makeProjectInput("project-new-zero", 0);

      await createProjectAtomic(env.portfolio_db, newId, newInput);

      const projects = await getActiveProjects(env.portfolio_db);
      expect(projects).toHaveLength(6);

      // Verify exact sort_order for every single project
      expect(projects[0]).toMatchObject({ id: newId, sort_order: 0 });
      expect(projects[1]).toMatchObject({ id: "p0", sort_order: 1 });
      expect(projects[2]).toMatchObject({ id: "p1", sort_order: 2 });
      expect(projects[3]).toMatchObject({ id: "p2", sort_order: 3 });
      expect(projects[4]).toMatchObject({ id: "p3", sort_order: 4 });
      expect(projects[5]).toMatchObject({ id: "p4", sort_order: 5 });

      // Verify translations
      const { results: translations } = await env.portfolio_db
        .prepare("SELECT locale, title FROM project_translations WHERE project_id = ? ORDER BY locale ASC")
        .bind(newId)
        .all<TranslationRow>();

      expect(translations).toHaveLength(2);
      expect(translations?.[0]).toMatchObject({ locale: "en", title: "Title project-new-zero EN" });
      expect(translations?.[1]).toMatchObject({ locale: "fr", title: "Titre project-new-zero FR" });
    });

    it("should insert at sort_order=5 without shifting any existing project", async () => {
      const newId = "p-new-tail";
      const newInput = makeProjectInput("project-new-tail", 5);

      await createProjectAtomic(env.portfolio_db, newId, newInput);

      const projects = await getActiveProjects(env.portfolio_db);
      expect(projects).toHaveLength(6);

      expect(projects[0]).toMatchObject({ id: "p0", sort_order: 0 });
      expect(projects[1]).toMatchObject({ id: "p1", sort_order: 1 });
      expect(projects[2]).toMatchObject({ id: "p2", sort_order: 2 });
      expect(projects[3]).toMatchObject({ id: "p3", sort_order: 3 });
      expect(projects[4]).toMatchObject({ id: "p4", sort_order: 4 });
      expect(projects[5]).toMatchObject({ id: newId, sort_order: 5 });
    });

    it("should insert at sort_order=2, keeping 0 and 1 intact while shifting >= 2 by +1", async () => {
      const newId = "p-new-middle";
      const newInput = makeProjectInput("project-new-middle", 2);

      await createProjectAtomic(env.portfolio_db, newId, newInput);

      const projects = await getActiveProjects(env.portfolio_db);
      expect(projects).toHaveLength(6);

      expect(projects[0]).toMatchObject({ id: "p0", sort_order: 0 });
      expect(projects[1]).toMatchObject({ id: "p1", sort_order: 1 });
      expect(projects[2]).toMatchObject({ id: newId, sort_order: 2 });
      expect(projects[3]).toMatchObject({ id: "p2", sort_order: 3 });
      expect(projects[4]).toMatchObject({ id: "p3", sort_order: 4 });
      expect(projects[5]).toMatchObject({ id: "p4", sort_order: 5 });
    });
  });

  describe("updateProjectAtomic", () => {
    it("should shift projects between target and source when moving to an earlier position (3 -> 1)", async () => {
      // Move p3 (initially at 3) to sortOrder 1
      const updateInput = makeProjectInput("project-3", 1, { titleFr: "P3 Updated Title" });
      await updateProjectAtomic(env.portfolio_db, "p3", updateInput);

      const projects = await getActiveProjects(env.portfolio_db);
      expect(projects).toHaveLength(5);

      expect(projects[0]).toMatchObject({ id: "p0", sort_order: 0 });
      expect(projects[1]).toMatchObject({ id: "p3", sort_order: 1 });
      expect(projects[2]).toMatchObject({ id: "p1", sort_order: 2 });
      expect(projects[3]).toMatchObject({ id: "p2", sort_order: 3 });
      expect(projects[4]).toMatchObject({ id: "p4", sort_order: 4 });
    });

    it("should shift projects between source and target when moving to a later position (1 -> 3)", async () => {
      // Move p1 (initially at 1) to sortOrder 3
      const updateInput = makeProjectInput("project-1", 3);
      await updateProjectAtomic(env.portfolio_db, "p1", updateInput);

      const projects = await getActiveProjects(env.portfolio_db);
      expect(projects).toHaveLength(5);

      expect(projects[0]).toMatchObject({ id: "p0", sort_order: 0 });
      expect(projects[1]).toMatchObject({ id: "p2", sort_order: 1 });
      expect(projects[2]).toMatchObject({ id: "p3", sort_order: 2 });
      expect(projects[3]).toMatchObject({ id: "p1", sort_order: 3 });
      expect(projects[4]).toMatchObject({ id: "p4", sort_order: 4 });
    });

    it("should leave all sort_orders unchanged when updating a project without changing its sortOrder", async () => {
      const updateInput = makeProjectInput("project-2", 2, { titleFr: "Renamed Title Only" });
      await updateProjectAtomic(env.portfolio_db, "p2", updateInput);

      const projects = await getActiveProjects(env.portfolio_db);
      expect(projects).toHaveLength(5);

      expect(projects[0]).toMatchObject({ id: "p0", sort_order: 0 });
      expect(projects[1]).toMatchObject({ id: "p1", sort_order: 1 });
      expect(projects[2]).toMatchObject({ id: "p2", sort_order: 2 });
      expect(projects[3]).toMatchObject({ id: "p3", sort_order: 3 });
      expect(projects[4]).toMatchObject({ id: "p4", sort_order: 4 });

      // Verify translation was updated
      const tr = await env.portfolio_db
        .prepare("SELECT title FROM project_translations WHERE project_id = 'p2' AND locale = 'fr'")
        .first<{ title: string }>();
      expect(tr?.title).toBe("Renamed Title Only");
    });
  });

  describe("deleteProjectAtomic (soft-delete)", () => {
    it("should set deleted_at, decrement sort_order for subsequent active projects, and preserve translations", async () => {
      // Soft-delete p2 (at sort_order 2)
      const success = await deleteProjectAtomic(env.portfolio_db, "p2");
      expect(success).toBe(true);

      const activeProjects = await getActiveProjects(env.portfolio_db);
      expect(activeProjects).toHaveLength(4);

      expect(activeProjects[0]).toMatchObject({ id: "p0", sort_order: 0 });
      expect(activeProjects[1]).toMatchObject({ id: "p1", sort_order: 1 });
      expect(activeProjects[2]).toMatchObject({ id: "p3", sort_order: 2 });
      expect(activeProjects[3]).toMatchObject({ id: "p4", sort_order: 3 });

      // Verify p2 still exists in table with deleted_at set
      const p2Row = await env.portfolio_db
        .prepare("SELECT id, sort_order, deleted_at FROM projects WHERE id = 'p2'")
        .first<ProjectRow>();
      expect(p2Row?.deleted_at).not.toBeNull();

      // Verify translations are preserved
      const { results: trs } = await env.portfolio_db
        .prepare("SELECT locale FROM project_translations WHERE project_id = 'p2'")
        .all<{ locale: string }>();
      expect(trs).toHaveLength(2);
    });

    it("should return false without side-effects when deleting an already soft-deleted project", async () => {
      await deleteProjectAtomic(env.portfolio_db, "p2");

      // Attempt to delete p2 again
      const secondAttempt = await deleteProjectAtomic(env.portfolio_db, "p2");
      expect(secondAttempt).toBe(false);

      const activeProjects = await getActiveProjects(env.portfolio_db);
      expect(activeProjects).toHaveLength(4);
      expect(activeProjects[0]).toMatchObject({ id: "p0", sort_order: 0 });
      expect(activeProjects[1]).toMatchObject({ id: "p1", sort_order: 1 });
      expect(activeProjects[2]).toMatchObject({ id: "p3", sort_order: 2 });
      expect(activeProjects[3]).toMatchObject({ id: "p4", sort_order: 3 });
    });
  });

  describe("restoreProject", () => {
    it("should restore a deleted project back to its original position and shift subsequent projects by +1", async () => {
      // 1. Delete p2 (sort_order was 2)
      await deleteProjectAtomic(env.portfolio_db, "p2");

      // 2. Restore p2
      const restored = await restoreProject(env.portfolio_db, "p2");
      expect(restored).toBe(true);

      const activeProjects = await getActiveProjects(env.portfolio_db);
      expect(activeProjects).toHaveLength(5);

      expect(activeProjects[0]).toMatchObject({ id: "p0", sort_order: 0 });
      expect(activeProjects[1]).toMatchObject({ id: "p1", sort_order: 1 });
      expect(activeProjects[2]).toMatchObject({ id: "p2", sort_order: 2, deleted_at: null });
      expect(activeProjects[3]).toMatchObject({ id: "p3", sort_order: 3 });
      expect(activeProjects[4]).toMatchObject({ id: "p4", sort_order: 4 });
    });

    it("should restore correctly when new projects were created while the project was in trash", async () => {
      // 1. Delete p1 (sort_order was 1)
      await deleteProjectAtomic(env.portfolio_db, "p1");
      // Current active: p0 (0), p2 (1), p3 (2), p4 (3)

      // 2. Create a new project taking position 1
      const newId = "p-interleaved";
      await createProjectAtomic(env.portfolio_db, newId, makeProjectInput("interleaved", 1));
      // Current active: p0 (0), p-interleaved (1), p2 (2), p3 (3), p4 (4)

      // 3. Restore p1 (original sort_order is 1)
      // Restoration shifts all active projects >= 1 by +1, making room for p1 at 1
      const restored = await restoreProject(env.portfolio_db, "p1");
      expect(restored).toBe(true);

      const activeProjects = await getActiveProjects(env.portfolio_db);
      expect(activeProjects).toHaveLength(6);

      expect(activeProjects[0]).toMatchObject({ id: "p0", sort_order: 0 });
      expect(activeProjects[1]).toMatchObject({ id: newId, sort_order: 1 });
      expect(activeProjects[2]).toMatchObject({ id: "p1", sort_order: 2, deleted_at: null });
      expect(activeProjects[3]).toMatchObject({ id: "p2", sort_order: 3 });
      expect(activeProjects[4]).toMatchObject({ id: "p3", sort_order: 4 });
      expect(activeProjects[5]).toMatchObject({ id: "p4", sort_order: 5 });
    });
  });
});
