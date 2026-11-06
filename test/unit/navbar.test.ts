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

let mockTheme = { theme: 'dark', resolvedTheme: 'dark' };

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

import Navbar from '@/components/layout/Navbar';

describe('Navbar Accessibility & WCAG 2.5.3 (Label in Name)', () => {
  it('should ensure the brand logo link visible text matches its accessible name aria-label identically', () => {
    const html = renderToString(React.createElement(Navbar));
    
    // Check that the logo anchor has aria-label="Enrique.Ndjakou"
    expect(html).toContain('aria-label="Enrique.Ndjakou"');
    
    // Check that visible text contains "Enrique" and ".Ndjakou"
    expect(html).toContain('Enrique');
    expect(html).toContain('.Ndjakou');
    
    // Verify that the old mismatched label "Enrique Ndjakou - Accueil" is NOT present
    expect(html).not.toContain('Enrique Ndjakou - Accueil');
  });

  it('should ensure language toggle accessible name includes visible text (EN/FR)', () => {
    const html = renderToString(React.createElement(Navbar));
    // When locale is fr, visible text is EN, aria-label must include EN
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

  it('should render dynamic mobile status telemetry badge reflecting active section with Apple Liquid Glass styling', () => {
    const html = renderToString(React.createElement(Navbar));
    // Mobile indicator should contain active segment name (Accueil initially)
    expect(html).toContain('Accueil');
    // Mobile indicator should have Apple Liquid Glass backdrop styling
    expect(html).toContain('backdrop-filter:blur(20px) saturate(1.8)');
  });

  it('should adapt to system theme mode resolving to dark properly', () => {
    mockTheme = { theme: 'system', resolvedTheme: 'dark' };
    const html = renderToString(React.createElement(Navbar));
    expect(html).toContain('rgba(255,255,255,0.12)');
    mockTheme = { theme: 'dark', resolvedTheme: 'dark' }; // reset
  });

  it('should render dedicated contact CTA with uplink anchor', () => {
    const html = renderToString(React.createElement(Navbar));
    expect(html).toContain('href="#contact"');
    expect(html).toContain('Me contacter');
  });
});
