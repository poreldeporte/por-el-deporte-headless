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
  kit: 'Jersey + shorts',
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
    {kit: 'Free shorts'},
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
    {name: 'Kit', value: 'Jersey + shorts'},
    {name: 'Color', value: 'Home (Orange)'},
    {name: 'Size', value: 'XL'},
  ];
  assert.equal(matchesJerseyVariant(options, selection), true);
  assert.equal(
    matchesJerseyVariant(options, {...selection, kit: 'Jersey only'}),
    false,
  );
  assert.equal(
    matchesJerseyVariant(options, {...selection, color: 'Away (Black)'}),
    false,
  );
  assert.equal(matchesJerseyVariant(options.slice(1), selection), false);
});
