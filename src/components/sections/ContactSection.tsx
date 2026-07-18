'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useLanguage } from '../theme/LanguageProvider';
import ContactForm from './ContactForm';
import SocialLinks from './SocialLinks';
import CopyEmail from './CopyEmail';

export default function ContactSection() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="contact" className="relative w-full py-24 lg:py-32 overflow-hidden scroll-mt-32">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/5 via-transparent to-transparent opacity-50 dark:from-brand-blue/10"></div>
      
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 relative z-10">
        
        {/* HEADER - System Process Monitor Style */}
        <motion.div 
          className="mb-16 flex w-full flex-col items-start border-b border-black/10 pb-6 dark:border-white/10"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
        >
          <div className="flex items-center gap-3 mb-3 text-zinc-500 dark:text-zinc-400">
            <Send className="h-4 w-4" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.3em] uppercase">
              System.Transmission.Gateway
            </span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
            {t('contact.header.title')}
          </h2>
          <p className="mt-4 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            {t('contact.header.subtitle')}
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Terminal Form */}
          <motion.div 
            className="lg:col-span-3 w-full"
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.7 }}
          >
            <ContactForm />
          </motion.div>

          {/* RIGHT COLUMN: Comms Array */}
          <motion.div 
            className="lg:col-span-2 flex flex-col gap-8"
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.7, delay: shouldReduceMotion ? 0 : 0.2 }}
          >
            <SocialLinks />
            <CopyEmail />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
