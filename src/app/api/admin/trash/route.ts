import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { purgeExpiredProjects, getTrashedProjects } from "@/lib/db/admin-projects-write";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const db = env.portfolio_db;

    // Purge paresseuse silencieuse
    await purgeExpiredProjects(db, env.portfolio_images, env.R2_PUBLIC_URL);
    const trashedProjects = await getTrashedProjects(db);

    return NextResponse.json(trashedProjects, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error(
      JSON.stringify({
        level: "error",
        scope: "api.admin.trash",
        method: "GET",
        message: "Erreur API admin trash GET",
        error: error instanceof Error ? error.message : String(error),
      })
    );
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const { env } = getCloudflareContext();
    const db = env.portfolio_db;

    // Purge manuelle explicite
    const purgedCount = await purgeExpiredProjects(db, env.portfolio_images, env.R2_PUBLIC_URL);

    return NextResponse.json({ purgedCount }, { status: 200 });
  } catch (error: unknown) {
    console.error(
      JSON.stringify({
        level: "error",
        scope: "api.admin.trash",
        method: "POST",
        message: "Erreur API admin trash POST",
        error: error instanceof Error ? error.message : String(error),
      })
    );
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
