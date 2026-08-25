/**
 * Module de limitation de débit pour les tentatives de connexion.
 *
 * Utilise la table D1 login_rate_limit pour suivre les tentatives échouées
 * par adresse IP (identifier). Après 5 échecs consécutifs, l'IP est verrouillée
 * pendant 15 minutes. Toutes les requêtes utilisent des statements préparés
 * avec .bind() pour prévenir les injections SQL.
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitRow {
  identifier: string;
  failed_count: number;
  first_failed_at: string;
  locked_until: string | null;
}

/**
 * Vérifie si un identifiant (IP) est autorisé à tenter une connexion.
 *
 * @param db Instance D1Database
 * @param identifier Adresse IP du client (CF-Connecting-IP)
 * @returns allowed = true si la tentative est permise, sinon retryAfterSeconds indique le temps restant
 */
export async function checkRateLimit(
  db: D1Database,
  identifier: string
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const stmt = db.prepare(
    "SELECT identifier, failed_count, first_failed_at, locked_until FROM login_rate_limit WHERE identifier = ?"
  );
  const row = await stmt.bind(identifier).first<RateLimitRow>();

  if (!row) {
    return { allowed: true };
  }

  if (!row.locked_until) {
    return { allowed: true };
  }

  const lockedUntil = new Date(row.locked_until).getTime();
  const now = Date.now();

  if (lockedUntil <= now) {
    // Le verrouillage a expiré
    return { allowed: true };
  }

  // Encore verrouillé
  const retryAfterSeconds = Math.ceil((lockedUntil - now) / 1000);
  return { allowed: false, retryAfterSeconds };
}

/**
 * Enregistre une tentative de connexion échouée pour un identifiant (IP).
 *
 * Utilise un UPSERT (INSERT ... ON CONFLICT) pour créer ou mettre à jour
 * atomiquement le compteur d'échecs. Si le seuil de 5 échecs est atteint,
 * verrouille l'identifiant pendant 15 minutes.
 *
 * @param db Instance D1Database
 * @param identifier Adresse IP du client
 */
export async function recordFailedAttempt(
  db: D1Database,
  identifier: string
): Promise<void> {
  const now = new Date().toISOString();

  // UPSERT : insère une nouvelle ligne ou incrémente le compteur existant
  await db
    .prepare(
      `INSERT INTO login_rate_limit (identifier, failed_count, first_failed_at, locked_until)
       VALUES (?, 1, ?, NULL)
       ON CONFLICT(identifier) DO UPDATE SET
         failed_count = CASE
           WHEN locked_until IS NOT NULL AND locked_until < ? THEN 1
           ELSE failed_count + 1
         END,
         first_failed_at = CASE
           WHEN locked_until IS NOT NULL AND locked_until < ? THEN ?
           ELSE first_failed_at
         END,
         locked_until = CASE
           WHEN locked_until IS NOT NULL AND locked_until < ? THEN NULL
           ELSE locked_until
         END`
    )
    .bind(identifier, now, now, now, now, now)
    .run();

  // Vérifie si le seuil est atteint et applique le verrouillage
  const row = await db
    .prepare(
      "SELECT failed_count, locked_until FROM login_rate_limit WHERE identifier = ?"
    )
    .bind(identifier)
    .first<{ failed_count: number; locked_until: string | null }>();

  if (row && row.failed_count >= MAX_FAILED_ATTEMPTS && !row.locked_until) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
    await db
      .prepare(
        "UPDATE login_rate_limit SET locked_until = ? WHERE identifier = ?"
      )
      .bind(lockedUntil, identifier)
      .run();
  }
}

/**
 * Réinitialise le compteur de tentatives échouées après une connexion réussie.
 * Supprime entièrement la ligne de l'identifiant dans la table.
 *
 * @param db Instance D1Database
 * @param identifier Adresse IP du client
 */
export async function resetRateLimit(
  db: D1Database,
  identifier: string
): Promise<void> {
  await db
    .prepare("DELETE FROM login_rate_limit WHERE identifier = ?")
    .bind(identifier)
    .run();
}
