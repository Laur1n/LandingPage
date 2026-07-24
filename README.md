# Francesca Simone — Portfolio Site

A static portfolio site for [Francesca Simone](https://jazz-isses.de/Francesca/) — singer,
songwriter, and vocal teacher — built so she can maintain every word of it herself, with no
developer in the loop for routine updates.

Full requirements, architecture decisions, and design rationale live in
[`specs/001-francesca-portfolio-site/`](specs/001-francesca-portfolio-site/) (spec, plan,
research, data model, contracts, and tasks) and in [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
(the project's governing principles). This README is the practical "how do I run/deploy this"
guide; see those documents for the "why."

## How it works, in one paragraph

The public site is a fully static [Astro](https://astro.build) build hosted on **GitHub Pages** —
every page is pre-rendered HTML, no server needed to display it. Content (biography, tour dates,
projects, discography, teaching info, contact details, legal notices) lives as Markdown/YAML files
under `src/content/` and is edited through [Decap CMS](https://decapcms.org) at `/admin/`,
authenticated via [DecapBridge](https://decapbridge.com) — Francesca never needs a GitHub account.
Saving a change creates a draft she can preview before publishing; publishing merges it into the
live branch, and a **GitHub Actions** workflow automatically rebuilds and redeploys the site — no
manual deploy step, ever. That same workflow also runs once a day on a schedule, purely so a tour
date that has quietly passed drops off the public "upcoming" list even on a day nothing else changes.

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
npm test               # unit tests (Vitest) — tour-date filtering logic
npm run test:e2e       # end-to-end tests (Playwright + axe-core) — run against a full build+preview
npm run lint            # ESLint
npm run format:check    # Prettier check
```

`npm run test:e2e` builds and serves the site itself (see `playwright.config.ts`), so you don't
need to run `build`/`preview` first.

## One-time deployment setup

These steps happen outside this codebase, in GitHub's and DecapBridge's own settings, and only
need doing once:

1. **Push this repository to GitHub** as a **public** repository (GitHub Pages' free tier
   requires this — it also happens to be what lets anyone, including Francesca, download a full
   backup ZIP straight from GitHub with no login; see "Editing content" below).
2. **Enable GitHub Pages**: repo Settings → Pages → Source → "GitHub Actions". The included
   workflow (`.github/workflows/deploy.yml`) handles the rest — it builds and deploys on every
   push to `main`, on a daily schedule, and on demand.
3. **Point your custom domain at it**: at your DNS provider, add an `A` record (apex domain) and/or
   a `CNAME` record (`www` subdomain) pointing to `<your-github-username>.github.io`. Then, in repo
   Settings → Pages → Custom domain, enter the domain and let GitHub verify and provision HTTPS for
   it. The domain is already committed in `public/CNAME` — if you use a different one, update that
   file and the `site` value in `astro.config.mjs` to match. Note: since this repo publishes via a
   custom GitHub Actions workflow (not "Deploy from a branch"), GitHub Pages ignores `public/CNAME`
   entirely for routing — the Settings → Pages → Custom domain field is the actual source of truth.
   Keeping `public/CNAME` in sync is just for clarity/backup in case you ever switch publishing
   modes.
4. **Register the site with [DecapBridge](https://decapbridge.com/docs)** and invite Francesca as
   the site's editor by email. DecapBridge gives you an `identity_url` and `gateway_url`. ✅ Done
   — `public/admin/config.yml` already has the real values for this site (site id
   `6ce414fb-7b28-4e09-906f-798c9e6517d6`).

   ⚠️ **The GitHub token you gave DecapBridge needs _two_ permissions, not one.** Because this
   site uses `publish_mode: editorial_workflow`, every save opens a pull request, so the token
   needs **Contents: Read and write** _and_ **Pull requests: Read and write**. With only
   Contents, saving gets far enough to push a `cms/...` branch and then dies on the pull request
   with the very unhelpful `Failed to persist entry: API_ERROR: Unexpected end of JSON input` —
   the gateway returns an empty body, so Decap has nothing to report. Fix it under
   [github.com/settings/tokens](https://github.com/settings/tokens) and re-paste the token into
   the DecapBridge site settings.

5. ~~Fill in `public/admin/config.yml` with the real backend values~~ — done as part of step 4
   above.
6. **Confirm the Impressum and Datenschutz text** in `/admin/` under "Rechtliches" — the seeded
   copy is a clearly-marked legal placeholder (name/address fields, etc.) and must be completed
   with Francesca's real details, ideally checked by a qualified source, before the site goes
   live (this is a German legal requirement, not optional).
7. **Replace the placeholder portrait and discography entry** the same way, via `/admin/`.

Still outstanding: step 1 (push to GitHub — nothing has been pushed yet), step 2 (flip Pages
source to GitHub Actions), step 3 (DNS + custom domain verification), and steps 6-7 (real
Impressum/Datenschutz/portrait/discography content).

No environment variables or secrets are required anywhere — GitHub Actions deploys using its own
built-in credentials, and DecapBridge/git-gateway needs no server-held tokens of ours.

Once these are in place, publishing a content change in `/admin/` is the _only_ step required to
update the live site — see [`specs/001-francesca-portfolio-site/quickstart.md`](specs/001-francesca-portfolio-site/quickstart.md)
for the full validation walkthrough.

## Editing content (for Francesca)

1. Go to `yoursite.com/admin/` (with the trailing slash) and log in.
2. Pick a section on the left (Website-Texte, Vita, Projekte, Termine, CDs, Unterricht, Kontakt,
   Rechtliches). "Website-Texte" holds the wording that isn't part of any one entry — the menu,
   the big welcome block, every section heading, the footer, and the text Google shows.
3. Make your change and click **Save** — this creates a draft, it is not live yet.
4. Click **Preview** to see your change laid out with the site's real fonts and colors, right
   inside this screen (it won't look 100% identical to the finished page, but it's enough to
   catch a typo or a missing photo before anyone else sees it).
5. Happy with it? Click **Publish** — the site rebuilds and updates automatically within a few
   minutes. Not ready yet? Just leave it as a draft; the live site is unaffected until you publish.
6. Want a full backup of everything at any time? Since the site's content is stored in a public
   GitHub repository, you (or anyone) can download a complete copy with no login at all, from:
   `https://github.com/<OWNER>/<REPO>/archive/refs/heads/main.zip` (ask your developer for the
   exact link — it's worth bookmarking).

If you ever forget your password, use the "forgot password" link on the login screen — no one
needs to reset it for you.

## Project structure

```text
src/
├── content.config.ts   # Content schema — what fields each section has
├── content/             # The actual content files (what /admin/ edits)
│   └── site/            # Menu, headings, footer, SEO text — the strings outside the entries
├── components/           # Reusable page pieces (nav, footer, each section)
├── layouts/              # Shared page shell
└── pages/                # index.astro (the whole one-page site), impressum, datenschutz

public/admin/              # Decap CMS (the "/admin/" login + editor)
.github/workflows/         # Build + deploy to GitHub Pages, incl. the daily scheduled rebuild
tests/                     # Unit (Vitest) and end-to-end (Playwright) tests
specs/                     # Feature spec, plan, and design docs for this project
```

## License

Private project for Francesca Simone. Not licensed for reuse.
