import { defineConfig } from "astro/config";

// Fully static output: every public page is pre-rendered at build time.
// (Constitution Principle I — Static-First, Fast & Simple)
// Per-deployment: set `site` to the canonical public URL (GitHub Pages project URL or custom domain).
export default defineConfig({
  site: "https://laur1n.github.io/LandingPage",
  output: "static",
  // "ignore" (the default) so both "/admin" and the Decap-CMS-conventional "/admin/" resolve —
  // a strict policy here previously 404'd on the trailing-slash form.
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
});
