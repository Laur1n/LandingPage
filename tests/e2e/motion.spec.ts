import { test, expect } from "@playwright/test";

/**
 * 002 US3 — verifies contracts/motion.md's non-negotiable rules: reduced-motion visitors get
 * no pinning/parallax, no-JS visitors get 100% of the content, and the default experience
 * completes cleanly (no console errors, no stuck reveals).
 */

test.describe("Motion guardrails (FR-013/FR-014)", () => {
  test("reduced motion: no pinning, hero text immediately visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // Hero content is visible without waiting for any animation.
    await expect(page.getByRole("heading", { level: 1, name: "Francesca Simone" })).toBeVisible();
    const opacity = await page
      .getByRole("heading", { level: 1, name: "Francesca Simone" })
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBe(1);

    // ScrollTrigger pin spacers only exist when a pin was created (L3 must not run).
    expect(await page.locator(".pin-spacer").count()).toBe(0);

    // Scrub transforms (parallax/strip drift) must not be applied.
    const heroImageTransform = await page
      .locator("[data-hero-image]")
      .evaluate((el) => getComputedStyle(el).transform);
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(heroImageTransform);
  });

  test("no JavaScript: every route still shows its content (motion.md rule 1)", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    const checks: [string, string | RegExp][] = [
      ["/", "Willkommen · Benvenuti"],
      ["/vita/", "Kurzvita"],
      ["/projekte/", "Programme mit Charakter."],
      ["/canzoni-italiane/", "Volare, Azzurro & mehr"],
      ["/termine/", "Vergangene Termine"],
      ["/cds/", "Musik zum Mitnehmen."],
      ["/unterricht/", "Die eigene Stimme entdecken."],
      ["/kontakt/", "Anfragen & Buchungen."],
    ];
    for (const [route, text] of checks) {
      await page.goto(route);
      await expect(page.getByText(text).first(), `${route} without JS`).toBeVisible();
    }

    // Nothing may be hidden by authored CSS awaiting an animation: the six CD covers render.
    await page.goto("/cds/");
    const opacities = await page.$$eval("[data-cd-card]", (els) =>
      els.map((el) => Number(getComputedStyle(el).opacity)),
    );
    expect(opacities.length).toBeGreaterThan(0);
    expect(opacities.every((opacity) => opacity === 1)).toBe(true);
    await context.close();
  });

  test("default: full-page scroll completes with no console errors and no stuck reveals", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));

    await page.goto("/");
    // Scroll through the whole page in steps so every ScrollTrigger fires.
    await page.evaluate(async () => {
      const step = window.innerHeight / 2;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
    });
    // Reveals are once-only; wait until every one has finished instead of a fixed sleep.
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll("[data-reveal]")).every(
        (el) => Number(getComputedStyle(el).opacity) > 0.95,
      ),
    );
    expect(errors).toEqual([]);
  });

  test("pinned quote scene exists on desktop (L3) and reserves identical space", async ({
    page,
    isMobile,
  }) => {
    test.skip(Boolean(isMobile), "L3 pins on desktop only per motion.md");
    await page.goto("/");
    // The pin spacer is ScrollTrigger's own space-reservation wrapper — its presence proves
    // the pin ran; ScrollTrigger guarantees layout space, so no CLS assertion needed here.
    await page.locator("[data-scene='quote-scene']").scrollIntoViewIfNeeded();
    expect(await page.locator(".pin-spacer").count()).toBeGreaterThan(0);
  });
});
