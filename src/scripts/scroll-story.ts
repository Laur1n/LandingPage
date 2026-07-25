/**
 * Scroll choreography (002 US3) — implements the scene inventory in
 * specs/002-content-migration-redesign/contracts/motion.md.
 *
 * Guardrails (motion.md rules 1–7):
 * - Content-first: server HTML is fully visible; all "from" states are applied here at init,
 *   so no JS ⇒ complete page and zero CLS from animation.
 * - transform/opacity only; entrances use expo.out, scrubbed values are linear.
 * - Everything registers inside gsap.matchMedia() gated on prefers-reduced-motion; pinning
 *   additionally requires a desktop viewport.
 * - Reveals fire once (`once: true`); no scroll hijacking anywhere.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const REDUCED_OK = "(prefers-reduced-motion: no-preference)";
const DESKTOP = "(min-width: 56rem)";

function scrubTrigger(trigger: Element): ScrollTrigger.Vars {
  return { trigger, start: "top bottom", end: "bottom top", scrub: true };
}

function init(): void {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  // --- All motion: only when the visitor allows it (FR-014) ---
  mm.add(REDUCED_OK, () => {
    // L1/S1: staged hero entrance (load-triggered, ≤ 900 ms overall)
    const heroLines = document.querySelectorAll("[data-hero-line]");
    if (heroLines.length > 0) {
      gsap.from(heroLines, {
        y: 24,
        autoAlpha: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.08,
        clearProps: "all",
      });
    }

    // L2: landing hero photo — slow drift against scroll direction
    const heroImage = document.querySelector("[data-hero-image]");
    if (heroImage) {
      gsap.fromTo(
        heroImage,
        { yPercent: 0 },
        { yPercent: 10, ease: "none", scrollTrigger: scrubTrigger(heroImage) },
      );
    }

    // L2/S3: portrait parallax (landing Vita teaser + /vita/ portrait)
    for (const portrait of document.querySelectorAll(
      "[data-scene='portrait-parallax'] img, [data-scene='vita-portrait'] img",
    )) {
      gsap.fromTo(
        portrait,
        { yPercent: -6 },
        { yPercent: 6, ease: "none", scrollTrigger: scrubTrigger(portrait) },
      );
    }

    // S5: program hero image — gentle zoom-settle scrub
    const programImage = document.querySelector("[data-program-hero-image]");
    if (programImage) {
      gsap.fromTo(
        programImage,
        { scale: 1.06 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: programImage,
            start: "top bottom",
            end: "center center",
            scrub: true,
          },
        },
      );
    }

    // L6: CD cover strip — lateral drift inside its clipped section
    const strip = document.querySelector("[data-scene='cd-strip'] ul");
    if (strip) {
      gsap.fromTo(strip, { x: 48 }, { x: -48, ease: "none", scrollTrigger: scrubTrigger(strip) });
    }

    // S7: CD cards — tilt-settle (≤ 2° → 0) + rise, staggered by grid position. Cards carry
    // only data-cd-card (not data-reveal), so each gets exactly one tween.
    for (const [index, card] of document.querySelectorAll("[data-cd-card]").entries()) {
      gsap.from(card, {
        y: 28,
        rotate: index % 2 === 0 ? 2 : -2,
        autoAlpha: 0,
        duration: 0.8,
        ease: "expo.out",
        delay: (index % 3) * 0.07,
        scrollTrigger: { trigger: card, start: "top 88%", once: true },
      });
    }

    // L4/S2/L5/L7: generic once-reveals (teasers, prose blocks, date rows, contact outro),
    // batched so nearby elements share one tween/trigger instead of one each.
    // L5 ships as its staggered-reveal fallback per motion.md rule 7 — a numeral count-up
    // couldn't hold quality bar without layout risk on the <time> element.
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 86%",
      once: true,
      onEnter: (batch) =>
        gsap.from(batch, { y: 20, autoAlpha: 0, duration: 0.7, ease: "expo.out", stagger: 0.06 }),
    });

    // Program-page lineup: members cascade in once the section arrives
    const lineupMembers = document.querySelectorAll("[data-lineup-member]");
    if (lineupMembers.length > 0) {
      gsap.from(lineupMembers, {
        y: 16,
        autoAlpha: 0,
        duration: 0.6,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: lineupMembers[0], start: "top 88%", once: true },
      });
    }
  });

  // --- L3: pinned pull-quote scene — desktop only, ≤ 100 vh of pinning (motion.md) ---
  // S6 (archive year pinning) ships as its no-pin fallback per motion.md rule 7: with the
  // current archive size (~10 rows) a pin adds scroll length without telling a story.
  mm.add(`${REDUCED_OK} and ${DESKTOP}`, () => {
    const quoteScene = document.querySelector("[data-scene='quote-scene']");
    if (!quoteScene) return;
    const parts = quoteScene.querySelectorAll("blockquote, figcaption");
    if (parts.length === 0) return;
    gsap
      .timeline({
        scrollTrigger: {
          trigger: quoteScene,
          start: "center 55%",
          end: "+=55%",
          pin: true,
          scrub: true,
          anticipatePin: 1,
        },
      })
      .from(parts, { y: 48, autoAlpha: 0, stagger: 0.25, ease: "none" });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
