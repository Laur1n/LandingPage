import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// FR-022 / SC-009: WCAG 2.1 AA, verified automatically across every public page.
const publicPages = ["/", "/impressum", "/datenschutz"];

test.describe("Accessibility (WCAG 2.1 AA)", () => {
  for (const path of publicPages) {
    test(`${path} has no critical WCAG 2.1 AA violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      if (results.violations.length > 0) {
        console.log(JSON.stringify(results.violations, null, 2));
      }
      expect(results.violations).toEqual([]);
    });
  }
});
