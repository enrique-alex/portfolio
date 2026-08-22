import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";

export default defineConfig(async () => {
  const migrationsPath = path.join(process.cwd(), "migrations");
  const migrations = await readD1Migrations(migrationsPath);

  // Assure la présence des fichiers et dossiers attendus par wrangler.toml en environnement CI
  const openNextDir = path.join(process.cwd(), ".open-next");
  const assetsDir = path.join(openNextDir, "assets");
  const workerFile = path.join(openNextDir, "worker.js");

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  if (!fs.existsSync(workerFile)) {
    fs.writeFileSync(workerFile, "export default {};");
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
