import type { Metadata } from "next";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Bandeau supérieur Admin - Glassmorphic */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/50 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#0a0a0a]/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="font-mono text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Panel Admin
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Contenu du Dashboard */}
      {children}
    </>
  );
}
