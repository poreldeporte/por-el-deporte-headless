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
    JERSEY_STYLES.slice(index + 1).map((second) =>
      jerseyStyleValue([first.value, second.value]),
    ),
  ),
];
export const PED_SOCKS_HANDLE = 'ped-socks';
export const PED_SOCKS_COLORS = ['Black', 'White'] as const;
export const PED_SOCKS_PACKS = [
  {value: '1 pair', price: {amount: '10.00', currencyCode: 'USD'}},
  {value: '3 pairs', price: {amount: '25.00', currencyCode: 'USD'}},
] as const;
export const JERSEY_SHORTS_OPTIONS = ['None', ...JERSEY_SIZES] as const;
export const JERSEY_SHORTS_VALUE = {
  amount: '35.00',
  currencyCode: 'USD',
} as const;
export const JERSEY_BUNDLE_SAVING = 20;
export const JERSEY_SHORTS_PRICE = 15;
export const NAME_LIMIT = 14;
const PERSONALIZATION_DURATION = 7 * 24 * 60 * 60 * 1000;

export type JerseySelection = {
  style: string;
  size: string;
  shortsSize: string;
  personalize: boolean;
  name: string;
  number: string;
  socksColor: string;
  socksPack: string;
  socksSize: string;
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
  const name = text('name').normalize('NFC').toUpperCase();
  const number = text('number');
  return {
    style: text('style'),
    size: text('size'),
    shortsSize: form.get('addShorts') === 'on' ? text('shortsSize') : 'None',
    personalize: Boolean(name || number),
    name,
    number,
    socksColor,
    socksPack: socksColor === 'None' ? '1 pair' : text('socksPack'),
    socksSize: socksColor === 'None' ? '' : text('socksSize'),
  };
}

export function validateJerseySelection(
  selection: JerseySelection,
  canPersonalize: boolean,
) {
  const {style, size, shortsSize, personalize, name, number} = selection;
  if (
    !JERSEY_STYLE_OPTIONS.includes(style) ||
    !JERSEY_SIZES.some((value) => value === size)
  ) {
    return 'Choose your jersey styles and size.';
  }
  if (!JERSEY_SHORTS_OPTIONS.some((value) => value === shortsSize)) {
    return 'Choose a shorts size, or remove the shorts.';
  }
  if (
    selection.socksColor !== 'None' &&
    !PED_SOCKS_COLORS.some((value) => value === selection.socksColor)
  ) {
    return 'Choose black or white PED socks, or remove the socks.';
  }
  if (
    selection.socksColor !== 'None' &&
    !PED_SOCKS_PACKS.some(({value}) => value === selection.socksPack)
  )
    return 'Choose one pair or three pairs of PED socks.';
  if (!personalize) return null;
  if (!canPersonalize)
    return 'The personalization window has closed. Choose a jersey without personalization.';
  if (!name || !number)
    return 'Add both a name and number, or leave both blank for a plain back.';
  if (
    !/\p{L}/u.test(name) ||
    [...name].length > NAME_LIMIT ||
    !/^[\p{L}\p{M} .’'-]+$/u.test(name)
  ) {
    return `Enter a name with up to ${NAME_LIMIT} letters, spaces, apostrophes, periods, or hyphens.`;
  }
  if (!/^\d{1,2}$/.test(number)) return 'Enter a jersey number from 0 to 99.';
  return null;
}

export function jerseyAttributes(selection: JerseySelection) {
  return [
    {key: 'Order type', value: 'Preorder'},
    ...(jerseyStyles(selection.style).length === 2
      ? [
          {
            key: 'Includes',
            value: `${selection.style}${selection.shortsSize === 'None' ? '' : ' + 2 pairs of matching shorts'}`,
          },
        ]
      : []),
    ...(selection.personalize
      ? [
          {key: 'Name on back', value: selection.name},
          {key: 'Number on back', value: selection.number},
        ]
      : []),
  ];
}

export function matchesJerseyVariant(
  options: {name: string; value: string}[],
  selection: Pick<JerseySelection, 'style' | 'size' | 'shortsSize'>,
) {
  const selectedOptions = {
    Style: selection.style,
    Size: selection.size,
    'Shorts size': selection.shortsSize,
  };
  return (
    options.length === 3 &&
    options.every(
      ({name, value}) =>
        value === selectedOptions[name as keyof typeof selectedOptions],
    )
  );
}

export function matchesSocksVariant(
  options: {name: string; value: string}[],
  selection: Pick<JerseySelection, 'socksColor' | 'socksPack' | 'socksSize'>,
) {
  const expected = {
    Color: selection.socksColor,
    Pack: selection.socksPack,
    ...(selection.socksSize ? {Size: selection.socksSize} : {}),
  };
  return (
    options.length === Object.keys(expected).length &&
    options.every(
      ({name, value}) => value === expected[name as keyof typeof expected],
    )
  );
}

export function jerseyCartLines(
  selection: JerseySelection,
  variants: {
    id: string;
    availableForSale: boolean;
    selectedOptions: {name: string; value: string}[];
  }[],
  socks: {
    id: string;
    availableForSale: boolean;
    selectedOptions: {name: string; value: string}[];
  }[],
) {
  const jersey = variants.find((item) =>
    matchesJerseyVariant(item.selectedOptions, selection),
  );
  if (!jersey?.availableForSale)
    return {
      error: 'This combination is unavailable. Please choose another.',
      lines: [],
    };
  const sock =
    selection.socksColor === 'None'
      ? null
      : socks.find((item) =>
          matchesSocksVariant(item.selectedOptions, selection),
        );
  if (selection.socksColor !== 'None' && !sock?.availableForSale)
    return {
      error:
        'These PED socks are not available. Choose another option or remove the socks.',
      lines: [],
    };
  return {
    error: null,
    lines: [
      {
        merchandiseId: jersey.id,
        quantity: 1,
        attributes: jerseyAttributes(selection),
      },
      ...(sock ? [{merchandiseId: sock.id, quantity: 1}] : []),
    ],
  };
}

export function jerseyStyleValue(styles: readonly string[]) {
  return [...styles]
    .sort(
      (a, b) =>
        JERSEY_STYLES.findIndex(({value}) => value === a) -
        JERSEY_STYLES.findIndex(({value}) => value === b),
    )
    .join(' + ');
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
  selection: Pick<
    JerseySelection,
    'style' | 'size' | 'shortsSize' | 'socksColor'
  >,
  variants: PricedVariant[],
  socksPrice: Price | null,
  preview: boolean,
) {
  const size = selection.size || JERSEY_SIZES[0];
  const shortsSize =
    selection.shortsSize === 'None'
      ? JERSEY_SIZES[0]
      : selection.shortsSize || JERSEY_SIZES[0];
  const priceFor = (style: string, shorts: string): Price | null => {
    const variant = variants.find((item) =>
      matchesJerseyVariant(item.selectedOptions, {
        style,
        size,
        shortsSize: shorts,
      }),
    );
    return (
      variant?.price ??
      (preview ? jerseyPreviewPrice(style, shorts !== 'None') : null)
    );
  };
  const choices = JERSEY_STYLE_OPTIONS.map((style) => {
    const price = priceFor(style, 'None');
    const styles = jerseyStyles(style);
    const separate =
      styles.length === 2
        ? sumPrices(styles.map(({value}) => priceFor(value, 'None')))
        : null;
    return {
      style,
      price,
      kitPrice: priceFor(style, shortsSize),
      savings: positivePrice(subtractPrices(separate, price)),
    };
  });
  const base = priceFor(selection.style, 'None');
  const kit = priceFor(selection.style, shortsSize);
  const shorts = subtractPrices(kit, base);
  const shortsValue = {
    ...JERSEY_SHORTS_VALUE,
    amount: (
      Number(JERSEY_SHORTS_VALUE.amount) * jerseyStyles(selection.style).length
    ).toFixed(2),
  };
  const jersey = selection.shortsSize === 'None' ? base : kit;
  return {
    choices,
    total:
      selection.socksColor === 'None'
        ? jersey
        : sumPrices([jersey, socksPrice]),
    shorts,
    shortsValue,
    shortsSavings: positivePrice(subtractPrices(shortsValue, shorts)),
  };
}

export function socksPackSavings(single: Price | null, pack: Price | null) {
  const separate = single
    ? {...single, amount: (Number(single.amount) * 3).toFixed(2)}
    : null;
  return positivePrice(subtractPrices(separate, pack));
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
