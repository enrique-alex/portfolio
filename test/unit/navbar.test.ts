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

vi.mock('@/components/theme/LanguageProvider', () => ({
  useLanguage: () => ({
    locale: 'fr',
    setLocale: vi.fn(),
    t: (key: string) => translations['fr'][key] || key,
  }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, className, initial, animate, exit, transition, ...props }: any) =>
      React.createElement('div', { className, style, ...props }, children),
    a: ({ children, style, className, initial, animate, exit, transition, ...props }: any) =>
      React.createElement('a', { className, style, ...props }, children),
  },
  AnimatePresence: ({ children }: any) => children,
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
});
