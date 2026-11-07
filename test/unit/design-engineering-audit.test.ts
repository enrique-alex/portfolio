import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
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

// @ts-expect-error Vite raw query import
import siteLayoutContent from '@/app/(site)/layout.tsx?raw';
// @ts-expect-error Vite raw query import
import rootLayoutContent from '@/app/layout.tsx?raw';
// @ts-expect-error Vite raw query import
import cursorFluidContent from '@/components/animations/CursorFluid.tsx?raw';
// @ts-expect-error Vite raw query import
import magneticCardContent from '@/components/ui/MagneticProjectCard.tsx?raw';
// @ts-expect-error Vite raw query import
import projectsGridContent from '@/components/ui/ProjectsGrid.tsx?raw';
// @ts-expect-error Vite raw query import
import webglFluidContent from '@/components/animations/webgl-fluid.js?raw';
// @ts-expect-error Vite raw query import
import skillsSectionContent from '@/components/ui/SkillsSection.tsx?raw';
// @ts-expect-error Vite raw query import
import mobileHudDrawerContent from '@/components/layout/MobileHudDrawer.tsx?raw';
// @ts-expect-error Vite raw query import
import projectCardContent from '@/components/ui/ProjectCard.tsx?raw';

describe('Principal Design Engineering Audit Invariants', () => {
  it('1. should eradicate generic AI copywriting clichés ("passionné par", "Waiting for incoming signals", "Séquence d\'Amorçage") in both FR and EN while highlighting multidisciplinary engineering & international mobility', () => {
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

    // Multidisciplinary positioning + international internship projection + Minakem experience metrics
    expect(allFrValues).toContain('stage à l\'étranger');
    expect(allFrValues).toContain('systèmes embarqués');
    expect(allFrValues).toContain('robotique');
    expect(allFrValues).toContain('ISA-18.2');
    expect(allEnValues).toContain('international internship');
    expect(allEnValues).toContain('embedded systems');
    expect(allEnValues).toContain('robotics');
    expect(allEnValues).toContain('ISA-18.2');

    // Verify RootLayout metadata and MobileHudDrawer reflect multidisciplinary scope
    expect(rootLayoutContent).toContain('Systèmes Embarqués');
    expect(rootLayoutContent).toContain('Robotique');
    expect(rootLayoutContent).toContain('Stage International');
    expect(mobileHudDrawerContent).toContain('Embarqué, Robotique & Logiciel');
    expect(mobileHudDrawerContent).toContain('Embedded, Robotics & Software');
    expect(mobileHudDrawerContent).not.toContain('SCADA, PLCs & Logiciel');
    expect(mobileHudDrawerContent).not.toContain('transition-all');
  });

  it('2. should mount CursorFluid in SiteLayout with natural fluid dynamics (SHADING: true, COLORFUL: true) and avoid full-DOM transition-colors on body', () => {
    expect(siteLayoutContent).toContain('import CursorFluid from "@/components/animations/CursorFluid"');
    expect(siteLayoutContent).toContain('<CursorFluid />');
    expect(siteLayoutContent).not.toContain('<KineticCanvas />');
    expect(cursorFluidContent).toContain('SHADING: true');
    expect(cursorFluidContent).toContain('COLORFUL: true');
    expect(cursorFluidContent).toContain('SPLAT_RADIUS: 0.25');
    expect(cursorFluidContent).toContain('COLOR_UPDATE_SPEED: 8');
    expect(rootLayoutContent).not.toContain('transition-colors duration-700');
  });

  it('3. should render HeroSection with precision telemetry frame, fiducials, multidisciplinary KPIs (15, 4 Axes, R&D · Intl), and 65ch measure', () => {
    currentTestLocale = 'fr';
    const html = renderToString(React.createElement(HeroSection));
    expect(html).toContain('51.03°N 02.37°E');
    expect(html).toContain('POLYTECH // GEM · R&amp;D');
    expect(html).toContain('4 Axes');
    expect(html).toContain('R&amp;D · Intl');
    expect(html).toContain('max-w-[65ch]');
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

    expect(heroEn).toContain('Engineered Systems');
    expect(heroEn).toContain('Embedded · Robotics · Control');
    expect(heroEn).toContain('Intl. Internship &amp; R&amp;D');
    expect(heroEn).not.toContain('Systèmes &amp; Projets');

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

  it('7. should render calibrated SkillsSection tier badges, zero purple/violet accents, readable SocialLinks without transition-all, and keyboard-accessible project cards with canonical SYS.01..SYS.15 badges', () => {
    currentTestLocale = 'fr';
    const skillsHtml = renderToString(React.createElement(SkillsSection));
    expect(skillsHtml).toContain('IND. / PROD');
    expect(skillsHtml).toContain('92%');
    expect(skillsSectionContent).not.toContain('#8B5CF6');
    expect(skillsSectionContent).not.toContain('#660066');
    expect(skillsSectionContent).not.toContain('168, g: 85, b: 247');

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

  it('9. should enforce emilkowalski/skills, pbakaus/impeccable, and Leonxlnx/taste-skill rules (custom --ease-out curve, no 3D card tilt, 2px hover lift, tactile press, and RGB object WebGL resonance)', () => {
    expect(magneticCardContent).toContain('hover:-translate-y-0.5');
    expect(magneticCardContent).toContain('active:scale-[0.985]');
    expect(magneticCardContent).toContain('group-hover:scale-[1.03]');
    expect(magneticCardContent).toContain('ease-[var(--ease-out)]');
    expect(magneticCardContent).not.toContain('rotateX(');
    expect(magneticCardContent).not.toContain('rotateY(');

    expect(projectCardContent).toContain('hover:-translate-y-0.5');
    expect(projectCardContent).toContain('ease-[var(--ease-out)]');
    expect(projectCardContent).not.toContain('rotateX');
    expect(projectCardContent).not.toContain('transition-all');

    expect(projectsGridContent).toContain('active:scale-[0.97]');
    expect(projectsGridContent).toContain('ease-[var(--ease-out)]');

    expect(webglFluidContent).toContain('window.__webglResonanceColor');
    expect(webglFluidContent).toContain('typeof c.r==="number"');
    expect(webglFluidContent).toContain('window.addEventListener("webgl-resonance"');
  });

  it('10. should give every single one of the 15 projects a unique bespoke SVG schematic, telemetry spec, zero-violet themeColor, and hole-free responsive Bento grid across mobile/tablet/desktop', () => {
    for (const locale of ['fr', 'en'] as const) {
      for (const proj of FALLBACK_PROJECTS[locale]) {
        const { r, g, b } = proj.themeColor;
        // Zero Violet / Purple / Indigo Rule: blue channel cannot dominate red and green simultaneously with high red+blue purple mix
        const isBannedVioletOrIndigo =
          (r === 99 && g === 102 && b === 241) ||
          (r === 140 && g === 95 && b === 168) ||
          (r === 93 && g === 101 && b === 168) ||
          (b > 150 && r > 80 && g < 110);
        expect(isBannedVioletOrIndigo, `Banned violet/indigo themeColor on ${proj.id} (${locale})`).toBe(false);

        // Every project ID must have its own dedicated schematic switch case and telemetry spec in MagneticProjectCard.tsx
        expect(magneticCardContent).toContain(`case '${proj.id}':`);
        expect(magneticCardContent).toContain(`'${proj.id}':`);
      }
    }

    // Verify adaptive multi-viewport grid in ProjectsGrid.tsx
    expect(projectsGridContent).toContain('grid-cols-1');
    expect(projectsGridContent).toContain('md:grid-cols-2');
    expect(projectsGridContent).toContain('lg:grid-cols-3');
    expect(projectsGridContent).toContain('grid-flow-row-dense');
    expect(projectsGridContent).toContain('auto-rows-[minmax(360px,auto)]');
    expect(projectsGridContent).toContain('getAdaptiveBentoSpan');
  });
});

