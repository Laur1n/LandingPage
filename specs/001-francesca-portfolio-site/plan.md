# Implementation Plan: Francesca Simone Portfolio Site with Self-Service Content Login

**Branch**: `001-francesca-portfolio-site` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-francesca-portfolio-site/spec.md`

## Summary

A static portfolio site for Francesca Simone (Italian jazz/pop singer, songwriter, and vocal
teacher) built with Astro, covering biography, projects/ensembles, tour dates, discography,
teaching, contact, and a legal notice/privacy page — matching or exceeding the current
https://jazz-isses.de/Francesca/. Francesca maintains all of this content herself through Decap
CMS at `/admin/`, authenticated via DecapBridge, using Decap's Editorial Workflow to save a draft,
preview it in-app, and publish it live — all without a developer or any manual deployment step.
Content is stored as versioned Markdown/YAML files in a public GitHub repo (no database) and
hosted on GitHub Pages, with a GitHub Actions workflow that rebuilds and redeploys on every
publish plus once daily on a schedule to keep the tour-dates list accurate without reintroducing
server rendering.

## Technical Context

**Language/Version**: TypeScript (Astro 7, Node.js 22 LTS for tooling/build)

**Primary Dependencies**: Astro 7 (`astro:content`), Decap CMS (admin/editing UI,
`publish_mode: editorial_workflow`), DecapBridge (auth/user-management backend for Decap CMS)

**Storage**: Git-tracked Markdown/YAML content files read via Astro Content Collections; no
database (see [research.md](./research.md) §4)

**Testing**: Vitest (unit tests for the date-filtering helper) + Playwright with
`@axe-core/playwright` (end-to-end + accessibility checks on the built site)

**Target Platform**: Web — GitHub Pages (static hosting + CDN), built and deployed by a GitHub
Actions workflow; no server-side compute of any kind (see research.md §5/§7)

**Project Type**: Single static web project (Astro site + `/admin/` CMS mount) — no
separate frontend/backend split, and no serverless functions

**Performance Goals**: Lighthouse performance score ≥ 90 (mobile) on primary pages; main content
visible within 2s on a typical mobile connection (SC-003); next concert date locatable within 10s
of landing on the homepage (SC-002)

**Constraints**: Public pages MUST be static/pre-rendered (Constitution I); authentication MUST
stay single-admin with no custom credential storage (Constitution III); public site and admin UI
MUST meet WCAG 2.1 AA (FR-022); admin surface MUST be unlinked from public nav and non-indexable
(FR-014)

**Scale/Scope**: Single content owner, ~7 content sections, an expected content volume in the
tens of entries (tour dates, projects, discography) at any given time — a personal/professional
portfolio site, not a high-traffic or multi-tenant product

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle / Constraint                                          | Check                                                                                                                                                                                                                                                                                                                                              | Result                                    |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| I. Static-First, Fast & Simple                                  | All public pages are Astro build-time output; `/admin/` (Decap CMS) is a separate client-side surface talking directly to DecapBridge/GitHub — no server-rendered public page introduced, and GitHub Pages cannot serve one even if we wanted to. Scheduled rebuild (research.md §6) keeps output static rather than adding per-request rendering. | PASS                                      |
| II. Non-Technical Content Ownership                             | Every FR-004…FR-011, FR-017, FR-020 content type has a corresponding Decap CMS collection (data-model.md); nothing on the public site is developer-only.                                                                                                                                                                                           | PASS                                      |
| III. Minimal, Secure Single-Admin Auth                          | DecapBridge provides single-admin, invite-based login with self-service password reset (FR-015); no custom credential storage/session code to build or secure; `/admin/` excluded from nav/sitemap/robots (FR-014).                                                                                                                                | PASS                                      |
| IV. Impeccable, Distinctive Design Craft                        | Astro imposes no CMS-driven theming — full creative control for the `impeccable` workflow. Design-context gathering (`impeccable teach`) is scheduled as the first implementation task, before any UI task.                                                                                                                                        | PASS (process gate carried into tasks.md) |
| V. Baseline Continuity                                          | data-model.md's collections cover every current-site section plus the previously-missing Impressum/Datenschutz (added during `/speckit-clarify`).                                                                                                                                                                                                  | PASS                                      |
| Tech constraint: static-deployable                              | GitHub Pages static hosting + Astro static output, deployed via GitHub Actions.                                                                                                                                                                                                                                                                    | PASS                                      |
| Tech constraint: structured/versionable content                 | Git-tracked Markdown/YAML is inherently versioned.                                                                                                                                                                                                                                                                                                 | PASS                                      |
| Tech constraint: i18n-ready data model                          | Every collection schema includes a `lang` field (research.md §10).                                                                                                                                                                                                                                                                                 | PASS                                      |
| Tech constraint: optimized media                                | Decap `image` widget + plain `<img loading="lazy">`; see research.md §8 for why full `astro:assets` variant generation was deferred.                                                                                                                                                                                                               | PASS                                      |
| Workflow gate: design-context-first                             | `impeccable teach` scheduled before UI build tasks.                                                                                                                                                                                                                                                                                                | PASS                                      |
| Workflow gate: pragmatic testing on auth/content-mutation logic | Vitest + Playwright scoped to date filtering and admin-access checks (research.md §11).                                                                                                                                                                                                                                                            | PASS                                      |

No violations identified. Complexity Tracking table below is left empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-francesca-portfolio-site/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
astro.config.mjs
package.json
tsconfig.json

src/
├── content.config.ts        # Astro Content Collections schema (Zod) — see data-model.md
├── content/                 # Git-tracked content files Decap CMS reads/writes
│   ├── biography/de/
│   ├── projects/de/
│   ├── tour-dates/de/
│   ├── discography/de/
│   ├── teaching/de/
│   ├── contact/de/
│   └── legal/de/            # impressum + datenschutz entries
├── layouts/
├── components/
├── pages/
│   ├── index.astro          # Single-page site: hero + anchored sections (Vita, Projekte, Termine, CDs, Unterricht, Kontakt)
│   ├── impressum.astro
│   └── datenschutz.astro
└── styles/

public/
├── admin/
│   ├── index.html           # Decap CMS mount point + in-app preview templates (research.md §2)
│   └── config.yml           # Decap CMS collections config (publish_mode: editorial_workflow)
├── uploads/                  # Images uploaded via Decap CMS's image widget (research.md §8)
├── CNAME                     # Custom domain for GitHub Pages (research.md §5)
└── robots.txt                # Disallow /admin/; admin also carries <meta name="robots" content="noindex">

.github/
└── workflows/
    └── deploy.yml            # Build + deploy to GitHub Pages on push and on a daily schedule (research.md §5/§6)

tests/
├── unit/                    # Vitest: date-filtering helper
└── e2e/                     # Playwright + axe-core: public sections render, /admin auth + noindex, unauthenticated writes rejected
```

**Structure Decision**: Single Astro project at the repository root (no separate frontend/backend
split, and no serverless functions — Decap CMS is a static client-side admin bundle served from
`public/admin/`). This directly maps to data-model.md's collections and satisfies Constitution
Principle I by keeping 100% of visitor-facing pages as pre-rendered static output, deployed
entirely through GitHub Pages + GitHub Actions.

## Complexity Tracking

_No Constitution Check violations were identified — this section intentionally left without
entries._
