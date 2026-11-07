import type { SVGProps, JSX } from 'react';

export interface LogoProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  strokeWidth?: number | string;
  title?: string;
}

/**
 * Official Personal Brand Logo — The Isometric EN Monolith / Le Prisme Architectural EN
 *
 * Synthesized from GitHub's top-starred logo design frameworks:
 * - `kaankiziltug/logo-design-skill`: Zero eye pareidolia (no concentric circles),
 *   open counterforms at 16px, and architectural monogram taxonomy.
 * - `op7418/logo-generator-skill`: 3D isometric hexagonal prism construction
 *   and disciplined negative-space channels.
 * - `neonwatty/logo-designer-skill`: Adaptive multi-scale clarity and dynamic `currentColor` theming.
 *
 * Geometric Construction (24x24 grid):
 * - Left Isometric Face (`E`): Outer contour (`M12 2.5L3.5 7v10L12 21.5`),
 *   upper isometric ridge (`M3.5 7L12 11.5`), and middle cantilever (`M3.5 12L9 15`).
 * - Right Isometric Face (`N`): Upper-right crown (`M12 2.5L20.5 7`) and
 *   interlocking N face (`M12 21.5v-10L20.5 17V7`).
 */
export function Logo({
  className = 'h-8 w-8',
  size,
  strokeWidth = 2,
  title,
  'aria-hidden': ariaHidden,
  ...props
}: LogoProps): JSX.Element {
  // If title is provided, the SVG is semantic and accessible; otherwise, it is decorative.
  const isAriaHidden = ariaHidden !== undefined ? ariaHidden : title ? undefined : true;
  const titleId = title ? 'en-monolith-title' : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden={isAriaHidden}
      aria-labelledby={titleId}
      role={title ? 'img' : undefined}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {/* Left Isometric Face (E): Top-left ridge, left vertical pillar, bottom-left base */}
      <path d="M12 2.5L3.5 7v10L12 21.5" />
      {/* Left Isometric Face (E): Upper isometric crossbar / front-left roof ridge */}
      <path d="M3.5 7L12 11.5" />
      {/* Left Isometric Face (E): Middle cantilevered crossbar */}
      <path d="M3.5 12L9 15" />
      {/* Right Isometric Face (N): Upper-right crown ridge */}
      <path d="M12 2.5L20.5 7" />
      {/* Right Isometric Face (N): Central vertical spine, diagonal bridge, right vertical pillar */}
      <path d="M12 21.5v-10L20.5 17V7" />
    </svg>
  );
}

export default Logo;
