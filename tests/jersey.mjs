import assert from 'node:assert/strict';
import {test} from 'node:test';
import {
  jerseyAttributes,
  matchesJerseyVariant,
  personalizationWindow,
  readJerseySelection,
  validateJerseySelection,
} from '../app/lib/jersey.ts';

const startsAt = '2026-11-20T12:00:00-05:00';
const start = Date.parse(startsAt);
const end = start + 7 * 24 * 60 * 60 * 1000;
const selection = {
  color: 'Home (Orange)',
  size: 'XL',
  shortsSize: 'M',
  personalize: true,
  name: 'VIOLA',
  number: '07',
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
    {color: 'Blue'},
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
    {name: 'Color', value: 'Home (Orange)'},
    {name: 'Size', value: 'XL'},
  ];
  assert.equal(matchesJerseyVariant(options, selection), true);
  assert.equal(
    matchesJerseyVariant(options, {...selection, shortsSize: 'None'}),
    false,
  );
  assert.equal(
    matchesJerseyVariant(options, {...selection, color: 'Away (Black)'}),
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

test('every jersey and shorts size combination resolves its own Shopify variant', () => {
  const sizes = ['M', 'L', 'XL', 'XXL'];
  for (const color of ['Home (Orange)', 'Away (Black)']) {
    for (const size of sizes) {
      for (const shortsSize of ['None', ...sizes]) {
        const chosen = {...selection, color, size, shortsSize};
        assert.equal(validateJerseySelection(chosen, true), null);
        const options = [
          {name: 'Color', value: color},
          {name: 'Size', value: size},
          {name: 'Shorts size', value: shortsSize},
        ];
        assert.equal(matchesJerseyVariant(options, chosen), true);
        assert.equal(
          matchesJerseyVariant(options, {
            ...chosen,
            shortsSize: shortsSize === 'None' ? 'M' : 'None',
          }),
          false,
        );
      }
    }
  }
});
