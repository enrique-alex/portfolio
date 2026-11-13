import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getProjectsForAdmin } from "@/lib/db/admin-projects";
import { ProjectsAdminTable } from "@/components/admin/ProjectsAdminTable";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const { env } = getCloudflareContext();
  const projects = await getProjectsForAdmin(env.portfolio_db);

  return (
    <main className="min-h-[100dvh] px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500" aria-hidden="true" />
              <h1 className="font-mono text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                Administration
              </h1>
            </div>
            <p className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
              {projects.length} projet{projects.length !== 1 ? 's' : ''} au total.
            </p>
          </div>
        </div>

        <ProjectsAdminTable projects={projects} />
      </div>
    </main>
  );
}
