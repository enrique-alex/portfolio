import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getProjectsForAdmin } from "@/lib/db/admin-projects";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const projects = await getProjectsForAdmin(env.portfolio_db);

    return NextResponse.json(projects, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur API admin projects:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
