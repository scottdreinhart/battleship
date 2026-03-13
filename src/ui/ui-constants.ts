/**
 * UI layout constants — semantic breakpoints, media queries, timing values.
 *
 * Single source of truth for responsive design tokens.
 * CSS files consume these via `@media` strings; JS consumes via useResponsiveState.
 */

/** Width breakpoints in px (min-width, mobile-first) */
export const BREAKPOINTS = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

/** Pre-built media query strings for use in CSS-in-JS or matchMedia */
export const MEDIA = {
  /** Width breakpoints (min-width, mobile-first) */
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,

  /** Max-width queries (for "below this breakpoint") */
  belowSm: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  belowMd: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  belowLg: `(max-width: ${BREAKPOINTS.lg - 1}px)`,

  /** Input capability queries */
  hover: '(hover: hover)',
  coarsePointer: '(pointer: coarse)',
  finePointer: '(pointer: fine)',

  /** Accessibility preference queries */
  reducedMotion: '(prefers-reduced-motion: reduce)',

  /** Orientation */
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',

  /** Viewport constraints */
  shortViewport: '(max-height: 600px)',
} as const
