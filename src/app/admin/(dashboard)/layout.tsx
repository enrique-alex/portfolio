import { LogoutButton } from "@/components/admin/LogoutButton";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { countTrashedProjects } from "@/lib/db/admin-projects-write";
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { env } = getCloudflareContext();
  const db = env.portfolio_db;
  const trashedCount = await countTrashedProjects(db);

  return (
    <>
      {/* Bandeau supérieur Admin - Glassmorphic */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/85 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0C10]/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="font-mono text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Panel Admin
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="group flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-zinc-300 dark:hover:text-[#00D2FF] dark:focus-visible:ring-[#00D2FF] mr-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Voir le site
            </Link>
            <Link 
              href="/admin/trash" 
              className="group flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-zinc-300 dark:hover:text-[#00D2FF] dark:focus-visible:ring-[#00D2FF]"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Corbeille
              {trashedCount > 0 && (
                <span className="ml-1 inline-flex h-5 items-center justify-center rounded-full bg-zinc-900 px-2 text-[11px] font-bold tabular-nums text-white dark:bg-white dark:text-zinc-900">
                  {trashedCount}
                </span>
              )}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Contenu du Dashboard */}
      {children}
    </>
  );
}
