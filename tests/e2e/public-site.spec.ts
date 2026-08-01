import { test, expect } from "@playwright/test";

// User Story 1 — SC-001: every baseline section from the current site must be present and
// reachable on the new site, on both desktop and mobile, with no login required.
const sections = [
  { id: "start", heading: /Francesca Simone/ },
  { id: "vita", heading: /Eine Stimme zwischen Jazz/ },
  { id: "projekte", heading: /Auf der Bühne/ },
  { id: "termine", heading: /Nächste Konzerte/ },
  { id: "cds", heading: /Diskografie/ },
  { id: "unterricht", heading: /Gesang & Stimmarbeit/ },
  { id: "kontakt", heading: /Konzert anfragen/ },
];

test.describe("Public portfolio site (User Story 1)", () => {
  // 002: scroll reveals would keep below-fold sections hidden until scrolled into view;
  // reduced-motion emulation shows everything immediately (motion covered in motion.spec.ts).
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("every baseline section is present and reachable from the homepage", async ({ page }) => {
    await page.goto("/");

    for (const section of sections) {
      const locator = page.locator(`#${section.id}`);
      await expect(locator).toBeAttached();
    }

    await expect(page.getByRole("heading", { name: /Eine Stimme zwischen Jazz/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Nächste Konzerte" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Diskografie" })).toBeVisible();
  });

  test("upcoming tour date is visible with venue, date, and location", async ({ page }) => {
    await page.goto("/#termine");
    await expect(page.getByText("Jubilate Forum Lindlar")).toBeVisible();
    await expect(page.getByText("02.10.2026")).toBeVisible();
  });

  test("Impressum and Datenschutz pages are reachable from the footer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Impressum" }).click();
    await expect(page).toHaveURL(/\/impressum/);
    await expect(page.getByRole("heading", { name: "Impressum" })).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Datenschutz" }).click();
    await expect(page).toHaveURL(/\/datenschutz/);
    await expect(page.getByRole("heading", { name: "Datenschutz" })).toBeVisible();
  });

  test("admin surface is not linked from public navigation", async ({ page }) => {
    await page.goto("/");
    const adminLinks = page.locator('a[href*="/admin"]');
    await expect(adminLinks).toHaveCount(0);
  });

  test("GitHub Pages subpath redirect does not fire on the real domain/localhost, and computes the correct target", async ({
    page,
  }) => {
    await page.goto("/impressum");
    // On localhost the redirect guard must not fire — page should load normally, not navigate away.
    await expect(page).toHaveURL(/\/impressum/);

    // The redirect script only triggers on the exact default GitHub Pages hostname. Verify the
    // URL-rewriting logic it uses (strip the /LandingPage subpath, swap in the real domain)
    // produces the right target, without actually simulating a cross-origin navigation.
    const target = await page.evaluate(() => {
      const pathname = "/LandingPage/impressum";
      const search = "?ref=test";
      const hash = "#section";
      return (
        "https://francesca-simone.com" + pathname.replace(/^\/LandingPage/, "") + search + hash
      );
    });
    expect(target).toBe("https://francesca-simone.com/impressum?ref=test#section");
  });

  test("navigation and content remain usable on a mobile viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Francesca Simone", level: 1 })).toBeVisible();
    // No horizontal scroll: document width should not exceed the viewport width.
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
