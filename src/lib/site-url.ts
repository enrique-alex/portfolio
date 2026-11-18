export const DEFAULT_SITE_URL = "https://portfolio.enriquekemayou.workers.dev";

/**
 * Résout l'URL canonique du site en priorisant NEXT_PUBLIC_SITE_URL lorsqu'elle est définie.
 */
export function getSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configuredUrl && configuredUrl.length > 0
    ? configuredUrl.replace(/\/+$/, "")
    : DEFAULT_SITE_URL;
}
