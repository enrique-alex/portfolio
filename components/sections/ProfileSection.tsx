'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Fingerprint, Terminal, Crosshair, MapPin, Code2, Zap } from 'lucide-react';
import Magnetic from '../ui/Magnetic';
import { useLanguage } from '../theme/LanguageProvider';

export default function ProfileSection() {
  const { t } = useLanguage();

  return (
    <section id="profile" className="relative w-full py-24 lg:py-32 scroll-mt-32">
      {/* Background Matrix/Dotted */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(128,128,128,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128,128,128,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />
      
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 relative z-10">
        
        {/* Header Block */}
        <motion.div 
          className="mb-16 flex flex-col items-start border-b border-black/10 pb-6 dark:border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-3 text-zinc-500 dark:text-zinc-400">
            <Fingerprint className="h-4 w-4" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.3em] uppercase">
              {t('profile.header.tag')}
            </span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
            {t('profile.header.title')}
          </h2>
        </motion.div>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-20 items-center lg:items-start">
          
          {/* LEFT COLUMN: Operator ID Card */}
          <motion.div 
            className="w-full max-w-sm shrink-0"
            initial={{ opacity: 0, x: -30, rotateY: 15 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            <div className="group relative w-full overflow-hidden rounded-2xl border border-black/10 bg-black/5 p-4 shadow-2xl backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              
              {/* ID Card Header */}
              <div className="mb-4 flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-brand-blue uppercase">{t('profile.card.clearance')}</span>
                  <span className="font-mono text-[8px] tracking-wider text-zinc-500 dark:text-zinc-400">{t('profile.card.id')}</span>
                </div>
                <div className="flex gap-1">
                  <span className="block h-2 w-2 rounded-full bg-brand-red opacity-80 animate-pulse"></span>
                  <span className="block h-2 w-2 rounded-full bg-emerald-500 opacity-80"></span>
                </div>
              </div>

              {/* Holographic Photo Frame */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-black/10 bg-zinc-200 dark:border-white/10 dark:bg-zinc-800">
                <div className="absolute inset-0 mix-blend-overlay opacity-50 z-10 
                  bg-[linear-gradient(transparent_0%,rgba(0,0,0,0.1)_50%,transparent_100%)] 
                  bg-[length:100%_4px] group-hover:animate-[scan_2s_linear_infinite]"
                />
                <Image 
                  src="/photo.jpeg"
                  alt="Enrique Alex Ndjakou"
                  fill
                  className="object-cover object-center grayscale-[30%] contrast-125 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                
                {/* Scanner Line Effect */}
                <div className="absolute inset-x-0 top-0 h-1 bg-brand-blue/80 shadow-[0_0_15px_rgba(10,102,194,0.8)] z-20 opacity-0 group-hover:opacity-100 group-hover:animate-[scanline_2.5s_ease-in-out_infinite]" />
              </div>

              {/* Data Footer */}
              <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase text-zinc-600 dark:text-zinc-400">
                <span>{t('profile.card.status')}</span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t('profile.card.bio')}
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Bio-Data Readout */}
          <div className="flex flex-1 flex-col gap-8">
            
            <motion.div 
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              
              <div className="border-l-2 border-brand-blue pl-6">
                <div className="mb-2 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest">{t('profile.mission.label')}</span>
                </div>
                <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300 md:text-lg">
                  {t('profile.mission.text')} <strong className="text-zinc-900 dark:text-white">{t('profile.mission.bold')}</strong> {t('profile.mission.text2')}
                </p>
              </div>

            </motion.div>

            {/* Technical Parameters Grid */}
            <motion.div 
              className="grid gap-4 sm:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              
              {[
                { label: t('profile.param.base'), value: t('profile.param.base.value'), icon: MapPin },
                { label: t('profile.param.status'), value: t('profile.param.status.value'), icon: Zap },
                { label: t('profile.param.spec'), value: t('profile.param.spec.value'), icon: Code2 },
                { label: t('profile.param.goal'), value: t('profile.param.goal.value'), icon: Crosshair },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1 rounded-lg border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                    <item.icon className="h-3.5 w-3.5" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
                  </div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.value}</span>
                </div>
              ))}

            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
