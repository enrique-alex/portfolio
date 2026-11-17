'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../theme/LanguageProvider';

export default function CopyEmail() {
  const { t } = useLanguage();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedText(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedText(null), 2000);
    } catch {
      setCopiedText(null);
    }
  };

  const isCopied = copiedText === 'enriquekemayou@gmail.com';

  return (
    <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-[#0A0C10]/80">
      <p className="mb-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">{t('contact.copy.label')}</p>
      <button 
        type="button"
        onClick={() => void handleCopy('enriquekemayou@gmail.com')}
        aria-label={isCopied ? t('contact.copy.copied') : t('contact.copy.ariaCopy')}
        className="group flex w-full items-center justify-between rounded-lg border border-black/10 bg-white px-4 py-3 active:scale-[0.97] transition-[transform,border-color,background-color,color] duration-150 ease-[var(--ease-out)] hover:border-blue-600 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F9FA] dark:border-white/10 dark:bg-[#050505]/70 dark:hover:border-[#00D2FF] dark:hover:bg-[#0A0C10] dark:focus-visible:ring-[#00D2FF] dark:focus-visible:ring-offset-[#050505]"
      >
        <span className="font-mono text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-[#00D2FF]">
          {isCopied ? t('contact.copy.copied') : 'enriquekemayou@gmail.com'}
        </span>
        {isCopied ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-blue-600 dark:text-zinc-400 dark:group-hover:text-[#00D2FF]" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
