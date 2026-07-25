import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

/**
 * 002 US2 (T030): every Decap field name must match src/content.config.ts, or the owner's
 * saves would silently write frontmatter the site never reads (violating FR-010). The Zod
 * schemas can't be imported here (they need the astro:content runtime), so the expected field
 * sets are mirrored below — a change on either side trips this test and forces the other side
 * to follow.
 */

type DecapField = { name: string; widget?: string; fields?: DecapField[] };
type DecapCollection = {
  name: string;
  folder?: string;
  create?: boolean;
  files?: { name: string; file: string; fields: DecapField[] }[];
  fields?: DecapField[];
};

const config = parse(readFileSync("public/admin/config.yml", "utf8")) as {
  local_backend?: boolean;
  media_folder: string;
  collections: DecapCollection[];
};

function fieldNames(fields: DecapField[] | undefined): string[] {
  return (fields ?? []).map((f) => f.name).sort();
}

function collection(name: string): DecapCollection {
  const found = config.collections.find((c) => c.name === name);
  if (!found) throw new Error(`Decap collection "${name}" missing`);
  return found;
}

function folderFields(name: string): string[] {
  return fieldNames(collection(name).fields);
}

function fileFields(collectionName: string, fileName: string): string[] {
  const file = collection(collectionName).files?.find((f) => f.name === fileName);
  if (!file) throw new Error(`File entry "${fileName}" missing in "${collectionName}"`);
  return fieldNames(file.fields);
}

describe("Decap config ↔ content schema parity (FR-010)", () => {
  it("never ships local_backend (dev-only escape hatch)", () => {
    expect(config.local_backend).toBeUndefined();
  });

  it("media folder is the uploads dir the site serves", () => {
    expect(config.media_folder).toBe("public/uploads");
  });

  it("biography fields match", () => {
    expect(fileFields("biography", "biography")).toEqual(
      [
        "lang",
        "name",
        "tagline",
        "portrait",
        "portraitAlt",
        "portraitVita",
        "portraitVitaAlt",
        "teaser",
        "pullQuote",
        "body",
      ].sort(),
    );
  });

  it("projects fields match (incl. 002 additions)", () => {
    expect(folderFields("projects")).toEqual(
      [
        "lang",
        "name",
        "order",
        "photo",
        "photoAlt",
        "programName",
        "members",
        "links",
        "flyers",
        "body",
      ].sort(),
    );
  });

  it("programs collection exists, is owner-creatable, and matches the schema", () => {
    const programs = collection("programs");
    expect(programs.create).toBe(true);
    expect(programs.folder).toBe("src/content/programs/de");
    expect(fieldNames(programs.fields)).toEqual(
      [
        "lang",
        "title",
        "subtitle",
        "intro",
        "quote",
        "quoteAttribution",
        "heroImage",
        "heroImageAlt",
        "audioSample",
        "flyer",
        "lineup",
        "pitchHeading",
        "pitchText",
        "order",
        "body",
      ].sort(),
    );
  });

  it("tour-date fields match (incl. ensemble)", () => {
    expect(folderFields("tour_dates")).toEqual(
      ["lang", "date", "venueName", "location", "ensemble", "eventLink", "notes"].sort(),
    );
  });

  it("discography fields match (incl. infoPdf and order)", () => {
    expect(folderFields("discography")).toEqual(
      [
        "lang",
        "title",
        "order",
        "releaseYear",
        "infoPdf",
        "coverImage",
        "coverImageAlt",
        "links",
        "body",
      ].sort(),
    );
  });

  it("teaching fields match (incl. offer, methods, education)", () => {
    expect(fileFields("teaching", "teaching")).toEqual(
      [
        "lang",
        "locations",
        "subtitle",
        "offerings",
        "methodsHeading",
        "methodsText",
        "schedulingText",
        "educationHeading",
        "educationText",
        "body",
      ].sort(),
    );
  });

  it("contact fields match (incl. phoneMobile)", () => {
    expect(fileFields("contact", "contact")).toEqual(
      ["lang", "email", "phone", "phoneMobile", "location", "socialLinks", "body"].sort(),
    );
  });

  it("site texts expose the 002 label groups", () => {
    const fields = fileFields("site", "site");
    for (const group of [
      "teasers",
      "subpages",
      "archive",
      "downloads",
      "program",
      "contactLabels",
    ]) {
      expect(fields, `site group "${group}"`).toContain(group);
    }
  });

  it("nested link/member sub-fields use the names the site reads", () => {
    const projects = collection("projects");
    const members = projects.fields?.find((f) => f.name === "members");
    expect(fieldNames(members?.fields)).toEqual(["name", "role"]);
    const links = projects.fields?.find((f) => f.name === "links");
    expect(fieldNames(links?.fields)).toEqual(["label", "url"]);
    const flyers = projects.fields?.find((f) => f.name === "flyers");
    expect(fieldNames(flyers?.fields)).toEqual(["file", "label"]);
  });
});
