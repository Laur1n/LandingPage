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

/**
 * Content is authored in German local time, but the static build runs on CI infrastructure
 * whose OS timezone is UTC. `Intl.DateTimeFormat` silently falls back to that machine's
 * timezone when none is given, so every date/time on the site must pin this explicitly —
 * an IANA zone (not a fixed UTC offset) so the CEST/CET boundary keeps resolving correctly.
 */
const SITE_TIME_ZONE = "Europe/Berlin";

const eventDateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: SITE_TIME_ZONE,
});

const eventTimeFormatter = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: SITE_TIME_ZONE,
});

const updatedDateFormatter = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "long",
  timeZone: SITE_TIME_ZONE,
});

/** "02.10.2026" — always the date as authored in the CMS, regardless of build-machine timezone. */
export function formatEventDate(date: Date): string {
  return eventDateFormatter.format(date);
}

/** "19:30" — always the time as authored in the CMS, regardless of build-machine timezone. */
export function formatEventTime(date: Date): string {
  return eventTimeFormatter.format(date);
}

/** "23. Juli 2026" — used for legal pages' "zuletzt aktualisiert" date. */
export function formatUpdatedDate(date: Date): string {
  return updatedDateFormatter.format(date);
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
