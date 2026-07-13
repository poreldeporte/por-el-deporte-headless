import {useMemo, useState} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {ShopProductFragment} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {useHomeReveal} from '~/components/home/useHomeReveal';

const BANNER_IMG =
  'https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-1216.jpg?v=1755705211&width=2000';

// The store doesn't consistently set productType, so derive a category from the
// product title (matching how the design groups: Tees / Jerseys / Hoodies / etc.).
function categoryOf(p: ShopProductFragment): string {
  if (p.productType) return p.productType;
  const t = p.title.toLowerCase();
  if (t.includes('jersey') || t.includes('kit')) return 'Jerseys';
  if (t.includes('hoodie')) return 'Hoodies';
  if (t.includes('tote')) return 'Totes';
  if (t.includes('cap') || t.includes('bucket') || t.includes('hat')) return 'Hats';
  if (t.includes('short')) return 'Shorts';
  if (t.includes('tee') || t.includes('shirt')) return 'Tees';
  return 'Gear';
}

const VALUES = [
  {
    n: '01',
    t: 'Community',
    b: 'Building a vibrant Miami soccer community where fans connect through shared events, matches, and passion for the game since 2014.',
  },
  {
    n: '02',
    t: 'Respect',
    b: 'Honoring the spirit of fair play — valuing opponents, teammates, and soccer traditions in every part of our club.',
  },
  {
    n: '03',
    t: 'Lifestyle',
    b: 'Embracing an active, healthy lifestyle inspired by tropical Miami vibes, blending soccer passion with everyday comfort.',
  },
];

export function ShopPage({
  title,
  image,
  products,
}: {
  title: string;
  image?: string | null;
  products: ShopProductFragment[];
}) {
  useHomeReveal();
  const [filter, setFilter] = useState('All');

  const categories = useMemo(() => {
    const types = new Set<string>();
    products.forEach((p) => types.add(categoryOf(p)));
    return ['All', ...Array.from(types).sort()];
  }, [products]);

  const visible =
    filter === 'All'
      ? products
      : products.filter((p) => categoryOf(p) === filter);

  return (
    <div className="pel-shop">
      <section
        className="pel-shop__banner"
        style={{backgroundImage: `url(${image || BANNER_IMG})`}}
        aria-label={title}
      >
        <div className="pel-shop__banner-overlay" />
        <div className="pel-shop__banner-inner">
          <div className="pel-shop__eyebrow">
            Shop All &bull; {products.length} Styles
          </div>
          <h1 className="pel-shop__title">Gear Up.</h1>
          <p className="pel-shop__sub">
            Every tee, hat, and tote supports our Key Biscayne community. Rep the
            club — score your favorites.
          </p>
        </div>
      </section>

      <section className="pel-shop__filter">
        <div className="pel-shop__filter-inner">
          <div className="pel-shop__count">
            <span>{visible.length}</span> Products
          </div>
          {categories.length > 1 ? (
            <div className="pel-shop__chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`pel-chip${cat === filter ? ' is-active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="pel-shop__grid-wrap" aria-label="Products">
        {visible.length ? (
          <div className="pel-shop__grid">
            {visible.map((product) => (
              <ShopCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="pel-shop__empty">
            <p className="pel-shop__empty-title">Nothing here yet.</p>
            <p className="pel-shop__empty-sub">
              {filter === 'All'
                ? 'This collection has no products right now — check back soon.'
                : `No ${filter.toLowerCase()} in this collection yet.`}
            </p>
            {filter === 'All' ? (
              <Link to="/collections/all-products" className="pel-btn-outline">
                Browse all gear
              </Link>
            ) : (
              <button
                type="button"
                className="pel-btn-outline"
                onClick={() => setFilter('All')}
              >
                Show all styles
              </button>
            )}
          </div>
        )}
      </section>

      <section className="pel-values" aria-label="Core values">
        <div className="pel-values__inner">
          <div className="pel-values__eyebrow" data-reveal>
            Core Values of Por El Deporte
          </div>
          <div className="pel-values__grid">
            {VALUES.map((v) => (
              <div key={v.n} className="pel-value" data-reveal>
                <div className="pel-value__n">{v.n}</div>
                <h3 className="pel-value__t">{v.t}</h3>
                <p className="pel-value__b">{v.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ShopCard({product}: {product: ShopProductFragment}) {
  const {open} = useAside();
  const to = `/products/${product.handle}`;
  const variant = product.selectedOrFirstAvailableVariant;
  const min = product.priceRange.minVariantPrice;
  const max = product.priceRange.maxVariantPrice;
  const varies = min.amount !== max.amount;
  // Products with a real choice (size/color) can't be blind-added — the "+"
  // takes the shopper to the PDP to pick. Single-variant items quick-add.
  const needsChoice = product.options.some((o) => o.optionValues.length > 1);
  const plusIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );

  return (
    <div className="pel-shopcard">
      <Link className="pel-shopcard__link" to={to}>
        <div className="pel-shopcard__well">
          {product.featuredImage ? (
            <Image
              data={product.featuredImage}
              className="pel-shopcard__img"
              sizes="(min-width: 48em) 258px, 45vw"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="pel-shopcard__meta">
          <div className="pel-shopcard__cat">{categoryOf(product)}</div>
          <h3 className="pel-shopcard__name">{product.title}</h3>
          <div className="pel-shopcard__price">
            {varies ? <span>From&nbsp;</span> : null}
            <Money data={min} />
          </div>
        </div>
      </Link>
      {needsChoice ? (
        <Link
          className="pel-shopcard__add"
          to={to}
          aria-label={`Choose options for ${product.title}`}
        >
          {plusIcon}
        </Link>
      ) : variant?.availableForSale ? (
        <AddToCartButton
          className="pel-shopcard__add"
          onClick={() => open('cart')}
          lines={[{merchandiseId: variant.id, quantity: 1}]}
        >
          {plusIcon}
        </AddToCartButton>
      ) : null}
    </div>
  );
}
