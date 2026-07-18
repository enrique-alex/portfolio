'use client';

import { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../theme/LanguageProvider';

export default function CopyEmail() {
  const { t } = useLanguage();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="mt-4 rounded-xl border border-black/5 bg-black/[0.02] p-6 dark:border-white/5 dark:bg-white/[0.01]">
      <p className="mb-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">{t('contact.copy.label')}</p>
      <button 
        onClick={() => handleCopy('enriquekemayou@gmail.com')}
        className="group flex w-full items-center justify-between rounded-lg border border-black/10 bg-white px-4 py-3 transition-colors hover:border-brand-blue hover:bg-zinc-50 dark:border-white/10 dark:bg-black/50 dark:hover:border-brand-blue dark:hover:bg-black"
      >
        <span className="font-mono text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-brand-blue">
          enriquekemayou@gmail.com
        </span>
        {copiedText === 'enriquekemayou@gmail.com' ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <Copy className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-brand-blue" />
        )}
      </button>
    </div>
  );
}
