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
  socksPackSavings,
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
  jerseys: [{style: homeShort, size: 'XL'}],
  shortsSize: 'M',
  personalize: true,
  name: 'VIOLA',
  number: '07',
  socksColor: 'None',
  socksPack: '1 pair',
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
  const chosen = {
    ...selection,
    jerseys: [
      {style: homeShort, size: 'XL'},
      {style: awayLong, size: 'M'},
    ],
  };
  const variant = {
    id: 'bundle-xl-m',
    availableForSale: true,
    selectedOptions: [
      {name: 'Style', value: bundleStyle},
      {name: 'Size', value: 'XL / M'},
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

test('socks resolve the exact color, pack and size before adding one priced SKU', () => {
  const chosen = {...selection, socksColor: 'White', socksSize: 'L'};
  const jersey = {
    id: 'jersey-xl-m',
    availableForSale: true,
    selectedOptions: [
      {name: 'Style', value: homeShort},
      {name: 'Size', value: 'XL'},
      {name: 'Shorts size', value: 'M'},
    ],
  };
  const sock = {
    id: 'white-socks-l',
    availableForSale: true,
    selectedOptions: [
      {name: 'Color', value: 'White'},
      {name: 'Pack', value: '1 pair'},
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
  const threePairs = {...chosen, socksPack: '3 pairs'};
  const pack = {
    ...sock,
    id: 'white-socks-three-pack-l',
    selectedOptions: sock.selectedOptions.map((option) =>
      option.name === 'Pack' ? {...option, value: '3 pairs'} : option,
    ),
  };
  assert.equal(matchesSocksVariant(sock.selectedOptions, threePairs), false);
  assert.deepEqual(jerseyCartLines(threePairs, [jersey], [sock]).lines, []);
  assert.deepEqual(
    jerseyCartLines(threePairs, [jersey], [sock, pack]).lines[1],
    {
      merchandiseId: 'white-socks-three-pack-l',
      quantity: 1,
    },
  );
  for (const stock of [[], [{...sock, availableForSale: false}]]) {
    const order = jerseyCartLines(chosen, [jersey], stock);
    assert.match(order.error, /socks are not available/);
    assert.deepEqual(order.lines, []);
  }
  const form = formFor(chosen);
  assert.equal(readJerseySelection(form).socksColor, 'White');
  form.set('socksPack', '3 pairs');
  assert.equal(readJerseySelection(form).socksPack, '3 pairs');
  form.set('socksColor', 'None');
  assert.equal(readJerseySelection(form).socksColor, 'None');
  assert.equal(readJerseySelection(form).socksPack, '1 pair');
  assert.match(
    validateJerseySelection({...chosen, socksColor: ''}, true),
    /black or white/,
  );
  assert.match(
    validateJerseySelection({...chosen, socksPack: '2 pairs'}, true),
    /one pair or three pairs/,
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
  const form = formFor({...selection, name: '  Jose\u0301  '});
  form.set('addShorts', 'on');
  const parsed = readJerseySelection(form);
  assert.equal(parsed.name, 'JOSÉ');
  assert.equal(validateJerseySelection(parsed, true), null);
  assert.deepEqual(jerseyAttributes(parsed), [
    {key: 'Order type', value: 'Preorder'},
    {key: 'Name on back', value: 'JOSÉ'},
    {key: 'Number on back', value: '07'},
  ]);
});

test('blank print fields order a plain jersey; partial fields and expired personalization are rejected', () => {
  const form = formFor({...selection, name: ' ', number: ''});
  form.set('addShorts', 'on');
  const plain = readJerseySelection(form);
  assert.equal(plain.personalize, false);
  assert.equal(validateJerseySelection(plain, false), null);
  assert.deepEqual(jerseyAttributes(plain), [
    {key: 'Order type', value: 'Preorder'},
  ]);
  form.set('name', 'VIOLA');
  form.set('personalize', 'off');
  assert.equal(readJerseySelection(form).personalize, true);
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
    {jerseys: [{style: homeShort, size: ''}]},
    {jerseys: [{style: homeShort, size: 'S'}]},
    {jerseys: [{style: 'Blue', size: 'M'}]},
    {
      jerseys: [
        {style: homeShort, size: 'M'},
        {style: homeShort, size: 'XL'},
      ],
    },
    {
      jerseys: [
        {style: homeShort, size: 'M'},
        {style: awayLong, size: ''},
      ],
    },
    {
      jerseys: [homeShort, homeLong, awayLong].map((style) => ({
        style,
        size: 'M',
      })),
    },
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
    matchesJerseyVariant(options, {
      ...selection,
      jerseys: [{style: awayShort, size: 'XL'}],
    }),
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
  const form = formFor(selection);
  assert.equal(readJerseySelection(form).shortsSize, 'None');
  form.set('addShorts', 'on');
  assert.equal(readJerseySelection(form).shortsSize, 'M');
  form.delete('shortsSize');
  assert.equal(readJerseySelection(form).shortsSize, '');
});

test('all 560 SKUs preserve each jersey size and the independent shorts size', () => {
  let count = 0;
  assert.equal(JERSEY_STYLE_OPTIONS.length, 10);
  assert.equal(new Set(JERSEY_STYLE_OPTIONS).size, 10);
  for (const style of JERSEY_STYLE_OPTIONS) {
    const styles = jerseyStyles(style);
    for (const firstSize of JERSEY_SIZES) {
      for (const secondSize of styles.length === 2 ? JERSEY_SIZES : ['']) {
        for (const shortsSize of JERSEY_SHORTS_OPTIONS) {
          const jerseys = styles.map((item, index) => ({
            style: item.value,
            size: index === 0 ? firstSize : secondSize,
          }));
          const chosen = {...selection, jerseys, shortsSize};
          assert.equal(validateJerseySelection(chosen, true), null);
          const variant = {
            id: String(count++),
            availableForSale: true,
            selectedOptions: [
              {name: 'Style', value: style},
              {
                name: 'Size',
                value: secondSize ? `${firstSize} / ${secondSize}` : firstSize,
              },
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
              jerseys: [...jerseys].reverse(),
            }),
            true,
          );
          assert.equal(
            matchesJerseyVariant(variant.selectedOptions, {
              ...chosen,
              shortsSize: shortsSize === 'None' ? 'M' : 'None',
            }),
            false,
          );
          assert.equal(
            matchesJerseyVariant(variant.selectedOptions, {
              ...chosen,
              jerseys: jerseys.map((item, index) =>
                index === jerseys.length - 1
                  ? {...item, size: item.size === 'M' ? 'XL' : 'M'}
                  : item,
              ),
            }),
            false,
          );
        }
      }
    }
  }
  assert.equal(count, 560);
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
    const quote = jerseyQuote(
      {...selection, jerseys: styles.map((style) => ({style, size: 'XL'}))},
      [],
      null,
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
  const chosen = {...selection, jerseys: [{style: homeLong, size: 'XL'}]};
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

test('the second jersey quote includes its matching shorts when shorts are selected', () => {
  const quote = jerseyQuote(selection, [], null, true);
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

test('socks pack savings use actual prices and suppress unsupported comparisons', () => {
  const single = {amount: '10.00', currencyCode: 'USD'};
  const pack = {amount: '25.00', currencyCode: 'USD'};
  assert.deepEqual(socksPackSavings(single, pack), {
    amount: '5.00',
    currencyCode: 'USD',
  });
  assert.equal(
    socksPackSavings({...single, amount: '12.50'}, {...pack, amount: '32.00'})
      .amount,
    '5.50',
  );
  assert.equal(socksPackSavings(null, pack), null);
  assert.equal(socksPackSavings(single, null), null);
  assert.equal(socksPackSavings(single, {...pack, currencyCode: 'EUR'}), null);
  assert.equal(socksPackSavings(single, {...pack, amount: '30.00'}), null);
  assert.equal(socksPackSavings(single, {...pack, amount: '35.00'}), null);
});

test('quotes keep each size attached to its style, including an unchosen first size', () => {
  const variants = [
    [homeShort, 'M', '70.00'],
    [homeShort, 'XL', '75.00'],
    [awayLong, 'XL', '85.00'],
    [bundleStyle, 'M / XL', '135.00'],
    [bundleStyle, 'XL / XL', '140.00'],
  ].map(([style, size, amount]) => ({
    selectedOptions: [
      {name: 'Style', value: style},
      {name: 'Size', value: size},
      {name: 'Shorts size', value: 'None'},
    ],
    price: {amount, currencyCode: 'USD'},
  }));
  const chosen = {
    ...selection,
    jerseys: [
      {style: homeShort, size: ''},
      {style: awayLong, size: 'XL'},
    ],
    shortsSize: 'None',
  };
  const quote = jerseyQuote(chosen, variants, null, false);
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
      null,
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
      null,
      false,
    ).total.amount,
    '140.00',
  );
});

test('the full jersey catalog loads all 560 variants through bounded pagination', async () => {
  const page = (start, count, endCursor, hasNextPage) => ({
    nodes: Array.from({length: count}, (_, index) => ({
      id: String(start + index),
    })),
    pageInfo: {endCursor, hasNextPage},
  });
  const first = page(0, 250, '250', true);
  const next = [page(250, 250, '500', true), page(500, 60, '560', false)];
  const cursors = [];
  const result = await loadJerseyVariants(first, async (cursor) => {
    cursors.push(cursor);
    return next.shift();
  });
  assert.deepEqual(cursors, ['250', '500']);
  assert.equal(result.nodes.length, 560);
  assert.equal(result.nodes.at(-1).id, '559');
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
  assert.equal(reads, 2);
});

test('different sizes stay attached to their jersey through parsing, canonical options and cart fulfillment', () => {
  const chosen = {
    ...selection,
    jerseys: [
      {style: awayLong, size: 'M'},
      {style: homeShort, size: 'XXL'},
    ],
  };
  const form = formFor(chosen);
  form.set('addShorts', 'on');
  const parsed = readJerseySelection(form);
  assert.deepEqual(parsed, chosen);
  assert.deepEqual(jerseyOptionValues(parsed), {
    Style: bundleStyle,
    Size: 'XXL / M',
    'Shorts size': 'M',
  });
  const includes = jerseyAttributes(parsed).find(
    ({key}) => key === 'Includes',
  ).value;
  assert.ok(includes.includes(`${awayLong} · Size M`));
  assert.ok(includes.includes(`${homeShort} · Size XXL`));
  form.delete('secondSize');
  assert.match(
    validateJerseySelection(readJerseySelection(form), true),
    /jersey 2/,
  );
  form.set('secondSize', 'XL');
  form.delete('firstSize');
  assert.match(
    validateJerseySelection(readJerseySelection(form), true),
    /jersey 1/,
  );
});

function formFor(value) {
  const form = new FormData();
  const {jerseys, ...extras} = value;
  for (const [key, item] of Object.entries(extras)) form.set(key, String(item));
  jerseys.forEach((jersey, index) => {
    const prefix = index === 0 ? 'first' : 'second';
    form.set(`${prefix}Style`, jersey.style);
    form.set(`${prefix}Size`, jersey.size);
  });
  return form;
}
