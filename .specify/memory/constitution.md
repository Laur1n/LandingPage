<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0
Modified principles:
  - II. Non-Technical Content Ownership — generalized from a single named owner to any site editor
  - IV. Impeccable, Distinctive Design Craft — per-deployment design context, not one artist
  - V. Baseline Continuity → Complete Content Coverage — template framing for new deployments
Added sections: none
Removed sections: none
Templates requiring updates:
  ✅ README.md — rewritten as CMS landing page template guide
  ✅ TEMPLATE.md — new per-deployment customization checklist
Follow-up TODOs: none blocking.
-->

# CMS Landing Page Template — Constitution

## Core Principles

### I. Static-First, Fast & Simple

The public-facing site MUST be built and served as a static site (pre-rendered HTML/CSS/JS
deployed to a static host or CDN); no per-request server rendering or live database query MUST be
required to display any public page. Any dynamic capability — most notably authentication and
content editing — MUST be isolated behind a clearly separated admin surface and MUST NOT degrade
the load speed, reliability, or resilience of the public pages.

Rationale: The audience for a portfolio or professional landing page is bandwidth- and device-diverse
(mobile visitors, press, bookers, clients). A static site guarantees fast loads, near-zero hosting
cost, and high uptime without ongoing server maintenance.

### II. Non-Technical Content Ownership

The site owner (or their delegated editor) MUST be able to log in and independently create, edit,
and remove all editable content — biography, projects, tour dates, discography, teaching info,
photos, contact details, and global site texts — without writing code or involving a developer.
Every piece of content that appears on the public site MUST be backed by a field in the content-editing
area; there MUST be no content that only a developer can change.

Rationale: The explicit purpose of this template is CMS-driven self-maintenance. A feature that still
requires a code change to update text or a date defeats that purpose.

### III. Minimal, Secure Single-Admin Authentication

Because there is exactly one content owner, authentication MUST be a lightweight single-admin login
— NOT a multi-tenant user system, role hierarchy, or public self-registration. Credentials MUST be
hashed at rest, sessions MUST be protected against fixation and CSRF, the admin area MUST NOT be
linked from public navigation or indexable by search engines, and every content-mutating action MUST
require an authenticated session.

Rationale: The security model should match the actual threat surface — one or few trusted,
non-technical users maintaining public marketing content — simple enough to use unassisted, strong
enough to prevent defacement or data loss.

### IV. Impeccable, Distinctive Design Craft

All new UI/visual work MUST be produced using the `impeccable` design skill/workflow and MUST avoid
generic, templated "AI slop" aesthetics (default fonts, cyan-purple gradients, stock card grids,
gratuitous glassmorphism). Design context (audience, brand personality, aesthetic direction) MUST be
established explicitly — via `impeccable teach` — before visual work begins for each deployment,
reflecting the client's actual identity, not genre stereotypes assumed from the codebase alone.
The seed `.impeccable.md` in this repository documents the Francesca Simone reference deployment only.

Rationale: A professional landing page is a public face. A generic, forgettable template undermines
credibility with the intended audience — the opposite of what a portfolio site is for.

### V. Complete Content Coverage (per deployment)

Every section the public site exposes MUST be backed by CMS-editable content before launch. When
adapting this template for a new client, replace all seed/demo content entirely — do not ship
another site's biography, dates, or media. When migrating from an existing site (as in the Francesca
Simone reference implementation documented under `specs/`), the new deployment MUST cover at least
the same information the old site provided unless a feature spec explicitly and intentionally
supersedes a section.

Rationale: Visitors and stakeholders rely on complete, accurate information. A template fork must not
silently drop content the audience depends on, nor leave placeholder copy live.

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
  workflow (Principle IV). This is a one-time setup per deployment and can be reused across features
  on the same site.
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

**Version**: 1.1.0 | **Ratified**: 2026-07-23 | **Last Amended**: 2026-08-01
