# Data Model — Full Content Migration & Design Overhaul

**Feature**: 002-content-migration-redesign · **Date**: 2026-07-24

Extends the 001 data model (see `src/content.config.ts`). Conventions unchanged: one collection
per content type, `de/` locale folder, `lang` field on every entry (i18n-readiness), Zod schemas
with defaults where a missing CMS field must not break the build. **Bold** = new in this feature.

Shared sub-schemas:

- `link`: `{ label: string, url: string(url) }` (existing)
- **`fileLink`**: `{ label: string, file: string }` — owner-replaceable document (PDF)
- **`member`**: `{ name: string, role: string }` — band/line-up entry ("Piano: Florian Offermann")

## biography (singleton) — FR-002, landing teaser

| Field               | Type        | Req                               | Notes                                                              |
| ------------------- | ----------- | --------------------------------- | ------------------------------------------------------------------ |
| lang                | enum de     | ✓                                 | existing                                                           |
| name                | string      | ✓                                 | existing                                                           |
| tagline             | string ≤200 | ✓                                 | existing                                                           |
| portrait            | image path  | ✓                                 | existing (landing)                                                 |
| portraitAlt         | string      | ✓                                 | existing                                                           |
| **portraitVita**    | image path  | –                                 | Vita-page portrait (old `portrait2.jpg`); falls back to `portrait` |
| **portraitVitaAlt** | string      | –                                 | required if portraitVita set (CMS hint)                            |
| **teaser**          | text        | ✓ (default: current landing text) | short landing-page excerpt; body becomes the full Vita             |
| **pullQuote**       | string      | –                                 | „Musik darf erinnern…" — rendered as showcase quote scene          |
| body                | markdown    | ✓                                 | **repurposed: full Kurzvita (5 paragraphs from inventory §2)**     |

**Migration note**: current landing paragraphs move into `teaser`; inventory §2 verbatim text
becomes `body`. Validation: build fails if `teaser` empty (default guards).

## projects (folder) — FR-003

| Field                                  | Type       | Req | Notes                                                                  |
| -------------------------------------- | ---------- | --- | ---------------------------------------------------------------------- |
| lang / name / order / photo / photoAlt | existing   |     | unchanged                                                              |
| **programName**                        | string     | –   | „When I was Young – Songs of the 70s"                                  |
| **members**                            | member[]   | –   | named musicians incl. role                                             |
| **links**                              | link[]     | –   | YouTube / SoundCloud / internal program link (exact URLs from harvest) |
| **flyers**                             | fileLink[] | –   | one or more flyer PDFs                                                 |
| body                                   | markdown   | ✓   | **full description per inventory §3 (replaces one-line teasers)**      |

Entries: `francesca-simone-and-friends` (order 1), `recall` (order 2), `francesca-simone-trio`
(order 3). Landing teaser renders `name` + first paragraph of body (excerpt derived at build —
no separate teaser field needed; first paragraph is authored to stand alone).

## programs (folder) — **NEW** — FR-004, FR-012

| Field                    | Type         | Req | Notes                                                               |
| ------------------------ | ------------ | --- | ------------------------------------------------------------------- |
| lang                     | enum de      | ✓   |                                                                     |
| title                    | string       | ✓   | „Canzoni italiane"                                                  |
| subtitle                 | string       | –   | „Francesca Simone & Friends"                                        |
| intro                    | text         | ✓   | „Vertraute italienische Lieder, neu gehört…"                        |
| quote                    | string       | –   | press quote text                                                    |
| quoteAttribution         | string       | –   | „A. Fasel" — must render whenever quote renders (edge case)         |
| heroImage / heroImageAlt | image/string | –   | photography-led direction; launch-checklist if low-res              |
| lineup                   | member[]     | –   | Besetzung with instruments (inventory §8)                           |
| pitchHeading             | string       | –   | „Ein Abend wie in Italien."                                         |
| pitchText                | text         | –   | booking pitch + CTA to /kontakt                                     |
| order                    | number       | –   | listing order wherever programs are teased                          |
| body                     | markdown     | ✓   | narrative sections („Volare, Azzurro & mehr", „Eigene Handschrift") |

Identity: slug = filename (`canzoni-italiane.md` → `/canzoni-italiane/`). CMS slug hint warns
against reserved slugs (`vita`, `projekte`, `termine`, `cds`, `unterricht`, `kontakt`,
`impressum`, `datenschutz`, `admin`). Lifecycle: owner-creatable (`create: true`).

## tour-dates (folder) — FR-006

| Field                                                  | Type     | Req | Notes                                       |
| ------------------------------------------------------ | -------- | --- | ------------------------------------------- |
| lang / date / venueName / location / eventLink / notes | existing |     | unchanged                                   |
| **ensemble**                                           | string   | –   | render-default „Francesca Simone & Friends" |

State machine (derived, not stored): `upcoming` (date ≥ today) → `past` (date < today), computed
at build; daily scheduled rebuild rolls entries over. Past entries grouped by year, descending
(lib function `groupPastByYear`). Migration: add the 10 dates from inventory §4.

## discography (folder) — FR-005

| Field                                                           | Type      | Req | Notes                      |
| --------------------------------------------------------------- | --------- | --- | -------------------------- |
| lang / title / releaseYear / coverImage / coverImageAlt / links | existing  |     | unchanged                  |
| **infoPdf**                                                     | file path | –   | CD info sheet („Info-PDF") |
| **order**                                                       | number    | –   | display order on /cds      |
| body                                                            | markdown  | –   | optional description       |

Migration: delete `platzhalter-album.md`; create 6 entries (inventory §5) with harvested covers

- info PDFs. Validation: entry renders without cover (placeholder image + launch checklist).

## teaching (singleton) — FR-007

| Field              | Type     | Req            | Notes                                                             |
| ------------------ | -------- | -------------- | ----------------------------------------------------------------- |
| lang / locations   | existing |                | unchanged                                                         |
| **subtitle**       | string   | –              | „Gesang, Stimmarbeit, Chorleitung, Workshops und Klangarbeit — …" |
| **offerings**      | string[] | ✓ (default []) | the 6 offer items (inventory §6)                                  |
| **methodsHeading** | string   | –              | „Stimmarbeit"                                                     |
| **methodsText**    | text     | –              | WARD-Methode, Roy Hart, Körperarbeit … (verbatim from harvest)    |
| **schedulingText** | string   | –              | „Unterrichtsraum in Köln-Niehl oder Lindlar. Wöchentlicher …"     |
| body               | markdown | ✓              | intro incl. „Seit 1994 …"                                         |

## contact (singleton) — FR-008

| Field                                                | Type     | Req | Notes                                      |
| ---------------------------------------------------- | -------- | --- | ------------------------------------------ |
| lang / email / phone / location / socialLinks / body | existing |     | `phone` = landline +49 (0) 2266 / 46 30 25 |
| **phoneMobile**                                      | string   | –   | +49 (0) 162 / 829 23 23                    |

`body` carries the invitation text („Für Konzertbuchungen, Unterricht, Workshops …").

## site (singleton) — FR-010, FR-016 labels

New label groups (all with schema defaults so partial CMS saves never break the build):

| Group           | New fields                                                                                             | Purpose                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `nav`           | (unchanged 7 items)                                                                                    | subpage hrefs replace anchors — labels reused                                                                                                                                  |
| **`teasers`**   | `readMoreLabel` („Mehr erfahren"), per-area teaser CTA labels                                          | landing → subpage links                                                                                                                                                        |
| **`subpages`**  | per-area hero eyebrow/heading/intro overrides (vita, projekte, termine, cds, unterricht, kontakt)      | subpage heroes; defaults from old-site headings („Musik zum Mitnehmen.", „Live erleben.", „Die eigene Stimme entdecken.", „Anfragen & Buchungen.", „Programme mit Charakter.") |
| **`archive`**   | `archiveHeading` („Vergangene Termine"), `archiveEmpty`                                                | dates archive                                                                                                                                                                  |
| **`downloads`** | `flyerLabel` („Flyer (PDF)"), `infoPdfLabel` („Info-PDF"), `externalLinkHint` („öffnet externe Seite") | download/outbound affordances (FR-017)                                                                                                                                         |
| **`program`**   | `lineupHeading` („Besetzung"), `bookingCtaLabel`                                                       | program-page chrome                                                                                                                                                            |

## legal (file collection) — FR-009

Schema unchanged. Content reconciliation only: impressum.md gains/verifies address (Im Winkel 6,
51789 Lindlar), copyright notice, external-links disclaimer, photo credit „Fotografie: Dorina
Köb", former-design credit as she wishes, „© 2016 / modernisierte Fassung 2026".

## Media assets (public/uploads/) — FR-011

Naming convention for harvested assets: `portrait-1.jpg`, `portrait-2.jpg`,
`cd-<slug>-cover.jpg`, `cd-<slug>-info.pdf`, `flyer-<project-slug>[-variant].pdf`,
`project-<slug>.jpg`. All referenced exclusively via `/uploads/...` paths in content frontmatter
(owner-replaceable through the CMS media library). No references to `jazz-isses.de` may remain
anywhere in `src/content/` or `public/` (e2e-checkable).

## Relationships

```text
site ─ labels for → all pages
biography ──────→ / (teaser) and /vita (full)
projects[] ─────→ /projekte (full) + / (teasers); links[] may point to programs pages
programs[] ─────→ /<slug> (e.g. /canzoni-italiane); teased from / and /projekte
tour-dates[] ───→ /termine (upcoming + archive) + / (next date teaser)
discography[] ──→ /cds + / (teaser)
teaching ───────→ /unterricht + / (teaser)
contact ────────→ /kontakt + footer/CTAs on every page
legal ──────────→ /impressum, /datenschutz
```

## Implementation deltas (recorded during /speckit-implement, 2026-07-24/25)

Harvest findings extended the model beyond the plan — all reflected in `src/content.config.ts`
and the Decap config, and covered by the parity test (`tests/unit/cms-config-parity.test.ts`):

- **programs**: + `audioSample` (self-hosted MP3 „Hörprobe") and `flyer` (fileLink) — the old
  Canzoni page has both.
- **teaching**: + `educationHeading`/`educationText` — third section „Musikalische Weiterbildung"
  the original crawl missed.
- **site.hero**: + `image`/`imageAlt` — the redesigned landing hero uses the old site's stage
  photo, CMS-replaceable like all media (FR-010).
- **Zod v4 note**: group-level fallbacks use `.prefault({})` instead of `.default({})` — under
  Astro 7's Zod v4, `.default({})` returns the empty object _without_ applying inner field
  defaults (latent 001 bug, fixed across all groups).
