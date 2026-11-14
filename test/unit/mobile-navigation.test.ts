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

let mockThemeState = { theme: 'dark', resolvedTheme: 'dark' };

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockThemeState.theme,
    resolvedTheme: mockThemeState.resolvedTheme,
    setTheme: vi.fn(),
  }),
}));

let currentLocale = 'fr';

vi.mock('@/components/theme/LanguageProvider', () => ({
  useLanguage: () => ({
    locale: currentLocale,
    setLocale: vi.fn(),
    t: (key: string) => {
      const loc = currentLocale as 'fr' | 'en';
      return translations[loc]?.[key] || key;
    },
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      style,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { layoutId?: string }) => {
      const rest = { ...props };
      delete rest.layoutId;
      return React.createElement('div', { className, style, ...rest }, children);
    },
    a: ({
      children,
      style,
      className,
      ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { layoutId?: string }) => {
      const rest = { ...props };
      delete rest.layoutId;
      return React.createElement('a', { className, style, ...rest }, children);
    },
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  useReducedMotion: () => false,
}));

import MobileNavDock, {
  resolveDockItemFromClientX,
  resolveDockScrubStateFromClientX,
  computeLiquidLensGeometry,
  computeMobileDockBottomOffset,
} from '@/components/layout/MobileNavDock';
import MobileHudDrawer from '@/components/layout/MobileHudDrawer';
import Footer from '@/components/layout/Footer';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';
// @ts-expect-error Vite raw query import
import mobileNavDockContent from '@/components/layout/MobileNavDock.tsx?raw';

describe('Mobile Navigation Architecture & iOS Dynamic Bar Ergonomics', () => {
  describe('MobileNavDock', () => {
    it('should render floating mobile dock without unprofessional 01-06 numbers or AI HUD clichés', () => {
      const mockToggleHud = vi.fn();
      const mockSelectSegment = vi.fn();
      const triggerRef = { current: null };

      const html = renderToString(
        React.createElement(MobileNavDock, {
          activeSegment: 'Accueil',
          onSelectSegment: mockSelectSegment,
          isHudOpen: false,
          onToggleHud: mockToggleHud,
          hudTriggerRef: triggerRef,
        })
      );

      // Verify floating dock wrapper has md:hidden and bottom safe area inset positioning
      expect(html).toContain('aria-label="Navigation flottante mobile"');
      expect(html).toContain('bottom-[calc(1rem+env(safe-area-inset-bottom,0px))]');

      // Verify navigation landmark and iOS anti-callout protection
      expect(html).toContain('role="navigation"');
      expect(html).toContain('aria-label="Dock de navigation principal"');
      expect(html).toContain('-webkit-touch-callout:none');

      // Verify all 6 portfolio sections exist and have touch targets >= 48px
      expect(html).toContain('href="#home"');
      expect(html).toContain('href="#profile"');
      expect(html).toContain('href="#academic"');
      expect(html).toContain('href="#experience"');
      expect(html).toContain('href="#projects"');
      expect(html).toContain('href="#skills"');
      expect(html).toContain('min-h-[48px]');

      // Verify NO numerical codes 01..06 or HUD text appear in the dock
      expect(html).not.toContain('>01<');
      expect(html).not.toContain('>02<');
      expect(html).not.toContain('>03<');
      expect(html).not.toContain('>04<');
      expect(html).not.toContain('>05<');
      expect(html).not.toContain('>06<');
      expect(html).not.toContain('>HUD<');

      // Verify active item aria-current="page" and clean label
      expect(html).toContain('aria-current="page"');
      expect(html).toContain('aria-label="Accueil"');

      // Verify settings trigger button attributes
      expect(html).toContain('aria-haspopup="dialog"');
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain('aria-controls="mobile-hud-drawer"');
    });

    it('should dynamically update active indicator and clean label when active category changes', () => {
      const htmlSkills = renderToString(
        React.createElement(MobileNavDock, {
          activeSegment: 'Compétences',
          onSelectSegment: vi.fn(),
          isHudOpen: false,
          onToggleHud: vi.fn(),
          hudTriggerRef: { current: null },
        })
      );

      expect(htmlSkills).toContain('aria-label="Compétences"');
      expect(htmlSkills).toContain('aria-current="page"');

      const htmlAbout = renderToString(
        React.createElement(MobileNavDock, {
          activeSegment: 'À Propos',
          onSelectSegment: vi.fn(),
          isHudOpen: false,
          onToggleHud: vi.fn(),
          hudTriggerRef: { current: null },
        })
      );

      expect(htmlAbout).toContain('aria-label="À Propos"');
      expect(htmlAbout).toContain('aria-current="page"');
    });

    it('should apply Apple iOS 26/27 Liquid Glass styling in Dark Mode with obsidian glass, specular highlight, and subtle cyan DA refraction', () => {
      mockThemeState = { theme: 'dark', resolvedTheme: 'dark' };
      const html = renderToString(
        React.createElement(MobileNavDock, {
          activeSegment: 'Accueil',
          onSelectSegment: vi.fn(),
          isHudOpen: false,
          onToggleHud: vi.fn(),
          hudTriggerRef: { current: null },
        })
      );

      expect(html).toContain('md:hidden');
      expect(html).toContain('backdrop-blur-2xl');
      expect(html).toContain('backdrop-saturate-180');
      expect(html).toContain('backdrop-filter:blur(20px) saturate(1.8)');
      expect(html).toContain('dark:bg-[#0a0a0a]/75');
      expect(html).toContain('dark:border-white/15');
      expect(html).toContain('background-color:rgba(10, 10, 10, 0.75)');
      expect(html).toContain('border:1px solid rgba(255, 255, 255, 0.15)');
      expect(html).toContain('inset 0 1px 0 rgba(255, 255, 255, 0.18)');
      expect(html).toContain('rgba(0, 210, 255,');
      expect(html).toContain('data-testid="mobile-dock-active-pill"');
    });

    it('should ensure crisp Light Mode optical separation and adapt when theme is system with light or dark preference', () => {
      mockThemeState = { theme: 'system', resolvedTheme: 'dark' };
      const htmlSystemDark = renderToString(
        React.createElement(MobileNavDock, {
          activeSegment: 'Accueil',
          onSelectSegment: vi.fn(),
          isHudOpen: false,
          onToggleHud: vi.fn(),
          hudTriggerRef: { current: null },
        })
      );
      expect(htmlSystemDark).toContain('rgba(10, 10, 10, 0.75)');
      expect(htmlSystemDark).toContain('border:1px solid rgba(255, 255, 255, 0.15)');

      mockThemeState = { theme: 'light', resolvedTheme: 'light' };
      const htmlLight = renderToString(
        React.createElement(MobileNavDock, {
          activeSegment: 'Accueil',
          onSelectSegment: vi.fn(),
          isHudOpen: false,
          onToggleHud: vi.fn(),
          hudTriggerRef: { current: null },
        })
      );
      expect(htmlLight).toContain('bg-white/75');
      expect(htmlLight).toContain('border-black/10');
      expect(htmlLight).toContain('shadow-[0_10px_30px_rgba(0,0,0,0.12)]');
      expect(htmlLight).toContain('background-color:rgba(255, 255, 255, 0.75)');
      expect(htmlLight).toContain('border:1px solid rgba(0, 0, 0, 0.1)');
      expect(htmlLight).toContain('0 10px 30px rgba(0, 0, 0, 0.12)');
      expect(htmlLight).toContain('inset 0 1px 0 rgba(255, 255, 255, 0.9)');
      expect(htmlLight).toContain('text-zinc-900');
      expect(htmlLight).toContain('text-zinc-600');
      expect(htmlLight).toContain('rgba(66, 133, 244,');
      mockThemeState = { theme: 'dark', resolvedTheme: 'dark' };
    });

    it('should enforce design-engineering invariants (zero transition-all, zero violet, tactile haptic vibrate(6), and reduced-motion support)', () => {
      expect(mobileNavDockContent).not.toContain('transition-all');
      expect(mobileNavDockContent).not.toContain('#8B5CF6');
      expect(mobileNavDockContent).not.toContain('#7C3AED');
      expect(mobileNavDockContent).not.toContain('indigo-');
      expect(mobileNavDockContent).toContain('navigator.vibrate?.(6)');
      expect(mobileNavDockContent).toContain('useReducedMotion');
      expect(mobileNavDockContent).toContain('select-none');
      expect(mobileNavDockContent).toContain('WebkitTouchCallout');
    });

    it('should elevate dock position when scrolling up so mobile browser bottom bar never clips it', () => {
      const htmlIdle = renderToString(
        React.createElement(MobileNavDock, {
          activeSegment: 'Accueil',
          onSelectSegment: vi.fn(),
          isHudOpen: false,
          onToggleHud: vi.fn(),
          hudTriggerRef: { current: null },
          scrollDirection: 'idle',
        })
      );
      expect(htmlIdle).toContain('translate3d(0, 0px, 0)');

      const htmlScrollingUp = renderToString(
        React.createElement(MobileNavDock, {
          activeSegment: 'Accueil',
          onSelectSegment: vi.fn(),
          isHudOpen: false,
          onToggleHud: vi.fn(),
          hudTriggerRef: { current: null },
          scrollDirection: 'up',
        })
      );
      expect(htmlScrollingUp).toContain('translate3d(0, -14px, 0)');
    });

    it('should dynamically update active indicator when active category changes in English', () => {
      currentLocale = 'en';
      const htmlProjects = renderToString(
        React.createElement(MobileNavDock, {
          activeSegment: 'Projects',
          onSelectSegment: vi.fn(),
          isHudOpen: false,
          onToggleHud: vi.fn(),
          hudTriggerRef: { current: null },
        })
      );

      expect(htmlProjects).toContain('aria-label="Projects"');
      expect(htmlProjects).toContain('aria-current="page"');
      currentLocale = 'fr';
    });

    it('should reflect drawer open state in aria-expanded and aria-label', () => {
      const html = renderToString(
        React.createElement(MobileNavDock, {
          activeSegment: 'Accueil',
          onSelectSegment: vi.fn(),
          isHudOpen: true,
          onToggleHud: vi.fn(),
          hudTriggerRef: { current: null },
        })
      );

      expect(html).toContain('aria-expanded="true"');
      expect(html).toContain('aria-label="Fermer le menu de navigation et réglages"');
    });
  });

  describe('resolveDockItemFromClientX & resolveDockScrubStateFromClientX (iPhone Continuous Hold-and-Scrub)', () => {
    const sampleRects = [
      { item: { id: 'home', name: 'Accueil' }, left: 20, right: 64 }, // center 42
      { item: { id: 'profile', name: 'À Propos' }, left: 68, right: 112 }, // center 90
      { item: { id: 'academic', name: 'Parcours' }, left: 116, right: 160 }, // center 138
      { item: { id: 'experience', name: 'Expérience' }, left: 164, right: 208 }, // center 186
    ];

    it('should resolve exact tab under finger during horizontal scrub', () => {
      const hit = resolveDockItemFromClientX(130, sampleRects);
      expect(hit?.item.id).toBe('academic');
      expect(hit?.index).toBe(2);
    });

    it('should clamp to first or last tab when finger slides beyond dock boundaries', () => {
      const leftClamp = resolveDockItemFromClientX(5, sampleRects);
      expect(leftClamp?.item.id).toBe('home');
      expect(leftClamp?.index).toBe(0);

      const rightClamp = resolveDockItemFromClientX(320, sampleRects);
      expect(rightClamp?.item.id).toBe('experience');
      expect(rightClamp?.index).toBe(3);
    });

    it('should resolve nearest tab when finger is in the 4px gap between two tabs', () => {
      const gapHit = resolveDockItemFromClientX(66.5, sampleRects);
      expect(gapHit?.item.id).toBe('profile');
    });

    it('should safely return null on empty rects or non-finite coordinates', () => {
      expect(resolveDockItemFromClientX(100, [])).toBeNull();
      expect(resolveDockItemFromClientX(NaN, sampleRects)).toBeNull();
      expect(resolveDockScrubStateFromClientX(100, [])).toBeNull();
      expect(resolveDockScrubStateFromClientX(Infinity, sampleRects)).toBeNull();
    });

    it('should compute continuous clampedX and raised-cosine proximity weights across icons', () => {
      // Finger directly on center of tab 1 (x = 90)
      const stateAtTab1 = resolveDockScrubStateFromClientX(90, sampleRects);
      expect(stateAtTab1).not.toBeNull();
      expect(stateAtTab1?.item.id).toBe('profile');
      expect(stateAtTab1?.clampedX).toBe(90);
      expect(stateAtTab1?.proximities[1]).toBe(1);
      // Immediate neighbors (distance 48px < influenceRadius 72.6px) have smooth non-zero cosine proximity
      expect(stateAtTab1?.proximities[0]).toBeGreaterThan(0.15);
      expect(stateAtTab1?.proximities[0]).toBeLessThan(0.4);
      expect(stateAtTab1?.proximities[2]).toBeGreaterThan(0.15);
      // Distant tab (distance 96px >= 72.6px) has 0 proximity
      expect(stateAtTab1?.proximities[3]).toBe(0);
    });

    it('should clamp continuous clampedX between first and last tab centers when finger drags outside dock', () => {
      const farLeft = resolveDockScrubStateFromClientX(-25, sampleRects);
      expect(farLeft?.clampedX).toBe(42);
      expect(farLeft?.proximities[0]).toBe(1);

      const farRight = resolveDockScrubStateFromClientX(450, sampleRects);
      expect(farRight?.clampedX).toBe(186);
      expect(farRight?.proximities[3]).toBe(1);
    });
  });

  describe('computeLiquidLensGeometry (Continuous iOS 26/27 Liquid Lens Pill)', () => {
    const variableRects = [
      { item: { id: 'home', name: 'Accueil' }, left: 16, right: 108 }, // width 92, center 62
      { item: { id: 'profile', name: 'À Propos' }, left: 112, right: 156 }, // width 44, center 134
      { item: { id: 'academic', name: 'Parcours' }, left: 160, right: 204 }, // width 44, center 182
      { item: { id: 'skills', name: 'Compétences' }, left: 208, right: 252 }, // width 44, center 230
    ];

    it('should smoothly interpolate centerX and morph pill width continuously across tabs without boundary jumps', () => {
      const navLeft = 10;
      const samples = [62, 80, 98, 116, 134, 158, 182, 230].map((x) =>
        computeLiquidLensGeometry({
          clientX: x,
          navLeft,
          navClientLeft: 1,
          rects: variableRects,
          isScrubbing: true,
        })
      );

      // Should lock dead-center on tab 0 and tab 1 centers and morph width 92 -> 46 (minLensWidth)
      expect(samples[0]?.centerX).toBe(62);
      expect(samples[0]?.width).toBe(92);
      expect(samples[4]?.centerX).toBe(134);
      expect(samples[4]?.width).toBe(46);

      // CenterX must increase strictly monotonically across the entire scrub path
      for (let i = 1; i < samples.length; i++) {
        expect(samples[i]!.centerX).toBeGreaterThan(samples[i - 1]!.centerX);
      }
    });

    it('should apply immediate optical lift on press and velocity-based liquid stretch during fast scrubbing', () => {
      const pressed = computeLiquidLensGeometry({
        clientX: 134,
        navLeft: 10,
        rects: variableRects,
        isPressed: true,
        isScrubbing: false,
      });
      expect(pressed?.scaleX).toBe(1.07);
      expect(pressed?.scaleY).toBe(1.07);

      const slowScrub = computeLiquidLensGeometry({
        clientX: 158,
        navLeft: 10,
        rects: variableRects,
        isPressed: true,
        isScrubbing: true,
        velocityPxPerMs: 0,
      });
      expect(slowScrub?.scaleX).toBe(1.08);
      expect(slowScrub?.scaleY).toBe(1.08);

      const fastScrub = computeLiquidLensGeometry({
        clientX: 158,
        navLeft: 10,
        rects: variableRects,
        isPressed: true,
        isScrubbing: true,
        velocityPxPerMs: 1.5,
      });
      expect(fastScrub!.scaleX).toBeGreaterThan(1.12);
      expect(fastScrub!.scaleY).toBeLessThan(1.08);
    });

    it('should disable scale deformation when prefers-reduced-motion is enabled and account for navScrollLeft', () => {
      const reduced = computeLiquidLensGeometry({
        clientX: 182,
        navLeft: 10,
        navClientLeft: 1,
        navScrollLeft: 24,
        rects: variableRects,
        isPressed: true,
        isScrubbing: true,
        velocityPxPerMs: 2.0,
        reducedMotion: true,
      });
      expect(reduced?.scaleX).toBe(1);
      expect(reduced?.scaleY).toBe(1);
      // Center 182 - width/2 (23) - navLeft (10) - clientLeft (1) + scrollLeft (24) = 172
      expect(reduced?.localX).toBe(172);
    });

    it('should clamp within dock edges and safely return null on empty rects or invalid coordinates', () => {
      const leftEdge = computeLiquidLensGeometry({
        clientX: -40,
        navLeft: 10,
        navClientLeft: 1,
        rects: variableRects,
        isScrubbing: true,
      });
      // First local left: 16 - 10 - 1 = 5
      expect(leftEdge?.localX).toBe(5);

      const rightEdge = computeLiquidLensGeometry({
        clientX: 600,
        navLeft: 10,
        navClientLeft: 1,
        rects: variableRects,
        isScrubbing: true,
      });
      // Last local right (252 - 10 - 1 = 241) - width (46) = 195
      expect(rightEdge?.localX).toBe(195);

      expect(
        computeLiquidLensGeometry({
          clientX: 100,
          navLeft: 10,
          rects: [],
        })
      ).toBeNull();
      expect(
        computeLiquidLensGeometry({
          clientX: Number.NaN,
          navLeft: 10,
          rects: variableRects,
        })
      ).toBeNull();
      expect(
        computeLiquidLensGeometry({
          clientX: 100,
          navLeft: Number.POSITIVE_INFINITY,
          rects: variableRects,
        })
      ).toBeNull();
      expect(
        computeLiquidLensGeometry({
          clientX: 100,
          navLeft: 10,
          rects: [
            { item: { id: 'bad', name: 'Bad' }, left: Number.NaN, right: 60 },
            ...variableRects.slice(1),
          ],
        })
      ).toBeNull();
    });

    it('should cap horizontal velocity stretch to avoid edge overhang while remaining responsive', () => {
      const extremeScrub = computeLiquidLensGeometry({
        clientX: 150,
        navLeft: 10,
        rects: variableRects,
        velocityPxPerMs: 50,
        isPressed: true,
        isScrubbing: true,
        reducedMotion: false,
      });
      expect(extremeScrub).not.toBeNull();
      expect(extremeScrub!.scaleX).toBeGreaterThan(1.12);
      expect(extremeScrub!.scaleX).toBeLessThanOrEqual(1.15);
    });
  });

  describe('computeMobileDockBottomOffset (Mobile Browser Bottom Bar Compensation)', () => {
    it('should return 0 when idle and no browser toolbar occludes the viewport', () => {
      expect(
        computeMobileDockBottomOffset({
          innerHeight: 844,
          visualViewportHeight: 844,
          visualViewportOffsetTop: 0,
          maxObservedViewportHeight: 844,
          scrollDirection: 'idle',
        })
      ).toBe(0);
    });

    it('should add +14px safety elevation when scrolling up even before visualViewport resizes', () => {
      expect(
        computeMobileDockBottomOffset({
          innerHeight: 844,
          visualViewportHeight: 844,
          maxObservedViewportHeight: 844,
          scrollDirection: 'up',
        })
      ).toBe(14);
    });

    it('should compensate both chromeExpansionGap (Safari iOS bottom toolbar) and upward scroll', () => {
      // Max observed height was 844px (collapsed toolbar), now 784px (60px toolbar expanded) while scrolling up
      const offset = computeMobileDockBottomOffset({
        innerHeight: 784,
        visualViewportHeight: 784,
        maxObservedViewportHeight: 844,
        scrollDirection: 'up',
      });
      // round(60 * 0.45) = 27 + 14 = 41px
      expect(offset).toBe(41);
    });

    it('should cap maximum bottom offset at 48px and return 0 when virtual keyboard/input is focused', () => {
      expect(
        computeMobileDockBottomOffset({
          innerHeight: 844,
          visualViewportHeight: 740,
          maxObservedViewportHeight: 844,
          scrollDirection: 'up',
        })
      ).toBe(48);

      expect(
        computeMobileDockBottomOffset({
          innerHeight: 844,
          visualViewportHeight: 500,
          maxObservedViewportHeight: 844,
          scrollDirection: 'up',
          isInputFocused: true,
        })
      ).toBe(0);
    });
  });

  describe('MobileHudDrawer', () => {
    it('should render sober accessible dialog and preferences controls when open in French', () => {
      currentLocale = 'fr';
      const mockClose = vi.fn();
      const mockSelect = vi.fn();

      const html = renderToString(
        React.createElement(MobileHudDrawer, {
          isOpen: true,
          onClose: mockClose,
          activeSegment: 'Accueil',
          onSelectSegment: mockSelect,
        })
      );

      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('id="mobile-hud-drawer"');
      expect(html).toContain('aria-label="Navigation et réglages"');

      expect(html).toContain('aria-label="Fermer le menu"');
      expect(html).toContain('min-h-[48px]');
      expect(html).toContain('min-w-[48px]');

      expect(html).toContain('href="/#profile"');
      expect(html).toContain('href="/#academic"');
      expect(html).toContain('href="/#skills"');
      expect(html).toContain('Ingénierie &amp; Vision');

      // Verify no AI sci-fi clichés remain
      expect(html).not.toContain('SYS.OPERATOR');
      expect(html).not.toContain('Signal Uplink');
      expect(html).not.toContain('[04/PRF]');

      expect(html).toContain('href="/admin/login"');
      expect(html).toContain('aria-label="Administration"');
      expect(html).toContain('Switch to English (EN)');
      expect(html).toContain('Jour');
      expect(html).toContain('href="#contact"');
    });

    it('should adapt labels in English when locale is en', () => {
      currentLocale = 'en';
      const html = renderToString(
        React.createElement(MobileHudDrawer, {
          isOpen: true,
          onClose: vi.fn(),
          activeSegment: 'Home',
          onSelectSegment: vi.fn(),
        })
      );

      expect(html).toContain('aria-label="Navigation and settings"');
      expect(html).toContain('aria-label="Close menu"');
      expect(html).toContain('Navigation &amp; Preferences');
      expect(html).toContain('Engineering &amp; Vision');
      expect(html).toContain('Light');
      currentLocale = 'fr';
    });

    it('should not render dialog contents when closed', () => {
      const html = renderToString(
        React.createElement(MobileHudDrawer, {
          isOpen: false,
          onClose: vi.fn(),
          activeSegment: 'Accueil',
          onSelectSegment: vi.fn(),
        })
      );

      expect(html).not.toContain('role="dialog"');
      expect(html).not.toContain('id="mobile-hud-drawer"');
    });
  });

  describe('Footer Mobile Clearance', () => {
    it('should reserve bottom clearance on mobile so the floating dock never covers footer links', () => {
      const html = renderToString(React.createElement(Footer));
      expect(html).toContain('pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]');
      expect(html).toContain('md:py-8');
    });
  });

  describe('useLockBodyScroll Hook', () => {
    it('should export useLockBodyScroll function', () => {
      expect(typeof useLockBodyScroll).toBe('function');
    });
  });
});
