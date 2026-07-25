import { NextResponse } from "next/server";

interface LogoutResponse {
  message: string;
}

/**
 * Route POST /api/admin/logout
 *
 * Détruit le cookie de session en le remplaçant par un cookie vide
 * avec Max-Age=0. Les attributs de sécurité (HttpOnly, Secure, SameSite, Path)
 * doivent correspondre exactement à ceux utilisés lors de la création
 * pour que le navigateur supprime bien le bon cookie.
 */
export async function POST(): Promise<NextResponse<LogoutResponse>> {
  const response = NextResponse.json<LogoutResponse>(
    { message: "Déconnexion réussie." },
    { status: 200 }
  );

  response.headers.set(
    "Set-Cookie",
    "admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
  );

  return response;
}
