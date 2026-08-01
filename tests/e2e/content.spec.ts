import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTES } from "./routes";

test.describe("Content audit", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("/ueber-mich/ shows about content", async ({ page }) => {
    await page.goto("/ueber-mich/");
    await expect(page.getByRole("heading", { level: 1, name: "Laurin Wünsch" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Wer ich bin" })).toBeVisible();
  });

  test("offering pages show intros", async ({ page }) => {
    await page.goto("/cue-pilot/");
    await expect(page.getByRole("heading", { level: 1, name: "Cue Pilot" })).toBeVisible();

    await page.goto("/sportlehrer/");
    await expect(page.getByRole("heading", { level: 1, name: "Sportlehrer" })).toBeVisible();

    await page.goto("/aufgussmeister/");
    await expect(page.getByRole("heading", { level: 1, name: "Aufgussmeister" })).toBeVisible();
  });

  test("/kontakt/ shows contact section", async ({ page }) => {
    await page.goto("/kontakt/");
    await expect(page.getByText("kontakt@example.com")).toBeVisible();
  });

  test("no built page references old music domain", async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await expect(page.locator("body")).not.toContainText("jazz-isses.de");
    }
  });
});
