'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { name: 'Accueil', href: '#home' },
  { name: 'À Propos', href: '#profile' },
  { name: 'Parcours', href: '#academic' },
  { name: 'Expérience', href: '#experience' },
  { name: 'Projets', href: '#projects' },
  { name: 'Compétences', href: '#skills' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState('Accueil');
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Refs for the pill indicator
  const navRef = useRef<HTMLElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    // Intersection Observer to update active navigation segment on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const matchingLink = NAV_LINKS.find((l) => l.href === `#${entry.target.id}`);
            if (matchingLink) {
              setActiveSegment(matchingLink.name);
            }
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px' } 
    );

    setTimeout(() => {
      NAV_LINKS.forEach((link) => {
        const sect = document.querySelector(link.href);
        if (sect) observer.observe(sect);
      });
    }, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // Animate pill position to active link
  useEffect(() => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector(`[data-segment="${activeSegment}"]`) as HTMLElement;
    if (activeEl) {
      const navRect = navRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setPillStyle({
        left: elRect.left - navRect.left,
        width: elRect.width,
      });
    }
  }, [activeSegment, mounted]);

  return (
    <>


      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-700 ease-out ${
          isScrolled ? 'py-3' : 'py-6'
        }`}
      >
        <div 
          className={`mx-auto flex items-center justify-between transition-all duration-700 ease-out ${
            isScrolled 
              ? 'max-w-4xl rounded-[22px] px-5 py-2.5' 
              : 'max-w-7xl bg-transparent px-6 lg:px-12 py-2'
          }`}
          style={isScrolled ? {
            background: mounted && theme === 'dark' 
              ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.5) 100%)',
            backdropFilter: 'blur(24px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
            boxShadow: mounted && theme === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 0.5px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.8)',
          } : undefined}
        >
          
          {/* LOGO */}
          <a 
            href="#home" 
            className="group relative z-50 text-xl font-bold tracking-tighter text-zinc-900 transition-opacity hover:opacity-80 dark:text-white"
            onClick={() => setActiveSegment('Accueil')}
          >
            Enrique<span className="text-brand-blue">.Ndjakou</span>
            <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-gradient-to-r from-brand-blue to-transparent transition-all duration-300 group-hover:w-full"></span>
          </a>

          {/* NAVIGATION DESKTOP — Liquid Glass Segmented Control */}
          <nav ref={navRef} className="hidden items-center gap-2 md:flex relative">
            {/* Sliding Pill Indicator (animated) */}
            <motion.div 
              className="absolute top-0 h-full rounded-full z-0"
              animate={{ left: pillStyle.left, width: pillStyle.width }}
              transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
              style={{
                background: mounted && theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)'
                  : 'linear-gradient(135deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 100%)',
                boxShadow: mounted && theme === 'dark'
                  ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.2)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06)',
                border: mounted && theme === 'dark'
                  ? '1px solid rgba(255,255,255,0.08)'
                  : '1px solid rgba(0,0,0,0.04)',
                backdropFilter: 'blur(12px)',
              }}
            />

            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                data-segment={link.name}
                onClick={() => setActiveSegment(link.name)}
                className={`relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  activeSegment === link.name 
                    ? 'text-zinc-900 dark:text-white' 
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* ACTIONS DESKTOP */}
          <div className="hidden md:flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-zinc-500 transition-all duration-300 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white"
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                  border: theme === 'dark'
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(0,0,0,0.06)',
                  boxShadow: theme === 'dark'
                    ? 'inset 0 1px 0 rgba(255,255,255,0.06)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(12px)',
                }}
                aria-label="Toggle Theme"
              >
                <Sun className="absolute h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </button>
            )}

            <a
              href="#contact"
              className="group relative flex items-center justify-center overflow-hidden rounded-full px-5 py-2 text-sm font-medium transition-all duration-300"
              style={{
                background: mounted && theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)'
                  : 'linear-gradient(135deg, rgba(15,15,15,0.9) 0%, rgba(30,30,30,0.85) 100%)',
                color: mounted && theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#fff',
                border: mounted && theme === 'dark'
                  ? '1px solid rgba(255,255,255,0.12)'
                  : '1px solid rgba(0,0,0,0.1)',
                boxShadow: mounted && theme === 'dark'
                  ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Specular light sweep on hover */}
              <span className="absolute inset-0 -translate-x-full rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100" />
              <span className="relative z-10">Me contacter</span>
            </a>
          </div>

          {/* BURGER MOBILE */}
          <button
            className="z-50 relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full md:hidden"
            style={{
              background: mounted && theme === 'dark'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.04)',
              border: mounted && theme === 'dark'
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid rgba(0,0,0,0.06)',
              backdropFilter: 'blur(12px)',
            }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <span className={`h-[1.5px] w-5 bg-zinc-900 transition-all duration-300 dark:bg-white ${isMobileMenuOpen ? 'translate-y-[7.5px] rotate-45' : ''}`}></span>
            <span className={`h-[1.5px] w-5 bg-zinc-900 transition-all duration-300 dark:bg-white ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`h-[1.5px] w-5 bg-zinc-900 transition-all duration-300 dark:bg-white ${isMobileMenuOpen ? '-translate-y-[7.5px] -rotate-45' : ''}`}></span>
          </button>
        </div>

        {/* OVERLAY MENU MOBILE */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden"
              style={{
                background: mounted && theme === 'dark'
                  ? 'rgba(5,5,5,0.92)'
                  : 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(40px) saturate(1.8)',
              }}
            >
              <nav className="flex flex-col items-center gap-8">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="text-3xl font-light tracking-tight text-zinc-600 transition-colors hover:text-zinc-900 dark:text-white/70 dark:hover:text-white"
                    onClick={() => {
                      setActiveSegment(link.name);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {link.name}
                  </motion.a>
                ))}
                {mounted && (
                  <button
                    onClick={() => {
                      setTheme(theme === 'dark' ? 'light' : 'dark');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-lg font-medium text-zinc-500 hover:text-zinc-900 dark:text-white/60 dark:hover:text-white"
                  >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    {theme === 'dark' ? 'Mode Jour' : 'Mode Nuit'}
                  </button>
                )}

                <a
                  href="#contact"
                  className="mt-8 rounded-full bg-zinc-900 px-8 py-4 text-lg font-medium text-white shadow-[0_0_40px_rgba(0,0,0,0.1)] transition-transform active:scale-95 dark:bg-white dark:text-black dark:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Prendre Contact
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}