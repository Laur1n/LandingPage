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

    for (const expected of ["about", "offerings", "contact", "legal", "site"]) {
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

  test("every folder collection can generate a slug for a new entry", async ({ request }) => {
    const response = await request.get("/admin/config.yml");
    const config = parse(await response.text());

    // Decap only auto-detects `title` and `path` as entry identifiers. A folder collection whose
    // fields use any other name (venueName, name, ...) must declare `identifier_field`, or
    // "new entry" throws "Collection must have a field name that is a valid entry identifier"
    // before the entry ever reaches git — i.e. Francesca cannot add a Termin or a Projekt at all.
    interface DecapCollection {
      name: string;
      folder?: string;
      identifier_field?: string;
      fields?: Array<{ name: string }>;
    }

    const folderCollections = (config.collections as DecapCollection[]).filter((c) => c.folder);
    expect(folderCollections.length).toBeGreaterThan(0);

    for (const collection of folderCollections) {
      const fieldNames = (collection.fields ?? []).map((f) => f.name);
      const identifier =
        collection.identifier_field ?? ["title", "path"].find((n) => fieldNames.includes(n));

      expect(identifier, `${collection.name} has no usable entry identifier`).toBeTruthy();
      expect(fieldNames, `${collection.name}.identifier_field points at a missing field`).toContain(
        identifier,
      );
    }
  });

  test("link lists in config.yml use the field names the site renders", async ({ request }) => {
    const response = await request.get("/admin/config.yml");
    const config = parse(await response.text());

    // src/content.config.ts validates every link as { label, url }. A CMS field named anything
    // else (this was `platform` for socialLinks) saves fine but fails the next build, so the
    // site silently stops updating after an editor touches contact details.
    interface DecapField {
      name: string;
      widget?: string;
      fields?: DecapField[];
    }

    function everyFieldSet(collection: {
      fields?: DecapField[];
      files?: Array<{ fields: DecapField[] }>;
    }): DecapField[][] {
      if (collection.fields) return [collection.fields];
      if (collection.files) return collection.files.map((f) => f.fields);
      return [];
    }

    const linkListNames = ["links", "socialLinks"];
    let checked = 0;

    for (const collection of config.collections) {
      for (const fields of everyFieldSet(collection)) {
        for (const field of fields.filter((f) => linkListNames.includes(f.name))) {
          const subFieldNames = (field.fields ?? []).map((f) => f.name).sort();
          expect(subFieldNames, `${collection.name}.${field.name}`).toEqual(["label", "url"]);
          checked += 1;
        }
      }
    }

    expect(checked).toBeGreaterThan(0);
  });

  test("page chrome is editable through the site-texts collection", async ({ request }) => {
    const response = await request.get("/admin/config.yml");
    const config = parse(await response.text());
    const site = config.collections.find((c: { name: string }) => c.name === "site");

    expect(site, "no collection for the strings outside content entries").toBeTruthy();
    expect(site.files[0].file).toBe("src/content/site/de/index.md");

    const fieldNames = site.files[0].fields.map((f: { name: string }) => f.name);
    for (const group of ["seoTitle", "brand", "nav", "hero", "sections", "footer"]) {
      expect(fieldNames).toContain(group);
    }
  });

  test("offerings render on the public homepage", async ({ page }) => {
    await page.goto("/#bereiche");
    await expect(page.getByRole("heading", { name: "Cue Pilot" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sportlehrer" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Aufgussmeister" })).toBeVisible();
  });
});
