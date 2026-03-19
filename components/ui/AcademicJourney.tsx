'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

import { useLanguage } from '../theme/LanguageProvider';

function useJourneyData() {
  const { t } = useLanguage();
  return [
    {
      year: "2025 - 2028",
      title: t('academic.0.title'),
      school: t('academic.0.school'),
      description: t('academic.0.desc')
    },
    {
      year: "2023 - 2025",
      title: t('academic.1.title'),
      school: t('academic.1.school'),
      description: t('academic.1.desc')
    },
    {
      year: "2021 - 2022",
      title: t('academic.2.title'),
      school: t('academic.2.school'),
      description: t('academic.2.desc')
    }
  ];
}

export default function AcademicJourney() {
  const { t } = useLanguage();
  const journeyData = useJourneyData();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  // Synchronisation stricte de la hauteur du circuit avec le conteneur du DOM
  useEffect(() => {
    if (containerRef.current) {
      setSvgHeight(containerRef.current.offsetHeight);
    }
    
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (containerRef.current) {
          setSvgHeight(containerRef.current.offsetHeight);
        }
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Calcul physique du scroll relatif à la section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end 80%"]
  });

  // Mapper le scroll (0->1) à la longueur du SVG (0->1)
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} id="academic" className="relative w-full max-w-7xl mx-auto py-32 px-4 sm:px-8 overflow-hidden z-10 scroll-mt-32">
      
      {/* HEADER - System Process Monitor Style */}
      <motion.div 
        className="mb-16 flex w-full flex-col items-start border-b border-black/10 pb-6 dark:border-white/10 lg:mb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-3 text-zinc-500 dark:text-zinc-400">
          <GraduationCap className="h-4 w-4" />
          <span className="font-mono text-[10px] font-semibold tracking-[0.3em] uppercase">
            System.Process.Monitor
          </span>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
          {t('academic.header.title')}
        </h2>
        <p className="mt-4 font-mono text-sm text-zinc-500 dark:text-zinc-400">
          {t('academic.header.subtitle')}
        </p>
      </motion.div>

      <div className="relative">
        {/* PCB Trace Line (Ligne de Circuit Imprimé SVG animée) */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 pointer-events-none z-0">
            {svgHeight > 0 && (
              <svg
                  width="2"
                  height={svgHeight}
                  className="absolute top-0 left-0"
                  xmlns="http://www.w3.org/2000/svg"
              >
                  {/* Piste de fond non alimentée */}
                  <path
                      d={`M1 0V${svgHeight}`}
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeWidth="2"
                      className="text-zinc-500 dark:text-white"
                  />
                  {/* Piste alimentée par l'énergie du scroll */}
                  <motion.path
                      d={`M1 0V${svgHeight}`}
                      stroke="transparent" // Fallback
                      strokeWidth="2"
                      className="stroke-brand-blue drop-shadow-[0_0_8px_rgba(138,180,248,0.8)]"
                      style={{
                          pathLength: pathLength,
                      }}
                  />
              </svg>
            )}
        </div>

        {/* Blocs de Typographie Spatiale Flottante */}
        <div className="relative z-10 flex flex-col gap-32 md:gap-40">
          {journeyData.map((item, index) => {
            // Alternance asymétrique pour la grille desktop
            const isEven = index % 2 === 0;

            return (
              <div 
                key={index}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-16 w-full ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                
                {/* Typographie Géante (Stroke) - Année */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: "-20%" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`flex-1 w-full pl-16 sm:pl-20 md:pl-0 ${isEven ? "md:text-right" : "md:text-left"}`}
                >
                   <h3 className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-black text-transparent outline-none tracking-tighter" 
                       style={{ WebkitTextStroke: "1.5px currentColor", color: "transparent" }}>
                     <span className="text-zinc-900/20 dark:text-white/20 select-none">
                       {item.year.split(" - ")[0]}
                     </span>
                     <span className="block text-3xl md:text-4xl lg:text-5xl text-zinc-400 dark:text-zinc-600 sm:inline-block sm:ml-4" style={{ WebkitTextStroke: "0px" }}>
                        - {item.year.split(" - ")[1]}
                     </span>
                   </h3>
                </motion.div>

                {/* Point de connexion matériel (Node) */}
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: false, margin: "-20%" }}
                  transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
                  className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-zinc-900 border-2 border-brand-blue shadow-[0_0_15px_rgba(138,180,248,0.6)] -translate-x-1/2 mt-2 md:mt-0 dark:bg-[#050505]"
                ></motion.div>

                {/* Données d'Ingénierie - Titre & Détails */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: "-20%" }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                  className={`flex-1 w-full pl-20 md:pl-0 ${isEven ? "md:text-left" : "md:text-right"}`}
                >
                   <h4 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 leading-tight tracking-tight">
                     {item.title}
                   </h4>
                   <p className="text-sm font-bold text-brand-blue tracking-widest uppercase mb-6">
                     {item.school}
                   </p>
                   <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base md:text-lg max-w-lg">
                     {item.description}
                   </p>
                </motion.div>
                
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
