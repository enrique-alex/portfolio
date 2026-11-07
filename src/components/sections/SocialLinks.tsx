'use client';

import { Github, Linkedin, Mail, Phone, ArrowUpRight } from 'lucide-react';
import Magnetic from '@/components/ui/Magnetic';
import { useLanguage } from '../theme/LanguageProvider';

interface CSSPropertiesWithVars extends React.CSSProperties {
  [key: `--${string}`]: string | number | undefined;
}

function useSocialLinks() {
  const { t } = useLanguage();
  return [
    {
      name: 'GitHub',
      value: 'enrique-alex',
      url: 'https://github.com/enrique-alex',
      icon: Github,
      color: 'rgba(255, 255, 255, 0.9)',
      brandColor: '#ffffff'
    },
    {
      name: 'LinkedIn',
      value: 'alex-ndjakou',
      url: 'https://www.linkedin.com/in/alex-ndjakou/',
      icon: Linkedin,
      color: 'rgba(10, 102, 194, 0.9)',
      brandColor: '#0a66c2'
    },
    {
      name: 'Email',
      value: 'enriquekemayou@gmail.com',
      url: 'mailto:enriquekemayou@gmail.com',
      icon: Mail,
      color: 'rgba(234, 67, 53, 0.9)',
      brandColor: '#ea4335'
    },
    {
      name: t('contact.social.phone'),
      value: '+33 6 44 79 60 57',
      url: 'tel:+33644796057',
      icon: Phone,
      color: 'rgba(52, 168, 83, 0.9)',
      brandColor: '#34a853'
    }
  ];
}

export default function SocialLinks() {
  const { t } = useLanguage();
  const socialLinks = useSocialLinks();

  return (
    <div>
      <h3 className="mb-6 font-mono text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
        <span className="text-brand-blue">{"//"}</span> {t('contact.social.title')}
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
                className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl border border-black/10 bg-white/80 p-4 transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand-blue/40 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-[#0A0C10]/85 dark:hover:border-[#00D2FF]/40 dark:hover:bg-[#0F131A]"
                style={{
                  '--hover-color': link.brandColor
                } as CSSPropertiesWithVars}
              >
                {/* Subtle Lateral Telemetry Accent */}
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 w-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-brand-blue dark:bg-[#00D2FF]"
                />
                
                <div className="relative z-10 flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg border border-black/10 bg-black/[0.03] text-zinc-700 transition-colors duration-200 group-hover:border-brand-blue/30 group-hover:text-brand-blue dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200 dark:group-hover:border-[#00D2FF]/30 dark:group-hover:text-[#00D2FF]"
                  >
                    <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {link.name}
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 transition-colors duration-200 group-hover:text-brand-blue dark:text-zinc-100 dark:group-hover:text-[#00D2FF]">
                      {link.value}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-black/[0.02] text-zinc-500 transition-[transform,background-color,color,border-color] duration-200 group-hover:rotate-45 group-hover:scale-105 group-hover:border-brand-blue/30 group-hover:bg-brand-blue/10 group-hover:text-brand-blue dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400 dark:group-hover:border-[#00D2FF]/30 dark:group-hover:bg-[#00D2FF]/10 dark:group-hover:text-[#00D2FF]">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </a>
            </Magnetic>
          );
        })}
      </div>
    </div>
  );
}
