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

import MobileNavDock from '@/components/layout/MobileNavDock';
import MobileHudDrawer from '@/components/layout/MobileHudDrawer';
import { useLockBodyScroll } from '@/lib/hooks/useLockBodyScroll';

describe('Mobile Navigation Architecture & Accessibility (WCAG 2.1 AA/AAA & Mobile Ergonomics)', () => {
  describe('MobileNavDock', () => {
    it('should render floating mobile dock with accessible navigation landmark and targets', () => {
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

      // Verify navigation landmark
      expect(html).toContain('role="navigation"');
      expect(html).toContain('aria-label="Dock de navigation principal"');

      // Verify all 6 portfolio sections exist and have touch targets >= 48px
      expect(html).toContain('href="#home"');
      expect(html).toContain('href="#profile"');
      expect(html).toContain('href="#academic"');
      expect(html).toContain('href="#experience"');
      expect(html).toContain('href="#projects"');
      expect(html).toContain('href="#skills"');
      expect(html).toContain('min-h-[48px]');

      // Verify active item aria-current="page"
      expect(html).toContain('aria-current="page"');

      // Verify HUD trigger button attributes
      expect(html).toContain('aria-haspopup="dialog"');
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain('aria-controls="mobile-hud-drawer"');
      expect(html).toContain('aria-label="Ouvrir la console HUD"');
    });

    it('should dynamically update active indicator when active category changes', () => {
      // Test when active category changes to "Compétences"
      const htmlSkills = renderToString(
        React.createElement(MobileNavDock, {
          activeSegment: 'Compétences',
          onSelectSegment: vi.fn(),
          isHudOpen: false,
          onToggleHud: vi.fn(),
          hudTriggerRef: { current: null },
        })
      );

      // Verify skills item is active and has aria-current="page"
      expect(htmlSkills).toContain('aria-label="06 Compétences"');
      expect(htmlSkills).toContain('aria-current="page"');

      // Test when active category changes to "À Propos"
      const htmlAbout = renderToString(
        React.createElement(MobileNavDock, {
          activeSegment: 'À Propos',
          onSelectSegment: vi.fn(),
          isHudOpen: false,
          onToggleHud: vi.fn(),
          hudTriggerRef: { current: null },
        })
      );

      expect(htmlAbout).toContain('aria-label="02 À Propos"');
      expect(htmlAbout).toContain('aria-current="page"');
    });

    it('should apply Apple Liquid Glass styling with backdrop filter and specular borders', () => {
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

      // Verify Apple Liquid Glass blur and translucency
      expect(html).toContain('backdrop-filter:blur(20px) saturate(1.8)');
      expect(html).toContain('border:1px solid rgba(0, 210, 255,');
      expect(html).toContain('rgba(10, 10, 14, 0.75)');
    });

    it('should correctly adapt Apple Liquid Glass styling when theme is system with light or dark preference', () => {
      // Test when theme setting is "system" but resolvedTheme is "dark"
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
      expect(htmlSystemDark).toContain('rgba(10, 10, 14, 0.75)');

      // Test when theme setting is "light"
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
      expect(htmlLight).toContain('rgba(255, 255, 255, 0.75)');
      mockThemeState = { theme: 'dark', resolvedTheme: 'dark' }; // reset
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

      expect(htmlProjects).toContain('aria-label="05 Projects"');
      expect(htmlProjects).toContain('aria-current="page"');
      currentLocale = 'fr'; // reset
    });

    it('should reflect HUD open state in aria-expanded and aria-label', () => {
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
      expect(html).toContain('aria-label="Fermer la console HUD"');
    });
  });

  describe('MobileHudDrawer', () => {
    it('should render accessible dialog and telemetry controls when open in French', () => {
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

      // Verify dialog semantics
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('id="mobile-hud-drawer"');
      expect(html).toContain('aria-label="Console Système // Pupitre HUD"');

      // Verify close button with minimum 48x48px touch target
      expect(html).toContain('aria-label="Fermer la console HUD"');
      expect(html).toContain('min-h-[48px]');
      expect(html).toContain('min-w-[48px]');

      // Verify secondary links
      expect(html).toContain('href="/#profile"');
      expect(html).toContain('href="/#academic"');
      expect(html).toContain('href="/#skills"');
      expect(html).toContain('Ingénierie &amp; Vision');

      // Verify system toggles (Theme, Language, Admin)
      expect(html).toContain('href="/admin/login"');
      expect(html).toContain('aria-label="Accès administrateur"');
      expect(html).toContain('Switch to English (EN)');
      expect(html).toContain('JOUR');

      // Verify direct contact CTA
      expect(html).toContain('href="#contact"');
    });

    it('should adapt telemetry labels in English when locale is en', () => {
      currentLocale = 'en';
      const html = renderToString(
        React.createElement(MobileHudDrawer, {
          isOpen: true,
          onClose: vi.fn(),
          activeSegment: 'Home',
          onSelectSegment: vi.fn(),
        })
      );

      expect(html).toContain('aria-label="System Console // HUD Operator"');
      expect(html).toContain('aria-label="Close HUD console"');
      expect(html).toContain('System Console &amp; Navigation');
      expect(html).toContain('Engineering &amp; Vision');
      expect(html).toContain('DAY');
      currentLocale = 'fr'; // reset
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

  describe('useLockBodyScroll Hook', () => {
    it('should export useLockBodyScroll function', () => {
      expect(typeof useLockBodyScroll).toBe('function');
    });
  });
});
