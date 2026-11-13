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
    <main className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4">
      <div className="mb-8 w-full max-w-sm">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-100/90 px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-200 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors dark:bg-[#0A0C10]/85 dark:text-zinc-300 dark:hover:bg-[#11141C] dark:hover:text-white dark:focus-visible:ring-[#00D2FF] w-fit"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour au portfolio
        </Link>
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-black/10 bg-white/85 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#0A0C10]/90">
          <div className="mb-6 text-center">
            <h1 className="font-mono text-lg font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">
              Administration
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Cette section est réservée à l&apos;administrateur du site.
            </p>
          </div>

          <form onSubmit={handleSubmit} aria-label="Formulaire de connexion administrateur">
            <div className="mb-4">
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-white/15 dark:bg-[#050505]/80 dark:text-white dark:focus:border-[#00D2FF] dark:focus:ring-[#00D2FF]/20"
                placeholder="••••••••••••••••"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:focus-visible:ring-[#00D2FF]"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
