'use client';

import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react';
import Magnetic from '../ui/Magnetic';
import { useLanguage } from '../theme/LanguageProvider';
import { scrollToTop } from '@/lib/scroll';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="section-contain relative w-full border-t border-black/10 bg-white pt-8 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:py-8 dark:border-white/10 dark:bg-[#050505]">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 lg:flex-row lg:px-12">
        {/* Left: Branding & Copy */}
        <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
            {t('footer.brand')}
          </span>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {t('footer.rights')}
          </span>
        </div>

        {/* Center: Micro Socials */}
        <div className="flex items-center gap-2 sm:gap-6">
          <Magnetic intensity={0.2}>
            <a
              href="https://github.com/enrique-alex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-lg p-3 text-zinc-700 transition-colors duration-200 hover:text-blue-600 dark:text-zinc-200 dark:hover:text-[#00D2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF]"
              aria-label={t('footer.social.github')}
            >
              <Github className="h-5 w-5" aria-hidden="true" />
            </a>
          </Magnetic>
          <Magnetic intensity={0.2}>
            <a
              href="https://www.linkedin.com/in/alex-ndjakou/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-lg p-3 text-blue-600 transition-colors duration-200 hover:text-zinc-950 dark:text-[#00D2FF] dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF]"
              aria-label={t('footer.social.linkedin')}
            >
              <Linkedin className="h-5 w-5" aria-hidden="true" />
            </a>
          </Magnetic>
          <Magnetic intensity={0.2}>
            <a
              href="mailto:enriquekemayou@gmail.com"
              className="flex items-center justify-center rounded-lg p-3 text-zinc-700 transition-colors duration-200 hover:text-blue-600 dark:text-zinc-200 dark:hover:text-[#00D2FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF]"
              aria-label={t('footer.social.mail')}
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
            </a>
          </Magnetic>
        </div>

        {/* Right: Uplink (Back to top) */}
        <div className="flex items-center justify-center">
          <Magnetic intensity={0.1}>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label={t('footer.uplink')}
              className="group flex flex-col items-center gap-2 rounded-xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-[#00D2FF]"
            >
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/15 bg-black/5 dark:border-white/15 dark:bg-white/5">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full border border-blue-600/40 bg-blue-600/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:border-[#00D2FF]/40 dark:bg-[#00D2FF]/10"
                />
                <ArrowUp className="relative z-10 h-4 w-4 text-zinc-800 transition-transform duration-200 group-hover:-translate-y-0.5 dark:text-zinc-100" aria-hidden="true" />
              </div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-800 transition-colors duration-200 group-hover:text-blue-600 dark:text-zinc-200 dark:group-hover:text-[#00D2FF]">
                {t('footer.uplink')}
              </span>
            </button>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
}
