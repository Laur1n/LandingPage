# Feature Specification: Full Content Migration & Design Overhaul

> **Template note:** This spec documents the Francesca Simone content migration that populates the
> reference deployment. Template forks replace seed content rather than repeating this migration.

**Feature Branch**: `002-content-migration-redesign`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "check this website: with baseURL "https://jazz-isses.de/Francesca". That is the site I want to replace. Check all content of page and subpages. Important: dont go in root URL "https://jazz-isses.de", since the landing page for Francesca is also a subpage. Get all content and put it on our site (make sure it is maintainable in CMS). Also important work on our design. It should have professional scrolling animations, clever design and overall dont look like AI slob, but warm, friendly and professional portfolio site"

**Content baseline**: [content-inventory.md](./content-inventory.md) — the complete, page-by-page
capture of the old site (captured 2026-07-24). All "old site" references below mean the pages
under `https://jazz-isses.de/Francesca/` only; the root domain `https://jazz-isses.de` is a
different site and is explicitly out of scope.

## Clarifications

### Session 2026-07-24

- Q: How should the site's pages be structured? → A: Hybrid — the landing page stays a rich
  scrolling overview with teaser sections; each content area (Vita, Projekte, Termine, CDs,
  Unterricht, Kontakt, Canzoni italiane) also gets a dedicated subpage carrying the full migrated
  content.
- Q: How ambitious should the scroll animations be? → A: Showcase — rich scroll-driven
  storytelling (parallax layers, pinned sections, scroll-choreographed imagery/typography), not
  just subtle reveals. Performance and accessibility guardrails (FR-013, FR-014, SC-003, SC-004)
  remain hard requirements.
- Q: Which visual direction should anchor the redesign? → A: Warm editorial minimal — light,
  airy, photography-led: paper-white base, generous whitespace, a single warm accent color,
  restrained expressive typography. Timeless and professional; photo quality becomes load-bearing.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Visitor finds every piece of information the old site offered (Priority: P1)

A concertgoer, venue booker, journalist, or prospective student visits the new site and finds all
the information the old site provided — the full biography (Vita), all three projects with their
complete descriptions and listening links, the dedicated "Canzoni italiane" program presentation,
all six CD releases with covers and info sheets, upcoming and past concert dates, the complete
teaching offer including methods and locations, and full contact details — without ever needing
to consult the old site.

**Why this priority**: This is the core of "replace the old site." Until the new site carries the
complete content, it cannot go live as a replacement — anything missing (a CD, a phone number, a
program page a venue was sent a link to) actively harms bookings, sales, and student inquiries.
The project constitution (Principle V) makes this content baseline mandatory.

**Independent Test**: Audit the new site against every row and bullet of
[content-inventory.md](./content-inventory.md); every content item is either present or explicitly
recorded as intentionally superseded. Delivers a content-complete site even before any visual
redesign.

**Acceptance Scenarios**:

1. **Given** the content inventory of the old site, **When** each inventory item is checked
   against the new site, **Then** 100% of items are present (or documented as intentionally
   dropped, with reason).
2. **Given** a visitor interested in the "Canzoni italiane" program, **When** they navigate from
   the start page, **Then** they reach a dedicated program presentation including the intro, the
   press quote with attribution, the song examples, the "Eigene Handschrift" text, and the full
   band line-up (Besetzung).
3. **Given** a visitor on the CD overview, **When** they browse it, **Then** all six releases
   (re:call – Heart of Gold, Ad Alta Voce, Azzurro, Guarda li, Ciao Maria, This) appear, each with
   cover image and downloadable info sheet.
4. **Given** a visitor checking concert history, **When** they open the dates section, **Then**
   they see the upcoming date(s) prominently and can also see past dates (2023 onward) as an
   archive, matching the old site's "Aktuelle und vergangene Termine".
5. **Given** a prospective student, **When** they read the teaching page, **Then** they find the
   full offer list, the voice-work methods description, both locations, and the scheduling model
   (weekly / 14-day, single lessons, by arrangement).
6. **Given** a booker on any page, **When** they look for contact options, **Then** they find
   both phone numbers, the mobile number, and the email address from the old site's contact page.

---

### User Story 2 - Site owner maintains all migrated content herself (Priority: P2)

Francesca logs into the existing content-editing area and can independently change any piece of
the newly migrated content — edit a project description, replace a CD cover or info PDF, add a
new tour date, update the teaching offer, correct a phone number — without a developer.

**Why this priority**: The constitution (Principle II) forbids content that only a developer can
change. Migrating content in a way she cannot edit would create exactly the maintenance trap the
project exists to eliminate. It ranks below P1 only because visitors seeing complete content is
the precondition for launch.

**Independent Test**: For each content area touched by the migration (biography, projects,
program page, dates, CDs, teaching, contact, legal, landing-page texts), log in as the owner,
change one value, publish, and confirm the public site reflects it — no code involved.

**Acceptance Scenarios**:

1. **Given** the owner is logged into the editing area, **When** she opens any migrated content
   item (e.g., the "Canzoni italiane" program text or a CD entry), **Then** every text, image,
   file, and date visible on the public site is editable there.
2. **Given** the owner adds a brand-new CD entry with cover and info PDF, **When** she publishes,
   **Then** it appears on the public CD overview without developer involvement.
3. **Given** the owner uploads a replacement flyer PDF for a project, **When** she publishes,
   **Then** the public download link serves the new file.
4. **Given** a tour date's day has passed, **When** the site next refreshes, **Then** the date
   moves from the upcoming presentation into the past-dates archive automatically (no manual
   step).

---

### User Story 3 - Visitor experiences a warm, professional, distinctive design (Priority: P3)

A visitor scrolling through the site experiences a warm, friendly, professional portfolio — a
design with personality that reflects Francesca's identity (Italian warmth, jazz/pop sensibility,
expressive stage presence). The site tells its story through rich scroll-driven choreography
(parallax imagery, pinned scenes, animated typography) at showcase level; typography, color, and
imagery feel intentional and hand-crafted, not like a generic AI-generated template.

**Why this priority**: The user explicitly asked for this, and the constitution (Principle IV)
mandates distinctive design craft. It is P3 only because a beautiful site with missing content
cannot replace the old site, while a complete site with the current design could — the redesign
is what makes the replacement feel like an upgrade rather than a lateral move.

**Independent Test**: Review the deployed site against the design requirements (FR-013…FR-017)
on desktop and mobile: scroll animations present and smooth, reduced-motion respected, no
generic-template traits, all content readable without animation.

**Acceptance Scenarios**:

1. **Given** a visitor scrolling any main page, **When** sections enter the viewport, **Then**
   content animates in smoothly (e.g., staged reveals) without stutter, without blocking reading,
   and without causing layout jumps.
2. **Given** a visitor whose device/OS is set to reduced motion, **When** they browse the site,
   **Then** all content is fully visible and usable with animations removed or reduced to
   non-motion transitions.
3. **Given** a visitor with scripting unavailable, **When** they load any page, **Then** all
   content is visible and readable (animations are an enhancement, never a gate).
4. **Given** a design review against the constitution's "AI slop" exclusion list (default fonts,
   cyan-purple gradients, stock card grids, gratuitous glassmorphism), **When** the site is
   inspected, **Then** none of those traits are present and the direction visibly derives from
   Francesca's actual identity (Italian, jazz/pop, warm, expressive).

---

### Edge Cases

- An asset on the old site (a flyer PDF, CD info PDF, or photo) is unreachable or of unusably low
  quality: the item ships with a clearly-editable placeholder and is recorded in a launch
  checklist for the owner to supply — the surrounding entry still publishes. Because the decided
  design direction is photography-led, photo resolution/quality is load-bearing: any old-site
  photo too small for its layout role goes on that same launch checklist for the owner to
  re-supply in higher resolution.
- The old site changes between content capture (2026-07-24) and launch: the inventory is
  re-verified against the live old site once before launch, and diffs are applied.
- The past-dates archive grows unboundedly over years: the presentation must remain scannable
  (e.g., grouped by year) and must not slow the page down as entries accumulate.
- A tour date exists with incomplete details (no time, or a note like "nur nach persönlicher
  Anmeldung"): it still renders gracefully with the fields it has.
- Third-party listening links (YouTube, SoundCloud) are followed from the site: no third-party
  content loads on the site itself without the visitor's action, so no consent banner becomes
  necessary; links clearly indicate they lead to an external service.
- Press quote usage: the A. Fasel quote must keep its attribution wherever it appears.
- Photos are reused from the old site: the photographer credit (Dorina Köb) must be preserved in
  the Impressum.
- A visitor lands directly on a subpage (e.g., a venue shares the program page link): navigation
  and contact routes must work from every page, not just the start page.

## Requirements _(mandatory)_

### Functional Requirements

**Content completeness** (baseline: [content-inventory.md](./content-inventory.md))

- **FR-001**: The site MUST present all content areas of the old site: Start, Vita, Projekte,
  Termine, CDs, Unterricht, Kontakt, the dedicated "Canzoni italiane" program presentation, and
  Impressum — each reachable through site navigation from every page. Structure is hybrid: the
  landing page remains a scrolling overview with a teaser section per area, and each area has a
  dedicated subpage carrying its full content (the subpage, not the landing teaser, is the
  complete representation).
- **FR-002**: The Vita presentation MUST include the complete biography text from the old site
  (roles, Trio founding 1995 and 15-year history, "Projekt 70", Jazzfabryk and re:call
  collaborations, style description, Musikhochschule Köln studies, CD interpretation paragraph).
- **FR-003**: Each of the three projects (Francesca Simone & Friends, re:call, Francesca Simone
  Trio) MUST be presented with its full description from the old site, including named band
  members, program names ("When I was Young – Songs of the 70s", "Canzoni Italiane"), premiere
  date, downloadable flyer(s), and its external listening links (YouTube / SoundCloud).
- **FR-004**: The "Canzoni italiane" program MUST have its own dedicated presentation including
  intro, attributed press quote (A. Fasel), song examples, "Eigene Handschrift" section, band
  line-up (Besetzung) with instruments, and the booking pitch ("Ein Abend wie in Italien.").
- **FR-005**: The CD overview MUST list all six releases (re:call – Heart of Gold, Ad Alta Voce,
  Azzurro, Guarda li, Ciao Maria, This), each with cover image and downloadable info sheet.
- **FR-006**: The dates section MUST show upcoming dates prominently and past dates (2023 onward,
  per the inventory) as an archive; dates whose day has passed MUST move to the archive
  automatically without manual editing.
- **FR-007**: The teaching presentation MUST include the full offer (individual pop/jazz lessons
  for beginners and advanced students, choir direction/workshops/arrangements, ensemble coaching,
  training for educators, voice training for teachers, voice work in team training), the
  voice-work methods description, both locations (Köln-Niehl, Lindlar), the scheduling model, and
  the "since 1994" freelance history.
- **FR-008**: Contact information MUST include landline, mobile, and email exactly as on the old
  site, with an invitation text for bookings/lessons/workshops; contact MUST be reachable from
  every page.
- **FR-009**: The Impressum MUST carry the owner's legal data (name, address, email), the
  copyright notice, the external-links disclaimer, and the photography credit (Dorina Köb).

**Maintainability**

- **FR-010**: Every piece of migrated content visible on the public site — every text, image,
  PDF, date, and link — MUST be editable by the site owner through the existing content-editing
  area, with no developer-only content (constitution Principle II).
- **FR-011**: Media assets from the old site (portraits, CD covers, project photos, flyer and
  info PDFs) MUST be brought into the site's own media management so the owner can replace them;
  the site MUST NOT hot-link assets from the old domain.
- **FR-012**: New content structures introduced by this feature (e.g., program page, past-dates
  archive, per-project links and flyers, per-CD info sheets) MUST allow the owner to add, edit,
  reorder where ordering is meaningful, and remove entries.

**Design & experience**

- **FR-013**: The site MUST deliver showcase-level scroll-driven storytelling: beyond staged
  section reveals, the landing page and key subpages use scroll-choreographed moments such as
  parallax imagery, pinned/scene-based sections, and animated typography. Animation MUST support
  (never obstruct) reading flow, MUST never hide content from visitors who don't scroll-trigger
  it, never cause layout shift, and never noticeably degrade scrolling smoothness on ordinary
  mobile devices — where a given showcase effect cannot meet these guardrails on mobile, it MUST
  degrade to a simpler reveal rather than ship janky.
- **FR-014**: The site MUST respect visitors' reduced-motion preference by disabling or
  minimizing animation, and all content MUST remain fully accessible when scripting is
  unavailable.
- **FR-015**: The visual design MUST follow the decided "warm editorial minimal" direction:
  light, airy, photography-led — paper-white base, generous whitespace, a single warm accent
  color, restrained but expressive typography — expressing a warm, friendly, professional
  identity derived from Francesca's actual artistic identity (Italian, jazz/pop, expressive). It
  MUST NOT exhibit the generic-template traits excluded by the constitution (default fonts,
  cyan-purple gradients, stock card grids, gratuitous glassmorphism). Design context MUST be
  established via the project's mandated design workflow before visual work begins (constitution
  Principle IV).
- **FR-016**: The design overhaul MUST cover all pages consistently (landing, all content
  sections/subpages, legal pages) — one coherent visual system, not a redesigned landing page
  with legacy-styled subpages.
- **FR-017**: External listening links (YouTube, SoundCloud) MUST be presented as clearly-marked
  outbound links; no third-party content may load without visitor action (keeps the site
  consent-banner-free).

### Key Entities

- **Project/Ensemble**: name, full description, band members with roles, program name(s), notable
  dates (founding, premiere), ordered list of external links (label + URL), downloadable flyer
  file(s), photo, display order.
- **Program page (Canzoni italiane)**: title, subtitle/ensemble, intro, attributed press quote,
  narrative sections, song examples, line-up (member + instrument), booking pitch.
- **Album/CD**: title, cover image, info-sheet file, optional description/year, display order.
- **Tour date**: date/time, ensemble, venue, address/location, note (e.g., "Matinee",
  registration requirement), optional ticket/details link; state derived from date (upcoming vs.
  past).
- **Biography (Vita)**: extended multi-paragraph life/career text, portrait image(s), pull quote.
- **Teaching offer**: intro, offer items, methods description, locations, scheduling model,
  history ("since 1994").
- **Contact details**: landline, mobile, email, invitation text.
- **Site texts**: navigation labels, section headings, CTAs, footer — including labels for the
  new areas this feature adds.
- **Media asset**: image or document (PDF) with alt text/label, owner-replaceable.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A content audit against the captured inventory finds 100% of the old site's content
  items present on the new site (or explicitly documented as intentionally superseded) — zero
  silent omissions.
- **SC-002**: The site owner can locate and successfully edit any given migrated content item
  (text, image, PDF, or date) through the editing area in under 3 minutes, without assistance and
  without touching code — verified for at least one item in every content area.
- **SC-003**: Every page of the site becomes readable within 2.5 seconds on a mid-range mobile
  device over a typical mobile connection, with animations enabled.
- **SC-004**: Visitors with reduced-motion preference or without scripting see 100% of the
  content — zero content exclusively revealed by animation.
- **SC-005**: Automated accessibility checks report zero serious or critical violations on every
  page.
- **SC-006**: A first-time visitor can reach any major information need (next concert, a specific
  CD, the teaching offer, a phone number, the Canzoni italiane program) within 2 interactions
  from the start page.
- **SC-007**: The old site can be retired: every information need it served is answerable on the
  new site, so no visitor has to be redirected to any old-site page after launch.

## Assumptions

- **Information architecture**: Decided (see Clarifications): hybrid structure — landing page as
  rich scrolling overview with one teaser per area, plus a dedicated subpage per area (Vita,
  Projekte, Termine, CDs, Unterricht, Kontakt, Canzoni italiane) carrying the full content.
  FR-001 (all areas reachable from everywhere) and SC-006 (≤2 interactions) still bound the
  navigation design.
- **Asset rights**: All old-site assets (texts, photos by Dorina Köb, flyers, CD covers, PDFs)
  belong to Francesca and may be reused on the new site with the existing Impressum credit.
- **Asset retrieval**: Old-site assets are downloadable at capture time; any asset that turns out
  to be unreachable or too low-quality is handled via the placeholder-plus-launch-checklist edge
  case above, not by blocking the feature.
- **Language**: German only for now, consistent with the old site; nothing may block adding
  Italian/English later (existing constitutional constraint).
- **Content freeze & re-check**: The inventory captured 2026-07-24 is the migration source; it is
  re-verified once against the live old site shortly before launch. After launch, the owner
  maintains content exclusively on the new site.
- **External links**: YouTube/SoundCloud/flyer links from the old site are carried over as-is;
  the owner can update them later. Linking out (not embedding) matches the old site and keeps the
  site free of consent requirements.
- **No commerce**: The old site sells nothing online (CDs have info PDFs, no shop); the new site
  likewise includes no purchase/checkout capability.
- **Legal pages**: The existing Impressum/Datenschutz pages remain; Impressum content is
  reconciled with the old site's legal data (address, credits) rather than replaced wholesale.
  The old site's "AGB" label carried no separate AGB content beyond the Impressum text captured
  in the inventory; if separate AGB text surfaces during the pre-launch re-check, it is migrated
  the same way.
- **Existing editing area**: The current owner login and editing workflow (from feature 001)
  stays as-is; this feature extends what is editable, not how login works.
