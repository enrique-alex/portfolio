import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { purgeExpiredProjects, getTrashedProjects } from "@/lib/db/admin-projects-write";

export async function GET(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const db = env.portfolio_db;

    // Purge paresseuse silencieuse
    await purgeExpiredProjects(db);
    const trashedProjects = await getTrashedProjects(db);

    return NextResponse.json(trashedProjects, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur API admin trash GET:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const db = env.portfolio_db;

    // Purge manuelle explicite
    const purgedCount = await purgeExpiredProjects(db);

    return NextResponse.json({ purgedCount }, { status: 200 });
  } catch (error) {
    console.error("Erreur API admin trash POST:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
