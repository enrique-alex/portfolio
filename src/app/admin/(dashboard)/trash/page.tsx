import { getCloudflareContext } from "@opennextjs/cloudflare";
import { purgeExpiredProjects, getTrashedProjects } from "@/lib/db/admin-projects-write";
import { RestoreProjectButton } from "@/components/admin/RestoreProjectButton";
import { PurgeTrashButton } from "@/components/admin/PurgeTrashButton";
import Link from "next/link";
import { ArrowLeft, Trash2, ArchiveX } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TrashPage() {
  const { env } = getCloudflareContext();
  const db = env.portfolio_db;

  // Purge paresseuse silencieuse
  await purgeExpiredProjects(db);
  const trashedProjects = await getTrashedProjects(db);

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-8">
      <div>
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-100/80 px-4 py-2 text-sm font-semibold text-zinc-600 shadow-sm hover:bg-zinc-200 hover:text-zinc-900 transition-colors dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>
      </div>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            <Trash2 className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
            Corbeille
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Les projets supprimés sont conservés ici pendant 90 jours avant d'être définitivement effacés.
          </p>
        </div>
        <div className="shrink-0">
          <PurgeTrashButton />
        </div>
      </div>

      {trashedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/50 bg-white/50 py-24 text-center backdrop-blur-md shadow-xl dark:border-white/10 dark:bg-[#0a0a0a]/50">
          <ArchiveX className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">La corbeille est vide</h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Aucun projet supprimé récemment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/50 bg-white/50 backdrop-blur-md shadow-xl dark:border-white/10 dark:bg-[#0a0a0a]/50">
          <table
            className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400"
            aria-label="Liste des projets dans la corbeille"
          >
            <thead className="border-b border-zinc-200/50 bg-zinc-50/50 text-xs font-semibold uppercase text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
              <tr>
                <th scope="col" className="px-6 py-4">Titre (FR / EN)</th>
                <th scope="col" className="px-6 py-4">Slug</th>
                <th scope="col" className="px-6 py-4">Date de suppression</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {trashedProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/25 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{project.titleFr}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">{project.titleEn}</div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                      {project.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(project.deletedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <RestoreProjectButton projectId={project.id} projectTitle={project.titleFr} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
