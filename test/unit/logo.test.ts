import { describe, it, expect } from 'vitest';
import { Logo } from '@/components/ui/Logo';
import manifest from '@/app/manifest';

describe('Official Personal Brand Logo (Monogram EN)', () => {
  it('should render standard SVG attributes following Lucide and Design Engineer standards', () => {
    const element = Logo({});
    expect(element.type).toBe('svg');
    expect(element.props.viewBox).toBe('0 0 24 24');
    expect(element.props.fill).toBe('none');
    expect(element.props.stroke).toBe('currentColor');
    expect(element.props.strokeWidth).toBe(2);
    expect(element.props.strokeLinecap).toBe('round');
    expect(element.props.strokeLinejoin).toBe('round');
    expect(element.props['aria-hidden']).toBe(true);
    expect(element.props.className).toBe('h-8 w-8');
  });

  it('should include the 3 precise geometric PCB routing paths for the EN monogram', () => {
    const element = Logo({});
    const children = element.props.children;
    const paths = Array.isArray(children)
      ? children.filter((child) => child && child.type === 'path')
      : [];

    expect(paths).toHaveLength(3);
    // Outer 'E' frame: top bar, spine, bottom bar
    expect(paths[0]?.props.d).toBe('M12 20H4V4h8');
    // Middle 'E' bus trace docking into central diagonal node (12, 12)
    expect(paths[1]?.props.d).toBe('M4 12h8');
    // 'N' 45° diagonal trace and right vertical stem
    expect(paths[2]?.props.d).toBe('M4 4l16 16V4');
  });

  it('should accept custom className, size, strokeWidth, and accessible title', () => {
    const element = Logo({
      className: 'h-10 w-10 text-brand-blue',
      size: 40,
      strokeWidth: 2.5,
      title: 'Enrique Ndjakou Monogram',
      'aria-hidden': false,
    });

    expect(element.props.className).toBe('h-10 w-10 text-brand-blue');
    expect(element.props.width).toBe(40);
    expect(element.props.height).toBe(40);
    expect(element.props.strokeWidth).toBe(2.5);
    expect(element.props['aria-hidden']).toBe(false);

    const titleElement = element.props.children[0];
    expect(titleElement?.type).toBe('title');
    expect(titleElement?.props.children).toBe('Enrique Ndjakou Monogram');
    expect(titleElement?.props.id).toBe('en-monogram-title');
    expect(element.props['aria-labelledby']).toBe('en-monogram-title');
    expect(element.props.role).toBe('img');
  });

  it('should handle semantic accessibility automatically when title is provided without explicit aria-hidden', () => {
    const element = Logo({
      title: 'Enrique Ndjakou - Ingénieur',
    });

    expect(element.props['aria-hidden']).toBeUndefined();
    expect(element.props.role).toBe('img');
    expect(element.props['aria-labelledby']).toBe('en-monogram-title');
  });
});

describe('Web App Manifest Configuration', () => {
  it('should export valid manifest configuration matching specification', () => {
    const data = manifest();
    expect(data.name).toBe('Enrique Ndjakou | Ingénieur');
    expect(data.short_name).toBe('EN');
    expect(data.theme_color).toBe('#050505');
    expect(data.background_color).toBe('#050505');
    expect(data.display).toBe('standalone');
    expect(data.icons).toBeDefined();
    expect(data.icons?.length).toBeGreaterThanOrEqual(1);

    const svgIcon = data.icons?.find((icon) => icon.sizes === 'any');
    expect(svgIcon).toBeDefined();
    expect(svgIcon?.src).toBe('/icon.svg');
    expect(svgIcon?.type).toBe('image/svg+xml');
    expect(svgIcon?.purpose).toBe('any');

    const maskableIcon = data.icons?.find((icon) => icon.sizes === '192x192');
    expect(maskableIcon).toBeDefined();
    expect(maskableIcon?.purpose).toBe('maskable');
  });
});
