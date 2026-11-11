import {
  JERSEY_STYLES,
  jerseyPreviewPrice,
  JERSEY_HANDLE,
  JERSEY_SHORTS_HANDLE,
  JERSEY_SHORTS_PRICE,
  JERSEY_SHORTS_VALUE,
  JERSEY_SIZES,
  JERSEY_STORY,
  JERSEY_TITLE,
} from '../app/lib/jersey.ts';

// This command only writes CSV to stdout. It never connects to Shopify.
const variants = JERSEY_STYLES.flatMap(({value: style}) => {
  return JERSEY_SIZES.map((size) => ({
    'URL handle': JERSEY_HANDLE,
    Title: '',
    Description: '',
    Vendor: '',
    'Published on online store': 'false',
    Status: 'draft',
    'Option1 name': 'Style',
    'Option1 value': style,
    'Option2 name': 'Size',
    'Option2 value': size,
    Price: jerseyPreviewPrice(style, false).amount,
    'Compare-at price': '',
    'Inventory tracker': 'shopify',
    'Inventory quantity': '0',
    'Continue selling when out of stock': 'continue',
    'Requires shipping': 'true',
    'Fulfillment service': 'manual',
  }));
});

Object.assign(variants[0], {
  Title: JERSEY_TITLE,
  Description: JERSEY_STORY.map((paragraph) => `<p>${paragraph}</p>`).join(''),
  Vendor: 'Por El Deporte',
});

const shorts = ['Home (Cream)', 'Away (Black)'].flatMap((color) =>
  JERSEY_SIZES.map((size) => ({
    ...variants[0],
    'URL handle': JERSEY_SHORTS_HANDLE,
    Title: '',
    Description: '',
    Vendor: '',
    'Option1 name': 'Color',
    'Option1 value': color,
    'Option2 value': size,
    Price: JERSEY_SHORTS_PRICE.toFixed(2),
    'Compare-at price': JERSEY_SHORTS_VALUE.amount,
  })),
);
Object.assign(shorts[0], {
  Title: 'Club Shorts',
  Description:
    '<p>Complete your kit with matching shorts. Home in cream, away in black. Choose your shorts size separately from your jersey. $15 as a kit add-on; $35 value. Preorder — shipping date to be confirmed.</p>',
  Vendor: 'Por El Deporte',
});
variants.push(...shorts);

const columns = Object.keys(variants[0]);
const rows = [columns, ...variants.map((variant) => Object.values(variant))];
process.stdout.write(
  rows
    .map((row) =>
      row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','),
    )
    .join('\n') + '\n',
);
