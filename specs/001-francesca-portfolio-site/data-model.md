# Phase 1 Data Model: Francesca Simone Portfolio Site

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Every collection below is defined in `src/content.config.ts` using Astro's Content Layer API
(`defineCollection()` with a `glob()` loader per research.md §1) and is directly editable through
the matching Decap CMS collection in `public/admin/config.yml` (see
[contracts/decap-cms-config.md](./contracts/decap-cms-config.md)).

**Cross-cutting note on Draft vs. Published (FR-018/FR-019)**: state is _not_ a field on any
entity. It is determined entirely by which git ref a build reads: the production build always
builds from `main` (Published), while Decap CMS's Editorial Workflow deploy-preview build reads
from the entry's draft branch (Draft). This avoids tracking the same state twice in two different
places.

**Cross-cutting note on language (Constitution i18n constraint)**: every collection is namespaced
under a `de/` folder (e.g., `src/content/tour-dates/de/`) and every schema includes `lang`,
defaulting to `"de"`. Only German content ships in this feature; the structure is what allows a
future `it/` or `en/` folder to be added without a schema rewrite.

## Biography (singleton)

Path: `src/content/biography/de/index.md`

| Field                   | Type       | Required | Notes                                                    |
| ----------------------- | ---------- | -------- | -------------------------------------------------------- |
| `lang`                  | enum(`de`) | yes      | default `de`                                             |
| `name`                  | string     | yes      | e.g. "Francesca Simone"                                  |
| `tagline`               | string     | yes      | short intro shown near the top of the homepage           |
| `portrait`              | image      | yes      | processed via `astro:assets`; `alt` text required (WCAG) |
| `portraitAlt`           | string     | yes      | accessible alt text for `portrait`                       |
| body (Markdown content) | markdown   | yes      | the biography text (FR-006)                              |

Validation: `tagline` ≤ 200 characters (keeps hero copy scannable per SC-002).

## Project / Ensemble (repeatable)

Path: `src/content/projects/de/<slug>.md`

| Field                   | Type       | Required                | Notes                                                 |
| ----------------------- | ---------- | ----------------------- | ----------------------------------------------------- |
| `lang`                  | enum(`de`) | yes                     | default `de`                                          |
| `name`                  | string     | yes                     | e.g. "Francesca Simone & Friends", "re:call" (FR-007) |
| `order`                 | number     | no                      | manual sort order on the public page                  |
| `photo`                 | image      | no                      |                                                       |
| `photoAlt`              | string     | required if `photo` set |                                                       |
| body (Markdown content) | markdown   | yes                     | concept/repertoire description                        |

## Tour Date (repeatable)

Path: `src/content/tour-dates/de/<slug>.md`

| Field       | Type                               | Required | Notes                                   |
| ----------- | ---------------------------------- | -------- | --------------------------------------- |
| `lang`      | enum(`de`)                         | yes      | default `de`                            |
| `date`      | datetime (ISO 8601, with timezone) | yes      | drives upcoming/past filtering (FR-005) |
| `venueName` | string                             | yes      |                                         |
| `location`  | string                             | yes      | city / address shown to visitors        |
| `eventLink` | url                                | no       | optional ticket/event page (FR-004)     |
| `notes`     | string                             | no       | e.g. "Premiere", "Album release"        |

Derived (computed at build time, not stored): `status` = `upcoming` if `date >= buildTime`, else
`past`. Only `upcoming` entries, sorted ascending by `date`, render in the public Termine section
(US2 AC1, AC5).

## Discography Entry (repeatable)

Path: `src/content/discography/de/<slug>.md`

| Field                   | Type                                  | Required                     | Notes                                                                       |
| ----------------------- | ------------------------------------- | ---------------------------- | --------------------------------------------------------------------------- |
| `lang`                  | enum(`de`)                            | yes                          | default `de`                                                                |
| `title`                 | string                                | yes                          |                                                                             |
| `releaseYear`           | number                                | no                           |                                                                             |
| `coverImage`            | image                                 | no                           |                                                                             |
| `coverImageAlt`         | string                                | required if `coverImage` set |                                                                             |
| `links`                 | list of `{ label: string, url: url }` | no                           | e.g. "Listen on Spotify" — external, per Assumptions (no self-hosted audio) |
| body (Markdown content) | markdown                              | yes                          | description (FR-008)                                                        |

## Teaching Offering (singleton)

Path: `src/content/teaching/de/index.md`

| Field                   | Type            | Required | Notes                                  |
| ----------------------- | --------------- | -------- | -------------------------------------- |
| `lang`                  | enum(`de`)      | yes      | default `de`                           |
| `locations`             | list of strings | yes      | e.g. "Köln-Niehl", "Lindlar"           |
| body (Markdown content) | markdown        | yes      | lessons/workshops description (FR-009) |

## Contact Details (singleton)

Path: `src/content/contact/de/index.md`

| Field         | Type                                     | Required | Notes                                  |
| ------------- | ---------------------------------------- | -------- | -------------------------------------- |
| `lang`        | enum(`de`)                               | yes      | default `de`                           |
| `email`       | string (email format)                    | yes      | rendered as a `mailto:` link (FR-017)  |
| `phone`       | string                                   | no       | rendered as a `tel:` link if present   |
| `location`    | string                                   | no       | city/region                            |
| `socialLinks` | list of `{ platform: string, url: url }` | no       | e.g. Instagram, Facebook, booking page |

## Legal Notice & Privacy Statement (two singletons)

Path: `src/content/legal/de/impressum.md`, `src/content/legal/de/datenschutz.md`

| Field                   | Type       | Required | Notes                              |
| ----------------------- | ---------- | -------- | ---------------------------------- |
| `lang`                  | enum(`de`) | yes      | default `de`                       |
| `title`                 | string     | yes      | "Impressum" / "Datenschutz"        |
| `lastUpdated`           | date       | yes      | shown to visitors for transparency |
| body (Markdown content) | markdown   | yes      | required legal text (FR-020)       |

## Photo (not a standalone collection)

Photos are `image`-typed fields embedded directly in the collections above (`portrait`, `photo`,
`coverImage`), each paired with a required `*Alt` text field. Decap CMS's `image` widget writes
files into `src/assets/uploads/`; Astro's `astro:assets` handles responsive/optimized output at
build time (research.md §8). This satisfies FR-011 without a separate media-library entity.

## Site Visitor / Admin (Francesca)

Not persisted entities — these are access-control concepts, not content:

- **Site Visitor**: unauthenticated request to any public route; read-only.
- **Admin (Francesca)**: the single account provisioned in DecapBridge for this site; the only
  identity that can obtain a `git-gateway` session capable of writing to `src/content/**`
  (FR-003, FR-012).

## Relationships

- All repeatable collections (`projects`, `tour-dates`, `discography`) are independent lists with
  no cross-references required by the spec — kept flat intentionally to match Constitution's
  simplicity intent and avoid over-modeling a small personal site.
- The homepage (`src/pages/index.astro`) queries all seven collections/singletons via
  `getCollection()`/`getEntry()` (research.md §1) to render each anchored section in one static
  page, mirroring the current site's single-page-with-anchors navigation
  (Start · Vita · Projekte · Termine · CDs · Unterricht · Kontakt).
- `impressum.astro` and `datenschutz.astro` are separate routes (not anchors), linked from the
  shared site footer, matching the current site's "Kontakt · Impressum/AGB" footer pattern.
