import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Shared field for every collection, per the constitution's i18n-readiness constraint:
 * only German ships in this feature, but every entry is explicitly tagged so a future
 * `it`/`en` locale can be added without restructuring the schema (research.md §10).
 */
const langField = z.enum(["de"]).default("de");

const linkSchema = z.object({
  label: z.string(),
  // Allows site-relative URLs ("/canzoni-italiane/") alongside absolute ones — a project may
  // link to an internal program page as well as to YouTube/SoundCloud.
  url: z.string().refine((v) => /^https?:\/\/.+/.test(v) || v.startsWith("/"), {
    message: "URL muss mit https:// oder / beginnen",
  }),
});

// Owner-replaceable document (flyer, CD info sheet) — FR-011, research.md §7.
const fileLinkSchema = z.object({
  label: z.string(),
  file: z.string(),
});

// Band/line-up entry, e.g. { name: "Florian Offermann", role: "Piano" } — FR-003/FR-004.
const memberSchema = z.object({
  name: z.string(),
  role: z.string(),
});

// --- Biography (singleton) — 001 FR-006; 002 FR-002 (full Vita + landing teaser split) ---
const biography = defineCollection({
  loader: glob({ pattern: "index.md", base: "./src/content/biography/de" }),
  schema: z.object({
    lang: langField,
    name: z.string(),
    tagline: z.string().max(200),
    portrait: z.string(),
    portraitAlt: z.string(),
    // Vita-page portrait (old site's portrait2); falls back to `portrait` when unset.
    portraitVita: z.string().optional(),
    portraitVitaAlt: z.string().optional(),
    // Short landing-page excerpt; the markdown body carries the full Kurzvita (002 FR-002).
    teaser: z
      .string()
      .default(
        "Francesca Simone verbindet italienische Leichtigkeit, Jazz- und Pop-Sensibilität und eine ausdrucksstarke Bühnenpräsenz zu Konzerten, die berühren.",
      ),
    pullQuote: z.string().optional(),
  }),
});

// --- Project / Ensemble (repeatable) — 001 FR-007; 002 FR-003 (full descriptions + media) ---
const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects/de" }),
  schema: z.object({
    lang: langField,
    name: z.string(),
    order: z.number().optional(),
    photo: z.string().optional(),
    photoAlt: z.string().optional(),
    programName: z.string().optional(),
    members: z.array(memberSchema).optional(),
    links: z.array(linkSchema).optional(),
    flyers: z.array(fileLinkSchema).optional(),
  }),
});

// --- Stage program, e.g. „Canzoni italiane" (repeatable) — 002 FR-004/FR-012 ---
// Folder collection so the owner can add future program pages herself (research.md §4);
// each entry becomes a page at /<slug>/ via src/pages/[program].astro.
const programs = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/programs/de" }),
  schema: z.object({
    lang: langField,
    title: z.string(),
    subtitle: z.string().optional(),
    intro: z.string(),
    quote: z.string().optional(),
    // Rendered together with `quote`, never separately (spec edge case: attribution).
    quoteAttribution: z.string().optional(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    // Self-hosted audio sample („Hörprobe") — native <audio>, no third-party embed (FR-017).
    audioSample: z.string().optional(),
    flyer: fileLinkSchema.optional(),
    lineup: z.array(memberSchema).optional(),
    pitchHeading: z.string().optional(),
    pitchText: z.string().optional(),
    order: z.number().optional(),
  }),
});

// --- Tour Date (repeatable) — FR-004, FR-005 ---
const tourDates = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/tour-dates/de" }),
  schema: z.object({
    lang: langField,
    date: z.coerce.date(),
    venueName: z.string(),
    location: z.string(),
    eventLink: z.string().url().optional(),
    notes: z.string().optional(),
    // 002 FR-006: who performs; rendering falls back to DEFAULT_ENSEMBLE when unset.
    ensemble: z.string().optional(),
  }),
});

// --- Discography Entry (repeatable) — FR-008 ---
const discography = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/discography/de" }),
  schema: z.object({
    lang: langField,
    title: z.string(),
    releaseYear: z.number().optional(),
    coverImage: z.string().optional(),
    coverImageAlt: z.string().optional(),
    links: z.array(linkSchema).optional(),
    // 002 FR-005: per-CD info sheet („Info-PDF") + explicit display order on /cds/.
    infoPdf: z.string().optional(),
    order: z.number().optional(),
  }),
});

// --- Teaching Offering (singleton) — 001 FR-009; 002 FR-007 (full offer + methods) ---
const teaching = defineCollection({
  loader: glob({ pattern: "index.md", base: "./src/content/teaching/de" }),
  schema: z.object({
    lang: langField,
    locations: z.array(z.string()),
    subtitle: z.string().optional(),
    offerings: z.array(z.string()).default([]),
    methodsHeading: z.string().optional(),
    methodsText: z.string().optional(),
    schedulingText: z.string().optional(),
    // „Musikalische Weiterbildung" section (harvest find, old unterricht.html).
    educationHeading: z.string().optional(),
    educationText: z.string().optional(),
  }),
});

// --- Contact Details (singleton) — FR-010, FR-017 ---
const contact = defineCollection({
  loader: glob({ pattern: "index.md", base: "./src/content/contact/de" }),
  schema: z.object({
    lang: langField,
    email: z.string().email(),
    phone: z.string().optional(),
    // 002 FR-008: the old site lists landline AND mobile.
    phoneMobile: z.string().optional(),
    location: z.string().optional(),
    socialLinks: z.array(linkSchema).optional(),
  }),
});

/**
 * --- Global site texts (singleton) — FR-002 ---
 *
 * Every string that appears on a public page but doesn't belong to a content entry lives here,
 * so nothing on the site is only changeable by editing code. Each field carries a default so a
 * partially-filled file can never break the build — a CMS save that drops a field degrades to
 * the shipped wording instead of a failed deploy.
 *
 * Group-level fallbacks use `.prefault({})`, not `.default({})`: under Zod v4 (Astro 7) a
 * `.default()` value is returned as-is without parsing, so `{}` would silently skip every
 * inner field default; `.prefault()` parses the fallback and fills them in.
 */
const site = defineCollection({
  loader: glob({ pattern: "index.md", base: "./src/content/site/de" }),
  schema: z.object({
    lang: langField,
    seoTitle: z.string().default("Francesca Simone — Sängerin, Songwriterin, Gesangspädagogin"),
    seoDescription: z.string().default(""),
    brand: z.string().default("Francesca Simone"),
    skipLinkLabel: z.string().default("Zum Inhalt springen"),
    nav: z
      .object({
        start: z.string().default("Start"),
        vita: z.string().default("Vita"),
        projekte: z.string().default("Projekte"),
        termine: z.string().default("Termine"),
        cds: z.string().default("CDs"),
        unterricht: z.string().default("Unterricht"),
        kontakt: z.string().default("Kontakt"),
      })
      .prefault({}),
    hero: z
      .object({
        welcome: z.string().default("Willkommen · Benvenuti"),
        name: z.string().default("Francesca Simone"),
        role: z.string().default("Sängerin · Songwriterin · Gesangspädagogin"),
        primaryCtaLabel: z.string().default("Konzert anfragen"),
        secondaryCtaLabel: z.string().default("Programme entdecken"),
        // 002 US3: hero photo (old site's stage image), owner-replaceable like all media.
        image: z.string().default("/uploads/hero.jpg"),
        imageAlt: z.string().default("Francesca Simone auf der Bühne"),
      })
      .prefault({}),
    sections: z
      .object({
        vitaEyebrow: z.string().default("Vita"),
        projekteEyebrow: z.string().default("Projekte"),
        projekteHeading: z.string().default("Auf der Bühne"),
        termineEyebrow: z.string().default("Termine"),
        termineHeading: z.string().default("Nächste Konzerte"),
        termineEmpty: z
          .string()
          .default("Aktuell sind keine Termine geplant — schauen Sie bald wieder vorbei."),
        termineEmptyCtaLabel: z.string().default("Oder nehmen Sie direkt Kontakt auf."),
        termineTicketLabel: z.string().default("Details / Tickets"),
        cdsEyebrow: z.string().default("CDs"),
        cdsHeading: z.string().default("Diskografie"),
        unterrichtEyebrow: z.string().default("Unterricht"),
        unterrichtHeading: z.string().default("Gesang & Stimmarbeit"),
        kontaktEyebrow: z.string().default("Kontakt"),
        kontaktHeading: z
          .string()
          .default("Konzert anfragen, Unterricht buchen, einfach schreiben."),
      })
      .prefault({}),
    legalPages: z
      .object({
        eyebrow: z.string().default("Rechtliches"),
        updatedLabel: z.string().default("Zuletzt aktualisiert"),
        impressumDescription: z.string().default("Impressum von Francesca Simone"),
        datenschutzDescription: z.string().default("Datenschutzerklärung von Francesca Simone"),
      })
      .prefault({}),
    footer: z
      .object({
        tagline: z
          .string()
          .default("Francesca Simone — Sängerin · Songwriterin · Gesangspädagogin"),
        copyright: z.string().default("Francesca Simone"),
      })
      .prefault({}),
    // --- 002: hybrid IA & new surfaces. Defaults ship the old site's wording. ---
    teasers: z
      .object({
        vitaCtaLabel: z.string().default("Zur Vita"),
        projekteCtaLabel: z.string().default("Alle Projekte"),
        termineCtaLabel: z.string().default("Alle Termine"),
        cdsCtaLabel: z.string().default("Alle CDs"),
        unterrichtCtaLabel: z.string().default("Unterricht ansehen"),
        kontaktCtaLabel: z.string().default("Kontakt aufnehmen"),
        programCtaLabel: z.string().default("Canzoni italiane entdecken"),
      })
      .prefault({}),
    subpages: z
      .object({
        vitaEyebrow: z.string().default("Vita"),
        vitaHeading: z.string().default("Francesca Simone"),
        projekteEyebrow: z.string().default("Projekte"),
        projekteHeading: z.string().default("Programme mit Charakter."),
        projekteProgramLabel: z.string().default("Aktuelles Programm"),
        projekteIntro: z
          .string()
          .default(
            "Von italienischen Chansons über Songs der 70er bis zu mehrstimmigen Arrangements.",
          ),
        termineEyebrow: z.string().default("News & Termine"),
        termineHeading: z.string().default("Live erleben."),
        termineIntro: z.string().default("Aktuelle und vergangene Termine"),
        cdsEyebrow: z.string().default("CDs"),
        cdsHeading: z.string().default("Musik zum Mitnehmen."),
        cdsIntro: z
          .string()
          .default("Cover und Beschreibungen der vorhandenen CD-Veröffentlichungen."),
        unterrichtEyebrow: z.string().default("Unterricht & Stimme"),
        unterrichtHeading: z.string().default("Die eigene Stimme entdecken."),
        unterrichtIntro: z
          .string()
          .default(
            "Gesang, Stimmarbeit, Chorleitung, Workshops und Klangarbeit — für Anfänger, Fortgeschrittene, Gruppen und Teams.",
          ),
        kontaktEyebrow: z.string().default("Kontakt"),
        kontaktHeading: z.string().default("Anfragen & Buchungen."),
      })
      .prefault({}),
    archive: z
      .object({
        heading: z.string().default("Vergangene Termine"),
        empty: z.string().default("Noch keine vergangenen Termine."),
      })
      .prefault({}),
    downloads: z
      .object({
        infoPdfLabel: z.string().default("Info-PDF"),
        externalLinkHint: z.string().default("öffnet externe Seite"),
        audioLabel: z.string().default("Hörprobe"),
      })
      .prefault({}),
    program: z
      .object({
        lineupHeading: z.string().default("Besetzung"),
        bookingCtaLabel: z.string().default("Konzert anfragen"),
        emailCtaLabel: z.string().default("E-Mail schreiben"),
        flyerCtaLabel: z.string().default("Projektflyer herunterladen"),
        emailSubjectPrefix: z.string().default("Anfrage"),
      })
      .prefault({}),
    contactLabels: z
      .object({
        phone: z.string().default("Telefon"),
        mobile: z.string().default("Mobil"),
        email: z.string().default("E-Mail"),
        location: z.string().default("Ort"),
      })
      .prefault({}),
  }),
});

// --- Legal Notice & Privacy Statement (two singletons) — FR-001, FR-020 ---
const legal = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/legal/de" }),
  schema: z.object({
    lang: langField,
    title: z.string(),
    lastUpdated: z.coerce.date(),
  }),
});

export const collections = {
  site,
  biography,
  projects,
  programs,
  "tour-dates": tourDates,
  discography,
  teaching,
  contact,
  legal,
};
