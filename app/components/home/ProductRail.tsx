import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
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

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const q = max > 0 ? el.scrollLeft / max : 0;
    setPos(Math.min(total, Math.round(q * (total - 1)) + 1));
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
  }, [total]);

  useEffect(() => {
    sync();
  }, [sync]);

  const nudge = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.min(el.clientWidth * 0.85, 460),
      behavior: 'smooth',
    });
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
      </Link>
      <div className="pel-card__actions">
        {/* Quick Add: adds the first available variant, then opens the cart drawer.
            (For products that require a size choice, the arrow → the PDP.) */}
        <AddToCartButton
          className="pel-btn-outline"
          disabled={!available}
          onClick={() => open('cart')}
          lines={
            variant ? [{merchandiseId: variant.id, quantity: 1}] : []
          }
        >
          {available ? 'Quick Add' : 'Sold Out'}
        </AddToCartButton>
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
