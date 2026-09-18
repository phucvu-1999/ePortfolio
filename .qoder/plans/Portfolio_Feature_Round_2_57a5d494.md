# Portfolio Feature Round 2: Case Studies, Live Data, Platform & Reach

## Context

The previous round shipped [content.ts](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/pages/portfolio/content.ts) (single content source), [seo.ts](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/pages/portfolio/seo.ts) (per-page meta hook), resume PDF, Supabase contact backend, and Professional mode. This round builds on those foundations. Constraints: no new npm dependencies; all live-data features degrade gracefully when Supabase/网络 is unavailable; existing placeholder content stays until real data is dropped into content.ts.

## Task 1 — Project case-study pages

Files: [content.ts](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/pages/portfolio/content.ts), new `src/pages/portfolio/CaseStudyPage.tsx`, [main.tsx](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/main.tsx), [PortfolioPage.tsx](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/pages/PortfolioPage.tsx)

- Extend `Project` with `slug` and optional `caseStudy` (problem, approach, architecture bullets, stack, metrics, gallery URLs, learnings) — sample case studies authored for all 6 existing projects (clearly benefiting from the existing sample-data badge flag).
- New route `/portfolio/project/:slug` rendering a focused case-study layout in the portfolio design language (mono fonts, emerald accents, terminal-style headers), with prev/next project navigation and back link.
- Project cards in the VS Code explorer section link to their case study (replacing the dead-end behavior when live/source URLs are empty).
- Per-page SEO via the existing `usePortfolioSEO` pattern generalized to accept title/description overrides.

## Task 2 — Live guestbook + visitor counter (Supabase)

Files: [guestbook.ts](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/lib/guestbook.ts), new `src/services/portfolioLive.ts`, [PortfolioPage.tsx](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/pages/PortfolioPage.tsx), [GuestbookMarquee.tsx](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/components/GuestbookMarquee.tsx)

- `portfolioLive.ts` service (DDL comments per the `contact.ts` pattern): `guestbook_entries` (name, message, created_at) and `portfolio_visits` (single-row counter or per-day rows).
- Guestbook: reads/writes go to Supabase when configured, localStorage fallback otherwise (terminal `sign` command unchanged); seed entries only shown in fallback mode with the existing sample badge.
- Visitor counter: increment on mount (session-deduped via sessionStorage), display as a subtle terminal-style stat in the footer ("visitors: N"); hidden entirely when Supabase unconfigured.

## Task 3 — Real GitHub activity graph

Files: [ContributionGraph.tsx](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/components/ContributionGraph.tsx), [content.ts](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/pages/portfolio/content.ts)

- `GITHUB_USERNAME` field in content.ts (default empty). When set, fetch real contribution counts from the public jogruber contributions API (plain `fetch`, no deps) with loading/error states; when empty or fetch fails, keep the current generated demo grid plus a "Sample data" badge (consistent with Testimonials).
- Cache the fetched data in sessionStorage to avoid refetch on every visit.

## Task 4 — Platform: PWA, bundle splitting, OG image

Files: [vite.config.ts](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/vite.config.ts), [index.html](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/index.html), new `public/manifest.webmanifest` + `public/sw.js` + `public/og-portfolio.svg`, [seo.ts](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/pages/portfolio/seo.ts), [main.tsx](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/main.tsx)

- Hand-written PWA: `manifest.webmanifest` (name, icons from existing favicon.svg, theme color) + minimal `sw.js` (cache-first for static assets, network-first for navigation), registered in main.tsx only in production builds.
- Bundle splitting: `build.rollupOptions.output.manualChunks` in vite.config.ts separating three.js, monaco, gsap/lenis, tiptap, and supabase into their own chunks (current main chunk is ~3.9 MB); verify no route breaks after splitting.
- Static OG share image (`og-portfolio.svg`/PNG in public) wired into `usePortfolioSEO` as `og:image` + `twitter:image`.

## Task 5 — Lightweight i18n (EN/VI)

Files: new `src/pages/portfolio/i18n.ts`, [content.ts](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/pages/portfolio/content.ts), [PortfolioPage.tsx](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/pages/PortfolioPage.tsx), [CommandPalette.tsx](file:///c:/Users/leo.phucvu/Personal/test-ai-tracking/src/components/CommandPalette.tsx)

- Tiny dictionary module (no deps): `t(key)` over an EN/VI record covering UI chrome and section headings/descriptions (content.ts data fields get optional `vi` variants where practical — bio/summary strings; project descriptions stay EN if untranslated).
- Language toggle: Command Palette entry + small footer switch; persisted to localStorage; document `lang` attribute updated.

## Task 6 — Verification

- `tsc` at the 65-error pre-existing baseline (zero new), production Vite build succeeds with visibly smaller main chunk, no dependency changes.
- Browser E2E: case-study navigation from project cards + direct URL + SEO title, guestbook/visitor fallback behavior without Supabase, contribution graph fallback + badge, language toggle EN/VI, PWA manifest present in DOM, no console errors. Mobile spot-check at 375px on the case-study page.

## Execution Order

1. Task 1 first (extends content.ts, which Tasks 3 and 5 also touch).
2. Tasks 2, 3, 4 in parallel after Task 1 (disjoint files; Task 4's seo.ts edit is isolated from Task 1's already-merged changes).
3. Task 5 last among implementations (broad PortfolioPage.tsx edits — avoids conflicts).
4. Task 6 verification, then cleanup.

## Out of Scope

- Contact-message admin inbox UI, OG image dynamic generation, full copy translation of all sample data, service-worker offline for Supabase data, wow-factor features (mini-game, 3D globe) — user deselected.