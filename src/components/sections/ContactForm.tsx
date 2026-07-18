'use client';

import { useState } from 'react';
import { Terminal, Send, CheckCircle2 } from 'lucide-react';
import Magnetic from '@/components/ui/Magnetic';
import { useLanguage } from '../theme/LanguageProvider';

export default function ContactForm() {
  const { t } = useLanguage();
  // Form States
  const [formData, setFormData] = useState({ name: '', email: '', message: '', botcheck: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // On utilise l'URL issue de Tally, Formspree ou Web3Forms (A configurer dans .env.local)
    const endpoint = process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT;

    if (!endpoint) {
      console.error("Endpoint de formulaire manquant dans les variables d'environnement.");
      // Simule un délai de traitement pour le frontend si aucun endpoint n'existe pour le moment
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitStatus('error');
      }, 1500);
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
          subject: `Nouveau message de ${formData.name} via le Portfolio`
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '', botcheck: false });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02] shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#050505]/80 dark:shadow-2xl">
      
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-black/5 bg-black/5 px-4 py-3 dark:border-white/5 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Message_Console</span>
        </div>
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/80"></div>
        </div>
      </div>

      {/* Form Body */}
      <form className="flex flex-col gap-6 p-6 sm:p-8" onSubmit={handleSubmit}>
        
        {/* Honeypot anti-spam */}
        <input 
          type="checkbox" 
          name="botcheck" 
          className="hidden" 
          style={{ display: 'none' }} 
          tabIndex={-1} 
          autoComplete="off" 
          onChange={(e) => setFormData(prev => ({ ...prev, botcheck: e.target.checked }))} 
        />
        
        <div className="group relative">
          <label htmlFor="name" className="mb-2 block font-mono text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 transition-colors group-focus-within:text-brand-blue">
            {t('contact.form.name.label')}
          </label>
          <input 
            type="text" 
            id="name" 
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={t('contact.form.name.placeholder')}
            className="w-full rounded-none border-b border-black/20 bg-transparent px-0 py-2 font-mono text-sm text-zinc-900 transition-colors focus:border-brand-blue focus:outline-none dark:border-white/20 dark:text-white dark:focus:border-brand-blue disabled:opacity-50"
            disabled={isSubmitting}
          />
        </div>

        <div className="group relative">
          <label htmlFor="email" className="mb-2 block font-mono text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 transition-colors group-focus-within:text-brand-blue">
            {t('contact.form.email.label')}
          </label>
          <input 
            type="email" 
            id="email" 
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder={t('contact.form.email.placeholder')}
            className="w-full rounded-none border-b border-black/20 bg-transparent px-0 py-2 font-mono text-sm text-zinc-900 transition-colors focus:border-brand-blue focus:outline-none dark:border-white/20 dark:text-white dark:focus:border-brand-blue disabled:opacity-50"
            disabled={isSubmitting}
          />
        </div>

        <div className="group relative">
          <label htmlFor="message" className="mb-2 block font-mono text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 transition-colors group-focus-within:text-brand-blue">
            {t('contact.form.message.label')}
          </label>
          <textarea 
            id="message" 
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder={t('contact.form.message.placeholder')}
            className="w-full resize-none rounded-lg border border-black/10 bg-white/50 p-4 font-mono text-sm text-zinc-900 transition-all focus:border-brand-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 dark:border-white/10 dark:bg-black/50 dark:text-white dark:focus:border-brand-blue/50 dark:focus:bg-black disabled:opacity-50"
            disabled={isSubmitting}
          ></textarea>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500" role="status" aria-live="polite">
            STATUS: <span className={`font-bold ${
              submitStatus === 'success' ? 'text-emerald-500' :
              submitStatus === 'error' ? 'text-red-500' :
              isSubmitting ? 'text-amber-500 animate-pulse' :
              'text-zinc-900 dark:text-zinc-300'
            }`}>
              {submitStatus === 'success' ? 'DELIVERED_SUCCESSFULLY' :
               submitStatus === 'error' ? 'TRANSMISSION_FAILED' :
               isSubmitting ? 'TRANSMITTING...' : 'AWAITING_INPUT'}
            </span>
          </p>
          
          <Magnetic intensity={0.15}>
            <button 
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-lg px-6 py-3 font-semibold transition-all focus:outline-none focus:ring-4 ${
                submitStatus === 'success' 
                ? 'bg-emerald-500 text-white focus:ring-emerald-500/20' 
                : submitStatus === 'error'
                ? 'bg-red-500 text-white focus:ring-red-500/20'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-900/20 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-white/20'
              }`}
            >
              <span className="relative z-10 font-mono tracking-widest text-xs uppercase">
                {submitStatus === 'success' ? t('contact.form.submit.sent') :
                 submitStatus === 'error' ? t('contact.form.submit.retry') :
                 isSubmitting ? t('contact.form.submit.sending') : t('contact.form.submit')}
              </span>
              {submitStatus === 'success' ? (
                <CheckCircle2 className="relative z-10 h-3.5 w-3.5" />
              ) : (
                <Send className={`relative z-10 h-3.5 w-3.5 transition-transform ${isSubmitting ? 'animate-bounce' : 'group-hover:translate-x-1 group-hover:-translate-y-1'}`} />
              )}
            </button>
          </Magnetic>
        </div>
      </form>
    </div>
  );
}
