# Research — Full Content Migration & Design Overhaul

**Feature**: 002-content-migration-redesign · **Date**: 2026-07-24

All Technical Context unknowns resolved below. Each section: Decision / Rationale / Alternatives
considered.

## 1. Scroll-animation engine (showcase level)

**Decision**: GSAP 3 + ScrollTrigger, installed via npm and bundled locally; one entry script
(`src/scripts/scroll-story.ts`) loaded on pages that declare scenes; `gsap.matchMedia()` gates
everything behind `(prefers-reduced-motion: no-preference)`.

**Rationale**:

- The clarified requirement is _showcase_: pinned scenes, scrubbed parallax, choreographed
  typography. ScrollTrigger is the industry-standard tool for exactly this (pinning, scrubbing,
  stagger orchestration, `matchMedia` responsive/reduced-motion splits) and is battle-tested on
  mobile.
- GSAP (including all plugins, ScrollTrigger among them) has been 100% free including commercial
  use since the Webflow acquisition (2024/2025) — no licensing constraint.
- Bundled via npm → no CDN request (constitution I, FR-017); ~40 KB gzip for core + ScrollTrigger
  fits the ≤ 70 KB JS budget.
- Progressive enhancement pattern: elements are fully visible in server-rendered HTML; the script
  applies initial offsets only at init (`gsap.from(...)`) — if JS never runs, nothing is hidden
  (FR-014). Pinning is skipped entirely under reduced motion; reveals degrade to opacity-only or
  none.

**Alternatives considered**:

- _Native CSS scroll-driven animations_ (`animation-timeline: view()/scroll()`): zero JS and
  attractive, but no cross-browser story yet (Firefox behind flag; Safari support only in the
  newest versions), and no equivalent of pinned/scene-based sections; would cap us below
  "showcase". May still be used opportunistically for minor effects behind `@supports`.
- _Hand-rolled IntersectionObserver + rAF_: fine for staged reveals (the rejected "Refined"
  option), but re-implementing scrubbing/pinning correctly (momentum scrolling, resize, direction
  changes, iOS quirks) is high-risk custom code for worse results.
- _Motion (motion.dev) / anime.js_: good reveal libraries, but scrub+pin support is markedly
  weaker than ScrollTrigger; no advantage that offsets the switch.
- _Lenis/locomotive smooth-scrolling_: rejected outright — scroll hijacking conflicts with the
  "never obstruct reading" guardrail and harms accessibility; native scrolling stays.

## 2. Web fonts — replace Google Fonts CDN with self-hosting

**Decision**: Self-host Bodoni Moda (variable, incl. italic) and Hanken Grotesk (variable) via
`@fontsource-variable/bodoni-moda` + `@fontsource-variable/hanken-grotesk` npm packages, imported
in `BaseLayout.astro`; preload the two critical woff2 files; `font-display: swap`; remove the
`fonts.googleapis.com` / `fonts.gstatic.com` links and preconnects.

**Rationale**:

- Current CDN load is a third-party request on every page view — for a German site this is the
  well-known Google-Fonts GDPR problem (LG München I, 3 O 17493/20): embedding from Google's CDN
  without consent transmits visitor IPs to Google. Self-hosting removes the legal exposure and
  keeps the site consent-banner-free (aligned with FR-017's intent).
- Also removes a render-blocking cross-origin dependency → helps SC-003 (LCP ≤ 2.5 s) and
  constitution I.
- Same two families as `.impeccable.md` tokens — the visual direction is unchanged; variable
  fonts keep the payload small (2 files instead of ~9 static weights).

**Alternatives considered**: keep Google Fonts CDN (rejected: GDPR + perf); download woff2 files
manually into `public/fonts/` (workable, but @fontsource versions the files, pins subsets, and
integrates with the build with less hand-maintenance).

## 3. Old-site asset & link harvesting

**Decision**: One dev-only script `scripts/harvest-old-site.mjs` (run manually, never in CI) that,
strictly limited to the `https://jazz-isses.de/Francesca/` path:

1. Downloads all referenced assets (portraits, CD covers, project photos, flyer PDFs, CD info
   PDFs) into `public/uploads/` with descriptive kebab-case names (e.g.
   `cd-azzurro-cover.jpg`, `flyer-recall.pdf`).
2. Parses the raw HTML of each of the 9 pages to extract the **exact** outbound URLs (YouTube,
   SoundCloud) and PDF hrefs that the earlier content capture recorded only as labels.
3. Emits a `harvest-report.md` (into the feature dir) mapping every asset/link → target content
   file, plus verbatim page text for the passages the inventory marks _(paraphrased)_ so they can
   be corrected before publishing.
4. Pre-sizes images with sharp (already a dependency): max 1600 px long edge for photos, ~800 px
   for CD covers, JPEG/PNG kept in original format (Decap-friendly), quality ≈ 80.

**Rationale**: The WebFetch capture returned link labels but not hrefs, and flagged paraphrased
passages; FR-003/FR-005 need the real URLs and verbatim text. Scripting it makes the pre-launch
re-verification (spec assumption) repeatable: re-run → diff `harvest-report.md`.

**Alternatives considered**: manual save-as from the browser (error-prone, not repeatable);
hot-linking old assets (explicitly forbidden by FR-011).

## 4. Modeling the program page ("Canzoni italiane")

**Decision**: New **folder collection `programs`** (`src/content/programs/de/*.md`,
`create: true` in Decap) rather than a one-off singleton. Fields: title, subtitle/ensemble,
intro, press quote (text + attribution), line-up list (member + instrument), booking pitch
(heading + text), optional hero image, `order`; narrative sections in the markdown body.
Rendered by a dynamic route `src/pages/[program].astro` (`getStaticPaths` over the collection)
→ `/canzoni-italiane/`.

**Rationale**: FR-012 requires the owner to be able to add entries to new structures; her history
(Projekt 70 → Songs of the 70s → Canzoni italiane) shows programs are a recurring content type —
next program page needs zero developer work. Astro gives static routes priority over dynamic
ones, so `[program].astro` can sit at the root and cleanly yield `/canzoni-italiane/` without
colliding with `vita.astro` etc.

**Risk & mitigation**: an owner-created program slugged like an existing static route (e.g.
`vita`) would be shadowed — mitigated by a hint text on the Decap slug field and an e2e test
asserting the canonical routes render their intended pages.

**Alternatives considered**: singleton file collection (cheapest, but violates the spirit of
FR-012 and needs a developer for program #2); nesting programs under projects (conflates an
ensemble with a stage program; the old site keeps them distinct).

## 5. Hybrid information architecture (routing & components)

**Decision**: Keep `index.astro` as the scrolling overview; refactor existing
`components/sections/*` into landing **teasers** (short excerpt + "mehr" link); add six static
subpages (`vita`, `projekte`, `termine`, `cds`, `unterricht`, `kontakt`) plus the dynamic program
route, all composed from a new `components/blocks/` kit (subpage hero, prose block, pull quote,
line-up, CD card, date list, download link, external link). Header nav links to subpages
(absolute paths, works from any route); the landing page may additionally expose anchor
navigation for its own sections.

**Rationale**: Direct implementation of the Clarification (hybrid). A shared block kit keeps the
"one coherent visual system" requirement (FR-016) enforceable in code rather than by discipline.

**Alternatives considered**: covered and decided in /speckit-clarify (single long page; strict
multi-page) — not revisited.

## 6. Tour-date archive

**Decision**: Extend `src/lib/tour-dates.ts` with `groupPastByYear(dates, now)` returning years
descending, dates descending within a year; `termine.astro` renders upcoming first, then the
archive ("Aktuelle und vergangene Termine" continuity). Add `ensemble` (optional string, default
"Francesca Simone & Friends" at render time) to the tour-date schema. Unit tests cover boundary
(today), empty-upcoming, empty-archive, year grouping, and unbounded growth (rendering stays a
flat year-grouped list — no pagination needed at ~10 entries/year; revisit only if it ever
exceeds ~100 entries).

**Rationale**: Matches old-site behavior (FR-006) and the existing daily-rebuild mechanism
already rolls dates from upcoming to past without manual edits.

**Alternatives considered**: separate `archive` collection (rejected: double bookkeeping, and
"moves automatically" would become a manual copy); deleting past dates (violates FR-006).

## 7. Flyers & CD info PDFs

**Decision**: Decap `file` widget fields — `flyers` list (label + file) on projects, `infoPdf` on
discography entries. PDFs live in `public/uploads/` like all media. Download links render with a
visible "PDF" affordance and `download`-friendly labeling; external listening links render with
an outbound-link marker and `rel="noopener external"` (FR-017).

**Rationale**: The old site's depth for projects/CDs lives in these PDFs; the file widget keeps
them owner-replaceable (FR-010/FR-011) with zero custom tooling.

**Alternatives considered**: transcribing PDF contents onto pages (scope explosion, and the owner
maintains the PDFs already); linking old-site PDF URLs (forbidden, FR-011).

## 8. Ordering of owner-managed lists

**Decision**: Reuse the established `order: number` pattern (projects already have it) for
`discography` and `programs`. Sortable in Decap via `sortable_fields`; render sorts ascending
with stable fallback (title).

**Rationale**: FR-012 ("reorder where ordering is meaningful"); consistent with 001 conventions.

**Alternatives considered**: Decap drag-and-drop reordering only works inside a single entry's
list widgets, not across folder-collection entries — so a numeric field remains the simplest
owner-operable mechanism.

## 9. CMS previews for new/extended collections

**Decision**: Extend `public/admin/index.html` `registerPreviewTemplate` set to cover programs,
extended projects (members/links/flyers), discography with cover + PDF name, teaching, and the
extended biography — same in-app preview approach as 001 (GitHub Pages has no branch previews).

**Rationale**: Editorial workflow (draft → preview → publish) is the owner's safety net; new
fields that don't appear in previews would erode trust in what "publish" will do.

## 10. Motion design language (extends `.impeccable.md`)

**Decision**: Update `.impeccable.md`'s Motion section (one-time design-context amendment,
constitution IV) from "one orchestrated entrance" to the showcase grammar specified in
[contracts/motion.md](./contracts/motion.md). Non-negotiables carried over: transform/opacity
only, exponential ease-out, no bounce/elastic, `prefers-reduced-motion` honored, no scroll
hijacking, CLS = 0 from animations (initial states must not reserve different space).

**Rationale**: Keeps the design-context file the single source of truth for design decisions
while implementing the "Showcase" clarification; reconciles the "single warm accent" clarification
by keeping terracotta as the only accent color, with `--color-evening` restricted to large quiet
surfaces (footer, program-page hero) — not a second accent.

## 11. Performance & accessibility verification approach

**Decision**:

- Playwright e2e additions: per-route content-presence specs generated from the inventory's
  checkable items (headings, six CD titles, both phone numbers, quote attributions);
  `prefers-reduced-motion` emulation asserting no ScrollTrigger pins; a no-JS context asserting
  all landmark content is visible; axe scan on every route (existing pattern, now ~10 routes).
- Lighthouse (manual, documented in quickstart) on mobile emulation for LCP/CLS validation
  against SC-003/SC-004 before merge.

**Rationale**: SC-001…SC-005 need mechanical checks, not vibes; generating content assertions
from the inventory turns the "100% content audit" into a test run.

**Alternatives considered**: Lighthouse CI in Actions (nice-to-have; deferred — adds CI time and
flakiness to a one-person project; manual gate documented instead).
