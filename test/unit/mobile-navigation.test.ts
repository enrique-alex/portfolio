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

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
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

      // Verify primary shortcuts exist and have touch targets >= 48px
      expect(html).toContain('href="#home"');
      expect(html).toContain('href="#projects"');
      expect(html).toContain('href="#experience"');
      expect(html).toContain('min-h-[48px]');

      // Verify active item aria-current="page"
      expect(html).toContain('aria-current="page"');

      // Verify HUD trigger button attributes
      expect(html).toContain('aria-haspopup="dialog"');
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain('aria-controls="mobile-hud-drawer"');
      expect(html).toContain('aria-label="Ouvrir la console HUD"');
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
