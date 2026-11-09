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
  const [view, setView] = useState<'photo' | 'front' | 'back'>(
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
    (preview && view === 'photo') || Boolean(image && view !== 'back');
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
    if (view === 'photo') setView('front');
  }

  return (
    <div className={`jersey-page${away ? ' jersey-page--away' : ''}`}>
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
      <section className="jersey-layout" aria-label="The Club Jersey preorder">
        <div className="jersey-gallery">
          <div
            className={`jersey-stage${view === 'photo' ? ' jersey-stage--photo' : ''}`}
          >
            <div className="jersey-stage-label">
              <span>{away ? 'AWAY / BLACK' : 'HOME / ORANGE'}</span>
              <span>POR EL DEPORTE</span>
            </div>
            {preview && view === 'photo' ? (
              <img
                src="/jersey/home-reference.png"
                alt="The orange home jersey on the pitch in Key Biscayne — reference photograph"
                loading="eager"
              />
            ) : image && view !== 'back' ? (
              <Image
                data={image}
                sizes="(min-width: 900px) 55vw, 100vw"
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
          <div className="jersey-gallery-nav" aria-label="Jersey views">
            {preview && !away && (
              <button
                type="button"
                aria-pressed={view === 'photo'}
                onClick={() => setView('photo')}
              >
                On the pitch
              </button>
            )}
            <button
              type="button"
              aria-pressed={view === 'front'}
              onClick={() => setView('front')}
            >
              Front
            </button>
            <button
              type="button"
              aria-pressed={view === 'back'}
              onClick={() => setView('back')}
            >
              Your name & number <span aria-hidden="true">↗</span>
            </button>
          </div>
          <p className="jersey-gallery-caption">
            {preview
              ? 'A first look at the new kit. Official product photography coming soon.'
              : 'Your club. Your colors. Your jersey.'}
          </p>
        </div>

        <div className="jersey-buy">
          <p className="jersey-eyebrow">
            <span className="jersey-dot" /> THE NEW CLUB KIT · PREORDER
          </p>
          <h1>
            For the{' '}
            <br />
            club.
          </h1>
          <p className="jersey-intro">
            From the first whistle to whatever comes after. The new Por El
            Deporte jersey, made yours.
          </p>
          <div className="jersey-price" aria-live="polite">
            {price ? <Money data={price} /> : <span>Select your kit</span>}
            <span>{withShorts ? 'Jersey + shorts' : 'Jersey only'}</span>
          </div>

          <fetcher.Form
            method="post"
            action="/products/club-jersey"
            className="jersey-form"
          >
            <fieldset>
              <legend>
                <span>01</span> Pick your side
              </legend>
              <div className="jersey-colors">
                {JERSEY_COLORS.map((value, index) => (
                  <label
                    key={value}
                    className={color === value ? 'is-selected' : ''}
                  >
                    <input
                      type="radio"
                      name="color"
                      value={value}
                      checked={color === value}
                      onChange={() => changeColor(value)}
                    />
                    <span
                      className={`jersey-swatch${index ? ' jersey-swatch--black' : ''}`}
                    />
                    <span>
                      {index ? 'Away' : 'Home'}
                      <small>{index ? 'Black' : 'Orange'}</small>
                    </span>
                    <span className="jersey-choice-mark" aria-hidden="true">
                      {color === value ? '●' : '○'}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>
                <span>02</span> Choose your size
              </legend>
              <div className="jersey-sizes">
                {JERSEY_SIZES.map((value) => (
                  <label
                    key={value}
                    className={size === value ? 'is-selected' : ''}
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
            <fieldset>
              <legend>
                <span>03</span> Make it a kit
              </legend>
              <div className="jersey-kit-options">
                {JERSEY_KITS.map((value, index) => (
                  <label
                    key={value}
                    className={kit === value ? 'is-selected' : ''}
                  >
                    <input
                      type="radio"
                      name="kit"
                      value={value}
                      checked={kit === value}
                      onChange={() => setKit(value)}
                    />
                    <span>
                      {value}
                      <small>
                        {index
                          ? 'The full match-day look. Shorts in the same size.'
                          : 'Your new starting shirt.'}
                      </small>
                    </span>
                    {preview && (
                      <span>${Number(JERSEY_PREVIEW_PRICES[index])}</span>
                    )}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="jersey-personalization">
              <p className="jersey-personalization-tag">
                {canPersonalize
                  ? 'LAUNCH WEEK EXCLUSIVE'
                  : window.status === 'closed'
                    ? 'PERSONALIZATION CLOSED'
                    : 'COMING AT LAUNCH'}
              </p>
              <h2>Your name. Your number.</h2>
              <p>
                {preview
                  ? 'Make it yours during the first 7 days of the preorder. The window starts when we launch.'
                  : canPersonalize
                    ? `Personalization closes ${closes}.`
                    : window.status === 'closed'
                      ? 'The 7-day window has ended. You can still preorder a jersey without personalization.'
                      : 'Name + number personalization will be available for the first 7 days of the preorder.'}
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
              className="jersey-submit"
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
          <p className="jersey-community-note">
            Every order helps pay for the next match.
          </p>
        </div>
      </section>

      <div className="jersey-strip" aria-label="Kit details">
        <span>TWO COLORS. ONE CLUB.</span>
        <span>JERSEY OR FULL KIT</span>
        <span>YOUR NAME + NUMBER</span>
        <span>BEYOND THE GAME.</span>
      </div>
      <section className="jersey-story">
        {preview && (
          <img
            src="/jersey/club-reference.png"
            alt="Por El Deporte players together wearing the orange home kit — reference photograph"
            loading="lazy"
          />
        )}
        <div>
          <p className="jersey-eyebrow">EST. 2014 · KEY BISCAYNE</p>
          <h2>
            Same club.
            <br />
            New colors.
          </h2>
          <p>Home in orange. Away in black. Always Por El Deporte.</p>
          <p>
            Built around the people who show up, week after week. Pick your
            side, add the shorts, and put your name on it. We&rsquo;ll see you
            on the pitch.
          </p>
        </div>
      </section>
      <section className="jersey-faq" aria-label="Preorder questions">
        <h2>Before the whistle.</h2>
        <div>
          <details>
            <summary>How does the preorder work?</summary>
            <p>
              Choose your color, size, and either a jersey on its own or a
              jersey with shorts. This is a preorder, so it will ship after
              production. The shipping date is to be confirmed.
            </p>
          </details>
          <details>
            <summary>Can I add my own name and number?</summary>
            <p>
              Yes, during the first 7 days after launch. Personalization is
              optional. Enter a name of up to {NAME_LIMIT} characters and a
              number from 0 to 99. Your name prints in uppercase.
            </p>
          </details>
          <details>
            <summary>What sizes are available?</summary>
            <p>
              M, L, XL, and XXL. If you add shorts, they will be the same size
              as your jersey.
            </p>
          </details>
          <details>
            <summary>When will my kit ship?</summary>
            <p>
              {product?.shippingEstimate?.value ||
                'The shipping date is to be confirmed. This is a preorder, not an item ready to ship.'}
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
