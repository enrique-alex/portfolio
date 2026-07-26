import type { Metadata } from "next";
import { LogoutButton } from "@/components/admin/LogoutButton";
import Link from "next/link";
import { Trash2 } from "lucide-react";
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
      <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/50 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0a0a]/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="font-mono text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Panel Admin
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/trash" 
              className="group flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Trash2 className="h-4 w-4" />
              Corbeille
              {trashedCount > 0 && (
                <span className="ml-1 inline-flex h-5 items-center justify-center rounded-full bg-zinc-900 px-2 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
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
