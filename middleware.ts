import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifySessionCookie } from "@/lib/auth/session";

/**
 * Middleware Next.js pour la protection des routes admin.
 *
 * Intercepte les requêtes vers /admin/* et /api/admin/* (SAUF /api/admin/login)
 * et vérifie la présence et la validité du cookie de session signé.
 *
 * LIMITATION CONNUE — getCloudflareContext dans le middleware :
 * Le middleware Next.js s'exécute en edge runtime. Sous l'adaptateur OpenNext
 * pour Cloudflare (@opennextjs/cloudflare), getCloudflareContext() est disponible
 * dans le middleware car celui-ci s'exécute dans le même worker Cloudflare.
 * Si cette hypothèse se révélait incorrecte à l'exécution (erreur au démarrage),
 * une alternative serait de stocker SESSION_SECRET dans une variable d'environnement
 * lisible côté edge via process.env, ou de déplacer la vérification dans les
 * routes elles-mêmes plutôt que dans le middleware.
 * Voir le paragraphe dédié dans le rapport livré avec ce lot.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // La route de login doit rester accessible sans authentification
  if (pathname === "/api/admin/login" || pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Lecture du cookie de session
  const sessionCookie = request.cookies.get("admin_session");

  if (!sessionCookie?.value) {
    return handleUnauthenticated(request, pathname);
  }

  // Récupération du secret de session depuis le contexte Cloudflare
  let sessionSecret: string;
  try {
    const { env } = getCloudflareContext();
    sessionSecret = env.SESSION_SECRET;
  } catch (error) {
    console.error("[middleware] Impossible d'accéder au contexte Cloudflare:", error);
    // Si le contexte n'est pas disponible, on refuse l'accès par sécurité
    return handleUnauthenticated(request, pathname);
  }

  // Vérification de la signature et de l'expiration du cookie
  const isValid = await verifySessionCookie(sessionCookie.value, sessionSecret);

  if (!isValid) {
    return handleUnauthenticated(request, pathname);
  }

  return NextResponse.next();
}

/**
 * Gère le cas d'un utilisateur non authentifié selon le type de route :
 * - Pages /admin/* : redirige vers /admin/login
 * - API /api/admin/* : retourne 401 JSON
 */
function handleUnauthenticated(request: NextRequest, pathname: string): NextResponse {
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json(
      { error: "Non autorisé." },
      { status: 401 }
    );
  }

  // Redirection vers la page de login pour les pages admin
  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

/**
 * Matcher Next.js : ne cible que les routes admin pour éviter tout impact
 * de performance sur les pages publiques du portfolio.
 */
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
