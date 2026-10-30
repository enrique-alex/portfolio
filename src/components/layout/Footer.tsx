'use client';

import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react';
import Magnetic from '../ui/Magnetic';
import { useLanguage } from '../theme/LanguageProvider';

export default function Footer() {
  const { t } = useLanguage();
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="relative w-full border-t border-black/10 bg-white py-8 dark:border-white/10 dark:bg-[#050505]">
      {/* Decorative Top Laser Line */}
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent opacity-50 dark:via-brand-blue/30" />
      
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 lg:flex-row lg:px-12">
        
        {/* Left: Branding & Copy */}
        <div className="flex flex-col items-center gap-1 sm:items-start text-center sm:text-left">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
            System Online © 2026
          </span>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
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
              className="flex items-center justify-center p-3 text-zinc-900 dark:text-zinc-100 opacity-50 hover:opacity-100 transition-opacity duration-200"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
            </a>
          </Magnetic>
          <Magnetic intensity={0.2}>
            <a 
              href="https://www.linkedin.com/in/alex-ndjakou/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 text-brand-blue dark:text-[#8AB4F8] opacity-60 hover:opacity-100 transition-opacity duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" aria-hidden="true" />
            </a>
          </Magnetic>
          <Magnetic intensity={0.2}>
            <a 
              href="mailto:enriquekemayou@gmail.com" 
              className="flex items-center justify-center p-3 text-brand-red dark:text-brand-red opacity-60 hover:opacity-100 transition-opacity duration-200"
              aria-label="Email"
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
              className="group flex flex-col items-center gap-2 focus:outline-none"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5 overflow-hidden">
                <div 
                  aria-hidden="true" 
                  className="pointer-events-none absolute inset-0 rounded-full border border-brand-blue/40 bg-brand-blue/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
                />
                <ArrowUp className="relative z-10 h-4 w-4 text-zinc-700 dark:text-zinc-300 transition-transform duration-300 group-hover:-translate-y-1" aria-hidden="true" />
              </div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                {t('footer.uplink')}
              </span>
            </button>
          </Magnetic>
        </div>

      </div>
    </footer>
  );
}
