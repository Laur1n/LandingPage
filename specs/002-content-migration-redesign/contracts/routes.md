# Contract: Routes & Per-Page Content Obligations

Every route is statically pre-rendered (constitution I). "MUST show" lists are the audit-relevant
items from [content-inventory.md](../content-inventory.md); e2e content-presence tests are
generated from this table. All routes share: Header (nav to all 7 areas, works from any depth),
Footer (roles line incl. „Chorleiterin", Kontakt + Impressum links), skip link, lang="de".

| Route                          | Source                                                                                                          | MUST show (spec ref)                                                                                                                                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                            | site, biography.teaser, projects (teasers), next tour-date(s), discography (teaser), teaching (teaser), contact | Hero (Willkommen · Benvenuti, name, roles, 2 CTAs); tagline; intro + pull quote; „Auf der Bühne" teasers incl. program CTA „Canzoni italiane entdecken"; next-date teaser; teaser links to every subpage (FR-001, SC-006) |
| `/vita/`                       | biography (full body, portraitVita, pullQuote)                                                                  | Complete 5-paragraph Kurzvita verbatim (FR-002); portrait with alt                                                                                                                                                        |
| `/projekte/`                   | projects[] (full)                                                                                               | All 3 projects with full descriptions, members, program names, flyer downloads, external listening links, link to program page (FR-003)                                                                                   |
| `/canzoni-italiane/`           | programs/canzoni-italiane                                                                                       | Title, subtitle, intro, attributed quote (never quote without „A. Fasel"), song examples, „Eigene Handschrift", Besetzung (4 members + instruments), booking pitch with CTA → /kontakt/ (FR-004)                          |
| `/termine/`                    | tour-dates[]                                                                                                    | Upcoming block first (date, time, venue, location, ensemble, notes, optional link); archive grouped by year desc incl. all 10 migrated dates; empty-states from site texts (FR-006)                                       |
| `/cds/`                        | discography[]                                                                                                   | All 6 CDs: title, cover (or placeholder), Info-PDF download; „Musik zum Mitnehmen." heading default (FR-005)                                                                                                              |
| `/unterricht/`                 | teaching                                                                                                        | Subtitle, intro incl. „Seit 1994…", 6 offerings, Stimmarbeit section, locations, scheduling sentence (FR-007)                                                                                                             |
| `/kontakt/`                    | contact                                                                                                         | Landline, mobile, email (mailto:), invitation text, roles line (FR-008)                                                                                                                                                   |
| `/impressum/`, `/datenschutz/` | legal                                                                                                           | Impressum: address, copyright, disclaimer, photo credit Dorina Köb (FR-009). Restyled only.                                                                                                                               |
| `/admin/`                      | Decap                                                                                                           | unchanged; still excluded from nav & robots                                                                                                                                                                               |

## Cross-cutting requirements

- **Dynamic route**: `src/pages/[program].astro` builds one route per `programs` entry.
  Static routes take priority; e2e asserts `/vita/` renders the Vita page even if a program
  entry named `vita` exists.
- **Trailing slash**: `trailingSlash: "ignore"` (existing) — internal links use trailing-slash
  form for consistency.
- **Old-site URLs**: old `.html` paths existed on a different host (jazz-isses.de) we don't
  control — no redirects possible or required here.
- **External links** (FR-017): YouTube/SoundCloud/eventLink render with outbound marker +
  `rel="noopener external"`, `target="_blank"`; no third-party iframe/script/img anywhere.
- **Assets**: all media/PDF hrefs point to `/uploads/...`; zero references to `jazz-isses.de`
  in built output (e2e grep).
- **SEO/meta**: every route has unique title + description (subpage values from site texts with
  defaults); sitemap regenerated if 001 configured one (verify at implementation).
- **No-JS & reduced-motion** (FR-013/FR-014): all "MUST show" content present in server HTML,
  visible without JS; under `prefers-reduced-motion: reduce` no pinning/parallax occurs
  (see [motion.md](./motion.md)).
- **A11y**: axe serious/critical = 0 on every route (SC-005); headings hierarchical; downloads
  and outbound links have accessible names that include their type (PDF / external).
