import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig(async () => {
  const migrationsPath = path.join(process.cwd(), "migrations");

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

  const plugins = [];
  const setupFiles: string[] = [];
  let include: string[] | undefined = undefined;

  try {
    const { cloudflareTest, readD1Migrations } = await import("@cloudflare/vitest-plugin");
    const migrations = await readD1Migrations(migrationsPath);
    plugins.push(
      cloudflareTest({
        wrangler: { configPath: "./wrangler.toml" },
        miniflare: {
          bindings: { TEST_MIGRATIONS: migrations },
        },
      })
    );
    setupFiles.push("./test/apply-migrations.ts");
  } catch {
    // Fallback Node environment when Miniflare/undici binaries are unavailable locally
    include = ["test/unit/**/*.test.ts"];
  }

  return {
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
    plugins,
    test: {
      fileParallelism: false,
      setupFiles,
      ...(include ? { include } : {}),
    },
  };
});
