'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isEnglish =
    typeof navigator !== 'undefined' &&
    navigator.language?.toLowerCase().startsWith('en');

  useEffect(() => {
    console.error('[NEXT GLOBAL ERROR BOUNDARY]', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang={isEnglish ? 'en' : 'fr'} suppressHydrationWarning>
      <body className="bg-[#F8F9FA] text-zinc-900 dark:bg-[#050505] dark:text-[#EDEDED]">
        <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
          <div className="flex max-w-md flex-col items-center gap-6">
            <h2 className="font-mono text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              {isEnglish
                ? 'A critical system error occurred'
                : 'Une erreur système critique est survenue'}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {isEnglish
                ? 'An unexpected technical error prevented this page from rendering.'
                : "Une erreur technique inattendue a empêché l'affichage de cette page."}
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition-[transform,opacity] duration-150 hover:bg-blue-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:bg-[#00D2FF] dark:text-[#050505] dark:hover:opacity-90 dark:focus-visible:ring-[#00D2FF]"
            >
              {isEnglish ? 'Try again' : 'Réessayer'}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
