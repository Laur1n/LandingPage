# Phase 0 Research: Francesca Simone Portfolio Site

**Feature**: [spec.md](./spec.md) | **Date**: 2026-07-23

This document resolves every open technical decision needed to satisfy the spec's functional
requirements within the constitution's constraints (static-first, non-technical self-service
editing, minimal single-admin auth, WCAG 2.1 AA, impeccable design). Format per decision:
Decision / Rationale / Alternatives considered.

## 1. Static site framework

**Decision**: Astro (v7, current stable line as of July 2026 — v7.0 shipped June 22, 2026, v7.1 on
July 16, 2026, requiring Node.js 22+; the Content Collections API used below is unchanged from the
v6 line).

**Rationale**: Astro's default output is fully static HTML with zero client-side JS unless
explicitly opted into ("islands"), which is the closest match to Constitution Principle I of any
mainstream framework. Astro Content Collections (`src/content.config.ts`, build-time `glob()`/
`file()` loaders, Zod-validated schemas) give a typed, file-based content model that maps directly
onto a git-based CMS (see §2) with zero database. It has first-class built-in image optimization
(`astro:assets`) satisfying the constitution's media-optimization constraint, and no opinionated
component framework is forced on us — full creative freedom for the `impeccable` design pass
(Principle IV).

**Alternatives considered**:

- _Next.js (static export)_ — capable, but its ecosystem defaults toward server rendering/ISR,
  making it easier to accidentally reintroduce a public-facing dynamic dependency (Principle I
  violation risk). Astro's static-by-default posture is a better guardrail for this project.
- _Eleventy / Hugo_ — equally static-first and viable, but weaker built-in image pipeline and
  component ergonomics than Astro for a visually distinctive, animation-friendly design (Principle
  IV). Astro's islands architecture gives room for tasteful motion without sacrificing the static
  baseline.

## 2. Non-technical content editing (the "login")

**Decision**: Decap CMS (open-source, git-based headless CMS), mounted at `/admin`, with
`publish_mode: editorial_workflow` enabled.

**Rationale**: Decap CMS is purpose-built for exactly this scenario — a non-technical owner
editing a static site's content with no developer in the loop. It provides a ready-made login UI,
typed content-editing forms (string/text/markdown/image/list/datetime/relation widgets covering
every field in our data model), and — critically — an **Editorial Workflow** mode that natively
implements draft → preview → publish (FR-018/FR-019) without any custom code:

- _Save_ commits to a draft branch (`cms/<collection>/<slug>`) and opens a pull request.
- _Preview_ renders the entry in-app, inside the admin screen itself, via a registered preview
  template (see §5 — GitHub Pages has no per-branch deploy-preview URL for Decap CMS to link to,
  unlike Netlify/Vercel/Cloudflare Pages).
- _Publish_ merges the pull request into the production branch, triggering the real deploy.

This means "draft," "preview," and "publish" are not concepts we build — they fall directly out of
adopting Decap CMS's existing workflow, minimizing custom code and the security surface the
constitution asks us to keep minimal (Principle III).

**Alternatives considered**:

- _TinaCMS_ — also git-backed with visual editing, a reasonable second choice, but its hosted
  tier/self-hosting story is less mature for a one-off personal project than Decap's fully
  open-source, no-required-SaaS model.
- _Headless CMS with hosted database (Sanity, Contentful, Storyblok)_ — would work, but
  introduces a third-party database/API as the source of truth (extra account, extra vendor risk,
  monthly cost beyond free tiers at scale) where a git repository already suffices for this
  content volume, and it would sacrifice "content is versioned automatically" (git history) for
  free.
- _Custom-built admin panel_ — would require us to build and maintain authentication, session
  security, a database, and a draft/publish model from scratch. Directly conflicts with
  Principle III's intent to keep the security surface minimal; rejected.

## 3. Authentication backend for Decap CMS

**Decision**: DecapBridge (a hosted authentication/user-management service built specifically for
Decap CMS) as the `git-gateway`-compatible backend, e.g.:

```yaml
backend:
  name: git-gateway
  repo: <owner>/<repo>
  branch: main
  identity_url: https://auth.decapbridge.com/sites/<site-id>
  gateway_url: https://gateway.decapbridge.com
```

**Rationale**: FR-015 requires Francesca to self-service a password reset with zero developer
involvement, and Principle III asks for a minimal, secure single-admin login we don't have to
build. DecapBridge is explicitly designed for this: she gets an emailed invite, can log in with
Google/Microsoft or a password, and can reset her own password — all without a GitHub account or
any of our intervention. It also decouples CMS auth from the hosting platform, so a future hosting
change doesn't require re-plumbing authentication.

**Alternatives considered**:

- _Netlify Identity + Git Gateway_ — Netlify deprecated this in late 2025 and then reversed the
  deprecation on 2026-02-19, so it is technically usable again. Given it already had one
  deprecation scare, it carries more roadmap risk for a project with no ongoing maintenance
  budget. Documented here as the fallback if the project ever needs to drop the DecapBridge
  dependency and consolidate entirely on Netlify's own stack.
- _Custom OAuth2/PKCE against a provider like Auth0 or Cognito_ — Decap CMS supports this
  directly, but it requires us to stand up and configure an OAuth application/tenant ourselves,
  which is exactly the kind of ongoing technical maintenance this project wants to avoid for a
  non-technical, unsupported owner.
- _GitHub/GitLab OAuth directly_ — would require Francesca to have and use a GitHub account,
  which conflicts with "non-technical" (FR-003) more than an email/password or Google/Microsoft
  login does.

## 4. Content storage model

**Decision**: Content lives as Markdown/YAML files inside the git repository (read by Astro
Content Collections at build time); no external database.

**Rationale**: This is the natural consequence of choosing a git-based CMS (§2) and gives us, for
free: full version history of every edit (satisfies FR-021's export need and doubles as an audit
trail), zero database to provision/pay for/secure, and a data model that is trivially portable if
the project ever needs to migrate hosts or frameworks.

**Alternatives considered**: A managed database (Postgres/SQLite-as-a-service) was considered and
rejected — it would need its own backup story, its own auth-to-database layer, and buys us nothing
a git repo doesn't already provide at this content volume (a handful of content types, likely
under 100 entries total).

## 5. Hosting & deployment

**Decision**: GitHub Pages, built and deployed via a GitHub Actions workflow
(`.github/workflows/deploy.yml`) using `withastro/action` + `actions/deploy-pages`, serving a
custom domain (`public/CNAME`).

**Rationale**: Chosen for zero hosting cost and to keep the entire project inside a single
platform (GitHub) that already hosts the content repository DecapBridge talks to. GitHub Actions
natively supports the two triggers this project needs: `push` to `main` (deploy on publish) and
`schedule` (the daily tour-date-freshness rebuild, §6) — no external cron service or build-hook
URL required, unlike the Netlify-based version of this decision.

**Trade-off accepted**: GitHub Pages has no per-branch/PR deploy-preview deployments the way
Netlify, Vercel, or Cloudflare Pages do, so Decap CMS's "Deploy Preview Links" feature (which
would otherwise satisfy FR-018 with a live URL matching production exactly) is not available.
This is resolved in §2 by using Decap CMS's built-in in-app preview pane (a registered React
preview template rendered inside the admin screen) instead — a close-enough, if not pixel-perfect,
approximation that still lets Francesca sanity-check a change before publishing it.

**Alternatives considered**:

- _Netlify / Cloudflare Pages / Vercel_ — any of these would restore true deploy-preview URLs
  (see the trade-off above) and were the original choice; moved away from per explicit project
  direction to consolidate hosting on GitHub and avoid a second platform account.
- _A separate preview-hosting workaround (e.g., publish each PR's build to a `preview/<pr-number>/`
  subpath on the same GitHub Pages site)_ — technically possible via a second Actions workflow,
  but adds meaningful CI complexity for a benefit (pixel-perfect preview) the in-app preview pane
  already covers well enough for a solo non-technical editor. Rejected as disproportionate.

**Related sub-decision — supporting both the default GitHub Pages URL and the custom domain**:
`astro.config.mjs` sets `site` to the custom domain and leaves `base` unset, per Astro's own
guidance, so every internal asset link is root-relative (correct once the custom domain is live,
at `/`). That means visiting the interim default URL
(`https://<user>.github.io/<repo>/`) directly would 404 every CSS/font/image, since those
root-relative links resolve against the wrong root. Astro's `base` config cannot fix both roots
simultaneously from one build (setting it fixes the subpath but breaks the custom domain, and
vice versa — this is Astro's documented, intentional behavior, not a bug). Instead,
`BaseLayout.astro` includes a tiny inline script, first in `<head>`, that redirects visitors
hitting the exact default GitHub Pages hostname to the equivalent path on the custom domain. Both
URLs work for a visitor; only one of them is ever the one actually serving root-relative assets.

## 6. Keeping "upcoming" tour dates accurate without manual rebuilds (resolving FR-005)

**Decision**: In addition to rebuilding on every published content change (which happens
automatically via the `push` trigger in `.github/workflows/deploy.yml`, per §5), the same workflow
also runs once a day on a `schedule` trigger (`cron: "0 3 * * *"`).

**Rationale**: The site rebuilds automatically whenever Francesca publishes a change — but a tour
date can silently "expire" (its date/time passes) on a day when nothing else is edited, and a
purely static site has no way to notice that on its own. Rather than compromise Principle I by
making the tour-dates page server-rendered per request, a single scheduled rebuild per day
refreshes the upcoming/past split for everyone while every page remains 100% static output.
Daily granularity is more than sufficient — nobody expects a concert listing to disappear the
instant it starts, only to stop being advertised as "upcoming" within about a day. GitHub Actions'
native `schedule` trigger makes this a few lines of YAML rather than a separate function/cron
service.

**Alternatives considered**:

- _Render the tour-dates section with on-demand/server rendering (or an Astro Live Content
  Collection)_ — would keep the list perfectly live, but reintroduces per-request server
  rendering for a public page, which Principle I explicitly forbids without justification, and
  GitHub Pages cannot serve on-demand-rendered routes at all regardless. A once-daily scheduled
  static rebuild achieves the same practical outcome (FR-005's "automatically, without her needing
  to delete it manually") without that trade-off, so this was rejected as unnecessary
  complexity/constitutional risk for no material user benefit.
- _Client-side JS filtering of dates at page load_ — would keep the build static but risks a
  flash of stale content and makes the correct list depend on JavaScript executing, which sits
  awkwardly next to the WCAG 2.1 AA goal (FR-022) of content being correct without relying on
  client script. Rejected in favor of the scheduled-rebuild approach.

## 7. Content export/backup (resolving FR-021)

**Decision**: No custom code. Since GitHub Pages' free tier requires a public repository (§5),
and content lives as files in that repository (§4), anyone — including Francesca, without a
GitHub account or logging into anything — can already download a complete ZIP of the entire
project (not just the content folder) from GitHub's own
`https://github.com/<owner>/<repo>/archive/refs/heads/main.zip` URL.

**Rationale**: This is strictly simpler than the alternative and was only not the original design
because the project initially assumed a private-repo-friendly host (Netlify) where a custom
function was needed to bridge the "Francesca has no GitHub account" gap. A public repository
removes that gap entirely: GitHub itself serves the ZIP, no authentication, no server-held token,
no function to maintain or test. It also backs up more than just `src/content/` (the whole
project), which is a strictly stronger backup guarantee, not a weaker one.

**Alternatives considered**: A dedicated serverless function (the original Netlify-based design)
was rejected once hosting moved to GitHub Pages, since GitHub Pages itself has no serverless
compute — standing up a function on a _third_ platform (e.g., Cloudflare Workers) purely for this
one capability would add an account and a maintenance surface for something GitHub already does
natively once the repo is public.

## 8. Image handling

**Decision**: Decap CMS's built-in `image` widget stores uploads directly under
`public/uploads/`, matching `public_folder: "/uploads"`, and rendered via plain `<img>` tags with
`loading="lazy"`, `decoding="async"`, and required `alt` text enforced at the schema level.

**Rationale**: This is the simplest correct integration between a git-based CMS and a static site
— no glob-based lookup is needed to resolve a Decap-stored path back to an Astro-processed asset,
since the served path and the stored path are identical. It satisfies the accessibility half of
FR-011/FR-022 (required alt text) immediately. Full build-time responsive-variant generation via
`astro:assets` (srcset/multiple formats) is a reasonable fast-follow enhancement once real photos
exist, but is not required to satisfy any FR or SC in this spec, so it is intentionally deferred
rather than adding glob-resolution complexity to the first implementation.

**Alternatives considered**: Routing uploads through `src/assets/` so `astro:assets` could
generate responsive variants was the original plan, but requires a dynamic
`import.meta.glob`-based lookup from a Decap-stored string path to an Astro-imported image module
— meaningfully more complexity for a benefit (multi-format/multi-size variants) this project's
scale doesn't yet need. A hosted image CDN (Cloudinary, Cloudflare Images) was also considered and
rejected for the same reason as before — another account for a non-technical owner to never touch.

## 9. Accessibility approach (resolving FR-022)

**Decision**: Target WCAG 2.1 Level AA through semantic Astro markup (landmarks, heading order,
required `alt` text fields enforced by the content schema, visible focus states, sufficient color
contrast per the `impeccable` color guidelines), verified with automated `axe-core`/Lighthouse
checks run in CI against the built site.

**Rationale**: Matches the clarified success criterion (SC-009) with a concrete, testable
mechanism rather than best-effort intent alone.

**Alternatives considered**: Manual-only accessibility review was rejected as insufficient to
catch regressions over time on a site with no dedicated ongoing QA.

## 10. Internationalization readiness

**Decision**: Ship German-only content for v1 (per spec Assumptions), but define every Content
Collection schema with an explicit `lang` field (default `"de"`) and folder-per-locale-ready
structure (e.g., `src/content/tour-dates/de/...`), even though only `de/` is populated at launch.

**Rationale**: Satisfies the constitution's "MUST NOT hard-code assumptions that would block
adding Italian or English content later" without spending v1 effort on translation UI or content.

**Alternatives considered**: Omitting the `lang` field entirely and retrofitting later was
rejected — restructuring content collections after real content exists is exactly the kind of
rework the constitution asks us to avoid.

## 11. Testing strategy

**Decision**:

- **Vitest** for unit-testing the one piece of custom logic we own: the upcoming/past
  date-filtering helper (§6). (An earlier Netlify-hosted design also unit-tested a custom
  export-content function; that function no longer exists per the revised §7.)
- **Playwright** for a small end-to-end suite covering: (a) every baseline public section renders
  reachable content (Principle V / SC-001), (b) the `/admin` route requires authentication and is
  excluded from `robots.txt`/sitemap (Principle III / FR-014), and (c) an unauthenticated request
  to Decap CMS's backing API is rejected (FR-012/SC-006).
- **axe-core** (via `@axe-core/playwright`) integrated into the Playwright suite for automated
  WCAG 2.1 AA checks (§9).

**Rationale**: Matches the constitution's pragmatic testing gate exactly — no tests required for
static marketing content itself, but the auth/content-mutation-adjacent logic we actually wrote
gets covered.

**Alternatives considered**: Full TDD across the whole codebase was rejected as disproportionate
for a static personal/professional portfolio site with a single non-technical stakeholder, per
Constitution's Content Workflow & Quality Gates section.

## Summary of resolved unknowns

| Area                | Resolution                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------- |
| Framework           | Astro 7                                                                                   |
| CMS / login         | Decap CMS, `publish_mode: editorial_workflow`, mounted at `/admin/`                       |
| CMS auth backend    | DecapBridge (`git-gateway`-compatible)                                                    |
| Content storage     | Git-tracked Markdown/YAML files, no database                                              |
| Hosting/CI          | GitHub Pages, built and deployed via GitHub Actions (`withastro/action` + `deploy-pages`) |
| Draft preview       | In-app preview pane (Decap CMS `registerPreviewTemplate`), not a deploy-preview URL       |
| Tour-date freshness | Auto rebuild on publish + one scheduled GitHub Actions rebuild/day                        |
| Content export      | No custom code — public-repo ZIP download directly from GitHub                            |
| Images              | Decap `image` widget, served from `public/uploads/`, plain optimized `<img>` tags         |
| Accessibility       | WCAG 2.1 AA, automated `axe-core`/Lighthouse checks in CI                                 |
| i18n readiness      | `lang` field + locale-ready folder structure, German-only content at launch               |
| Testing             | Vitest (unit) + Playwright + axe-core (e2e/a11y), scoped to non-static logic only         |

No `NEEDS CLARIFICATION` markers remain in the Technical Context.
