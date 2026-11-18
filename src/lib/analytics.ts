export const CF_WEB_ANALYTICS_BEACON_URL =
  "https://static.cloudflareinsights.com/beacon.min.js";

export const DEFAULT_CF_WEB_ANALYTICS_TOKEN = "2ed819b0f4ae4c7996205f7a3115398f";

export interface CloudflareWebAnalyticsBeaconConfig {
  src: string;
  dataCfBeacon: string;
}

/**
 * Résout le token public Cloudflare Web Analytics en priorisant
 * NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN lorsqu'il est défini et non vide.
 */
export function getCloudflareWebAnalyticsToken(
  configuredToken: string | undefined = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN
): string {
  const trimmed = configuredToken?.trim();
  return trimmed && trimmed.length > 0
    ? trimmed
    : DEFAULT_CF_WEB_ANALYTICS_TOKEN;
}

/**
 * Retourne la configuration du script Cloudflare Web Analytics uniquement en production.
 * Retourne `null` en développement et dans les environnements de test afin de ne pas
 * polluer les métriques RUM de production.
 */
export function getCloudflareWebAnalyticsBeaconConfig(options?: {
  nodeEnv?: string;
  token?: string;
}): CloudflareWebAnalyticsBeaconConfig | null {
  const nodeEnv = options?.nodeEnv ?? process.env.NODE_ENV;
  if (nodeEnv !== "production") {
    return null;
  }

  const token = getCloudflareWebAnalyticsToken(options?.token);

  return {
    src: CF_WEB_ANALYTICS_BEACON_URL,
    dataCfBeacon: JSON.stringify({ token }),
  };
}
