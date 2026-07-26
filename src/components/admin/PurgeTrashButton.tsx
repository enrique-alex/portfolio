'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export function PurgeTrashButton() {
  const [isPurging, setIsPurging] = useState(false);
  const router = useRouter();

  const handlePurge = async () => {
    const confirmed = window.confirm(
      "Ceci supprimera définitivement tous les projets de plus de 90 jours dans la corbeille. Continuer ?"
    );

    if (!confirmed) {
      return;
    }

    setIsPurging(true);

    try {
      const res = await fetch(`/api/admin/trash`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Une erreur est survenue lors de la purge.");
      }

      const data = (await res.json()) as { purgedCount: number };
      alert(`Purge terminée. ${data.purgedCount} projet(s) ont été définitivement supprimés.`);

      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Une erreur inattendue est survenue.");
      }
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <button
      onClick={handlePurge}
      disabled={isPurging}
      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Trash2 className="h-4 w-4" />
      {isPurging ? 'Purge en cours...' : 'Vider la corbeille maintenant'}
    </button>
  );
}
