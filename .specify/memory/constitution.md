<!--
Sync Impact Report
==================
Version change: (template, unratified) → 1.0.0
Modified principles: n/a (initial ratification, all principles newly defined)
Added principles:
  - I. Static-First, Fast & Simple
  - II. Non-Technical Content Ownership
  - III. Minimal, Secure Single-Admin Authentication
  - IV. Impeccable, Distinctive Design Craft
  - V. Baseline Continuity with the Existing Site
Added sections:
  - Technology & Platform Constraints
  - Content Workflow & Quality Gates
  - Governance
Removed sections: none (first fill of the template placeholders)
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gate reads this file dynamically; no hardcoded principle names to update
  ✅ .specify/templates/spec-template.md — feature-agnostic, no changes required
  ✅ .specify/templates/tasks-template.md — feature-agnostic, no changes required
  ⚠ README.md — does not exist yet; recommend creating one that reflects Principles I-III when the first feature is implemented (not a constitution-governance task, left for follow-up)
Follow-up TODOs: none blocking. Specific hosting provider, static-site framework, and auth implementation are intentionally left open for /speckit-specify and /speckit-plan to resolve per feature.
-->

# MamaLanding Constitution

## Core Principles

### I. Static-First, Fast & Simple

The public-facing site MUST be built and served as a static site (pre-rendered HTML/CSS/JS
deployed to a static host or CDN); no per-request server rendering or live database query MUST be
required to display any public page. Any dynamic capability — most notably authentication and
content editing — MUST be isolated behind a clearly separated admin surface and MUST NOT degrade
the load speed, reliability, or resilience of the public pages.

Rationale: The audience for a touring musician's site is bandwidth- and device-diverse (concertgoers
on mobile, journalists, venue bookers). A static site guarantees fast loads, near-zero hosting cost,
and high uptime without ongoing server maintenance.

### II. Non-Technical Content Ownership

Francesca (the site owner) MUST be able to log in and independently create, edit, and remove all
editable content — biography, project/ensemble descriptions, tour dates, discography, teaching/lesson
information, photos, and contact details — without writing code or involving a developer. Every
piece of content that appears on the public site MUST be backed by a field in the content-editing
area; there MUST be no content that only a developer can change.

Rationale: The explicit purpose of building a login is to make the site self-maintaining. A feature
that still requires a code change to update text or a date defeats that purpose.

### III. Minimal, Secure Single-Admin Authentication

Because there is exactly one content owner, authentication MUST be a lightweight single-admin login
— NOT a multi-tenant user system, role hierarchy, or public self-registration. Credentials MUST be
hashed at rest, sessions MUST be protected against fixation and CSRF, the admin area MUST NOT be
linked from public navigation or indexable by search engines, and every content-mutating action MUST
require an authenticated session.

Rationale: The security model should match the actual threat surface — one trusted, non-technical
user maintaining public marketing content — simple enough for her to use unassisted, strong enough
to prevent defacement or data loss.

### IV. Impeccable, Distinctive Design Craft

All new UI/visual work MUST be produced using the `impeccable` design skill/workflow and MUST avoid
generic, templated "AI slop" aesthetics (default fonts, cyan-purple gradients, stock card grids,
gratuitous glassmorphism). Design context (audience, brand personality, aesthetic direction) MUST be
established explicitly — via `impeccable teach` — before visual work begins, reflecting Francesca
Simone's actual artistic identity (Italian, jazz/pop, warm and expressive), not genre stereotypes
assumed from the codebase alone.

Rationale: This is a professional artist's public face. A generic, forgettable template undermines
credibility with venues, press, students, and audiences — the opposite of what a portfolio site is
for.

### V. Baseline Continuity with the Existing Site

The current live site (https://jazz-isses.de/Francesca/) is the content and information baseline:
biography/Vita, projects/ensembles (e.g. "Francesca Simone & Friends", "re:call"), upcoming
dates/Termine, discography/CDs, teaching/Unterricht, and contact/Kontakt. The new site MUST cover at
least this same information unless a feature spec explicitly and intentionally supersedes a section.

Rationale: Existing visitors, venues, and students rely on this information being present. A rebuild
must not silently drop content the audience depends on.

## Technology & Platform Constraints

- The site MUST be deployable as static output (e.g., static-site generation or export) to a static
  host/CDN. Any backend needed strictly for authentication and content persistence MUST be minimal
  and MUST NOT require the public pages themselves to be served dynamically.
- Content MUST be stored in a structured, versionable form (e.g., a database or structured content
  files) that the static build reads from. Saving an edit MUST result in the public site reflecting
  the change via an automatic rebuild/redeploy or an equivalent refresh mechanism — never a manual
  developer step.
- The content data model MUST at minimum support the language already published on the existing site
  (German) and MUST NOT hard-code assumptions that would block adding Italian or English content
  later.
- Images, audio samples, and other media MUST be delivered in optimized, responsive formats
  appropriate for a static site; unoptimized full-resolution assets MUST NOT be served directly.

## Content Workflow & Quality Gates

- Before implementing any new UI surface, design context MUST be established per the `impeccable`
  workflow (Principle IV). This is a one-time setup per project and can be reused across features.
- Automated tests are not required for static marketing pages, but authentication and
  content-persistence logic (login, and create/update/delete of content) MUST have basic tests
  covering the success path and at least one failure/security path (e.g., rejecting unauthenticated
  writes).
- Every feature plan MUST verify it does not reintroduce a public-facing dynamic dependency that
  Principle I forbids, and MUST verify it preserves or intentionally supersedes baseline content per
  Principle V.

## Governance

This constitution supersedes ad hoc technical decisions for this project. Amending it requires: (1)
editing this file, (2) recording the change in the Sync Impact Report at the top of this file, and
(3) bumping the version per semantic versioning — MAJOR for removing or redefining a principle, MINOR
for adding a principle or materially expanding guidance, PATCH for wording/clarification only. Every
feature plan produced via `/speckit-plan` MUST include a Constitution Check section verifying
alignment with the principles above before implementation begins; unresolved violations MUST be
justified in that plan's Complexity Tracking section or the plan MUST be revised.

**Version**: 1.0.0 | **Ratified**: 2026-07-23 | **Last Amended**: 2026-07-23
