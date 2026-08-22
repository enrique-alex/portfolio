import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";

export default defineConfig(async () => {
  const migrationsPath = path.join(process.cwd(), "migrations");
  const migrations = await readD1Migrations(migrationsPath);

  // Assure la présence du dossier d'assets attendu par wrangler.toml en environnement CI
  const assetsDir = path.join(process.cwd(), ".open-next", "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  return {
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
    plugins: [
      cloudflareTest({
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: {
          bindings: { TEST_MIGRATIONS: migrations },
        },
      }),
    ],
    test: {
      setupFiles: ["./test/apply-migrations.ts"],
    },
  };
});
