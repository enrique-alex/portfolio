'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Terminal, Mail, Github, Linkedin, Phone, Copy, CheckCircle2, ArrowUpRight } from 'lucide-react';
import Magnetic from '@/components/ui/Magnetic';

export default function ContactSection() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Form States
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

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
          subject: `Nouveau message de ${formData.name} via le Portfolio`
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
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

  const socialLinks = [
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
      name: 'Téléphone',
      value: '+33 6 44 79 60 57',
      url: 'tel:+33644796057',
      icon: Phone,
      color: 'rgba(52, 168, 83, 0.9)',
      brandColor: '#34a853'
    }
  ];

  return (
    <section id="contact" className="relative w-full py-24 lg:py-32 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-blue/5 via-transparent to-transparent opacity-50 dark:from-brand-blue/10"></div>
      
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 relative z-10">
        
        {/* HEADER - System Process Monitor Style */}
        <motion.div 
          className="mb-16 flex w-full flex-col items-start border-b border-black/10 pb-6 dark:border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-3 text-zinc-500 dark:text-zinc-400">
            <Send className="h-4 w-4" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.3em] uppercase">
              System.Transmission.Gateway
            </span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
            Initialiser le Contact
          </h2>
          <p className="mt-4 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            {'>'} Waiting for incoming signals...
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Terminal Form */}
          <motion.div 
            className="lg:col-span-3 w-full"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
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
                
                <div className="group relative">
                  <label htmlFor="name" className="mb-2 block font-mono text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 transition-colors group-focus-within:text-brand-blue">
                    Identifiant
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Votre nom..."
                    className="w-full rounded-none border-b border-black/20 bg-transparent px-0 py-2 font-mono text-sm text-zinc-900 transition-colors focus:border-brand-blue focus:outline-none dark:border-white/20 dark:text-white dark:focus:border-brand-blue disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="group relative">
                  <label htmlFor="email" className="mb-2 block font-mono text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 transition-colors group-focus-within:text-brand-blue">
                    Adresse_Retour
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="votre@email.com"
                    className="w-full rounded-none border-b border-black/20 bg-transparent px-0 py-2 font-mono text-sm text-zinc-900 transition-colors focus:border-brand-blue focus:outline-none dark:border-white/20 dark:text-white dark:focus:border-brand-blue disabled:opacity-50"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="group relative">
                  <label htmlFor="message" className="mb-2 block font-mono text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 transition-colors group-focus-within:text-brand-blue">
                    Payload
                  </label>
                  <textarea 
                    id="message" 
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Entrez votre message ici..."
                    className="w-full resize-none rounded-lg border border-black/10 bg-white/50 p-4 font-mono text-sm text-zinc-900 transition-all focus:border-brand-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 dark:border-white/10 dark:bg-black/50 dark:text-white dark:focus:border-brand-blue/50 dark:focus:bg-black disabled:opacity-50"
                    disabled={isSubmitting}
                  ></textarea>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
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
                        {submitStatus === 'success' ? 'Message Sent' :
                         submitStatus === 'error' ? 'Retry' :
                         isSubmitting ? 'Sending...' : 'Send_Transmission'}
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
          </motion.div>

          {/* RIGHT COLUMN: Comms Array */}
          <motion.div 
            className="lg:col-span-2 flex flex-col gap-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div>
              <h3 className="mb-6 font-mono text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                <span className="text-brand-blue">//</span> Nodes de Communication
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
                          // @ts-expect-error CSS custom vars
                          '--hover-color': link.brandColor
                        }}
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

            {/* Quick Copy Feature */}
            <div className="mt-4 rounded-xl border border-black/5 bg-black/[0.02] p-6 dark:border-white/5 dark:bg-white/[0.01]">
              <p className="mb-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">Cliquez pour copier l'adresse email principale :</p>
              <button 
                onClick={() => handleCopy('enriquekemayou@gmail.com')}
                className="group flex w-full items-center justify-between rounded-lg border border-black/10 bg-white px-4 py-3 transition-colors hover:border-brand-blue hover:bg-zinc-50 dark:border-white/10 dark:bg-black/50 dark:hover:border-brand-blue dark:hover:bg-black"
              >
                <span className="font-mono text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-brand-blue">
                  enriquekemayou@gmail.com
                </span>
                {copiedText === 'enriquekemayou@gmail.com' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-brand-blue" />
                )}
              </button>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
