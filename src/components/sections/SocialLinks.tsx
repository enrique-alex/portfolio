'use client';

import { Github, Linkedin, Mail, Phone, ArrowUpRight } from 'lucide-react';
import Magnetic from '@/components/ui/Magnetic';
import { useLanguage } from '../theme/LanguageProvider';

function useSocialLinks() {
  const { t } = useLanguage();
  return [
    {
      name: 'GitHub',
      value: 'enrique-alex',
      url: 'https://github.com/enrique-alex',
      icon: Github,
    },
    {
      name: 'LinkedIn',
      value: 'alex-ndjakou',
      url: 'https://www.linkedin.com/in/alex-ndjakou/',
      icon: Linkedin,
    },
    {
      name: 'Email',
      value: 'enriquekemayou@gmail.com',
      url: 'mailto:enriquekemayou@gmail.com',
      icon: Mail,
    },
    {
      name: t('contact.social.phone'),
      value: '+33 6 44 79 60 57',
      url: 'tel:+33644796057',
      icon: Phone,
    }
  ];
}

export default function SocialLinks() {
  const { t } = useLanguage();
  const socialLinks = useSocialLinks();

  return (
    <div>
      <h3 className="mb-6 font-mono text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
        <span className="text-blue-600 dark:text-[#00D2FF]" aria-hidden="true">{"//"}</span> {t('contact.social.title')}
      </h3>
      
      <div className="flex flex-col gap-4">
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Magnetic intensity={0.1} key={link.name}>
              <a 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl border border-black/10 bg-white/85 p-4 transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-blue-600/40 hover:bg-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F9FA] dark:border-white/10 dark:bg-[#0A0C10]/85 dark:hover:border-[#00D2FF]/40 dark:hover:bg-[#0F131A] dark:focus-visible:ring-[#00D2FF] dark:focus-visible:ring-offset-[#050505]"
              >
                {/* Subtle Lateral Telemetry Accent */}
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 w-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-blue-600 dark:bg-[#00D2FF]"
                />
                
                <div className="relative z-10 flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg border border-black/10 bg-black/[0.03] text-zinc-700 transition-colors duration-200 group-hover:border-blue-600/30 group-hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200 dark:group-hover:border-[#00D2FF]/30 dark:group-hover:text-[#00D2FF]"
                  >
                    <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      {link.name}
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-[#00D2FF]">
                      {link.value}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-black/[0.02] text-zinc-600 transition-[transform,background-color,color,border-color] duration-200 group-hover:rotate-45 group-hover:scale-105 group-hover:border-blue-600/30 group-hover:bg-blue-600/10 group-hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400 dark:group-hover:border-[#00D2FF]/30 dark:group-hover:bg-[#00D2FF]/10 dark:group-hover:text-[#00D2FF]">
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </a>
            </Magnetic>
          );
        })}
      </div>
    </div>
  );
}
