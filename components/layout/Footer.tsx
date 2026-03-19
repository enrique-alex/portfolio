'use client';

import { motion } from 'framer-motion';
import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react';
import Magnetic from '../ui/Magnetic';

export default function Footer() {
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
            Enrique Alex Ndjakou Kemayou. All rights reserved.
          </span>
        </div>

        {/* Center: Micro Socials */}
        <div className="flex items-center gap-6">
          <Magnetic intensity={0.2}>
            <a 
              href="https://github.com/enrique-alex" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-400 transition-colors hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-100"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </Magnetic>
          <Magnetic intensity={0.2}>
            <a 
              href="https://www.linkedin.com/in/alex-ndjakou/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-400 transition-colors hover:text-brand-blue dark:text-zinc-600 dark:hover:text-[#8AB4F8]"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </Magnetic>
          <Magnetic intensity={0.2}>
            <a 
              href="mailto:enriquekemayou@gmail.com" 
              className="text-zinc-400 transition-colors hover:text-brand-red dark:text-zinc-600 dark:hover:text-brand-red"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </Magnetic>
        </div>

        {/* Right: Uplink (Back to top) */}
        <div className="flex items-center justify-center">
          <Magnetic intensity={0.1}>
            <button
              onClick={scrollToTop}
              className="group flex flex-col items-center gap-2"
              aria-label="Retour en haut"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-black/5 transition-colors group-hover:bg-brand-blue/10 group-hover:border-brand-blue/30 dark:border-white/10 dark:bg-white/5 dark:group-hover:bg-brand-blue/10 dark:group-hover:border-brand-blue/30">
                <ArrowUp className="h-4 w-4 text-zinc-500 transition-transform group-hover:-translate-y-1 group-hover:text-brand-blue dark:text-zinc-400 dark:group-hover:text-brand-blue" />
              </div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-brand-blue dark:text-zinc-500 dark:group-hover:text-brand-blue">
                Uplink
              </span>
            </button>
          </Magnetic>
        </div>

      </div>
    </footer>
  );
}
