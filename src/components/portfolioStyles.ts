// ─── Shared portfolio variant registry ──────────────────────────────────────
// Extracted from StyleSwitcher.tsx so the component file exports only
// components (react-refresh/only-export-components) and non-component
// consumers like CaseStudyPage can import these without pulling in JSX.

export const PORTFOLIO_STYLES = [
  { path: '/portfolio', label: 'Original', num: '0' },
  { path: '/portfolio-1', label: 'Cinematic', num: '1' },
  { path: '/portfolio-2', label: 'Minimal', num: '2' },
  { path: '/portfolio-3', label: 'Brutal', num: '3' },
  { path: '/portfolio-4', label: 'Bento', num: '4' },
  { path: '/awesome', label: 'Awesome', num: '5' },
]

/** Extracts the variant base path from e.g. /portfolio-3/project/xyz → /portfolio-3 */
export function styleBaseOf(pathname: string): string {
  const m = pathname.match(/^(\/portfolio(?:-[1-4])?|\/awesome)/)
  return m ? m[1] : '/portfolio'
}
