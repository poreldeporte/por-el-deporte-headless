/**
 * The homepage hero image, shared between the <img> in routes/_index.tsx and the
 * preload in root.tsx links().
 *
 * The previous shot (ACajiga-221) was replaced because the gear in it wasn't
 * ours: Under Armour shorts with another club's crest, plus adidas and a "Texas
 * de Brazil" sponsor on the jersey. This one carries only Por El Deporte product
 * — the Club Atlético crest tee, the script tee, the island-stripe tee and the
 * crest cap — and the composition suits the centred headline, which lands in the
 * calm band between the faces and the merch. They must agree exactly — a preload whose href,
 * imageSrcSet or imageSizes differs from the tag makes the browser download a
 * second file instead of reusing the first.
 */
export const HERO_SRC =
  'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20240609_PorElDeporteFinal_ACajiga-1294.jpg?v=1755704396';

/** Widths offered to the CDN. Shopify resizes on the fly from `&width=`. */
export const HERO_WIDTHS = [640, 960, 1280, 1600, 2000, 2400] as const;

export const HERO_SRCSET = HERO_WIDTHS.map(
  (w) => `${HERO_SRC}&width=${w} ${w}w`,
).join(', ');
