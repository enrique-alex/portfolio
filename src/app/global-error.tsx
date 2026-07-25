'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exhaustive de l'erreur globale
    console.error('[NEXT GLOBAL ERROR BOUNDARY]', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-zinc-50 dark:bg-[#050505]">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <div className="flex max-w-md flex-col items-center gap-6">
            <h2 className="font-mono text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              Une erreur système globale est survenue
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Nous sommes désolés, une erreur critique a empêché l'affichage du site.
            </p>
            <button
              onClick={() => reset()}
              className="rounded-full bg-brand-blue px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
