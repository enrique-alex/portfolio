import { describe, it, expect } from "vitest";
import { FALLBACK_PROJECTS } from "@/lib/db/fallback-projects";
import { getProjects, getProjectBySlug } from "@/lib/db/projects";

describe("Fallback Projects and Local Dev Resilience", () => {
  it("should have complete sets of fallback projects for 'fr' and 'en'", () => {
    expect(FALLBACK_PROJECTS.fr).toBeDefined();
    expect(FALLBACK_PROJECTS.en).toBeDefined();
    expect(FALLBACK_PROJECTS.fr.length).toBe(15);
    expect(FALLBACK_PROJECTS.en.length).toBe(15);
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
    expect(frProjects.length).toBe(15);
    expect(frProjects[0].slug).toBe("controle-hydraulique-bicuve-2026");

    const enProjects = await getProjects("en");
    expect(enProjects.length).toBe(15);
    expect(enProjects[0].title).toBe("Real-Time Control, Dual-Tank Hydraulic Process");
  });

  it("should find academic projects by slug in French via getProjectBySlug when D1 is unattached", async () => {
    // Cellule Robotique
    const robotique = await getProjectBySlug("cellule-robotique-industrielle-2026", "fr");
    expect(robotique).not.toBeNull();
    expect(robotique?.id).toBe("cellule-robotique");
    expect(robotique?.category).toBe("Robotique & Systèmes Autonomes");

    // Toyota Prius Bond Graph
    const prius = await getProjectBySlug("toyota-prius-bond-graph-2026", "fr");
    expect(prius).not.toBeNull();
    expect(prius?.id).toBe("toyota-prius-bond-graph");
    expect(prius?.category).toBe("Modélisation Multiphysique");

    // Véhicule Électrique REM
    const vehicule = await getProjectBySlug("commande-vehicule-electrique-rem-2026", "fr");
    expect(vehicule).not.toBeNull();
    expect(vehicule?.id).toBe("vehicule-electrique-rem");
    expect(vehicule?.category).toBe("Automatisme & Régulation");

    // IoT Network Infra
    const iot = await getProjectBySlug("architecture-reseau-iot-securisee-2026", "fr");
    expect(iot).not.toBeNull();
    expect(iot?.id).toBe("iot-network-infra");
    expect(iot?.category).toBe("Réseaux Embarqués & Cybersécurité");
  });

  it("should find academic projects by slug in English via getProjectBySlug when D1 is unattached", async () => {
    // Cellule Robotique
    const robotique = await getProjectBySlug("cellule-robotique-industrielle-2026", "en");
    expect(robotique).not.toBeNull();
    expect(robotique?.id).toBe("cellule-robotique");
    expect(robotique?.category).toBe("Robotics & Autonomous Systems");
    expect(robotique?.title).toBe("Multi-Brand Robotic Workcell & Autonomous Intralogistics");

    // Toyota Prius Bond Graph
    const prius = await getProjectBySlug("toyota-prius-bond-graph-2026", "en");
    expect(prius).not.toBeNull();
    expect(prius?.id).toBe("toyota-prius-bond-graph");
    expect(prius?.category).toBe("Multiphysics Modeling");
    expect(prius?.title).toContain("Toyota Prius HSD");

    // Véhicule Électrique REM
    const vehicule = await getProjectBySlug("commande-vehicule-electrique-rem-2026", "en");
    expect(vehicule).not.toBeNull();
    expect(vehicule?.id).toBe("vehicule-electrique-rem");
    expect(vehicule?.category).toBe("Automation & Control");
    expect(vehicule?.title).toContain("Electric Vehicle Control");

    // IoT Network Infra
    const iot = await getProjectBySlug("architecture-reseau-iot-securisee-2026", "en");
    expect(iot).not.toBeNull();
    expect(iot?.id).toBe("iot-network-infra");
    expect(iot?.category).toBe("Embedded Networks & Cybersecurity");
    expect(iot?.title).toContain("Secure IoT Network Architecture");
  });

  it("should maintain strict 1-to-1 bilingual parity between FR and EN fallback projects", () => {
    const fr = FALLBACK_PROJECTS.fr;
    const en = FALLBACK_PROJECTS.en;

    expect(fr.length).toBe(en.length);

    fr.forEach((frProj, index) => {
      const enProj = en[index];
      expect(enProj.id).toBe(frProj.id);
      expect(enProj.slug).toBe(frProj.slug);
      expect(enProj.year).toBe(frProj.year);
      expect(enProj.isFeatured).toBe(frProj.isFeatured);
      expect(enProj.coverImage).toBe(frProj.coverImage);
      expect(enProj.themeColor).toEqual(frProj.themeColor);
      expect(enProj.gallery).toEqual(frProj.gallery);
    });
  });

  it("should verify that all local images referenced in fallback projects have valid format and extensions", () => {
    const validImagePattern = /^\/image\/projects\/[a-z0-9-]+\.(webp|png|jpe?g)$/i;

    for (const locale of ["fr", "en"] as const) {
      for (const proj of FALLBACK_PROJECTS[locale]) {
        if (proj.coverImage && proj.coverImage.startsWith("/image/")) {
          expect(proj.coverImage, `Cover image format invalid for ${proj.id}`).toMatch(validImagePattern);
        }
        if (proj.gallery) {
          for (const img of proj.gallery) {
            if (img.startsWith("/image/")) {
              expect(img, `Gallery image format invalid in ${proj.id}: ${img}`).toMatch(validImagePattern);
            }
          }
        }
      }
    }
  });

  it("should find an existing project by slug via getProjectBySlug when D1 is unattached", async () => {
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
