import {
  JERSEY_STYLE_OPTIONS,
  jerseyPreviewPrice,
  JERSEY_HANDLE,
  JERSEY_SHORTS_OPTIONS,
  JERSEY_SIZES,
  JERSEY_STORY,
  JERSEY_TITLE,
} from '../app/lib/jersey.ts';

// This command only writes CSV to stdout. It never connects to Shopify.
const variants = JERSEY_STYLE_OPTIONS.flatMap((style) =>
  JERSEY_SIZES.flatMap((size) =>
    JERSEY_SHORTS_OPTIONS.map((shortsSize) => ({
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
      'Option3 name': 'Shorts size',
      'Option3 value': shortsSize,
      Price: jerseyPreviewPrice(style, shortsSize !== 'None').amount,
      'Inventory tracker': 'shopify',
      'Inventory quantity': '0',
      'Continue selling when out of stock': 'continue',
      'Requires shipping': 'true',
      'Fulfillment service': 'manual',
    })),
  ),
);

Object.assign(variants[0], {
  Title: JERSEY_TITLE,
  Description: JERSEY_STORY.map((paragraph) => `<p>${paragraph}</p>`).join(''),
  Vendor: 'Por El Deporte',
});

const columns = Object.keys(variants[0]);
const rows = [columns, ...variants.map((variant) => Object.values(variant))];
process.stdout.write(
  rows
    .map((row) =>
      row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','),
    )
    .join('\n') + '\n',
);
