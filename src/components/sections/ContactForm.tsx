'use client';

import { useState } from 'react';
import { Terminal, Send, CheckCircle2 } from 'lucide-react';
import Magnetic from '@/components/ui/Magnetic';
import { useLanguage } from '../theme/LanguageProvider';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const { t } = useLanguage();
  // Form States
  const [formData, setFormData] = useState({ name: '', email: '', message: '', botcheck: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; message?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot: rejet silencieux si coché (un humain ne voit jamais cette case)
    if (formData.botcheck) return;

    if (!formData.name || !formData.email || !formData.message) return;

    // Validation email côté client
    if (!EMAIL_REGEX.test(formData.email.trim())) {
      setFieldErrors(prev => ({ ...prev, email: t('contact.form.email.invalid') }));
      return;
    }

    // Validation longueur du message
    if (formData.message.trim().length < 10) {
      setFieldErrors(prev => ({ ...prev, message: t('contact.form.message.tooShort') }));
      return;
    }

    setFieldErrors({});
    
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
    <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/80 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0C10]/90 dark:shadow-2xl">
      
      {/* Engineering Console Header */}
      <div className="flex items-center justify-between border-b border-black/10 bg-black/[0.03] px-5 py-3.5 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center gap-2.5">
          <Terminal className="h-4 w-4 text-brand-blue dark:text-[#00D2FF]" aria-hidden="true" />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
            TX // DIRECT_CHANNEL
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          TLS 1.3 · VERIFIED
        </span>
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
          <label htmlFor="name" className="mb-2 block font-mono text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 transition-colors group-focus-within:text-brand-blue dark:group-focus-within:text-[#00D2FF]">
            {t('contact.form.name.label')}
          </label>
          <input 
            type="text" 
            id="name" 
            required
            value={formData.name}
            maxLength={100}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={t('contact.form.name.placeholder')}
            className="w-full rounded-none border-b border-black/20 bg-transparent px-0 py-2 font-mono text-sm text-zinc-900 transition-colors focus:border-brand-blue focus:outline-none dark:border-white/20 dark:text-white dark:focus:border-[#00D2FF] disabled:opacity-50"
            disabled={isSubmitting}
          />
        </div>

        <div className="group relative">
          <label htmlFor="email" className="mb-2 block font-mono text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 transition-colors group-focus-within:text-brand-blue dark:group-focus-within:text-[#00D2FF]">
            {t('contact.form.email.label')}
          </label>
          <input 
            type="email" 
            id="email" 
            required
            value={formData.email}
            maxLength={100}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, email: e.target.value }));
              if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
            }}
            placeholder={t('contact.form.email.placeholder')}
            className="w-full rounded-none border-b border-black/20 bg-transparent px-0 py-2 font-mono text-sm text-zinc-900 transition-colors focus:border-brand-blue focus:outline-none dark:border-white/20 dark:text-white dark:focus:border-[#00D2FF] disabled:opacity-50"
            disabled={isSubmitting}
            aria-invalid={fieldErrors.email ? 'true' : undefined}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && (
            <p id="email-error" role="alert" aria-live="assertive" className="mt-1 font-mono text-[10px] text-red-500">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="group relative">
          <label htmlFor="message" className="mb-2 block font-mono text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 transition-colors group-focus-within:text-brand-blue dark:group-focus-within:text-[#00D2FF]">
            {t('contact.form.message.label')}
          </label>
          <textarea 
            id="message" 
            required
            rows={4}
            value={formData.message}
            minLength={10}
            maxLength={2000}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, message: e.target.value }));
              if (fieldErrors.message) setFieldErrors(prev => ({ ...prev, message: undefined }));
            }}
            placeholder={t('contact.form.message.placeholder')}
            className="w-full resize-none rounded-xl border border-black/15 bg-white/60 p-4 font-mono text-sm text-zinc-900 transition-[border-color,background-color,box-shadow] duration-200 focus:border-brand-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 dark:border-white/15 dark:bg-black/40 dark:text-white dark:focus:border-[#00D2FF]/50 dark:focus:bg-black/70 disabled:opacity-50"
            disabled={isSubmitting}
            aria-invalid={fieldErrors.message ? 'true' : undefined}
            aria-describedby={fieldErrors.message ? 'message-error' : undefined}
          ></textarea>
          {fieldErrors.message && (
            <p id="message-error" role="alert" aria-live="assertive" className="mt-1 font-mono text-[10px] text-red-500">
              {fieldErrors.message}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400" role="status" aria-live="polite">
            STATUS: <span className={`font-bold ${
              submitStatus === 'success' ? 'text-emerald-500' :
              submitStatus === 'error' ? 'text-red-500' :
              isSubmitting ? 'text-amber-500 animate-pulse' :
              'text-zinc-900 dark:text-zinc-200'
            }`}>
              {submitStatus === 'success' ? 'DELIVERED_SUCCESSFULLY' :
               submitStatus === 'error' ? 'TRANSMISSION_FAILED' :
               isSubmitting ? 'TRANSMITTING...' : 'READY'}
            </span>
          </p>
          
          <Magnetic intensity={0.15}>
            <button 
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-6 py-3.5 font-semibold active:scale-[0.98] transition-[transform,background-color,box-shadow] duration-200 focus:outline-none focus:ring-4 ${
                submitStatus === 'success' 
                ? 'bg-emerald-500 text-white focus:ring-emerald-500/20' 
                : submitStatus === 'error'
                ? 'bg-red-500 text-white focus:ring-red-500/20'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-900/20 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-white/20'
              }`}
            >
              <span className="relative z-10 font-mono tracking-widest text-xs uppercase">
                {submitStatus === 'success' ? t('contact.form.submit.sent') :
                 submitStatus === 'error' ? t('contact.form.submit.retry') :
                 isSubmitting ? t('contact.form.submit.sending') : t('contact.form.submit')}
              </span>
              {submitStatus === 'success' ? (
                <CheckCircle2 className="relative z-10 h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Send className={`relative z-10 h-3.5 w-3.5 transition-transform duration-200 ${isSubmitting ? 'animate-bounce' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'}`} aria-hidden="true" />
              )}
            </button>
          </Magnetic>
        </div>
      </form>
    </div>
  );
}
