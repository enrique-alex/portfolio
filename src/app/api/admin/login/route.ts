import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/auth/rate-limit";

interface LoginRequestBody {
  password: string;
}

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  message: string;
}

/**
 * Route POST /api/admin/login
 *
 * Authentifie l'administrateur via mot de passe.
 * - Valide le corps de la requête
 * - Vérifie la limitation de débit (rate limit) par IP
 * - Compare le mot de passe soumis au hash stocké via PBKDF2
 * - Émet un cookie de session signé HMAC-SHA256 en cas de succès
 *
 * Messages d'erreur volontairement génériques pour ne pas divulguer
 * si le compte existe, est verrouillé, ou si le mot de passe est incorrect.
 */
export async function POST(request: Request): Promise<NextResponse<ErrorResponse | SuccessResponse>> {
  try {
    // --- Parse du corps JSON ---
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ErrorResponse>(
        { error: "Corps de requête invalide." },
        { status: 400 }
      );
    }

    const { password } = body as LoginRequestBody;

    if (!password || typeof password !== "string" || password.trim().length === 0) {
      return NextResponse.json<ErrorResponse>(
        { error: "Corps de requête invalide." },
        { status: 400 }
      );
    }

    // --- Récupération du contexte Cloudflare ---
    const { env } = getCloudflareContext();
    const db = env.portfolio_db;
    const salt = env.ADMIN_PASSWORD_SALT;
    const hash = env.ADMIN_PASSWORD_HASH;
    const sessionSecret = env.SESSION_SECRET;

    // --- Identification de l'IP client ---
    const identifier = request.headers.get("CF-Connecting-IP") ?? "unknown";

    // --- Vérification du rate limit ---
    const rateLimitResult = await checkRateLimit(db, identifier);
    if (!rateLimitResult.allowed) {
      // Log l'IP verrouillée sans jamais mentionner le mot de passe soumis
      console.error(
        `[auth] Tentative bloquée par rate limit - IP: ${identifier}, retry après: ${rateLimitResult.retryAfterSeconds}s`
      );
      return NextResponse.json<ErrorResponse>(
        { error: "Trop de tentatives. Veuillez réessayer plus tard." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds ?? 900),
          },
        }
      );
    }

    // --- Vérification du mot de passe ---
    const isValid = await verifyPassword(password, salt, hash);

    if (!isValid) {
      // Log l'échec sans jamais inclure le mot de passe soumis
      console.error(`[auth] Échec d'authentification - IP: ${identifier}, date: ${new Date().toISOString()}`);
      await recordFailedAttempt(db, identifier);
      return NextResponse.json<ErrorResponse>(
        { error: "Identifiants invalides." },
        { status: 401 }
      );
    }

    // --- Connexion réussie ---
    await resetRateLimit(db, identifier);
    const cookieValue = await createSessionCookie(sessionSecret);

    const response = NextResponse.json<SuccessResponse>(
      { message: "Connexion réussie." },
      { status: 200 }
    );

    response.headers.set(
      "Set-Cookie",
      `admin_session=${cookieValue}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200`
    );

    return response;
  } catch (error) {
    // Log l'erreur interne sans jamais exposer de stack trace au client
    console.error("[auth] Erreur interne lors de l'authentification:", error);
    return NextResponse.json<ErrorResponse>(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}
