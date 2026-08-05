/**
 * The subpage banner for the journal, reusing the same `pel-subhero` pattern the
 * About and Shop pages use so the blog doesn't read as a different website.
 *
 * Single still image rather than the About page's crossfade — a journal index
 * doesn't need motion, and one eager image keeps the LCP honest.
 */
const BANNER =
  'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/ped-2025-three-players-walking-away-together.jpg?v=1785799791&width=2000';

export function BlogBanner({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <section className="pel-subhero" aria-label={title}>
      <div className="pel-subhero__slides">
        <img
          className="pel-subhero__slide is-active"
          src={BANNER}
          alt="Por El Deporte teammates walking off the pitch together"
          loading="eager"
        />
      </div>
      <div className="pel-subhero__overlay" />
      <div className="pel-subhero__inner">
        <div className="pel-subhero__eyebrow">{eyebrow}</div>
        <h1 className="pel-subhero__title">{title}</h1>
        {sub ? <p className="pel-subhero__sub">{sub}</p> : null}
      </div>
    </section>
  );
}
