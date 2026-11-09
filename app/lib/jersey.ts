export const JERSEY_HANDLE = 'club-jersey';
export const JERSEY_SIZES = ['M', 'L', 'XL', 'XXL'] as const;
export const JERSEY_COLORS = ['Home (Orange)', 'Away (Black)'] as const;
export const JERSEY_KITS = ['Jersey only', 'Jersey + shorts'] as const;
export const JERSEY_PREVIEW_PRICES = ['70.00', '85.00'] as const;
export const NAME_LIMIT = 14;
const PERSONALIZATION_DURATION = 7 * 24 * 60 * 60 * 1000;

export type JerseySelection = {
  color: string;
  size: string;
  kit: string;
  personalize: boolean;
  name: string;
  number: string;
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
  return {
    color: text('color'),
    size: text('size'),
    kit: text('kit'),
    personalize: form.get('personalize') === 'on',
    name: text('name').normalize('NFC').toUpperCase(),
    number: text('number'),
  };
}

export function validateJerseySelection(
  selection: JerseySelection,
  canPersonalize: boolean,
) {
  const {color, size, kit, personalize, name, number} = selection;
  if (
    !JERSEY_COLORS.some((value) => value === color) ||
    !JERSEY_SIZES.some((value) => value === size) ||
    !JERSEY_KITS.some((value) => value === kit)
  ) {
    return 'Choose a color, size, and kit option.';
  }
  if (!personalize) return null;
  if (!canPersonalize)
    return 'The personalization window has closed. Choose a jersey without personalization.';
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
  selection: JerseySelection,
) {
  return (
    options.length === 3 &&
    options.every(
      ({name, value}) =>
        value ===
        {Color: selection.color, Size: selection.size, Kit: selection.kit}[
          name as 'Color' | 'Size' | 'Kit'
        ],
    )
  );
}
