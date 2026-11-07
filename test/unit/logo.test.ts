import { describe, it, expect } from 'vitest';
import { Logo } from '@/components/ui/Logo';
import manifest from '@/app/manifest';

describe('Official Personal Brand Logo (The Isometric EN Monolith / Le Prisme Architectural EN)', () => {
  it('should render standard SVG attributes following Design Engineering and GitHub logo-design-skill standards', () => {
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

  it('should render the 5 precision isometric E-N monolith paths with zero concentric circles (no eye pareidolia)', () => {
    const element = Logo({});
    const children = element.props.children;
    const paths = Array.isArray(children)
      ? children.filter((child) => child && child.type === 'path')
      : [];
    const circle = Array.isArray(children)
      ? children.find((child) => child && child.type === 'circle')
      : undefined;

    // Zero concentric circle / eye pareidolia guarantee
    expect(circle).toBeUndefined();

    // 5 Isometric EN Monolith vector paths verification
    expect(paths).toHaveLength(5);
    // Left isometric E outer contour (top-left ridge, left vertical pillar, bottom-left base)
    expect(paths[0]?.props.d).toBe('M12 2.5L3.5 7v10L12 21.5');
    // Left isometric E upper crossbar
    expect(paths[1]?.props.d).toBe('M3.5 7L12 11.5');
    // Left isometric E middle cantilevered bar
    expect(paths[2]?.props.d).toBe('M3.5 12L9 15');
    // Right isometric N upper-right crown ridge
    expect(paths[3]?.props.d).toBe('M12 2.5L20.5 7');
    // Right isometric N central vertical spine, diagonal bridge, and right vertical pillar
    expect(paths[4]?.props.d).toBe('M12 21.5v-10L20.5 17V7');
  });

  it('should accept custom className, size, strokeWidth, and accessible title', () => {
    const element = Logo({
      className: 'h-10 w-10 text-brand-blue',
      size: 40,
      strokeWidth: 2.5,
      title: 'EN Monolith Logo',
      'aria-hidden': false,
    });

    expect(element.props.className).toBe('h-10 w-10 text-brand-blue');
    expect(element.props.width).toBe(40);
    expect(element.props.height).toBe(40);
    expect(element.props.strokeWidth).toBe(2.5);
    expect(element.props['aria-hidden']).toBe(false);

    const titleElement = element.props.children[0];
    expect(titleElement?.type).toBe('title');
    expect(titleElement?.props.children).toBe('EN Monolith Logo');
    expect(titleElement?.props.id).toBe('en-monolith-title');
    expect(element.props['aria-labelledby']).toBe('en-monolith-title');
    expect(element.props.role).toBe('img');
  });

  it('should handle semantic accessibility automatically when title is provided without explicit aria-hidden', () => {
    const element = Logo({
      title: 'Enrique Ndjakou - The Isometric EN Monolith',
    });

    expect(element.props['aria-hidden']).toBeUndefined();
    expect(element.props.role).toBe('img');
    expect(element.props['aria-labelledby']).toBe('en-monolith-title');
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
    expect(svgIcon?.src).toBe('/icon.svg?v=7');
    expect(svgIcon?.type).toBe('image/svg+xml');
    expect(svgIcon?.purpose).toBe('any');

    const maskableIcon = data.icons?.find((icon) => icon.sizes === '192x192');
    expect(maskableIcon).toBeDefined();
    expect(maskableIcon?.purpose).toBe('maskable');
  });
});
