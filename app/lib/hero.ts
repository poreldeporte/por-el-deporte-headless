/**
 * The homepage hero image, shared between the <img> in routes/_index.tsx and the
 * preload in root.tsx links(). They must agree exactly — a preload whose href,
 * imageSrcSet or imageSizes differs from the tag makes the browser download a
 * second file instead of reusing the first.
 */
export const HERO_SRC =
  'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20240609_PorElDeporteFinal_ACajiga-221.jpg?v=1755706115';

/** Widths offered to the CDN. Shopify resizes on the fly from `&width=`. */
export const HERO_WIDTHS = [640, 960, 1280, 1600, 2000, 2400] as const;

export const HERO_SRCSET = HERO_WIDTHS.map(
  (w) => `${HERO_SRC}&width=${w} ${w}w`,
).join(', ');
