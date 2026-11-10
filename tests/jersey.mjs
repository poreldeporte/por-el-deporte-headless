import assert from 'node:assert/strict';
import {test} from 'node:test';
import {
  jerseyAttributes,
  jerseyCartLines,
  JERSEY_STYLE_OPTIONS,
  JERSEY_SIZES,
  JERSEY_SHORTS_OPTIONS,
  jerseyStyleValue,
  jerseyPreviewPrice,
  jerseyQuote,
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
const selection = {
  style: homeShort,
  size: 'XL',
  shortsSize: 'M',
  personalize: true,
  name: 'VIOLA',
  number: '07',
  socksColor: 'None',
  socksSize: '',
};

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

test('a mixed sleeve bundle resolves a real SKU with explicit fulfillment contents', () => {
  const chosen = {...selection, style: bundleStyle};
  const variant = {
    id: 'bundle-xl-m',
    availableForSale: true,
    selectedOptions: [
      {name: 'Style', value: bundleStyle},
      {name: 'Size', value: 'XL'},
      {name: 'Shorts size', value: 'M'},
    ],
  };
  assert.equal(validateJerseySelection(chosen, true), null);
  const order = jerseyCartLines(chosen, [variant], []);
  assert.equal(order.error, null);
  assert.equal(order.lines.length, 1);
  assert.equal(order.lines[0].merchandiseId, 'bundle-xl-m');
  assert.equal(order.lines[0].quantity, 1);
  assert.ok(
    order.lines[0].attributes.some(
      ({key, value}) => key === 'Includes' && value.includes('2 pairs'),
    ),
  );
  assert.match(jerseyCartLines(chosen, [], []).error, /unavailable/);
});

test('socks are resolved by exact color and size and never appended with an invalid SKU', () => {
  const chosen = {...selection, socksColor: 'White', socksSize: 'L'};
  const jersey = {
    id: 'jersey-xl-m',
    availableForSale: true,
    selectedOptions: [
      {name: 'Style', value: selection.style},
      {name: 'Size', value: 'XL'},
      {name: 'Shorts size', value: 'M'},
    ],
  };
  const sock = {
    id: 'white-socks-l',
    availableForSale: true,
    selectedOptions: [
      {name: 'Color', value: 'White'},
      {name: 'Size', value: 'L'},
    ],
  };
  assert.equal(matchesSocksVariant(sock.selectedOptions, chosen), true);
  assert.equal(
    matchesSocksVariant(sock.selectedOptions, {...chosen, socksColor: 'Black'}),
    false,
  );
  assert.equal(
    matchesSocksVariant(sock.selectedOptions, {...chosen, socksSize: ''}),
    false,
  );
  assert.deepEqual(jerseyCartLines(chosen, [jersey], [sock]).lines[1], {
    merchandiseId: 'white-socks-l',
    quantity: 1,
  });
  for (const stock of [[], [{...sock, availableForSale: false}]]) {
    const order = jerseyCartLines(chosen, [jersey], stock);
    assert.match(order.error, /socks are not available/);
    assert.deepEqual(order.lines, []);
  }
  const form = new FormData();
  for (const [key, value] of Object.entries(chosen)) form.set(key, value);
  assert.equal(readJerseySelection(form).socksColor, 'White');
  form.set('socksColor', 'None');
  assert.equal(readJerseySelection(form).socksColor, 'None');
  assert.match(
    validateJerseySelection({...chosen, socksColor: ''}, true),
    /black or white/,
  );
});

test('expired submissions reject custom printing while plain preorders remain valid', () => {
  assert.equal(validateJerseySelection(selection, true), null);
  assert.match(validateJerseySelection(selection, false), /closed/);
  assert.equal(
    validateJerseySelection({...selection, personalize: false}, false),
    null,
  );
  assert.deepEqual(jerseyAttributes({...selection, personalize: false}), [
    {key: 'Order type', value: 'Preorder'},
  ]);
});

test('server normalizes printed names and preserves leading-zero numbers as line properties', () => {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    ...selection,
    addShorts: 'on',
    personalize: 'on',
    name: '  Jose\u0301  ',
  }))
    form.set(key, value);
  const parsed = readJerseySelection(form);
  assert.equal(parsed.name, 'JOSÉ');
  assert.equal(validateJerseySelection(parsed, true), null);
  assert.deepEqual(jerseyAttributes(parsed), [
    {key: 'Order type', value: 'Preorder'},
    {key: 'Name on back', value: 'JOSÉ'},
    {key: 'Number on back', value: '07'},
  ]);
});

test('invalid options and print data are rejected before a cart write', () => {
  for (const patch of [
    {size: ''},
    {size: 'S'},
    {style: 'Blue'},
    {style: `${homeShort} + ${homeShort}`},
    {style: `${homeShort} + ${homeLong} + ${awayLong}`},
    {shortsSize: ''},
    {shortsSize: 'S'},
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
      typeof validateJerseySelection({...selection, ...patch}, true),
      'string',
    );
});

test('variant matching resolves all three options regardless of Shopify option order', () => {
  const options = [
    {name: 'Shorts size', value: 'M'},
    {name: 'Style', value: homeShort},
    {name: 'Size', value: 'XL'},
  ];
  assert.equal(matchesJerseyVariant(options, selection), true);
  assert.equal(
    matchesJerseyVariant(options, {...selection, shortsSize: 'None'}),
    false,
  );
  assert.equal(
    matchesJerseyVariant(options, {...selection, style: awayShort}),
    false,
  );
  assert.equal(matchesJerseyVariant(options.slice(1), selection), false);
});

test('shorts size is independent of jersey size and required only when adding shorts', () => {
  assert.equal(validateJerseySelection(selection, true), null);
  assert.equal(
    validateJerseySelection({...selection, shortsSize: 'None'}, true),
    null,
  );
  assert.match(
    validateJerseySelection({...selection, shortsSize: ''}, true),
    /shorts size/i,
  );
  assert.match(
    validateJerseySelection({...selection, shortsSize: 'S'}, true),
    /shorts size/i,
  );
  const form = new FormData();
  for (const [key, value] of Object.entries({...selection, personalize: 'on'}))
    form.set(key, value);
  assert.equal(readJerseySelection(form).shortsSize, 'None');
  form.set('addShorts', 'on');
  assert.equal(readJerseySelection(form).shortsSize, 'M');
  form.delete('shortsSize');
  assert.equal(readJerseySelection(form).shortsSize, '');
});

test('all 200 single and two-style SKUs preserve independent jersey and shorts sizes', () => {
  let count = 0;
  assert.equal(JERSEY_STYLE_OPTIONS.length, 10);
  assert.equal(new Set(JERSEY_STYLE_OPTIONS).size, 10);
  for (const style of JERSEY_STYLE_OPTIONS) {
    for (const size of JERSEY_SIZES) {
      for (const shortsSize of JERSEY_SHORTS_OPTIONS) {
        const chosen = {...selection, style, size, shortsSize};
        assert.equal(validateJerseySelection(chosen, true), null);
        const variant = {
          id: String(count++),
          availableForSale: true,
          selectedOptions: [
            {name: 'Style', value: style},
            {name: 'Size', value: size},
            {name: 'Shorts size', value: shortsSize},
          ],
        };
        assert.equal(
          jerseyCartLines(chosen, [variant], []).lines[0].merchandiseId,
          variant.id,
        );
        assert.equal(
          matchesJerseyVariant(variant.selectedOptions, {
            ...chosen,
            shortsSize: shortsSize === 'None' ? 'M' : 'None',
          }),
          false,
        );
      }
    }
  }
  assert.equal(count, 200);
});

test('every mix has a stable SKU and the correct sleeve, bundle and shorts prices', () => {
  const expected = [
    [[homeShort], '70.00', '85.00'],
    [[homeLong], '80.00', '95.00'],
    [[awayShort], '70.00', '85.00'],
    [[awayLong], '80.00', '95.00'],
    [[homeShort, homeLong], '130.00', '160.00'],
    [[homeShort, awayShort], '120.00', '150.00'],
    [[homeShort, awayLong], '130.00', '160.00'],
    [[homeLong, awayShort], '130.00', '160.00'],
    [[homeLong, awayLong], '140.00', '170.00'],
    [[awayShort, awayLong], '130.00', '160.00'],
  ];
  for (const [styles, plain, kit] of expected) {
    const style = jerseyStyleValue(styles);
    assert.equal(jerseyStyleValue([...styles].reverse()), style);
    assert.equal(jerseyPreviewPrice(style, false).amount, plain);
    assert.equal(jerseyPreviewPrice(style, true).amount, kit);
    const quote = jerseyQuote({...selection, style}, [], null, true);
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
});

test('quotes use real SKU prices, include priced socks, and never invent a missing or mixed-currency total', () => {
  const variants = [
    {
      selectedOptions: [
        {name: 'Style', value: homeLong},
        {name: 'Size', value: 'XL'},
        {name: 'Shorts size', value: 'None'},
      ],
      price: {amount: '83.00', currencyCode: 'USD'},
    },
    {
      selectedOptions: [
        {name: 'Style', value: homeLong},
        {name: 'Size', value: 'XL'},
        {name: 'Shorts size', value: 'M'},
      ],
      price: {amount: '100.00', currencyCode: 'USD'},
    },
  ];
  const chosen = {...selection, style: homeLong};
  const quote = jerseyQuote(chosen, variants, null, false);
  assert.equal(quote.total.amount, '100.00');
  assert.equal(quote.shorts.amount, '17.00');
  assert.equal(quote.shortsSavings.amount, '18.00');
  const socks = {...chosen, socksColor: 'Black'};
  assert.equal(
    jerseyQuote(socks, variants, {amount: '12.50', currencyCode: 'USD'}, false)
      .total.amount,
    '112.50',
  );
  assert.equal(jerseyQuote(socks, variants, null, false).total, null);
  assert.equal(
    jerseyQuote(socks, variants, {amount: '12.50', currencyCode: 'EUR'}, false)
      .total,
    null,
  );
  assert.equal(jerseyQuote(chosen, [], null, false).total, null);
  const euro = variants.map((item) => ({
    ...item,
    price: {...item.price, currencyCode: 'EUR'},
  }));
  assert.equal(jerseyQuote(chosen, euro, null, false).shortsSavings, null);
});
