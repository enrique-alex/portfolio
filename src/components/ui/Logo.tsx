import type { SVGProps, JSX } from 'react';

export interface LogoProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  strokeWidth?: number | string;
  title?: string;
}

/**
 * Official Personal Brand Logo - Monogram EN (Enrique Ndjakou)
 *
 * Engineered according to strict Design Engineer & Lucide vector standards:
 * - 24x24 pixel grid alignment (zero sub-pixel blur).
 * - Technical typography: geometric fusion of 'E' and 'N' with 90° and 45° PCB routing angles.
 * - Uniform stroke width with round linecaps and filleted linejoins.
 * - Dynamic theming via `currentColor`.
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
  const titleId = title ? 'en-monogram-title' : undefined;

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
      {/* Outer frame of 'E' (top bar, vertical spine, bottom bar) */}
      <path d="M12 20H4V4h8" />
      {/* Middle bus trace of 'E' terminating at the central diagonal node (12, 12) */}
      <path d="M4 12h8" />
      {/* Technical 'N' 45° diagonal trace routing down to right vertical stem */}
      <path d="M4 4l16 16V4" />
    </svg>
  );
}

export default Logo;
