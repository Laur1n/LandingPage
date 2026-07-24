import { getCollection } from "astro:content";

/**
 * Global site texts (headings, labels, hero copy, footer) as edited under „Website-Texte"
 * in the CMS. Every component that renders chrome pulls its wording from here rather than
 * hardcoding German strings, so nothing on the public site is code-only.
 */
export async function getSiteTexts() {
  const [entry] = await getCollection("site");
  return entry.data;
}
