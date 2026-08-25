'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';

interface RestoreProjectButtonProps {
  projectId: string;
  projectTitle: string;
}

export function RestoreProjectButton({ projectId, projectTitle }: RestoreProjectButtonProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const router = useRouter();

  const handleRestore = async () => {
    const confirmed = window.confirm(
      `Restaurer le projet ${projectTitle} ? Il sera replacé à la fin de la liste active.`
    );

    if (!confirmed) {
      return;
    }

    setIsRestoring(true);

    try {
      const res = await fetch(`/api/admin/trash/${projectId}/restore`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Une erreur est survenue lors de la restauration.");
      }

      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Une erreur inattendue est survenue.");
      }
      setIsRestoring(false);
    }
  };

  return (
    <button
      onClick={handleRestore}
      disabled={isRestoring}
      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/50 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={`Restaurer le projet ${projectTitle}`}
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {isRestoring ? 'Restauration...' : 'Restaurer'}
    </button>
  );
}
