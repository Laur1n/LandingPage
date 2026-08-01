import { test, expect } from "@playwright/test";

test.describe("Motion guardrails", () => {
  test("reduced motion: hero text immediately visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /BPM aus der Musik|Cues auf dem Beat/ }),
    ).toBeVisible();
    const opacity = await page
      .getByRole("heading", { level: 1, name: /BPM aus der Musik|Cues auf dem Beat/ })
      .evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBe(1);
    expect(await page.locator(".pin-spacer").count()).toBe(0);
  });

  test("no JavaScript: key routes still show content", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    const checks: [string, string | RegExp][] = [
      ["/", "Cue Pilot"],
      ["/ueber-mich/", "Wer ich bin"],
      ["/cue-pilot/", "Cue Pilot"],
      ["/sportlehrer/", "Sportlehrer"],
      ["/aufgussmeister/", "Aufguss"],
      ["/kontakt/", "Anfrage"],
    ];
    for (const [route, text] of checks) {
      await page.goto(route);
      await expect(page.getByText(text).first(), `${route} without JS`).toBeVisible();
    }
    await context.close();
  });

  test("default: homepage scroll completes without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));

    await page.goto("/");
    await page.evaluate(async () => {
      const step = window.innerHeight / 2;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
    });
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
});
