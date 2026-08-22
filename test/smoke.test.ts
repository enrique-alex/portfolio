/// <reference types="@cloudflare/vitest-plugin/types" />
import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";

interface SqliteMasterRow {
  sql: string | null;
}

describe("D1 Database Smoke Test", () => {
  it("should have an accessible portfolio_db binding with applied migrations", async () => {
    expect(env.portfolio_db).toBeDefined();

    const result = await env.portfolio_db
      .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='projects'")
      .first<SqliteMasterRow>();

    expect(result).not.toBeNull();
    expect(result?.sql).toContain("sort_order");
  });
});
