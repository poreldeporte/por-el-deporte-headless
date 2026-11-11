import assert from 'node:assert/strict';
import {test} from 'node:test';
import {loadJerseyVariants} from '../app/lib/jersey-catalog.ts';
import {
  jerseyAttributes,
  jerseyCartLines,
  JERSEY_STYLE_OPTIONS,
  JERSEY_SIZES,
  JERSEY_SHORTS_OPTIONS,
  jerseyStyleValue,
  jerseyStyles,
  jerseyOptionValues,
  jerseyPreviewPrice,
  jerseyQuote,
  subtractPrices,
  socksQuote,
  MAX_SOCKS_QUANTITY,
  matchesSocksVariant,
  matchesJerseyVariant,
  personalizationWindow,
  readJerseySelection,
  validateJerseySelection,
} from '../app/lib/jersey.ts';

const startsAt = '2026-11-20T12:00:00-05:00';
const start = Date.parse(startsAt);
const end = start + 7 * 24 * 60 * 60 * 1000;
const homeShort = 'Home (Orange) / Short sleeve';
const homeLong = 'Home (Orange) / Long sleeve';
const awayShort = 'Away (Black) / Short sleeve';
const awayLong = 'Away (Black) / Long sleeve';
const bundleStyle = jerseyStyleValue([homeShort, awayLong]);
const print = {name: 'VIOLA', number: '07'};
const plainPrint = {name: '', number: ''};
const selection = {
  jerseys: [{style: homeShort, size: 'XL', print, shortsSize: 'M'}],
  socks: [],
};

const shorts = ['Home (Cream)', 'Away (Black)'].flatMap((color) =>
  JERSEY_SIZES.map((size) => ({
    id: `${color}-${size}`,
    availableForSale: true,
    selectedOptions: [
      {name: 'Color', value: color},
      {name: 'Size', value: size},
    ],
  })),
);

test('personalization opens at launch and closes exactly seven days later', () => {
  assert.equal(personalizationWindow(startsAt, start - 1).status, 'upcoming');
  assert.equal(personalizationWindow(startsAt, start).status, 'open');
  assert.equal(personalizationWindow(startsAt, end - 1).status, 'open');
  assert.equal(personalizationWindow(startsAt, end).status, 'closed');
  assert.equal(
    personalizationWindow(startsAt, end).endsAt,
    '2026-11-27T17:00:00.000Z',
  );
  for (const value of [undefined, '', 'invalid', '2026-11-20T12:00:00']) {
    assert.equal(personalizationWindow(value, start).status, 'unconfigured');
  }
});

test('a mixed sleeve bundle adds each jersey and matching shorts as separate linked lines', () => {
  const chosen = {
    ...selection,
    jerseys: [
      {style: homeShort, size: 'XL', print, shortsSize: 'M'},
      {style: awayLong, size: 'M', print, shortsSize: 'M'},
    ],
  };
  const variants = chosen.jerseys.map((jersey, index) => ({
    id: `jersey-${index}`,
    availableForSale: true,
    selectedOptions: [
      {name: 'Style', value: jersey.style},
      {name: 'Size', value: jersey.size},
    ],
  }));
  assert.equal(validateJerseySelection(chosen, true), null);
  const order = jerseyCartLines(chosen, variants, [], shorts);
  assert.equal(order.error, null);
  assert.deepEqual(
    order.lines,
    variants.flatMap(({id}, index) => [
      {
        merchandiseId: id,
        quantity: 1,
        attributes: [
          {key: 'Order type', value: 'Preorder'},
          {key: 'Name on back', value: 'VIOLA'},
          {key: 'Number on back', value: '07'},
        ],
      },
      {
        merchandiseId: shorts[index * 4].id,
        quantity: 1,
        parent: {merchandiseId: id},
        attributes: [{key: 'Order type', value: 'Preorder'}],
      },
    ]),
  );
  for (const stock of [
    variants.slice(1),
    [variants[0], {...variants[1], availableForSale: false}],
  ]) {
    const result = jerseyCartLines(chosen, stock, []);
    assert.match(result.error, /unavailable/);
    assert.deepEqual(result.lines, []);
  }
});

test('unavailable matching shorts reject the whole kit before any cart write', () => {
  const jersey = {
    id: 'jersey',
    availableForSale: true,
    selectedOptions: [
      {name: 'Style', value: homeShort},
      {name: 'Size', value: 'XL'},
    ],
  };
  for (const stock of [
    [],
    shorts.filter((item) => item.id !== 'Home (Cream)-M'),
    shorts.map((item) => ({...item, availableForSale: false})),
  ]) {
    const result = jerseyCartLines(selection, [jersey], [], stock);
    assert.match(result.error, /shorts are unavailable/);
    assert.deepEqual(result.lines, []);
  }
});

const socks = ['Black', 'White'].map((color) => ({
  id: `${color}-single`,
  availableForSale: true,
  selectedOptions: [
    {name: 'Color', value: color},
    {name: 'Pack', value: '1 pair'},
  ],
  price: {amount: '10.00', currencyCode: 'USD'},
}));

test('mixed socks add exact single-pair variants with a quantity per color', () => {
  const chosen = {
    ...selection,
    socks: [
      {color: 'Black', quantity: 2},
      {color: 'White', quantity: 1},
    ],
  };
  const jerseys = chosen.jerseys.map((jersey) => ({
    id: 'jersey',
    availableForSale: true,
    selectedOptions: Object.entries(jerseyOptionValues(jersey)).map(
      ([name, value]) => ({name, value}),
    ),
  }));
  assert.equal(validateJerseySelection(chosen, true), null);
  assert.deepEqual(
    jerseyCartLines(chosen, jerseys, socks, shorts).lines.slice(-2),
    [
      {merchandiseId: 'Black-single', quantity: 2},
      {merchandiseId: 'White-single', quantity: 1},
    ],
  );
  assert.equal(matchesSocksVariant(socks[0].selectedOptions, 'Black'), true);
  assert.equal(matchesSocksVariant(socks[0].selectedOptions, 'White'), false);
  assert.equal(
    matchesSocksVariant(
      [
        {name: 'Color', value: 'Black'},
        {name: 'Pack', value: '3 pairs'},
      ],
      'Black',
    ),
    false,
  );
  for (const stock of [
    [],
    socks.slice(0, 1),
    socks.map((item) => ({...item, availableForSale: false})),
  ]) {
    const result = jerseyCartLines(chosen, jerseys, stock, shorts);
    assert.match(result.error, /socks are not available/);
    assert.deepEqual(result.lines, []);
  }
});

test('sock quantities parse independently and reject invalid, duplicate or unbounded selections', () => {
  const form = formFor(selection);
  form.set('socksBlack', '2');
  form.set('socksWhite', '1');
  assert.deepEqual(readJerseySelection(form).socks, [
    {color: 'Black', quantity: 2},
    {color: 'White', quantity: 1},
  ]);
  form.set('socksBlack', '0');
  form.set('socksWhite', '0');
  assert.deepEqual(readJerseySelection(form).socks, []);
  for (const quantity of [-1, 0.5, Infinity, NaN, MAX_SOCKS_QUANTITY + 1]) {
    form.set('socksBlack', String(quantity));
    assert.match(
      validateJerseySelection(readJerseySelection(form), true),
      /pairs of each sock color/,
    );
  }
  assert.match(
    validateJerseySelection(
      {...selection, socks: [{color: 'Blue', quantity: 1}]},
      true,
    ),
    /black or white/,
  );
  assert.match(
    validateJerseySelection(
      {
        ...selection,
        socks: [
          {color: 'Black', quantity: 1},
          {color: 'Black', quantity: 2},
        ],
      },
      true,
    ),
    /black or white/,
  );
  assert.equal(
    validateJerseySelection(
      {...selection, socks: [{color: 'White', quantity: MAX_SOCKS_QUANTITY}]},
      true,
    ),
    null,
  );
});

test('expired submissions reject custom printing while plain preorders remain valid', () => {
  assert.equal(validateJerseySelection(selection, true), null);
  assert.match(validateJerseySelection(selection, false), /closed/);
  assert.equal(
    validateJerseySelection(
      {...selection, jerseys: [{...selection.jerseys[0], print: plainPrint}]},
      false,
    ),
    null,
  );
  assert.deepEqual(jerseyAttributes(plainPrint), [
    {key: 'Order type', value: 'Preorder'},
  ]);
});

test('server normalizes printed names and preserves leading-zero numbers as line properties', () => {
  const form = formFor(selection);
  form.set('name', '  Jose\u0301  ');
  form.set('addShorts', 'on');
  const parsed = readJerseySelection(form);
  assert.equal(parsed.jerseys[0].print.name, 'JOSÉ');
  assert.equal(validateJerseySelection(parsed, true), null);
  assert.deepEqual(jerseyAttributes(parsed.jerseys[0].print), [
    {key: 'Order type', value: 'Preorder'},
    {key: 'Name on back', value: 'JOSÉ'},
    {key: 'Number on back', value: '07'},
  ]);
});

test('blank print fields order a plain jersey; partial fields and expired personalization are rejected', () => {
  const form = formFor(selection);
  form.set('name', ' ');
  form.set('number', '');
  form.set('addShorts', 'on');
  const plain = readJerseySelection(form);
  assert.deepEqual(plain.jerseys[0].print, plainPrint);
  assert.equal(validateJerseySelection(plain, false), null);
  assert.deepEqual(jerseyAttributes(plain.jerseys[0].print), [
    {key: 'Order type', value: 'Preorder'},
  ]);
  form.set('name', 'VIOLA');
  form.set('personalize', 'off');
  assert.equal(readJerseySelection(form).jerseys[0].print.name, 'VIOLA');
  assert.match(
    validateJerseySelection(readJerseySelection(form), true),
    /both a name and number/,
  );
  form.set('name', '');
  form.set('number', '07');
  assert.match(
    validateJerseySelection(readJerseySelection(form), true),
    /both a name and number/,
  );
  form.set('name', 'VIOLA');
  assert.equal(validateJerseySelection(readJerseySelection(form), true), null);
  assert.match(
    validateJerseySelection(readJerseySelection(form), false),
    /closed/,
  );
});

test('invalid options and print data are rejected before a cart write', () => {
  for (const patch of [
    {jerseys: []},
    {jerseys: [{style: homeShort, size: '', print}]},
    {jerseys: [{style: homeShort, size: 'S', print}]},
    {jerseys: [{style: 'Blue', size: 'M', print, shortsSize: 'M'}]},
    {
      jerseys: [
        {style: homeShort, size: 'M', print, shortsSize: 'M'},
        {style: homeShort, size: 'XL', print, shortsSize: 'M'},
      ],
    },
    {
      jerseys: [
        {style: homeShort, size: 'M', print, shortsSize: 'M'},
        {style: homeLong, size: 'XL', print, shortsSize: 'M'},
      ],
    },
    {
      jerseys: [
        {style: awayShort, size: 'M', print, shortsSize: 'M'},
        {style: awayLong, size: 'XL', print, shortsSize: 'M'},
      ],
    },
    {
      jerseys: [
        {style: homeShort, size: 'M', print, shortsSize: 'M'},
        {style: awayLong, size: '', print},
      ],
    },
    {
      jerseys: [homeShort, homeLong, awayLong].map((style) => ({
        style,
        size: 'M',
      })),
    },
    {jerseys: [{...selection.jerseys[0], shortsSize: ''}]},
    {jerseys: [{...selection.jerseys[0], shortsSize: 'S'}]},
  ])
    assert.equal(
      typeof validateJerseySelection({...selection, ...patch}, true),
      'string',
    );
  for (const patch of [
    {name: ''},
    {name: '---'},
    {name: '<script>'},
    {name: 'A'.repeat(15)},
    {number: ''},
    {number: '-1'},
    {number: '100'},
    {number: '1.5'},
  ])
    assert.equal(
      typeof validateJerseySelection(
        {
          ...selection,
          jerseys: [{...selection.jerseys[0], print: {...print, ...patch}}],
        },
        true,
      ),
      'string',
    );
});

test('variant matching resolves style and size regardless of option order', () => {
  const options = [
    {name: 'Size', value: 'XL'},
    {name: 'Style', value: homeShort},
  ];
  assert.equal(matchesJerseyVariant(options, selection.jerseys[0]), true);
  assert.equal(
    matchesJerseyVariant(options, {
      style: awayShort,
      size: 'XL',
      print,
      shortsSize: 'M',
    }),
    false,
  );
  assert.equal(
    matchesJerseyVariant(options.slice(1), selection.jerseys[0]),
    false,
  );
});

test('shorts sizes are independent per jersey and required only after adding matching shorts', () => {
  const chosen = {
    ...selection,
    jerseys: [
      selection.jerseys[0],
      {style: awayLong, size: 'XXL', print, shortsSize: 'L'},
    ],
  };
  assert.equal(validateJerseySelection(chosen, true), null);
  const form = formFor(chosen);
  assert.deepEqual(
    readJerseySelection(form).jerseys.map(({shortsSize}) => shortsSize),
    ['M', 'L'],
  );
  form.delete('secondShortsSize');
  assert.match(
    validateJerseySelection(readJerseySelection(form), true),
    /shorts size for Away/,
  );
  form.delete('addShorts');
  assert.deepEqual(
    readJerseySelection(form).jerseys.map(({shortsSize}) => shortsSize),
    ['None', 'None'],
  );
  assert.equal(validateJerseySelection(readJerseySelection(form), true), null);
  assert.match(
    validateJerseySelection(
      {
        ...chosen,
        jerseys: [
          chosen.jerseys[0],
          {...chosen.jerseys[1], shortsSize: 'None'},
        ],
      },
      true,
    ),
    /each jersey/,
  );
});

test('16 jerseys and 8 shorts fulfill all 1168 combinations with independent jersey and shorts sizes', () => {
  const variants = [homeShort, homeLong, awayShort, awayLong].flatMap((style) =>
    JERSEY_SIZES.map((size) => ({
      id: `${style}-${size}`,
      availableForSale: true,
      selectedOptions: [
        {name: 'Style', value: style},
        {name: 'Size', value: size},
      ],
    })),
  );
  assert.equal(variants.length, 16);
  let count = 0;
  for (const style of JERSEY_STYLE_OPTIONS) {
    const styles = jerseyStyles(style);
    for (const firstSize of JERSEY_SIZES) {
      for (const secondSize of styles.length === 2 ? JERSEY_SIZES : ['']) {
        for (const firstShorts of JERSEY_SHORTS_OPTIONS) {
          for (const secondShorts of styles.length === 2 &&
          firstShorts !== 'None'
            ? JERSEY_SIZES
            : [firstShorts]) {
            const jerseys = styles.map((item, index) => ({
              style: item.value,
              size: index === 0 ? firstSize : secondSize,
              print,
              shortsSize: index === 0 ? firstShorts : secondShorts,
            }));
            for (const ordered of [jerseys, [...jerseys].reverse()]) {
              const chosen = {...selection, jerseys: ordered};
              assert.equal(validateJerseySelection(chosen, true), null);
              const result = jerseyCartLines(chosen, variants, [], shorts);
              assert.equal(result.error, null);
              assert.deepEqual(
                result.lines.map(({merchandiseId}) => merchandiseId),
                ordered.flatMap(({style, size, shortsSize}) => [
                  `${style}-${size}`,
                  ...(shortsSize === 'None'
                    ? []
                    : [
                        `${style.startsWith('Home') ? 'Home (Cream)' : 'Away (Black)'}-${shortsSize}`,
                      ]),
                ]),
              );
            }
            count++;
          }
        }
      }
    }
  }
  assert.equal(count, 1168);
});

test('single jerseys and Home + Away sets have the correct sleeve, bundle and shorts prices', () => {
  const expected = [
    [[homeShort], '70.00', '85.00'],
    [[homeLong], '80.00', '95.00'],
    [[awayShort], '70.00', '85.00'],
    [[awayLong], '80.00', '95.00'],
    [[homeShort, awayShort], '120.00', '150.00'],
    [[homeShort, awayLong], '130.00', '160.00'],
    [[homeLong, awayShort], '130.00', '160.00'],
    [[homeLong, awayLong], '140.00', '170.00'],
  ];
  for (const [styles, plain, kit] of expected) {
    const style = jerseyStyleValue(styles);
    assert.equal(jerseyStyleValue([...styles].reverse()), style);
    assert.equal(jerseyPreviewPrice(style, false).amount, plain);
    assert.equal(jerseyPreviewPrice(style, true).amount, kit);
    const quote = jerseyQuote(
      {
        ...selection,
        jerseys: styles.map((style) => ({
          style,
          size: 'XL',
          print,
          shortsSize: 'M',
        })),
      },
      [],
      [],
      true,
    );
    assert.equal(quote.total.amount, kit);
    assert.equal(
      quote.shortsSavings.amount,
      styles.length === 2 ? '40.00' : '20.00',
    );
    assert.equal(
      quote.choices.find((item) => item.style === style).savings?.amount,
      styles.length === 2 ? '20.00' : undefined,
    );
  }
  assert.equal(jerseyPreviewPrice(`${homeShort} + ${homeShort}`, true), null);
  assert.equal(jerseyPreviewPrice(`${homeShort} + ${homeLong}`, true), null);
  assert.equal(jerseyPreviewPrice(`${awayShort} + ${awayLong}`, true), null);
});

test('quotes sum actual separate prices and reject missing or mixed-currency extras', () => {
  const variants = [
    {
      selectedOptions: [
        {name: 'Style', value: homeLong},
        {name: 'Size', value: 'XL'},
      ],
      price: {amount: '83.00', currencyCode: 'USD'},
    },
  ];
  const pricedShorts = shorts.map((item) => ({
    ...item,
    price: {amount: '37.00', currencyCode: 'USD'},
  }));
  const chosen = {
    ...selection,
    jerseys: [{style: homeLong, size: 'XL', print, shortsSize: 'M'}],
  };
  const quote = jerseyQuote(chosen, variants, [], false, pricedShorts);
  assert.equal(quote.total.amount, '100.00');
  assert.equal(quote.shorts.amount, '17.00');
  assert.equal(quote.shortsSavings.amount, '20.00');
  assert.equal(quote.original.amount, '120.00');
  assert.equal(quote.savings.amount, '20.00');
  const withSocks = {...chosen, socks: [{color: 'Black', quantity: 1}]};
  assert.equal(
    jerseyQuote(withSocks, variants, socks, false, pricedShorts).total.amount,
    '110.00',
  );
  assert.equal(
    jerseyQuote(
      withSocks,
      variants,
      socks.map((item) => ({
        ...item,
        price: {amount: '12.50', currencyCode: 'USD'},
      })),
      false,
      pricedShorts,
    ).total.amount,
    '112.50',
  );
  assert.equal(
    jerseyQuote(withSocks, variants, [], false, pricedShorts).total,
    null,
  );
  assert.equal(
    jerseyQuote(
      withSocks,
      variants,
      socks.map((item) => ({
        ...item,
        price: {...item.price, currencyCode: 'EUR'},
      })),
      false,
      pricedShorts,
    ).total,
    null,
  );
  assert.equal(jerseyQuote(chosen, [], [], false, pricedShorts).total, null);
  assert.equal(jerseyQuote(chosen, variants, [], false, []).total, null);
  const euro = pricedShorts.map((item) => ({
    ...item,
    price: {...item.price, currencyCode: 'EUR'},
  }));
  assert.equal(jerseyQuote(chosen, variants, [], false, euro).total, null);
});

test('bundle quotes sum real single prices and require both USD components', () => {
  const chosen = {
    ...selection,
    jerseys: [
      {style: homeShort, size: 'XL', print, shortsSize: 'None'},
      {style: awayLong, size: 'M', print, shortsSize: 'None'},
    ],
  };
  const variants = chosen.jerseys.map((jersey, index) => ({
    selectedOptions: Object.entries(jerseyOptionValues(jersey)).map(
      ([name, value]) => ({name, value}),
    ),
    price: {amount: index === 0 ? '73.00' : '82.00', currencyCode: 'USD'},
  }));
  assert.equal(jerseyQuote(chosen, variants, [], false).total.amount, '135.00');
  assert.equal(jerseyQuote(chosen, variants.slice(1), [], false).total, null);
  assert.equal(
    jerseyQuote(
      chosen,
      variants.map((v) => ({...v, price: {...v.price, currencyCode: 'EUR'}})),
      [],
      false,
    ).total,
    null,
  );
  assert.equal(
    jerseyQuote(
      chosen,
      [
        variants[0],
        {...variants[1], price: {...variants[1].price, currencyCode: 'EUR'}},
      ],
      [],
      false,
    ).total,
    null,
  );
});

test('the second jersey quote includes its matching shorts when shorts are selected', () => {
  const quote = jerseyQuote(selection, [], [], true);
  const first = quote.choices.find((item) => item.style === homeShort);
  const mixed = quote.choices.find((item) => item.style === bundleStyle);
  assert.equal(subtractPrices(mixed.price, first.price).amount, '60.00');
  assert.equal(subtractPrices(mixed.kitPrice, first.kitPrice).amount, '75.00');
  assert.equal(
    Number(first.kitPrice.amount) +
      Number(subtractPrices(mixed.kitPrice, first.kitPrice).amount),
    160,
  );
});

test('any three single pairs save $5, repeating across colors and larger quantities', () => {
  for (const [black, white, expected, nextPair] of [
    [0, 0, '0.00', null],
    [1, 0, '10.00', null],
    [0, 1, '10.00', null],
    [1, 1, '20.00', '5.00'],
    [2, 1, '25.00', null],
    [1, 2, '25.00', null],
    [3, 0, '25.00', null],
    [0, 3, '25.00', null],
    [2, 2, '35.00', null],
    [3, 2, '45.00', '5.00'],
    [3, 3, '50.00', null],
    [2, 4, '50.00', null],
    [5, 2, '60.00', null],
    [8, 8, '135.00', null],
  ]) {
    const chosen = [
      {color: 'Black', quantity: black},
      {color: 'White', quantity: white},
    ].filter((item) => item.quantity);
    const quote = socksQuote(chosen, socks);
    assert.equal(quote.quantity, black + white);
    assert.equal(quote.total.amount, expected);
    assert.equal(quote.offer.amount, '25.00');
    assert.equal(quote.nextPair?.amount ?? null, nextPair);
  }
  assert.equal(socksQuote([{color: 'Black', quantity: 3}], []).total, null);
  assert.equal(socksQuote([], socks.slice(1)).offer, null);
  assert.equal(
    socksQuote(
      [],
      socks.map((item) => ({
        ...item,
        price: {...item.price, currencyCode: 'EUR'},
      })),
    ).offer,
    null,
  );
  assert.equal(
    socksQuote(
      [],
      [socks[0], {...socks[1], price: {amount: '12.00', currencyCode: 'USD'}}],
    ).offer,
    null,
  );
  assert.equal(
    socksQuote([{color: 'Black', quantity: 3}], [], true).total.amount,
    '25.00',
  );
});

test('mixed socks and both kits quote the exact combined discount and independent sizes', () => {
  const chosen = {
    jerseys: [
      {style: homeShort, size: 'XL', print, shortsSize: 'M'},
      {style: awayLong, size: 'M', print: plainPrint, shortsSize: 'XXL'},
    ],
    socks: [
      {color: 'Black', quantity: 2},
      {color: 'White', quantity: 1},
    ],
  };
  const quote = jerseyQuote(chosen, [], [], true);
  assert.equal(quote.total.amount, '185.00');
  assert.equal(quote.original.amount, '250.00');
  assert.equal(quote.savings.amount, '65.00');
  assert.deepEqual(
    quote.jerseyPrices.map((price) => price.amount),
    ['70.00', '60.00'],
  );
  assert.deepEqual(
    quote.jerseyValues.map((price) => price.amount),
    ['70.00', '80.00'],
  );
  const reversed = jerseyQuote(
    {...chosen, jerseys: [...chosen.jerseys].reverse()},
    [],
    [],
    true,
  );
  assert.deepEqual(
    reversed.jerseyPrices.map((price) => price.amount),
    ['60.00', '70.00'],
  );
  assert.equal(reversed.total.amount, '185.00');
  assert.equal(
    jerseyQuote({...chosen, jerseys: [chosen.jerseys[0]]}, [], [], true).total
      .amount,
    '110.00',
  );
  assert.equal(
    jerseyQuote(
      {
        ...chosen,
        jerseys: chosen.jerseys.map((item) => ({...item, shortsSize: 'None'})),
      },
      [],
      [],
      true,
    ).total.amount,
    '155.00',
  );
});

test('already-open forms normalize shared shorts and single-color packs without changing their order', () => {
  const form = formFor({
    jerseys: [
      selection.jerseys[0],
      {style: awayLong, size: 'L', print, shortsSize: 'M'},
    ],
    socks: [],
  });
  form.delete('firstShortsSize');
  form.delete('secondShortsSize');
  form.set('shortsSize', 'XL');
  form.delete('socksBlack');
  form.delete('socksWhite');
  form.set('socksColor', 'White');
  form.set('socksPack', '3 pairs');
  const parsed = readJerseySelection(form);
  assert.deepEqual(
    parsed.jerseys.map(({shortsSize}) => shortsSize),
    ['XL', 'XL'],
  );
  assert.deepEqual(parsed.socks, [{color: 'White', quantity: 3}]);
  assert.equal(validateJerseySelection(parsed, true), null);
  form.set('socksPack', '1 pair');
  assert.deepEqual(readJerseySelection(form).socks, [
    {color: 'White', quantity: 1},
  ]);
  form.set('socksPack', '2 pairs');
  assert.match(
    validateJerseySelection(readJerseySelection(form), true),
    /pairs of each sock color/,
  );
});

test('quotes keep each size attached to its style, including an unchosen first size', () => {
  const variants = [
    [homeShort, 'M', '70.00'],
    [homeShort, 'XL', '75.00'],
    [awayLong, 'XL', '85.00'],
  ].map(([style, size, amount]) => ({
    selectedOptions: [
      {name: 'Style', value: style},
      {name: 'Size', value: size},
    ],
    price: {amount, currencyCode: 'USD'},
  }));
  const chosen = {
    ...selection,
    jerseys: [
      {style: homeShort, size: '', print, shortsSize: 'None'},
      {style: awayLong, size: 'XL', print, shortsSize: 'None'},
    ],
  };
  const quote = jerseyQuote(chosen, variants, [], false);
  assert.equal(quote.total.amount, '135.00');
  assert.equal(
    quote.choices.find(({style}) => style === bundleStyle).price.amount,
    '135.00',
  );
  assert.equal(
    quote.choices.find(({style}) => style === bundleStyle).savings.amount,
    '20.00',
  );
  assert.equal(
    jerseyQuote(
      {...chosen, jerseys: [...chosen.jerseys].reverse()},
      variants,
      [],
      false,
    ).total.amount,
    '135.00',
  );
  assert.equal(
    jerseyQuote(
      {
        ...chosen,
        jerseys: chosen.jerseys.map((jersey) => ({...jersey, size: 'XL'})),
      },
      variants,
      [],
      false,
    ).total.amount,
    '140.00',
  );
});

test('catalog pagination remains bounded if the single-jersey catalog grows', async () => {
  const page = (start, count, endCursor, hasNextPage) => ({
    nodes: Array.from({length: count}, (_, index) => ({
      id: String(start + index),
    })),
    pageInfo: {endCursor, hasNextPage},
  });
  const first = page(0, 250, '250', true);
  const next = page(250, 150, '400', false);
  const cursors = [];
  const result = await loadJerseyVariants(first, async (cursor) => {
    cursors.push(cursor);
    return next;
  });
  assert.deepEqual(cursors, ['250']);
  assert.equal(result.nodes.length, 400);
  assert.equal(result.nodes.at(-1).id, '399');
  assert.equal(result.pageInfo.hasNextPage, false);
  assert.equal(first.nodes.length, 250);
  assert.deepEqual(
    await loadJerseyVariants(page(0, 1, null, false), async () =>
      assert.fail('No next page expected'),
    ),
    page(0, 1, null, false),
  );
});

test('incomplete, repeated and inconsistent catalog pages fail before SKU resolution', async () => {
  const first = {
    nodes: [{id: 'first'}],
    pageInfo: {endCursor: 'cursor', hasNextPage: true},
  };
  await assert.rejects(
    loadJerseyVariants(first, async () => null),
    /disappeared/,
  );
  await assert.rejects(
    loadJerseyVariants(first, async () => first),
    /completely/,
  );
  await assert.rejects(
    loadJerseyVariants({...first, pageInfo: {hasNextPage: true}}, async () =>
      assert.fail('Invalid cursor must not be fetched'),
    ),
    /completely/,
  );
  await assert.rejects(
    loadJerseyVariants(first, async () => ({
      ...first,
      pageInfo: {hasNextPage: false},
    })),
    /changed/,
  );
  let reads = 0;
  await assert.rejects(
    loadJerseyVariants(first, async () => ({
      nodes: [{id: String(++reads)}],
      pageInfo: {endCursor: String(reads), hasNextPage: true},
    })),
    /completely/,
  );
  assert.equal(reads, 1);
});

test('different sizes stay attached to their jersey through parsing, canonical options and cart fulfillment', () => {
  const chosen = {
    ...selection,
    jerseys: [
      {style: awayLong, size: 'M', print, shortsSize: 'M'},
      {style: homeShort, size: 'XXL', print, shortsSize: 'M'},
    ],
  };
  const form = formFor(chosen);
  form.set('addShorts', 'on');
  const parsed = readJerseySelection(form);
  assert.deepEqual(parsed, chosen);
  assert.deepEqual(
    parsed.jerseys.map((jersey) => jerseyOptionValues(jersey)),
    [
      {Style: awayLong, Size: 'M'},
      {Style: homeShort, Size: 'XXL'},
    ],
  );
  form.delete('secondSize');
  assert.match(
    validateJerseySelection(readJerseySelection(form), true),
    /home jersey/,
  );
  form.set('secondSize', 'XL');
  form.delete('firstSize');
  assert.match(
    validateJerseySelection(readJerseySelection(form), true),
    /away jersey/,
  );
});

test('each jersey keeps its own normalized print through cart fulfillment', () => {
  const chosen = {
    ...selection,
    jerseys: [
      {style: awayLong, size: 'M', print, shortsSize: 'M'},
      {
        style: homeShort,
        size: 'XXL',
        shortsSize: 'M',
        print: {name: '  Jose\u0301  ', number: '09'},
      },
    ],
  };
  const form = formFor(chosen);
  form.set('addShorts', 'on');
  const parsed = readJerseySelection(form);
  assert.equal(validateJerseySelection(parsed, true), null);
  assert.deepEqual(
    parsed.jerseys.map(({print}) => print),
    [print, {name: 'JOSÉ', number: '09'}],
  );
  const variants = parsed.jerseys.map((jersey) => ({
    id: jersey.style,
    availableForSale: true,
    selectedOptions: Object.entries(jerseyOptionValues(jersey)).map(
      ([name, value]) => ({name, value}),
    ),
  }));
  const order = jerseyCartLines(parsed, variants, [], shorts);
  assert.equal(order.error, null);
  assert.deepEqual(
    order.lines.map(({attributes}) => attributes),
    [
      [
        {key: 'Order type', value: 'Preorder'},
        {key: 'Name on back', value: 'VIOLA'},
        {key: 'Number on back', value: '07'},
      ],
      [{key: 'Order type', value: 'Preorder'}],
      [
        {key: 'Order type', value: 'Preorder'},
        {key: 'Name on back', value: 'JOSÉ'},
        {key: 'Number on back', value: '09'},
      ],
      [{key: 'Order type', value: 'Preorder'}],
    ],
  );
  form.set('name', '');
  form.set('number', '');
  assert.equal(validateJerseySelection(readJerseySelection(form), true), null);
  assert.match(
    validateJerseySelection(readJerseySelection(form), false),
    /closed/,
  );
  for (const [name, number] of [
    ['JOSÉ', ''],
    ['', '09'],
    ['<script>', '09'],
    ['JOSE', '100'],
  ]) {
    form.set('secondName', name);
    form.set('secondNumber', number);
    assert.match(
      validateJerseySelection(readJerseySelection(form), true),
      /Home jersey/,
    );
  }
  form.set('secondName', '');
  form.set('secondNumber', '');
  const plain = readJerseySelection(form);
  assert.equal(validateJerseySelection(plain, false), null);
  assert.ok(
    jerseyCartLines(plain, variants, [], shorts).lines.every(
      ({attributes}) => attributes.length === 1,
    ),
  );
});

test('open legacy forms keep the shared print, while explicit blank second fields mean a plain back', () => {
  const form = formFor({
    ...selection,
    jerseys: [
      selection.jerseys[0],
      {style: awayLong, size: 'M', print, shortsSize: 'M'},
    ],
  });
  form.delete('secondName');
  form.delete('secondNumber');
  assert.deepEqual(
    readJerseySelection(form).jerseys.map(({print}) => print),
    [print, print],
  );
  form.set('secondName', '');
  form.set('secondNumber', '');
  assert.deepEqual(
    readJerseySelection(form).jerseys.map(({print}) => print),
    [print, plainPrint],
  );
});

function formFor(value) {
  const form = new FormData();
  const {jerseys, socks} = value;
  if (jerseys.some(({shortsSize}) => shortsSize !== 'None'))
    form.set('addShorts', 'on');
  for (const color of ['Black', 'White'])
    form.set(
      `socks${color}`,
      String(socks.find((item) => item.color === color)?.quantity ?? 0),
    );
  jerseys.forEach((jersey, index) => {
    const prefix = index === 0 ? 'first' : 'second';
    form.set(`${prefix}Style`, jersey.style);
    form.set(`${prefix}Size`, jersey.size);
    form.set(`${prefix}ShortsSize`, jersey.shortsSize);
    form.set(index === 0 ? 'name' : 'secondName', jersey.print.name);
    form.set(index === 0 ? 'number' : 'secondNumber', jersey.print.number);
  });
  return form;
}
