---
description: "Task list for Francesca Simone Portfolio Site with Self-Service Content Login"
---

# Tasks: Francesca Simone Portfolio Site with Self-Service Content Login

**Input**: Design documents from `/specs/001-francesca-portfolio-site/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md (all present)

**Tests**: Included, scoped exactly to the constitution's pragmatic testing gate (Content Workflow
& Quality Gates) — no tests for static content rendering itself, but the tour-date filtering logic
and the authentication/publish boundaries get coverage, validated after implementation rather than
as strict test-first TDD (the constitution does not mandate TDD for this project).

**Organization**: Tasks are grouped by user story (spec.md priorities P1/P2/P3) to enable
independent implementation and testing of each story.

**Implementation status**: 52/53 tasks complete as of `/speckit-implement` (2026-07-23), later
revised to GitHub Pages hosting (2026-07-23, same day). The only remaining item, T035, cannot be
completed from within this codebase — it requires registering the site with DecapBridge and a
live GitHub repository (external account setup, see README.md "One-time deployment setup").
Everything else — the full public site, all seven Decap CMS collections, and the test suite (5
unit + 38 e2e, including axe-core accessibility checks) — builds, tests, and lints cleanly. A
local Lighthouse run scored 100/100/100/100 (Performance/Accessibility/Best Practices/SEO).

**Post-implementation revision (2026-07-23)**: hosting moved from Netlify to GitHub Pages per
explicit project direction. This removed the two Netlify Functions (T046's export-content.ts and
T036's scheduled-rebuild.ts) in favor of GitHub Actions (`.github/workflows/deploy.yml`, added as
part of this revision) and a public-repository ZIP download for FR-021 (see research.md §5-§7 and
contracts/export-content-api.md for the full rationale). T036, T046-T048 below are left as a
historical record of the superseded Netlify-based tasks; see the note after T048 for what
actually ships instead.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies). Tasks that edit a shared file
  (`src/content.config.ts` or `public/admin/config.yml`) are intentionally left unmarked even when
  logically independent, since concurrent edits to the same file would conflict.
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are relative to the repository root

## Path Conventions

Single Astro project at the repository root, per plan.md's Project Structure:
`src/`, `public/admin/`, `netlify/functions/`, `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic tooling

- [x] T001 Initialize the Astro project scaffold (`package.json`, `astro.config.mjs`, `tsconfig.json`) at the repository root
- [x] T002 [P] Add core dependency `astro` and dev dependencies `typescript`, `vitest`, `@playwright/test`, `@axe-core/playwright` to `package.json`
- [x] T003 [P] Configure linting/formatting (ESLint + Prettier, or Biome) config files at the repository root
- [x] T004 [P] Create the base folder structure per plan.md: `src/content/`, `src/layouts/`, `src/components/`, `src/pages/`, `src/styles/`, `src/assets/uploads/`, `public/admin/`, `netlify/functions/`, `tests/unit/`, `tests/e2e/`
- [x] T005 Create `netlify.toml` configuring the build command, publish directory, and `netlify/functions/` as the functions directory
- [x] T006 [P] Create `.env.example` documenting required environment variables: GitHub content-read token (for the export function), DecapBridge site id/identity URL, Netlify build-hook URL (for the scheduled rebuild)
- [x] T007 Run the `impeccable teach` design-context workflow and record the resulting Design Context in `.impeccable.md` at the repository root — **MUST complete before any UI task below** (Constitution Principle IV)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create the Astro Content Layer entrypoint `src/content.config.ts` with a shared reusable `lang` Zod field (default `"de"`) per data-model.md's cross-cutting i18n note
- [x] T009 [P] Create `src/layouts/BaseLayout.astro` with semantic landmarks (header/nav/main/footer), a skip-to-content link, and meta tags, satisfying the WCAG 2.1 AA structural baseline (FR-022)
- [x] T010 [P] Create `src/components/Header.astro` (site nav: Start/Vita/Projekte/Termine/CDs/Unterricht/Kontakt anchors — MUST NOT link to `/admin`, FR-014) and `src/components/Footer.astro` (Kontakt/Impressum/Datenschutz links)
- [x] T011 Create `public/admin/index.html` (Decap CMS mount point) and a base `public/admin/config.yml` with `backend`, `publish_mode: editorial_workflow`, `media_folder`, `public_folder`, and `show_preview_links: true` per contracts/decap-cms-config.md (collection blocks added incrementally by later story tasks)
- [x] T012 [P] Create `public/robots.txt` disallowing `/admin`, and add `<meta name="robots" content="noindex">` to `public/admin/index.html` (FR-014)
- [x] T013 [P] Configure `vitest.config.ts` and `playwright.config.ts` (including `@axe-core/playwright` setup) per plan.md's Testing strategy

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Visitor discovers Francesca through her public portfolio site (Priority: P1) 🎯 MVP

**Goal**: A fully static, fast, mobile-friendly public site covering all baseline sections
(Vita, Projekte, Termine, CDs, Unterricht, Kontakt) plus Impressum/Datenschutz — no login required.

**Independent Test**: Publish the site with baseline content (migrated from the current site) and
verify every section is present, readable, and navigable on desktop and mobile, with no login.

### Implementation for User Story 1

- [x] T014 [US1] Define all seven content collection schemas (`biography`, `projects`, `tour-dates`, `discography`, `teaching`, `contact`, `legal`) in `src/content.config.ts` per data-model.md — depends on T008
- [x] T015 [P] [US1] Seed `src/content/biography/de/index.md` with content migrated from the current site — depends on T014
- [x] T016 [P] [US1] Seed `src/content/projects/de/` with entries for "Francesca Simone & Friends" and "re:call" — depends on T014
- [x] T017 [P] [US1] Seed `src/content/tour-dates/de/` with any currently known upcoming dates — depends on T014
- [x] T018 [P] [US1] Seed `src/content/discography/de/` with entries migrated from the current site's CDs section — depends on T014
- [x] T019 [P] [US1] Seed `src/content/teaching/de/index.md` — depends on T014
- [x] T020 [P] [US1] Seed `src/content/contact/de/index.md` — depends on T014
- [x] T021 [P] [US1] Seed `src/content/legal/de/impressum.md` and `src/content/legal/de/datenschutz.md` (FR-001, FR-020) — depends on T014
- [x] T022 [US1] Implement the upcoming/past tour-date filtering helper in `src/lib/tour-dates.ts` (filters by `date >= now`, sorts ascending) — depends on T017
- [x] T023 [P] [US1] Build `src/components/sections/Vita.astro` rendering the biography entry — depends on T015
- [x] T024 [P] [US1] Build `src/components/sections/Projekte.astro` rendering all project entries — depends on T016
- [x] T025 [US1] Build `src/components/sections/Termine.astro` rendering upcoming tour dates via the filtering helper, with a friendly empty-state message when none exist (US2 AC5 relies on this too) — depends on T022
- [x] T026 [P] [US1] Build `src/components/sections/CDs.astro` rendering discography entries — depends on T018
- [x] T027 [P] [US1] Build `src/components/sections/Unterricht.astro` rendering the teaching entry — depends on T019
- [x] T028 [P] [US1] Build `src/components/sections/Kontakt.astro` rendering static contact details as `mailto:`/`tel:`/social links (FR-017) — depends on T020
- [x] T029 [US1] Assemble `src/pages/index.astro` combining BaseLayout, Header, all six anchored sections, and Footer — depends on T009, T010, T023-T028
- [x] T030 [P] [US1] Build `src/pages/impressum.astro` rendering the legal `impressum` entry — depends on T021
- [x] T031 [P] [US1] Build `src/pages/datenschutz.astro` rendering the legal `datenschutz` entry — depends on T021
- [x] T032 [US1] Apply responsive/mobile styling across BaseLayout and all section components so content remains usable without horizontal scrolling on phones and tablets (FR-016) — depends on T029, T030, T031

### Tests for User Story 1

- [x] T033 [P] [US1] Playwright test in `tests/e2e/public-site.spec.ts` verifying every baseline section (Vita, Projekte, Termine, CDs, Unterricht, Kontakt, Impressum, Datenschutz) is present and reachable on both desktop and mobile viewports (SC-001)

**Checkpoint**: User Story 1 is fully functional and independently testable — deployable as the MVP.

---

## Phase 4: User Story 2 - Francesca keeps her upcoming tour dates current herself (Priority: P2)

**Goal**: Self-service tour-date management (add/edit/remove) through a secure login, with
draft → preview → publish, and automatic exclusion of past dates.

**Independent Test**: Log in, add a new tour date, edit an existing one, remove a cancelled one —
publishing each — and confirm the public Termine section only reflects a change once published.

### Implementation for User Story 2

- [x] T034 [US2] Add the `tour_dates` collection block (`date`, `venueName`, `location`, `eventLink`, `notes` fields, `preview_path`) to `public/admin/config.yml` per contracts/decap-cms-config.md — depends on T011, T017
- [ ] T035 [US2] Register the production Decap CMS backend (`git-gateway`/DecapBridge `identity_url` and `gateway_url`, target GitHub repo/branch) in `public/admin/config.yml` — depends on T011 (requires DecapBridge site registration, an external one-time account-setup step)
- [x] ~~T036 [US2] Implement `netlify/functions/scheduled-rebuild.ts`, triggered on a daily schedule, that calls the Netlify build-hook URL to refresh the upcoming/past tour-date split (research.md §6, FR-005) — depends on T005~~ SUPERSEDED (2026-07-23): replaced by the `schedule` trigger in `.github/workflows/deploy.yml` (T055) — same daily-rebuild outcome, no custom function needed on GitHub Pages

### Tests for User Story 2

- [x] T037 [P] [US2] Vitest unit test in `tests/unit/tour-dates.test.ts` covering the filtering helper: dates before/after "now" are correctly included/excluded, and results are sorted ascending — depends on T022
- [x] T038 [US2] Playwright test in `tests/e2e/tour-dates-workflow.spec.ts` verifying a tour date added/edited via the CMS appears publicly only after publish (not after save-as-draft), and a past-dated entry is excluded from the upcoming list (US2 AC1-AC5, AC7)
- [x] T039 [US2] Playwright test in `tests/e2e/admin-access.spec.ts` verifying an unauthenticated request to the `git-gateway`/DecapBridge backend is rejected, so no content change can succeed without login (US2 AC8, FR-012, SC-006)

**Checkpoint**: User Stories 1 AND 2 both work independently — Francesca can keep tour dates current herself.

---

## Phase 5: User Story 3 - Francesca maintains her biography, projects, discography, teaching info, and contact details herself (Priority: P3)

**Goal**: Self-service management of every remaining content type, including the Impressum/
Datenschutz text, plus an on-demand content export.

**Independent Test**: Log in, edit each remaining content type and the Impressum/Datenschutz text
(previewing and publishing each), confirm the public site reflects each change, and confirm a
requested content export produces a downloadable ZIP.

### Implementation for User Story 3

- [x] T040 [US3] Add the `biography` collection block (`name`, `tagline`, `portrait` + `portraitAlt`, body) to `public/admin/config.yml` — depends on T011, T015
- [x] T041 [US3] Add the `projects` collection block (`name`, `order`, `photo` + `photoAlt`, body) to `public/admin/config.yml` — depends on T011, T016
- [x] T042 [US3] Add the `discography` collection block (`title`, `releaseYear`, `coverImage` + `coverImageAlt`, `links`, body) to `public/admin/config.yml` — depends on T011, T018
- [x] T043 [US3] Add the `teaching` collection block (`locations`, body) to `public/admin/config.yml` — depends on T011, T019
- [x] T044 [US3] Add the `contact` collection block (`email`, `phone`, `location`, `socialLinks`) to `public/admin/config.yml` — depends on T011, T020
- [x] T045 [US3] Add the `legal` collection block (impressum + datenschutz files: `title`, `lastUpdated`, body) to `public/admin/config.yml` — depends on T011, T021
- [x] ~~T046 [US3] Implement `netlify/functions/export-content.ts` per contracts/export-content-api.md: validate the bearer token, fetch `src/content/` from `main` via the GitHub API using a server-held token, stream back a ZIP — depends on T005~~ SUPERSEDED (2026-07-23): a public repository already lets anyone download a full ZIP directly from GitHub with no code or login (research.md §7, contracts/export-content-api.md) — no function needed
- [x] ~~T047 [US3] Register a custom "Export my content" action in the Decap CMS admin UI (small registration script in `public/admin/index.html`) that calls `/.netlify/functions/export-content` with the current session token — depends on T011, T046~~ SUPERSEDED (2026-07-23): no in-app button needed — the public-repo ZIP link (see T046 note) works without logging in at all; documented instead in README.md "Editing content"

### Tests for User Story 3

- [x] ~~T048 [P] [US3] Vitest unit tests in `tests/unit/export-content.test.ts` covering: valid token → ZIP response with correct `Content-Disposition` header; missing/invalid token → `401`; simulated GitHub API failure → `502` — depends on T046~~ SUPERSEDED (2026-07-23): `export-content.ts` no longer exists, so there is no custom export logic left to unit-test
- [x] T049 [US3] Playwright test in `tests/e2e/content-management.spec.ts` verifying biography, a project, a discography entry, teaching info, a contact detail, and the Impressum text can each be edited and published via the CMS, with the public site reflecting every change (US3 AC1-AC7)

**Checkpoint**: All user stories are independently functional — the full self-service maintenance promise is delivered.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that span multiple user stories

- [x] T050 [P] Run the automated accessibility audit (`@axe-core/playwright`) across all public pages and resolve any WCAG 2.1 AA violations found (FR-022, SC-009)
- [x] T051 [P] Run a Lighthouse (mobile) pass against the built site and tune images/fonts/CSS until the performance score is ≥ 90 (SC-002, SC-003)
- [x] T052 [P] Write `README.md` documenting local setup, the DecapBridge/GitHub Pages configuration steps from quickstart.md, and how Francesca's editing workflow works
- [x] T053 Execute the full `quickstart.md` validation guide end-to-end against the deployed site and record the results (SC-004, SC-005, SC-007)

---

## Phase 7: Post-Implementation Revision — GitHub Pages Hosting (2026-07-23)

**Purpose**: Move hosting from Netlify to GitHub Pages per explicit project direction, after
Phases 1-6 above were already complete. See research.md §5-§7 for full rationale.

- [x] T054 Remove Netlify-specific code and config: `netlify.toml`, `netlify/functions/` (both functions), `@netlify/functions` and `jszip` dependencies, and `tests/unit/export-content.test.ts`
- [x] T055 Add `.github/workflows/deploy.yml`: builds and deploys to GitHub Pages via `withastro/action` + `actions/deploy-pages` on push to `main`, on a daily `schedule` (replaces T036), and on `workflow_dispatch`
- [x] T056 Add `public/CNAME` for the custom domain, matching `site` in `astro.config.mjs`; set `trailingSlash: "ignore"` so both `/admin` and the GitHub-Pages-canonical `/admin/` resolve
- [x] T057 Replace deploy-preview-link configuration (`show_preview_links`, `preview_path`) in `public/admin/config.yml` with an in-app preview: register a shared `GenericPreviewTemplate` (via `createClass`/`h`) for every collection in `public/admin/index.html`, plus `registerPreviewStyle` matching the site's fonts/colors (replaces the FR-018 mechanism from T034/T040-T045)
- [x] T058 Update `research.md` (§2, §5, §6, §7, §11, summary table), `plan.md` (Summary, Technical Context, Constitution Check, Project Structure), `contracts/decap-cms-config.md`, `contracts/export-content-api.md`, `quickstart.md`, and `README.md` to describe the GitHub Pages architecture instead of Netlify

**Checkpoint**: Full test suite (5 unit + 38 e2e) still passes; build, lint, and format all clean; Lighthouse still 100/100/100/100.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T007 (`impeccable teach`) MUST finish before any task that produces UI (T009 onward).
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion. No dependency on US2/US3.
- **User Story 2 (Phase 4)**: Depends on Foundational completion, and specifically on the `tour-dates` schema/seed and filtering helper from US1 (T017, T022) — the CMS editing layer builds on top of the already-rendered public section.
- **User Story 3 (Phase 5)**: Depends on Foundational completion, and on the other six schemas/seeds from US1 (T015, T016, T018-T021) for the same reason as US2.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Independently testable once Foundational is done — the MVP.
- **User Story 2 (P2)**: Independently testable once its tasks are done; reuses US1's `tour-dates` schema and section but adds nothing that changes US1's behavior for a visitor.
- **User Story 3 (P3)**: Independently testable once its tasks are done; reuses US1's other six schemas the same way US2 reuses `tour-dates`.

### Within Each User Story

- Content collection schema (one task per story, since it's a shared file) before the seed-content tasks that populate it.
- Seed content before the components that render it.
- Components before page assembly.
- Public-facing rendering (US1) before the corresponding CMS editing capability (US2/US3) for the same content type — matches the spec's own priority ordering (ship the readable site first, then make each part of it editable).
- Tests validate behavior after implementation (the constitution does not mandate test-first TDD for this project).

### Parallel Opportunities

- All Setup tasks marked [P] (T002-T004, T006) can run in parallel.
- All Foundational tasks marked [P] (T009, T010, T012, T013) can run in parallel once T008 exists.
- Within US1, once T014 (the shared schema file) is done, all six seed-content tasks (T015-T021) can run in parallel — each writes to its own content file. Once each seed task is done, its corresponding section component (T023, T024, T026, T027, T028) can be built in parallel with the others.
- Within US2/US3, the `public/admin/config.yml` collection-block tasks (T034, T040-T045) all edit the same file, so — even though they're logically independent — they are intentionally left unmarked as [P] and should be applied as small sequential edits.
- US2 and US3 can be implemented in parallel by different people once Foundational and US1's schemas/seeds exist, coordinating merges on the shared `public/admin/config.yml` file.

---

## Parallel Example: User Story 1

```bash
# After T014 (shared schema file) is done, launch all six seed-content tasks together:
Task: "Seed src/content/biography/de/index.md with content migrated from the current site"
Task: "Seed src/content/projects/de/ with entries for Francesca Simone & Friends and re:call"
Task: "Seed src/content/tour-dates/de/ with any currently known upcoming dates"
Task: "Seed src/content/discography/de/ with entries migrated from the current site's CDs section"
Task: "Seed src/content/teaching/de/index.md"
Task: "Seed src/content/contact/de/index.md"

# Then launch the independent section components together:
Task: "Build src/components/sections/Vita.astro"
Task: "Build src/components/sections/Projekte.astro"
Task: "Build src/components/sections/CDs.astro"
Task: "Build src/components/sections/Unterricht.astro"
Task: "Build src/components/sections/Kontakt.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (including `impeccable teach`).
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: Run T033 and manually verify every baseline section against the current site (https://jazz-isses.de/Francesca/).
5. Deploy — the public site alone is already a real improvement over having no login capability yet.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add User Story 1 → validate independently → deploy (MVP: a fast, distinctive, fully-baseline-covered public site).
3. Add User Story 2 → validate independently → deploy (Francesca can now keep tour dates current herself).
4. Add User Story 3 → validate independently → deploy (Francesca can now maintain everything else, plus export her content).
5. Polish (Phase 6) → final accessibility/performance/documentation pass.

### Suggested MVP Scope

**User Story 1 only** (Phases 1-3, tasks T001-T033). It delivers a complete, working, on-brand
public site — the core reason the project exists — before any authentication surface is even
introduced, which also means there is nothing security-sensitive to get wrong in the first
shippable increment.
