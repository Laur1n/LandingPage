# Feature Specification: Francesca Simone Portfolio Site with Self-Service Content Login

> **Template note:** This spec describes the **reference implementation** that became the seed
> content for the reusable CMS landing page template in this repository. See [`TEMPLATE.md`](../../TEMPLATE.md)
> for adapting the template to other sites.

**Feature Branch**: `001-francesca-portfolio-site`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "This project is a landing page and portfolio page for my mum, who is an Italian musician. It will use the impeccable design workflow. It must be a static website. It must have a login so my mum can log in and easily maintain the page's content herself. The current page, which serves as the content and information baseline to match or improve on, is https://jazz-isses.de/Francesca/ (Francesca Simone — singer/songwriter/vocal teacher, with sections for Vita, Projekte, Termine, CDs, Unterricht, and Kontakt)."

## Clarifications

### Session 2026-07-23

- Q: The current site's footer includes "Impressum/AGB" (legal notice), which German law generally requires for professional websites. How should the new site handle it? → A: Include an Impressum/Datenschutz (legal notice + privacy) page as a self-service editable section, same as other content.
- Q: If the underlying content data were ever lost or corrupted, what recovery capability should exist? → A: Francesca can manually export/download a copy of all her content on demand (no automatic schedule).
- Q: When Francesca saves a content change, should it go live immediately, or should she be able to preview a draft before publishing? → A: Francesca can save a draft and preview it before publishing it live.
- Q: What accessibility bar should the public site meet? → A: Target WCAG 2.1 Level AA.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Visitor discovers Francesca through her public portfolio site (Priority: P1)

A prospective concertgoer, venue booker, journalist, or prospective voice student finds Francesca Simone's site and, within the same visit, learns who she is, what she performs, what's coming up, what she's recorded, and how to reach her — all in a fast-loading, distinctive site that reflects her as an artist rather than a generic template.

**Why this priority**: This is the reason the site exists. Without a working, credible public site there is nothing to maintain, and it's the only piece that end audiences and bookers ever see. It must work standalone even before any login/editing capability exists.

**Independent Test**: Can be fully tested by publishing the site with the current baseline content (migrated from the existing site) and verifying every section is present, readable, and navigable on both desktop and mobile — no login required.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the homepage, **When** the page loads, **Then** they see who Francesca Simone is (photo, short intro/tagline) and can navigate to her biography, projects, tour dates, discography, teaching offering, and contact information.
2. **Given** a visitor opens the biography/Vita section, **When** they read it, **Then** they see her artistic background and career highlights, at least matching the depth of the current site.
3. **Given** a visitor opens the projects section, **When** they browse it, **Then** they see her ensembles/acts (e.g. "Francesca Simone & Friends", "re:call") each with a description of its concept and repertoire.
4. **Given** a visitor opens the tour dates section, **When** upcoming concerts exist, **Then** they see date, time, venue, and location for each, ordered soonest first.
5. **Given** a visitor opens the discography section, **When** they browse it, **Then** they see her recordings/CDs with descriptions.
6. **Given** a visitor opens the teaching section, **When** they read it, **Then** they see what lessons/workshops she offers and where.
7. **Given** a visitor wants to reach Francesca, **When** they open the contact section, **Then** they find a way to contact her directly.
8. **Given** a visitor is on a phone, **When** they browse any section, **Then** the layout, text, and navigation remain fully usable without horizontal scrolling or hidden content.
9. **Given** a visitor wants to view legal information, **When** they open the Impressum/Datenschutz link in the site footer, **Then** they see the legally required notice and privacy statement.

---

### User Story 2 - Francesca keeps her upcoming tour dates current herself (Priority: P2)

Francesca has a new concert booked (or a date changes/is cancelled) and needs the public site to reflect it right away, without waiting on a developer or sending anyone a text asking them to update the website.

**Why this priority**: Tour dates are the most time-sensitive, frequently-changing content on a musician's site and directly affect ticket sales and audience trust. This is the highest-value slice of "self-service maintenance" and can be delivered before the rest of content management.

**Independent Test**: Can be fully tested by logging in as Francesca, adding a new tour date, previewing it, editing an existing one, and removing a past/cancelled one — publishing each change — then confirming the public Termine section only reflects a change once she has published it, without any developer action.

**Acceptance Scenarios**:

1. **Given** Francesca is logged in, **When** she adds a new tour date with venue, location, date/time and publishes it, **Then** it appears on the public site's tour dates section, correctly ordered among existing dates.
2. **Given** Francesca is logged in, **When** she edits the details of an existing upcoming date and publishes the change, **Then** the public site reflects the update.
3. **Given** Francesca has made an unpublished draft change to a tour date, **When** she opens the preview, **Then** she sees exactly how the change will look on the public site before anyone else can see it.
4. **Given** Francesca is logged in, **When** she removes a cancelled date and publishes the change, **Then** it no longer appears on the public site.
5. **Given** a date's scheduled time has passed, **When** the public site is viewed, **Then** that date no longer appears in the upcoming list (it does not require Francesca to manually delete it to keep the list clean).
6. **Given** there are currently no upcoming dates, **When** a visitor opens the tour dates section, **Then** they see a friendly message indicating there are no dates yet, rather than an empty or broken-looking section.
7. **Given** Francesca has an unpublished draft change, **When** she navigates away without publishing, **Then** the public site continues showing the previously published version, unchanged.
8. **Given** Francesca is not logged in, **When** she (or anyone else) attempts to change a tour date directly, **Then** the system rejects the change.

---

### User Story 3 - Francesca maintains her biography, projects, discography, teaching info, and contact details herself (Priority: P3)

Francesca's career evolves — a new recording comes out, a project description needs refreshing, her teaching availability changes, or her phone number changes — and she wants to update the corresponding page herself, the same way she now updates her tour dates.

**Why this priority**: This is lower-frequency content than tour dates but is still core to the "no developer needed" promise of the site. It builds on the same login and editing pattern established in User Story 2.

**Independent Test**: Can be fully tested by logging in as Francesca, editing her biography text, adding/editing a project, adding/editing a discography entry, updating her teaching description, updating a contact detail, updating a photo, and editing the Impressum/Datenschutz text — previewing and publishing each — then confirming each change appears on the public site only once published.

**Acceptance Scenarios**:

1. **Given** Francesca is logged in, **When** she edits her biography text and publishes the change, **Then** the public Vita section reflects the new text.
2. **Given** Francesca is logged in, **When** she adds, edits, or removes a project/ensemble entry and publishes the change, **Then** the public projects section reflects the change.
3. **Given** Francesca is logged in, **When** she adds, edits, or removes a discography entry and publishes the change, **Then** the public CDs/discography section reflects the change.
4. **Given** Francesca is logged in, **When** she edits her teaching/lesson description or location and publishes the change, **Then** the public teaching section reflects the change.
5. **Given** Francesca is logged in, **When** she updates a contact detail (email, phone, location) and publishes the change, **Then** the public contact section reflects the change.
6. **Given** Francesca is logged in, **When** she replaces a photo used on the site (e.g. her portrait or a performance photo) and publishes the change, **Then** the public site displays the new photo in place of the old one.
7. **Given** Francesca is logged in, **When** she edits the Impressum/Datenschutz text and publishes the change, **Then** the public legal notice page reflects the change.
8. **Given** Francesca is logged in, **When** she requests an export of her site's content, **Then** she receives a downloadable copy of all her current content.
9. **Given** Francesca is not logged in, **When** she (or anyone else) attempts to change any of the above content directly, **Then** the system rejects the change.

---

### Edge Cases

- What happens when Francesca enters the wrong password several times in a row? The system MUST slow down or temporarily block further attempts rather than allowing unlimited guesses.
- What happens if Francesca forgets her password entirely? She MUST have a self-service way to regain access (e.g., a reset link sent to her registered email) without needing a developer to intervene.
- What happens if Francesca starts editing content, then loses her internet connection or closes the tab before saving? The system SHOULD warn her before discarding unsaved changes rather than silently losing her edits.
- What happens if someone who isn't Francesca navigates directly to the login/admin URL? They MUST see only a plain login prompt — no content, structure, or error details that reveal how the site works.
- What happens if Francesca uploads a very large photo file? The system MUST handle it gracefully (automatically optimizing it for web display) rather than failing, timing out, or slowing down the public site.
- What happens if two browser tabs are logged in and editing at the same time (e.g., Francesca on her phone and laptop)? The system MUST ensure the most recently saved version wins without corrupting content or crashing.
- What happens when the site is viewed by someone using a screen reader or other assistive technology? All public content and the login form MUST conform to WCAG 2.1 Level AA.
- What happens if Francesca leaves a draft change unpublished and doesn't return to it? The public site MUST keep showing the last published version, unchanged, until she explicitly publishes; the draft MUST remain available for her to resume or discard later.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST present a public portfolio site with, at minimum, the following sections: biography ("Vita"), projects/ensembles ("Projekte"), upcoming tour dates ("Termine"), discography ("CDs"), teaching/lessons ("Unterricht"), contact ("Kontakt"), and a legal notice/privacy statement ("Impressum"/"Datenschutz") — matching or exceeding the content currently published at https://jazz-isses.de/Francesca/.
- **FR-002**: The system MUST allow any visitor to view all public sections without creating an account or logging in.
- **FR-003**: The system MUST provide a single-admin login that only Francesca can use to access a content-editing area.
- **FR-004**: The system MUST allow Francesca, once logged in, to add, edit, and remove upcoming tour dates (date/time, venue, location, and optional details such as a ticket or event link).
- **FR-005**: The system MUST automatically stop showing a tour date in the "upcoming" list once its date/time has passed, without requiring Francesca to delete it manually.
- **FR-006**: The system MUST allow Francesca, once logged in, to edit her biography text.
- **FR-007**: The system MUST allow Francesca, once logged in, to add, edit, and remove project/ensemble entries (name and description).
- **FR-008**: The system MUST allow Francesca, once logged in, to add, edit, and remove discography entries (title and description).
- **FR-009**: The system MUST allow Francesca, once logged in, to edit her teaching/lesson description and location information.
- **FR-010**: The system MUST allow Francesca, once logged in, to edit her contact details (e.g., email, phone, location, social/booking links).
- **FR-011**: The system MUST allow Francesca, once logged in, to replace or remove photos used across the site (e.g., portrait, performance photos, discography cover art).
- **FR-012**: The system MUST reject any attempt to create, edit, or delete content from a session that is not authenticated as Francesca.
- **FR-013**: The system MUST reflect any content change Francesca publishes on the public site automatically, without requiring a manual deployment step performed by a developer.
- **FR-014**: The system MUST NOT link to or otherwise surface the login/admin area from the public site's navigation, and MUST prevent that area from being indexed by search engines.
- **FR-015**: The system MUST let Francesca regain access to her account herself if she forgets her password (e.g., via a reset link sent to her registered email), without developer involvement.
- **FR-016**: The public site MUST remain fully readable and navigable on common mobile phone and tablet screen sizes, not just desktop.
- **FR-017**: The system MUST let visitors reach Francesca directly from the public site by displaying her contact details (email, phone, and/or social/booking links) as static, always-visible information rather than requiring a submission step.
- **FR-018**: The system MUST allow Francesca, once logged in, to save a content change as a draft and preview exactly how it will appear on the public site before publishing it.
- **FR-019**: The system MUST NOT make any saved draft change visible to the public until Francesca explicitly publishes it; the previously published version MUST remain visible to visitors in the meantime.
- **FR-020**: The system MUST present a legal notice and privacy statement ("Impressum"/"Datenschutz") as part of the public site, editable by Francesca once logged in the same way as other content.
- **FR-021**: The system MUST allow Francesca, once logged in, to export/download a complete copy of all her current content on demand.
- **FR-022**: The public site and the login/content-editing area MUST conform to WCAG 2.1 Level AA accessibility guidelines.

### Key Entities

_Every editable content type below exists in a Draft and a Published version; only the Published version is publicly visible until Francesca explicitly publishes her changes (see FR-018/FR-019)._

- **Site Visitor**: Anonymous public reader of the site; read-only, no account.
- **Admin (Francesca)**: The single authenticated content owner; can log in and manage all content types below.
- **Biography**: Text (and an associated photo) describing Francesca's artistic background and career.
- **Project/Ensemble**: A named act or collaboration (e.g. "Francesca Simone & Friends", "re:call") with a name and description.
- **Tour Date**: A concert/event with date/time, venue name, location, and optional link/detail; automatically moves out of the "upcoming" view once past.
- **Discography Entry**: A recording/CD with a title, description, and optional cover image.
- **Teaching Offering**: Description of the lessons/workshops Francesca offers and where they take place.
- **Photo**: An image asset (portrait, performance photo, cover art) used across one or more public sections.
- **Contact Details**: Francesca's email, phone, location, and/or social/booking links.
- **Legal Notice & Privacy Statement (Impressum/Datenschutz)**: Required legal text (ownership/contact details and data-protection statement) displayed publicly and editable by Francesca like other content.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of the content sections present on the current site (Vita, Projekte, Termine, CDs, Unterricht, Kontakt, Impressum/AGB) are present and reachable from the new site's homepage or footer at launch.
- **SC-002**: A first-time visitor can locate Francesca's next upcoming concert date within 10 seconds of landing on the homepage.
- **SC-003**: The main content of any page is visible on a typical mobile connection within 2 seconds of navigation.
- **SC-004**: Francesca can publish a new tour date or edit an existing one herself, end-to-end (login → edit → preview → publish), in under 5 minutes, without contacting a developer.
- **SC-005**: Francesca can update her biography, a project description, a discography entry, her teaching info, a contact detail, or the Impressum/Datenschutz text herself, end-to-end (login → edit → preview → publish), in under 5 minutes, without contacting a developer.
- **SC-006**: Zero content changes succeed from a session that has not logged in as Francesca (verified via testing unauthenticated write attempts).
- **SC-007**: In a post-launch check-in, Francesca reports she can maintain the site's content on her own without needing to ask a developer for routine updates (dates, bio, discography, contact info, legal notice).
- **SC-008**: Francesca can export a complete copy of her site's content on demand, without developer assistance.
- **SC-009**: An automated accessibility scan reports no critical WCAG 2.1 Level AA violations on the primary public pages.

## Assumptions

- The initial version targets German-language content only, matching the current site; the underlying content structure will not need to be rebuilt to add Italian or English later, but translated content itself is out of scope for this feature.
- "Login" means a single admin account for Francesca; no multi-user roles, team accounts, or public registration are in scope.
- Password reset is handled via an email-based self-service flow to Francesca's registered email address; there is no requirement for multi-factor authentication in this feature (it may be added later without changing the scope defined here).
- The exact domain/hosting location (whether the new site replaces content at the existing address or moves elsewhere) is a deployment detail to be resolved during planning, not a scope decision for this specification.
- Audio/video samples, if included, will be presented via links/embeds to external platforms (e.g. streaming or video sites) rather than the site hosting and streaming media files itself.
- "Past" tour dates are simply excluded from the upcoming list per FR-005; a dedicated archive/history of past performances is not required for this feature.
