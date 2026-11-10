import {useEffect, useRef, useState, type ComponentProps} from 'react';
import {useFetcher} from 'react-router';
import {Analytics, Image, Money} from '@shopify/hydrogen';
import type {JerseyPreorderQuery} from 'storefrontapi.generated';
import type {action} from '~/routes/products.club-jersey';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {useAside} from '~/components/Aside';
import {
  JERSEY_COLORS,
  JERSEY_STYLES,
  jerseyStyleValue,
  jerseyStyles,
  jerseyQuote,
  subtractPrices,
  type Price,
  JERSEY_SIZES,
  JERSEY_STORY,
  JERSEY_TITLE,
  NAME_LIMIT,
  PED_SOCKS_COLORS,
  matchesJerseyVariant,
  matchesSocksVariant,
  personalizationWindow,
  validateJerseySelection,
} from '~/lib/jersey';
import {JerseyArtwork} from './JerseyArtwork';

type JerseyStyle = (typeof JERSEY_STYLES)[number];

export function JerseyPage({
  product,
  socks,
  preview,
  now: serverNow,
}: {
  product: JerseyPreorderQuery['product'];
  socks: JerseyPreorderQuery['socks'];
  preview: boolean;
  now: number;
}) {
  const [firstStyle, setFirstStyle] = useState(JERSEY_STYLES[0]);
  const [secondStyle, setSecondStyle] = useState<JerseyStyle | null>(null);
  const [editingSecond, setEditingSecond] = useState(false);
  const bundle = Boolean(secondStyle);
  const styles = secondStyle ? [firstStyle, secondStyle] : [firstStyle];
  const style = jerseyStyleValue(styles.map(({value}) => value));
  const away = firstStyle.color === JERSEY_COLORS[1];
  const [size, setSize] = useState('');
  const [withShorts, setWithShorts] = useState(false);
  const [socksColor, setSocksColor] = useState('None');
  const withSocks = socksColor !== 'None';
  const [socksSize, setSocksSize] = useState('');
  const [shortsSize, setShortsSize] = useState('');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [view, setView] = useState<'photo' | 'club' | 'front' | 'back'>(
    preview ? 'photo' : 'front',
  );
  const [now, setNow] = useState(serverNow);
  const fetcher = useFetcher<typeof action>();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const addSecondRef = useRef<HTMLButtonElement>(null);
  const editSecondRef = useRef<HTMLButtonElement>(null);
  const {open, type: asideType} = useAside();
  const window = personalizationWindow(product?.startsAt?.value, now);
  const canPersonalize = preview || window.status === 'open';
  const canOrder = preview || ['open', 'closed'].includes(window.status);
  const sockSizes =
    socks?.options.find((option) => option.name === 'Size')?.values ?? [];
  const selectedSocksSize =
    socksSize || (sockSizes.length === 1 ? sockSizes[0] : '');
  const selection = {
    style,
    size,
    shortsSize: withShorts ? shortsSize : 'None',
    personalize: Boolean(name.trim() || number.trim()) && canPersonalize,
    name,
    number,
    socksColor: withSocks ? socksColor : 'None',
    socksSize: withSocks ? selectedSocksSize : '',
  };
  const variant = product?.variants.nodes.find((item) =>
    matchesJerseyVariant(item.selectedOptions, selection),
  );
  const hasSizes = Boolean(size && (!withShorts || shortsSize));
  const priceVariant = product?.variants.nodes.find((item) =>
    matchesJerseyVariant(item.selectedOptions, {
      ...selection,
      size: size || JERSEY_SIZES[0],
      shortsSize: withShorts ? shortsSize || JERSEY_SIZES[0] : 'None',
    }),
  );
  const socksVariant = socks?.variants.nodes.find((item) =>
    matchesSocksVariant(item.selectedOptions, selection),
  );
  const socksPrice =
    socksVariant?.price ??
    socks?.variants.nodes.find((item) =>
      matchesSocksVariant(item.selectedOptions, {
        socksColor,
        socksSize: selectedSocksSize || sockSizes[0] || '',
      }),
    )?.price ??
    null;
  const quote = jerseyQuote(
    selection,
    product?.variants.nodes ?? [],
    socksPrice,
    preview,
  );
  const price = quote.total;
  const firstChoice = quote.choices.find(
    (item) => item.style === firstStyle.value,
  )!;
  const styleChoices = JERSEY_STYLES.map((item) => ({
    style: item,
    price:
      quote.choices.find((choice) => choice.style === item.value)?.price ??
      null,
    image:
      product?.variants.nodes.find(
        (variant) =>
          variant.image &&
          variant.selectedOptions.some(
            (option) => option.name === 'Style' && option.value === item.value,
          ),
      )?.image ?? undefined,
  }));
  const secondChoices = styleChoices.map((item) => {
    const choice = quote.choices.find(
      (choice) =>
        choice.style === jerseyStyleValue([firstStyle.value, item.style.value]),
    );
    return {
      ...item,
      price: subtractPrices(
        (withShorts ? choice?.kitPrice : choice?.price) ?? null,
        withShorts ? firstChoice.kitPrice : firstChoice.price,
      ),
      savings: choice?.savings ?? null,
    };
  });
  const savings = secondChoices
    .filter((item) => item.style.value !== firstStyle.value)
    .map((item) => item.savings);
  const bundleSaving = savings.every(
    (price) =>
      price?.amount === savings[0]?.amount &&
      price?.currencyCode === savings[0]?.currencyCode,
  )
    ? savings[0]
    : null;
  const secondChoice = secondChoices.find(
    (item) => item.style.value === secondStyle?.value,
  );
  const socksComplete =
    !withSocks || !sockSizes.length || Boolean(selectedSocksSize);
  const socksAvailable =
    !withSocks || !socksComplete || Boolean(socksVariant?.availableForSale);
  const busy = fetcher.state !== 'idle';
  const available = preview || Boolean(variant?.availableForSale);
  const submitDisabled =
    busy || !canOrder || (hasSizes && !available) || !socksAvailable;
  const readyToSubmit =
    socksComplete &&
    !validateJerseySelection(
      {
        ...selection,
        name: name.trim().normalize('NFC').toUpperCase(),
        number: number.trim(),
      },
      canPersonalize,
    );
  const submitLabel = busy
    ? preview
      ? 'Reviewing…'
      : 'Adding to bag…'
    : !canOrder
      ? 'Preorders open soon'
      : (hasSizes && !available) || !socksAvailable
        ? 'Combination unavailable'
        : preview
          ? 'Review preorder'
          : 'Preorder now';
  const image =
    priceVariant?.image ??
    product?.images.nodes.find((item) => item.altText?.includes(style));
  const referencePhoto =
    preview && !bundle && !away && (view === 'photo' || view === 'club');
  const showingPhoto = referencePhoto || Boolean(image && view !== 'back');
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
          {name: JERSEY_TITLE},
        ]}
      />
      <section
        className="pel-pdp__main"
        aria-label={`${JERSEY_TITLE} preorder`}
      >
        <div className="jersey-intro">
          <p className="jersey-eyebrow">
            <span className="jersey-dot" /> THE OFFICIAL CLUB JERSEY · PREORDER
          </p>
          <h1 className="pel-pdp__title">{product?.title || JERSEY_TITLE}</h1>
          <p className="pel-pdp__lead">
            Our official jersey, released once every two years. Made with love
            for the people who make this club.
          </p>
          <div className="pel-pdp__price" aria-live="polite">
            {price ? <Money data={price} /> : <span>Select your kit</span>}
            <span className="jersey-price-label">
              {bundle ? '2 jerseys' : '1 jersey'}
              {withShorts ? ` + ${bundle ? '2 pairs of ' : ''}shorts` : ''}
              {withSocks ? ' + socks' : ''}
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
              <span>
                {referencePhoto
                  ? 'ON THE PITCH · REFERENCE'
                  : bundle
                    ? 'YOUR TWO JERSEYS'
                    : `${away ? 'AWAY / BLACK' : 'HOME / ORANGE'} · ${firstStyle.sleeve.toUpperCase()}`}
              </span>
              <span>POR EL DEPORTE</span>
            </div>
            {referencePhoto ? (
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
              <KitArtwork
                styles={styles}
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
            {preview && !away && !bundle && (
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
            {preview && !away && !bundle && (
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
                <KitArtwork
                  styles={styles}
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
                <KitArtwork
                  styles={styles}
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
            <input type="hidden" name="style" value={style} />
            <StyleChoice
              label="Choose your jersey"
              name="firstStyle"
              value={firstStyle.value}
              choices={styleChoices}
              unavailable={secondStyle?.value}
              unavailableLabel="Second jersey"
              onChange={(item) => {
                setFirstStyle(item);
                setView('front');
              }}
            />
            <SizeChoice
              name="size"
              label={bundle ? 'Size · both jerseys' : 'Size'}
              value={size}
              onChange={setSize}
            />

            <section
              className="jersey-bundle"
              aria-labelledby="jersey-bundle-heading"
            >
              {secondStyle ? (
                <div className="jersey-addon-row jersey-bundle-item">
                  <StylePicture
                    style={secondStyle}
                    image={secondChoice?.image}
                  />
                  <div className="jersey-addon-copy">
                    <h2 id="jersey-bundle-heading">
                      {secondStyle.color === JERSEY_COLORS[0] ? 'Home' : 'Away'}{' '}
                      · {secondStyle.sleeve}
                    </h2>
                    <small className="jersey-addon-saving">
                      {secondChoice?.savings ? (
                        <>
                          Bundle ·{' '}
                          <Money data={secondChoice.savings} as="span" /> saved
                        </>
                      ) : (
                        'Two-jersey bundle'
                      )}
                    </small>
                    <small>Same size and name + number</small>
                  </div>
                  <div className="jersey-item-actions">
                    <button
                      type="button"
                      className="jersey-text-button"
                      ref={editSecondRef}
                      aria-label="Edit second jersey"
                      aria-expanded={editingSecond}
                      aria-controls="jersey-second-options"
                      onClick={() => setEditingSecond(!editingSecond)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="jersey-text-button"
                      aria-label="Remove second jersey"
                      onClick={() => {
                        setSecondStyle(null);
                        setEditingSecond(false);
                        requestAnimationFrame(() =>
                          addSecondRef.current?.focus({preventScroll: true}),
                        );
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="jersey-bundle-offer">
                  <div className="jersey-addon-copy">
                    <h2 id="jersey-bundle-heading">Add another jersey</h2>
                    <small className="jersey-addon-saving">
                      {bundleSaving ? (
                        <>
                          Save <Money data={bundleSaving} as="span" /> · mix any
                          two styles
                        </>
                      ) : (
                        'Mix any two styles'
                      )}
                    </small>
                    <small>Same size and name + number on both.</small>
                  </div>
                  <button
                    type="button"
                    className="pel-pdp__size jersey-extra-toggle"
                    ref={addSecondRef}
                    aria-label={
                      editingSecond
                        ? 'Cancel adding second jersey'
                        : 'Add another jersey'
                    }
                    aria-expanded={editingSecond}
                    aria-controls="jersey-second-options"
                    onClick={() => setEditingSecond(!editingSecond)}
                  >
                    {editingSecond ? 'Cancel' : 'Add'}
                  </button>
                </div>
              )}
              {editingSecond && (
                <div id="jersey-second-options">
                  {withShorts && (
                    <p className="jersey-hint">
                      Prices below include a second pair of matching shorts in
                      your selected shorts size.
                    </p>
                  )}
                  <StyleChoice
                    label="Choose your second jersey"
                    name="secondStyle"
                    value={secondStyle?.value ?? ''}
                    choices={secondChoices}
                    unavailable={firstStyle.value}
                    unavailableLabel="Your first jersey"
                    additional
                    onChange={(item) => {
                      setSecondStyle(item);
                      setEditingSecond(false);
                      setView('front');
                      requestAnimationFrame(() =>
                        editSecondRef.current?.focus({preventScroll: true}),
                      );
                    }}
                  />
                </div>
              )}
            </section>

            <section
              className="jersey-personalization"
              aria-labelledby="jersey-personalization-heading"
            >
              <div className="jersey-option-heading">
                <h2 id="jersey-personalization-heading">Name + number</h2>
                <span className="jersey-option-note">
                  {canPersonalize
                    ? 'Optional · Included'
                    : window.status === 'closed'
                      ? 'Window closed'
                      : 'Coming at launch'}
                </span>
              </div>
              {canPersonalize ? (
                <>
                  {!preview && (
                    <p className="jersey-hint">Available until {closes}.</p>
                  )}
                  <div
                    className="jersey-print-fields"
                    onFocusCapture={(event) => {
                      if (
                        event.target instanceof HTMLInputElement &&
                        globalThis.matchMedia('(max-width: 60em)').matches
                      ) {
                        const bounds = event.target.getBoundingClientRect();
                        if (
                          bounds.top < 120 ||
                          bounds.bottom >
                            (globalThis.visualViewport?.height ??
                              globalThis.innerHeight) -
                              96
                        )
                          event.target.scrollIntoView({block: 'center'});
                      }
                    }}
                  >
                    <label htmlFor="jersey-name">
                      Name <span>Max {NAME_LIMIT}</span>
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
                        required={Boolean(number.trim())}
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
                        required={Boolean(name.trim())}
                        aria-describedby="jersey-print-note"
                      />
                    </label>
                  </div>
                  <p id="jersey-print-note" className="jersey-print-note">
                    Leave both blank for a plain back. Names print in uppercase.
                  </p>
                  <details className="jersey-print-preview">
                    <summary>View back preview</summary>
                    <div className="jersey-mobile-preview">
                      <KitArtwork
                        styles={styles}
                        back
                        shorts={false}
                        personalize={selection.personalize}
                        name={name.toUpperCase()}
                        number={number}
                      />
                      <p>Illustration · final details may vary</p>
                    </div>
                  </details>
                </>
              ) : (
                <p className="jersey-hint">
                  {window.status === 'closed'
                    ? 'Personalization has ended. Plain jerseys are still available to preorder.'
                    : 'Personalization opens for the first 7 days of preorder.'}
                </p>
              )}
            </section>

            <section
              className="jersey-shorts"
              aria-labelledby="jersey-shorts-heading"
            >
              <div className="jersey-addon-row">
                <PhotoPlaceholder label="Shorts" />
                <div className="jersey-addon-copy">
                  <h2 id="jersey-shorts-heading">
                    Matching shorts{bundle ? ' · 2 pairs' : ''}
                  </h2>
                  <small>
                    {quote.shorts && (
                      <>
                        +<Money data={quote.shorts} as="span" />
                        {quote.shortsSavings && (
                          <>
                            {' '}
                            · <Money data={quote.shortsValue} as="s" /> value
                          </>
                        )}
                      </>
                    )}
                  </small>
                </div>
                <button
                  type="button"
                  className="pel-pdp__size jersey-extra-toggle"
                  aria-label={
                    withShorts
                      ? 'Remove matching shorts'
                      : 'Add matching shorts'
                  }
                  aria-expanded={withShorts}
                  aria-controls="jersey-shorts-size"
                  onClick={() => setWithShorts(!withShorts)}
                >
                  {withShorts ? 'Remove' : 'Add'}
                </button>
              </div>
              {withShorts && (
                <div id="jersey-shorts-size">
                  <input type="hidden" name="addShorts" value="on" />
                  <SizeChoice
                    name="shortsSize"
                    label={bundle ? 'Shorts size · both pairs' : 'Shorts size'}
                    value={shortsSize}
                    onChange={setShortsSize}
                  />
                  <p className="jersey-hint">
                    Choose independently from your jersey size.
                  </p>
                </div>
              )}
            </section>

            {(preview || socks) && (
              <section
                className="jersey-socks"
                aria-labelledby="jersey-socks-heading"
              >
                <div className="jersey-addon-row">
                  <PhotoPlaceholder label="Socks" />
                  <div className="jersey-addon-copy">
                    <h2 id="jersey-socks-heading">PED socks · 1 pair</h2>
                    <small>
                      {socks
                        ? 'Add black or white.'
                        : 'Black / White · price and sizes coming soon'}
                    </small>
                  </div>
                  {withSocks && (
                    <button
                      type="button"
                      className="jersey-text-button"
                      aria-label="Remove PED socks"
                      onClick={() => setSocksColor('None')}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {socks && (
                  <fieldset className="jersey-sock-options">
                    <legend className="sr-only">Socks color</legend>
                    <div className="jersey-sizes jersey-choice-row">
                      {PED_SOCKS_COLORS.map((value) => {
                        const options = socks.variants.nodes.filter((item) =>
                          matchesSocksVariant(item.selectedOptions, {
                            socksColor: value,
                            socksSize:
                              item.selectedOptions.find(
                                (option) => option.name === 'Size',
                              )?.value || '',
                          }),
                        );
                        const selected = options.find((item) =>
                          matchesSocksVariant(item.selectedOptions, {
                            socksColor: value,
                            socksSize: selectedSocksSize,
                          }),
                        );
                        const optionPrice =
                          selected?.price ?? options[0]?.price;
                        const disabled = !options.some(
                          (item) => item.availableForSale,
                        );
                        return (
                          <label
                            key={value}
                            className={`pel-pdp__size${socksColor === value ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}
                          >
                            <input
                              type="radio"
                              name="socksColor"
                              value={value}
                              checked={socksColor === value}
                              disabled={disabled}
                              onChange={() => setSocksColor(value)}
                            />
                            {value}
                            {optionPrice && (
                              <small>
                                +<Money data={optionPrice} as="span" />
                              </small>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
                {withSocks &&
                  (sockSizes.length > 1 ? (
                    <fieldset className="pel-pdp__opt">
                      <legend className="pel-pdp__opt-label">Socks size</legend>
                      <div className="pel-pdp__sizes jersey-sizes">
                        {sockSizes.map((value) => (
                          <label
                            key={value}
                            className={`pel-pdp__size${selectedSocksSize === value ? ' is-active' : ''}`}
                          >
                            <input
                              type="radio"
                              name="socksSize"
                              value={value}
                              checked={selectedSocksSize === value}
                              onChange={() => setSocksSize(value)}
                              required
                            />
                            {value}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ) : (
                    <input
                      type="hidden"
                      name="socksSize"
                      value={selectedSocksSize}
                    />
                  ))}
              </section>
            )}
            <button
              type="submit"
              className="pel-pdp__cta jersey-submit jersey-submit--main"
              disabled={submitDisabled}
            >
              <span>{submitLabel}</span>
              {price && <Money data={price} as="span" />}
              <span aria-hidden="true">↗</span>
            </button>
            <p className="jersey-shipping">
              Preorder ·{' '}
              {product?.shippingEstimate?.value ||
                'Shipping date to be confirmed.'}
            </p>
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
                    {fetcher.data.preview.style} · Jersey size{' '}
                    {fetcher.data.preview.size} ·{' '}
                    {fetcher.data.preview.shortsSize === 'None'
                      ? 'No shorts'
                      : `${jerseyStyles(fetcher.data.preview.style).length === 2 ? '2 pairs of shorts' : 'Shorts'}, size ${fetcher.data.preview.shortsSize}`}
                  </p>
                  {fetcher.data.preview.socksColor !== 'None' && (
                    <p>
                      PED socks: {fetcher.data.preview.socksColor}
                      {fetcher.data.preview.socksSize
                        ? ` · ${fetcher.data.preview.socksSize}`
                        : ''}
                    </p>
                  )}
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
            {JERSEY_STORY.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
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
              ['Sleeves', 'Short / Long'],
              ['Options', '1 jersey or mix any 2 · optional shorts'],
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
            {price ? <Money data={price} as="span" /> : <span>—</span>}
            <span>
              {size
                ? `${bundle ? '2 jerseys' : 'Jersey'} · ${size}`
                : 'Choose your fit'}
              {size && withShorts ? ` · Shorts ${shortsSize || 'size?'}` : ''}
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

function KitArtwork({
  styles,
  ...props
}: Omit<ComponentProps<typeof JerseyArtwork>, 'away' | 'longSleeve'> & {
  styles: typeof JERSEY_STYLES;
}) {
  const artworks = styles.map((item) => (
    <JerseyArtwork
      key={item.value}
      {...props}
      away={item.color === JERSEY_COLORS[1]}
      longSleeve={item.sleeve === 'Long sleeve'}
    />
  ));
  return styles.length === 2 ? (
    <div className="jersey-pair">{artworks}</div>
  ) : (
    artworks[0]
  );
}

function StyleChoice({
  label,
  name,
  value,
  choices,
  unavailable,
  unavailableLabel,
  additional,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  choices: {
    style: JerseyStyle;
    price: Price | null;
    image?: ComponentProps<typeof Image>['data'];
  }[];
  unavailable?: string;
  unavailableLabel: string;
  additional?: boolean;
  onChange: (style: JerseyStyle) => void;
}) {
  return (
    <fieldset className="pel-pdp__opt jersey-style-choice">
      <legend className="pel-pdp__opt-label">{label}</legend>
      <div className="jersey-style-grid">
        {choices.map(({style, price, image}) => {
          const disabled = style.value === unavailable || !price;
          const className = `jersey-style-option${style.value === value ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`;
          const content = (
            <>
              <StylePicture style={style} image={image} />
              <span className="jersey-style-copy">
                <strong>
                  {style.color === JERSEY_COLORS[0] ? 'Home' : 'Away'}
                </strong>
                <span>{style.sleeve}</span>
                <small>
                  {style.value === unavailable ? (
                    unavailableLabel
                  ) : price ? (
                    <>
                      {additional ? '+' : ''}
                      <Money data={price} as="span" />
                    </>
                  ) : (
                    'Unavailable'
                  )}
                </small>
              </span>
            </>
          );
          return additional ? (
            <button
              key={style.value}
              type="button"
              className={className}
              disabled={disabled}
              aria-pressed={style.value === value}
              onClick={() => onChange(style)}
            >
              {content}
            </button>
          ) : (
            <label key={style.value} className={className}>
              <input
                type="radio"
                name={name}
                value={style.value}
                checked={style.value === value}
                disabled={disabled}
                onChange={() => onChange(style)}
              />
              {content}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function StylePicture({
  style,
  image,
}: {
  style: JerseyStyle;
  image?: ComponentProps<typeof Image>['data'];
}) {
  return (
    <span className="jersey-style-picture" aria-hidden="true">
      {image ? (
        <Image data={image} sizes="72px" alt="" />
      ) : (
        <>
          <JerseyArtwork
            away={style.color === JERSEY_COLORS[1]}
            longSleeve={style.sleeve === 'Long sleeve'}
            back={false}
            shorts={false}
            personalize={false}
            name=""
            number=""
          />
          <small>Preview</small>
        </>
      )}
    </span>
  );
}

function SizeChoice({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="pel-pdp__opt">
      <legend className="pel-pdp__opt-label">{label}</legend>
      <div className="pel-pdp__sizes jersey-sizes jersey-fit-sizes">
        {JERSEY_SIZES.map((size) => (
          <label
            key={size}
            className={`pel-pdp__size${value === size ? ' is-active' : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={size}
              checked={value === size}
              onChange={() => onChange(size)}
              required
            />
            {size}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function PhotoPlaceholder({label}: {label: string}) {
  return (
    <span
      className="jersey-photo-placeholder"
      aria-label={`${label} photo coming soon`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8" cy="9" r="1.5" />
        <path d="m3 17 6-5 4 4 3-3 5 5" />
      </svg>
      <small>Photo soon</small>
    </span>
  );
}
