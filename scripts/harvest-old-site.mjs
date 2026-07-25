#!/usr/bin/env node
/**
 * Dev-only harvest of the old site (research.md §3). Run manually, never in CI:
 *
 *   node scripts/harvest-old-site.mjs
 *
 * Strictly limited to https://jazz-isses.de/Francesca/ — the root domain is a different
 * site and is never touched (spec scope guard). Downloads every referenced asset into
 * public/uploads/ (kebab-case, optionally renamed via RENAMES), extracts the exact
 * outbound link URLs and per-page text, and writes
 * specs/002-content-migration-redesign/harvest-report.md.
 *
 * Re-run before launch and diff the report — that is the spec's pre-launch content re-check.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

// --report-only: refresh harvest-report.md (text, links, asset inventory) WITHOUT writing any
// files into public/uploads — use for the pre-launch re-check so the committed, sharp-optimized
// images are never overwritten by the originals. Asset bytes are still fetched and hashed so
// a changed file on the old site shows up as a changed sha in the report diff.
const REPORT_ONLY = process.argv.includes("--report-only");

const BASE = "https://jazz-isses.de/Francesca/";
const PAGES = [
  "index.html",
  "vita.html",
  "projekte.html",
  "termine.html",
  "cds.html",
  "unterricht.html",
  "kontakt.html",
  "canzoni-italiane.html",
  "impressum.html",
];

const UPLOADS_DIR = new URL("../public/uploads/", import.meta.url).pathname;
const REPORT_PATH = new URL(
  "../specs/002-content-migration-redesign/harvest-report.md",
  import.meta.url,
).pathname;

/** Map harvested basenames → convention names (data-model.md §Media). Filled after first run. */
const RENAMES = {
  "portrait1.jpg": "portrait-1.jpg",
  "portrait2.jpg": "portrait-2.jpg",
  "portrait3.jpg": "portrait-3.jpg",
  "recall.jpg": "cd-recall-heart-of-gold-cover.jpg",
  "ad-alta-voce.jpg": "cd-ad-alta-voce-cover.jpg",
  "azzurro.jpg": "cd-azzurro-cover.jpg",
  "guarda-li.jpg": "cd-guarda-li-cover.jpg",
  "ciao-maria.jpg": "cd-ciao-maria-cover.jpg",
  "this.jpg": "cd-this-cover.jpg",
  "neu-20cd-20recall-20beschreibung.pdf": "cd-recall-heart-of-gold-info.pdf",
  "neu-20cd-20ad-20alta-20voce.pdf": "cd-ad-alta-voce-info.pdf",
  "neu-20cd-20azzurro.pdf": "cd-azzurro-info.pdf",
  "neu-20cd-20guarda-20li.pdf": "cd-guarda-li-info.pdf",
  "neu-20cd-20ciao-20maria.pdf": "cd-ciao-maria-info.pdf",
  "neu-20cd-20this.pdf": "cd-this-info.pdf",
  "songs-20of-20the-2070-s-20-202023.pdf": "flyer-projekt-70-2.pdf",
  "francescafriends-v1-20-3-.pdf": "flyer-francesca-simone-friends.pdf",
  "recall-postkarte.pdf": "flyer-recall.pdf",
  "trio-flyer.pdf": "flyer-francesca-simone-trio.pdf",
  "canzoni-flyer.pdf": "flyer-canzoni-italiane.pdf",
  "canzoni-portrait.jpg": "program-canzoni-italiane.jpg",
  "audio01.mp3": "canzoni-hoerprobe.mp3",
};

const kebab = (name) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9./-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

function assertInScope(url) {
  if (!url.href.startsWith(BASE)) {
    throw new Error(`OUT OF SCOPE (never crawl outside ${BASE}): ${url.href}`);
  }
}

async function fetchText(url) {
  assertInScope(url);
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

const stripTags = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<(h[1-6]|p|li|br|blockquote|figcaption|td|th|tr|div|section)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n[\s\n]*/g, "\n\n")
    .trim();

async function main() {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const report = [
    "# Harvest Report — old site (https://jazz-isses.de/Francesca/)",
    "",
    `**Run**: ${new Date().toISOString()}`,
    "",
    "Re-run + diff = pre-launch content re-check (spec assumption).",
    "",
  ];
  const downloaded = new Map(); // remote href -> local public path
  const failures = [];

  // Fetch every page up front in parallel; processing stays in PAGES order so the report is
  // byte-stable across runs (the re-check diffs it).
  const fetchedPages = await Promise.all(
    PAGES.map(async (page) => {
      const pageUrl = new URL(page, BASE);
      try {
        return { page, pageUrl, html: await fetchText(pageUrl) };
      } catch (e) {
        failures.push(`PAGE ${pageUrl}: ${e.message}`);
        return null;
      }
    }),
  );

  for (const fetched of fetchedPages) {
    if (!fetched) continue;
    const { page, pageUrl, html } = fetched;

    const assets = new Set();
    const outbound = []; // {label, href}
    const internal = []; // {label, href}

    for (const m of html.matchAll(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      const [, href, inner] = m;
      const label = stripTags(inner).replace(/\s+/g, " ").trim() || "(no text)";
      if (/^(mailto:|tel:)/i.test(href)) {
        internal.push({ label, href });
        continue;
      }
      const abs = new URL(href, pageUrl);
      if (abs.href.startsWith(BASE)) {
        if (/\.(pdf|jpe?g|png|webp|gif|svg|mp3|wav)$/i.test(abs.pathname)) assets.add(abs.href);
        else internal.push({ label, href: abs.href });
      } else {
        outbound.push({ label, href: abs.href });
      }
    }
    for (const m of html.matchAll(/<(?:img|source)\b[^>]*(?:src|srcset)="([^"]+)"/gi)) {
      for (const cand of m[1].split(",")) {
        const u = cand.trim().split(/\s+/)[0];
        if (!u) continue;
        const abs = new URL(u, pageUrl);
        if (abs.href.startsWith(BASE)) assets.add(abs.href);
      }
    }
    // stylesheet url(...) references (hero/background images)
    for (const m of html.matchAll(/<link\b[^>]*href="([^"]+\.css[^"]*)"/gi)) {
      const cssUrl = new URL(m[1], pageUrl);
      if (!cssUrl.href.startsWith(BASE)) continue;
      try {
        const css = await fetchText(cssUrl);
        for (const um of css.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) {
          const abs = new URL(um[1], cssUrl);
          if (abs.href.startsWith(BASE) && /\.(jpe?g|png|webp|gif|svg)$/i.test(abs.pathname))
            assets.add(abs.href);
        }
      } catch (e) {
        failures.push(`CSS ${cssUrl}: ${e.message}`);
      }
    }

    // Download this page's not-yet-seen assets in parallel (pages themselves are processed
    // in order, so the cross-page dedupe via `downloaded` stays race-free).
    await Promise.all(
      [...assets]
        .filter((assetHref) => !downloaded.has(assetHref))
        .map(async (assetHref) => {
          const url = new URL(assetHref);
          assertInScope(url);
          let base = kebab(path.basename(url.pathname));
          base = RENAMES[base] ?? base;
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`${res.status}`);
            const buf = Buffer.from(await res.arrayBuffer());
            if (!REPORT_ONLY) {
              await writeFile(path.join(UPLOADS_DIR, base), buf);
            }
            downloaded.set(assetHref, {
              local: `/uploads/${base}`,
              bytes: buf.length,
              sha256: createHash("sha256").update(buf).digest("hex").slice(0, 12),
            });
          } catch (e) {
            failures.push(`ASSET ${assetHref}: ${e.message}`);
          }
        }),
    );

    report.push(`## ${page}`, "");
    report.push("### Assets on this page", "");
    if (assets.size === 0) report.push("(none)", "");
    for (const a of assets) {
      const d = downloaded.get(a);
      report.push(
        d ? `- \`${a}\` → \`${d.local}\` (${d.bytes} B, ${d.sha256})` : `- \`${a}\` → FAILED`,
      );
    }
    report.push("", "### Outbound links (exact URLs)", "");
    if (outbound.length === 0) report.push("(none)", "");
    for (const l of outbound) report.push(`- [${l.label}](${l.href})`);
    report.push("", "### Internal links", "");
    for (const l of internal) report.push(`- [${l.label}](${l.href})`);
    report.push(
      "",
      "### Extracted text (verbatim, tags stripped)",
      "",
      "```text",
      stripTags(html),
      "```",
      "",
    );
  }

  report.push(
    "## Failures",
    "",
    failures.length ? failures.map((f) => `- ${f}`).join("\n") : "(none)",
    "",
  );
  await writeFile(REPORT_PATH, report.join("\n"));
  console.log(`Report: ${REPORT_PATH}`);
  console.log(`Assets downloaded: ${downloaded.size}; failures: ${failures.length}`);
  for (const f of failures) console.error(`  FAIL ${f}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
