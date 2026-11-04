import type { SVGProps, JSX } from 'react';

export interface LogoProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  strokeWidth?: number | string;
  title?: string;
}

/**
 * Official Personal Brand Logo - Concept 1: The Feedback Core / La Boucle Fermée
 *
 * Closed-Loop PID Control & Mechatronic Engineering Symbology:
 * - 24x24 strict geometric grid with pixel-grid alignment (zero sub-pixel blur).
 * - Central Feedback Core: Controlled plant & PID summing nucleus (circle r=3 at 12,12).
 * - Symmetrical Closed-Loop Circulation: Feedforward direct transfer arc & Feedback return loop.
 * - Directional feedback vector terminals entering the summing junction.
 * - Uniform stroke with round linecaps and filleted linejoins (Lucide vector standard).
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
  const titleId = title ? 'feedback-core-title' : undefined;

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
      {/* Central Feedback Core: PID Controller / Summing Plant Nucleus */}
      <circle cx="12" cy="12" r="3" />
      {/* Setpoint Reference Vector: input -> summing junction -> core */}
      <path d="M2 12h7" />
      {/* Controlled Output Vector: core -> branch node -> system output */}
      <path d="M15 12h7" />
      {/* Feedforward Upper Arc (Direct Transfer Function G(s)) */}
      <path d="M5 12a7 7 0 0 1 14 0" />
      {/* Feedforward Terminal Direction Arrow */}
      <path d="m17 10 2 2 2-2" />
      {/* Feedback Lower Arc (Sensor Return Loop H(s)) */}
      <path d="M19 12a7 7 0 0 1-14 0" />
      {/* Feedback Return Direction Arrow entering Summing Junction */}
      <path d="m3 14 2-2 2 2" />
    </svg>
  );
}

export default Logo;
