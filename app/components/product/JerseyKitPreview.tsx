import type {RefObject} from 'react';
import {Money} from '@shopify/hydrogen';
import {
  JERSEY_COLORS,
  type JERSEY_STYLES,
  type JerseySelection,
  type jerseyQuote,
} from '~/lib/jersey';
import {ProductPrice} from '~/components/ProductPrice';
import {JerseyPhotos, SocksPhoto} from './JerseyPhotos';

export function JerseyKitPreview({
  dialogRef,
  styles,
  selection,
  quote,
}: {
  dialogRef: RefObject<HTMLDialogElement>;
  styles: typeof JERSEY_STYLES;
  selection: JerseySelection;
  quote: ReturnType<typeof jerseyQuote>;
}) {
  const withShorts = selection.jerseys.some(
    ({shortsSize}) => shortsSize !== 'None',
  );
  return (
    <dialog
      ref={dialogRef}
      id="jersey-kit-preview"
      className="jersey-kit-preview"
      aria-labelledby="jersey-kit-title"
    >
      <div className="jersey-kit-header">
        <h2 id="jersey-kit-title">Your kit</h2>
        <button
          type="button"
          className="jersey-text-button"
          aria-label="Close kit preview"
          onClick={() => dialogRef.current?.close()}
        >
          Close
        </button>
      </div>
      <div className="jersey-kit-content">
        <div className="jersey-kit-jerseys">
          {styles.map((style, index) => {
            const {size, print, shortsSize} = selection.jerseys[index];
            return (
              <div key={style.value} className="jersey-kit-item">
                <div className="jersey-kit-photo">
                  <JerseyPhotos
                    styles={[style]}
                    view={withShorts ? 'kit' : 'front'}
                    sizes={styles.length === 2 ? '45vw' : '90vw'}
                  />
                </div>
                <h3>
                  {style.color === JERSEY_COLORS[0] ? 'Home' : 'Away'} jersey
                </h3>
                <p>
                  {style.sleeve} · {size ? `Size ${size}` : 'Choose a size'}
                </p>
                <p>
                  <ProductPrice
                    price={quote.jerseyPrices[index]}
                    compareAtPrice={quote.jerseyValues[index]}
                  />
                </p>
                <p>
                  {print.name || print.number
                    ? print.name && print.number
                      ? `Back: ${print.name} / ${print.number}`
                      : 'Add both a name and number, or leave both blank.'
                    : 'Plain back'}
                </p>
                {withShorts && (
                  <p>
                    Matching shorts ·{' '}
                    {shortsSize ? `Size ${shortsSize}` : 'Choose a size'} ·{' '}
                    <ProductPrice
                      price={quote.shortsPrices[index]}
                      compareAtPrice={quote.shortsValues[index]}
                    />
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {selection.socks.map(({color, quantity}) => (
          <div className="jersey-gallery-addon" key={color}>
            <SocksPhoto color={color} />
            <div className="jersey-addon-copy">
              <strong>{color} PED socks</strong>
              <small>
                {quantity} {quantity === 1 ? 'pair' : 'pairs'} · One size
              </small>
            </div>
          </div>
        ))}
        <p className="jersey-hint">Photos show an example name and number.</p>
      </div>
      <div className="jersey-kit-footer">
        {quote.total && (
          <p>
            Kit total{' '}
            <ProductPrice price={quote.total} compareAtPrice={quote.original} />
          </p>
        )}
        {quote.savings && (
          <p className="jersey-total-saving">
            You save <Money data={quote.savings} as="span" />
          </p>
        )}
        <button
          type="button"
          className="pel-pdp__cta"
          onClick={() => dialogRef.current?.close()}
        >
          Continue building
        </button>
      </div>
    </dialog>
  );
}
