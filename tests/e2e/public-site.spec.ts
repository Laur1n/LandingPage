import { test, expect } from "@playwright/test";

const sections = [
  { id: "start", heading: /Musik analysieren|Intensität planen|Im Takt abliefern/ },
  { id: "bereiche", heading: /Was ich anbiete/ },
  { id: "ueber-mich", heading: /Kurz zu mir/ },
  { id: "kontakt", heading: /Schreiben Sie mir/ },
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

  test("Cue Pilot mini-demo is interactive", async ({ page }) => {
    await page.goto("/");
    const demo = page.locator("[data-cue-demo]");
    await expect(demo).toBeVisible();
    await expect(demo.getByText("142")).toBeVisible();

    const playhead = demo.getByRole("slider", { name: /Playhead/ });
    await expect(playhead).toBeVisible();
    await playhead.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(playhead).toHaveAttribute("aria-valuenow", /[1-9]\d?/);

    await demo.getByRole("tab", { name: /Peak/ }).click();
    await expect(demo.getByText(/Jumps on beat/)).toBeVisible();
    await demo.getByRole("button", { name: "Session starten" }).click();
    await expect(demo.getByRole("button", { name: "Session beenden" })).toBeVisible();
    await expect(demo.getByRole("button", { name: /Nächster Cue/ })).toBeEnabled({ timeout: 8000 });
    await demo.getByRole("button", { name: /Nächster Cue/ }).click();
    await expect(demo.locator("[data-cue-line]")).toContainText(/Climb|Standing climb/, {
      timeout: 8000,
    });
  });

  test("theme toggle switches light and dark", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /Farbschema|Hell|Dunkel/ });
    await expect(toggle).toBeVisible();
    const before = await page.locator("html").getAttribute("data-theme");
    await toggle.click();
    const after = await page.locator("html").getAttribute("data-theme");
    expect(after).not.toBe(before);
    expect(["light", "dark"]).toContain(after);
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", before ?? "light");
  });

  test("navigation works on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /Musik analysieren|Intensität planen|Im Takt abliefern/,
        level: 1,
      }),
    ).toBeVisible();

    const menuBtn = page.getByRole("button", { name: /Menü öffnen/ });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    await expect(page.getByRole("navigation", { name: "Mobilnavigation" })).toBeVisible();
    await page.getByRole("navigation", { name: "Mobilnavigation" }).getByRole("link", { name: "Kontakt" }).click();
    await expect(page).toHaveURL(/\/kontakt/);

    await page.goto("/");
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});
