"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Page admin protégée (coquille).
 *
 * Cette page ne contient aucun CRUD réel — elle sert uniquement à prouver
 * que la chaîne d'authentification fonctionne bout en bout :
 * middleware → cookie signé → page protégée.
 *
 * Le bouton de déconnexion envoie un POST vers /api/admin/logout pour
 * effacer le cookie de session, puis redirige vers la page de login.
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <h1 className="font-mono text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
              Panel admin
            </h1>
          </div>

          <p className="mb-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Authentification réussie. Le système de protection fonctionne correctement.
          </p>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
          </button>
        </div>
      </div>
    </main>
  );
}
