export interface TourDateLike {
  id: string;
  data: {
    date: Date;
    venueName: string;
    location: string;
    eventLink?: string;
    notes?: string;
  };
}

/**
 * FR-005: a tour date automatically stops appearing in the "upcoming" list once its
 * date/time has passed — Francesca never has to delete it manually. `now` is injectable
 * for deterministic testing.
 */
export function getUpcomingTourDates<T extends TourDateLike>(
  entries: T[],
  now: Date = new Date(),
): T[] {
  return entries
    .filter((entry) => entry.data.date.getTime() >= now.getTime())
    .sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
}

export function getPastTourDates<T extends TourDateLike>(
  entries: T[],
  now: Date = new Date(),
): T[] {
  return entries
    .filter((entry) => entry.data.date.getTime() < now.getTime())
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/**
 * 002 FR-006: every date on the old site names its ensemble; entries without one render
 * with this default so the owner only has to fill the field for other line-ups.
 */
export const DEFAULT_ENSEMBLE = "Francesca Simone & Friends";

export interface YearGroup<T> {
  year: number;
  dates: T[];
}

/**
 * 002 FR-006: the archive mirrors the old site's „Aktuelle und vergangene Termine" —
 * past dates grouped by year, newest year first, newest date first within a year.
 * Grouping happens at build time; the daily scheduled rebuild rolls dates over from
 * upcoming to past without anyone editing content.
 */
export function groupPastByYear<T extends TourDateLike>(
  entries: T[],
  now: Date = new Date(),
): YearGroup<T>[] {
  const groups = new Map<number, T[]>();
  for (const entry of getPastTourDates(entries, now)) {
    const year = entry.data.date.getFullYear();
    const bucket = groups.get(year);
    if (bucket) bucket.push(entry);
    else groups.set(year, [entry]);
  }
  // getPastTourDates already sorts newest-first, so insertion order within a bucket is
  // correct and the map keys just need sorting descending.
  return [...groups.entries()].sort(([a], [b]) => b - a).map(([year, dates]) => ({ year, dates }));
}
