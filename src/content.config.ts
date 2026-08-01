import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const langField = z.enum(["de"]).default("de");

const linkSchema = z.object({
  label: z.string(),
  url: z.string().refine((v) => /^https?:\/\/.+/.test(v) || v.startsWith("/"), {
    message: "URL muss mit https:// oder / beginnen",
  }),
});

const about = defineCollection({
  loader: glob({ pattern: "index.md", base: "./src/content/about/de" }),
  schema: z.object({
    lang: langField,
    name: z.string(),
    tagline: z.string().max(200),
    portrait: z.string(),
    portraitAlt: z.string(),
    portraitPage: z.string().optional(),
    portraitPageAlt: z.string().optional(),
    teaser: z.string(),
    pullQuote: z.string().optional(),
  }),
});

/** Professional areas — each entry becomes a page at /<slug>/ (Cue Pilot, Sportlehrer, …). */
const offerings = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/offerings/de" }),
  schema: z.object({
    lang: langField,
    title: z.string(),
    subtitle: z.string().optional(),
    intro: z.string(),
    teaser: z.string(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    order: z.number().optional(),
    links: z.array(linkSchema).optional(),
    quote: z.string().optional(),
    quoteAttribution: z.string().optional(),
    pitchHeading: z.string().optional(),
    pitchText: z.string().optional(),
    ctaLabel: z.string().optional(),
  }),
});

const contact = defineCollection({
  loader: glob({ pattern: "index.md", base: "./src/content/contact/de" }),
  schema: z.object({
    lang: langField,
    email: z.string().email(),
    phone: z.string().optional(),
    phoneMobile: z.string().optional(),
    location: z.string().optional(),
    socialLinks: z.array(linkSchema).optional(),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: "index.md", base: "./src/content/site/de" }),
  schema: z.object({
    lang: langField,
    seoTitle: z.string().default("Laurin Wünsch — IT-Berater · Sport · Cue Pilot"),
    seoDescription: z.string().default(""),
    brand: z.string().default("Laurin Wünsch"),
    skipLinkLabel: z.string().default("Zum Inhalt springen"),
    nav: z
      .object({
        start: z.string().default("Start"),
        cuePilot: z.string().default("Cue Pilot"),
        sportlehrer: z.string().default("Sportlehrer"),
        aufgussmeister: z.string().default("Aufgussmeister"),
        ueberMich: z.string().default("Über mich"),
        kontakt: z.string().default("Kontakt"),
      })
      .prefault({}),
    hero: z
      .object({
        welcome: z.string().default("Willkommen"),
        name: z.string().default("Laurin Wünsch"),
        role: z.string().default("IT-Berater · Sportlehrer · Aufgussmeister"),
        primaryCtaLabel: z.string().default("Kontakt aufnehmen"),
        secondaryCtaLabel: z.string().default("Bereiche entdecken"),
        image: z.string().default("/uploads/hero.jpg"),
        imageAlt: z.string().default("Laurin Wünsch"),
      })
      .prefault({}),
    sections: z
      .object({
        offeringsEyebrow: z.string().default("Schwerpunkte"),
        offeringsHeading: z.string().default("Was ich anbiete"),
        aboutEyebrow: z.string().default("Über mich"),
        aboutHeading: z.string().default("Persönlich & professionell"),
        kontaktEyebrow: z.string().default("Kontakt"),
        kontaktHeading: z.string().default("Sprechen wir über Ihr Projekt."),
      })
      .prefault({}),
    legalPages: z
      .object({
        eyebrow: z.string().default("Rechtliches"),
        updatedLabel: z.string().default("Zuletzt aktualisiert"),
        impressumDescription: z.string().default("Impressum"),
        datenschutzDescription: z.string().default("Datenschutzerklärung"),
      })
      .prefault({}),
    footer: z
      .object({
        tagline: z.string().default("Laurin Wünsch — IT-Berater · Sportlehrer · Aufgussmeister"),
        copyright: z.string().default("Laurin Wünsch"),
      })
      .prefault({}),
    teasers: z
      .object({
        aboutCtaLabel: z.string().default("Mehr über mich"),
        offeringsCtaLabel: z.string().default("Alle Bereiche"),
        kontaktCtaLabel: z.string().default("Kontakt aufnehmen"),
      })
      .prefault({}),
    subpages: z
      .object({
        aboutEyebrow: z.string().default("Über mich"),
        aboutHeading: z.string().default("Laurin Wünsch"),
        kontaktEyebrow: z.string().default("Kontakt"),
        kontaktHeading: z.string().default("Anfragen & Zusammenarbeit"),
      })
      .prefault({}),
    offering: z
      .object({
        contactCtaLabel: z.string().default("Anfrage senden"),
        emailCtaLabel: z.string().default("E-Mail schreiben"),
        emailSubjectPrefix: z.string().default("Anfrage"),
        externalLinkHint: z.string().default("öffnet externe Seite"),
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
  about,
  offerings,
  contact,
  legal,
};
