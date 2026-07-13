import {useEffect} from 'react';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * The About page's "Built by the Community" scroll scene: a tall pinned section
 * where cards fly up through the viewport (staggered) as you scroll, over a fixed
 * centered heading. Also drives hero parallax and the mission reveals.
 * Faithful to About Page.dc.html's scroll logic. Falls back to a static grid
 * under prefers-reduced-motion.
 */
export function useAboutScene() {
  useEffect(() => {
    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const scene = document.getElementById('pel-scene');
    const sticky = document.getElementById('pel-scene-sticky');
    const cardsLayer = document.getElementById('pel-cards');
    const cards = scene
      ? Array.from(scene.querySelectorAll<HTMLElement>('.pel-scene-card'))
      : [];
    const heroImg = document.querySelector<HTMLElement>(
      '.pel-about-page .pel-hero__img',
    );
    let reveals = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );

    if (!scene) return;

    // Static fallback: no scroll scrub — cards laid out in a flow grid.
    if (reduced || !cards.length) {
      scene.style.height = 'auto';
      if (sticky) {
        sticky.style.position = 'static';
        sticky.style.height = 'auto';
        sticky.style.overflow = 'visible';
        sticky.style.display = 'block';
        sticky.style.padding = '60px 0';
      }
      if (cardsLayer) {
        cardsLayer.style.position = 'static';
        cardsLayer.style.display = 'grid';
        cardsLayer.style.gridTemplateColumns =
          'repeat(auto-fill, minmax(220px, 1fr))';
        cardsLayer.style.gap = '20px';
        cardsLayer.style.padding = '48px 24px 0';
      }
      cards.forEach((el) => {
        el.style.position = 'relative';
        el.style.left = 'auto';
        el.style.top = 'auto';
        el.style.width = 'auto';
        el.style.height = 'auto';
        el.style.aspectRatio = '4 / 5';
        el.style.transform = 'none';
        el.style.opacity = '1';
      });
      reveals.forEach((el) => {
        el.style.opacity = '1';
      });
      return;
    }

    reveals.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(34px)';
      el.style.transition =
        'opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1)';
      el.style.willChange = 'opacity, transform';
    });

    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight || 800;

      if (heroImg) {
        const y = Math.min(vh * 0.07, Math.max(0, window.scrollY) * 0.12);
        heroImg.style.transform = `translateY(${y}px)`;
      }

      const rect = scene.getBoundingClientRect();
      const dist = scene.offsetHeight - vh;
      const p = clamp(dist > 0 ? -rect.top / dist : 0, 0, 1);
      const n = cards.length;
      for (let i = 0; i < n; i++) {
        const el = cards[i];
        const start = (i / n) * 0.9 - 0.02;
        const end = start + 0.34;
        const lp = clamp((p - start) / (end - start), 0, 1);
        const y = (1.14 - 2.02 * lp) * vh;
        const rot = parseFloat(el.dataset.rot || '0');
        el.style.transform = `translate(-50%, ${y}px) rotate(${rot}deg)`;
        let op = 1;
        if (lp < 0.14) op = lp / 0.14;
        else if (lp > 0.86) op = (1 - lp) / 0.14;
        el.style.opacity = String(op);
      }

      if (reveals.length) {
        const trig = vh * 0.9;
        reveals = reveals.filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < trig && r.bottom > 0) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            return false;
          }
          return true;
        });
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll, {passive: true});
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
}
