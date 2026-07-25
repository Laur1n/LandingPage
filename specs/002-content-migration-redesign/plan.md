# Implementation Plan: Full Content Migration & Design Overhaul

**Branch**: `002-content-migration-redesign` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-content-migration-redesign/spec.md`

## Summary

Bring 100% of the old site's content (https://jazz-isses.de/Francesca/ — 9 pages, per
[content-inventory.md](./content-inventory.md)) onto the existing Astro + Decap CMS site as
CMS-editable content, restructure the site as a hybrid (rich scrolling landing page + one dedicated
subpage per content area, including a new "Canzoni italiane" program page), and execute a
showcase-level design overhaul in the decided "warm editorial minimal" direction with scroll-driven
storytelling (GSAP ScrollTrigger), self-hosted fonts, and hard performance/accessibility/
reduced-motion guardrails.

## Technical Context

**Language/Version**: TypeScript / Node.js 22 (existing), Astro 7.1 static output

**Primary Dependencies**: Astro 7 (existing), sharp (existing, image pre-processing), Decap CMS
via CDN in `public/admin/` + DecapBridge auth (existing), **GSAP 3 + ScrollTrigger (new — scroll
choreography)**, **@fontsource packages (new — self-hosted Bodoni Moda & Hanken Grotesk,
replacing the Google Fonts CDN link)**

**Storage**: Markdown/YAML files under `src/content/` (Astro content collections, git-versioned,
edited via Decap CMS); media in `public/uploads/` (Decap media folder)

**Testing**: Vitest (unit — tour-date filtering/grouping, content helpers), Playwright +
@axe-core/playwright (e2e — content presence per inventory, navigation, reduced-motion, no-JS
content visibility, a11y)

**Target Platform**: Static build on GitHub Pages (custom domain francesca-simone.com), GitHub
Actions deploy incl. existing daily scheduled rebuild

**Project Type**: Static web site (content + presentation), single project

**Performance Goals**: LCP ≤ 2.5 s on mid-range mobile / Slow-4G (SC-003); CLS < 0.1 (animations
must not shift layout, FR-013); scroll animations on compositor only (transform/opacity), no
long tasks > 100 ms from animation init; total JS budget ≤ ~70 KB gzip (GSAP core + ScrollTrigger
≈ 40 KB gzip + site scripts)

**Constraints**: No third-party requests on page load (fonts self-hosted; YouTube/SoundCloud as
outbound links only — FR-017, keeps the site consent-banner-free); `prefers-reduced-motion`
honored (FR-014); 100% content visible without JavaScript (FR-014); every visible string/asset
CMS-editable (FR-010, constitution II); German-only content, i18n-ready schemas (constitution)

**Scale/Scope**: 10 public routes (landing, 6 area subpages, ≥1 program page, 2 legal pages);
~35 content entries incl. 6 CD entries, 10 migrated tour dates, ~10 PDFs, ~8 images; dates
archive grows ~5–10 entries/year

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| #   | Principle                              | Verdict               | Evidence / conditions                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | -------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I   | Static-First, Fast & Simple            | ✅ PASS               | All new pages pre-rendered by Astro static build. GSAP runs client-side as progressive enhancement only; content readable with JS disabled. Removing the Google Fonts CDN dependency _improves_ load independence. No server/dynamic dependency added.                                                                                                                                                               |
| II  | Non-Technical Content Ownership        | ✅ PASS               | Every migrated text/image/PDF/date/link maps to a Decap CMS field (see [contracts/decap-cms-config-delta.md](./contracts/decap-cms-config-delta.md)). New structures (programs, flyers, info PDFs, members, archive) are folder/file collections with `create: true` where lists grow. No developer-only content introduced (design tokens/animation timing are code, not content — they don't render as text).      |
| III | Minimal, Secure Single-Admin Auth      | ✅ PASS               | No auth changes. Existing DecapBridge single-admin flow untouched.                                                                                                                                                                                                                                                                                                                                                   |
| IV  | Impeccable, Distinctive Design Craft   | ✅ PASS (with action) | Design context already established in `.impeccable.md` (impeccable teach, feature 001) and is consistent with the clarified "warm editorial minimal" direction. **Action**: its Motion section must be extended for showcase-level scroll choreography (contract: [contracts/motion.md](./contracts/motion.md)) before UI work; bans (no glassmorphism, no gradient text, no icon-card grids…) carry over unchanged. |
| V   | Baseline Continuity with Existing Site | ✅ PASS               | This feature _is_ the baseline-continuity feature: [content-inventory.md](./content-inventory.md) is the auditable checklist; FR-001…FR-009 cover every old-site page.                                                                                                                                                                                                                                               |

Constitution quality gates:

- **Tests for content logic**: tour-date upcoming/archive grouping gets unit tests (extends
  existing `tests/unit` for `src/lib/tour-dates.ts`); e2e content-presence + a11y tests extend
  existing Playwright suite. Auth untouched → no new auth tests required.
- **No public dynamic dependency reintroduced**: fonts move from CDN to self-hosted (removes one);
  GSAP is bundled locally via npm, not a CDN script.
- **Media optimized**: harvested images pre-sized (sharp script) before commit; existing upload
  pipeline unchanged (accepted in 001).

**Initial gate result: PASS — no violations, Complexity Tracking not required.**

**Post-Phase-1 re-check (2026-07-24): PASS.** The design artifacts introduce no violations:
data-model.md keeps every new structure CMS-backed with build-safe defaults (II); routes.md keeps
all routes statically pre-rendered and removes the last third-party load-time dependency, Google
Fonts (I); motion.md subordinates every showcase scene to no-JS/reduced-motion/CLS guardrails and
the design-context bans (IV); routes.md's MUST-show tables are generated from the old-site
inventory (V). Auth untouched (III).

## Project Structure

### Documentation (this feature)

```text
specs/002-content-migration-redesign/
├── plan.md                          # This file
├── content-inventory.md             # Old-site content capture (created by /speckit-specify)
├── research.md                      # Phase 0 output
├── data-model.md                    # Phase 1 output
├── quickstart.md                    # Phase 1 output
├── contracts/
│   ├── decap-cms-config-delta.md    # CMS collections/fields contract (delta to 001 contract)
│   ├── routes.md                    # Page/URL contract with per-route content obligations
│   └── motion.md                    # Scroll-choreography contract (scenes, triggers, guardrails)
└── tasks.md                         # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── content.config.ts                # EXTEND: new fields + new `programs` collection
├── content/
│   ├── biography/de/index.md        # EXTEND: full Vita text, teaser, 2nd portrait, pull quote
│   ├── projects/de/*.md             # EXTEND: full descriptions, members, links, flyers, program names
│   ├── programs/de/canzoni-italiane.md   # NEW collection + entry (program page)
│   ├── discography/de/*.md          # REPLACE placeholder with 6 real CD entries (+ info PDFs)
│   ├── tour-dates/de/*.md           # ADD 10 migrated dates (2023–2026)
│   ├── teaching/de/index.md         # EXTEND: full offer, methods, scheduling, since-1994
│   ├── contact/de/index.md          # EXTEND: mobile number, invitation text
│   ├── legal/de/impressum.md        # RECONCILE with old-site legal data + photo credit
│   └── site/de/index.md             # EXTEND: labels for subpages, archive, downloads, teasers
├── layouts/BaseLayout.astro         # CHANGE: self-hosted fonts, motion script slot
├── components/
│   ├── Header.astro / Footer.astro  # CHANGE: nav works from subpages (not only anchors)
│   ├── sections/*.astro             # REFACTOR: become landing teaser sections
│   └── (new) blocks/                # NEW: subpage building blocks (hero, prose, quote,
│                                    #      lineup, cd-card, date-list, download-link, …)
├── pages/
│   ├── index.astro                  # REDESIGN: scrolling overview with teasers
│   ├── vita.astro                   # NEW
│   ├── projekte.astro               # NEW
│   ├── termine.astro                # NEW (upcoming + year-grouped archive)
│   ├── cds.astro                    # NEW
│   ├── unterricht.astro             # NEW
│   ├── kontakt.astro                # NEW
│   ├── [program].astro              # NEW: dynamic route from `programs` → /canzoni-italiane/
│   └── impressum.astro / datenschutz.astro   # RESTYLE only
├── scripts/
│   └── scroll-story.ts              # NEW: GSAP/ScrollTrigger init, matchMedia reduced-motion
├── styles/
│   ├── tokens.css                   # EXTEND: motion tokens; palette per .impeccable.md
│   └── global.css                   # EXTEND: redesign foundations
└── lib/
    ├── tour-dates.ts                # EXTEND: past-archive grouping by year
    └── site-texts.ts                # EXTEND: new label groups

public/
├── admin/config.yml                 # EXTEND: new/changed collections & fields (contract delta)
├── admin/index.html                 # EXTEND: preview templates for new collections
├── fonts/                           # NEW (or node_modules via @fontsource imports)
└── uploads/                         # ADD: harvested images + PDFs (pre-sized)

scripts/
└── harvest-old-site.mjs             # NEW (dev-only): download assets + extract exact link URLs

tests/
├── unit/                            # EXTEND: archive grouping, site-texts fallbacks
└── e2e/                             # EXTEND: per-route content-presence (inventory audit),
                                     #         nav, reduced-motion, no-JS, axe on all routes
```

**Structure Decision**: Single Astro project (existing). New subpages are file-based routes; the
program page is a dynamic route generated from the new `programs` folder collection so the owner
can add future program pages herself (FR-012). Landing sections are refactored into teasers that
link to the full subpages (Clarification: hybrid IA).

## Complexity Tracking

No constitution violations — table not required. (GSAP is a new runtime dependency, justified in
[research.md §1](./research.md): showcase-level pinning/scrubbing is impractical to hand-roll and
native CSS scroll-driven animations lack cross-browser support; it does not violate any principle
because it is a progressive enhancement on a fully static page.)
