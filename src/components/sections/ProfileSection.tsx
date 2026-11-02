'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Fingerprint, Terminal, Crosshair, MapPin, Code2, Zap } from 'lucide-react';
import { useLanguage } from '../theme/LanguageProvider';
import EarthGlobe3D from '../ui/EarthGlobe3D';

export default function ProfileSection() {
  const shouldReduceMotion = useReducedMotion();
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
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : undefined }}
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
          
          {/* LEFT COLUMN: Geographic Telemetry 3D Globe */}
          <motion.div 
            className="w-full max-w-sm lg:max-w-md shrink-0"
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30, rotateY: shouldReduceMotion ? 0 : 15 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : undefined, type: shouldReduceMotion ? false : 'spring', damping: 20, stiffness: 100 }}
          >
            <EarthGlobe3D className="w-full max-w-[340px] lg:max-w-none mx-auto" />
          </motion.div>

          {/* RIGHT COLUMN: Bio-Data Readout */}
          <div className="flex flex-1 flex-col gap-8">
            
            <motion.div 
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0 : undefined, delay: shouldReduceMotion ? 0 : 0.2 }}
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
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0 : undefined, delay: shouldReduceMotion ? 0 : 0.4 }}
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
