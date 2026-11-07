'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Activity } from 'lucide-react';

// ─── react-icons : icônes de marques réelles ─────────────
import { 
  SiC, SiCplusplus, SiPython, SiTypescript, SiPostgresql, SiMysql,
  SiArduino, SiLinux, SiGit, SiGithub, SiReact, SiNextdotjs,
  SiDocker, SiFigma, SiLatex,
  SiWireshark, SiMqtt
} from 'react-icons/si';
import { FaProjectDiagram } from 'react-icons/fa';
import { VscVscode, VscTerminalBash } from 'react-icons/vsc';
import { BiMicrochip } from 'react-icons/bi';

// Lucide (déjà installé, fiable)
import { 
  Bot, Ruler, Brain, Users, Target, Lightbulb, 
  Globe, ClipboardList, Code, Gauge, Settings,
  CircuitBoard, Monitor, Workflow, FileSpreadsheet,
  Presentation, FileText, Cpu, Radio,
  Network, ShieldCheck, Wifi
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
    // ① Automatisme & Supervision
    {
      id: 'automation',
      title: t('skills.cat.automation'),
      subtitle: t('skills.cat.automation.sub'),
      color: { r: 16, g: 185, b: 129 },
      skills: [
        { name: 'Ignition (SCADA)', level: 92, icon: Monitor },
        { name: t('skills.item.isa182'), level: 88, icon: Activity },
        { name: t('skills.item.robotics_ind'), level: 90, icon: Bot },
        { name: t('skills.item.emr'), level: 88, icon: Workflow },
        { name: t('skills.item.bond_graph'), level: 86, icon: Activity },
        { name: t('skills.item.amr'), level: 85, icon: Gauge },
        { name: 'Grafcet / GEMMA', level: 88, icon: FaProjectDiagram },
        { name: t('skills.item.pid'), level: 84, icon: Gauge },
        { name: 'MATLAB', level: 85, icon: Activity },
        { name: 'Simulink', level: 82, icon: Workflow },
        { name: 'TIA Portal', level: 78, icon: Settings },
      ],
    },
    // ② Développement Logiciel
    {
      id: 'devsoft',
      title: t('skills.cat.devsoft'),
      subtitle: t('skills.cat.devsoft.sub'),
      color: { r: 59, g: 130, b: 246 },
      skills: [
        { name: 'C', level: 90, icon: SiC },
        { name: 'Python', level: 88, icon: SiPython },
        { name: 'SQL', level: 88, icon: SiPostgresql },
        { name: 'C++', level: 84, icon: SiCplusplus },
        { name: t('skills.item.algo'), level: 86, icon: Brain },
        { name: t('skills.item.poo'), level: 85, icon: Code },
        { name: 'JavaScript / TypeScript', level: 85, icon: SiTypescript },
        { name: 'React / Next.js', level: 82, icon: SiReact },
        { name: 'Linux / Shell Unix', level: 84, icon: SiLinux },
        { name: 'Git / GitHub', level: 86, icon: SiGit },
      ],
    },
    // ③ Électronique & Instrumentation
    {
      id: 'electronics',
      title: t('skills.cat.electronics'),
      subtitle: t('skills.cat.electronics.sub'),
      color: { r: 168, g: 85, b: 247 },
      skills: [
        { name: 'LTSpice', level: 86, icon: CircuitBoard },
        { name: t('skills.item.oscilloscope'), level: 85, icon: Gauge },
        { name: 'KiCad', level: 82, icon: CircuitBoard },
        { name: 'Logisim', level: 84, icon: CircuitBoard },
        { name: 'CATIA V5 / CAO', level: 78, icon: Ruler },
      ],
    },
    // ④ Systèmes Embarqués
    {
      id: 'embedded',
      title: t('skills.cat.embedded'),
      subtitle: t('skills.cat.embedded.sub'),
      color: { r: 239, g: 68, b: 68 },
      skills: [
        { name: 'Arduino / µContrôleurs', level: 90, icon: SiArduino },
        { name: t('skills.item.network_proto'), level: 88, icon: Network },
        { name: t('skills.item.wireshark'), level: 86, icon: SiWireshark },
        { name: 'IoT & LPWAN (LoRaWAN / BLE)', level: 86, icon: Wifi },
        { name: 'MQTT (Mosquitto)', level: 85, icon: SiMqtt },
        { name: t('skills.item.mtls'), level: 84, icon: ShieldCheck },
        { name: t('skills.item.sensors'), level: 82, icon: Gauge },
        { name: 'ASM AVR8', level: 80, icon: Cpu },
        { name: 'CAN / USART', level: 78, icon: Radio },
      ],
    },
    // ⑤ Bureautique & Rédaction technique
    {
      id: 'office',
      title: t('skills.cat.office'),
      subtitle: t('skills.cat.office.sub'),
      color: { r: 236, g: 72, b: 153 }, // Pink
      skills: [
        { name: 'Overleaf / LaTeX', level: 90, icon: SiLatex },
        { name: 'Word', level: 92, icon: FileText },
        { name: 'Excel', level: 88, icon: FileSpreadsheet },
        { name: 'PowerPoint', level: 88, icon: Presentation },
      ],
    },
    // ⑥ Compétences Transversales
    {
      id: 'transversal',
      title: t('skills.cat.transversal'),
      subtitle: t('skills.cat.transversal.sub'),
      color: { r: 245, g: 158, b: 11 },
      skills: [
        { name: t('skills.item.problem_solving'), level: 90, icon: Lightbulb },
        { name: t('skills.item.teamwork'), level: 88, icon: Users },
        { name: t('skills.item.project_mgmt'), level: 86, icon: ClipboardList },
        { name: t('skills.item.tech_comm'), level: 85, icon: Target },
        { name: t('skills.item.tech_english'), level: 80, icon: Globe },
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
  { name: '20-sim', icon: Activity, brandColor: '#00A859' },
  { name: 'Bond Graph', icon: FaProjectDiagram, brandColor: '#10B981' },
  { name: 'RobotStudio', icon: Bot, brandColor: '#FF6F00' },
  { name: 'ROBOGUIDE', icon: Settings, brandColor: '#F5C518' },
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
  { name: 'Wireshark', icon: SiWireshark, brandColor: '#1679A7' },
  { name: 'MQTT', icon: SiMqtt, brandColor: '#660066' },
  { name: 'MySQL', icon: SiMysql, brandColor: '#4479A1' },
  { name: 'PostgreSQL', icon: SiPostgresql, brandColor: '#336791' },
];

// Les Variants sont maintenant définis à l'intérieur du composant pour accéder à useReducedMotion

// ─── Animated Skill Bar ───────────────────────────────────
function SkillBar({ skill, color, index }: { skill: Skill; color: { r: number; g: number; b: number }; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const IconComponent = skill.icon;
  const tierLabel =
    skill.level >= 86
      ? t('skills.tier.core')
      : skill.level >= 80
      ? t('skills.tier.advanced')
      : t('skills.tier.operational');

  return (
    <motion.div 
      className="group flex flex-col gap-2"
      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : index * 0.05, duration: shouldReduceMotion ? 0 : undefined, type: shouldReduceMotion ? false : 'spring', stiffness: 220, damping: 24 }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <IconComponent 
            size={16} 
            aria-hidden="true"
            className="flex-shrink-0 text-zinc-600 dark:text-zinc-400" 
          />
          <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{skill.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded border border-black/10 bg-black/[0.03] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
            {tierLabel}
          </span>
          <span className="font-mono text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
            {`${skill.level}%`}
          </span>
        </div>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
        <motion.div 
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${skill.level}%` }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.15 + index * 0.06, type: 'spring', stiffness: 120, damping: 22 }}
          style={{ 
            background: `linear-gradient(90deg, rgb(${color.r},${color.g},${color.b}), rgba(${color.r},${color.g},${color.b},0.65))`,
            boxShadow: `0 0 10px rgba(${color.r},${color.g},${color.b},0.25)`
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Tool Card (with brand color glow on hover) ──────────
function ToolCard({ tool, isTouch, 'aria-hidden': ariaHidden }: { tool: MarqueeTool; isTouch?: boolean; 'aria-hidden'?: boolean | 'true' | 'false' }) {
  const IconComp = tool.icon;
  return (
    <div 
      aria-hidden={ariaHidden}
      className={`tool-card group relative flex flex-shrink-0 items-center gap-2.5 sm:gap-3 rounded-xl border border-black/[0.08] hover:border-black/25 dark:hover:border-white/25 ${
        isTouch ? 'bg-white/90 dark:bg-[#0A0C10]/90' : 'bg-white/75 backdrop-blur-sm dark:bg-[#0A0C10]/80'
      } px-4 py-2.5 sm:px-5 sm:py-3 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 dark:border-white/[0.08]`}
      style={{
        '--brand': tool.brandColor,
      } as CSSPropertiesWithVars}
    >
      <div className="relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-black/[0.06] bg-black/[0.02] dark:border-white/[0.08] dark:bg-white/[0.04]">
        <IconComp 
          size={18} 
          aria-hidden="true"
          className="flex-shrink-0 text-zinc-600 transition-colors duration-200 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" 
        />
      </div>
      <span className="relative z-10 font-mono text-xs sm:text-sm font-medium whitespace-nowrap text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors duration-200">
        {tool.name}
      </span>
    </div>
  );
}

// ─── CSS Infinite Marquee (pause on hover) ────────────────
function InfiniteMarquee({ tools, direction = 'left', speed = 35, isTouch, label }: { tools: MarqueeTool[]; direction?: 'left' | 'right'; speed?: number; isTouch?: boolean; label: string }) {
  const doubled = [...tools, ...tools];
  
  return (
    <div 
      className="marquee-container group/marquee relative w-full overflow-hidden py-1"
      aria-label={label}
      role="region"
    >
      {/* Fade edges with gradient */}
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[#F8F9FA] via-[#F8F9FA]/80 to-transparent dark:from-[#050505] dark:via-[#050505]/80" />
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[#F8F9FA] via-[#F8F9FA]/80 to-transparent dark:from-[#050505] dark:via-[#050505]/80" />
      
      <div 
        className="marquee-track flex w-max gap-4 will-change-transform"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((tool, i) => (
          <ToolCard 
            key={`${tool.name}-${i}`} 
            tool={tool} 
            isTouch={isTouch} 
            aria-hidden={i >= tools.length ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────
export default function SkillsSection() {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const SKILL_CATEGORIES = useSkillCategories();
  const [activeCategory, setActiveCategory] = useState(SKILL_CATEGORIES[0].id);
  const active = SKILL_CATEGORIES.find(c => c.id === activeCategory)!;

  const topRow = MARQUEE_TOOLS.slice(0, Math.ceil(MARQUEE_TOOLS.length / 2));
  const bottomRow = MARQUEE_TOOLS.slice(Math.ceil(MARQUEE_TOOLS.length / 2));

  return (
    <section id="skills" className="section-contain relative w-full overflow-hidden py-32 lg:py-40 scroll-mt-32">
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
        
        {/* HEADER - Capability Matrix */}
        <motion.div 
          className="mb-16 flex w-full flex-col items-start border-b border-black/10 pb-6 dark:border-white/10 lg:mb-20"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0 : undefined, type: shouldReduceMotion ? false : 'spring', stiffness: 280, damping: 28 }}
        >
          <div className="flex items-center gap-3 mb-3 text-zinc-500 dark:text-zinc-400">
            <Activity className="h-4 w-4 text-brand-blue dark:text-[#00D2FF]" aria-hidden="true" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.3em] uppercase">
              {t('skills.header.tag')}
            </span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white sm:text-4xl md:text-5xl">
            {t('skills.header.title')}
          </h2>
          <p className="mt-4 font-mono text-sm text-zinc-600 dark:text-zinc-400">
            {t('skills.header.subtitle')}
          </p>
        </motion.div>

        {/* LAYOUT : Tabs à gauche + Contenu à droite */}
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
          
          {/* CATEGORY TABS (vertical sur desktop, horizontal sur mobile) */}
          <div className="relative w-full overflow-hidden lg:overflow-visible lg:w-auto">
            <motion.div 
              className="flex flex-row gap-2 overflow-x-auto pb-4 scrollbar-hide scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:!w-0 [&::-webkit-scrollbar]:!h-0 lg:flex-col lg:gap-3 lg:pb-0 lg:overflow-visible"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
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
                      hidden: { 
                        opacity: 0, 
                        y: shouldReduceMotion ? 0 : 20, 
                      },
                      show: { 
                        opacity: 1, 
                        y: 0, 
                        transition: { duration: shouldReduceMotion ? 0 : undefined, type: shouldReduceMotion ? false : 'spring', stiffness: 260, damping: 26 } 
                      },
                    }}
                    onClick={() => setActiveCategory(cat.id)}
                    aria-pressed={isActive}
                    className={`group relative flex flex-shrink-0 flex-col items-start rounded-2xl px-5 py-4 text-left transition-transform duration-200 active:scale-[0.99] lg:w-full overflow-hidden ${
                      isActive 
                        ? 'text-zinc-900 dark:text-white'
                        : 'bg-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="skills-category-pill"
                        className="pointer-events-none absolute inset-0 rounded-2xl bg-white/85 dark:bg-[#0A0C10]/90"
                        style={{
                          boxShadow: `inset 0 0 0 1px rgba(${cat.color.r},${cat.color.g},${cat.color.b},0.4), 0 4px 16px rgba(0,0,0,0.06)`,
                        }}
                        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <div 
                      aria-hidden="true"
                      className="relative z-10 mb-2 h-2 w-2 rounded-full transition-opacity duration-200"
                      style={{ 
                        background: `rgb(${cat.color.r},${cat.color.g},${cat.color.b})`,
                        opacity: isActive ? 1 : 0.35,
                      }}
                    />
                    <span className={`relative z-10 text-sm font-semibold text-zinc-900 dark:text-white transition-opacity duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-65 group-hover:opacity-100'
                    }`}>
                      {cat.title}
                    </span>
                    <span className="relative z-10 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 hidden lg:block line-clamp-2">
                      {cat.subtitle}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Fade cue on right edge for horizontal scroll on mobile */}
            <div 
              aria-hidden="true" 
              className="pointer-events-none absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#F8F9FA] dark:from-[#050505] to-transparent lg:hidden" 
            />
          </div>

          {/* SKILL CARDS PANEL */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ 
                  opacity: 0, 
                  y: shouldReduceMotion ? 0 : 12, 
                }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ 
                  opacity: 0, 
                  y: shouldReduceMotion ? 0 : -12, 
                }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 28 }}
                className="rounded-2xl border border-black/10 bg-white/80 p-8 backdrop-blur-md dark:border-white/10 dark:bg-[#0A0C10]/85 lg:p-10"
                style={{
                  boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(${active.color.r},${active.color.g},${active.color.b},0.12)`,
                }}
              >
                <div className="mb-8 flex items-center justify-between border-b border-black/10 pb-5 dark:border-white/10">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{active.title}</h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{active.subtitle}</p>
                  </div>
                  <div 
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                    style={{ 
                      borderColor: `rgba(${active.color.r},${active.color.g},${active.color.b},0.25)`,
                      background: `rgba(${active.color.r},${active.color.g},${active.color.b},0.08)`,
                      color: `rgb(${active.color.r},${active.color.g},${active.color.b})`
                    }}
                  >
                    <span className="font-mono text-base font-bold tabular-nums">{active.skills.length}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  {active.skills.map((skill, i) => (
                    <SkillBar key={skill.name} skill={skill} color={active.color} index={i} />
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-6 border-t border-black/10 pt-6 dark:border-white/10">
                  <div>
                    <span className="font-mono text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
                      {Math.round(active.skills.reduce((a, s) => a + s.level, 0) / active.skills.length)}%
                    </span>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t('skills.stats.average')}</p>
                  </div>
                  <div className="h-8 w-px bg-black/10 dark:bg-white/10" />
                  <div>
                    <span className="font-mono text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
                      {active.skills.filter(s => s.level >= 65).length}
                    </span>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t('skills.stats.expert')}</p>
                  </div>
                  <div className="h-8 w-px bg-black/10 dark:bg-white/10" />
                  <div>
                    <span 
                      className="font-mono text-2xl font-bold tabular-nums"
                      style={{ color: `rgb(${active.color.r},${active.color.g},${active.color.b})` }}
                    >
                      {active.skills.reduce((a, s) => Math.max(a, s.level), 0)}%
                    </span>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{t('skills.stats.top')}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ─── TOOLBOX MARQUEE (Sans halo violet flou) ─── */}
        <motion.div 
          className="relative mt-24 w-full"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.2, duration: shouldReduceMotion ? 0 : undefined, type: shouldReduceMotion ? false : 'spring', stiffness: 260, damping: 28 }}
        >
          <div className="relative z-10">
            <div className="mb-8 flex flex-col items-center">
              <div className="mb-3 h-px w-16 bg-gradient-to-r from-transparent via-zinc-400 to-transparent dark:via-zinc-600" />
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-zinc-700 dark:text-zinc-300">
                {t('skills.marquee.title')}
              </p>
              <p className="mt-1 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                {t('skills.marquee.subtitle')}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <InfiniteMarquee tools={topRow} direction="left" speed={45} isTouch={isTouch} label={`${t('skills.marquee.title')} - Piste 1`} />
              <InfiniteMarquee tools={bottomRow} direction="right" speed={50} isTouch={isTouch} label={`${t('skills.marquee.title')} - Piste 2`} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
