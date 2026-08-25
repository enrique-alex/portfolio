import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getProjectByIdForAdmin, updateProjectAtomic, deleteProjectAtomic } from "@/lib/db/admin-projects-write";
import { getProjectsForAdmin } from "@/lib/db/admin-projects";
import { validateProjectInput } from "@/lib/validation/project";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const db = env.portfolio_db;

    const project = await getProjectByIdForAdmin(db, id);

    if (!project) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }

    return NextResponse.json(project, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur API admin projects GET par ID:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const db = env.portfolio_db;

    const raw = await request.json();

    // Vérifier que le projet existe
    const existingProject = await getProjectByIdForAdmin(db, id);
    if (!existingProject) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }

    const projects = await getProjectsForAdmin(db);
    
    // Exclure le slug actuel de ce projet de la liste des slugs existants
    const existingSlugs = projects.filter(p => p.id !== id).map(p => p.slug);
    
    // En édition, le nombre max pour le sort_order est projects.length - 1 (car le projet est déjà dans la liste)
    const currentProjectCount = projects.length - 1;

    const validation = validateProjectInput(raw, existingSlugs, currentProjectCount);

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    await updateProjectAtomic(db, id, validation.data);

    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    console.error("Erreur API admin projects PUT:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const db = env.portfolio_db;

    const success = await deleteProjectAtomic(db, id);

    if (!success) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erreur API admin projects DELETE:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
