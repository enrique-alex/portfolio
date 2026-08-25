import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getProjectsForAdmin } from "@/lib/db/admin-projects";
import { validateProjectInput } from "@/lib/validation/project";
import { createProjectAtomic } from "@/lib/db/admin-projects-write";

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

export async function POST(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const db = env.portfolio_db;

    const raw = await request.json();

    const projects = await getProjectsForAdmin(db);
    const existingSlugs = projects.map(p => p.slug);
    const currentProjectCount = projects.length;

    const validation = validateProjectInput(raw, existingSlugs, currentProjectCount);

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await createProjectAtomic(db, id, validation.data);

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Erreur API admin projects POST:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
