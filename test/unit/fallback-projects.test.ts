import { describe, it, expect } from "vitest";
import { FALLBACK_PROJECTS } from "@/lib/db/fallback-projects";
import { getProjects, getProjectBySlug } from "@/lib/db/projects";

describe("Fallback Projects and Local Dev Resilience", () => {
  it("should have complete sets of fallback projects for 'fr' and 'en'", () => {
    expect(FALLBACK_PROJECTS.fr).toBeDefined();
    expect(FALLBACK_PROJECTS.en).toBeDefined();
    expect(FALLBACK_PROJECTS.fr.length).toBe(12);
    expect(FALLBACK_PROJECTS.en.length).toBe(12);
  });

  it("every fallback project should satisfy the Project schema requirements", () => {
    for (const locale of ["fr", "en"] as const) {
      const list = FALLBACK_PROJECTS[locale];
      for (const p of list) {
        expect(p.id).toBeTruthy();
        expect(p.slug).toBeTruthy();
        expect(p.title).toBeTruthy();
        expect(p.year).toBeGreaterThanOrEqual(2020);
        expect(p.category).toBeTruthy();
        expect(p.shortDescription).toBeTruthy();
        expect(p.detailedDescription).toBeTruthy();
        expect(p.technicalChallenges).toBeTruthy();
        expect(p.impact).toBeTruthy();
        expect(Array.isArray(p.technologies)).toBe(true);
        expect(p.technologies.length).toBeGreaterThan(0);
        expect(typeof p.isFeatured).toBe("boolean");
        expect(p.themeColor).toBeDefined();
        expect(typeof p.themeColor.r).toBe("number");
        expect(typeof p.themeColor.g).toBe("number");
        expect(typeof p.themeColor.b).toBe("number");
      }
    }
  });

  it("should retrieve all projects via getProjects when D1 is unattached", async () => {
    const frProjects = await getProjects("fr");
    expect(frProjects.length).toBe(12);
    expect(frProjects[0].slug).toBe("controle-hydraulique-bicuve-2026");

    const enProjects = await getProjects("en");
    expect(enProjects.length).toBe(12);
    expect(enProjects[0].title).toBe("Real-Time Control, Dual-Tank Hydraulic Process");
  });

  it("should find a project by slug via getProjectBySlug when D1 is unattached", async () => {
    const project = await getProjectBySlug("filtre-tchebychev-2026", "fr");
    expect(project).not.toBeNull();
    expect(project?.id).toBe("filtre-tchebychev");
    expect(project?.title).toBe("Filtre Passe-Bas Actif de Tchebychev");
  });

  it("should return null for non-existent slug", async () => {
    const notFound = await getProjectBySlug("unknown-non-existent-project", "fr");
    expect(notFound).toBeNull();
  });

  it("should return null for empty slug", async () => {
    const notFound = await getProjectBySlug("", "fr");
    expect(notFound).toBeNull();
  });
});
