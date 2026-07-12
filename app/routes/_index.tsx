import {Suspense} from 'react';
import {Await, Link, useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {ProductRail, ProductRailSkeleton} from '~/components/home/ProductRail';
import {CartButton} from '~/components/home/CartButton';
import {About} from '~/components/home/About';
import {Moods} from '~/components/home/Moods';
import {FunctionSection} from '~/components/home/FunctionSection';
import {Testimonials} from '~/components/home/Testimonials';
import {useHomeReveal} from '~/components/home/useHomeReveal';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Por El Deporte | Miami Soccer Apparel & Community'},
    {
      name: 'description',
      content:
        'Beyond the game — building community and creating memories in Key Biscayne since 2014. Shop Por El Deporte apparel.',
    },
  ];
};

// The rail is merchant-controlled: point this at any collection you curate in
// Shopify admin (e.g. a dedicated "Signature Gear" collection) to change what
// appears here — no code change needed.
const RAIL_COLLECTION_HANDLE = 'all-products';

export async function loader({context}: Route.LoaderArgs) {
  // The hero renders from static content, so we DON'T await the product rail.
  // Returning the un-awaited promise lets Hydrogen stream it in after first
  // paint (deferred data). See docs/BUILD_GUIDE.md §2.4.
  const railProducts = context.storefront
    .query(HOME_RAIL_QUERY, {
      variables: {handle: RAIL_COLLECTION_HANDLE, first: 12},
      cache: context.storefront.CacheLong(),
    })
    .then((data) => data.collection?.products.nodes ?? [])
    .catch((error: Error) => {
      // Never throw from deferred data — the page should still render.
      console.error(error);
      return [];
    });

  return {railProducts};
}

export default function Homepage() {
  const {railProducts} = useLoaderData<typeof loader>();
  useHomeReveal();
  return (
    <div className="pel-home">
      <TopMarquee />
      <Hero />
      <OrangeMarquee />
      <Suspense fallback={<ProductRailSkeleton />}>
        <Await resolve={railProducts} errorElement={null}>
          {(products) => <ProductRail products={products} />}
        </Await>
      </Suspense>
      <About />
      <Moods />
      <FunctionSection />
      <Testimonials />
    </div>
  );
}

/* ---------------------------------------------------------------- *
 * Marquees — pure-CSS infinite scroll (group duplicated for a
 * seamless translateX(-50%) loop; the copy is aria-hidden).
 * ---------------------------------------------------------------- */

function Spark({size = 14}: {size?: number}) {
  return (
    <svg
      className="pel-marquee__star"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <path
        d="M50 0C54 30 70 46 100 50C70 54 54 70 50 100C46 70 30 54 0 50C30 46 46 30 50 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MarqueeRow({
  items,
  variant,
  sparkSize,
}: {
  items: {id: string; text: string}[];
  variant: 'blue' | 'orange';
  sparkSize: number;
}) {
  const Group = ({hidden}: {hidden?: boolean}) => (
    <div className="pel-marquee__group" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item.id} style={{display: 'inline-flex', alignItems: 'center', gap: 'inherit'}}>
          <span>{item.text}</span>
          <Spark size={sparkSize} />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`pel-marquee pel-marquee--${variant}`}>
      <div className="pel-marquee__track">
        <Group />
        <Group hidden />
      </div>
    </div>
  );
}

function TopMarquee() {
  // Duplicated phrase set fills the strip; the whole group is then mirrored
  // (aria-hidden) so the translateX(-50%) loop is seamless.
  const phrases = [
    {id: 'btg-1', text: 'Beyond the Game'},
    {id: 'bc-1', text: 'Building Community'},
    {id: 'cm-1', text: 'Creating Memories'},
    {id: 'btg-2', text: 'Beyond the Game'},
    {id: 'bc-2', text: 'Building Community'},
    {id: 'cm-2', text: 'Creating Memories'},
  ];
  return <MarqueeRow items={phrases} variant="blue" sparkSize={14} />;
}

function OrangeMarquee() {
  const phrases = [
    {id: 'ship', text: 'Free Shipping on All Orders'},
    {id: 'est', text: 'Est. 2014 — Key Biscayne'},
    {id: 'week', text: 'On Your Doorstep in 1 Week'},
    {id: 'community', text: 'Powered by Community'},
  ];
  return <MarqueeRow items={phrases} variant="orange" sparkSize={16} />;
}

/* ---------------------------------------------------------------- *
 * Hero — full-bleed brand image, nav overlay, headline + CTAs.
 * ---------------------------------------------------------------- */

function Hero() {
  return (
    <section className="pel-hero" aria-label="Hero">
      <img
        className="pel-hero__img"
        src="https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-335.jpg?v=1750173740&width=2400"
        alt="Por El Deporte match day"
      />
      <div className="pel-hero__overlay" />

      <nav className="pel-nav" aria-label="Primary">
        <div className="pel-nav__links">
          <Link to="/" className="is-active">
            Home
          </Link>
          <Link to="/about">About</Link>
          <Link to="/collections/all-products">Shop</Link>
        </div>
        <div className="pel-nav__logo">
          <Link to="/" aria-label="Por El Deporte — home">
            Por El Deporte
          </Link>
        </div>
        <div className="pel-nav__actions">
          <button type="button" className="pel-pill pel-hide-mobile" title="Accounts — coming soon">
            Account
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="8" r="3.4" />
              <path d="M5.5 20c.5-3.5 3.5-5 6.5-5s6 1.5 6.5 5" />
            </svg>
          </button>
          <CartButton variant="pill" />
        </div>
      </nav>

      <div className="pel-hero__content">
        <h1 className="pel-hero__title">
          Miami Soccer
          <br />
          Apparel &amp; Community
        </h1>
        <div className="pel-hero__lede">
          <p className="pel-hero__sub">
            Beyond the game — building community and creating memories in Key
            Biscayne since 2014.
          </p>
          <div className="pel-cta-row">
            <Link to="/collections/all-products" className="pel-btn">
              Shop Now
            </Link>
            <Link
              to="/collections/all-products"
              className="pel-btn pel-btn--icon"
              aria-label="Shop now"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M7 17L17 7M8.5 7H17v8.5" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="pel-scroll-cue" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- *
 * GraphQL — the products rail reads a curated collection.
 * The query name (HomeRailProducts) + fragment (HomeRailProduct)
 * drive the generated types in storefrontapi.generated.d.ts.
 * ---------------------------------------------------------------- */

const HOME_RAIL_QUERY = `#graphql
  fragment HomeRailProduct on Product {
    id
    title
    handle
    featuredImage {
      id
      url
      altText
      width
      height
    }
    selectedOrFirstAvailableVariant(selectedOptions: [], ignoreUnknownOptions: true) {
      id
      availableForSale
    }
  }
  query HomeRailProducts(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      products(first: $first) {
        nodes {
          ...HomeRailProduct
        }
      }
    }
  }
` as const;
