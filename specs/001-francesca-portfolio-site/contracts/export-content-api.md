# Contract: Content Export (Public Repository ZIP Download)

**Feature**: [../spec.md](../spec.md) | **Resolves**: FR-021 (see research.md §7)

> **Revision note**: an earlier version of this contract described a custom Netlify Function.
> That design was superseded when hosting moved to GitHub Pages (research.md §5), which enabled a
> simpler solution requiring no custom code at all. This file documents the current contract.

Because GitHub Pages' free tier requires the site's repository to be public, and all content
lives as files in that repository (data-model.md), Francesca's "download a complete copy of my
content" capability (FR-021) is satisfied entirely by GitHub's own, unauthenticated archive
endpoint — no application code owns or implements this.

## Endpoint

```
GET https://github.com/<OWNER>/<REPO>/archive/refs/heads/main.zip
```

### Request

No authentication, no headers, no parameters. Any browser (or `curl`) can call this URL directly;
it is a standard GitHub feature for any public repository, unrelated to Decap CMS or DecapBridge.

### Response — success

```
200 OK
Content-Type: application/zip
```

Body: a ZIP archive of the entire repository (not just `src/content/`) as it currently exists on
the tip of `main` — i.e., exactly what is currently published, since `main` only changes via
Decap CMS's Editorial Workflow publish step (FR-013/FR-018/FR-019).

### Response — error

| Status | Condition                                                             |
| ------ | --------------------------------------------------------------------- |
| `404`  | Repository is private, renamed, or the owner/repo in the URL is wrong |

## Behavior

None to implement — this is entirely GitHub's own archive feature. The only responsibility this
project has is to:

1. Keep the repository public (a hosting precondition already required by research.md §5, not an
   additional constraint introduced by this contract).
2. Give Francesca the exact link (with the real `<OWNER>/<REPO>` filled in) to bookmark — see
   `README.md`, "Editing content (for Francesca)".

## Non-goals

- This is not a selective, content-only export — it downloads the whole repository (source code
  included), which is a strictly larger, not smaller, backup than the original per-content-folder
  design.
- There is no on-demand "export button" inside `/admin` — the link works identically whether or
  not Francesca is logged in, so no in-app affordance is required to satisfy FR-021.

## Test coverage

None required: there is no custom logic in this repository to unit- or e2e-test. The capability is
verified manually, once, by visiting the URL and confirming a ZIP downloads (see quickstart.md).
