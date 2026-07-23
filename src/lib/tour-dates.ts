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
