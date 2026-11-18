/// <reference types="@cloudflare/vitest-plugin/types" />
/// <reference path="../../worker-configuration.d.ts" />
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { env } from "cloudflare:test";
import {
  extractR2KeyFromUrl,
  purgeExpiredProjects,
} from "@/lib/db/admin-projects-write";

const R2_BASE = "https://pub-f2abb97fd5a44520b79d8e56bf020956.r2.dev";

async function insertTestProject(options: {
  id: string;
  slug: string;
  coverImage: string | null;
  gallery: string[] | null;
  deletedAtModifier: string | null;
}) {
  const deletedAtExpr = options.deletedAtModifier
    ? `datetime('now', '${options.deletedAtModifier}')`
    : "NULL";

  await env.portfolio_db
    .prepare(
      `INSERT INTO projects (
        id, slug, year, technologies, theme_color_r, theme_color_g, theme_color_b,
        github_url, cover_image, gallery, sort_order, is_featured, deleted_at
      ) VALUES (?, ?, 2026, '["TS"]', 0, 210, 255, NULL, ?, ?, 99, 0, ${deletedAtExpr})`
    )
    .bind(
      options.id,
      options.slug,
      options.coverImage,
      options.gallery ? JSON.stringify(options.gallery) : null
    )
    .run();

  await env.portfolio_db
    .prepare(
      `INSERT INTO project_translations (
        project_id, locale, title, category, short_description, detailed_description, technical_challenges, impact
      ) VALUES (?, 'fr', 'Titre FR', 'Cat FR', 'Court FR', 'Detail FR', 'Defis FR', 'Impact FR'),
               (?, 'en', 'Title EN', 'Cat EN', 'Short EN', 'Detail EN', 'Challenges EN', 'Impact EN')`
    )
    .bind(options.id, options.id)
    .run();
}

describe("Trash Purge & Orphan R2 Cleanup Integration", () => {
  const testIds = ["purge-expired-1", "purge-recent-2", "purge-active-3"];
  const testR2Keys = [
    "expired-cover.png",
    "expired-gallery-1.webp",
    "shared-still-used.png",
    "recent-cover.png",
  ];

  async function cleanup() {
    for (const id of testIds) {
      await env.portfolio_db
        .prepare("DELETE FROM project_translations WHERE project_id = ?")
        .bind(id)
        .run();
      await env.portfolio_db
        .prepare("DELETE FROM projects WHERE id = ?")
        .bind(id)
        .run();
    }
    await env.portfolio_images.delete(testR2Keys);
  }

  beforeEach(cleanup);
  afterEach(cleanup);

  it("extractR2KeyFromUrl should only extract valid single-segment R2 keys", () => {
    expect(extractR2KeyFromUrl(`${R2_BASE}/abc-123.webp`, R2_BASE)).toBe("abc-123.webp");
    expect(extractR2KeyFromUrl(`${R2_BASE}/abc-123.webp`, `${R2_BASE}/`)).toBe("abc-123.webp");
    expect(extractR2KeyFromUrl("/image/projects/local.webp", R2_BASE)).toBeNull();
    expect(extractR2KeyFromUrl("https://evil.example.com/abc.png", R2_BASE)).toBeNull();
    expect(extractR2KeyFromUrl(`${R2_BASE}/../secret.png`, R2_BASE)).toBeNull();
    expect(extractR2KeyFromUrl(null, R2_BASE)).toBeNull();
  });

  it("should purge expired projects (>90 days) and delete orphan R2 objects while preserving recent/shared objects", async () => {
    await env.portfolio_images.put("expired-cover.png", "cover-bytes");
    await env.portfolio_images.put("expired-gallery-1.webp", "gallery-bytes");
    await env.portfolio_images.put("shared-still-used.png", "shared-bytes");
    await env.portfolio_images.put("recent-cover.png", "recent-bytes");

    await insertTestProject({
      id: "purge-expired-1",
      slug: "purge-expired-1",
      coverImage: `${R2_BASE}/expired-cover.png`,
      gallery: [
        `${R2_BASE}/expired-gallery-1.webp`,
        `${R2_BASE}/shared-still-used.png`,
        "/image/projects/controle-hydraulique-cover.webp",
      ],
      deletedAtModifier: "-91 days",
    });

    await insertTestProject({
      id: "purge-recent-2",
      slug: "purge-recent-2",
      coverImage: `${R2_BASE}/recent-cover.png`,
      gallery: null,
      deletedAtModifier: "-10 days",
    });

    await insertTestProject({
      id: "purge-active-3",
      slug: "purge-active-3",
      coverImage: `${R2_BASE}/shared-still-used.png`,
      gallery: null,
      deletedAtModifier: null,
    });

    const purgedCount = await purgeExpiredProjects(
      env.portfolio_db,
      env.portfolio_images,
      R2_BASE
    );
    expect(purgedCount).toBe(1);

    const expiredRow = await env.portfolio_db
      .prepare("SELECT id FROM projects WHERE id = ?")
      .bind("purge-expired-1")
      .first();
    expect(expiredRow).toBeNull();

    const recentRow = await env.portfolio_db
      .prepare("SELECT id FROM projects WHERE id = ?")
      .bind("purge-recent-2")
      .first();
    expect(recentRow).not.toBeNull();

    expect(await env.portfolio_images.get("expired-cover.png")).toBeNull();
    expect(await env.portfolio_images.get("expired-gallery-1.webp")).toBeNull();
    expect(await env.portfolio_images.get("shared-still-used.png")).not.toBeNull();
    expect(await env.portfolio_images.get("recent-cover.png")).not.toBeNull();
  });
});
