import {useEffect} from 'react';
import {useLocation} from 'react-router';

/**
 * Site-wide scroll motion, powered by anime.js (bundled via npm, dynamically
 * imported so it stays out of the SSR bundle and only loads on the client).
 *
 * This began life as useHomeReveal and ran on exactly two routes, which is why
 * the rest of the site felt static — /about and every page's footer carried
 * reveal markup that nothing ever animated, and product, journal, cart and
 * policy pages had no motion at all. It is now called once from PageLayout.
 *
 * Progressive enhancement + accessibility:
 * - Without JS, or with prefers-reduced-motion, every element stays visible.
 *   We only ever HIDE something once we're certain we'll animate it back in.
 * - Nothing already on screen is ever hidden (see `isAboveFold`), so the LCP
 *   element can't be blanked and there is no flash of missing content. That
 *   guard is what makes it safe to sprinkle `data-reveal` freely, including on
 *   elements near the top of a page.
 *
 * Markup contract:
 *   [data-reveal]            → fade + rise on entry
 *   [data-reveal-stagger]    → container; its [data-reveal-item] children stagger
 *                              in from an offset read from data-dx/dy/scale/rot
 *   [data-bg-parallax]       → full-bleed image drifts within its <section>
 *   [data-scroll-parallax]   → any element drifts as it crosses the viewport;
 *                              `data-speed` (default 12) is the travel in px,
 *                              negative moves against the scroll
 */
export function useScrollMotion() {
  // Re-scan on client-side navigation. Without this the hook mounts once with
  // PageLayout and every subsequent route renders unanimated.
  const {pathname} = useLocation();

  useEffect(() => {
    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) return;

    let onScroll: (() => void) | null = null;
    let cancelled = false;

    /** Already on screen when we set up → leave it alone. */
    const isAboveFold = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.92;
    };

    void import('animejs').then((mod) => {
      if (cancelled) return;
      const anime = mod.default;

      const singles = Array.from(
        document.querySelectorAll<HTMLElement>('[data-reveal]'),
      ).filter((el) => !isAboveFold(el));
      const groups = Array.from(
        document.querySelectorAll<HTMLElement>('[data-reveal-stagger]'),
      ).filter((el) => !isAboveFold(el));

      singles.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.willChange = 'opacity, transform';
      });
      groups.forEach((g) => {
        g.querySelectorAll<HTMLElement>('[data-reveal-item]').forEach((el) => {
          const dx = el.dataset.dx ?? '0';
          const dy = el.dataset.dy ?? '0';
          const s = el.dataset.scale ?? '0.9';
          const rot = el.dataset.rot ?? '0';
          el.style.opacity = '0';
          // Must use translateX/translateY, NOT the translate(x, y) shorthand.
          // anime.js parses the existing transform into a Map keyed by function
          // name, then rebuilds the string from that Map on every frame. It
          // animates `translateX`/`translateY`, so a `translate` entry is a key
          // it never writes to — it survives to the end and permanently offsets
          // the element (the reveal fades in but never slides home).
          el.style.transform = `translateX(${dx}px) translateY(${dy}px) scale(${s}) rotate(${rot}deg)`;
          el.style.willChange = 'opacity, transform';
        });
      });

      const clearWillChange = (el: HTMLElement) => {
        el.style.willChange = 'auto';
      };

      const revealSingle = (el: HTMLElement) =>
        anime({
          targets: el,
          opacity: 1,
          translateY: 0,
          duration: 900,
          easing: 'easeOutExpo',
          complete: () => clearWillChange(el),
        });

      const revealGroup = (g: HTMLElement) => {
        const items = g.querySelectorAll<HTMLElement>('[data-reveal-item]');
        return anime({
          targets: items,
          opacity: 1,
          translateX: 0,
          translateY: 0,
          scale: 1,
          rotate: 0,
          duration: 1000,
          easing: 'easeOutExpo',
          delay: anime.stagger(120),
          complete: () => items.forEach(clearWillChange),
        });
      };

      /* ---- reveal sweep -------------------------------------------------
         Deliberately NOT an IntersectionObserver. IO only fires when an
         element's intersection *changes*, so anything the viewport skips over
         never fires at all — a fast scroll, an in-page anchor, or a restored
         scroll position would leave those elements stuck at opacity 0 forever.
         Measured: 27 of 28 on the homepage stayed invisible after a jump to the
         bottom. A swept list is O(pending) per frame, shrinks as it goes, and
         is correct no matter how the user got to a scroll position. */
      const pending = new Set<HTMLElement>([...singles, ...groups]);
      const sweep = (vh: number) => {
        if (!pending.size) return;
        pending.forEach((el) => {
          if (el.getBoundingClientRect().top >= vh * 0.92) return;
          if (el.hasAttribute('data-reveal-stagger')) revealGroup(el);
          else revealSingle(el);
          pending.delete(el);
        });
      };

      /* ---- scroll-linked drift ---------------------------------------- */
      const bgs = Array.from(
        document.querySelectorAll<HTMLElement>('[data-bg-parallax]'),
      );
      const drifters = Array.from(
        document.querySelectorAll<HTMLElement>('[data-scroll-parallax]'),
      );

      {
        let ticking = false;
        const update = () => {
          ticking = false;
          const vh = window.innerHeight;

          sweep(vh);

          bgs.forEach((img) => {
            const sec = img.closest('section');
            if (!sec) return;
            const r = sec.getBoundingClientRect();
            if (r.bottom < 0 || r.top > vh) return; // off screen, skip the work
            const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
            img.style.transform = `translateY(${(p - 0.5) * 70}px) scale(1.16)`;
          });

          drifters.forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > vh) return;
            const speed = Number(el.dataset.speed ?? 12);
            // -0.5..0.5 as the element crosses the viewport centre.
            const p = (vh - r.top) / (vh + r.height) - 0.5;
            el.style.transform = `translateY(${(-p * speed * 2).toFixed(2)}px)`;
          });
        };
        onScroll = () => {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
          }
        };
        window.addEventListener('scroll', onScroll, {passive: true});
        update();
      }
    });

    return () => {
      cancelled = true;
      if (onScroll) window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);
}
