# Contract: Decap CMS Config Delta (`public/admin/config.yml`)

Delta to the 001 contract (`specs/001-francesca-portfolio-site/contracts/decap-cms-config.md`).
Backend, editorial workflow, media folder, and commit-message settings are **unchanged**. Every
field below MUST have a German label and, where non-obvious, a `hint`. Field `name`s MUST match
`src/content.config.ts` exactly (data-model.md is the source of truth).

## Changed collections

### `biography` (file collection)

Add fields (after `portraitAlt`):

| Widget | name            | Label (de)                     | required                            |
| ------ | --------------- | ------------------------------ | ----------------------------------- |
| image  | portraitVita    | Porträtfoto für die Vita-Seite | false                               |
| string | portraitVitaAlt | Alt-Text für das Vita-Foto     | false (hint: required if photo set) |
| text   | teaser          | Kurzer Text für die Startseite | true                                |
| string | pullQuote       | Zitat (groß dargestellt)       | false                               |

`body` label changes to „Vita-Text (vollständig)".

### `projects` (folder collection)

Add fields (before `body`):

| Widget               | name        | Label (de)                    | required                                   |
| -------------------- | ----------- | ----------------------------- | ------------------------------------------ |
| string               | programName | Aktuelles Programm            | false                                      |
| list of {name,role}  | members     | Mitwirkende                   | false                                      |
| list of {label,url}  | links       | Links (YouTube, SoundCloud …) | false (url pattern `^https?://.+` or `^/`) |
| list of {label,file} | flyers      | Flyer (PDF)                   | false — file widget                        |

### `tour_dates` (folder collection)

Add field after `location`:

| Widget | name     | Label (de)           | required                                          |
| ------ | -------- | -------------------- | ------------------------------------------------- |
| string | ensemble | Ensemble / Besetzung | false (hint: leer = „Francesca Simone & Friends") |

### `discography` (folder collection)

Add fields:

| Widget | name    | Label (de)  | required |
| ------ | ------- | ----------- | -------- |
| file   | infoPdf | Info-PDF    | false    |
| number | order   | Reihenfolge | false    |

Add `order` to `sortable_fields`.

### `teaching` (file collection)

Add fields (before `body`):

| Widget        | name           | Label (de)                      | required |
| ------------- | -------------- | ------------------------------- | -------- |
| string        | subtitle       | Untertitel                      | false    |
| list (string) | offerings      | Angebot (Liste)                 | true     |
| string        | methodsHeading | Überschrift Stimmarbeit         | false    |
| text          | methodsText    | Text Stimmarbeit                | false    |
| string        | schedulingText | Unterrichtszeiten & Orte (Satz) | false    |

### `contact` (file collection)

Add field after `phone`:

| Widget | name        | Label (de) | required |
| ------ | ----------- | ---------- | -------- |
| string | phoneMobile | Mobil      | false    |

`phone` label changes to „Telefon (Festnetz)".

### `site` (file collection)

Add object groups `teasers`, `subpages`, `archive`, `downloads`, `program` with the fields listed
in data-model.md §site — all `collapsed: true`, all strings, all with defaults matching the
shipped wording so an empty save cannot blank the site.

## New collection

### `programs` (folder collection)

```yaml
- name: "programs"
  label: "Programme"
  label_singular: "Programm"
  folder: "src/content/programs/de"
  create: true
  identifier_field: "title"
  slug: "{{slug}}"
  sortable_fields: ["order", "title"]
  # slug hint: MUST warn the reserved slugs are
  # vita, projekte, termine, cds, unterricht, kontakt, impressum, datenschutz, admin
```

Fields (all German-labeled): hidden lang · string title (req) · string subtitle · text intro
(req) · string quote · string quoteAttribution (hint: „erscheint immer zusammen mit dem Zitat") ·
image heroImage · string heroImageAlt · list{name,role} lineup („Besetzung", role label
„Instrument") · string pitchHeading · text pitchText · number order · markdown body (req).

## Preview templates (`public/admin/index.html`)

`registerPreviewTemplate` MUST cover: `programs` (new), and updated previews for `biography`,
`projects`, `discography`, `teaching` reflecting the new fields. Preview renders content only
(no scroll animation) — the editorial-workflow draft remains the owner's verification step.

## Contract tests / acceptance

1. Every field name in this delta exists in `src/content.config.ts` with a compatible type
   (build fails otherwise — Astro validates frontmatter against the Zod schema).
2. `npx decap-server` + `local_backend: true` (temporary, never committed): creating a program,
   adding a CD with info-PDF, adding a flyer to a project, and editing every new teaching/site
   field round-trips to disk and renders after `npm run dev` reload.
3. No collection or field present in 001's contract is removed or renamed (owner's existing
   entries must keep loading).
