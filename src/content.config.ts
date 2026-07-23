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
  biography,
  projects,
  "tour-dates": tourDates,
  discography,
  teaching,
  contact,
  legal,
};
