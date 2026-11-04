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
 * Senior Design Engineering & Lucide Vector Standard:
 * - 24x24 strict geometric grid with pixel-grid alignment (zero sub-pixel blur).
 * - High-speed PCB differential trace aesthetics: 45° mitered corners on 'E' to avoid signal reflections.
 * - Dynamic 7-2-7 proportion with 2px Gestalt isolation channel matching the stroke width.
 * - Uniform stroke with round linecaps and filleted linejoins.
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
      {/* 'E' bus trace with 45° mitered corners (anti-signal reflection routing) */}
      <path d="M11 4H6l-2 2v12l2 2h5" />
      {/* 'E' middle logic branch */}
      <path d="M4 12h5" />
      {/* 'N' high-speed differential signal trace: left rail -> diagonal -> right rail */}
      <path d="M13 20V4l7 16V4" />
    </svg>
  );
}

export default Logo;
