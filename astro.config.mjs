import { defineConfig } from "astro/config";

// Fully static output: every public page is pre-rendered at build time.
// (Constitution Principle I — Static-First, Fast & Simple)
export default defineConfig({
  site: "https://francesca-simone.com",
  output: "static",
  // "ignore" (the default) so both "/admin" and the Decap-CMS-conventional "/admin/" resolve —
  // a strict policy here previously 404'd on the trailing-slash form.
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
});
