import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

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

describe("Decap config ↔ content schema parity", () => {
  it("never ships local_backend (dev-only escape hatch)", () => {
    expect(config.local_backend).toBeUndefined();
  });

  it("media folder is the uploads dir the site serves", () => {
    expect(config.media_folder).toBe("public/uploads");
  });

  it("about fields match", () => {
    expect(fileFields("about", "about")).toEqual(
      [
        "lang",
        "name",
        "tagline",
        "portrait",
        "portraitAlt",
        "portraitPage",
        "portraitPageAlt",
        "teaser",
        "pullQuote",
        "body",
      ].sort(),
    );
  });

  it("offerings collection is creatable and matches the schema", () => {
    const offerings = collection("offerings");
    expect(offerings.create).toBe(true);
    expect(offerings.folder).toBe("src/content/offerings/de");
    expect(fieldNames(offerings.fields)).toEqual(
      [
        "lang",
        "title",
        "subtitle",
        "intro",
        "teaser",
        "heroImage",
        "heroImageAlt",
        "order",
        "ctaLabel",
        "quote",
        "quoteAttribution",
        "pitchHeading",
        "pitchText",
        "features",
        "workflow",
        "links",
        "body",
      ].sort(),
    );
  });

  it("contact fields match", () => {
    expect(fileFields("contact", "contact")).toEqual(
      ["lang", "email", "phone", "phoneMobile", "location", "socialLinks", "body"].sort(),
    );
  });

  it("site texts expose required label groups", () => {
    const fields = fileFields("site", "site");
    for (const group of ["teasers", "subpages", "offering", "contactLabels"]) {
      expect(fields, `site group "${group}"`).toContain(group);
    }
  });

  it("nested link sub-fields use the names the site reads", () => {
    const offerings = collection("offerings");
    const links = offerings.fields?.find((f) => f.name === "links");
    expect(fieldNames(links?.fields)).toEqual(["label", "url"]);
  });

  it("nested feature/workflow sub-fields use the names the schema reads", () => {
    const offerings = collection("offerings");
    const features = offerings.fields?.find((f) => f.name === "features");
    const workflow = offerings.fields?.find((f) => f.name === "workflow");
    expect(fieldNames(features?.fields)).toEqual(["text", "title"]);
    expect(fieldNames(workflow?.fields)).toEqual(["text", "title"]);
  });
});
