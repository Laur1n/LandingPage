import { describe, expect, it } from "vitest";
import { formatEventDate, formatEventTime, formatUpdatedDate, telHref } from "../../src/lib/format";

/**
 * Regression coverage for the "Termin shows 2 hours early" bug: `Intl.DateTimeFormat` without
 * an explicit `timeZone` silently uses the build machine's own OS timezone (UTC on CI), not
 * Europe/Berlin. Each case below is a real stored instant (UTC, as `z.coerce.date()` produces
 * from the CMS's `+02:00`/`+01:00` frontmatter) and asserts it renders back as the German wall
 * clock time that was actually entered — once during CEST, once during CET, so a fix that only
 * hardcodes a fixed offset (e.g. always +2h) rather than the real IANA zone would fail here.
 */
describe("formatEventTime", () => {
  it("renders a summer (CEST, UTC+2) instant as the originally entered local time", () => {
    // src/content/tour-dates/de/2026-10-02-jubilate-forum-lindlar.md: date: 2026-10-02T19:30:00+02:00
    expect(formatEventTime(new Date("2026-10-02T17:30:00.000Z"))).toBe("19:30");
  });

  it("renders a winter (CET, UTC+1) instant as the originally entered local time", () => {
    // src/content/tour-dates/de/2024-11-03-klangraeume-lindlar.md: date: 2024-11-03T17:00:00+01:00
    expect(formatEventTime(new Date("2024-11-03T16:00:00.000Z"))).toBe("17:00");
  });
});

describe("formatEventDate", () => {
  it("renders a summer instant with the correct local calendar date", () => {
    expect(formatEventDate(new Date("2026-10-02T17:30:00.000Z"))).toBe("02.10.2026");
  });

  it("renders a winter instant with the correct local calendar date", () => {
    expect(formatEventDate(new Date("2024-11-03T16:00:00.000Z"))).toBe("03.11.2024");
  });

  it("does not roll a late-evening local date back to the previous day", () => {
    // 2024-03-14T20:00:00+01:00 (CET) — UTC 19:00, close enough to midnight that a naive
    // formatter defaulting to a non-European timezone could plausibly shift the date too.
    expect(formatEventDate(new Date("2024-03-14T19:00:00.000Z"))).toBe("14.03.2024");
  });
});

describe("formatUpdatedDate", () => {
  it("renders a date-only lastUpdated value on the correct day", () => {
    // src/content/legal/de/datenschutz.md: lastUpdated: 2026-07-23 (parsed as UTC midnight)
    expect(formatUpdatedDate(new Date("2026-07-23T00:00:00.000Z"))).toBe("23. Juli 2026");
  });
});

describe("telHref", () => {
  it("drops the German '(0)' trunk prefix", () => {
    expect(telHref("+49 (0) 2266 463025")).toBe("tel:+492266463025");
  });
});
