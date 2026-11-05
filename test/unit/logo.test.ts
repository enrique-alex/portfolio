import { describe, it, expect } from 'vitest';
import { Logo } from '@/components/ui/Logo';
import manifest from '@/app/manifest';

describe('Official Personal Brand Logo (Concept 1: The Feedback Core / La Boucle Fermée)', () => {
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

  it('should render the precision geometric core circle and closed-loop feedback vector paths', () => {
    const element = Logo({});
    const children = element.props.children;
    const paths = Array.isArray(children)
      ? children.filter((child) => child && child.type === 'path')
      : [];
    const circle = Array.isArray(children)
      ? children.find((child) => child && child.type === 'circle')
      : undefined;

    // Central feedback core circle verification
    expect(circle).toBeDefined();
    expect(circle?.props.cx).toBe('12');
    expect(circle?.props.cy).toBe('12');
    expect(circle?.props.r).toBe('3');

    // 6 Closed-loop feedback vector paths verification
    expect(paths).toHaveLength(6);
    // Setpoint input vector
    expect(paths[0]?.props.d).toBe('M2 12h7');
    // Controlled output vector
    expect(paths[1]?.props.d).toBe('M15 12h7');
    // Feedforward upper arc
    expect(paths[2]?.props.d).toBe('M5 12a7 7 0 0 1 14 0');
    // Feedforward direction terminal
    expect(paths[3]?.props.d).toBe('m17 10 2 2 2-2');
    // Feedback return lower arc
    expect(paths[4]?.props.d).toBe('M19 12a7 7 0 0 1-14 0');
    // Feedback return direction terminal entering summing junction
    expect(paths[5]?.props.d).toBe('m3 14 2-2 2 2');
  });

  it('should accept custom className, size, strokeWidth, and accessible title', () => {
    const element = Logo({
      className: 'h-10 w-10 text-brand-blue',
      size: 40,
      strokeWidth: 2.5,
      title: 'Feedback Core Logo',
      'aria-hidden': false,
    });

    expect(element.props.className).toBe('h-10 w-10 text-brand-blue');
    expect(element.props.width).toBe(40);
    expect(element.props.height).toBe(40);
    expect(element.props.strokeWidth).toBe(2.5);
    expect(element.props['aria-hidden']).toBe(false);

    const titleElement = element.props.children[0];
    expect(titleElement?.type).toBe('title');
    expect(titleElement?.props.children).toBe('Feedback Core Logo');
    expect(titleElement?.props.id).toBe('feedback-core-title');
    expect(element.props['aria-labelledby']).toBe('feedback-core-title');
    expect(element.props.role).toBe('img');
  });

  it('should handle semantic accessibility automatically when title is provided without explicit aria-hidden', () => {
    const element = Logo({
      title: 'Enrique Ndjakou - The Feedback Core',
    });

    expect(element.props['aria-hidden']).toBeUndefined();
    expect(element.props.role).toBe('img');
    expect(element.props['aria-labelledby']).toBe('feedback-core-title');
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
    expect(svgIcon?.src).toBe('/icon.svg?v=6');
    expect(svgIcon?.type).toBe('image/svg+xml');
    expect(svgIcon?.purpose).toBe('any');

    const maskableIcon = data.icons?.find((icon) => icon.sizes === '192x192');
    expect(maskableIcon).toBeDefined();
    expect(maskableIcon?.purpose).toBe('maskable');
  });
});
