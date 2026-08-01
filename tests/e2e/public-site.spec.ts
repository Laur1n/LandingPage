import { test, expect } from "@playwright/test";

const sections = [
  { id: "start", heading: /Laurin Wünsch/ },
  { id: "bereiche", heading: /Was ich anbiete/ },
  { id: "ueber-mich", heading: /Persönlich & professionell/ },
  { id: "kontakt", heading: /Sprechen wir über Ihr Projekt/ },
];

test.describe("Public site", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("homepage sections are present", async ({ page }) => {
    await page.goto("/");

    for (const section of sections) {
      await expect(page.locator(`#${section.id}`)).toBeAttached();
    }

    await expect(page.getByRole("heading", { name: "Cue Pilot" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sportlehrer" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Aufgussmeister" })).toBeVisible();
  });

  test("Impressum and Datenschutz are reachable from the footer", async ({ page }) => {
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
    await expect(page.locator('a[href*="/admin"]')).toHaveCount(0);
  });

  test("offering pages load", async ({ page }) => {
    await page.goto("/cue-pilot/");
    await expect(page.getByRole("heading", { level: 1, name: "Cue Pilot" })).toBeVisible();

    await page.goto("/sportlehrer/");
    await expect(page.getByRole("heading", { level: 1, name: "Sportlehrer" })).toBeVisible();

    await page.goto("/aufgussmeister/");
    await expect(page.getByRole("heading", { level: 1, name: "Aufgussmeister" })).toBeVisible();
  });

  test("navigation works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Laurin Wünsch", level: 1 })).toBeVisible();
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
