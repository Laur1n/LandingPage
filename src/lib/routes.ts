/**
 * Slugs owned by file-based routes or infrastructure. A `programs` entry with one of these
 * slugs would be silently shadowed by Astro's route priority — getStaticPaths in
 * src/pages/[program].astro turns that into a loud build error instead. The Decap hint on the
 * program title field lists the same names for the owner.
 */
export const RESERVED_SLUGS = [
  "vita",
  "projekte",
  "termine",
  "cds",
  "unterricht",
  "kontakt",
  "impressum",
  "datenschutz",
  "admin",
] as const;
