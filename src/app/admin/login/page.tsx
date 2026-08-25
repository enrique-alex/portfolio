"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Page de connexion administrateur.
 *
 * Formulaire simple avec un seul champ mot de passe.
 * Ce n'est pas une page publique — le design reste fonctionnel et sobre,
 * cohérent avec le thème Tailwind du site (dark mode supporté).
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push("/admin");
        return;
      }

      const data = (await response.json()) as { error: string };
      setError(data.error || "Une erreur est survenue.");
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8 w-full max-w-sm">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-100/80 px-4 py-2 text-sm font-semibold text-zinc-600 shadow-sm hover:bg-zinc-200 hover:text-zinc-900 transition-colors dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au portfolio
        </Link>
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-zinc-200/50 bg-white/50 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#0a0a0a]/50">
          <div className="mb-6 text-center">
            <h1 className="font-mono text-lg font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">
              Administration
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Cette section est réservée à l'administrateur du site.
            </p>
          </div>

          <form onSubmit={handleSubmit} aria-label="Formulaire de connexion administrateur">
            <div className="mb-4">
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400"
              >
                Mot de passe
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-label="Mot de passe administrateur"
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                placeholder="••••••••••••••••"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
