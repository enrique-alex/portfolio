'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exhaustive de l'erreur
    console.error('[NEXT ERROR BOUNDARY]', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center dark:bg-[#050505]">
      <div className="flex max-w-md flex-col items-center gap-6">
        <h2 className="font-mono text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white">
          Une erreur inattendue est survenue
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Nous sommes désolés, une erreur technique a empêché l&apos;affichage de cette page.
        </p>
        <button
          onClick={() => reset()}
          className="rounded-full bg-brand-blue px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
