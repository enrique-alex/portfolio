/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="@cloudflare/vitest-plugin/types" />
import { applyD1Migrations, env, type D1Migration } from "cloudflare:test";

declare global {
  namespace Cloudflare {
    interface Env {
      TEST_MIGRATIONS: D1Migration[];
    }
  }
}

await applyD1Migrations(env.portfolio_db, env.TEST_MIGRATIONS);

// Bridge React CJS and ESM internals in Miniflare isolate so SSR hooks resolve correctly in unit tests
try {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const cjsReact = require("react");
  const esmReact = await import("react");

  const cjsInternals = (cjsReact as Record<string, unknown>)?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE as Record<string, unknown> | undefined;
  const esmInternals = (esmReact as Record<string, unknown>)?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE as Record<string, unknown> | undefined;

  if (cjsInternals && esmInternals && cjsInternals !== esmInternals) {
    Object.defineProperty(esmInternals, "H", {
      get() {
        return cjsInternals.H;
      },
      set(val) {
        cjsInternals.H = val;
      },
      configurable: true,
      enumerable: true,
    });
    Object.defineProperty(esmInternals, "A", {
      get() {
        return cjsInternals.A;
      },
      set(val) {
        cjsInternals.A = val;
      },
      configurable: true,
      enumerable: true,
    });
  }
} catch {
  // Graceful fallback if node:module is unavailable
}

