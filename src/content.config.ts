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
  url: z.string().url(),
});

// --- Biography (singleton) — FR-006 ---
const biography = defineCollection({
  loader: glob({ pattern: "index.md", base: "./src/content/biography/de" }),
  schema: z.object({
    lang: langField,
    name: z.string(),
    tagline: z.string().max(200),
    portrait: z.string(),
    portraitAlt: z.string(),
  }),
});

// --- Project / Ensemble (repeatable) — FR-007 ---
const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects/de" }),
  schema: z.object({
    lang: langField,
    name: z.string(),
    order: z.number().optional(),
    photo: z.string().optional(),
    photoAlt: z.string().optional(),
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
  }),
});

// --- Teaching Offering (singleton) — FR-009 ---
const teaching = defineCollection({
  loader: glob({ pattern: "index.md", base: "./src/content/teaching/de" }),
  schema: z.object({
    lang: langField,
    locations: z.array(z.string()),
  }),
});

// --- Contact Details (singleton) — FR-010, FR-017 ---
const contact = defineCollection({
  loader: glob({ pattern: "index.md", base: "./src/content/contact/de" }),
  schema: z.object({
    lang: langField,
    email: z.string().email(),
    phone: z.string().optional(),
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
      .default({}),
    hero: z
      .object({
        welcome: z.string().default("Willkommen · Benvenuti"),
        name: z.string().default("Francesca Simone"),
        role: z.string().default("Sängerin · Songwriterin · Gesangspädagogin"),
        primaryCtaLabel: z.string().default("Konzert anfragen"),
        secondaryCtaLabel: z.string().default("Programme entdecken"),
      })
      .default({}),
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
      .default({}),
    legalPages: z
      .object({
        eyebrow: z.string().default("Rechtliches"),
        updatedLabel: z.string().default("Zuletzt aktualisiert"),
        impressumDescription: z.string().default("Impressum von Francesca Simone"),
        datenschutzDescription: z.string().default("Datenschutzerklärung von Francesca Simone"),
      })
      .default({}),
    footer: z
      .object({
        tagline: z
          .string()
          .default("Francesca Simone — Sängerin · Songwriterin · Gesangspädagogin"),
        copyright: z.string().default("Francesca Simone"),
      })
      .default({}),
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
  "tour-dates": tourDates,
  discography,
  teaching,
  contact,
  legal,
};
