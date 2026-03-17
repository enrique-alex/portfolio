'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_PHRASES = [
  "Initializing System Subroutines...",
  "Calibrating Neural Interface...",
  "Establishing Secure Handoff...",
  "Compiling Core Assets...",
  "Synchronizing Server Clocks...",
  "Awaiting Final Telemetry..."
];

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Progress counter simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsComplete(true), 800); // Small pause at 100%
          return 100;
        }
        // Random increment to simulate real loading
        const increment = Math.floor(Math.random() * 5) + 1;
        return Math.min(prev + increment, 100);
      });
    }, 45); // Speed of loading

    // Changing phrases 
    const phraseInterval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % LOADING_PHRASES.length);
    }, 600);

    return () => {
      clearInterval(interval);
      clearInterval(phraseInterval);
    };
  }, []);

  // Prevent scrolling while preloader is active
  useEffect(() => {
    if (!isComplete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.05,
            filter: "blur(10px)"
          }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#050505]"
        >
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-blue/5 via-transparent to-transparent opacity-60"></div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            
            {/* SVG Complex Loading Graphic */}
            <div className="relative mb-12 flex h-48 w-48 items-center justify-center">
              
              {/* Outer Rotating Dashed Ring */}
              <motion.svg
                viewBox="0 0 100 100"
                className="absolute inset-0 h-full w-full text-zinc-300 dark:text-zinc-800"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
              </motion.svg>

              {/* Middle Pulsing Ring */}
              <motion.svg
                viewBox="0 0 100 100"
                className="absolute inset-2 h-full w-full text-brand-blue/30"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="20 10"
                />
              </motion.svg>

              {/* Inner Progress Ring (Fills up) */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-4 h-full w-full -rotate-90 text-brand-blue"
              >
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 251" }}
                  animate={{ strokeDasharray: `${(progress / 100) * 251} 251` }}
                  transition={{ ease: "easeOut" }}
                />
              </svg>

              {/* Center Tech Core (Hexagon) */}
              <div className="absolute flex h-full w-full items-center justify-center">
                <motion.div
                  className="flex h-16 w-16 items-center justify-center border border-zinc-900/10 bg-white/50 backdrop-blur-md dark:border-white/10 dark:bg-black/50"
                  style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [0.8, 1, 0.8], opacity: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="font-mono text-[10px] font-bold tracking-widest text-zinc-900 dark:text-white">
                    CORE
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Typography & Stats */}
            <div className="flex flex-col items-center">
              <div className="flex items-end gap-2 overflow-hidden h-16">
                <motion.span 
                  className="font-mono text-5xl font-black tracking-tighter text-zinc-900 dark:text-white sm:text-7xl"
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  {progress}
                </motion.span>
                <span className="mb-2 font-mono text-xl font-medium text-brand-blue">%</span>
              </div>
              
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-400 to-transparent dark:via-zinc-600"></div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                  {LOADING_PHRASES[phraseIndex]}
                </p>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-400 to-transparent dark:via-zinc-600"></div>
              </div>
            </div>

          </div>

          {/* Bottom Grid Floor Illusion */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1/3 bg-[linear-gradient(to_bottom,transparent,#80808012_1px),linear-gradient(to_right,transparent,#80808012_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_top,black,transparent)]"
            style={{ transform: "perspective(500px) rotateX(60deg)", transformOrigin: "bottom" }}
          ></div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
