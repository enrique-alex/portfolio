import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Mock framer-motion for Cloudflare worker vitest environment (stripping motion-specific props)
const MOTION_ONLY_PROPS = new Set(['initial', 'whileInView', 'viewport', 'transition', 'animate', 'exit']);
function stripMotionProps(props: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(props).filter(([key]) => !MOTION_ONLY_PROPS.has(key)));
}

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      style,
      className,
      ...props
    }: React.ComponentProps<'div'> & Record<string, unknown>) =>
      React.createElement('div', { className, style, ...stripMotionProps(props) }, children),
    line: (props: React.ComponentProps<'line'> & Record<string, unknown>) =>
      React.createElement('line', stripMotionProps(props)),
  },
  useScroll: vi.fn(() => ({
    scrollYProgress: { get: () => 0.5 },
  })),
  useTransform: vi.fn(() => ({ get: () => 0.5 })),
  useReducedMotion: vi.fn(() => false),
}));

// Mock language provider to return default test keys
vi.mock('@/components/theme/LanguageProvider', () => ({
  useLanguage: () => ({
    locale: 'fr',
    setLocale: vi.fn(),
    t: (key: string) => key,
  }),
}));

import AcademicJourney from '@/components/ui/AcademicJourney';

describe('AcademicJourney (Parcours Académique)', () => {
  it('should render section without section-contain class to preserve useScroll target rect measurement', () => {
    const html = renderToString(React.createElement(AcademicJourney));
    expect(html).toContain('id="academic"');
    // section-contain with content-visibility: auto must NOT be present on the section
    expect(html).not.toMatch(/id="academic"[^>]*section-contain/);
    expect(html).not.toMatch(/class="[^"]*section-contain[^"]*"[^>]*id="academic"/);
    expect(html).toContain('System.Process.Monitor');
  });

  it('should render the vertical timeline progress bar with GPU-composited scaleY and origin-top', () => {
    const html = renderToString(React.createElement(AcademicJourney));
    // Verify background track and active brand-blue progress track with rounded caps
    expect(html).toContain('bg-zinc-500/15');
    expect(html).toContain('bg-brand-blue');
    expect(html).toContain('origin-top');
    expect(html).toContain('w-[2px]');
    expect(html).toContain('rounded-full');
    // Verify that broken SVG preserveAspectRatio="none" line is NOT used
    expect(html).not.toContain('preserveAspectRatio="none"');
  });

  it('should render all 3 educational stages with their milestones', () => {
    const html = renderToString(React.createElement(AcademicJourney));
    expect(html).toContain('2025');
    expect(html).toContain('2028');
    expect(html).toContain('2023');
    expect(html).toContain('2021');
    expect(html).toContain('2022');
  });
});
