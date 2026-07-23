import { test, expect } from "@playwright/test";
import { parse } from "yaml";

/**
 * User Story 3 — FR-006 through FR-011, FR-017, FR-020.
 *
 * NOTE ON SCOPE: Actually logging into Decap CMS, editing an entry, and publishing it (US3
 * AC1-AC7) exercises DecapBridge/GitHub Editorial Workflow against a live repo (research.md
 * §2-3) and is validated manually against the deployed site per quickstart.md step 2. What is
 * fully testable here, without live credentials, is the *contract* this repository owns: that
 * `public/admin/config.yml` actually declares an editable collection for every content type
 * User Story 3 promises Francesca can maintain herself, with alt-text fields wherever an image
 * field exists (WCAG 2.1 AA, FR-022) — and that the corresponding public content renders.
 */
test.describe("Content management contract (User Story 3)", () => {
  test("config.yml declares an editable collection for every US3 content type", async ({
    request,
  }) => {
    const response = await request.get("/admin/config.yml");
    const config = parse(await response.text());
    const collectionNames = config.collections.map((c: { name: string }) => c.name);

    for (const expected of [
      "biography",
      "projects",
      "discography",
      "teaching",
      "contact",
      "legal",
    ]) {
      expect(collectionNames).toContain(expected);
    }

    // Editorial workflow (draft -> preview -> publish, FR-018/FR-019) applies to everything.
    expect(config.publish_mode).toBe("editorial_workflow");
  });

  test("every image field in config.yml has a paired alt-text field (FR-022)", async ({
    request,
  }) => {
    const response = await request.get("/admin/config.yml");
    const config = parse(await response.text());

    interface DecapField {
      name: string;
      widget: string;
    }
    interface DecapCollection {
      name: string;
      fields?: DecapField[];
      files?: Array<{ fields: DecapField[] }>;
    }

    function collectFieldSets(collection: DecapCollection): DecapField[][] {
      if (collection.fields) return [collection.fields];
      if (collection.files) return collection.files.map((f) => f.fields);
      return [];
    }

    for (const collection of config.collections as DecapCollection[]) {
      for (const fields of collectFieldSets(collection)) {
        const imageFields = fields.filter((f) => f.widget === "image");
        for (const imageField of imageFields) {
          const altFieldName = `${imageField.name}Alt`;
          const hasAltField = fields.some((f) => f.name === altFieldName);
          expect(
            hasAltField,
            `${collection.name}.${imageField.name} is missing ${altFieldName}`,
          ).toBe(true);
        }
      }
    }
  });

  test("legal collection's file paths match the public Impressum/Datenschutz pages (FR-020)", async ({
    request,
  }) => {
    const response = await request.get("/admin/config.yml");
    const config = parse(await response.text());
    const legal = config.collections.find((c: { name: string }) => c.name === "legal");
    const filePaths = legal.files.map((f: { file: string }) => f.file);

    expect(filePaths).toContain("src/content/legal/de/impressum.md");
    expect(filePaths).toContain("src/content/legal/de/datenschutz.md");
  });

  test("discography content renders on the public CDs section", async ({ page }) => {
    await page.goto("/#cds");
    await expect(page.getByRole("heading", { name: "Diskografie" })).toBeVisible();
  });

  test("all three projects render on the public Projekte section", async ({ page }) => {
    await page.goto("/#projekte");
    await expect(page.getByRole("heading", { name: "Francesca Simone & Friends" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "re:call" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Francesca Simone Trio" })).toBeVisible();
  });
});
