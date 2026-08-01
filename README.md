# CMS Landing Page Template

A reusable **Astro + Decap CMS** template for professional portfolio landing pages — artists,
freelancers, small studios, and anyone who needs a polished public site with **zero developer
involvement for day-to-day content updates**.

Every word, image, date, project, program page, and legal notice on the public site comes from
Markdown/YAML under `src/content/`, edited through [Decap CMS](https://decapcms.org) at `/admin/`
and authenticated via [DecapBridge](https://decapbridge.com). The site owner never needs a GitHub
account.

**Reference deployment:** [Francesca Simone](https://laur1n.github.io/LandingPage/) — the seeded
content in this repository is her real portfolio data, kept as a working example of what the
template produces out of the box.

For step-by-step customization when starting a new site from this template, see
[`TEMPLATE.md`](TEMPLATE.md).

Architecture decisions and design rationale live in
[`specs/001-francesca-portfolio-site/`](specs/001-francesca-portfolio-site/) (original build,
now the reference implementation) and [`specs/002-content-migration-redesign/`](specs/002-content-migration-redesign/)
(content migration + scroll-story redesign), plus [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
(governing principles) and [`.impeccable.md`](.impeccable.md) (design context for the reference
deployment). This README is the practical run/deploy guide.

## How it works, in one paragraph

The public site is a fully static [Astro](https://astro.build) build hosted on **GitHub Pages** —
every page is pre-rendered HTML, no server needed to display it. The landing page is a scrolling
overview; each area (Vita, Projekte, Termine incl. archive, CDs, Unterricht, Kontakt) has its own
subpage, and stage programs (e.g. `/canzoni-italiane/`) are pages the owner can create in the CMS.
Saving a change creates a draft that can be previewed before publishing; publishing merges it into
the live branch, and a **GitHub Actions** workflow automatically rebuilds and redeploys — no manual
deploy step. The same workflow runs once a day on a schedule so time-sensitive content (e.g. past
tour dates) stays accurate even when nothing else was published.

## Local development

Requires Node.js 22+.

```bash
npm install
npm run dev          # site at http://localhost:4321
```

To try the content-editing experience locally without a live GitHub/DecapBridge connection, set
`local_backend: true` in `public/admin/config.yml` temporarily and run `npx decap-server`
alongside `npm run dev` — this lets Decap CMS read/write `src/content/` directly on disk. **Do
not commit `local_backend: true`** — it must stay off in the deployed config.

## Building and testing

```bash
npm run build         # production build to dist/
npm run preview        # serve the production build locally (http://localhost:4321)
npm test               # unit tests (Vitest)
npm run test:e2e       # end-to-end tests (Playwright + axe-core)
npm run lint            # ESLint
npm run format:check    # Prettier check
```

`npm run test:e2e` builds and serves the site itself (see `playwright.config.ts`), so you don't
need to run `build`/`preview` first.

## One-time deployment setup (per site)

These steps happen outside this codebase, in GitHub's and DecapBridge's own settings, and only
need doing once per deployment:

1. **Create a repository from this template** (GitHub → "Use this template") or fork it. GitHub
   Pages' free tier requires a **public** repository.
2. **Enable GitHub Pages**: repo Settings → Pages → Source → "GitHub Actions". The included
   workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`, on a daily
   schedule, and on demand.
3. **Point your custom domain at it** (when ready): at your DNS provider, add an `A` record (apex
   domain) and/or a `CNAME` record (`www` subdomain) pointing to `<your-github-username>.github.io`.
   Then, in repo Settings → Pages → Custom domain, enter the domain. Add `public/CNAME` and update
   the `site` value in `astro.config.mjs` to match. Until a custom domain is live, keep `site` on
   the GitHub Pages project URL (e.g. `https://laur1n.github.io/LandingPage`).
4. **Register the site with [DecapBridge](https://decapbridge.com/docs)** and invite the content
   editor by email. Paste the `identity_url`, `gateway_url`, and `repo` into
   `public/admin/config.yml`. See [`TEMPLATE.md`](TEMPLATE.md) for the full checklist.

   ⚠️ **The GitHub token you give DecapBridge needs _two_ permissions.** Because this template uses
   `publish_mode: editorial_workflow`, every save opens a pull request, so the token needs
   **Contents: Read and write** _and_ **Pull requests: Read and write**.

5. **Replace demo content** in `src/content/` and `public/uploads/` with the new site's copy and
   media. The Francesca Simone seed data is reference material — swap it entirely for a new client.
6. **Legal pages**: complete Impressum and Datenschutz in `/admin/` under "Rechtliches" before
   going live (German legal requirement when targeting DE audiences).

No environment variables or secrets are required for deploy — GitHub Actions uses its own built-in
credentials, and DecapBridge/git-gateway needs no server-held tokens.

Once set up, publishing a content change in `/admin/` is the _only_ step required to update the
live site.

## Editing content (for the site owner)

1. Go to `yoursite.com/admin/` (with the trailing slash) and log in.
2. Pick a section on the left (Website-Texte, Vita, Projekte, Programme, Termine, CDs,
   Unterricht, Kontakt, Rechtliches). "Website-Texte" holds menu labels, hero copy, section
   headings, footer text, and SEO strings. "Programme" entries each become their own page — new
   programs can be added without a developer.
3. Make your change and click **Save** — this creates a draft, it is not live yet.
4. Click **Preview** to see the draft laid out with the site's fonts and colors inside the admin
   screen.
5. Happy with it? Click **Publish** — the site rebuilds automatically within a few minutes.
6. Full backup anytime: download `https://github.com/<OWNER>/<REPO>/archive/refs/heads/main.zip`
   (public repos — no login required).

## Project structure

```text
src/
├── content.config.ts   # Content schema — what fields each section has
├── content/             # The actual content files (what /admin/ edits)
│   ├── programs/        # Stage programs — each entry becomes a page (e.g. /canzoni-italiane/)
│   └── site/            # Menu, headings, footer, SEO text
├── components/
│   ├── sections/         # Landing-page teaser sections
│   └── blocks/           # Shared subpage building blocks
├── layouts/              # Shared page shell (self-hosted fonts)
├── scripts/              # scroll-story.ts — GSAP scroll choreography (reduced-motion aware)
└── pages/                # index.astro + one page per area + [program].astro dynamic route

public/admin/              # Decap CMS (the "/admin/" login + editor)
public/uploads/            # Media library
.github/workflows/         # Build + deploy to GitHub Pages
tests/                     # Unit (Vitest) and end-to-end (Playwright + axe) tests
specs/                     # Reference-implementation specs (Francesca Simone)
```

## License

Template code and tooling: reuse freely when adapting for new sites. The seeded Francesca Simone
content and media in `src/content/` and `public/uploads/` belong to the artist — replace entirely
when deploying for another client.
