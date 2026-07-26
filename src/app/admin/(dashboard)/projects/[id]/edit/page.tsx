import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getProjectByIdForAdmin } from "@/lib/db/admin-projects-write";
import { ProjectForm } from "@/components/admin/ProjectForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function EditProjectPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const { env } = getCloudflareContext();
  const db = env.portfolio_db;

  const project = await getProjectByIdForAdmin(db, id);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Projet introuvable
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-center max-w-md">
          Le projet que vous essayez de modifier n'existe pas ou a été supprimé.
        </p>
        <Link 
          href="/admin"
          className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin" 
          className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Retour au tableau de bord"
        >
          <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Modifier le projet
        </h1>
      </div>
      <ProjectForm mode="edit" initialData={project} />
    </div>
  );
}
