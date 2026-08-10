import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {HomeRailProductFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

/**
 * "Shop Our Signature Gear" — a horizontally-scrolling rail of real products.
 * Data comes from the homepage loader (a Storefront API collection query).
 * The counter + prev/next arrows are client interactivity layered on after
 * hydration; the cards themselves are server-rendered for SEO.
 */
export function ProductRail({products}: {products: HomeRailProductFragment[]}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const total = products.length;
  const [pos, setPos] = useState(1);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /**
   * Card pitch measured from layout rather than assumed. The gap is 34px on
   * desktop and 20px below the breakpoint, so pitch is 334px or 320px and a
   * constant would be wrong on one of them.
   */
  const metrics = useCallback(() => {
    const el = trackRef.current;
    if (!el) return null;
    const cards = Array.from(el.children) as HTMLElement[];
    if (!cards.length) return null;
    const pitch =
      cards.length > 1
        ? cards[1].offsetLeft - cards[0].offsetLeft
        : cards[0].offsetWidth;
    if (!pitch) return null;
    return {el, pitch, max: Math.max(0, el.scrollWidth - el.clientWidth)};
  }, []);

  const sync = useCallback(() => {
    const m = metrics();
    if (!m) return;
    const {el, pitch, max} = m;
    // Which card is at the left edge. The old version mapped the scroll
    // fraction across the whole rail onto 1..total, which counts positions the
    // rail cannot stop at — the number jumped in twos and threes.
    setPos(Math.min(total, Math.round(el.scrollLeft / pitch) + 1));
    // Sub-pixel remainders are normal at the extremes; 1px of slack keeps a
    // scroll that has genuinely finished from reading as "more to go", which is
    // what left an arrow enabled with nothing left to scroll to.
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
  }, [metrics, total]);

  useEffect(() => {
    sync();
    // Pitch changes at the breakpoint, so a resize invalidates both the counter
    // and the arrow states.
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [sync]);

  /**
   * Advance by whole cards.
   *
   * This used to scroll by `min(clientWidth * 0.85, 460)`, a pixel distance with
   * no relationship to how wide a card actually is. That worked out to 1.377
   * cards per click on desktop and 1.036 on mobile, so the rail drifted a little
   * further out of alignment on every press and never showed a clean row. The
   * end was the visible symptom: with less than one nudge of travel left, the
   * final click crawled forward 155px of a 320px card on mobile — a click that
   * plainly did not move to the next item.
   */
  const nudge = (dir: number) => {
    const m = metrics();
    if (!m) return;
    const {el, pitch, max} = m;
    const perView = Math.max(1, Math.floor(el.clientWidth / pitch));
    const current = Math.round(el.scrollLeft / pitch);
    const target = Math.min(
      Math.max(current + dir * perView, 0),
      Math.max(total - 1, 0),
    );
    // Clamp to max so the last step ends flush with the right edge instead of
    // stopping short and leaving a dead click behind it.
    el.scrollTo({left: Math.min(target * pitch, max), behavior: 'smooth'});
  };

  if (!total) return null;

  return (
    <section className="pel-rail" aria-label="Shop our signature gear">
      <div className="pel-rail__inner">
        <div className="pel-rail__head">
          <h2 className="pel-rail__title">
            Shop Our
            <br />
            Signature Gear
          </h2>
          <div className="pel-rail__nav">
            <div className="pel-rail__count" aria-live="polite">
              <b>{String(pos).padStart(2, '0')}</b>{' '}
              <span>/ {String(total).padStart(2, '0')}</span>
            </div>
            <div className="pel-rail__btns">
              <button
                type="button"
                className="pel-rail__arrow"
                aria-label="Previous products"
                onClick={() => nudge(-1)}
                disabled={atStart}
              >
                <Arrow dir="left" />
              </button>
              <button
                type="button"
                className="pel-rail__arrow"
                aria-label="Next products"
                onClick={() => nudge(1)}
                disabled={atEnd}
              >
                <Arrow dir="right" />
              </button>
            </div>
          </div>
        </div>

        <div className="pel-rail__track" ref={trackRef} onScroll={sync}>
          {products.map((product) => (
            <RailCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RailCard({product}: {product: HomeRailProductFragment}) {
  const {open} = useAside();
  const to = `/products/${product.handle}`;
  const image = product.featuredImage;
  const variant = product.selectedOrFirstAvailableVariant;
  const available = Boolean(variant?.availableForSale);
  // Any option with more than one value is a decision the shopper has to make.
  const needsChoice = (product.options ?? []).some(
    (o) => (o.optionValues?.length ?? 0) > 1,
  );
  return (
    <div className="pel-card">
      <Link className="pel-card__link" to={to}>
        <div className="pel-card__imgwell">
          {image ? (
            <Image
              data={image}
              className="pel-card__img"
              sizes="(min-width: 48em) 260px, 60vw"
              loading="lazy"
            />
          ) : null}
        </div>
        <h3 className="pel-card__title">{product.title}</h3>
        {variant?.price ? (
          <div className="pel-card__price">
            <Money data={variant.price} />
          </div>
        ) : null}
      </Link>
      <div className="pel-card__actions">
        {/* A product with a real choice to make (a size, a colour) does not get a
            Quick Add. It used to, and it silently added whichever variant the API
            happened to return first — you asked for a tee and got a Small. Those
            send you to the page to choose instead. */}
        {needsChoice ? (
          <Link className="pel-btn-outline" to={to}>
            {available ? 'Choose Options' : 'Sold Out'}
          </Link>
        ) : (
          <AddToCartButton
            className="pel-btn-outline"
            ariaLabel={`Add ${product.title} to cart`}
            disabled={!available}
            onClick={() => open('cart')}
            lines={
              variant
                ? [{merchandiseId: variant.id, quantity: 1, selectedVariant: variant}]
                : []
            }
          >
            {available ? 'Quick Add' : 'Sold Out'}
          </AddToCartButton>
        )}
        <Link
          to={to}
          className="pel-icon-btn"
          aria-label={`View ${product.title}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M7 17L17 7M8.5 7H17v8.5" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function Arrow({dir}: {dir: 'left' | 'right'}) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {dir === 'left' ? (
        <path d="M19 12H5M11 6l-6 6 6 6" />
      ) : (
        <path d="M5 12h14M13 6l6 6-6 6" />
      )}
    </svg>
  );
}

/** Streamed-in placeholder shown while the deferred rail query resolves. */
export function ProductRailSkeleton() {
  const cells = ['s1', 's2', 's3', 's4'];
  return (
    <section className="pel-rail" aria-hidden="true">
      <div className="pel-rail__inner">
        <div className="pel-rail__head">
          <h2 className="pel-rail__title">
            Shop Our
            <br />
            Signature Gear
          </h2>
        </div>
        <div className="pel-rail__track pel-rail__track--static">
          {cells.map((k) => (
            <div key={k} className="pel-rail__ph" />
          ))}
        </div>
      </div>
    </section>
  );
}
