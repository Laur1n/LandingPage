# Tasks: Full Content Migration & Design Overhaul

**Input**: Design documents from `/specs/002-content-migration-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (all present)

**Tests**: Included — the plan and constitution commit to unit tests for content logic
(tour-date grouping) and e2e gates (content-presence audit, no-JS, reduced-motion, axe).

**Organization**: Grouped by user story. US1 = complete content (renders with existing styling),
US2 = CMS editability, US3 = design/motion overhaul. Each story is independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different files, no dependency on an incomplete task)
- **[Story]**: US1 / US2 / US3 per spec.md

## Phase 1: Setup (harvest + dependencies)

**Purpose**: Get the real source material (exact URLs, verbatim text, assets) and new packages in
place. Everything downstream consumes the harvest output.

- [x] T001 Create dev-only harvest script `scripts/harvest-old-site.mjs` per research.md §3: crawl ONLY `https://jazz-isses.de/Francesca/` (never the root domain), download all images/PDFs to `public/uploads/` using the naming convention in data-model.md §Media, extract exact outbound hrefs (YouTube/SoundCloud) and PDF hrefs from raw HTML, dump verbatim text of every passage marked _(paraphrased)_ in content-inventory.md, write `specs/002-content-migration-redesign/harvest-report.md`
- [x] T002 Run the harvest; pre-size images with sharp (photos ≤1600px, covers ≤800px, q≈80); verify report against content-inventory.md §Media; commit assets; create `specs/002-content-migration-redesign/launch-checklist.md` listing any unreachable/low-res assets (spec edge case)
- [x] T003 [P] Add dependencies to package.json: `gsap`, `@fontsource-variable/bodoni-moda`, `@fontsource-variable/hanken-grotesk` (npm install; no CDN — plan Technical Context)

---

## Phase 2: Foundational (schemas, libs, block kit)

**Purpose**: Schema and helper changes every story depends on (US1 content files validate against
the schemas; US2 CMS fields must match them; US3 styles the components).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Extend `src/content.config.ts` per data-model.md: add `fileLink`/`member` sub-schemas; extend biography (portraitVita, portraitVitaAlt, teaser, pullQuote), projects (programName, members, links, flyers), tour-dates (ensemble), discography (infoPdf, order), teaching (subtitle, offerings, methodsHeading, methodsText, schedulingText), contact (phoneMobile), site (teasers/subpages/archive/downloads/program label groups with defaults); add new `programs` collection
- [x] T005 Extend `src/lib/site-texts.ts` to expose the new site label groups with build-safe defaults (data-model.md §site)
- [x] T006 [P] Extend `src/lib/tour-dates.ts`: `groupPastByYear(dates, now)` (years desc, dates desc within year) and ensemble render-default helper (research.md §6)
- [x] T007 [P] Unit tests for tour-date logic in `tests/unit/tour-dates.test.ts`: today-boundary, empty upcoming, empty archive, year grouping order, ensemble default (constitution content-logic gate)
- [x] T008 Create unstyled-but-token-based block kit in `src/components/blocks/`: `SubpageHero.astro`, `Prose.astro`, `PullQuote.astro`, `Lineup.astro`, `CdCard.astro`, `DateList.astro`, `DownloadLink.astro` (PDF affordance), `ExternalLink.astro` (outbound marker, `rel="noopener external"`, `target="_blank"` — FR-017)

**Checkpoint**: Schemas validate, helpers tested — story phases can start (US1 first; US2/US3 parallel after).

---

## Phase 3: User Story 1 — Visitor finds every piece of information (Priority: P1) 🎯 MVP

**Goal**: 100% of old-site content on the new site, structured per the hybrid IA (landing
teasers + full subpages incl. `/canzoni-italiane/`), rendering correctly with existing styling.

**Independent Test**: e2e content-presence audit passes every MUST-show row of
contracts/routes.md against content-inventory.md; site is content-complete even before redesign.

### Content migration (source: harvest-report.md; verbatim text corrections per inventory)

- [x] T009 [P] [US1] Rewrite `src/content/biography/de/index.md`: move current landing text into `teaser`, set `body` to the full 5-paragraph Kurzvita (inventory §2, verbatim from harvest), add `portraitVita` (portrait-2), `pullQuote`
- [x] T010 [P] [US1] Extend the 3 files in `src/content/projects/de/`: full descriptions (inventory §3), `members`, `programName`, `links` (exact harvested URLs incl. internal `/canzoni-italiane/` link), `flyers` (harvested PDFs)
- [x] T011 [P] [US1] Create `src/content/programs/de/canzoni-italiane.md` with all fields from data-model.md §programs (inventory §8: intro, A. Fasel quote + attribution, lineup ×4, pitch, body sections)
- [x] T012 [P] [US1] Replace `src/content/discography/de/platzhalter-album.md` with 6 entries (inventory §5): title, coverImage (+alt), infoPdf, order 1–6
- [x] T013 [P] [US1] Add the 10 tour dates from inventory §4 to `src/content/tour-dates/de/` (date+time, venue, location, notes like „nur nach persönlicher Anmeldung", ensemble)
- [x] T014 [P] [US1] Extend `src/content/teaching/de/index.md`: subtitle, 6 offerings, methodsHeading/methodsText (verbatim from harvest), schedulingText, body incl. „Seit 1994 …"
- [x] T015 [P] [US1] Extend `src/content/contact/de/index.md`: add `phoneMobile` (+49 (0) 162 / 829 23 23), verify landline/email, invitation text in body (inventory §7)
- [x] T016 [P] [US1] Reconcile `src/content/legal/de/impressum.md` with inventory §9: address Im Winkel 6 51789 Lindlar, copyright notice, external-links disclaimer, „Fotografie: Dorina Köb", © line
- [x] T017 [P] [US1] Extend `src/content/site/de/index.md` with the new label groups' content (teasers, subpage heroes with old-site headings, archive, downloads, program — data-model.md §site)

### Pages & navigation

- [x] T018 [US1] Update `src/components/Header.astro` and `src/components/Footer.astro`: nav links target subpages with absolute trailing-slash paths (work from any route); footer roles line includes „Chorleiterin" (routes.md cross-cutting)
- [x] T019 [P] [US1] Create `src/pages/vita.astro` (SubpageHero + Prose + portraitVita + pullQuote; unique title/description) per routes.md `/vita/`
- [x] T020 [P] [US1] Create `src/pages/projekte.astro` (full projects incl. members, flyers via DownloadLink, listening links via ExternalLink, link to program page) per routes.md `/projekte/`
- [x] T021 [P] [US1] Create `src/pages/termine.astro` (upcoming block first, then archive grouped by year via `groupPastByYear`; empty states from site texts) per routes.md `/termine/`
- [x] T022 [P] [US1] Create `src/pages/cds.astro` (6 CdCards: cover or placeholder, Info-PDF DownloadLink) per routes.md `/cds/`
- [x] T023 [P] [US1] Create `src/pages/unterricht.astro` (subtitle, intro, offerings list, Stimmarbeit section, locations, scheduling) per routes.md `/unterricht/`
- [x] T024 [P] [US1] Create `src/pages/kontakt.astro` (landline, mobile, mailto:, invitation text, roles) per routes.md `/kontakt/`
- [x] T025 [US1] Create dynamic route `src/pages/[program].astro` (`getStaticPaths` over `programs`) rendering title, subtitle, intro, quote+attribution (never separated), body sections, Lineup, pitch with CTA → `/kontakt/` per routes.md `/canzoni-italiane/`
- [x] T026 [US1] Refactor `src/pages/index.astro` + `src/components/sections/*.astro` into the hybrid landing: each section becomes a teaser (biography.teaser, project excerpts, next date, CD strip, teaching, kontakt) linking to its subpage; add „Canzoni italiane entdecken" CTA (Clarification #1, SC-006)
- [x] T027 [US1] e2e content-presence audit in `tests/e2e/content.spec.ts`: every MUST-show row from contracts/routes.md (6 CD titles, both phone numbers, quote attribution, 10 archive dates grouped by year, 5 Vita paragraphs, offerings, program lineup); assert built output contains zero `jazz-isses.de` references (FR-011); assert `/vita/` beats the dynamic route

**Checkpoint**: Content-complete site — SC-001/SC-006/SC-007 verifiable now. MVP deliverable.

---

## Phase 4: User Story 2 — Owner maintains all content herself (Priority: P2)

**Goal**: Every migrated text/image/PDF/date/link editable in Decap CMS without a developer.

**Independent Test**: quickstart.md §5 round-trip — edit one item per collection via
`npx decap-server`, each renders after reload; every public string traces to a CMS field.

- [x] T028 [US2] Apply contracts/decap-cms-config-delta.md to `public/admin/config.yml`: new fields on biography/projects/tour_dates/discography/teaching/contact/site, new `programs` collection with reserved-slug hint, German labels + hints, `order` in discography `sortable_fields`
- [x] T029 [US2] Extend `registerPreviewTemplate` set in `public/admin/index.html`: new `programs` preview; updated biography/projects/discography/teaching previews showing the new fields (research.md §9)
- [ ] T030 [US2] Execute quickstart.md §5 CMS round-trip locally (temporary `local_backend: true`, NEVER committed): program creation, flyer + cover/Info-PDF replacement, past/future tour date, teaching/site edits; fix any field-name mismatch against `src/content.config.ts`; confirm <3 min per edit (SC-002)
  > Status 2026-07-25: the automatable half is done and green — field-name parity between
  > `config.yml` and the Zod schemas is enforced by `tests/unit/cms-config-parity.test.ts`
  > (incl. `local_backend` never committed). The interactive browser round-trip itself still
  > needs a human run per quickstart §5 before declaring SC-002 met.

**Checkpoint**: US1 + US2 — content-complete AND self-maintainable.

---

## Phase 5: User Story 3 — Warm, professional, showcase design (Priority: P3)

**Goal**: "Warm editorial minimal" redesign across all routes with showcase scroll storytelling
per contracts/motion.md — zero regression on content/a11y/perf guardrails.

**Independent Test**: quickstart.md §4 + §6 — motion contract scene inventory present,
reduced-motion/no-JS e2e green, Lighthouse mobile LCP ≤ 2.5 s / CLS < 0.1, no banned design traits.

- [x] T031 [P] [US3] Self-host fonts in `src/layouts/BaseLayout.astro`: import @fontsource-variable packages, preload critical woff2, remove `fonts.googleapis.com`/`gstatic.com` links+preconnects (research.md §2)
- [x] T032 [P] [US3] Amend `.impeccable.md` Motion section to the showcase grammar, referencing contracts/motion.md; record terracotta as the single accent, `--color-evening` restricted to quiet surfaces (research.md §10 — constitution IV gate)
- [x] T033 [US3] Extend `src/styles/tokens.css` (motion duration/ease tokens, spacing for showcase scenes) and `src/styles/global.css` (redesign foundations: type scale, prose measure ~70ch, focus states) — no `opacity:0`/transforms on content in authored CSS (motion.md rule 1)
- [x] T034 [US3] Redesign landing `src/pages/index.astro` + teaser sections to warm-editorial-minimal (paper base, generous whitespace, Bodoni Moda display, no banned traits: no icon-card grids, no gradient text, no glassmorphism, no side-stripe cards)
- [x] T035 [US3] Style the `src/components/blocks/` kit + subpage layouts as one coherent system incl. `/impressum/` + `/datenschutz/` restyle (FR-016)
- [x] T036 [US3] Create `src/scripts/scroll-story.ts`: GSAP + ScrollTrigger init deferred to after first paint, scene registry, `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` wrapper, `once:true` reveals, will-change hygiene (motion.md rules 1–6)
- [x] T037 [US3] Implement landing scenes L1–L7 from contracts/motion.md (hero entrance, portrait parallax, pinned pull-quote, teaser reveals, date count-up, CD strip drift, outro) with per-scene fallbacks
- [x] T038 [US3] Implement subpage scenes S1–S7 from contracts/motion.md (subpage heroes, prose reveals, vita parallax, project alternating reveals, program hero zoom-scrub, termine year pins desktop-only, CD tilt-settle); legal pages S1 only; no motion code on `/admin/`
- [x] T039 [US3] e2e in `tests/e2e/motion.spec.ts`: reduced-motion emulation ⇒ no pin spacers + hero text immediately visible; JS-disabled context ⇒ all MUST-show content visible; default ⇒ full-page scroll with zero console errors and no stuck opacity; built HTML has no `fonts.googleapis.com` reference

**Checkpoint**: All three stories complete and independently verified.

---

## Phase 6: Polish & Cross-Cutting

- [x] T040 [P] Extend axe e2e coverage in `tests/e2e/a11y.spec.ts` to all 10 routes; fix all serious/critical violations (SC-005)
- [x] T041 Performance gate per quickstart.md §4: Lighthouse mobile on `/` and `/canzoni-italiane/` (LCP ≤ 2.5 s, CLS < 0.1); 4× CPU-throttle scroll profile (no >100 ms animation-init task); tune (defer, resize images, prune scenes per motion.md rule 7) until green
- [x] T042 Pre-launch content re-check: re-run `scripts/harvest-old-site.mjs`, diff harvest-report.md against shipped content (spec assumption "content freeze & re-check"), apply diffs, update `specs/002-content-migration-redesign/launch-checklist.md` (incl. photo-quality items — photography-led direction)
- [x] T043 [P] Update `README.md`: hybrid IA, new collections (programs), harvest script usage, self-hosted fonts note
- [x] T044 Full quickstart.md validation run (all six sections) on a clean checkout; `npm run build && npm test && npm run test:e2e && npm run check && npm run lint && npm run format:check` all green

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 → T002 (script before run); T003 independent
- **Foundational (Phase 2)**: needs T002 only for asset paths referenced later (schemas don't); T004 → T005; T004 blocks all content tasks; T006 → T007; T008 after T004
- **US1 (Phase 3)**: needs Phase 2. T009–T017 all parallel (different files, need T002+T004). T018 anytime after T005. T019–T024 parallel (need T008 + their content task). T025 needs T011. T026 needs T009–T015, T018. T027 last (needs all US1)
- **US2 (Phase 4)**: needs T004 (field parity); independent of US1 pages — can run parallel to Phase 3 after T004, though T030's full round-trip is most valuable after content exists
- **US3 (Phase 5)**: T031/T032 anytime; T033–T035 need US1 pages to exist; T036 → T037 → T038; T039 last. Runs after US1; parallel to US2
- **Polish (Phase 6)**: after US1–US3; T040/T043 parallel; T042 before launch; T044 final gate

### User Story Dependencies

- **US1**: only Foundational — delivers standalone MVP
- **US2**: Foundational (+US1 content for meaningful round-trip validation); no code dependency on US1 pages
- **US3**: US1 pages (restyles them); no dependency on US2

## Parallel Example: User Story 1

```bash
# After T004 (schemas) + T002 (assets), launch all 9 content-migration tasks together:
Task: T009 biography  | T010 projects | T011 program | T012 discography | T013 tour-dates
Task: T014 teaching   | T015 contact  | T016 impressum | T017 site texts
# Then all 6 static subpages together (T019–T024) once T008 blocks exist
```

## Implementation Strategy

**MVP first (US1 only)**: Phases 1–3 give a content-complete replacement site (SC-001, SC-007)
with the current design — already launchable in an emergency. **Stop and validate** via T027.

**Incremental**: add US2 (owner self-service — the constitution-critical increment), then US3
(the showcase redesign that makes the relaunch feel like an upgrade), then Polish gates. Each
checkpoint leaves the site deployable; commit after each task or logical group.

**Solo-developer note**: the [P] markers matter mostly for batching similar edits (e.g. all 9
content files in one sitting) — the phase order above is the recommended serial path.
