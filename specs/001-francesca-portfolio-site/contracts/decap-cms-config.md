# Contract: Decap CMS ↔ Content Collections

**Feature**: [../spec.md](../spec.md) | **Data model**: [../data-model.md](../data-model.md)

This is the primary interface contract of the feature: it defines the editing surface Francesca
sees (`public/admin/config.yml`) and guarantees it matches, field-for-field, the Astro Content
Collections schema in `src/content.config.ts` that the public site renders from. Any change to one
side MUST be mirrored on the other.

## Global configuration

```yaml
backend:
  name: git-gateway
  repo: <owner>/<repo> # set at implementation time
  branch: main
  identity_url: https://auth.decapbridge.com/sites/<site-id>
  gateway_url: https://gateway.decapbridge.com

publish_mode: editorial_workflow # FR-018/FR-019: draft -> preview -> publish

media_folder: "public/uploads"
public_folder: "/uploads"

locale: "de"
```

There is no `show_preview_links`/`preview_path` configuration in this contract: GitHub Pages (the
hosting choice, research.md §5) has no per-branch deploy-preview URL for Decap CMS to link to.
Instead, `public/admin/index.html` registers an in-app preview template
(`CMS.registerPreviewTemplate`) for every collection below, so "Preview" renders the entry inside
the admin screen itself rather than linking to a separate deployed URL (research.md §2).

## Collections (1:1 with data-model.md)

| Decap collection `name` | Type                   | `folder`/`file`                                                            | Fields (widget)                                                                                                                                                                        | Maps to FR     |
| ----------------------- | ---------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `biography`             | file (singleton)       | `src/content/biography/de/index.md`                                        | `name` (string), `tagline` (string), `portrait` (image), `portraitAlt` (string), body (markdown)                                                                                       | FR-006         |
| `projects`              | folder (repeatable)    | `src/content/projects/de/`                                                 | `name` (string), `order` (number, optional), `photo` (image, optional), `photoAlt` (string, conditional), body (markdown)                                                              | FR-007         |
| `tour_dates`            | folder (repeatable)    | `src/content/tour-dates/de/`                                               | `date` (datetime), `venueName` (string), `location` (string), `eventLink` (string/url, optional), `notes` (string, optional)                                                           | FR-004, FR-005 |
| `discography`           | folder (repeatable)    | `src/content/discography/de/`                                              | `title` (string), `releaseYear` (number, optional), `coverImage` (image, optional), `coverImageAlt` (string, conditional), `links` (list of `{label, url}`, optional), body (markdown) | FR-008         |
| `teaching`              | file (singleton)       | `src/content/teaching/de/index.md`                                         | `locations` (list of strings), body (markdown)                                                                                                                                         | FR-009         |
| `contact`               | file (singleton)       | `src/content/contact/de/index.md`                                          | `email` (string), `phone` (string, optional), `location` (string, optional), `socialLinks` (list of `{platform, url}`, optional)                                                       | FR-010, FR-017 |
| `legal`                 | files (two singletons) | `src/content/legal/de/impressum.md`, `src/content/legal/de/datenschutz.md` | `title` (string), `lastUpdated` (date), body (markdown)                                                                                                                                | FR-020         |

Every `image` field is required to also define its paired `*Alt` field before Decap CMS allows a
save to be marked ready-for-review, enforcing the WCAG 2.1 AA `alt`-text requirement (FR-022) at
the editing layer, not just in the rendering layer.

## Behavioral contract (Editorial Workflow)

| Francesca's action in Decap CMS UI | Git operation                                                    | Public site effect                                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Save draft                         | Commit to `cms/<collection>/<slug>` branch; opens a pull request | None — `main` and the live site are untouched                                                                       |
| Open "Preview"                     | N/A (rendered client-side by the registered preview template)    | She sees the draft's fields laid out with the site's real fonts/colors, inside the admin screen — not a live URL    |
| Edit again before publishing       | New commit on the same branch/PR                                 | In-app preview updates immediately, no rebuild needed                                                               |
| Publish                            | Merge pull request into `main`; branch deleted                   | GitHub Actions builds `main` and deploys to GitHub Pages — content goes live (FR-013) automatically, no manual step |
| Not logged in (any writer)         | DecapBridge/`git-gateway` rejects the request                    | No commit is created; public site unaffected (FR-012, SC-006)                                                       |

## Out of scope for this contract

- Decap CMS's own internal auth/session handling (owned by DecapBridge, not by this project — see
  research.md §3).
- Any custom UI beyond Decap CMS's default editor and the shared in-app preview template
  (`public/admin/index.html`) for these collections; no custom field widgets are required.
