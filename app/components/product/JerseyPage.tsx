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
  jerseyQuote,
  jerseyPrint,
  subtractPrices,
  type Price,
  type JerseySelection,
  JERSEY_SIZES,
  JERSEY_SHORTS_VALUE,
  JERSEY_STORY,
  JERSEY_TITLE,
  NAME_LIMIT,
  PED_SOCKS_COLORS,
  MAX_SOCKS_QUANTITY,
  matchesJerseyVariant,
  matchesShortsVariant,
  matchesSocksVariant,
  personalizationWindow,
  validateJerseySelection,
} from '~/lib/jersey';
import {JerseyPhotos, SocksPhoto, type JerseyPhotoView} from './JerseyPhotos';
import {JerseyKitPreview} from './JerseyKitPreview';
import {SocksGallery} from './SocksGallery';

type JerseyStyle = (typeof JERSEY_STYLES)[number];

export function JerseyPage({
  product,
  socks,
  shorts,
  preview,
  now: serverNow,
}: {
  product: JerseyPreorderQuery['product'];
  socks: JerseyPreorderQuery['socks'];
  shorts: JerseyPreorderQuery['shorts'];
  preview: boolean;
  now: number;
}) {
  const [firstStyle, setFirstStyle] = useState(JERSEY_STYLES[0]);
  const [secondStyle, setSecondStyle] = useState<JerseyStyle | null>(null);
  const [editingFirst, setEditingFirst] = useState(true);
  const [editingSecond, setEditingSecond] = useState(false);
  const bundle = Boolean(secondStyle);
  const styles = secondStyle ? [firstStyle, secondStyle] : [firstStyle];
  const away = firstStyle.color === JERSEY_COLORS[1];
  const firstSide = away ? 'Away' : 'Home';
  const secondSide = away ? 'Home' : 'Away';
  const [size, setSize] = useState('');
  const [secondSize, setSecondSize] = useState('');
  const [withShorts, setWithShorts] = useState(false);
  const [sockQuantities, setSockQuantities] = useState({Black: 0, White: 0});
  const [shortsSizes, setShortsSizes] = useState<Record<string, string>>({});
  const addShortsRef = useRef<HTMLButtonElement>(null);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [secondName, setSecondName] = useState('');
  const [secondNumber, setSecondNumber] = useState('');
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
  const firstPrint = jerseyPrint(
    canPersonalize ? name : '',
    canPersonalize ? number : '',
  );
  const secondPrint = jerseyPrint(
    canPersonalize ? secondName : '',
    canPersonalize ? secondNumber : '',
  );
  const selection: JerseySelection = {
    jerseys: styles.map((item, index) => ({
      style: item.value,
      size: index === 0 ? size : secondSize,
      print: index === 0 ? firstPrint : secondPrint,
      shortsSize: withShorts ? shortsSizes[item.color] || '' : 'None',
    })),
    socks: PED_SOCKS_COLORS.map((color) => ({
      color,
      quantity: sockQuantities[color],
    })).filter(({quantity}) => quantity > 0),
  };

  const variants = selection.jerseys.map((jersey) =>
    product?.variants.nodes.find((item) =>
      matchesJerseyVariant(item.selectedOptions, jersey),
    ),
  );
  const hasJerseySizes = Boolean(size && (!bundle || secondSize));
  const hasSizes =
    hasJerseySizes &&
    selection.jerseys.every(({shortsSize}) => Boolean(shortsSize));
  const priceVariant = product?.variants.nodes.find((item) =>
    matchesJerseyVariant(item.selectedOptions, {
      ...selection.jerseys[0],
      size: size || JERSEY_SIZES[0],
    }),
  );
  const quote = jerseyQuote(
    selection,
    product?.variants.nodes ?? [],
    socks?.variants.nodes ?? [],
    preview,
    shorts?.variants.nodes ?? [],
  );
  const price = quote.total;
  const sockChoices = quote.socks.prices.map((item) => ({
    ...item,
    available:
      preview ||
      Boolean(
        socks?.variants.nodes.some(
          (variant) =>
            variant.availableForSale &&
            matchesSocksVariant(variant.selectedOptions, item.color),
        ),
      ),
  }));
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
  const secondOffer = secondChoices.find(
    ({style}) =>
      style.color !== firstStyle.color && style.sleeve === firstStyle.sleeve,
  )!;
  const secondChoice = secondChoices.find(
    (item) => item.style.value === secondStyle?.value,
  );
  const socksAvailable = selection.socks.every(
    ({color}) => sockChoices.find((item) => item.color === color)?.available,
  );
  const busy = fetcher.state !== 'idle';
  const available =
    preview ||
    (variants.every((variant) => variant?.availableForSale) &&
      (!withShorts ||
        selection.jerseys.every((jersey) =>
          shorts?.variants.nodes.some(
            (item) =>
              item.availableForSale &&
              matchesShortsVariant(
                item.selectedOptions,
                jersey,
                jersey.shortsSize,
              ),
          ),
        )));
  const submitDisabled =
    busy || !canOrder || (hasSizes && !available) || !socksAvailable;
  const readyToSubmit = !validateJerseySelection(selection, canPersonalize);
  const previewSelection = fetcher.data?.preview;
  const previewIsCurrent =
    previewSelection &&
    Object.entries(selection).every(
      ([key, value]) =>
        JSON.stringify(previewSelection[key as keyof typeof selection]) ===
        JSON.stringify(value),
    );
  const submitLabel = busy
    ? preview
      ? 'Reviewing…'
      : 'Adding to cart…'
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
      : bundle && !secondSize
        ? `Choose ${secondSide.toLowerCase()} size`
        : withShorts && !hasSizes
          ? 'Choose shorts sizes'
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

  const removeSecondButton = (
    <button
      type="button"
      className="jersey-remove-button"
      aria-label={`Remove ${secondSide.toLowerCase()} jersey`}
      title={`Remove ${secondSide.toLowerCase()} jersey`}
      onClick={() => {
        setSecondStyle(null);
        setEditingFirst(false);
        setEditingSecond(false);
        requestAnimationFrame(() =>
          addSecondRef.current?.focus({preventScroll: true}),
        );
      }}
    >
      <span aria-hidden="true">×</span>
    </button>
  );

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
            <strong>
              This one’s for everyone who plays with us, cheers us on, or
              supports the club in their own way.
            </strong>{' '}
            We put a lot of love into this jersey, and we hope you wear it as
            proudly as we do.
          </p>
          <p className="jersey-release-note">
            Our official jersey. A new design every two years.
          </p>
          <p className="jersey-designer">
            Jersey design by <strong>Sergio Gomez</strong>
          </p>
          <div className="pel-pdp__price" aria-live="polite">
            {price ? <Money data={price} /> : <span>Select your kit</span>}
            <span className="jersey-price-label">Your kit total</span>
          </div>
          <p className="jersey-launch-offer">
            {canPersonalize
              ? 'Name + number included · first 7 days of preorder'
              : window.status === 'closed'
                ? 'Plain jersey preorder · personalization has ended'
                : 'Name + number included during launch week'}
          </p>
        </div>
        <div className="jersey-visual">
          <div className="pel-pdp__gallery jersey-gallery">
            <div className="pel-pdp__stage jersey-stage">
              <div className="jersey-stage-label">
                <span>
                  {view === 'shorts' || view === 'detail'
                    ? 'MATCHING SHORTS'
                    : view === 'action'
                      ? `${bundle ? 'HOME + AWAY' : away ? 'AWAY / BLACK' : 'HOME / ORANGE'} · ON THE FIELD`
                      : bundle
                        ? 'HOME + AWAY'
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
                  ['action', 'In action'],
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
                      sizes={
                        bundle
                          ? '(min-width: 60.01em) 60px, calc((100vw - 72px) / 10)'
                          : '(min-width: 60.01em) 120px, calc((100vw - 72px) / 5)'
                      }
                      decorative
                    />
                  </span>
                  <span className="jersey-thumb-label">{label}</span>
                </button>
              ))}
            </div>
            <p className="jersey-gallery-caption">
              {view === 'action'
                ? 'On the field in our short-sleeve jerseys. Matching shorts are optional.'
                : (view === 'shorts' || view === 'detail') && !withShorts
                  ? 'Matching shorts are optional. Add them to your jersey below.'
                  : canPersonalize
                    ? 'Name and number shown are an example. Add your own below.'
                    : 'Name and number shown are an example.'}
            </p>
            {selection.socks.map(({color, quantity}) => (
              <div className="jersey-gallery-addon" key={color}>
                <SocksPhoto color={color} />
                <div className="jersey-addon-copy">
                  <strong>{color} PED socks</strong>
                  <small>
                    {quantity} {quantity === 1 ? 'pair' : 'pairs'} · added to
                    your kit
                  </small>
                </div>
              </div>
            ))}
          </div>
          <div className="pel-pdp__stats" aria-label="Release details">
            {[
              {value: 'Official', label: 'Club jersey'},
              {value: '2014', label: 'Est. Key Biscayne'},
              {value: 'Preorder', label: 'Reserve your kit'},
              {value: 'Yours', label: 'Name + number · first 7 days'},
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
        </div>

        <div className="pel-pdp__buy">
          <fetcher.Form
            id="jersey-preorder-form"
            method="post"
            action="/products/club-jersey"
            className="jersey-form"
          >
            <input type="hidden" name="firstStyle" value={firstStyle.value} />
            {secondStyle && (
              <input
                type="hidden"
                name="secondStyle"
                value={secondStyle.value}
              />
            )}
            <h2 ref={builderRef} tabIndex={-1} className="jersey-builder-title">
              Build your kit
            </h2>
            <BuilderStep
              number={1}
              title="Choose your jersey"
              note={
                canPersonalize
                  ? 'Choose your style, size, and what goes on the back.'
                  : 'Choose your style and size.'
              }
            >
              <div className="jersey-item">
                {!editingFirst && (
                  <SelectedJersey style={firstStyle}>
                    <button
                      ref={editFirstRef}
                      type="button"
                      className="jersey-text-button"
                      aria-label={`Edit ${firstSide.toLowerCase()} jersey`}
                      aria-expanded={editingFirst}
                      aria-controls="jersey-first-options"
                      onClick={() => {
                        setEditingFirst(true);
                        setEditingSecond(false);
                        focusStyleChoice('jersey-first-options');
                      }}
                    >
                      Edit
                    </button>
                  </SelectedJersey>
                )}
                {editingFirst && (
                  <div
                    id="jersey-first-options"
                    className="jersey-first-choice"
                  >
                    <StyleChoice
                      label={
                        bundle ? `${firstSide} sleeve length` : 'Home or Away'
                      }
                      name="firstStyleChoice"
                      value={firstStyle.value}
                      choices={styleChoices.filter(
                        (item) =>
                          !secondStyle ||
                          item.style.color !== secondStyle.color,
                      )}
                      onChange={(item) => {
                        setFirstStyle(item);
                        setEditingFirst(false);
                        setView((current) =>
                          current === 'action' ? current : 'front',
                        );
                        requestAnimationFrame(() =>
                          editFirstRef.current?.focus({preventScroll: true}),
                        );
                      }}
                    />
                  </div>
                )}
                <SizeChoice
                  name="firstSize"
                  label={`${firstSide} size`}
                  value={size}
                  onChange={(value) => {
                    setSize(value);
                    setEditingFirst(false);
                  }}
                />
                {canPersonalize && (
                  <div
                    className="jersey-personalization"
                    role="group"
                    aria-label={`${firstSide} jersey personalization`}
                  >
                    <div className="jersey-option-heading">
                      <h4>{firstSide} name + number</h4>
                      <span className="jersey-option-note">
                        Included · optional
                      </span>
                    </div>
                    <PrintFields
                      name={name}
                      number={number}
                      onNameChange={setName}
                      onNumberChange={setNumber}
                    />
                  </div>
                )}
              </div>

              <div className="jersey-bundle">
                {secondStyle ? (
                  <div className="jersey-item jersey-item--removable">
                    {removeSecondButton}
                    {!editingSecond && (
                      <SelectedJersey style={secondStyle}>
                        <button
                          type="button"
                          className="jersey-text-button"
                          ref={editSecondRef}
                          aria-label={`Edit ${secondSide.toLowerCase()} jersey`}
                          aria-expanded={editingSecond}
                          aria-controls="jersey-second-options"
                          onClick={() => {
                            setEditingSecond(true);
                            setEditingFirst(false);
                            focusStyleChoice('jersey-second-options');
                          }}
                        >
                          Edit
                        </button>
                      </SelectedJersey>
                    )}
                    {editingSecond && (
                      <div
                        id="jersey-second-options"
                        className="jersey-first-choice"
                      >
                        {withShorts && (
                          <p className="jersey-hint">
                            These prices include matching shorts.
                          </p>
                        )}
                        <StyleChoice
                          label={`${secondSide} sleeve length`}
                          name="secondStyle"
                          value={secondStyle.value}
                          choices={secondChoices.filter(
                            (item) => item.style.color !== firstStyle.color,
                          )}
                          additional
                          onChange={(item) => {
                            setSecondStyle(item);
                            setEditingSecond(false);
                            setView((current) =>
                              current === 'action' ? current : 'front',
                            );
                            requestAnimationFrame(() =>
                              editSecondRef.current?.focus({
                                preventScroll: true,
                              }),
                            );
                          }}
                        />
                      </div>
                    )}
                    <SizeChoice
                      name="secondSize"
                      label={`${secondSide} size`}
                      value={secondSize}
                      onChange={(value) => {
                        setSecondSize(value);
                        setEditingSecond(false);
                      }}
                    />
                    {canPersonalize && (
                      <div
                        className="jersey-personalization"
                        role="group"
                        aria-label={`${secondSide} jersey personalization`}
                      >
                        <div className="jersey-option-heading">
                          <h4>{secondSide} name + number</h4>
                          <span className="jersey-option-note">
                            Included · optional
                          </span>
                        </div>
                        <PrintFields
                          second
                          name={secondName}
                          number={secondNumber}
                          onNameChange={setSecondName}
                          onNumberChange={setSecondNumber}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="jersey-bundle-offer"
                    ref={addSecondRef}
                    disabled={!secondOffer.price}
                    onClick={() => {
                      setSecondStyle(secondOffer.style);
                      setSecondSize('');
                      setSecondName(name);
                      setSecondNumber(number);
                      setEditingFirst(false);
                      setEditingSecond(true);
                      setView((current) =>
                        current === 'action' ? current : 'front',
                      );
                      focusStyleChoice('jersey-second-options', true);
                    }}
                  >
                    <StylePicture style={secondOffer.style} />
                    <span className="jersey-addon-copy">
                      <strong>Add {secondSide} jersey</strong>
                      <small className="jersey-addon-saving">
                        {secondOffer.savings ? (
                          <>
                            Save <Money data={secondOffer.savings} as="span" />{' '}
                            with Home + Away
                          </>
                        ) : (
                          'Complete your Home + Away set'
                        )}
                      </small>
                      {withShorts && <small>Includes matching shorts</small>}
                    </span>
                    <span className="jersey-bundle-price">
                      {secondOffer.price ? (
                        <>
                          +<Money data={secondOffer.price} as="span" />
                        </>
                      ) : (
                        'Unavailable'
                      )}
                    </span>
                  </button>
                )}
                {secondStyle && secondChoice?.savings && (
                  <p className="jersey-hint jersey-addon-saving">
                    Home + Away ·{' '}
                    <Money data={secondChoice.savings} as="span" /> saved
                  </p>
                )}
              </div>
              <p className="jersey-hint">
                {canPersonalize
                  ? preview
                    ? 'Name + number included for the first 7 days of preorder.'
                    : `Name + number included until ${closes}.`
                  : window.status === 'closed'
                    ? 'Personalization has ended. Plain jerseys are still available to preorder.'
                    : 'Personalization opens for the first 7 days of preorder.'}
              </p>
            </BuilderStep>
            <BuilderStep
              number={2}
              title="Matching shorts"
              note="Optional · Choose your shorts size separately."
              action={
                withShorts ? (
                  <button
                    type="button"
                    className="jersey-text-button"
                    aria-label="Remove matching shorts"
                    onClick={() => {
                      setWithShorts(false);
                      requestAnimationFrame(() =>
                        addShortsRef.current?.focus({preventScroll: true}),
                      );
                    }}
                  >
                    Remove
                  </button>
                ) : undefined
              }
            >
              {withShorts ? (
                <div className="jersey-item-list" id="jersey-shorts-sizes">
                  <input type="hidden" name="addShorts" value="on" />
                  {styles.map((style, index) => (
                    <ShortsCard
                      key={style.color}
                      style={style}
                      name={
                        index === 0 ? 'firstShortsSize' : 'secondShortsSize'
                      }
                      size={shortsSizes[style.color] || ''}
                      price={quote.shortsPrices[index]}
                      onChange={(value) =>
                        setShortsSizes((current) => ({
                          ...current,
                          [style.color]: value,
                        }))
                      }
                    />
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  className="jersey-bundle-offer"
                  ref={addShortsRef}
                  aria-label="Add matching shorts"
                  aria-expanded={false}
                  aria-controls="jersey-shorts-sizes"
                  disabled={!quote.shorts}
                  onClick={() => {
                    setWithShorts(true);
                    setView('front');
                    requestAnimationFrame(() =>
                      document
                        .querySelector<HTMLElement>(
                          '#jersey-shorts-sizes input[type=radio], #jersey-shorts-sizes button',
                        )
                        ?.focus({preventScroll: true}),
                    );
                  }}
                >
                  <span className="jersey-extra-picture" aria-hidden="true">
                    <JerseyPhotos
                      styles={styles}
                      view="shorts"
                      sizes="64px"
                      decorative
                    />
                  </span>
                  <span className="jersey-addon-copy">
                    <strong>
                      {bundle
                        ? 'Add both matching shorts'
                        : 'Add matching shorts'}
                    </strong>
                    <small>
                      With pockets ·{' '}
                      <Money data={JERSEY_SHORTS_VALUE} as="span" /> value per
                      pair
                    </small>
                  </span>
                  <span className="jersey-bundle-price">
                    {quote.shorts && (
                      <>
                        +<Money data={quote.shorts} as="span" />
                      </>
                    )}
                  </span>
                </button>
              )}
            </BuilderStep>

            {(preview || socks) && (
              <BuilderStep
                number={3}
                title="Socks"
                note="Optional · One size"
                action={
                  <SocksGallery
                    selectedColor={selection.socks[0]?.color ?? 'Black'}
                  />
                }
              >
                {quote.socks.offer && (
                  <p className="jersey-socks-offer">
                    {quote.socks.nextPair ? (
                      <>
                        Add one more pair for{' '}
                        <Money data={quote.socks.nextPair} as="span" />
                      </>
                    ) : (
                      <>
                        Mix colors · Any 3 pairs for{' '}
                        <Money data={quote.socks.offer} as="span" />
                      </>
                    )}
                  </p>
                )}
                <div className="jersey-item jersey-socks-card">
                  <div
                    className="jersey-socks-total"
                    role="status"
                    aria-atomic="true"
                  >
                    <strong>Socks total</strong>
                    {quote.socks.total ? (
                      <Money
                        data={quote.socks.total}
                        as="strong"
                        className="jersey-socks-price"
                      />
                    ) : (
                      <strong>—</strong>
                    )}
                    <span>
                      {quote.socks.quantity}{' '}
                      {quote.socks.quantity === 1 ? 'pair' : 'pairs'}
                    </span>
                    <span className="jersey-socks-saving">
                      {quote.socks.savings && (
                        <>
                          You save{' '}
                          <Money data={quote.socks.savings} as="span" />
                        </>
                      )}
                    </span>
                  </div>
                  {sockChoices.map(({color, price: sockPrice, available}) => {
                    const quantity = sockQuantities[color];
                    const changeQuantity = (delta: number) =>
                      setSockQuantities((current) => ({
                        ...current,
                        [color]: Math.max(
                          0,
                          Math.min(MAX_SOCKS_QUANTITY, current[color] + delta),
                        ),
                      }));
                    return (
                      <div
                        key={color}
                        className="jersey-addon-row jersey-sock-row"
                      >
                        <SocksPhoto color={color} />
                        <div className="jersey-addon-copy">
                          <h4>{color}</h4>
                          <small>
                            {!available
                              ? 'Unavailable'
                              : sockPrice && (
                                  <>
                                    <Money data={sockPrice} as="span" /> per
                                    pair
                                  </>
                                )}
                          </small>
                        </div>
                        <div
                          className="jersey-quantity"
                          role="group"
                          aria-label={`${color} socks quantity`}
                        >
                          <button
                            type="button"
                            disabled={quantity === 0}
                            aria-label={`Remove one pair of ${color.toLowerCase()} socks`}
                            onClick={() => changeQuantity(-1)}
                          >
                            −
                          </button>
                          <output
                            aria-live="polite"
                            aria-label={`${color} pairs`}
                          >
                            {quantity}
                          </output>
                          <button
                            type="button"
                            disabled={
                              !available || quantity >= MAX_SOCKS_QUANTITY
                            }
                            aria-label={`Add one pair of ${color.toLowerCase()} socks`}
                            onClick={() => changeQuantity(1)}
                          >
                            +
                          </button>
                        </div>
                        <input
                          type="hidden"
                          name={`socks${color}`}
                          value={quantity}
                        />
                      </div>
                    );
                  })}
                </div>
              </BuilderStep>
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
              {fetcher.data?.preview && previewIsCurrent && (
                <div className="jersey-review-summary" role="status">
                  <strong>Your preorder preview</strong>
                  {fetcher.data.preview.jerseys.map((jersey, index) => (
                    <p key={jersey.style}>
                      Jersey {index + 1}: {jersey.style} · Size {jersey.size}
                      {jersey.print.name
                        ? ` · Back: ${jersey.print.name} / ${jersey.print.number}`
                        : ' · Plain back'}
                    </p>
                  ))}
                  {fetcher.data.preview.jerseys
                    .filter(({shortsSize}) => shortsSize !== 'None')
                    .map((jersey) => (
                      <p key={jersey.style}>
                        {jersey.style.startsWith('Home') ? 'Home' : 'Away'}{' '}
                        shorts · Size {jersey.shortsSize}
                      </p>
                    ))}
                  {fetcher.data.preview.socks.map(({color, quantity}) => (
                    <p key={color}>
                      {color} PED socks · {quantity}{' '}
                      {quantity === 1 ? 'pair' : 'pairs'}
                    </p>
                  ))}
                  <small>
                    Preview only. No item added to your cart and no order
                    placed.
                  </small>
                </div>
              )}
            </div>
          </fetcher.Form>
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
              ['Options', 'Home, Away, or both'],
              ['Shorts', 'With pockets · optional · choose a separate size'],
              ['Socks', 'Black / White · Mix colors · One size'],
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

function BuilderStep({
  number,
  title,
  note,
  action,
  children,
}: {
  number: number;
  title: string;
  note: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="jersey-step" aria-labelledby={`jersey-step-${number}`}>
      <div className="jersey-step-heading">
        <span aria-hidden="true" className="jersey-step-number">
          0{number}
        </span>
        <div>
          <h3 id={`jersey-step-${number}`}>{title}</h3>
          <p>{note}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function PrintFields({
  second = false,
  name,
  number,
  onNameChange,
  onNumberChange,
}: {
  second?: boolean;
  name: string;
  number: string;
  onNameChange: (name: string) => void;
  onNumberChange: (number: string) => void;
}) {
  const prefix = second ? 'jersey-second' : 'jersey';
  return (
    <>
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
                (globalThis.visualViewport?.height ?? globalThis.innerHeight) -
                  96
            )
              event.target.scrollIntoView({block: 'center'});
          }
        }}
      >
        <label htmlFor={`${prefix}-name`}>
          Name on back <span>Max {NAME_LIMIT}</span>
          <input
            id={`${prefix}-name`}
            className="jersey-print-name"
            name={second ? 'secondName' : 'name'}
            autoComplete="off"
            maxLength={NAME_LIMIT}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="YOUR NAME"
            required={Boolean(number.trim())}
            pattern="[\p{L}\p{M} .’'\-]+"
            aria-describedby={`${prefix}-print-note`}
          />
        </label>
        <label htmlFor={`${prefix}-number`}>
          Number <span>0–99</span>
          <input
            id={`${prefix}-number`}
            className="jersey-print-number"
            name={second ? 'secondNumber' : 'number'}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={2}
            pattern="[0-9]{1,2}"
            value={number}
            onChange={(event) => onNumberChange(event.target.value)}
            placeholder="10"
            required={Boolean(name.trim())}
            aria-describedby={`${prefix}-print-note`}
          />
        </label>
      </div>
      <p id={`${prefix}-print-note`} className="jersey-print-note">
        Leave both blank for a plain back. Names print in uppercase.
      </p>
    </>
  );
}

function SelectedJersey({
  style,
  children,
}: {
  style: JerseyStyle;
  children: ReactNode;
}) {
  return (
    <div
      className="jersey-addon-row jersey-selected-jersey"
      role="group"
      aria-label={`${style.color === JERSEY_COLORS[0] ? 'Home' : 'Away'} jersey`}
    >
      <StylePicture style={style} />
      <div className="jersey-addon-copy">
        <h4>{style.color === JERSEY_COLORS[0] ? 'Home' : 'Away'} jersey</h4>
        <small>
          {style.color === JERSEY_COLORS[0] ? 'Orange' : 'Black'} ·{' '}
          {style.sleeve}
        </small>
        {children}
      </div>
    </div>
  );
}

function ShortsCard({
  style,
  name,
  size,
  price,
  onChange,
}: {
  style: JerseyStyle;
  name: string;
  size: string;
  price: Price | null;
  onChange: (size: string) => void;
}) {
  const [editing, setEditing] = useState(!size);
  const editRef = useRef<HTMLButtonElement>(null);
  const side = style.color === JERSEY_COLORS[0] ? 'Home' : 'Away';
  return (
    <div className="jersey-item">
      <div className="jersey-addon-row">
        <span className="jersey-extra-picture" aria-hidden="true">
          <JerseyPhotos
            styles={[style]}
            view="shorts"
            sizes="64px"
            decorative
          />
        </span>
        <div className="jersey-addon-copy">
          <h4>{side} shorts</h4>
          <small>{side === 'Home' ? 'Cream' : 'Black'} · With pockets</small>
          <small>
            {!editing && <>Size {size} · </>}
            {price && (
              <>
                +<Money data={price} as="span" />
              </>
            )}
          </small>
        </div>
        {!editing && (
          <button
            type="button"
            ref={editRef}
            className="jersey-text-button"
            aria-label={`Edit ${side.toLowerCase()} shorts size`}
            aria-expanded={false}
            aria-controls={`${name}-options`}
            onClick={() => {
              setEditing(true);
              requestAnimationFrame(() =>
                document
                  .querySelector<HTMLElement>(`#${name}-options input:checked`)
                  ?.focus({preventScroll: true}),
              );
            }}
          >
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <div id={`${name}-options`}>
          <SizeChoice
            name={name}
            label={`${side} shorts size`}
            value={size}
            onChange={(value) => {
              onChange(value);
              setEditing(false);
              requestAnimationFrame(() =>
                editRef.current?.focus({preventScroll: true}),
              );
            }}
          />
        </div>
      ) : (
        <input type="hidden" name={name} value={size} />
      )}
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
                onClick={() => {
                  if (style.value === value) onChange(style);
                }}
              />
              {content}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function focusStyleChoice(id: string, scroll = false) {
  requestAnimationFrame(() => {
    const choice = document.querySelector<HTMLElement>(
      `#${id} input:checked, #${id} button[aria-pressed="true"]`,
    );
    choice?.focus({preventScroll: true});
    if (scroll) choice?.scrollIntoView({block: 'center'});
  });
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
              onClick={() => {
                if (value === size) onChange(size);
              }}
              required
            />
            {size}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
