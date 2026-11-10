import {useEffect, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import {Analytics, Image, Money} from '@shopify/hydrogen';
import type {JerseyPreorderQuery} from 'storefrontapi.generated';
import type {action} from '~/routes/products.club-jersey';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {useAside} from '~/components/Aside';
import {
  JERSEY_COLORS,
  JERSEY_PREVIEW_PRICES,
  JERSEY_SIZES,
  NAME_LIMIT,
  matchesJerseyVariant,
  personalizationWindow,
  validateJerseySelection,
} from '~/lib/jersey';
import {JerseyArtwork} from './JerseyArtwork';

export function JerseyPage({
  product,
  preview,
  now: serverNow,
}: {
  product: JerseyPreorderQuery['product'];
  preview: boolean;
  now: number;
}) {
  const [color, setColor] = useState<string>(JERSEY_COLORS[0]);
  const [size, setSize] = useState('');
  const [withShorts, setWithShorts] = useState(false);
  const [shortsSize, setShortsSize] = useState('');
  const [personalize, setPersonalize] = useState(true);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [view, setView] = useState<'photo' | 'club' | 'front' | 'back'>(
    preview ? 'photo' : 'front',
  );
  const [now, setNow] = useState(serverNow);
  const fetcher = useFetcher<typeof action>();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const {open, type: asideType} = useAside();
  const window = personalizationWindow(product?.startsAt?.value, now);
  const canPersonalize = preview || window.status === 'open';
  const canOrder = preview || ['open', 'closed'].includes(window.status);
  const selection = {
    color,
    size,
    shortsSize: withShorts ? shortsSize : 'None',
    personalize: personalize && canPersonalize,
    name,
    number,
  };
  const variant = product?.variants.nodes.find((item) =>
    matchesJerseyVariant(item.selectedOptions, selection),
  );
  const hasSizes = Boolean(size && (!withShorts || shortsSize));
  const priceSelection = {...selection, size: size || JERSEY_SIZES[0]};
  const jerseyOnlyVariant = product?.variants.nodes.find((item) =>
    matchesJerseyVariant(item.selectedOptions, {
      ...priceSelection,
      shortsSize: 'None',
    }),
  );
  const kitVariant = product?.variants.nodes.find((item) =>
    matchesJerseyVariant(item.selectedOptions, {
      ...priceSelection,
      shortsSize: shortsSize || JERSEY_SIZES[0],
    }),
  );
  const priceVariant = withShorts ? kitVariant : jerseyOnlyVariant;
  const price =
    priceVariant?.price ??
    (preview
      ? {
          amount: JERSEY_PREVIEW_PRICES[withShorts ? 1 : 0],
          currencyCode: 'USD' as const,
        }
      : null);
  const shortsPrice = preview
    ? {
        amount: (
          Number(JERSEY_PREVIEW_PRICES[1]) - Number(JERSEY_PREVIEW_PRICES[0])
        ).toFixed(2),
        currencyCode: 'USD' as const,
      }
    : jerseyOnlyVariant &&
        kitVariant &&
        jerseyOnlyVariant.price.currencyCode === kitVariant.price.currencyCode
      ? {
          amount: (
            Number(kitVariant.price.amount) -
            Number(jerseyOnlyVariant.price.amount)
          ).toFixed(2),
          currencyCode: kitVariant.price.currencyCode,
        }
      : null;
  const away = color === JERSEY_COLORS[1];
  const busy = fetcher.state !== 'idle';
  const available = preview || Boolean(variant?.availableForSale);
  const submitDisabled = busy || !canOrder || (hasSizes && !available);
  const readyToSubmit = !validateJerseySelection(
    {
      ...selection,
      name: name.trim().normalize('NFC').toUpperCase(),
      number: number.trim(),
    },
    canPersonalize,
  );
  const nextChoice = !size
    ? 'Choose jersey size'
    : selection.personalize && !name.trim()
      ? 'Add your name'
      : selection.personalize && !number.trim()
        ? 'Add your number'
        : withShorts && !shortsSize
          ? 'Choose shorts size'
          : !readyToSubmit
            ? 'Check print details'
            : null;
  const submitLabel = busy
    ? preview
      ? 'Reviewing…'
      : 'Adding to bag…'
    : !canOrder
      ? 'Preorders open soon'
      : hasSizes && !available
        ? 'Combination unavailable'
        : nextChoice ||
          (preview ? 'Review your preorder' : 'Preorder your jersey');
  const image =
    priceVariant?.image ??
    product?.images.nodes.find((item) => item.altText?.includes(color));
  const showingPhoto =
    (preview && (view === 'photo' || view === 'club')) ||
    Boolean(image && view !== 'back');
  const closes = window.endsAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
        timeZoneName: 'short',
      }).format(new Date(window.endsAt))
    : null;

  useEffect(() => {
    if (preview || !product?.startsAt?.value) return;
    const mounted = performance.now();
    setNow(serverNow);
    const timer = globalThis.setInterval(
      () => setNow(serverNow + performance.now() - mounted),
      1000,
    );
    return () => globalThis.clearInterval(timer);
  }, [serverNow, preview, product?.startsAt?.value]);

  useEffect(() => {
    if (fetcher.state !== 'idle') return;
    if (fetcher.data?.added) open('cart');
    else if (fetcher.data?.error || fetcher.data?.preview) {
      feedbackRef.current?.scrollIntoView({block: 'center'});
    }
  }, [fetcher.state, fetcher.data, open]);

  function changeColor(value: string) {
    setColor(value);
    if (view === 'photo' || view === 'club') setView('front');
  }

  return (
    <div className="pel-pdp jersey-page">
      {preview && (
        <div className="jersey-review-banner">
          DESIGN PREVIEW{' '}
          <span>
            Reference photos & illustrative mockups · no orders will be placed
          </span>
        </div>
      )}
      <Breadcrumbs
        items={[
          {name: 'Home', href: '/'},
          {name: 'Shop', href: '/collections/all-products'},
          {name: 'The Club Jersey'},
        ]}
      />
      <section className="pel-pdp__main" aria-label="The Club Jersey preorder">
        <div className="jersey-intro">
          <p className="jersey-eyebrow">
            <span className="jersey-dot" /> THE OFFICIAL CLUB JERSEY · PREORDER
          </p>
          <h1 className="pel-pdp__title">
            {product?.title || 'The Club Jersey'}
          </h1>
          <p className="pel-pdp__lead">
            Our official jersey, released once every two years. Made with love
            for the people who make this club.
          </p>
          <div className="pel-pdp__price" aria-live="polite">
            {price ? <Money data={price} /> : <span>Select your kit</span>}
            <span className="jersey-price-label">
              {withShorts ? 'Jersey + shorts' : 'Jersey only'}
            </span>
          </div>
          <p className="jersey-launch-offer">
            {canPersonalize
              ? 'Name + number included · first 7 days only'
              : window.status === 'closed'
                ? 'Plain jersey preorder · personalization has ended'
                : 'Name + number included during launch week'}
          </p>
        </div>
        <div className="pel-pdp__gallery jersey-gallery">
          <div
            className={`pel-pdp__stage jersey-stage${showingPhoto ? ' jersey-stage--photo' : ''}`}
          >
            <div className="jersey-stage-label">
              <span>{away ? 'AWAY / BLACK' : 'HOME / ORANGE'}</span>
              <span>POR EL DEPORTE</span>
            </div>
            {preview && (view === 'photo' || view === 'club') ? (
              <img
                src={
                  view === 'club'
                    ? '/jersey/club-reference.png'
                    : '/jersey/home-reference.png'
                }
                alt={
                  view === 'club'
                    ? 'Por El Deporte players wearing the orange home kit — reference photograph'
                    : 'The orange home jersey on the pitch in Key Biscayne — reference photograph'
                }
                loading="eager"
              />
            ) : image && view !== 'back' ? (
              <Image
                data={image}
                sizes="(min-width: 60em) 640px, 100vw"
                loading="eager"
              />
            ) : (
              <JerseyArtwork
                away={away}
                back={view === 'back'}
                shorts={withShorts}
                personalize={selection.personalize}
                name={name.toUpperCase()}
                number={number}
              />
            )}
            {!showingPhoto && (
              <span className="jersey-artwork-note">
                Illustration · final details may vary
              </span>
            )}
          </div>
          <div
            className="pel-pdp__thumbs jersey-thumbs"
            aria-label="Jersey views"
          >
            {preview && !away && (
              <button
                type="button"
                className={`pel-pdp__thumb${view === 'photo' ? ' is-active' : ''}`}
                aria-label="On the pitch"
                aria-pressed={view === 'photo'}
                onClick={() => setView('photo')}
              >
                <img src="/jersey/home-reference.png" alt="" loading="lazy" />
                <span className="jersey-thumb-label">On the pitch</span>
              </button>
            )}
            {preview && !away && (
              <button
                type="button"
                className={`pel-pdp__thumb${view === 'club' ? ' is-active' : ''}`}
                aria-label="The club"
                aria-pressed={view === 'club'}
                onClick={() => setView('club')}
              >
                <img src="/jersey/club-reference.png" alt="" loading="lazy" />
                <span className="jersey-thumb-label">The club</span>
              </button>
            )}
            <button
              type="button"
              className={`pel-pdp__thumb${view === 'front' ? ' is-active' : ''}`}
              aria-label="Front"
              aria-pressed={view === 'front'}
              onClick={() => setView('front')}
            >
              <span aria-hidden="true">
                <JerseyArtwork
                  away={away}
                  back={false}
                  shorts={withShorts}
                  personalize={false}
                  name=""
                  number=""
                />
              </span>
              <span className="jersey-thumb-label">Front</span>
            </button>
            <button
              type="button"
              className={`pel-pdp__thumb${view === 'back' ? ' is-active' : ''}`}
              aria-label="Your name & number"
              aria-pressed={view === 'back'}
              onClick={() => setView('back')}
            >
              <span aria-hidden="true">
                <JerseyArtwork
                  away={away}
                  back
                  shorts={withShorts}
                  personalize={selection.personalize}
                  name={name.toUpperCase()}
                  number={number}
                />
              </span>
              <span className="jersey-thumb-label">Back</span>
            </button>
          </div>
          <p className="jersey-gallery-caption">
            {preview
              ? 'A first look at the new kit. Official product photography coming soon.'
              : 'Your club. Your colors. Your jersey.'}
          </p>
        </div>

        <div className="pel-pdp__buy">
          <fetcher.Form
            id="jersey-preorder-form"
            method="post"
            action="/products/club-jersey"
            className="jersey-form"
          >
            <fieldset className="pel-pdp__opt">
              <legend className="pel-pdp__opt-label">Color</legend>
              <div className="pel-pdp__swatches jersey-colors">
                {JERSEY_COLORS.map((value, index) => (
                  <label
                    key={value}
                    className={`pel-pdp__swatch${color === value ? ' is-active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="color"
                      value={value}
                      checked={color === value}
                      onChange={() => changeColor(value)}
                    />
                    <span
                      className={`pel-pdp__swatch-dot jersey-swatch${index ? ' jersey-swatch--black' : ''}`}
                    />
                    <span className="pel-pdp__swatch-name">
                      {index ? 'Away' : 'Home'}
                      <small>{index ? 'Black' : 'Orange'}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="pel-pdp__opt">
              <legend className="pel-pdp__opt-label">Jersey size</legend>
              <div className="pel-pdp__sizes jersey-sizes">
                {JERSEY_SIZES.map((value) => (
                  <label
                    key={value}
                    className={`pel-pdp__size${size === value ? ' is-active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="size"
                      value={value}
                      checked={size === value}
                      onChange={() => setSize(value)}
                      required
                    />
                    {value}
                  </label>
                ))}
              </div>
            </fieldset>

            <section
              className="jersey-personalization"
              aria-labelledby="jersey-personalization-heading"
            >
              <div className="jersey-option-heading">
                <h2
                  id="jersey-personalization-heading"
                  className="pel-pdp__opt-label"
                >
                  Name & number
                </h2>
                <span className="jersey-option-note">
                  {canPersonalize
                    ? 'Included'
                    : window.status === 'closed'
                      ? 'Window closed'
                      : 'Coming at launch'}
                </span>
              </div>
              <p className="jersey-personalization-copy">
                {preview
                  ? 'Personalize this release during the first 7 days of preorder.'
                  : canPersonalize
                    ? `Add your name and number before ${closes}.`
                    : window.status === 'closed'
                      ? 'Personalization has ended. You can still preorder a plain jersey.'
                      : 'Personalization opens for 7 days when the preorder launches.'}
              </p>
              {canPersonalize && (
                <>
                  <fieldset className="jersey-print-choice">
                    <legend className="sr-only">Personalization</legend>
                    <div className="pel-pdp__sizes jersey-personalization-choice">
                      {[
                        {value: 'off', label: 'Keep it plain'},
                        {value: 'on', label: 'Name + number'},
                      ].map(({value, label}) => (
                        <label
                          key={value}
                          className={`pel-pdp__size${personalize === (value === 'on') ? ' is-active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="personalize"
                            value={value}
                            checked={personalize === (value === 'on')}
                            onChange={() => setPersonalize(value === 'on')}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {personalize && (
                    <div
                      className="jersey-print-layout"
                      onFocusCapture={(event) => {
                        if (
                          globalThis.matchMedia('(max-width: 60em)').matches
                        ) {
                          event.currentTarget.scrollIntoView({block: 'center'});
                        }
                      }}
                    >
                      <div className="jersey-print-fields">
                        <label htmlFor="jersey-name">
                          Name on back{' '}
                          <span>Up to {NAME_LIMIT} characters</span>
                          <input
                            id="jersey-name"
                            name="name"
                            autoComplete="off"
                            maxLength={NAME_LIMIT}
                            value={name}
                            onChange={(event) => {
                              setName(event.target.value);
                              setView('back');
                            }}
                            placeholder="YOUR NAME"
                            required
                            pattern="[\p{L}\p{M} .’'\-]+"
                            aria-describedby="jersey-print-note"
                          />
                        </label>
                        <label htmlFor="jersey-number">
                          Number <span>0–99</span>
                          <input
                            id="jersey-number"
                            name="number"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={2}
                            pattern="[0-9]{1,2}"
                            value={number}
                            onChange={(event) => {
                              setNumber(event.target.value);
                              setView('back');
                            }}
                            placeholder="10"
                            required
                          />
                        </label>
                      </div>
                      <details className="jersey-print-preview">
                        <summary>View back preview</summary>
                        <div className="jersey-mobile-preview">
                          <JerseyArtwork
                            away={away}
                            back
                            shorts={false}
                            personalize
                            name={name.toUpperCase()}
                            number={number}
                          />
                          <p>Illustration · final details may vary</p>
                        </div>
                      </details>
                    </div>
                  )}
                  {personalize && (
                    <p id="jersey-print-note" className="jersey-print-note">
                      Printed in uppercase. Check your spelling and number.
                    </p>
                  )}
                </>
              )}
            </section>

            <section
              className="jersey-shorts"
              aria-labelledby="jersey-shorts-heading"
            >
              <h2 id="jersey-shorts-heading" className="pel-pdp__opt-label">
                Complete your kit
              </h2>
              <label className="jersey-addon-row">
                <input
                  type="checkbox"
                  name="addShorts"
                  checked={withShorts}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setWithShorts(checked);
                    if (checked && !shortsSize) setShortsSize(size);
                  }}
                />
                <span className="jersey-addon-copy">
                  <strong>Add matching shorts</strong>
                  <small>
                    {withShorts && shortsSize
                      ? `Shorts size ${shortsSize} · change below`
                      : 'Choose a separate size.'}
                  </small>
                </span>
                {shortsPrice && (
                  <span className="jersey-shorts-price">
                    +<Money data={shortsPrice} as="span" />
                  </span>
                )}
              </label>
              {withShorts && (
                <fieldset id="jersey-shorts-sizes" className="pel-pdp__opt">
                  <legend className="pel-pdp__opt-label">Shorts size</legend>
                  <div className="pel-pdp__sizes jersey-sizes">
                    {JERSEY_SIZES.map((value) => (
                      <label
                        key={value}
                        className={`pel-pdp__size${shortsSize === value ? ' is-active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="shortsSize"
                          value={value}
                          checked={shortsSize === value}
                          onChange={() => setShortsSize(value)}
                          required
                        />
                        {value}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
            </section>

            <p className="jersey-order-summary">
              {away ? 'Away · Black' : 'Home · Orange'} / Jersey{' '}
              {size || '— choose a size'} /{' '}
              {withShorts
                ? `Shorts ${shortsSize || '— choose a size'}`
                : 'No shorts'}
              <span>
                {selection.personalize
                  ? `Back: ${name.trim().toUpperCase() || 'Your name'} / ${number.trim() || 'Your number'}`
                  : 'Plain back'}
              </span>
            </p>
            <p className="jersey-shipping">
              Preorder ·{' '}
              {product?.shippingEstimate?.value ||
                'Shipping date to be confirmed.'}
            </p>
            <button
              type="submit"
              className="pel-pdp__cta jersey-submit jersey-submit--main"
              disabled={submitDisabled}
            >
              <span>{submitLabel}</span>
              {price && <Money data={price} as="span" />}
              <span aria-hidden="true">↗</span>
            </button>
            <div ref={feedbackRef}>
              {fetcher.data?.error && (
                <p className="jersey-error" role="alert">
                  {fetcher.data.error}
                </p>
              )}
              {fetcher.data?.preview && (
                <div className="jersey-review-summary" role="status">
                  <strong>Your preorder preview</strong>
                  <p>
                    {fetcher.data.preview.color} · Jersey{' '}
                    {fetcher.data.preview.size} ·{' '}
                    {fetcher.data.preview.shortsSize === 'None'
                      ? 'No shorts'
                      : `Shorts ${fetcher.data.preview.shortsSize}`}
                  </p>
                  <p>
                    {fetcher.data.preview.personalize
                      ? `Back: ${fetcher.data.preview.name} / ${fetcher.data.preview.number}`
                      : 'Without personalization'}
                  </p>
                  <small>
                    Preview only. No item added to your cart and no order
                    placed.
                  </small>
                </div>
              )}
            </div>
          </fetcher.Form>
        </div>
        <div className="pel-pdp__stats" aria-label="Release details">
          {[
            {value: 'Official', label: 'Club jersey'},
            {value: '2014', label: 'Est. Key Biscayne'},
            {value: 'Preorder', label: 'Reserve your kit'},
            {value: 'Yours', label: 'Name + number at launch'},
          ].map(({value, label}) => (
            <div key={label} className="pel-pdp__stat">
              <div
                className="pel-pdp__stat-value"
                data-len={value.length > 4 ? 'long' : undefined}
              >
                {value}
              </div>
              <div className="pel-pdp__stat-rule" />
              <div className="pel-pdp__stat-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="pel-pdp__info" aria-label="About the jersey">
        <div className="pel-pdp__card">
          <h2 className="pel-pdp__card-title">The Story</h2>
          <div className="pel-pdp__card-body">
            <p>
              The games brought us together. The people made it a club. Since
              2014, Por El Deporte has grown around a shared love of playing.
              This is our official jersey, made with love for that community in
              Key Biscayne and beyond.
            </p>
            <p>
              We release a new design every two years: home in orange, away in
              black. For the first seven days of this preorder, you can put your
              own name and number on the back. It&rsquo;s the only chance to
              personalize this release. Step onto the field in yours.
            </p>
          </div>
          <div className="pel-pdp__card-foot">Est. 2014 · Key Biscayne</div>
        </div>
        <div className="pel-pdp__card">
          <h2 className="pel-pdp__card-title">Make It Yours</h2>
          <p className="pel-pdp__card-body">
            The first 7 days of the preorder are the only chance to personalize
            this release. Add your own name and number, or keep the back plain.
          </p>
          <ul className="pel-pdp__speclist" role="list">
            <li>Up to {NAME_LIMIT} characters for your name</li>
            <li>Names print in uppercase</li>
            <li>Jersey numbers from 0 to 99</li>
          </ul>
        </div>
        <div className="pel-pdp__card">
          <h2 className="pel-pdp__card-title">The Details</h2>
          <div className="pel-pdp__specs">
            {[
              ['Colors', 'Home (Orange) / Away (Black)'],
              ['Sizes', 'M / L / XL / XXL'],
              ['Options', 'Jersey only or with shorts'],
              ['Shorts', 'Choose a separate size'],
              [
                'Shipping',
                product?.shippingEstimate?.value || 'Date to be confirmed',
              ],
            ].map(([label, value]) => (
              <div key={label} className="pel-pdp__spec">
                <span className="pel-pdp__spec-k">{label}</span>
                <span className="pel-pdp__spec-v">{value}</span>
              </div>
            ))}
          </div>
          <p className="jersey-hint">
            This is a preorder. Your kit will ship after production.
          </p>
        </div>
      </section>
      {asideType === 'closed' && (
        <section className="jersey-mobile-bar" aria-label="Jersey preorder">
          <div className="jersey-mobile-total" aria-live="polite">
            {price && <Money data={price} as="span" />}
            <span>
              {size ? `Jersey ${size}` : 'Choose jersey size'}
              {withShorts
                ? shortsSize
                  ? ` · Shorts ${shortsSize}`
                  : ' · Choose shorts size'
                : ''}
            </span>
          </div>
          <button
            type="submit"
            form="jersey-preorder-form"
            className="pel-pdp__cta jersey-submit"
            disabled={submitDisabled}
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (form && !readyToSubmit && !form.reportValidity()) {
                event.preventDefault();
                form
                  .querySelector<HTMLInputElement>('input:invalid')
                  ?.scrollIntoView({block: 'center'});
              }
            }}
          >
            {submitLabel}
          </button>
        </section>
      )}
      {!preview && product && priceVariant && (
        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                vendor: product.vendor,
                price: priceVariant.price.amount,
                variantId: priceVariant.id,
                variantTitle: priceVariant.title,
                quantity: 1,
              },
            ],
          }}
        />
      )}
    </div>
  );
}
