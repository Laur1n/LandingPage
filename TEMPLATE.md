# Using this repository as a landing-page template

This repo is a **CMS-driven landing page template**: the layout, components, build pipeline, and
Decap CMS schema are reusable; all public-facing copy and media live in `src/content/` and
`public/uploads/` and are edited through `/admin/`.

The current seed data is the **Francesca Simone** reference deployment — treat it as demo content
to replace, not as part of the template itself.

## Quick checklist for a new site

### 1. Create the repository

- GitHub → **Use this template** (or fork), then clone locally.
- Optional: Settings → General → check **Template repository** so others can create repos from it.
- Keep the repo **public** if you use GitHub Pages on the free tier.

### 2. Configure the build for your domain

| File | What to change |
| --- | --- |
| `astro.config.mjs` | `site` — canonical URL (custom domain or `https://<user>.github.io/<repo>`) |
| `public/CNAME` | Custom domain when DNS is ready (omit until then) |
| `public/admin/config.yml` | `site_url` — where editors click "View site" from the CMS |

### 3. Wire up Decap CMS (DecapBridge)

1. Register a new site at [decapbridge.com](https://decapbridge.com/docs).
2. Connect it to **your** GitHub repo (`backend.repo`, `branch: main`).
3. Paste `identity_url` and `gateway_url` into `public/admin/config.yml`.
4. Create a GitHub personal access token with **Contents: Read and write** and **Pull requests: Read and write**; add it in DecapBridge.
5. Invite the content editor by email — they never need GitHub access.

See [`specs/001-francesca-portfolio-site/contracts/decap-cms-config.md`](specs/001-francesca-portfolio-site/contracts/decap-cms-config.md)
for the full CMS contract (collections, editorial workflow, preview behaviour).

### 4. Enable GitHub Pages

1. Settings → Pages → Source → **GitHub Actions**.
2. Push to `main` — `.github/workflows/deploy.yml` builds Astro and deploys automatically.

### 5. Replace content and media

| Area | Location |
| --- | --- |
| Global labels, hero, nav, footer, SEO | `src/content/site/de/index.md` (via CMS: Website-Texte) |
| Biography | `src/content/biography/de/` |
| Projects, programs, tour dates, CDs, teaching, contact | matching folders under `src/content/` |
| Legal | `src/content/legal/de/` |
| Images, PDFs, audio | `public/uploads/` |

Delete or overwrite every Francesca-specific entry. The CMS collections and Zod schemas in
`src/content.config.ts` define what fields exist — extend those only when the new site needs
new content types.

### 6. Adapt design (optional but recommended)

The reference design tokens live in `.impeccable.md` and `src/styles/tokens.css` (Bodoni Moda +
Hanken Grotesk, warm terracotta palette). For a different brand:

1. Run the `impeccable teach` workflow for the new client's audience and personality.
2. Update tokens in `src/styles/tokens.css` and self-hosted fonts in `BaseLayout.astro`.
3. Adjust section copy in CMS — no code change needed for text-only rebrands.

### 7. Pre-launch

- [ ] Impressum and Datenschutz completed in CMS (not placeholders)
- [ ] `astro.config.mjs` `site` matches live domain
- [ ] DecapBridge connected to the correct repo
- [ ] GitHub Pages deploy succeeds (`Actions` tab)
- [ ] `/admin/` login works for the editor
- [ ] Run `npm run build && npm run test:e2e` locally

## What stays the same across deployments

- **Static Astro output** — fast, cheap, no server for public pages
- **Decap CMS + editorial workflow** — save → preview → publish via pull request
- **GitHub Actions deploy** — push to `main`, daily schedule, manual dispatch
- **Content schema** — biography, projects, programs (dynamic routes), tour dates with
  upcoming/past split, discography, teaching, contact, legal, global site texts

## Reference documentation

The `specs/` folder documents how the template was built and validated for Francesca Simone.
Use it as a pattern library when extending the template — it is not a second setup guide for
every new client.

- [`specs/001-francesca-portfolio-site/quickstart.md`](specs/001-francesca-portfolio-site/quickstart.md) — end-to-end validation walkthrough
- [`.specify/memory/constitution.md`](.specify/memory/constitution.md) — architectural principles all adaptations should respect
