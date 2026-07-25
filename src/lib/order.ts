/**
 * Owner-managed display order (FR-012): entries carry an optional `order` field; unset entries
 * sink to the end. One comparator so a landing teaser and its subpage always sort identically.
 */
interface Ordered {
  data: { order?: number };
}

export function sortByOrder<T extends Ordered>(
  entries: T[],
  tiebreak: (a: T, b: T) => number = () => 0,
): T[] {
  return [...entries].sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99) || tiebreak(a, b));
}

/** German-locale title tiebreak for collections whose entries have a `title`. */
export function byGermanTitle<T extends { data: { title: string } }>(a: T, b: T): number {
  return a.data.title.localeCompare(b.data.title, "de");
}
