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

export type JerseyItem = {
  style: string;
  size: string;
};

export type JerseyPrint = {
  name: string;
  number: string;
};

export type JerseySelection = {
  jerseys: (JerseyItem & {print: JerseyPrint})[];
  shortsSize: string;
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
  const print = jerseyPrint(text('name'), text('number'));
  // Tabs opened before per-jersey printing still submit one print for both.
  const secondPrint =
    form.has('secondName') || form.has('secondNumber')
      ? jerseyPrint(text('secondName'), text('secondNumber'))
      : print;
  return {
    jerseys: [
      {style: text('firstStyle'), size: text('firstSize'), print},
      ...(form.has('secondStyle')
        ? [
            {
              style: text('secondStyle'),
              size: text('secondSize'),
              print: secondPrint,
            },
          ]
        : []),
    ],
    shortsSize: form.get('addShorts') === 'on' ? text('shortsSize') : 'None',
    socksColor,
    socksPack: socksColor === 'None' ? '1 pair' : text('socksPack'),
    socksSize: socksColor === 'None' ? '' : text('socksSize'),
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
  const {jerseys, shortsSize} = selection;
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
  const matchingShorts =
    selection.shortsSize === 'None'
      ? []
      : selection.jerseys.map((jersey) =>
          shorts.find((item) =>
            matchesShortsVariant(
              item.selectedOptions,
              jersey,
              selection.shortsSize,
            ),
          ),
        );
  if (matchingShorts.some((item) => !item?.availableForSale))
    return {
      error:
        'These matching shorts are unavailable. Choose another size or remove the shorts.',
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
      ...(sock ? [{merchandiseId: sock.id, quantity: 1}] : []),
    ],
  };
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
  selection: Pick<JerseySelection, 'jerseys' | 'shortsSize' | 'socksColor'>,
  variants: PricedVariant[],
  socksPrice: Price | null,
  preview: boolean,
  shortsVariants: PricedVariant[] = [],
) {
  const shortsSize =
    selection.shortsSize === 'None'
      ? JERSEY_SIZES[0]
      : selection.shortsSize || JERSEY_SIZES[0];
  const priceFor = (jerseys: JerseyItem[], shorts: string): Price | null => {
    const style = jerseyStyleValue(jerseys.map(({style}) => style));
    if (!JERSEY_STYLE_OPTIONS.includes(style)) return null;
    const total = sumPrices(
      jerseys.flatMap((jersey) => {
        const variant = variants.find((item) =>
          matchesJerseyVariant(item.selectedOptions, jersey),
        );
        const jerseyPrice =
          variant?.price ??
          (preview ? jerseyPreviewPrice(jersey.style, false) : null);
        if (shorts === 'None') return [jerseyPrice];
        const shortsPrice =
          shortsVariants.find((item) =>
            matchesShortsVariant(item.selectedOptions, jersey, shorts),
          )?.price ??
          (preview
            ? {
                amount: String(JERSEY_SHORTS_PRICE),
                currencyCode: 'USD' as const,
              }
            : null);
        return [jerseyPrice, shortsPrice];
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
    const jerseys = styles.map(({value}) => {
      const current = selection.jerseys.find(
        (jersey) => jersey.style === value,
      );
      const size = current
        ? current.size
        : selection.jerseys[styles.length === 1 ? 0 : 1]?.size;
      return {style: value, size: size || JERSEY_SIZES[0]};
    });
    const price = priceFor(jerseys, 'None');
    const separate =
      styles.length === 2
        ? sumPrices(jerseys.map((jersey) => priceFor([jersey], 'None')))
        : null;
    return {
      style,
      price,
      kitPrice: priceFor(jerseys, shortsSize),
      savings: positivePrice(subtractPrices(separate, price)),
    };
  });
  const jerseys = selection.jerseys.map((jersey) => ({
    ...jersey,
    size: jersey.size || JERSEY_SIZES[0],
  }));
  const base = priceFor(jerseys, 'None');
  const kit = priceFor(jerseys, shortsSize);
  const shorts = subtractPrices(kit, base);
  const shortsValue = {
    ...JERSEY_SHORTS_VALUE,
    amount: (Number(JERSEY_SHORTS_VALUE.amount) * jerseys.length).toFixed(2),
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
