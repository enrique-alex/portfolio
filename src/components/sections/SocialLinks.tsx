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
        {socialLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <Magnetic intensity={0.1} key={link.name}>
              <a 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl border border-black/5 bg-white/40 p-4 transition-all duration-500 hover:scale-[1.02] hover:bg-white hover:shadow-xl dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] dark:hover:shadow-2xl"
                style={{
                  '--hover-color': link.brandColor
                } as CSSPropertiesWithVars}
              >
                {/* Hover Gradient Background */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10 dark:opacity-0 dark:group-hover:opacity-20"
                  style={{ background: `linear-gradient(135deg, ${link.brandColor}, transparent)` }}
                ></div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-black/5 bg-black/5 transition-colors group-hover:border-transparent dark:border-white/10 dark:bg-white/5"
                    style={{ 
                      color: 'currentColor' 
                    }}
                  >
                    <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {link.name}
                    </p>
                    <p className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-[var(--hover-color)]">
                      {link.value}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-black/[0.02] text-zinc-400 transition-all group-hover:rotate-45 group-hover:scale-110 group-hover:bg-black/5 group-hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.02] dark:group-hover:bg-white/10 dark:group-hover:text-white">
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
