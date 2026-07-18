'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants, useReducedMotion } from 'framer-motion';
import { Activity } from 'lucide-react';

// ─── react-icons : icônes de marques réelles ─────────────
import { 
  SiC, SiCplusplus, SiPython, SiTypescript, SiPostgresql, SiMysql,
  SiArduino, SiLinux, SiGit, SiGithub, SiReact, SiNextdotjs,
  SiDocker, SiFigma, SiGnubash, SiLatex
} from 'react-icons/si';
import { FaProjectDiagram } from 'react-icons/fa';
import { VscVscode, VscTerminalBash } from 'react-icons/vsc';
import { BiMicrochip } from 'react-icons/bi';

// Lucide (déjà installé, fiable)
import { 
  Bot, Ruler, Brain, Users, Target, Lightbulb, 
  Globe, ClipboardList, Code, Gauge, Settings,
  CircuitBoard, Monitor, Workflow
} from 'lucide-react';

// ─── DATA ─────────────────────────────────────────────────
interface CSSPropertiesWithVars extends React.CSSProperties {
  [key: `--${string}`]: string | number | undefined;
}

interface Skill {
  name: string;
  level: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

interface SkillCategory {
  id: string;
  title: string;
  subtitle: string;
  color: { r: number; g: number; b: number };
  skills: Skill[];
}

import { useLanguage } from '../theme/LanguageProvider';

function useSkillCategories(): SkillCategory[] {
  const { t } = useLanguage();
  return [
    {
      id: 'languages',
      title: t('skills.cat.languages'),
      subtitle: t('skills.cat.languages.sub'),
      color: { r: 59, g: 130, b: 246 },
      skills: [
        { name: 'C', level: 75, icon: SiC },
        { name: 'C++', level: 65, icon: SiCplusplus },
        { name: 'Python', level: 70, icon: SiPython },
        { name: 'JavaScript / TypeScript', level: 50, icon: SiTypescript },
        { name: 'SQL', level: 45, icon: SiPostgresql },
      ],
    },
    {
      id: 'embedded',
      title: t('skills.cat.embedded'),
      subtitle: t('skills.cat.embedded.sub'),
      color: { r: 16, g: 185, b: 129 },
      skills: [
        { name: 'Arduino / µContrôleurs', level: 70, icon: SiArduino },
        { name: 'Robotino / Automates', level: 60, icon: Bot },
        { name: 'Grafcet / GEMMA', level: 65, icon: FaProjectDiagram },
        { name: 'MATLAB', level: 60, icon: Activity },
        { name: 'Simulink', level: 55, icon: Workflow },
        { name: 'TIA Portal', level: 55, icon: Settings },
        { name: 'Ignition (SCADA)', level: 50, icon: Monitor },
        { name: 'Capteurs Industriels', level: 62, icon: Gauge },
        { name: 'Logisim', level: 55, icon: CircuitBoard },
        { name: 'CATIA V5 / CAO', level: 50, icon: Ruler },
      ],
    },
    {
      id: 'software',
      title: t('skills.cat.software'),
      subtitle: t('skills.cat.software.sub'),
      color: { r: 168, g: 85, b: 247 },
      skills: [
        { name: 'Linux / Shell Unix', level: 68, icon: SiLinux },
        { name: 'Git / GitHub', level: 65, icon: SiGit },
        { name: 'React / Next.js', level: 45, icon: SiReact },
        { name: 'POO / Design Patterns', level: 65, icon: Code },
        { name: 'Algorithmique', level: 70, icon: Brain },
      ],
    },
    {
      id: 'transversal',
      title: t('skills.cat.transversal'),
      subtitle: t('skills.cat.transversal.sub'),
      color: { r: 245, g: 158, b: 11 },
      skills: [
        { name: 'Gestion de Projet', level: 65, icon: ClipboardList },
        { name: 'Travail en Équipe', level: 75, icon: Users },
        { name: 'Communication Technique', level: 60, icon: Target },
        { name: 'Résolution de Problèmes', level: 72, icon: Lightbulb },
        { name: 'Anglais Technique (B1+)', level: 55, icon: Globe },
      ],
    },
  ];
}

// ─── MARQUEE : Outils & Technos défilantes ───────────────
interface MarqueeTool {
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
  brandColor: string; // hex color de la marque
}

const MARQUEE_TOOLS: MarqueeTool[] = [
  { name: 'C', icon: SiC, brandColor: '#A8B9CC' },
  { name: 'C++', icon: SiCplusplus, brandColor: '#00599C' },
  { name: 'Python', icon: SiPython, brandColor: '#3776AB' },
  { name: 'TypeScript', icon: SiTypescript, brandColor: '#3178C6' },
  { name: 'Arduino', icon: SiArduino, brandColor: '#00878F' },
  { name: 'Linux', icon: SiLinux, brandColor: '#FCC624' },
  { name: 'Git', icon: SiGit, brandColor: '#F05032' },
  { name: 'GitHub', icon: SiGithub, brandColor: '#8B5CF6' },
  { name: 'React', icon: SiReact, brandColor: '#61DAFB' },
  { name: 'MATLAB', icon: Activity, brandColor: '#E16737' },
  { name: 'Simulink', icon: Workflow, brandColor: '#00B2E2' },
  { name: 'TIA Portal', icon: Settings, brandColor: '#009999' },
  { name: 'Ignition', icon: Monitor, brandColor: '#F57C00' },
  { name: 'Logisim', icon: CircuitBoard, brandColor: '#4CAF50' },
  { name: 'Next.js', icon: SiNextdotjs, brandColor: '#8B5CF6' },
  { name: 'Docker', icon: SiDocker, brandColor: '#2496ED' },
  { name: 'VS Code', icon: VscVscode, brandColor: '#007ACC' },
  { name: 'LaTeX', icon: SiLatex, brandColor: '#008080' },
  { name: 'Figma', icon: SiFigma, brandColor: '#F24E1E' },
  { name: 'Bash', icon: VscTerminalBash, brandColor: '#4EAA25' },
  { name: 'Microcontrôleur', icon: BiMicrochip, brandColor: '#00BCD4' },
  { name: 'MySQL', icon: SiMysql, brandColor: '#4479A1' },
  { name: 'PostgreSQL', icon: SiPostgresql, brandColor: '#336791' },
];

// Les Variants sont maintenant définis à l'intérieur du composant pour accéder à useReducedMotion

// ─── Animated Skill Bar ───────────────────────────────────
function SkillBar({ skill, color, index }: { skill: Skill; color: { r: number; g: number; b: number }; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const IconComponent = skill.icon;
  return (
    <motion.div 
      className="group flex flex-col gap-2"
      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : index * 0.07, duration: shouldReduceMotion ? 0 : undefined, type: shouldReduceMotion ? false : 'spring', stiffness: 150, damping: 20 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <IconComponent 
            size={16} 
            className="flex-shrink-0 text-zinc-600 dark:text-zinc-400" 
          />
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{skill.name}</span>
        </div>
        <span className="text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
          {skill.level}%
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
        <motion.div 
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${skill.level}%` }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.3 + index * 0.1, duration: shouldReduceMotion ? 0 : 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ 
            background: `linear-gradient(90deg, rgb(${color.r},${color.g},${color.b}), rgba(${color.r},${color.g},${color.b},0.6))`,
            boxShadow: `0 0 12px rgba(${color.r},${color.g},${color.b},0.3)`
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Tool Card (with brand color glow on hover) ──────────
function ToolCard({ tool }: { tool: MarqueeTool }) {
  const IconComp = tool.icon;
  return (
    <div 
      className="tool-card group relative flex flex-shrink-0 items-center gap-2.5 sm:gap-3 rounded-2xl border border-black/[0.06] bg-white/60 px-4 py-2.5 sm:px-5 sm:py-3.5 backdrop-blur-sm transition-all duration-500 hover:scale-105 dark:border-white/[0.08] dark:bg-white/[0.03]"
      style={{
        '--brand': tool.brandColor,
      } as CSSPropertiesWithVars}
    >
      {/* Glow border on hover */}
      <div 
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${tool.brandColor}15, transparent 50%, ${tool.brandColor}10)`,
          boxShadow: `inset 0 0 0 1px ${tool.brandColor}30, 0 4px 20px ${tool.brandColor}15, 0 0 40px ${tool.brandColor}08`,
        }}
      />
      {/* Icon wrapper with brand color pulse */}
      <div className="relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-black/[0.04] bg-black/[0.02] transition-all duration-500 group-hover:border-transparent dark:border-white/[0.06] dark:bg-white/[0.04]"
        style={{
          // Hover will be driven by the parent group
        }}
      >
        <IconComp 
          size={18} 
          className="flex-shrink-0 text-zinc-500 transition-all duration-500 dark:text-zinc-400" 
          style={{
            // Brand color on hover is applied by parent
          }}
        />
        {/* Subtle glow behind icon on hover */}
        <div 
          className="absolute inset-0 rounded-xl opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-40"
          style={{ background: tool.brandColor }}
        />
      </div>
      <span className="relative z-10 text-xs sm:text-sm font-medium whitespace-nowrap text-zinc-600 transition-colors duration-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white">
        {tool.name}
      </span>
    </div>
  );
}

// ─── CSS Infinite Marquee (pause on hover) ────────────────
function InfiniteMarquee({ tools, direction = 'left', speed = 35 }: { tools: MarqueeTool[]; direction?: 'left' | 'right'; speed?: number }) {
  const doubled = [...tools, ...tools];
  
  return (
    <div className="marquee-container group/marquee relative w-full overflow-hidden py-1">
      {/* Fade edges with gradient */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/80" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/80" />
      
      <div 
        className="marquee-track flex w-max gap-4"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((tool, i) => (
          <ToolCard key={`${tool.name}-${i}`} tool={tool} />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────
export default function SkillsSection() {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const SKILL_CATEGORIES = useSkillCategories();
  const [activeCategory, setActiveCategory] = useState(SKILL_CATEGORIES[0].id);
  const active = SKILL_CATEGORIES.find(c => c.id === activeCategory)!;

  const topRow = MARQUEE_TOOLS.slice(0, Math.ceil(MARQUEE_TOOLS.length / 2));
  const bottomRow = MARQUEE_TOOLS.slice(Math.ceil(MARQUEE_TOOLS.length / 2));

  return (
    <section id="skills" className="relative w-full overflow-hidden py-32 lg:py-40 scroll-mt-32">
      {/* Background grid subtile */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(128,128,128,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(128,128,128,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 relative z-10">
        
        {/* HEADER - System Process Monitor Style */}
        <motion.div 
          className="mb-16 flex w-full flex-col items-start border-b border-black/10 pb-6 dark:border-white/10 lg:mb-20"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
        >
          <div className="flex items-center gap-3 mb-3 text-zinc-500 dark:text-zinc-400">
            <Activity className="h-4 w-4" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.3em] uppercase">
              System.Process.Monitor
            </span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
            {t('skills.header.title')}
          </h2>
          <p className="mt-4 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            {t('skills.header.subtitle')}
          </p>
        </motion.div>

        {/* LAYOUT : Tabs à gauche + Contenu à droite */}
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
          
          {/* CATEGORY TABS (vertical) */}
          <motion.div 
            className="flex flex-row gap-2 overflow-x-auto pb-4 scrollbar-hide lg:flex-col lg:gap-3 lg:pb-0"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08 },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {SKILL_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategory;
              return (
                <motion.button
                  key={cat.id}
                  variants={{
                    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30, filter: shouldReduceMotion ? 'blur(0px)' : 'blur(8px)' },
                    show: { 
                      opacity: 1, y: 0, filter: 'blur(0px)',
                      transition: { duration: shouldReduceMotion ? 0 : undefined, type: shouldReduceMotion ? false : 'spring', stiffness: 120, damping: 20 } 
                    },
                  }}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`group relative flex flex-shrink-0 flex-col items-start rounded-2xl px-5 py-4 text-left transition-all duration-300 lg:w-full ${
                    isActive 
                      ? 'bg-black/[0.04] dark:bg-white/[0.06]'
                      : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                  }`}
                  style={isActive ? {
                    boxShadow: `inset 0 0 0 1px rgba(${cat.color.r},${cat.color.g},${cat.color.b},0.2), 0 4px 12px rgba(${cat.color.r},${cat.color.g},${cat.color.b},0.08)`
                  } : undefined}
                >
                  <div 
                    className="mb-2 h-2 w-2 rounded-full transition-all duration-300"
                    style={{ 
                      background: `rgb(${cat.color.r},${cat.color.g},${cat.color.b})`,
                      opacity: isActive ? 1 : 0.3,
                      boxShadow: isActive ? `0 0 8px rgba(${cat.color.r},${cat.color.g},${cat.color.b},0.5)` : 'none'
                    }}
                  />
                  <span className={`text-sm font-semibold transition-colors duration-300 ${
                    isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {cat.title}
                  </span>
                  <span className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500 hidden lg:block">
                    {cat.subtitle}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* SKILL CARDS PANEL */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15, filter: shouldReduceMotion ? 'blur(0px)' : 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -15, filter: shouldReduceMotion ? 'blur(0px)' : 'blur(6px)' }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeInOut' }}
                className="rounded-3xl border border-black/5 bg-black/[0.02] p-8 backdrop-blur-sm dark:border-white/5 dark:bg-white/[0.02] lg:p-10"
                style={{
                  boxShadow: `0 0 0 0.5px rgba(${active.color.r},${active.color.g},${active.color.b},0.1), 0 8px 32px rgba(0,0,0,0.04)`,
                }}
              >
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{active.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{active.subtitle}</p>
                  </div>
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ 
                      background: `rgba(${active.color.r},${active.color.g},${active.color.b},0.1)`,
                      color: `rgb(${active.color.r},${active.color.g},${active.color.b})`
                    }}
                  >
                    <span className="text-lg font-bold">{active.skills.length}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  {active.skills.map((skill, i) => (
                    <SkillBar key={skill.name} skill={skill} color={active.color} index={i} />
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-6 border-t border-black/5 pt-6 dark:border-white/5">
                  <div>
                    <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {Math.round(active.skills.reduce((a, s) => a + s.level, 0) / active.skills.length)}%
                    </span>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Maîtrise moyenne</p>
                  </div>
                  <div className="h-8 w-px bg-black/5 dark:bg-white/5" />
                  <div>
                    <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {active.skills.filter(s => s.level >= 85).length}
                    </span>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Expert (85%+)</p>
                  </div>
                  <div className="h-8 w-px bg-black/5 dark:bg-white/5" />
                  <div>
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: `rgb(${active.color.r},${active.color.g},${active.color.b})` }}
                    >
                      {active.skills.reduce((a, s) => Math.max(a, s.level), 0)}%
                    </span>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Top compétence</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ─── TOOLBOX MARQUEE (Premium) ─── */}
        <motion.div 
          className="relative mt-24 w-full"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.3, duration: shouldReduceMotion ? 0 : 0.7 }}
        >
          {/* Radial glow backdrop */}
          <div className="pointer-events-none absolute -inset-x-20 -top-16 -bottom-16 z-0 opacity-30 dark:opacity-20" 
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(99,102,241,0.15), transparent)',
            }}
          />

          <div className="relative z-10">
            <div className="mb-8 flex flex-col items-center">
              <div className="mb-3 h-px w-16 bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600 dark:text-zinc-400">
                {t('skills.marquee.title')}
              </p>
              <p className="mt-1 text-[11px] text-zinc-400/60 dark:text-zinc-500/50">
                {t('skills.marquee.subtitle')}
              </p>
            </div>
            <div className="flex flex-col gap-5">
              <InfiniteMarquee tools={topRow} direction="left" speed={45} />
              <InfiniteMarquee tools={bottomRow} direction="right" speed={50} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
