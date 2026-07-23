import { test, expect } from "@playwright/test";

/**
 * User Story 2 — FR-012, FR-014, SC-006.
 *
 * NOTE ON SCOPE: Rejecting an unauthenticated *write* is enforced by DecapBridge/git-gateway
 * (an external service — research.md §3), not by code in this repository, so it cannot be
 * exercised in a local/CI test without live credentials (validated manually per quickstart.md
 * step 3 instead). What this repository IS responsible for, and what these tests verify, is
 * that the admin surface is never exposed, linked, or indexed from the public site — the
 * precondition that makes "no unauthenticated writes" meaningful in the first place.
 */
test.describe("Admin surface isolation (User Story 2 / Constitution III)", () => {
  test("admin route is disallowed in robots.txt", async ({ request }) => {
    const response = await request.get("/robots.txt");
    const body = await response.text();
    expect(body).toMatch(/Disallow:\s*\/admin\//);
  });

  test("admin page carries a noindex meta tag", async ({ page }) => {
    await page.goto("/admin/");
    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute("content", /noindex/);
  });

  test("no public page links to /admin", async ({ page }) => {
    for (const path of ["/", "/impressum", "/datenschutz"]) {
      await page.goto(path);
      const adminLinks = await page.locator('a[href*="/admin"]').count();
      expect(adminLinks).toBe(0);
    }
  });

  test("the admin page does not render any public content on load (login shell only)", async ({
    page,
  }) => {
    await page.goto("/admin/");
    // Decap CMS mounts into the body; before login it must not leak biography/contact content
    // that lives in src/content/ onto the admin shell itself.
    const bodyText = await page
      .locator("body")
      .innerText()
      .catch(() => "");
    expect(bodyText).not.toContain("Eine Stimme zwischen Jazz");
  });
});
