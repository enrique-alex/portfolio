import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { translations } from '@/lib/i18n';
import { FALLBACK_PROJECTS } from '@/lib/db/fallback-projects';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ slug: 'supervision-industrielle-scada' }),
}));

vi.mock('next/image', () => ({
  default: ({ alt, src, className }: { alt: string; src: string; className?: string }) =>
    React.createElement('img', { alt, src, className }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('@/components/theme/LanguageProvider', () => ({
  useLanguage: () => ({
    locale: currentTestLocale,
    setLocale: vi.fn(),
    t: (key: string) => translations[currentTestLocale][key] || key,
  }),
}));

vi.mock('@/components/theme/ProjectsProvider', () => ({
  useProjectsData: () => ({
    projects: FALLBACK_PROJECTS[currentTestLocale],
    isLoading: false,
    error: null,
  }),
}));

let currentTestLocale: 'fr' | 'en' = 'fr';

import HeroSection from '@/components/sections/HeroSection';
import ProfileSection from '@/components/sections/ProfileSection';
import AcademicJourney from '@/components/ui/AcademicJourney';
import ExperienceSection from '@/components/sections/ExperienceSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import SkillsSection from '@/components/ui/SkillsSection';
import ContactSection from '@/components/sections/ContactSection';
import SocialLinks from '@/components/sections/SocialLinks';
import Footer from '@/components/layout/Footer';
import SectionDivider from '@/components/ui/SectionDivider';
import { ThreeIndustrialScene } from '@/lib/graphics/ThreeIndustrialScene';

describe('Principal Design Engineering Audit Invariants', () => {
  it('1. should eradicate generic AI copywriting clichés ("passionné par", "Waiting for incoming signals", "Séquence d\'Amorçage") in both FR and EN', () => {
    currentTestLocale = 'fr';
    const allFrValues = Object.values(translations.fr).join(' ');
    const allEnValues = Object.values(translations.en).join(' ');

    expect(allFrValues).not.toContain('Je suis passionné par');
    expect(allFrValues).not.toContain('j\'aime résoudre des problèmes complexes');
    expect(allFrValues).not.toContain('Waiting for incoming signals');
    expect(allFrValues).not.toContain('Séquence d\'Amorçage');
    expect(allFrValues).not.toContain('Extract.Resume_Data');

    expect(allEnValues).not.toContain('I am passionate about');
    expect(allEnValues).not.toContain('I love solving complex problems');
    expect(allEnValues).not.toContain('Waiting for incoming signals');
    expect(allEnValues).not.toContain('Boot Sequence');
    expect(allEnValues).not.toContain('Extract.Resume_Data');

    // Concrete industrial engineering metrics and domain terms must be present
    expect(allFrValues).toContain('ISA-18.2');
    expect(allFrValues).toContain('SCADA');
    expect(allEnValues).toContain('ISA-18.2');
    expect(allEnValues).toContain('SCADA');
  });

  it('2. should mount KineticCanvas instead of CursorFluid in SiteLayout and avoid full-DOM transition-colors on body', () => {
    const siteLayoutContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/(site)/layout.tsx'),
      'utf-8'
    );
    expect(siteLayoutContent).toContain('import KineticCanvas from "@/components/animations/KineticCanvas"');
    expect(siteLayoutContent).toContain('<KineticCanvas />');
    expect(siteLayoutContent).not.toContain('<CursorFluid />');

    const rootLayoutContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/layout.tsx'),
      'utf-8'
    );
    expect(rootLayoutContent).not.toContain('transition-colors duration-700');
  });

  it('3. should render HeroSection with precision telemetry frame, fiducials, and engineering KPIs without cyberpunk overlay', () => {
    currentTestLocale = 'fr';
    const html = renderToString(React.createElement(HeroSection));
    expect(html).toContain('51.03°N 02.37°E');
    expect(html).toContain('ISA-18.2');
    expect(html).toContain('1 kHz');
    expect(html).toContain('Explorer les Systèmes');
    expect(html).toContain('Télécharger le CV [PDF]');
    expect(html).not.toContain('mix-blend-overlay');
  });

  it('4. should render all 6 sections with unbroken sequential editorial tags (01 through 06)', () => {
    currentTestLocale = 'fr';
    const profileHtml = renderToString(React.createElement(ProfileSection));
    const academicHtml = renderToString(React.createElement(AcademicJourney));
    const expHtml = renderToString(React.createElement(ExperienceSection));
    const projHtml = renderToString(React.createElement(ProjectsSection));
    const skillsHtml = renderToString(React.createElement(SkillsSection));
    const contactHtml = renderToString(React.createElement(ContactSection));

    expect(profileHtml).toContain('01 // ARCHITECTURE &amp; IDENTITÉ');
    expect(academicHtml).toContain('02 // FONDATIONS ACADÉMIQUES');
    expect(academicHtml).toContain('md:ml-auto');
    expect(expHtml).toContain('03 // INGÉNIERIE DE TERRAIN');
    expect(projHtml).toContain('04 // SYSTÈMES &amp; RÉALISATIONS');
    expect(skillsHtml).toContain('05 // MATRICE DE COMPÉTENCES');
    expect(contactHtml).toContain('06 // CANAL DE TRANSMISSION');

    // Verify blurry purple glow and giant ENGINEER stroke watermark were eradicated
    expect(skillsHtml).not.toContain('rgba(99,102,241,0.15)');
    expect(projHtml).not.toContain('15vw');
  });

  it('5. should render Footer with WCAG AAA contrast Uplink button and matching aria-label, and crisp SectionDivider without neon blur', () => {
    currentTestLocale = 'fr';
    const footerHtml = renderToString(React.createElement(Footer));
    expect(footerHtml).toContain('aria-label="Haut de page"');
    expect(footerHtml).toContain('text-zinc-800 dark:text-zinc-200');
    expect(footerHtml).not.toContain('opacity-80');

    const dividerHtml = renderToString(React.createElement(SectionDivider));
    expect(dividerHtml).not.toContain('blur-[2px]');
    expect(dividerHtml).not.toContain('blur-[4px]');
  });

  it('6. should achieve 100% English (en) localization parity across HeroSection, AcademicJourney, ExperienceSection, and Footer without leaked French strings', () => {
    currentTestLocale = 'en';
    const heroEn = renderToString(React.createElement(HeroSection));
    const academicEn = renderToString(React.createElement(AcademicJourney));
    const expEn = renderToString(React.createElement(ExperienceSection));
    const footerEn = renderToString(React.createElement(Footer));

    expect(heroEn).toContain('Systems &amp; Testbeds');
    expect(heroEn).toContain('SCADA Supervision');
    expect(heroEn).toContain('HIL &amp; Real-Time');
    expect(heroEn).not.toContain('Systèmes &amp; Bancs');

    expect(academicEn).toContain('02 // ACADEMIC FOUNDATIONS');

    expect(expEn).toContain('03 // FIELD ENGINEERING');
    expect(expEn).toContain('Technical Stack &amp; Tooling');
    expect(expEn).toContain('Industrial Automation');
    expect(expEn).not.toContain('Sys.Tech_Stack');
    expect(expEn).not.toContain('Informatique Industrielle');

    expect(footerEn).toContain('ENRIQUE ALEX NDJAKOU · SYSTEMS &amp; CONTROL ENGINEERING © 2026');
    expect(footerEn).not.toContain('INGÉNIERIE &amp; SYSTÈMES');
    currentTestLocale = 'fr';
  });

  it('7. should render calibrated SkillsSection tier badges, readable SocialLinks without transition-all, and keyboard-accessible project cards with canonical SYS.01..SYS.15 badges', () => {
    currentTestLocale = 'fr';
    const skillsHtml = renderToString(React.createElement(SkillsSection));
    expect(skillsHtml).toContain('IND. / PROD');
    expect(skillsHtml).toContain('92%');

    const socialHtml = renderToString(React.createElement(SocialLinks));
    expect(socialHtml).not.toContain('transition-all');
    expect(socialHtml).not.toContain('group-hover:text-[var(--hover-color)]');
    expect(socialHtml).toContain('group-hover:text-brand-blue');

    const projHtml = renderToString(React.createElement(ProjectsSection));
    expect(projHtml).toContain('role="link"');
    expect(projHtml).toContain('tabindex="0"');
    expect(projHtml).toContain('SYS.01');
    expect(projHtml).toContain('SYS.02');
    expect(projHtml).toContain('SYS.15');
  });

  it('8. should preserve MOBIUS_VOLUMETRIC_STRIP in ThreeIndustrialScene without auto-overwriting Forme 2 and skip redundant GPU buffer uploads on stationary frames', () => {
    const fakeCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLCanvasElement;

    const scene = new ThreeIndustrialScene(fakeCanvas, { pointCount: 60 });
    expect(scene.isEarthCloudLoaded).toBe(false);

    // Switching to topology 1 (Möbius Strip) should NOT auto-overwrite Forme 2 with Earth Cloud
    scene.setTopology(1);
    expect(scene.activeTopologyName).toBe('MOBIUS_VOLUMETRIC_STRIP');
    expect(scene.isEarthCloudLoaded).toBe(false);

    // Settle morphing completely
    for (let f = 0; f < 60; f++) {
      scene.renderFrameForTesting(0.05, f * 50, true);
    }
    expect(scene.morphProgressValue).toBe(1.0);

    // Clear needsUpdate flag (simulating Three.js WebGLRenderer after uploading once)
    const posAttr = scene.positionAttributeForTesting;
    expect(posAttr).not.toBeNull();
    posAttr!.needsUpdate = false;
    const initialVersion = posAttr!.version;

    // Stationary frame with zero morph delta, zero wave, and zero pointer repulsion must NOT trigger GPU buffer re-upload
    scene.renderFrameForTesting(0.016, 4000, false);
    expect(posAttr!.version).toBe(initialVersion);

    scene.destroy();
  });
});
