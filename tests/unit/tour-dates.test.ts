import { describe, expect, it } from "vitest";
import {
  getUpcomingTourDates,
  getPastTourDates,
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
