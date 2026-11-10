import {useEffect, useState} from 'react';
import {useFetcher} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {JerseyPreorderQuery} from 'storefrontapi.generated';
import type {action} from '~/routes/products.club-jersey';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {useAside} from '~/components/Aside';
import {
  JERSEY_COLORS,
  JERSEY_KITS,
  JERSEY_PREVIEW_PRICES,
  JERSEY_SIZES,
  NAME_LIMIT,
  matchesJerseyVariant,
  personalizationWindow,
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
  const [kit, setKit] = useState<string>(JERSEY_KITS[0]);
  const [personalize, setPersonalize] = useState(true);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [view, setView] = useState<'photo' | 'club' | 'front' | 'back'>(
    preview ? 'photo' : 'front',
  );
  const [now, setNow] = useState(serverNow);
  const fetcher = useFetcher<typeof action>();
  const {open} = useAside();
  const window = personalizationWindow(product?.startsAt?.value, now);
  const canPersonalize = preview || window.status === 'open';
  const canOrder = preview || ['open', 'closed'].includes(window.status);
  const selection = {
    color,
    size,
    kit,
    personalize: personalize && canPersonalize,
    name,
    number,
  };
  const variant = product?.variants.nodes.find((item) =>
    matchesJerseyVariant(item.selectedOptions, selection),
  );
  const priceVariant = size
    ? variant
    : product?.variants.nodes.find((item) =>
        matchesJerseyVariant(item.selectedOptions, {
          ...selection,
          size: JERSEY_SIZES[0],
        }),
      );
  const price =
    priceVariant?.price ??
    (preview
      ? {
          amount: JERSEY_PREVIEW_PRICES[kit === JERSEY_KITS[1] ? 1 : 0],
          currencyCode: 'USD' as const,
        }
      : null);
  const away = color === JERSEY_COLORS[1];
  const withShorts = kit === JERSEY_KITS[1];
  const busy = fetcher.state !== 'idle';
  const available = preview || Boolean(variant?.availableForSale);
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
    if (fetcher.state === 'idle' && fetcher.data?.added) open('cart');
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
        <div className="pel-pdp__gallery">
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

        <div className="pel-pdp__stats" aria-label="Release details">
          {[
            {value: '2 YRS', label: 'Between releases'},
            {value: '7 DAYS', label: 'Custom at launch'},
            {value: 'M–XXL', label: 'Size range'},
            {value: '2014', label: 'Est. Key Biscayne'},
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

        <div className="pel-pdp__buy">
          <p className="jersey-eyebrow">
            <span className="jersey-dot" /> THE OFFICIAL CLUB JERSEY · PREORDER
          </p>
          <h1 className="pel-pdp__title">
            {product?.title || 'The Club Jersey'}
          </h1>
          <p className="pel-pdp__lead">
            Our official jersey. A new release every two years, made with love
            for the community that keeps us playing.
          </p>
          <div className="pel-pdp__price" aria-live="polite">
            {price ? <Money data={price} /> : <span>Select your kit</span>}
            <span className="jersey-price-label">
              {withShorts ? 'Jersey + shorts' : 'Jersey only'}
            </span>
          </div>

          <fetcher.Form
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
              <legend className="pel-pdp__opt-label">Size</legend>
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
            <fieldset className="pel-pdp__opt">
              <legend className="pel-pdp__opt-label">Kit</legend>
              <div className="pel-pdp__sizes jersey-kit-options">
                {JERSEY_KITS.map((value, index) => (
                  <label
                    key={value}
                    className={`pel-pdp__size${kit === value ? ' is-active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="kit"
                      value={value}
                      checked={kit === value}
                      onChange={() => setKit(value)}
                    />
                    <span>{value}</span>
                    {preview && (
                      <span>${Number(JERSEY_PREVIEW_PRICES[index])}</span>
                    )}
                  </label>
                ))}
              </div>
              {withShorts && (
                <p className="jersey-hint">
                  Shorts are the same size as your jersey.
                </p>
              )}
            </fieldset>

            <div className="pel-pdp__card jersey-personalization">
              <p className="jersey-personalization-tag">
                {canPersonalize
                  ? 'YOUR ONLY CHANCE TO CUSTOMIZE'
                  : window.status === 'closed'
                    ? 'PERSONALIZATION CLOSED'
                    : 'COMING AT LAUNCH'}
              </p>
              <h2 className="pel-pdp__card-title">Your name. Your number.</h2>
              <p className="jersey-personalization-copy">
                {preview
                  ? 'Your only chance to add your own name and number to this release. Personalization opens at launch and closes 7 days later.'
                  : canPersonalize
                    ? `This is the only personalization window for this release. Add your name and number before ${closes}.`
                    : window.status === 'closed'
                      ? 'Personalization for this release has ended. You can still preorder a jersey without personalization.'
                      : 'This release can only be personalized during the first 7 days of the preorder.'}
              </p>
              {canPersonalize && (
                <>
                  <label className="jersey-personalize-toggle">
                    <input
                      type="checkbox"
                      name="personalize"
                      checked={personalize}
                      onChange={(event) => setPersonalize(event.target.checked)}
                    />
                    Add my name & number
                  </label>
                  {personalize && (
                    <div className="jersey-print-fields">
                      <label htmlFor="jersey-name">
                        Name on back <span>Up to {NAME_LIMIT} characters</span>
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
                  )}
                  {personalize && (
                    <p id="jersey-print-note" className="jersey-print-note">
                      Names print in uppercase. Double-check spelling and number
                      before ordering.
                    </p>
                  )}
                </>
              )}
            </div>

            <p className="jersey-order-summary">
              {away ? 'Away · Black' : 'Home · Orange'} /{' '}
              {size || 'Choose a size'} /{' '}
              {withShorts ? 'With shorts' : 'Jersey only'}
            </p>
            <button
              type="submit"
              className="pel-pdp__cta jersey-submit"
              disabled={busy || !canOrder || (!!size && !available)}
            >
              <span>
                {busy
                  ? 'One moment…'
                  : !canOrder
                    ? 'Preorders open soon'
                    : size && !available
                      ? 'Combination unavailable'
                      : preview
                        ? 'Review your preorder'
                        : 'Preorder your jersey'}
              </span>
              {price && <Money data={price} as="span" />}
              <span aria-hidden="true">↗</span>
            </button>
            {fetcher.data?.error && (
              <p className="jersey-error" role="alert">
                {fetcher.data.error}
              </p>
            )}
            {fetcher.data?.preview && (
              <div className="jersey-review-summary" role="status">
                <strong>Your preorder preview</strong>
                <p>
                  {fetcher.data.preview.color} · {fetcher.data.preview.size} ·{' '}
                  {fetcher.data.preview.kit}
                </p>
                <p>
                  {fetcher.data.preview.personalize
                    ? `Back: ${fetcher.data.preview.name} / ${fetcher.data.preview.number}`
                    : 'Without personalization'}
                </p>
                <small>
                  Preview only. No item added to your cart and no order placed.
                </small>
              </div>
            )}
          </fetcher.Form>
          <p className="jersey-shipping">
            <span aria-hidden="true">◷</span> Preorder ·{' '}
            {product?.shippingEstimate?.value ||
              'Shipping date to be confirmed.'}
          </p>
        </div>
      </section>

      <section className="pel-pdp__info" aria-label="About the jersey">
        <div className="pel-pdp__card">
          <h2 className="pel-pdp__card-title">The Story</h2>
          <div className="pel-pdp__card-body">
            <p>
              Every two years, we release a new official Por El Deporte jersey.
              Made with love for the people who show up, share the field, and
              keep this community playing.
            </p>
            <p>
              Home in orange. Away in black. Add your own name and number and
              stand out on the field. The first seven days of the preorder are
              your only chance to personalize this release.
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
              ['Shorts', 'Same size as your jersey'],
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
    </div>
  );
}
