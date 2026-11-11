import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import type {HomeJerseyFragment} from 'storefrontapi.generated';
import {JerseyPhotos} from '~/components/product/JerseyPhotos';
import {
  JERSEY_HANDLE,
  JERSEY_STYLES,
  JERSEY_TITLE,
  personalizationWindow,
} from '~/lib/jersey';

export function JerseyFeature({
  product,
  now,
}: {
  product: Promise<HomeJerseyFragment | null>;
  now: number;
}) {
  return (
    <section className="pel-jersey-feature" aria-labelledby="jersey-feature-title">
      <div className="pel-jersey-feature__media">
        <JerseyPhotos
          styles={[JERSEY_STYLES[0], JERSEY_STYLES[3]]}
          view="front"
          sizes="(min-width: 60em) 22vw, 42vw"
        />
        <div className="pel-jersey-feature__colors" aria-hidden="true">
          <span>Home / Orange</span>
          <span>Away / Black</span>
        </div>
      </div>
      <div className="pel-jersey-feature__copy">
        <p className="pel-jersey-feature__eyebrow">
          Official release · Every two years
        </p>
        <h2 id="jersey-feature-title">{JERSEY_TITLE}</h2>
        <p className="pel-jersey-feature__body">
          For everyone who plays with us, cheers us on, or supports the club in
          their own way. We put a lot of love into this one.
        </p>
        <p className="pel-jersey-feature__styles">
          Home or Away. Short or long sleeve. Make it yours.
        </p>
        <Suspense fallback={<JerseyDetails product={null} now={now} />}>
          <Await resolve={product}>
            {(jersey) => <JerseyDetails product={jersey} now={now} />}
          </Await>
        </Suspense>
        <Link className="pel-btn-outline" to={`/products/${JERSEY_HANDLE}`}>
          Build your kit <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}

function JerseyDetails({
  product,
  now,
}: {
  product: HomeJerseyFragment | null;
  now: number;
}) {
  const canPersonalize =
    personalizationWindow(product?.startsAt?.value, now).status === 'open';

  return (
    <div className="pel-jersey-feature__details">
      <p className="pel-jersey-feature__price">
        {product && (
          <>
            <span>Jerseys from</span>
            <Money data={product.priceRange.minVariantPrice} as="strong" />
          </>
        )}
      </p>
      <p className="pel-jersey-feature__offer">
        {canPersonalize
          ? 'Name + number included during launch week.'
          : 'Jersey design by Sergio Gomez.'}
      </p>
      <p className="pel-jersey-feature__shipping">
        Preorder ·{' '}
        {product?.shippingEstimate?.value || 'Shipping date to be confirmed.'}
      </p>
    </div>
  );
}
