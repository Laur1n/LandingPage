# Quickstart — Validating 002 (Content Migration & Design Overhaul)

> **Template note:** Feature 002 documents how the Francesca Simone reference content was migrated
> and redesigned. New template deployments replace seed content instead of running this harvest
> workflow unless they are migrating from an existing site.

Prerequisites: Node 22+, `npm install`. Run everything from the repo root on branch
`002-content-migration-redesign`.

## 1. Harvest verification (once, before/while implementing content)

```bash
node scripts/harvest-old-site.mjs        # dev-only; writes public/uploads/* + harvest-report.md
```

Expected: report lists every asset from [content-inventory.md §Media](./content-inventory.md)
with a local path, plus exact YouTube/SoundCloud/PDF URLs and verbatim text for every passage the
inventory marks _(paraphrased)_. Re-run before launch and diff — this is the spec's pre-launch
re-check.

## 2. Build & unit tests

```bash
npm run build      # must succeed — Zod schemas validate all migrated frontmatter
npm test           # unit: tour-date upcoming/archive grouping incl. year grouping + boundaries
npm run check && npm run lint && npm run format:check
```

## 3. Full e2e + accessibility suite

```bash
npm run test:e2e   # builds + serves preview itself
```

Must include (extends existing suite):

- **Content-presence audit** (SC-001): per-route assertions generated from
  [contracts/routes.md](./contracts/routes.md) — e.g. all six CD titles on `/cds/`, both phone
  numbers on `/kontakt/`, quote + „A. Fasel" attribution on `/canzoni-italiane/`, all 10
  migrated dates in the `/termine/` archive grouped by year.
- **No-JS**: JavaScript-disabled context sees all MUST-show content (FR-014).
- **Reduced motion**: emulated `prefers-reduced-motion: reduce` ⇒ no pin spacers, hero text
  immediately visible ([contracts/motion.md](./contracts/motion.md)).
- **No old-domain leakage**: built HTML contains no `jazz-isses.de` references (FR-011) and no
  `fonts.googleapis.com`/`gstatic` references (self-hosted fonts).
- **axe**: 0 serious/critical on every route (SC-005).
- **Route priority**: `/vita/` renders the Vita page (guards the dynamic `[program]` route).

## 4. Performance gate (manual, before merge)

```bash
npm run build && npm run preview
```

Chrome DevTools → Lighthouse, **Mobile**, default throttling, on `/` and `/canzoni-italiane/`:

- LCP ≤ 2.5 s (SC-003) · CLS < 0.1 (FR-013) · no console errors during full-page scroll.
- Performance panel with 4× CPU throttle: scroll through all landing scenes — no long task
  > 100 ms from animation init, no dropped-frame bursts (motion.md rule 6/7).

## 5. CMS round-trip (SC-002, FR-010/FR-012)

Temporarily set `local_backend: true` in `public/admin/config.yml` (**do not commit**), then:

```bash
npx decap-server & npm run dev    # open http://localhost:4321/admin/
```

Verify, timing each edit (< 3 min target, SC-002):

1. Edit a paragraph of the Vita → appears on `/vita/`.
2. Create a new **Programm** entry → new page appears at its slug; reserved-slug hint visible.
3. Add a flyer PDF to a project and replace a CD cover + Info-PDF → downloads/links update.
4. Add a tour date dated yesterday → shows under archive year group; dated next month → shows
   under upcoming.
5. Edit teaching offerings list, contact mobile number, and a `site` teaser label → rendered.

Kill decap-server, revert `local_backend`.

## 6. Design review gate (constitution IV)

Walk the deployed preview against `.impeccable.md` (amended Motion section) and
[contracts/motion.md](./contracts/motion.md): warm-editorial-minimal direction (paper base,
terracotta as the single accent), Bodoni Moda/Hanken Grotesk self-hosted, no banned traits
(gradient text, glassmorphism, icon-card grids, side-stripe cards), scene inventory L1–L7/S1–S7
present at showcase quality — or explicitly downgraded per motion.md rule 7 with a note.

## Launch checklist output

Implementation must produce `specs/002-content-migration-redesign/launch-checklist.md` listing
any placeholder/low-res assets awaiting owner-supplied replacements (spec edge cases) and the
result of the final harvest re-run diff. Empty checklist + all gates green = ready to point
francesca-simone.com at the new build and retire the old site (SC-007).
