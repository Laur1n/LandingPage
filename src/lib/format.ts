/**
 * Small formatting rules shared by pages and landing sections — each exists exactly once so
 * the landing teaser and its subpage can never drift apart.
 */

/**
 * International tel: href — the German "(0)" trunk prefix must be dropped, matching the old
 * site's links (tel:+492266463025, not tel:+4902266463025).
 */
export function telHref(value: string): string {
  return `tel:${value.replace(/\(0\)/g, "").replace(/[^+\d]/g, "")}`;
}

/** Split a plain-text CMS field (Decap `text` widget) into paragraphs on blank lines. */
export function paragraphs(text: string | undefined): string[] {
  const trimmed = text?.trim();
  return trimmed ? trimmed.split(/\n\s*\n/) : [];
}

/** First paragraph of a markdown body, flattened to one line — used for landing teasers. */
export function firstParagraph(body: string | undefined): string {
  return paragraphs(body)[0]?.replace(/\n/g, " ") ?? "";
}
