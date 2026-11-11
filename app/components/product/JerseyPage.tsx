import {useEffect, useRef, useState, type ReactNode} from 'react';
import {useFetcher} from 'react-router';
import {Analytics, Money} from '@shopify/hydrogen';
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
  socksPackSavings,
  type Price,
  JERSEY_SIZES,
  JERSEY_STORY,
  JERSEY_TITLE,
  NAME_LIMIT,
  PED_SOCKS_COLORS,
  PED_SOCKS_PACKS,
  matchesJerseyVariant,
  matchesSocksVariant,
  personalizationWindow,
  validateJerseySelection,
} from '~/lib/jersey';
import {JerseyPhotos, SocksPhoto, type JerseyPhotoView} from './JerseyPhotos';
import {JerseyKitPreview} from './JerseyKitPreview';

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
  const [editingFirst, setEditingFirst] = useState(false);
  const [editingSecond, setEditingSecond] = useState(false);
  const bundle = Boolean(secondStyle);
  const styles = secondStyle ? [firstStyle, secondStyle] : [firstStyle];
  const style = jerseyStyleValue(styles.map(({value}) => value));
  const away = firstStyle.color === JERSEY_COLORS[1];
  const [size, setSize] = useState('');
  const [withShorts, setWithShorts] = useState(false);
  const [socksColor, setSocksColor] = useState('None');
  const [socksPack, setSocksPack] = useState<string>(PED_SOCKS_PACKS[0].value);
  const withSocks = socksColor !== 'None';
  const [socksSize, setSocksSize] = useState('');
  const [shortsSize, setShortsSize] = useState('');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [view, setView] = useState<Exclude<JerseyPhotoView, 'kit'>>('front');
  const [now, setNow] = useState(serverNow);
  const fetcher = useFetcher<typeof action>();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const kitPreviewRef = useRef<HTMLDialogElement>(null);
  const builderRef = useRef<HTMLHeadingElement>(null);
  const editFirstRef = useRef<HTMLButtonElement>(null);
  const addSecondRef = useRef<HTMLButtonElement>(null);
  const editSecondRef = useRef<HTMLButtonElement>(null);
  const {open, type: asideType} = useAside();
  const window = personalizationWindow(product?.startsAt?.value, now);
  const canPersonalize = preview || window.status === 'open';
  const canOrder = preview || ['open', 'closed'].includes(window.status);
  const socksPreview = preview && !socks;
  const sockSizes =
    socks?.options.find((option) => option.name === 'Size')?.values ?? [];
  const selectedSocksSize =
    socksSize || (sockSizes.length === 1 ? sockSizes[0] : '');
  const selection = {
    style,
    size,
    shortsSize: withShorts ? shortsSize : 'None',
    personalize: Boolean(name.trim() || number.trim()) && canPersonalize,
    name: name.trim().normalize('NFC').toUpperCase(),
    number: number.trim(),
    socksColor: withSocks ? socksColor : 'None',
    socksPack,
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
  const sockChoices = PED_SOCKS_COLORS.flatMap((color) =>
    PED_SOCKS_PACKS.map((pack) => {
      const variants =
        socks?.variants.nodes.filter((item) =>
          matchesSocksVariant(item.selectedOptions, {
            socksColor: color,
            socksPack: pack.value,
            socksSize:
              selectedSocksSize ||
              item.selectedOptions.find((option) => option.name === 'Size')
                ?.value ||
              '',
          }),
        ) ?? [];
      return {
        color,
        pack: pack.value,
        price: variants[0]?.price ?? (socksPreview ? pack.price : null),
        available:
          socksPreview || variants.some((item) => item.availableForSale),
      };
    }),
  );
  const selectedSocks = sockChoices.find(
    (item) => item.color === socksColor && item.pack === socksPack,
  );
  const sockOffers = PED_SOCKS_COLORS.map((color) => {
    const single = sockChoices.find(
      (item) => item.color === color && item.pack === '1 pair',
    );
    const pack = sockChoices.find(
      (item) => item.color === color && item.pack === '3 pairs',
    );
    const saving = socksPackSavings(single?.price ?? null, pack?.price ?? null);
    if (!single?.available || !pack?.available || !pack.price || !saving)
      return null;
    return {color, price: pack.price, saving};
  });
  const socksOffer = withSocks
    ? sockOffers.find((offer) => offer?.color === socksColor)
    : sockOffers.every(
          (offer) =>
            offer &&
            offer.price.amount === sockOffers[0]?.price.amount &&
            offer.price.currencyCode === sockOffers[0]?.price.currencyCode &&
            offer.saving.amount === sockOffers[0]?.saving.amount,
        )
      ? sockOffers[0]
      : null;
  const quote = jerseyQuote(
    selection,
    product?.variants.nodes ?? [],
    selectedSocks?.price ?? null,
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
    !withSocks || !socksComplete || Boolean(selectedSocks?.available);
  const busy = fetcher.state !== 'idle';
  const available = preview || Boolean(variant?.availableForSale);
  const submitDisabled =
    busy || !canOrder || (hasSizes && !available) || !socksAvailable;
  const readyToSubmit =
    socksComplete && !validateJerseySelection(selection, canPersonalize);
  const previewSelection = fetcher.data?.preview;
  const previewIsCurrent =
    previewSelection &&
    Object.entries(selection).every(
      ([key, value]) =>
        previewSelection[key as keyof typeof selection] === value,
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
  const mobileSubmitLabel = submitDisabled
    ? submitLabel
    : !size
      ? 'Build your kit'
      : withShorts && !shortsSize
        ? 'Choose shorts size'
        : !socksComplete
          ? 'Choose socks size'
          : submitLabel;
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
          <span>Official product photos · no orders will be placed</span>
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
              {withSocks ? ` + ${socksPack} of socks` : ''}
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
          <div className="pel-pdp__stage jersey-stage">
            <div className="jersey-stage-label">
              <span>
                {view === 'shorts' || view === 'detail'
                  ? 'MATCHING SHORTS'
                  : bundle
                    ? 'YOUR TWO JERSEYS'
                    : `${away ? 'AWAY / BLACK' : 'HOME / ORANGE'} · ${firstStyle.sleeve.toUpperCase()}`}
              </span>
              <span>POR EL DEPORTE</span>
            </div>
            <JerseyPhotos
              styles={styles}
              view={view === 'front' && withShorts ? 'kit' : view}
              priority
            />
          </div>
          <div
            className="pel-pdp__thumbs jersey-thumbs"
            aria-label="Jersey views"
          >
            {(
              [
                ['front', withShorts ? 'Full kit' : 'Front'],
                ['back', 'Back'],
                ['shorts', 'Shorts'],
                ['detail', 'Detail'],
              ] as const
            ).map(([option, label]) => (
              <button
                key={option}
                type="button"
                className={`pel-pdp__thumb${view === option ? ' is-active' : ''}`}
                aria-label={label}
                aria-pressed={view === option}
                onClick={() => setView(option)}
              >
                <span className="jersey-thumb-image" aria-hidden="true">
                  <JerseyPhotos
                    styles={styles}
                    view={option === 'front' && withShorts ? 'kit' : option}
                    sizes={bundle ? '60px' : '120px'}
                    decorative
                  />
                </span>
                <span className="jersey-thumb-label">{label}</span>
              </button>
            ))}
          </div>
          <p className="jersey-gallery-caption">
            {(view === 'shorts' || view === 'detail') && !withShorts
              ? 'Matching shorts are optional. Add them to your jersey below.'
              : canPersonalize
                ? 'Name and number shown are an example. Add your own below.'
                : 'Name and number shown are an example.'}
          </p>
          {withSocks && (
            <div
              className="jersey-gallery-addon"
              role="group"
              aria-label="Socks in your kit"
            >
              <SocksPhoto color={socksColor} />
              <div className="jersey-addon-copy">
                <strong>{socksColor} PED socks</strong>
                <small>{socksPack} · added to your kit</small>
              </div>
            </div>
          )}
        </div>

        <div className="pel-pdp__buy">
          <fetcher.Form
            id="jersey-preorder-form"
            method="post"
            action="/products/club-jersey"
            className="jersey-form"
          >
            <input type="hidden" name="style" value={style} />
            <h2 ref={builderRef} tabIndex={-1} className="jersey-builder-title">
              Build your kit
            </h2>
            {secondStyle && (
              <SelectedJersey number={1} style={firstStyle}>
                <button
                  ref={editFirstRef}
                  type="button"
                  className="jersey-text-button"
                  aria-label="Edit jersey 1"
                  aria-expanded={editingFirst}
                  aria-controls="jersey-first-options"
                  onClick={() => {
                    setEditingFirst(!editingFirst);
                    setEditingSecond(false);
                  }}
                >
                  {editingFirst ? 'Done' : 'Edit'}
                </button>
              </SelectedJersey>
            )}
            {(!secondStyle || editingFirst) && (
              <div id="jersey-first-options" className="jersey-first-choice">
                <StyleChoice
                  label={bundle ? 'Change jersey 1' : 'Choose your jersey'}
                  name="firstStyle"
                  value={firstStyle.value}
                  choices={styleChoices.filter(
                    (item) => item.style.value !== secondStyle?.value,
                  )}
                  onChange={(item) => {
                    setFirstStyle(item);
                    setEditingFirst(false);
                    setView('front');
                    if (bundle)
                      requestAnimationFrame(() =>
                        editFirstRef.current?.focus({preventScroll: true}),
                      );
                  }}
                />
              </div>
            )}

            <section
              className={`jersey-bundle${bundle ? ' jersey-bundle--selected' : ''}`}
              aria-labelledby="jersey-bundle-heading"
            >
              {secondStyle ? (
                <>
                  <h2 id="jersey-bundle-heading" className="sr-only">
                    Your jersey bundle
                  </h2>
                  <SelectedJersey number={2} style={secondStyle}>
                    <button
                      type="button"
                      className="jersey-text-button"
                      ref={editSecondRef}
                      aria-label="Edit jersey 2"
                      aria-expanded={editingSecond}
                      aria-controls="jersey-second-options"
                      onClick={() => {
                        setEditingSecond(!editingSecond);
                        setEditingFirst(false);
                      }}
                    >
                      {editingSecond ? 'Done' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      className="jersey-text-button"
                      aria-label="Remove jersey 2"
                      onClick={() => {
                        setSecondStyle(null);
                        setEditingFirst(false);
                        setEditingSecond(false);
                        requestAnimationFrame(() =>
                          addSecondRef.current?.focus({preventScroll: true}),
                        );
                      }}
                    >
                      Remove
                    </button>
                  </SelectedJersey>
                  <p className="jersey-hint">
                    {secondChoice?.savings ? (
                      <>
                        Bundle · <Money data={secondChoice.savings} as="span" />{' '}
                        saved
                      </>
                    ) : (
                      'Two-jersey bundle'
                    )}{' '}
                    · Same size and name + number on both.
                  </p>
                </>
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
                    label={secondStyle ? 'Change jersey 2' : 'Choose jersey 2'}
                    name="secondStyle"
                    value={secondStyle?.value ?? ''}
                    choices={secondChoices.filter(
                      (item) => item.style.value !== firstStyle.value,
                    )}
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

            <SizeChoice
              name="size"
              label={bundle ? 'Size · both jerseys' : 'Size'}
              value={size}
              onChange={setSize}
            />

            <section
              className="jersey-shorts"
              aria-labelledby="jersey-shorts-heading"
            >
              <div className="jersey-option-heading">
                <h2 id="jersey-shorts-heading">Add matching shorts</h2>
                <span className="jersey-option-note">Optional</span>
              </div>
              <button
                type="button"
                className={`jersey-style-option jersey-shorts-card${withShorts ? ' is-active' : ''}`}
                aria-label={
                  withShorts ? 'Remove matching shorts' : 'Add matching shorts'
                }
                aria-pressed={withShorts}
                aria-expanded={withShorts}
                aria-controls="jersey-shorts-size"
                aria-describedby="jersey-shorts-price"
                onClick={() => {
                  setWithShorts(!withShorts);
                  setView('front');
                }}
              >
                <span className="jersey-extra-picture">
                  <JerseyPhotos
                    styles={styles}
                    view="shorts"
                    sizes={bundle ? '36px' : '72px'}
                  />
                </span>
                <span className="jersey-style-copy">
                  <strong>
                    {bundle
                      ? '2 matching pairs'
                      : away
                        ? 'Away shorts'
                        : 'Home shorts'}
                  </strong>
                  <span>
                    {bundle
                      ? 'One pair for each jersey'
                      : away
                        ? 'Black'
                        : 'Cream'}
                  </span>
                  <small id="jersey-shorts-price">
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
                </span>
                <span className="jersey-text-button" aria-hidden="true">
                  {withShorts ? 'Remove' : 'Add'}
                </span>
              </button>
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
                <div className="jersey-option-heading">
                  <h2 id="jersey-socks-heading">Add PED socks</h2>
                  {withSocks && (
                    <button
                      type="button"
                      className="jersey-text-button"
                      aria-label="Remove PED socks"
                      onClick={() => {
                        setSocksColor('None');
                        setSocksPack(PED_SOCKS_PACKS[0].value);
                      }}
                    >
                      Remove
                    </button>
                  )}
                  {!withSocks && (
                    <span className="jersey-option-note">Optional</span>
                  )}
                </div>
                <fieldset className="jersey-sock-options">
                  <legend className="sr-only">Socks color</legend>
                  {socksOffer && (
                    <p className="jersey-socks-offer">
                      3 pairs for <Money data={socksOffer.price} as="span" /> ·
                      Save <Money data={socksOffer.saving} as="span" />
                    </p>
                  )}
                  <div className="jersey-style-grid">
                    {PED_SOCKS_COLORS.map((value) => {
                      const choice = sockChoices.find(
                        (item) =>
                          item.color === value && item.pack === socksPack,
                      );
                      const disabled = !choice?.available;
                      return (
                        <label
                          key={value}
                          className={`jersey-style-option${socksColor === value ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}
                        >
                          <input
                            type="radio"
                            name="socksColor"
                            value={value}
                            checked={socksColor === value}
                            disabled={disabled}
                            onChange={() => setSocksColor(value)}
                          />
                          <span
                            className="jersey-style-picture"
                            aria-hidden="true"
                          >
                            <SocksPhoto color={value} />
                          </span>
                          <span className="jersey-style-copy">
                            <strong>{value}</strong>
                            <span>{socksPack}</span>
                            {choice?.price && (
                              <small>
                                +<Money data={choice.price} as="span" />
                              </small>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                {withSocks && (
                  <fieldset className="jersey-sock-options">
                    <legend className="sr-only">Socks pack</legend>
                    <div className="jersey-sizes jersey-choice-row">
                      {PED_SOCKS_PACKS.map(({value}) => {
                        const choice = sockChoices.find(
                          (item) =>
                            item.color === socksColor && item.pack === value,
                        );
                        const disabled = !choice?.available;
                        return (
                          <label
                            key={value}
                            className={`pel-pdp__size${socksPack === value ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}
                          >
                            <input
                              type="radio"
                              name="socksPack"
                              value={value}
                              checked={socksPack === value}
                              disabled={disabled}
                              onChange={() => setSocksPack(value)}
                              required
                            />
                            {value}
                            {choice?.price && (
                              <small>
                                +<Money data={choice.price} as="span" />
                              </small>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
                {socksPreview && withSocks && (
                  <p className="jersey-hint">Socks size to be confirmed.</p>
                )}
                {withSocks && socksPack === '3 pairs' && (
                  <p className="jersey-hint">
                    All three pairs in your selected color.
                  </p>
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
                        onChange={(event) => setName(event.target.value)}
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
                        onChange={(event) => setNumber(event.target.value)}
                        placeholder="10"
                        required={Boolean(name.trim())}
                        aria-describedby="jersey-print-note"
                      />
                    </label>
                  </div>
                  <p id="jersey-print-note" className="jersey-print-note">
                    Leave both blank for a plain back. Names print in uppercase.
                  </p>
                </>
              ) : (
                <p className="jersey-hint">
                  {window.status === 'closed'
                    ? 'Personalization has ended. Plain jerseys are still available to preorder.'
                    : 'Personalization opens for the first 7 days of preorder.'}
                </p>
              )}
            </section>

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
              {fetcher.data?.preview && previewIsCurrent && (
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
                      PED socks: {fetcher.data.preview.socksColor} ·{' '}
                      {fetcher.data.preview.socksPack}
                      {fetcher.data.preview.socksSize
                        ? ` · ${fetcher.data.preview.socksSize}`
                        : ''}
                      {socksPreview ? ' · size TBC' : ''}
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
              ['Socks', 'Black / White · 1 pair or 3 pairs'],
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
        <>
          <section className="jersey-mobile-bar" aria-label="Jersey preorder">
            <div className="jersey-mobile-total">
              <span aria-live="polite">
                {price ? <Money data={price} as="span" /> : '—'}
              </span>
              <button
                type="button"
                className="jersey-kit-trigger"
                aria-haspopup="dialog"
                aria-controls="jersey-kit-preview"
                onClick={() => kitPreviewRef.current?.showModal()}
              >
                View your kit
              </button>
            </div>
            <button
              type={size ? 'submit' : 'button'}
              form="jersey-preorder-form"
              className="pel-pdp__cta jersey-submit"
              disabled={submitDisabled}
              onClick={(event) => {
                if (!size) {
                  builderRef.current?.focus({preventScroll: true});
                  builderRef.current?.scrollIntoView({block: 'start'});
                  return;
                }
                const form = event.currentTarget.form;
                if (form && !readyToSubmit && !form.reportValidity()) {
                  event.preventDefault();
                  form
                    .querySelector<HTMLInputElement>('input:invalid')
                    ?.scrollIntoView({block: 'center'});
                }
              }}
            >
              {mobileSubmitLabel}
            </button>
          </section>
          <JerseyKitPreview
            dialogRef={kitPreviewRef}
            styles={styles}
            selection={selection}
            price={price}
          />
        </>
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

function SelectedJersey({
  number,
  style,
  children,
}: {
  number: number;
  style: JerseyStyle;
  children: ReactNode;
}) {
  return (
    <div
      className="jersey-addon-row jersey-selected-jersey"
      role="group"
      aria-label={`Jersey ${number}`}
    >
      <StylePicture style={style} />
      <div className="jersey-addon-copy">
        <h3>Jersey {number}</h3>
        <small>
          {style.color === JERSEY_COLORS[0] ? 'Home' : 'Away'} · {style.sleeve}
        </small>
      </div>
      <div className="jersey-item-actions">{children}</div>
    </div>
  );
}

function StyleChoice({
  label,
  name,
  value,
  choices,
  additional,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  choices: {
    style: JerseyStyle;
    price: Price | null;
  }[];
  additional?: boolean;
  onChange: (style: JerseyStyle) => void;
}) {
  return (
    <fieldset className="pel-pdp__opt jersey-style-choice">
      <legend className="pel-pdp__opt-label">{label}</legend>
      <div className="jersey-style-grid">
        {choices.map(({style, price}) => {
          const disabled = !price;
          const className = `jersey-style-option${style.value === value ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`;
          const content = (
            <>
              <StylePicture style={style} />
              <span className="jersey-style-copy">
                <strong>
                  {style.color === JERSEY_COLORS[0] ? 'Home' : 'Away'}
                </strong>
                <span>{style.sleeve}</span>
                <small>
                  {price ? (
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

function StylePicture({style}: {style: JerseyStyle}) {
  return (
    <span className="jersey-style-picture" aria-hidden="true">
      <JerseyPhotos styles={[style]} view="front" sizes="72px" decorative />
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
