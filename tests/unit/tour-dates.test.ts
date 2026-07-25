import { describe, expect, it } from "vitest";
import {
  getUpcomingTourDates,
  getPastTourDates,
  groupPastByYear,
  DEFAULT_ENSEMBLE,
  type TourDateLike,
} from "../../src/lib/tour-dates";

const now = new Date("2026-07-23T12:00:00Z");

function entry(id: string, date: string, venueName = "Test Venue"): TourDateLike {
  return { id, data: { date: new Date(date), venueName, location: "Testort" } };
}

describe("getUpcomingTourDates", () => {
  it("excludes dates before now (FR-005)", () => {
    const entries = [
      entry("past", "2026-01-01T19:00:00Z"),
      entry("future", "2026-12-01T19:00:00Z"),
    ];
    const upcoming = getUpcomingTourDates(entries, now);
    expect(upcoming.map((e) => e.id)).toEqual(["future"]);
  });

  it("includes a date exactly at now", () => {
    const entries = [entry("exact", now.toISOString())];
    expect(getUpcomingTourDates(entries, now).map((e) => e.id)).toEqual(["exact"]);
  });

  it("sorts upcoming dates ascending (soonest first)", () => {
    const entries = [
      entry("later", "2026-12-01T19:00:00Z"),
      entry("sooner", "2026-08-01T19:00:00Z"),
      entry("soonest", "2026-07-24T19:00:00Z"),
    ];
    const upcoming = getUpcomingTourDates(entries, now);
    expect(upcoming.map((e) => e.id)).toEqual(["soonest", "sooner", "later"]);
  });

  it("returns an empty array when there are no upcoming dates", () => {
    const entries = [entry("past", "2020-01-01T19:00:00Z")];
    expect(getUpcomingTourDates(entries, now)).toEqual([]);
  });
});

describe("getPastTourDates", () => {
  it("includes only dates before now, sorted most-recent-first", () => {
    const entries = [
      entry("older", "2026-01-01T19:00:00Z"),
      entry("newer", "2026-06-01T19:00:00Z"),
      entry("future", "2026-12-01T19:00:00Z"),
    ];
    const past = getPastTourDates(entries, now);
    expect(past.map((e) => e.id)).toEqual(["newer", "older"]);
  });
});

describe("groupPastByYear (002 FR-006)", () => {
  it("groups past dates by year, newest year first, newest date first within a year", () => {
    const entries = [
      entry("aug-2023", "2023-08-26T19:30:00Z"),
      entry("nov-2023", "2023-11-27T19:30:00Z"),
      entry("mar-2024", "2024-03-15T19:00:00Z"),
      entry("nov-2024", "2024-11-15T20:00:00Z"),
      entry("may-2025", "2025-05-05T19:30:00Z"),
      entry("future", "2026-10-02T19:30:00Z"),
    ];
    const groups = groupPastByYear(entries, now);
    expect(groups.map((g) => g.year)).toEqual([2025, 2024, 2023]);
    expect(groups[1].dates.map((e) => e.id)).toEqual(["nov-2024", "mar-2024"]);
    expect(groups[2].dates.map((e) => e.id)).toEqual(["nov-2023", "aug-2023"]);
  });

  it("excludes upcoming dates entirely", () => {
    const entries = [entry("future", "2026-12-01T19:00:00Z")];
    expect(groupPastByYear(entries, now)).toEqual([]);
  });

  it("returns an empty array for no entries (archive empty state)", () => {
    expect(groupPastByYear([], now)).toEqual([]);
  });

  it("a date on today's boundary is upcoming, not archived", () => {
    const entries = [entry("exact", now.toISOString())];
    expect(groupPastByYear(entries, now)).toEqual([]);
    expect(getUpcomingTourDates(entries, now)).toHaveLength(1);
  });
});

describe("DEFAULT_ENSEMBLE", () => {
  it("matches the old site's line-up wording", () => {
    expect(DEFAULT_ENSEMBLE).toBe("Francesca Simone & Friends");
  });
});
