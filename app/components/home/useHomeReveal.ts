import {useEffect} from 'react';

/**
 * Homepage motion, powered by anime.js (bundled via npm, dynamically imported so
 * it stays out of the SSR/server bundle and only loads on the client).
 *
 * Progressive enhancement + accessibility:
 * - Without JS, or with prefers-reduced-motion, every element stays visible
 *   (CSS default). We only ever HIDE elements once we're certain we'll animate
 *   them back in — and only below-the-fold ones, so there's no flash.
 * - Entrance reveals use IntersectionObserver (the production-correct tool; the
 *   original design used manual scroll math because of a cross-origin preview
 *   iframe — we don't have that constraint).
 *
 * Markup contract:
 *   [data-reveal]          → single fade-up
 *   [data-reveal-stagger]  → container; its [data-reveal-item] children stagger
 *                            in from an offset read from data-dx/dy/scale/rot
 *   [data-bg-parallax]     → full-bleed image gently parallaxed on scroll
 */
export function useHomeReveal() {
  useEffect(() => {
    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) return;

    let io: IntersectionObserver | null = null;
    let onScroll: (() => void) | null = null;
    let cancelled = false;

    // Fire-and-forget: load anime.js on the client, then set up motion.
    void import('animejs').then((mod) => {
      if (cancelled) return;
      const anime = mod.default;

      const singles = Array.from(
        document.querySelectorAll<HTMLElement>('[data-reveal]'),
      );
      const groups = Array.from(
        document.querySelectorAll<HTMLElement>('[data-reveal-stagger]'),
      );

      // Set "from" states (hide until revealed). All below the fold → no flash.
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
          el.style.transform = `translate(${dx}px, ${dy}px) scale(${s}) rotate(${rot}deg)`;
          el.style.willChange = 'opacity, transform';
        });
      });

      const revealSingle = (el: HTMLElement) =>
        anime({
          targets: el,
          opacity: 1,
          translateY: 0,
          duration: 900,
          easing: 'easeOutExpo',
        });

      const revealGroup = (g: HTMLElement) =>
        anime({
          targets: g.querySelectorAll('[data-reveal-item]'),
          opacity: 1,
          translateX: 0,
          translateY: 0,
          scale: 1,
          rotate: 0,
          duration: 1000,
          easing: 'easeOutExpo',
          delay: anime.stagger(120),
        });

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            if (el.hasAttribute('data-reveal-stagger')) revealGroup(el);
            else revealSingle(el);
            io?.unobserve(el);
          });
        },
        {threshold: 0.15, rootMargin: '0px 0px -8% 0px'},
      );

      singles.forEach((el) => io?.observe(el));
      groups.forEach((el) => io?.observe(el));

      // Light scroll parallax for full-bleed backgrounds.
      const bgs = Array.from(
        document.querySelectorAll<HTMLElement>('[data-bg-parallax]'),
      );
      if (bgs.length) {
        let ticking = false;
        const update = () => {
          ticking = false;
          const vh = window.innerHeight;
          bgs.forEach((img) => {
            const sec = img.closest('section');
            if (!sec) return;
            const r = sec.getBoundingClientRect();
            const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
            img.style.transform = `translateY(${(p - 0.5) * 70}px) scale(1.16)`;
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
      io?.disconnect();
      if (onScroll) window.removeEventListener('scroll', onScroll);
    };
  }, []);
}
