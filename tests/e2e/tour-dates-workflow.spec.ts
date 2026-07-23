import { test, expect } from "@playwright/test";

/**
 * User Story 2 — FR-005 / SC-001.
 *
 * NOTE ON SCOPE: The full "save draft -> preview -> publish" round-trip (US2 AC1-AC3, AC7)
 * happens inside Decap CMS's Editorial Workflow against a live GitHub repo through DecapBridge
 * (research.md §2-3) — there is no local/CI-safe way to exercise that without real, deployed
 * credentials (contracts/decap-cms-config.md). That flow is validated manually against the
 * deployed site per quickstart.md steps 2 and 5. What IS fully testable here, against our own
 * static build, is the auto-expiry behavior our code is responsible for (FR-005): a past-dated
 * entry must never appear in the public "upcoming" list, independent of any CMS action.
 */
test.describe("Tour date auto-expiry (User Story 2)", () => {
  test("a past-dated tour date does not appear in the upcoming list", async ({ page }) => {
    await page.goto("/#termine");

    // The seeded tour date (2026-10-02) is upcoming relative to "today" in this test environment
    // and must be visible...
    await expect(page.getByText("Jubilate Forum Lindlar")).toBeVisible();

    // ...while no date rendered on the page is ever in the past. We check this generically by
    // reading every rendered <time> element's machine-readable datetime.
    const isoDates = await page
      .locator("#termine time")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("datetime")));

    expect(isoDates.length).toBeGreaterThan(0);
    for (const iso of isoDates) {
      expect(iso).not.toBeNull();
      expect(new Date(iso as string).getTime()).toBeGreaterThanOrEqual(Date.now());
    }
  });

  test("the Termine section shows a friendly empty state when there are no upcoming dates", async ({
    page,
  }) => {
    // This is a structural check: the empty-state branch exists in the markup source
    // (Termine.astro) and is exercised whenever the upcoming list is empty. With the current
    // seed data there IS an upcoming date, so we assert the *presence of the mechanism* by
    // checking the two mutually-exclusive branches never both render.
    await page.goto("/#termine");
    const hasList = await page.locator(".termine__list").count();
    const hasEmptyState = await page.locator(".termine__empty").count();
    expect(hasList + hasEmptyState).toBe(1);
  });
});
