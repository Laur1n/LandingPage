# Launch Checklist — 002 Content Migration & Design Overhaul

Items awaiting owner-supplied replacements (spec edge cases: asset quality / photography-led
direction). The site ships with these as-is; nothing here blocks launch.

## Assets to re-supply in higher quality (owner)

- [ ] `cd-recall-heart-of-gold-cover.jpg` — only 283×283 px on the old site; too small for large
      display. Shipped small; replace via CMS (CDs → re:call – Heart of Gold → Cover).
- [ ] CD covers (`ad-alta-voce`, `azzurro`, `guarda-li`, `ciao-maria`) are ~500 px — fine for the
      grid, but higher-resolution scans would improve the showcase presentation (optional).
- [ ] `flyer-francesca-simone-friends.pdf` is 6.0 MB — works, but a lighter export (<2 MB) would
      be kinder to mobile visitors (optional; owner can re-upload via CMS).

## Content items to confirm with the owner

- [ ] Vita heading „Italienisch für Fortgeschrittene" refers to a CD review-style paragraph
      (mentions „Azzurro"/„Volare") — confirm which CD it describes (likely „Azzurro"); text
      migrated verbatim either way.
- [ ] Old site's `hero.jpg` (background) migrated and reused; confirm she wants the same hero
      photo on the new design or a new one from Dorina Köb.
- [ ] Homepage listed on old Kontakt page is `www.francesca-simone.de`; new domain is
      `francesca-simone.com` — Impressum on the new site references the new domain; confirm.

## Pre-launch re-check (T042)

- [ ] Re-run `node scripts/harvest-old-site.mjs`, diff `harvest-report.md`, apply content diffs.

## Harvest verification (2026-07-24)

- 23/23 assets downloaded, 0 failures; all renamed per data-model.md §Media convention and
  pre-sized (photos ≤1600 px, covers ≤800 px, q80 mozjpeg).
- Exact outbound URLs recovered: YouTube `GeXVWCsDG4k` (Songs of the 70s), YouTube `6y8VhOesW44`
  (Trio), SoundCloud `user-942746890` (re:call), `www.altedrahtzieherei.de` (2025 date).
- Extra finds vs. the original crawl: audio sample (Hörprobe) + dedicated flyer + portrait on the
  Canzoni page; third teaching section „Musikalische Weiterbildung"; verbatim Stimmarbeit text
  (Gisela Rohmert, WARD, Roy-Hart-Theatre, Yoga/Qi Gong/Feldenkrais); portrait-3 on Kontakt.

## Re-check log

- 2026-07-25: `node scripts/harvest-old-site.mjs --report-only` — report identical to the
  2026-07-24 capture (no content drift on the old site). Re-run once more shortly before launch.
