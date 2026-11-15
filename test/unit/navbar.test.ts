import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { translations } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.ComponentProps<'a'>) =>
    React.createElement('a', { href, ...props }, children),
}));

let mockTheme: { theme: string | undefined; resolvedTheme: string | undefined } = {
  theme: 'dark',
  resolvedTheme: 'dark',
};

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme.theme,
    resolvedTheme: mockTheme.resolvedTheme,
    setTheme: vi.fn(),
  }),
}));

vi.mock('@/components/theme/LanguageProvider', () => ({
  useLanguage: () => ({
    locale: 'fr',
    setLocale: vi.fn(),
    t: (key: string) => translations['fr'][key] || key,
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      style,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      layoutId?: string;
      initial?: unknown;
      animate?: unknown;
      exit?: unknown;
      transition?: unknown;
    }) => {
      const rest = { ...props };
      delete rest.layoutId;
      delete rest.initial;
      delete rest.animate;
      delete rest.exit;
      delete rest.transition;
      return React.createElement('div', { className, style, ...rest }, children);
    },
    a: ({
      children,
      style,
      className,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      layoutId?: string;
      initial?: unknown;
      animate?: unknown;
      exit?: unknown;
      transition?: unknown;
    }) => {
      const rest = { ...props };
      delete rest.layoutId;
      delete rest.initial;
      delete rest.animate;
      delete rest.exit;
      delete rest.transition;
      return React.createElement('a', { className, style, ...rest }, children);
    },
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  useReducedMotion: () => false,
}));

import Navbar, {
  resolveActiveSectionOnScroll,
  isProgrammaticScrollLockActive,
  resolveDesktopNavIndexFromClientX,
  type SectionBounds,
} from '@/components/layout/Navbar';
// @ts-expect-error Vite raw query import
import navbarContent from '@/components/layout/Navbar.tsx?raw';

describe('Navbar Accessibility, Scroll Synchronization & WCAG 2.5.3 (Label in Name)', () => {
  it('should ensure the brand logo link visible text matches its accessible name aria-label identically', () => {
    const html = renderToString(React.createElement(Navbar));

    expect(html).toContain('aria-label="Enrique.Ndjakou"');
    expect(html).toContain('Enrique');
    expect(html).toContain('.Ndjakou');
    expect(html).not.toContain('Enrique Ndjakou - Accueil');
  });

  it('should ensure language toggle accessible name includes visible text (EN/FR)', () => {
    const html = renderToString(React.createElement(Navbar));
    expect(html).toContain('Switch to English (EN)');
    expect(html).toContain('>EN<');
  });

  it('should render all primary navigation segments', () => {
    const html = renderToString(React.createElement(Navbar));
    expect(html).toContain('data-segment="Accueil"');
    expect(html).toContain('data-segment="À Propos"');
    expect(html).toContain('data-segment="Parcours"');
    expect(html).toContain('data-segment="Expérience"');
    expect(html).toContain('data-segment="Projets"');
    expect(html).toContain('data-segment="Compétences"');
  });

  it('should render dynamic mobile status pill reflecting active section with Apple Liquid Glass styling', () => {
    const html = renderToString(React.createElement(Navbar));
    expect(html).toContain('Accueil');
    expect(html).toContain('backdrop-filter:blur(20px) saturate(1.8)');
  });

  it('should adapt to system theme mode resolving to dark properly', () => {
    mockTheme = { theme: 'system', resolvedTheme: 'dark' };
    const html = renderToString(React.createElement(Navbar));
    expect(html).toContain('rgba(255,255,255,0.12)');
    mockTheme = { theme: 'dark', resolvedTheme: 'dark' };
  });

  it('should render dedicated contact CTA', () => {
    const html = renderToString(React.createElement(Navbar));
    expect(html).toContain('href="/#contact"');
    expect(html).toContain('Me contacter');
  });

  it('should produce strictly identical header SSR HTML across undefined, light, and dark themes (zero React Hydration Mismatch)', () => {
    const extractHeader = (html: string) => {
      const match = html.match(/<header[\s\S]*?<\/header>/);
      return match ? match[0] : '';
    };

    mockTheme = { theme: undefined, resolvedTheme: undefined };
    const ssrHeader = extractHeader(renderToString(React.createElement(Navbar)));

    mockTheme = { theme: 'light', resolvedTheme: 'light' };
    const lightHeader = extractHeader(renderToString(React.createElement(Navbar)));

    mockTheme = { theme: 'dark', resolvedTheme: 'dark' };
    const darkHeader = extractHeader(renderToString(React.createElement(Navbar)));

    expect(ssrHeader.length).toBeGreaterThan(100);
    expect(lightHeader).toBe(ssrHeader);
    expect(darkHeader).toBe(ssrHeader);
  });

  it('should enforce Desktop Liquid Glass kinematics, z-50 header priority, zero theme-dependent inline styles, and zero transition-all', () => {
    expect(navbarContent).toContain('z-50');
    expect(navbarContent).toContain('data-testid="desktop-nav-liquid-lens"');
    expect(navbarContent).toContain('data-testid="desktop-nav-active-pill"');
    expect(navbarContent).toContain('ResizeObserver');
    expect(navbarContent).toContain('offsetLeft');
    expect(navbarContent).toContain('offsetWidth');
    expect(navbarContent).toContain('active:scale-[0.97]');
    expect(navbarContent).not.toContain('transition-all');
    expect(navbarContent).not.toMatch(/style=\{[\s\S]*?\bisDark\b/);
  });

  describe('resolveActiveSectionOnScroll (Deterministic Scroll Synchronization)', () => {
    // Simulates a realistic mobile page where Experience and Projects sections are very tall (> 2500px)
    const documentSections = [
      { id: 'home', name: 'Accueil', offsetTop: 0, height: 800 },
      { id: 'profile', name: 'À Propos', offsetTop: 850, height: 900 },
      { id: 'academic', name: 'Parcours', offsetTop: 1800, height: 1200 },
      { id: 'experience', name: 'Expérience', offsetTop: 3050, height: 2600 },
      { id: 'projects', name: 'Projets', offsetTop: 5700, height: 2800 },
      { id: 'skills', name: 'Compétences', offsetTop: 8550, height: 1400 },
      { id: 'contact', name: 'Me contacter', offsetTop: 10000, height: 700 },
    ];
    const totalScrollHeight = 10700;
    const viewportHeight = 800; // probeY = 280px

    const buildViewportBounds = (scrollY: number): SectionBounds[] =>
      documentSections.map((s) => ({
        id: s.id,
        name: s.name,
        top: s.offsetTop - scrollY,
        bottom: s.offsetTop + s.height - scrollY,
      }));

    it('should select first section when near the top of the page (scrollY < 60)', () => {
      const res = resolveActiveSectionOnScroll({
        scrollY: 20,
        innerHeight: viewportHeight,
        scrollHeight: totalScrollHeight,
        sections: buildViewportBounds(20),
      });
      expect(res?.id).toBe('home');
    });

    it('should select last section when reaching the bottom of the page', () => {
      const scrollY = totalScrollHeight - viewportHeight - 10;
      const res = resolveActiveSectionOnScroll({
        scrollY,
        innerHeight: viewportHeight,
        scrollHeight: totalScrollHeight,
        sections: buildViewportBounds(scrollY),
      });
      expect(res?.id).toBe('contact');
    });

    it('should accurately synchronize very tall mobile sections (e.g. 2800px Projects & 2600px Experience) when scrolling down and up', () => {
      // Middle of Experience (scrollY = 4200)
      const inExperience = resolveActiveSectionOnScroll({
        scrollY: 4200,
        innerHeight: viewportHeight,
        scrollHeight: totalScrollHeight,
        sections: buildViewportBounds(4200),
      });
      expect(inExperience?.id).toBe('experience');

      // Deep inside tall Projects section (scrollY = 7000)
      const inProjects = resolveActiveSectionOnScroll({
        scrollY: 7000,
        innerHeight: viewportHeight,
        scrollHeight: totalScrollHeight,
        sections: buildViewportBounds(7000),
      });
      expect(inProjects?.id).toBe('projects');

      // Scrolling back UP into Experience (scrollY = 5300 -> Experience bottom is at 5650 - 5300 = 350 >= probeY 280)
      const backInExperience = resolveActiveSectionOnScroll({
        scrollY: 5300,
        innerHeight: viewportHeight,
        scrollHeight: totalScrollHeight,
        sections: buildViewportBounds(5300),
      });
      expect(backInExperience?.id).toBe('experience');
    });

    it('should handle SectionDivider gaps between two sections without losing active state', () => {
      // Between Academic (ends at 3000) and Experience (starts at 3050):
      // At scrollY = 2740, probeY = 280 corresponds to document Y = 3020 (inside the 50px gap)
      const inGap = resolveActiveSectionOnScroll({
        scrollY: 2740,
        innerHeight: viewportHeight,
        scrollHeight: totalScrollHeight,
        sections: buildViewportBounds(2740),
      });
      expect(inGap?.id).toBe('academic');
    });

    it('should return null when sections array is empty', () => {
      expect(
        resolveActiveSectionOnScroll({
          scrollY: 100,
          innerHeight: 800,
          scrollHeight: 2000,
          sections: [],
        })
      ).toBeNull();
    });
  });

  describe('isProgrammaticScrollLockActive (Target-Aware Smooth Scroll Lock)', () => {
    it('should keep lock active while crossing intermediate sections before reaching target', () => {
      // User tapped 'skills', currently mid-scroll (targetTop = 4550, probeY = 280)
      const isLockedMidScroll = isProgrammaticScrollLockActive({
        lock: { targetId: 'skills', targetName: 'Compétences', expiresAt: 2000 },
        now: 950,
        targetBounds: { id: 'skills', name: 'Compétences', top: 4550, bottom: 5950 },
        probeY: 280,
      });
      expect(isLockedMidScroll).toBe(true);
    });

    it('should release lock as soon as destination section aligns with the reading zone', () => {
      // Destination 'skills' has arrived at reading zone (top = 24px <= probeY + 24, bottom = 1424px >= probeY - 24)
      const isLockedAtTarget = isProgrammaticScrollLockActive({
        lock: { targetId: 'skills', targetName: 'Compétences', expiresAt: 2000 },
        now: 620,
        targetBounds: { id: 'skills', name: 'Compétences', top: 24, bottom: 1424 },
        probeY: 280,
      });
      expect(isLockedAtTarget).toBe(false);
    });

    it('should release lock when lock is null or safety timeout expires', () => {
      expect(
        isProgrammaticScrollLockActive({
          lock: null,
          now: 300,
          targetBounds: null,
          probeY: 280,
        })
      ).toBe(false);

      expect(
        isProgrammaticScrollLockActive({
          lock: { targetId: 'skills', targetName: 'Compétences', expiresAt: 1200 },
          now: 1250,
          targetBounds: { id: 'skills', name: 'Compétences', top: 1200, bottom: 2600 },
          probeY: 280,
        })
      ).toBe(false);
    });
  });

  describe('Desktop Liquid Glass Pointer Tracking, Zero Hover Shift & md Breakpoint Fit', () => {
    const sampleRects = [
      { left: 300, right: 374 },
      { left: 378, right: 460 },
      { left: 464, right: 544 },
      { left: 548, right: 642 },
    ];

    it('should resolve direct hits and inter-link gaps smoothly without dead zones', () => {
      expect(resolveDesktopNavIndexFromClientX(330, sampleRects)).toBe(0);
      expect(resolveDesktopNavIndexFromClientX(420, sampleRects)).toBe(1);
      // 4px gap between index 0 (right=374) and index 1 (left=378): 375 is closer to center 337 vs 419
      expect(resolveDesktopNavIndexFromClientX(375, sampleRects)).toBe(0);
      // Edge clamping inside nav padding
      expect(resolveDesktopNavIndexFromClientX(296, sampleRects)).toBe(0);
      expect(resolveDesktopNavIndexFromClientX(648, sampleRects)).toBe(3);
      expect(resolveDesktopNavIndexFromClientX(100, [])).toBe(-1);
      expect(resolveDesktopNavIndexFromClientX(Number.NaN, sampleRects)).toBe(-1);
    });

    it('should keep link label widths invariant on hover (absolute indicator only, never inline reflow) and track across nav via pointerMove + fonts.ready + md compact sizing', () => {
      expect(navbarContent).toContain('onPointerMove={handleNavPointerMove}');
      expect(navbarContent).toContain('useLayoutEffect');
      expect(navbarContent).toContain('document.fonts?.ready');
      expect(navbarContent).toContain('pillGeometry.snap');
      // Active link underline indicator must be position:absolute so hovering siblings causes 0px width shift
      expect(navbarContent).toContain('pointer-events-none absolute bottom-[3px] left-1/2');
      // Compact md sizing prevents right-edge clipping at 768px tablet breakpoint
      expect(navbarContent).toContain('px-1.5 lg:px-2.5 xl:px-3.5');
      expect(navbarContent).toContain('text-[11.5px] lg:text-[13px] xl:text-sm');
    });
  });
});

