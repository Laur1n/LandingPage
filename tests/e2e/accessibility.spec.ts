import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

import { PUBLIC_ROUTES } from "./routes";

// 001 FR-022 / 002 SC-005: WCAG 2.1 AA, verified automatically across every public route.
const publicPages = PUBLIC_ROUTES;

test.describe("Accessibility (WCAG 2.1 AA)", () => {
  for (const path of publicPages) {
    test(`${path} has no critical WCAG 2.1 AA violations`, async ({ page }) => {
      // Reduced motion ⇒ scroll reveals are disabled and axe scans the fully-visible page
      // (hidden-until-scroll elements would otherwise be skipped by many checks).
      await page.emulateMedia({ reducedMotion: "reduce" });
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
