import { describe, it, expect } from "vitest";
import { validateProjectInput, ProjectFormInput } from "@/lib/validation/project";

const VALID_PROJECT: ProjectFormInput = {
  slug: "scada-industrial-supervision",
  year: 2026,
  technologies: ["Ignition", "Python", "OPC-UA", "TypeScript"],
  themeColorR: 66,
  themeColorG: 133,
  themeColorB: 244,
  githubUrl: "https://github.com/enrique-alex/scada-project",
  coverImage: "/image/projects/cover.webp",
  gallery: [
    "/image/projects/screen1.png",
    "https://pub-f2abb97fd5a44520b79d8e56bf020956.r2.dev/screen2.webp",
  ],
  sortOrder: 2,
  isFeatured: true,
  titleFr: "Supervision SCADA Industrielle",
  categoryFr: "Automatisme & SCADA",
  shortDescriptionFr: "Développement d'un système SCADA moderne pour le suivi de production.",
  detailedDescriptionFr: "Description détaillée de l'architecture et du déploiement...",
  technicalChallengesFr: "Gestion des temps de cycle et communication temps réel...",
  impactFr: "Amélioration de 30% du temps de diagnostic des pannes...",
  titleEn: "Industrial SCADA Supervision",
  categoryEn: "Automation & SCADA",
  shortDescriptionEn: "Development of a modern SCADA system for production monitoring.",
  detailedDescriptionEn: "Detailed description of the architecture and deployment...",
  technicalChallengesEn: "Handling cycle times and real-time communication...",
  impactEn: "30% improvement in fault diagnosis time...",
};

describe("Project Input Validation", () => {
  const existingSlugs = ["other-project", "existing-app"];
  const currentProjectCount = 5;

  describe("Valid project inputs", () => {
    it("should accept a fully valid project input", () => {
      const result = validateProjectInput(VALID_PROJECT, existingSlugs, currentProjectCount);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
      expect(result.data?.slug).toBe(VALID_PROJECT.slug);
    });

    it("should treat empty string coverImage as null and succeed", () => {
      const input = { ...VALID_PROJECT, coverImage: "" };
      const result = validateProjectInput(input, existingSlugs, currentProjectCount);
      expect(result.valid).toBe(true);
      expect(result.data?.coverImage).toBeNull();
    });

    it("should treat null coverImage as valid", () => {
      const input = { ...VALID_PROJECT, coverImage: null };
      const result = validateProjectInput(input, existingSlugs, currentProjectCount);
      expect(result.valid).toBe(true);
      expect(result.data?.coverImage).toBeNull();
    });

    it("should accept valid R2 URL for coverImage", () => {
      const input = {
        ...VALID_PROJECT,
        coverImage: "https://pub-f2abb97fd5a44520b79d8e56bf020956.r2.dev/valid-photo.jpg",
      };
      const result = validateProjectInput(input, existingSlugs, currentProjectCount);
      expect(result.valid).toBe(true);
    });

    it("should treat empty string githubUrl as null and succeed", () => {
      const input = { ...VALID_PROJECT, githubUrl: "" };
      const result = validateProjectInput(input, existingSlugs, currentProjectCount);
      expect(result.valid).toBe(true);
      expect(result.data?.githubUrl).toBeNull();
    });

    it("should treat null githubUrl as valid", () => {
      const input = { ...VALID_PROJECT, githubUrl: null };
      const result = validateProjectInput(input, existingSlugs, currentProjectCount);
      expect(result.valid).toBe(true);
      expect(result.data?.githubUrl).toBeNull();
    });

    it("should treat empty gallery array or empty string as null and succeed", () => {
      const inputWithEmptyArray = { ...VALID_PROJECT, gallery: [] };
      const res1 = validateProjectInput(inputWithEmptyArray, existingSlugs, currentProjectCount);
      expect(res1.valid).toBe(true);
      expect(res1.data?.gallery).toBeNull();

      const inputWithEmptyString = { ...VALID_PROJECT, gallery: "" as unknown as string[] };
      const res2 = validateProjectInput(inputWithEmptyString, existingSlugs, currentProjectCount);
      expect(res2.valid).toBe(true);
      expect(res2.data?.gallery).toBeNull();
    });

    it("should default isFeatured to false when undefined", () => {
      const input = { ...VALID_PROJECT, isFeatured: undefined as unknown as boolean };
      const result = validateProjectInput(input, existingSlugs, currentProjectCount);
      expect(result.valid).toBe(true);
      expect(result.data?.isFeatured).toBe(false);
    });

    it("should accept sortOrder bounds (0 and currentProjectCount)", () => {
      const inputZero = { ...VALID_PROJECT, sortOrder: 0 };
      expect(validateProjectInput(inputZero, existingSlugs, currentProjectCount).valid).toBe(true);

      const inputMax = { ...VALID_PROJECT, sortOrder: currentProjectCount };
      expect(validateProjectInput(inputMax, existingSlugs, currentProjectCount).valid).toBe(true);
    });

    it("should allow editing a project when current slug is not in existingSlugs", () => {
      // In edit mode, existingSlugs passed by the caller excludes the edited project's own slug
      const input = { ...VALID_PROJECT, slug: "my-current-slug" };
      const slugsWithoutCurrent = ["project-a", "project-b"];
      const result = validateProjectInput(input, slugsWithoutCurrent, currentProjectCount);
      expect(result.valid).toBe(true);
    });
  });

  describe("Non-object inputs", () => {
    it("should reject null without throwing", () => {
      const result = validateProjectInput(null, existingSlugs, currentProjectCount);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Données invalides.");
    });

    it("should reject undefined without throwing", () => {
      const result = validateProjectInput(undefined, existingSlugs, currentProjectCount);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Données invalides.");
    });

    it("should reject primitive string without throwing", () => {
      const result = validateProjectInput("not-an-object", existingSlugs, currentProjectCount);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Données invalides.");
    });

    it("should reject number without throwing", () => {
      const result = validateProjectInput(42, existingSlugs, currentProjectCount);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Données invalides.");
    });
  });

  describe("Individual field validation errors", () => {
    describe("slug validation", () => {
      it("should reject slug with uppercase characters", () => {
        const input = { ...VALID_PROJECT, slug: "Invalid-Uppercase-Slug" };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Le slug doit contenir entre 3 et 100 caractères");
      });

      it("should reject slug shorter than 3 characters", () => {
        const input = { ...VALID_PROJECT, slug: "ab" };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Le slug doit contenir entre 3 et 100 caractères");
      });

      it("should reject slug longer than 100 characters", () => {
        const input = { ...VALID_PROJECT, slug: "a".repeat(101) };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Le slug doit contenir entre 3 et 100 caractères");
      });

      it("should reject slug with invalid characters or bad dash placement", () => {
        expect(validateProjectInput({ ...VALID_PROJECT, slug: "-start-dash" }, existingSlugs, currentProjectCount).valid).toBe(false);
        expect(validateProjectInput({ ...VALID_PROJECT, slug: "end-dash-" }, existingSlugs, currentProjectCount).valid).toBe(false);
        expect(validateProjectInput({ ...VALID_PROJECT, slug: "slug_with_underscores" }, existingSlugs, currentProjectCount).valid).toBe(false);
        expect(validateProjectInput({ ...VALID_PROJECT, slug: "slug.with.dots" }, existingSlugs, currentProjectCount).valid).toBe(false);
      });

      it("should reject duplicate slug present in existingSlugs", () => {
        const input = { ...VALID_PROJECT, slug: "other-project" };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Ce slug est déjà utilisé par un autre projet.");
      });
    });

    describe("year validation", () => {
      it("should reject year below 2000", () => {
        const input = { ...VALID_PROJECT, year: 1999 };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("L'année doit être un nombre entier compris entre 2000 et 2030");
      });

      it("should reject year above 2030", () => {
        const input = { ...VALID_PROJECT, year: 2031 };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("L'année doit être un nombre entier");
      });

      it("should reject non-integer year", () => {
        const input = { ...VALID_PROJECT, year: 2024.5 };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("L'année doit être un nombre entier");
      });
    });

    describe("technologies validation", () => {
      it("should reject empty technologies array", () => {
        const input = { ...VALID_PROJECT, technologies: [] };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Les technologies doivent être une liste de 1 à 20 éléments");
      });

      it("should reject more than 20 technologies", () => {
        const input = { ...VALID_PROJECT, technologies: Array.from({ length: 21 }, (_, i) => `Tech${i}`) };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Les technologies doivent être une liste de 1 à 20 éléments");
      });

      it("should reject technology element exceeding 50 characters", () => {
        const input = { ...VALID_PROJECT, technologies: ["ValidTech", "T".repeat(51)] };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Les technologies doivent être une liste de 1 à 20 éléments");
      });

      it("should reject technology element with empty string", () => {
        const input = { ...VALID_PROJECT, technologies: ["ValidTech", ""] };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Les technologies doivent être une liste de 1 à 20 éléments");
      });
    });

    describe("themeColor validation", () => {
      it("should reject RGB value < 0", () => {
        const input = { ...VALID_PROJECT, themeColorR: -1 };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Les couleurs du thème (RGB) doivent être des nombres entiers entre 0 et 255");
      });

      it("should reject RGB value > 255", () => {
        const input = { ...VALID_PROJECT, themeColorG: 256 };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Les couleurs du thème (RGB)");
      });

      it("should reject non-integer RGB value", () => {
        const input = { ...VALID_PROJECT, themeColorB: 128.4 };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Les couleurs du thème (RGB)");
      });
    });

    describe("githubUrl validation", () => {
      it("should reject URL not starting with https://", () => {
        const input = { ...VALID_PROJECT, githubUrl: "http://github.com/insecure" };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('L\'URL GitHub doit commencer exactement par "https://"');
      });
    });

    describe("coverImage and gallery validation", () => {
      it("should reject coverImage from unauthorized external domain", () => {
        const input = { ...VALID_PROJECT, coverImage: "https://unauthorized-domain.com/photo.png" };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("L'image de couverture doit respecter le format");
      });

      it("should reject coverImage with invalid local prefix", () => {
        const input = { ...VALID_PROJECT, coverImage: "/static/uploads/photo.png" };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("L'image de couverture doit respecter le format");
      });

      it("should reject gallery containing an invalid image path", () => {
        const input = {
          ...VALID_PROJECT,
          gallery: ["/image/projects/good.png", "https://unauthorized.org/bad.png"],
        };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Chaque image de la galerie doit respecter le format");
      });

      it("should reject non-array gallery", () => {
        const input = { ...VALID_PROJECT, gallery: 12345 as unknown as string[] };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("La galerie doit être une liste d'images");
      });
    });

    describe("sortOrder validation", () => {
      it("should reject sortOrder < 0", () => {
        const input = { ...VALID_PROJECT, sortOrder: -1 };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("L'ordre de tri doit être un entier");
      });

      it("should reject sortOrder > currentProjectCount", () => {
        const input = { ...VALID_PROJECT, sortOrder: currentProjectCount + 1 };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain(`L'ordre de tri doit être un entier entre 0 et ${currentProjectCount} inclus.`);
      });
    });

    describe("isFeatured validation", () => {
      it("should reject non-boolean isFeatured", () => {
        const input = { ...VALID_PROJECT, isFeatured: "true" as unknown as boolean };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Le champ 'isFeatured' doit être un booléen");
      });
    });

    describe("localized text fields validation", () => {
      it("should reject empty titleFr", () => {
        const input = { ...VALID_PROJECT, titleFr: "   " };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Le champ Titre (FR) est requis");
      });

      it("should reject titleFr exceeding 200 characters", () => {
        const input = { ...VALID_PROJECT, titleFr: "A".repeat(201) };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Le champ Titre (FR) ne doit pas dépasser 200 caractères");
      });

      it("should reject shortDescriptionFr exceeding 300 characters", () => {
        const input = { ...VALID_PROJECT, shortDescriptionFr: "A".repeat(301) };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Le champ Description Courte (FR) ne doit pas dépasser 300 caractères");
      });

      it("should reject empty detailedDescriptionEn", () => {
        const input = { ...VALID_PROJECT, detailedDescriptionEn: "" };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Le champ Description Détaillée (EN) est requis");
      });

      it("should reject technicalChallengesFr exceeding 5000 characters", () => {
        const input = { ...VALID_PROJECT, technicalChallengesFr: "A".repeat(5001) };
        const result = validateProjectInput(input, existingSlugs, currentProjectCount);
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain("Le champ Défis Techniques (FR) ne doit pas dépasser 5000 caractères");
      });
    });
  });

  describe("Accumulation of all validation errors", () => {
    it("should return ALL errors when multiple fields are invalid simultaneously", () => {
      // Intentionally break 5 distinct fields:
      // 1. slug (uppercase)
      // 2. year (< 2000)
      // 3. technologies (empty array)
      // 4. themeColorR (> 255)
      // 5. titleFr (empty)
      const multiInvalidInput = {
        ...VALID_PROJECT,
        slug: "INVALID_SLUG",
        year: 1990,
        technologies: [],
        themeColorR: 300,
        titleFr: "",
      };

      const result = validateProjectInput(multiInvalidInput, existingSlugs, currentProjectCount);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(5);
      expect(result.errors.some((e) => e.includes("Le slug"))).toBe(true);
      expect(result.errors.some((e) => e.includes("L'année"))).toBe(true);
      expect(result.errors.some((e) => e.includes("Les technologies"))).toBe(true);
      expect(result.errors.some((e) => e.includes("Les couleurs du thème"))).toBe(true);
      expect(result.errors.some((e) => e.includes("Le champ Titre (FR)"))).toBe(true);
    });
  });
});
