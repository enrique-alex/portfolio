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
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50/50 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={`Restaurer le projet ${projectTitle}`}
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {isRestoring ? 'Restauration...' : 'Restaurer'}
    </button>
  );
}
