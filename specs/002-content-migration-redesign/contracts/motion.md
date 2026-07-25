# Contract: Scroll Choreography (Showcase Motion)

Implements the "Showcase" clarification within the guardrails of FR-013/FR-014 and the design
context (`.impeccable.md`, whose Motion section is amended to reference this contract). This is
the UI contract the implementation and tests bind to; exact easings/durations are tuned during
implementation but the **rules and scene inventory are binding**.

## Non-negotiable rules (tested)

1. **Content-first**: every animated element is fully present and visible in server-rendered
   HTML. Initial "hidden" states are applied only by JS at init (`gsap.from` / `gsap.set`).
   No `opacity: 0` or transforms in authored CSS for content elements. No-JS ⇒ complete page.
2. **Compositor-only**: animate `transform` and `opacity` exclusively. Never top/left/width/
   height/margin. Pinning uses ScrollTrigger's spacer (reserves identical space) ⇒ CLS from
   animation = 0.
3. **Reduced motion**: all scenes registered inside `gsap.matchMedia("(prefers-reduced-motion:
no-preference)")`. Under `reduce`: no pinning, no parallax, no scrubbing; at most instant
   opacity fades ≤ 200 ms or nothing.
4. **Native scrolling**: no scroll hijacking, no smooth-scroll libraries, no wheel/touch
   interception. Anchor jumps may use CSS `scroll-behavior: smooth` (which reduced-motion
   disables via media query).
5. **Easing language**: exponential ease-out (`expo.out` family) for entrances; linear only for
   scroll-scrubbed values; no bounce/elastic/back easings (design-context ban).
6. **Performance**: scene init deferred to after first paint (module script, `requestIdleCallback`
   or `astro:page-load`); ScrollTriggers use `once: true` for reveals; total main-thread work of
   init < 100 ms on mid-range mobile; will-change applied only during active animation.
7. **Degradation duty**: any scene that cannot hold ~60 fps on a mid-range phone ships as its
   fallback (simple reveal), not as jank (FR-013).

## Scene inventory

Landing `/` (the showcase centerpiece):

| #   | Scene                   | Behavior                                                                                                       | Fallback / reduce          |
| --- | ----------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------- |
| L1  | Hero entrance           | Load-triggered (not scroll): staggered rise+fade of welcome line, name (per-word), roles, CTAs; ≤ 900 ms total | static                     |
| L2  | Hero portrait parallax  | Scrubbed: portrait translates slower than scroll (~15% depth); tagline crossfades in                           | static image               |
| L3  | Pull-quote scene        | Section pins briefly (≤ 100 vh extra); quote lines rise sequentially, scrubbed                                 | unpinned, plain blockquote |
| L4  | „Auf der Bühne" teasers | Once-reveals, 80 ms stagger, alternating 12–24 px rise                                                         | static                     |
| L5  | Next-concert teaser     | Date numerals count up-fade once in view; card rises                                                           | static                     |
| L6  | CD-cover strip          | Scrubbed horizontal drift of the 6 covers (translateX within own container, no pin)                            | static grid                |
| L7  | Kontakt outro           | Footer CTA block fades/rises once                                                                              | static                     |

Subpages (consistent grammar, lighter):

| #   | Scene                                                                                         | Where                      |
| --- | --------------------------------------------------------------------------------------------- | -------------------------- |
| S1  | Subpage hero: eyebrow → heading → intro staggered rise on load                                | all subpages               |
| S2  | Prose blocks: once-reveal per block (rise+fade, stagger 60 ms)                                | vita, unterricht, projekte |
| S3  | Portrait parallax (as L2, shallower)                                                          | vita                       |
| S4  | Project alternating image/text reveals                                                        | projekte                   |
| S5  | Program-page hero: heroImage slow zoom-out scrub + title rise; lineup members staggered       | canzoni-italiane           |
| S6  | Termine: year headings pin subtly while their dates scroll (long archives only, desktop only) | termine                    |
| S7  | CD cards: cover tilt-settle (rotate ≤ 2°→0) + rise, staggered                                 | cds                        |

Legal pages: S1 only. `/admin/`: no motion code loaded.

## Verification (maps to tests/quickstart)

- e2e (`prefers-reduced-motion: reduce`): no element has ScrollTrigger pin spacers; hero text
  visible immediately; L3/L6/S5/S6 absent.
- e2e (JS disabled): all routes' "MUST show" content visible (routes.md).
- e2e (default): after full-page scroll, no console errors; all `once` reveals completed
  (no stuck opacity).
- Manual (quickstart): Lighthouse mobile — CLS < 0.1, LCP ≤ 2.5 s on `/`; scroll jank spot-check
  on a throttled CPU.
