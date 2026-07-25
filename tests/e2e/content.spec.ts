import { test, expect } from "@playwright/test";

/**
 * 002 US1 — SC-001 content-presence audit. Assertions are generated from the MUST-show tables
 * in specs/002-content-migration-redesign/contracts/routes.md, which in turn mirror the old
 * site capture (content-inventory.md / harvest-report.md). If one of these fails, content the
 * old site's audience relies on is missing.
 */

import { PUBLIC_ROUTES } from "./routes";

test.describe("Content audit (002 FR-001…FR-009)", () => {
  // The audit checks WHAT is on each page, not how it animates in. Reduced-motion emulation
  // disables the scroll reveals (per contracts/motion.md every element is then fully visible),
  // so visibility assertions don't depend on scroll position. Motion behavior itself is
  // covered by motion.spec.ts.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("/vita/ carries the complete Kurzvita", async ({ page }) => {
    await page.goto("/vita/");
    await expect(page.getByRole("heading", { level: 1, name: "Francesca Simone" })).toBeVisible();
    await expect(page.getByText("Deutsch-italienische Sängerin, Songwriterin")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Kurzvita" })).toBeVisible();
    await expect(page.getByText("1995 ihr eigenes Trio gründete")).toBeVisible();
    await expect(page.getByText("„Projekt 70“")).toBeVisible();
    await expect(page.getByText("Musikhochschule Köln")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Italienisch für Fortgeschrittene" }),
    ).toBeVisible();
    await expect(page.locator(".vita-page__portrait img")).toBeVisible();
  });

  test("/projekte/ shows all three projects in full", async ({ page }) => {
    await page.goto("/projekte/");
    for (const name of ["Francesca Simone & Friends", "re:call", "Francesca Simone Trio"]) {
      await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
    }
    // Full descriptions, members, program names (FR-003)
    await expect(page.getByText("an den Comersee nach Italien geführt")).toBeVisible();
    await expect(page.getByText("„When I was Young“ – Songs of the 70s").first()).toBeVisible();
    await expect(page.getByText("Gitarre / Bass: Axel Fabry")).toBeVisible();
    await expect(page.getByText("Gesang: Alexandra Naumann")).toBeVisible();
    await expect(page.getByText("CD: re:call – heart of gold")).toBeVisible();
    // Exact harvested outbound links
    await expect(
      page.locator('a[href="https://www.youtube.com/watch?v=GeXVWCsDG4k"]'),
    ).toBeVisible();
    await expect(
      page.locator('a[href="https://www.youtube.com/watch?v=6y8VhOesW44"]'),
    ).toBeVisible();
    await expect(page.locator('a[href="https://soundcloud.com/user-942746890"]')).toBeVisible();
    // Flyer downloads + internal program link
    expect(await page.locator('a[href^="/uploads/flyer-"]').count()).toBeGreaterThanOrEqual(5);
    await expect(page.locator('a[href="/canzoni-italiane/"]').first()).toBeVisible();
  });

  test("/canzoni-italiane/ is a complete program page", async ({ page }) => {
    await page.goto("/canzoni-italiane/");
    await expect(page.getByRole("heading", { level: 1, name: "Canzoni italiane" })).toBeVisible();
    await expect(page.getByText("Vertraute italienische Lieder, neu gehört")).toBeVisible();
    // Quote never renders without its attribution (spec edge case)
    const quoteFigure = page.locator("figure", { hasText: "Italo-Schnulze" });
    await expect(quoteFigure).toBeVisible();
    await expect(quoteFigure.getByText("A. Fasel")).toBeVisible();
    // Song examples + sections
    await expect(page.getByRole("heading", { name: "Volare, Azzurro & mehr" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Eigene Handschrift" })).toBeVisible();
    // Besetzung with all four members
    await expect(page.getByRole("heading", { name: "Besetzung" })).toBeVisible();
    for (const member of [
      "Francesca Simone",
      "Florian Offermann",
      "Axel Fabry",
      "Andreas Lasonczyk",
    ]) {
      await expect(page.locator("dd", { hasText: member })).toBeVisible();
    }
    // Booking pitch + CTAs + flyer + self-hosted audio sample
    await expect(page.getByRole("heading", { name: "Ein Abend wie in Italien." })).toBeVisible();
    await expect(page.locator('a[href="/kontakt/"]').first()).toBeVisible();
    await expect(page.locator('a[href^="mailto:"]')).toBeVisible();
    await expect(page.locator('a[href="/uploads/flyer-canzoni-italiane.pdf"]')).toBeVisible();
    await expect(page.locator("audio[src='/uploads/canzoni-hoerprobe.mp3']")).toBeAttached();
  });

  test("/termine/ shows upcoming first and the year-grouped archive (all 10 migrated dates)", async ({
    page,
  }) => {
    await page.goto("/termine/");
    // Upcoming
    await expect(page.getByText("02.10.2026")).toBeVisible();
    await expect(page.getByText("Premiere: Canzoni Italiane")).toBeVisible();
    // Archive year groups, newest first
    const years = page.locator("[data-year-heading]");
    await expect(years).toHaveText(["2025", "2024", "2023"]);
    // Every migrated venue appears
    for (const venue of [
      "Alte Drahtzieherei",
      "Blaumilch-Salon",
      "Klangräume Lindlar",
      "Studiobühne der Halle 32",
      "Walder Kulturkotten",
      "Vorhof-Flimmern",
      "Jubilateforum Lindlar",
    ]) {
      await expect(page.getByText(venue).first()).toBeVisible();
    }
    expect(await page.getByText("Atelier Colonia").count()).toBe(2);
    // Graceful notes rendering (spec edge case)
    await expect(page.getByText("nur nach persönlicher Anmeldung")).toBeVisible();
    // Event link carried over
    await expect(page.locator('a[href="http://www.altedrahtzieherei.de/"]')).toBeVisible();
  });

  test("/cds/ lists all six releases with cover and Info-PDF", async ({ page }) => {
    await page.goto("/cds/");
    const titles = [
      "re:call – Heart of Gold",
      "Ad Alta Voce",
      "Azzurro",
      "Guarda li",
      "Ciao Maria",
      "This",
    ];
    for (const title of titles) {
      await expect(page.getByRole("heading", { level: 3, name: title })).toBeVisible();
    }
    expect(await page.locator('a[href^="/uploads/cd-"][href$="-info.pdf"]').count()).toBe(6);
    expect(await page.locator('img[src^="/uploads/cd-"]').count()).toBe(6);
  });

  test("/unterricht/ carries the full teaching offer", async ({ page }) => {
    await page.goto("/unterricht/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Die eigene Stimme entdecken." }),
    ).toBeVisible();
    await expect(page.getByText("Seit 1994 arbeitet Francesca Simone freiberuflich")).toBeVisible();
    // All six offer items
    for (const offering of [
      "Einzelunterricht für Anfänger und Fortgeschrittene",
      "Chorleitung, Chorworkshops und Chorarrangements",
      "Coaching für Ensembles",
      "Weiterbildung für Erzieherinnen und Erzieher",
      "Stimmtraining für Lehrerinnen und Lehrer",
      "Stimmarbeit im Teamtraining",
    ]) {
      await expect(page.getByText(offering)).toBeVisible();
    }
    // Methods (verbatim from harvest), Weiterbildung, locations, scheduling
    await expect(page.getByRole("heading", { name: "Stimmarbeit", exact: true })).toBeVisible();
    await expect(page.getByText("Gisela Rohmert")).toBeVisible();
    await expect(page.getByText("Roy-Hart-Theatre")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Musikalische Weiterbildung" })).toBeVisible();
    await expect(page.getByText("Berufskolleg Dieringhausen")).toBeVisible();
    await expect(page.getByText("Wöchentlicher oder 14-tägiger Gesangsunterricht")).toBeVisible();
    await expect(page.locator(".unterricht-page__locations").getByText("Köln-Niehl")).toBeVisible();
  });

  test("/kontakt/ shows landline, mobile, and email exactly as on the old site", async ({
    page,
  }) => {
    await page.goto("/kontakt/");
    const landline = page.getByRole("link", { name: "+49 (0) 2266 / 46 30 25" });
    await expect(landline).toBeVisible();
    await expect(landline).toHaveAttribute("href", "tel:+492266463025");
    const mobile = page.getByRole("link", { name: "+49 (0) 162 / 829 23 23" });
    await expect(mobile).toBeVisible();
    await expect(mobile).toHaveAttribute("href", "tel:+491628292323");
    await expect(page.getByRole("link", { name: "francesca-simone@onlinehome.de" })).toBeVisible();
    await expect(page.getByText("Für Konzertbuchungen, Unterricht, Workshops")).toBeVisible();
  });

  test("/impressum/ carries the owner's legal data and photo credit", async ({ page }) => {
    await page.goto("/impressum/");
    await expect(page.getByText("Im Winkel 6")).toBeVisible();
    await expect(page.getByText("51789 Lindlar")).toBeVisible();
    await expect(page.getByText("Dorina Köb")).toBeVisible();
    await expect(page.getByText("urheberrechtlich geschützt")).toBeVisible();
  });

  test("landing page teases every area and links the program page (SC-006)", async ({ page }) => {
    await page.goto("/");
    for (const href of [
      "/vita/",
      "/projekte/",
      "/termine/",
      "/cds/",
      "/unterricht/",
      "/kontakt/",
      "/canzoni-italiane/",
    ]) {
      expect(
        await page.locator(`a[href="${href}"]`).count(),
        `landing must link ${href}`,
      ).toBeGreaterThan(0);
    }
  });

  test("navigation works from a subpage (not only from the landing page)", async ({ page }) => {
    await page.goto("/vita/");
    await page.getByRole("navigation", { name: "Hauptnavigation" }).getByText("CDs").click();
    await expect(page).toHaveURL(/\/cds\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Musik zum Mitnehmen." }),
    ).toBeVisible();
  });

  test("static routes beat the dynamic program route", async ({ page }) => {
    // Guards research.md §4's route-priority assumption.
    await page.goto("/vita/");
    await expect(page.getByRole("heading", { name: "Kurzvita" })).toBeVisible();
  });

  test("no built page references the old domain or Google Fonts (FR-011/FR-017)", async ({
    request,
  }) => {
    const pages = await Promise.all(
      PUBLIC_ROUTES.map(async (route) => ({
        route,
        html: await (await request.get(route)).text(),
      })),
    );
    for (const { route, html } of pages) {
      expect(html, `${route} must not reference jazz-isses.de`).not.toContain("jazz-isses.de");
      expect(html, `${route} must not load Google Fonts`).not.toContain("fonts.googleapis.com");
      expect(html, `${route} must not load gstatic`).not.toContain("fonts.gstatic.com");
    }
  });

  test("external listening links are marked and open safely (FR-017)", async ({ page }) => {
    await page.goto("/projekte/");
    const youtube = page.locator('a[href="https://www.youtube.com/watch?v=GeXVWCsDG4k"]');
    await expect(youtube).toHaveAttribute("target", "_blank");
    await expect(youtube).toHaveAttribute("rel", /noopener/);
    // No third-party iframes/scripts anywhere (consent-free requirement)
    expect(await page.locator("iframe").count()).toBe(0);
  });
});
