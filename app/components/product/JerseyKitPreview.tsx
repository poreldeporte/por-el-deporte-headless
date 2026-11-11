import type {RefObject} from 'react';
import {Money} from '@shopify/hydrogen';
import {
  JERSEY_COLORS,
  type JERSEY_STYLES,
  type JerseySelection,
  type Price,
} from '~/lib/jersey';
import {JerseyPhotos, SocksPhoto} from './JerseyPhotos';

export function JerseyKitPreview({
  dialogRef,
  styles,
  selection,
  price,
}: {
  dialogRef: RefObject<HTMLDialogElement>;
  styles: typeof JERSEY_STYLES;
  selection: JerseySelection;
  price: Price | null;
}) {
  const withShorts = selection.shortsSize !== 'None';
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
          {styles.map((style, index) => (
            <div key={style.value} className="jersey-kit-item">
              <div className="jersey-kit-photo">
                <JerseyPhotos
                  styles={[style]}
                  view={withShorts ? 'kit' : 'front'}
                  sizes={styles.length === 2 ? '45vw' : '90vw'}
                  priority
                />
              </div>
              <h3>
                Jersey {index + 1} ·{' '}
                {style.color === JERSEY_COLORS[0] ? 'Home' : 'Away'}
              </h3>
              <p>
                {style.sleeve} · {selection.size || 'Size not selected'}
              </p>
              {withShorts && (
                <p>
                  Matching shorts ·{' '}
                  {selection.shortsSize || 'Size not selected'}
                </p>
              )}
            </div>
          ))}
        </div>
        {selection.socksColor !== 'None' && (
          <div className="jersey-gallery-addon">
            <SocksPhoto color={selection.socksColor} />
            <div className="jersey-addon-copy">
              <strong>{selection.socksColor} PED socks</strong>
              <small>
                {selection.socksPack}
                {selection.socksSize ? ` · ${selection.socksSize}` : ''}
              </small>
            </div>
          </div>
        )}
        <p className="jersey-hint">
          {selection.personalize
            ? selection.name && selection.number
              ? `Your print: ${selection.name} / ${selection.number}.`
              : 'Finish your name and number in the builder.'
            : 'Plain back · no personalization.'}{' '}
          Photos show sample printing.
        </p>
      </div>
      <div className="jersey-kit-footer">
        {price && (
          <p>
            Kit total <Money data={price} as="strong" />
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
