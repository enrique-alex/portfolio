'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/components/theme/LanguageProvider';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error('[NEXT ERROR BOUNDARY]', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F8F9FA] px-4 text-center dark:bg-[#050505]">
      <div className="flex max-w-md flex-col items-center gap-6">
        <h2 className="font-mono text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white">
          {t('error.title')}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          {t('error.subtitle')}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition-[transform,opacity] duration-150 hover:bg-blue-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:bg-[#00D2FF] dark:text-[#050505] dark:hover:opacity-90 dark:focus-visible:ring-[#00D2FF]"
        >
          {t('error.retry')}
        </button>
      </div>
    </div>
  );
}
