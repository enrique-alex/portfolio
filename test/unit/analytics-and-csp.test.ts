import { describe, it, expect } from "vitest";
import {
  CF_WEB_ANALYTICS_BEACON_URL,
  DEFAULT_CF_WEB_ANALYTICS_TOKEN,
  getCloudflareWebAnalyticsToken,
  getCloudflareWebAnalyticsBeaconConfig,
} from "@/lib/analytics";

// @ts-expect-error Vite raw query import
import nextConfigRaw from "../../next.config.ts?raw";
// @ts-expect-error Vite raw query import
import publicHeadersRaw from "../../public/_headers?raw";
// @ts-expect-error Vite raw query import
import rootLayoutRaw from "@/app/layout.tsx?raw";

function extractNextConfigCsp(source: string): string {
  const match = source.match(
    /key:\s*["']Content-Security-Policy["'],\s*value:\s*"([^"]+)"/s
  );
  if (!match) {
    throw new Error("Unable to locate Content-Security-Policy in next.config.ts");
  }
  return match[1];
}

function extractPublicHeadersCsp(source: string): string {
  const match = source.match(/^\s*Content-Security-Policy:\s*(.+)$/m);
  if (!match) {
    throw new Error("Unable to locate Content-Security-Policy in public/_headers");
  }
  return match[1].trim();
}

describe("Cloudflare Web Analytics configuration", () => {
  it("should fall back to the default portfolio RUM token when env var is missing or blank", () => {
    expect(getCloudflareWebAnalyticsToken(undefined)).toBe(DEFAULT_CF_WEB_ANALYTICS_TOKEN);
    expect(getCloudflareWebAnalyticsToken("")).toBe(DEFAULT_CF_WEB_ANALYTICS_TOKEN);
    expect(getCloudflareWebAnalyticsToken("   \t\n  ")).toBe(DEFAULT_CF_WEB_ANALYTICS_TOKEN);
  });

  it("should trim and prefer a custom NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN when provided", () => {
    expect(getCloudflareWebAnalyticsToken("  custom-token-abc123  ")).toBe("custom-token-abc123");
  });

  it("should return null outside production to avoid polluting analytics in dev/test", () => {
    expect(getCloudflareWebAnalyticsBeaconConfig({ nodeEnv: "development" })).toBeNull();
    expect(getCloudflareWebAnalyticsBeaconConfig({ nodeEnv: "test" })).toBeNull();
    expect(getCloudflareWebAnalyticsBeaconConfig({ nodeEnv: "" })).toBeNull();
  });

  it("should return a valid beacon script configuration in production", () => {
    const defaultCfg = getCloudflareWebAnalyticsBeaconConfig({
      nodeEnv: "production",
      token: "",
    });
    expect(defaultCfg).not.toBeNull();
    expect(defaultCfg?.src).toBe(CF_WEB_ANALYTICS_BEACON_URL);
    expect(JSON.parse(defaultCfg!.dataCfBeacon)).toEqual({
      token: DEFAULT_CF_WEB_ANALYTICS_TOKEN,
    });

    const customCfg = getCloudflareWebAnalyticsBeaconConfig({
      nodeEnv: "production",
      token: "  0123456789abcdef0123456789abcdef  ",
    });
    expect(customCfg).not.toBeNull();
    expect(JSON.parse(customCfg!.dataCfBeacon)).toEqual({
      token: "0123456789abcdef0123456789abcdef",
    });
  });

  it("should wire the deferred Cloudflare Web Analytics beacon into RootLayout", () => {
    expect(rootLayoutRaw).toContain("getCloudflareWebAnalyticsBeaconConfig");
    expect(rootLayoutRaw).toContain("data-cf-beacon={cfAnalytics.dataCfBeacon}");
    expect(rootLayoutRaw).toContain("src={cfAnalytics.src}");
  });
});

describe("Content-Security-Policy parity for Cloudflare Web Analytics", () => {
  it("should keep next.config.ts and public/_headers CSP strictly identical", () => {
    const nextCsp = extractNextConfigCsp(nextConfigRaw);
    const headersCsp = extractPublicHeadersCsp(publicHeadersRaw);
    expect(nextCsp).toBe(headersCsp);
  });

  it("should allow Cloudflare Web Analytics script and beacon endpoint without weakening unrelated directives", () => {
    const csp = extractNextConfigCsp(nextConfigRaw);
    const directives = new Map<string, string>();
    for (const part of csp.split(";")) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const [name, ...rest] = trimmed.split(/\s+/);
      directives.set(name, rest.join(" "));
    }

    expect(directives.get("script-src")).toContain("https://static.cloudflareinsights.com");
    expect(directives.get("connect-src")).toContain("https://cloudflareinsights.com");
    expect(directives.get("connect-src")).toContain("https://api.web3forms.com");
    expect(directives.get("object-src")).toBe("'none'");
    expect(directives.get("frame-ancestors")).toBe("'none'");
    expect(directives.get("base-uri")).toBe("'self'");
    expect(directives.get("form-action")).toBe("'self'");
    expect(directives.has("upgrade-insecure-requests")).toBe(true);
  });
});
