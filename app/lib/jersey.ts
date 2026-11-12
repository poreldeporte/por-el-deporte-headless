import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';

export const JERSEY_HANDLE = 'club-jersey';
export const JERSEY_TITLE = 'The Club Jersey';
export const JERSEY_STORY = [
  'The games brought us together. The people made it a club. Since 2014, Por El Deporte has grown around a shared love of playing. This is our official jersey, made with love for that community in Key Biscayne and beyond.',
  'We release a new design every two years: home in orange, away in black. For the first seven days of this preorder, you can put your own name and number on the back. It’s the only chance to personalize this release. Step onto the field in yours.',
] as const;
export const JERSEY_SIZES = ['M', 'L', 'XL', 'XXL'] as const;
export const JERSEY_COLORS = ['Home (Orange)', 'Away (Black)'] as const;
export const JERSEY_SLEEVES = ['Short sleeve', 'Long sleeve'] as const;
export const JERSEY_STYLES = JERSEY_COLORS.flatMap((color) =>
  JERSEY_SLEEVES.map((sleeve) => ({
    value: `${color} / ${sleeve}`,
    color,
    sleeve,
    amount: sleeve === 'Long sleeve' ? '80.00' : '70.00',
  })),
);
export const JERSEY_STYLE_OPTIONS = [
  ...JERSEY_STYLES.map(({value}) => value),
  ...JERSEY_STYLES.flatMap((first, index) =>
    JERSEY_STYLES.slice(index + 1)
      .filter((second) => second.color !== first.color)
      .map((second) => jerseyStyleValue([first.value, second.value])),
  ),
];
export const PED_SOCKS_HANDLE = 'ped-socks';
export const JERSEY_SHORTS_HANDLE = 'club-shorts';
export const PED_SOCKS_COLORS = ['Black', 'White'] as const;
export const PED_SOCKS_PRICE = {amount: '10.00', currencyCode: 'USD'} as const;
export const PED_SOCKS_SAVING = 5;
export const MAX_SOCKS_QUANTITY = 99;
export const JERSEY_SHORTS_OPTIONS = ['None', ...JERSEY_SIZES] as const;
export const JERSEY_SHORTS_VALUE = {
  amount: '35.00',
  currencyCode: 'USD',
} as const;
export const JERSEY_BUNDLE_SAVING = 20;
export const JERSEY_SHORTS_PRICE = 15;
export const JERSEY_SHORTS_SAVING =
  Number(JERSEY_SHORTS_VALUE.amount) - JERSEY_SHORTS_PRICE;
export const NAME_LIMIT = 14;
const PERSONALIZATION_DURATION = 7 * 24 * 60 * 60 * 1000;

export type JerseyItem = {
  style: string;
  size: string;
};

export type JerseyPrint = {
  name: string;
  number: string;
};

export type SocksItem = {color: string; quantity: number};
export type JerseySelection = {
  jerseys: (JerseyItem & {print: JerseyPrint; shortsSize: string})[];
  socks: SocksItem[];
};

export function personalizationWindow(
  startsAt: string | undefined,
  now: number,
) {
  // Require a timezone so server and browser agree on the exact cutoff.
  const start =
    startsAt && /T.+(?:Z|[+-]\d{2}:\d{2})$/.test(startsAt)
      ? Date.parse(startsAt)
      : NaN;
  const end = start + PERSONALIZATION_DURATION;
  const status = !Number.isFinite(start)
    ? 'unconfigured'
    : now < start
      ? 'upcoming'
      : now < end
        ? 'open'
        : 'closed';
  return {
    status,
    endsAt: Number.isFinite(end) ? new Date(end).toISOString() : null,
  };
}

export function readJerseySelection(form: FormData): JerseySelection {
  const text = (key: string) => String(form.get(key) ?? '').trim();
  const socksColor = form.has('socksColor') ? text('socksColor') : 'None';
  const print = jerseyPrint(text('name'), text('number'));
  const shortsSize = (key: string) =>
    form.get('addShorts') === 'on'
      ? text(form.has(key) ? key : 'shortsSize')
      : 'None';
  // Normalize forms from already-open tabs into quantities of single pairs.
  const socks =
    form.has('socksBlack') || form.has('socksWhite')
      ? PED_SOCKS_COLORS.map((color) => ({
          color,
          quantity: Number(text(`socks${color}`)),
        })).filter(({quantity}) => quantity !== 0)
      : socksColor === 'None'
        ? []
        : [
            {
              color: socksColor,
              quantity:
                text('socksPack') === '1 pair'
                  ? 1
                  : text('socksPack') === '3 pairs'
                    ? 3
                    : NaN,
            },
          ];
  // Tabs opened before per-jersey printing still submit one print for both.
  const secondPrint =
    form.has('secondName') || form.has('secondNumber')
      ? jerseyPrint(text('secondName'), text('secondNumber'))
      : print;
  return {
    jerseys: [
      {
        style: text('firstStyle'),
        size: text('firstSize'),
        print,
        shortsSize: shortsSize('firstShortsSize'),
      },
      ...(form.has('secondStyle')
        ? [
            {
              style: text('secondStyle'),
              size: text('secondSize'),
              print: secondPrint,
              shortsSize: shortsSize('secondShortsSize'),
            },
          ]
        : []),
    ],
    socks,
  };
}

export function jerseyPrint(name: string, number: string): JerseyPrint {
  return {
    name: name.trim().normalize('NFC').toUpperCase(),
    number: number.trim(),
  };
}

export function validateJerseySelection(
  selection: JerseySelection,
  canPersonalize: boolean,
) {
  const {jerseys, socks} = selection;
  if (
    jerseys.some(
      ({style}) => !JERSEY_STYLES.some(({value}) => value === style),
    ) ||
    !JERSEY_STYLE_OPTIONS.includes(
      jerseyStyleValue(jerseys.map(({style}) => style)),
    )
  ) {
    return 'Choose one jersey or the Home + Away set.';
  }
  const missingSize = jerseys.findIndex(
    ({size}) => !JERSEY_SIZES.some((value) => value === size),
  );
  if (missingSize !== -1) {
    const jersey = JERSEY_STYLES.find(
      ({value}) => value === jerseys[missingSize].style,
    )!;
    return `Choose a size for your ${jersey.color === JERSEY_COLORS[0] ? 'home' : 'away'} jersey.`;
  }
  const missingShorts = jerseys.find(
    ({shortsSize}) =>
      !JERSEY_SHORTS_OPTIONS.some((value) => value === shortsSize),
  );
  if (missingShorts) {
    return `Choose a shorts size for ${missingShorts.style.startsWith('Home') ? 'Home' : 'Away'}, or remove the shorts.`;
  }
  if (
    jerseys.some(({shortsSize}) => shortsSize === 'None') &&
    jerseys.some(({shortsSize}) => shortsSize !== 'None')
  )
    return 'Add matching shorts for each jersey, or remove the shorts.';
  if (
    socks.length > 2 ||
    new Set(socks.map(({color}) => color)).size !== socks.length ||
    socks.some(({color}) => !PED_SOCKS_COLORS.some((value) => value === color))
  )
    return 'Choose black or white PED socks.';
  if (
    socks.some(
      ({quantity}) =>
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_SOCKS_QUANTITY,
    )
  )
    return `Choose between 0 and ${MAX_SOCKS_QUANTITY} pairs of each sock color.`;
  for (const {
    style,
    print: {name, number},
  } of jerseys) {
    if (!name && !number) continue;
    if (!canPersonalize)
      return 'The personalization window has closed. Choose a jersey without personalization.';
    const side = style.startsWith('Home') ? 'Home' : 'Away';
    if (!name || !number)
      return `${side} jersey: add both a name and number, or leave both blank for a plain back.`;
    if (
      !/\p{L}/u.test(name) ||
      [...name].length > NAME_LIMIT ||
      !/^[\p{L}\p{M} .’'-]+$/u.test(name)
    ) {
      return `${side} jersey: enter a name with up to ${NAME_LIMIT} letters, spaces, apostrophes, periods, or hyphens.`;
    }
    if (!/^\d{1,2}$/.test(number))
      return `${side} jersey: enter a number from 0 to 99.`;
  }
  return null;
}

export function jerseyAttributes(print: JerseyPrint) {
  return [
    {key: 'Order type', value: 'Preorder'},
    ...(print.name || print.number
      ? [
          {key: 'Name on back', value: print.name},
          {key: 'Number on back', value: print.number},
        ]
      : []),
  ];
}

export function matchesJerseyVariant(
  options: {name: string; value: string}[],
  jersey: JerseyItem,
) {
  const selectedOptions = jerseyOptionValues(jersey);
  return (
    options.length === 2 &&
    options.every(
      ({name, value}) =>
        value === selectedOptions[name as keyof typeof selectedOptions],
    )
  );
}

export function jerseyOptionValues(jersey: JerseyItem) {
  return {
    Style: jersey.style,
    Size: jersey.size,
  };
}

export function matchesShortsVariant(
  options: {name: string; value: string}[],
  jersey: JerseyItem,
  size: string,
) {
  const color = JERSEY_STYLES.find(({value}) => value === jersey.style)?.color;
  const expected = {
    Color: color === JERSEY_COLORS[0] ? 'Home (Cream)' : 'Away (Black)',
    Size: size,
  };
  return (
    Boolean(color) &&
    options.length === 2 &&
    options.every(
      ({name, value}) => value === expected[name as keyof typeof expected],
    )
  );
}

export function matchesSocksVariant(
  options: {name: string; value: string}[],
  color: string,
) {
  const expected = {Color: color, Pack: '1 pair'};
  return (
    options.length === 2 &&
    options.every(
      ({name, value}) => value === expected[name as keyof typeof expected],
    )
  );
}

type PurchasableVariant = {
  id: string;
  availableForSale: boolean;
  selectedOptions: {name: string; value: string}[];
};

export function jerseyCartLines(
  selection: JerseySelection,
  variants: PurchasableVariant[],
  socks: PurchasableVariant[],
  shorts: PurchasableVariant[] = [],
) {
  const jerseys = selection.jerseys.map((jersey) =>
    variants.find((item) => matchesJerseyVariant(item.selectedOptions, jersey)),
  );
  if (!jerseys.length || jerseys.some((jersey) => !jersey?.availableForSale))
    return {
      error:
        'This jersey selection is unavailable. Try another size or jersey.',
      lines: [],
    };
  const matchingShorts = selection.jerseys.map((jersey) =>
    jersey.shortsSize === 'None'
      ? null
      : shorts.find((item) =>
          matchesShortsVariant(item.selectedOptions, jersey, jersey.shortsSize),
        ),
  );
  if (
    matchingShorts.some(
      (item, index) =>
        selection.jerseys[index].shortsSize !== 'None' &&
        !item?.availableForSale,
    )
  )
    return {
      error:
        'These matching shorts are unavailable. Choose another size or remove the shorts.',
      lines: [],
    };
  const selectedSocks = selection.socks.map(({color, quantity}) => ({
    variant: socks.find((item) =>
      matchesSocksVariant(item.selectedOptions, color),
    ),
    quantity,
  }));
  if (selectedSocks.some(({variant}) => !variant?.availableForSale))
    return {
      error:
        'These PED socks are not available. Choose another color or remove the socks.',
      lines: [],
    };
  return {
    error: null,
    lines: [
      ...jerseys.flatMap((jersey, index) => [
        {
          merchandiseId: jersey!.id,
          quantity: 1,
          attributes: jerseyAttributes(selection.jerseys[index].print),
        },
        ...(matchingShorts[index]
          ? [
              {
                merchandiseId: matchingShorts[index]!.id,
                quantity: 1,
                parent: {merchandiseId: jersey!.id},
                attributes: [{key: 'Order type', value: 'Preorder'}],
              },
            ]
          : []),
      ]),
      ...selectedSocks.map(({variant, quantity}) => ({
        merchandiseId: variant!.id,
        quantity,
      })),
    ],
  };
}

export function jerseyCartError(result: {
  cart?: unknown;
  errors?: {message: string}[];
  warnings?: {code: string; message: string}[];
}) {
  // A shared discount link can include a code for a different jersey variant.
  // Shopify still adds the selected items when that unused code cannot apply.
  const warnings = (result.warnings ?? []).filter(
    ({code}) => code !== 'DISCOUNT_NO_ENTITLED_LINE_ITEMS',
  );
  if (result.cart && !result.errors?.length && !warnings.length) return null;
  const messages = [...(result.errors ?? []), ...warnings].map(
    ({message}) => message,
  );
  return (
    messages.join(' ') || 'Your jersey could not be added. Please try again.'
  );
}

export function jerseyStyleValue(styles: readonly string[]) {
  return [...styles].sort(compareJerseyStyles).join(' + ');
}

function compareJerseyStyles(a: string, b: string) {
  return (
    JERSEY_STYLES.findIndex(({value}) => value === a) -
    JERSEY_STYLES.findIndex(({value}) => value === b)
  );
}

export function jerseyStyles(style: string) {
  return JERSEY_STYLES.filter(({value}) => style.split(' + ').includes(value));
}

export function jerseyPreviewPrice(style: string, shorts: boolean) {
  if (!JERSEY_STYLE_OPTIONS.includes(style)) return null;
  const styles = jerseyStyles(style);
  const amount =
    styles.reduce((sum, item) => sum + Number(item.amount), 0) -
    (styles.length === 2 ? JERSEY_BUNDLE_SAVING : 0) +
    (shorts ? styles.length * JERSEY_SHORTS_PRICE : 0);
  return {amount: amount.toFixed(2), currencyCode: 'USD' as const};
}

export type Price = {amount: string; currencyCode: CurrencyCode};
type PricedVariant = {
  selectedOptions: {name: string; value: string}[];
  price: Price;
};

export function jerseyQuote(
  selection: JerseySelection,
  variants: PricedVariant[],
  socksVariants: PricedVariant[],
  preview: boolean,
  shortsVariants: PricedVariant[] = [],
) {
  const jerseyPriceFor = (jersey: JerseySelection['jerseys'][number]) =>
    variants.find((item) => matchesJerseyVariant(item.selectedOptions, jersey))
      ?.price ?? (preview ? jerseyPreviewPrice(jersey.style, false) : null);
  const shortsValueFor = (
    jersey: JerseySelection['jerseys'][number],
  ): Price | null => {
    const shortsSize =
      jersey.shortsSize && jersey.shortsSize !== 'None'
        ? jersey.shortsSize
        : JERSEY_SIZES[0];
    return (
      shortsVariants.find((item) =>
        matchesShortsVariant(item.selectedOptions, jersey, shortsSize),
      )?.price ?? (preview ? JERSEY_SHORTS_VALUE : null)
    );
  };
  const shortsPriceFor = (jersey: JerseySelection['jerseys'][number]) => {
    const price = subtractPrices(shortsValueFor(jersey), {
      amount: String(JERSEY_SHORTS_SAVING),
      currencyCode: 'USD',
    });
    return price && Number(price.amount) >= 0 ? price : null;
  };
  const priceFor = (
    jerseys: JerseySelection['jerseys'],
    withShorts: boolean,
  ): Price | null => {
    const style = jerseyStyleValue(jerseys.map(({style}) => style));
    if (!JERSEY_STYLE_OPTIONS.includes(style)) return null;
    const total = sumPrices(
      jerseys.flatMap((jersey) => {
        const jerseyPrice = jerseyPriceFor(jersey);
        if (!withShorts) return [jerseyPrice];
        return [jerseyPrice, shortsPriceFor(jersey)];
      }),
    );
    // Shopify's matching automatic discount owns the checkout saving.
    return jerseys.length === 2
      ? subtractPrices(total, {
          amount: String(JERSEY_BUNDLE_SAVING),
          currencyCode: 'USD',
        })
      : total;
  };
  const choices = JERSEY_STYLE_OPTIONS.map((style) => {
    const styles = jerseyStyles(style);
    const jerseys = styles.map(({value, color}, index) => {
      const current =
        selection.jerseys.find(
          (jersey) =>
            JERSEY_STYLES.find((item) => item.value === jersey.style)?.color ===
            color,
        ) ?? selection.jerseys[index];
      return {
        style: value,
        size: current?.size || JERSEY_SIZES[0],
        shortsSize: current?.shortsSize || '',
        print: current?.print ?? {name: '', number: ''},
      };
    });
    const price = priceFor(jerseys, false);
    const separate =
      styles.length === 2
        ? sumPrices(jerseys.map((jersey) => priceFor([jersey], false)))
        : null;
    return {
      style,
      price,
      kitPrice: priceFor(jerseys, true),
      savings: positivePrice(subtractPrices(separate, price)),
    };
  });
  const jerseys = selection.jerseys.map((jersey) => ({
    ...jersey,
    size: jersey.size || JERSEY_SIZES[0],
  }));
  const base = priceFor(jerseys, false);
  const kit = priceFor(jerseys, true);
  const shorts = subtractPrices(kit, base);
  const shortsValues = jerseys.map(shortsValueFor);
  const shortsValue = sumPrices(shortsValues);
  const withShorts = selection.jerseys.some(
    ({shortsSize}) => shortsSize !== 'None',
  );
  const jersey = withShorts ? kit : base;
  const socks = socksQuote(selection.socks, socksVariants, preview);
  const total = socks.quantity ? sumPrices([jersey, socks.total]) : jersey;
  const jerseyValues = jerseys.map(jerseyPriceFor);
  // The native Home + Away rule allocates its $20 to Away, regardless of pick order.
  const jerseyPrices = jerseyValues.map((price, index) =>
    jerseys.length === 2 && jerseys[index].style.startsWith(JERSEY_COLORS[1])
      ? subtractPrices(price, {
          amount: String(JERSEY_BUNDLE_SAVING),
          currencyCode: 'USD',
        })
      : price,
  );
  const original = sumPrices([
    ...jerseyValues,
    ...(withShorts ? shortsValues : []),
    ...(socks.quantity ? [socks.subtotal] : []),
  ]);
  return {
    choices,
    total,
    original,
    savings: positivePrice(subtractPrices(original, total)),
    jerseyValues,
    jerseyPrices,
    shorts,
    shortsValue,
    shortsValues,
    shortsPrices: jerseys.map(shortsPriceFor),
    shortsSavings: positivePrice(subtractPrices(shortsValue, shorts)),
    socks,
  };
}

export function socksQuote(
  socks: SocksItem[],
  variants: PricedVariant[],
  preview = false,
) {
  const prices = PED_SOCKS_COLORS.map((color) => ({
    color,
    price:
      variants.find((item) => matchesSocksVariant(item.selectedOptions, color))
        ?.price ?? (preview ? PED_SOCKS_PRICE : null),
  }));
  const quantity = socks.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = quantity
    ? sumPrices(
        socks.map((item) => {
          const price = prices.find(({color}) => color === item.color)?.price;
          return price
            ? {
                ...price,
                amount: (Number(price.amount) * item.quantity).toFixed(2),
              }
            : null;
        }),
      )
    : {amount: '0.00', currencyCode: 'USD' as const};
  // Native Buy 2 get 1: $5 off the third single pair, repeated per group.
  const savings = {
    amount: (Math.floor(quantity / 3) * PED_SOCKS_SAVING).toFixed(2),
    currencyCode: 'USD' as const,
  };
  const total = subtractPrices(subtotal, savings);
  const samePrice = prices.every(
    ({price}) =>
      price &&
      price.currencyCode === 'USD' &&
      price.amount === prices[0].price?.amount &&
      Number(price.amount) >= PED_SOCKS_SAVING,
  );
  const offer = samePrice
    ? {
        amount: (
          Number(prices[0].price!.amount) * 3 -
          PED_SOCKS_SAVING
        ).toFixed(2),
        currencyCode: 'USD' as const,
      }
    : null;
  const nextPair =
    samePrice && quantity % 3 === 2
      ? {
          amount: (Number(prices[0].price!.amount) - PED_SOCKS_SAVING).toFixed(
            2,
          ),
          currencyCode: 'USD' as const,
        }
      : null;
  return {
    prices,
    quantity,
    subtotal,
    total,
    savings: positivePrice(savings),
    offer,
    nextPair,
  };
}

function sumPrices(prices: (Price | null)[]): Price | null {
  const first = prices[0];
  if (
    !first ||
    prices.some((price) => !price || price.currencyCode !== first.currencyCode)
  )
    return null;
  const amounts = prices.map((price) =>
    Math.round(Number(price!.amount) * 100),
  );
  if (!amounts.every(Number.isFinite)) return null;
  return {
    ...first,
    amount: (amounts.reduce((sum, amount) => sum + amount, 0) / 100).toFixed(2),
  };
}

export function subtractPrices(a: Price | null, b: Price | null): Price | null {
  return a && b
    ? sumPrices([a, {...b, amount: String(-Number(b.amount))}])
    : null;
}

function positivePrice(price: Price | null) {
  return price && Number(price.amount) > 0 ? price : null;
}
