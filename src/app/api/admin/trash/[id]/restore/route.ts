import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { restoreProject } from "@/lib/db/admin-projects-write";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const db = env.portfolio_db;

    const success = await restoreProject(db, id);

    if (!success) {
      return NextResponse.json({ error: "Projet non trouvé dans la corbeille" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erreur API admin trash restore POST:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
