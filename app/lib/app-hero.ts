/**
 * The /app hero background, shared between the <img> in routes/app.tsx and the
 * preload in that route's links(). They must agree EXACTLY — a preload whose
 * href, imageSrcSet or imageSizes differs from the tag makes the browser fetch
 * a second file instead of reusing the first.
 *
 * The squad lined up along the fence, in Por El Deporte kit. Chosen over the
 * portrait shots because a hero band crops to roughly 3:1 and a portrait loses
 * everything but torsos, and over the merch shots because this page is not
 * selling apparel. It is also literally what S3 promises to leave alone:
 * "Everyone you already have."
 */
export const APP_HERO_SRC =
  'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20241117_PorElDeporte_acajiga-763.jpg?v=1755707862';

export const APP_HERO_WIDTHS = [640, 960, 1280, 1600, 2000, 2400] as const;

export const APP_HERO_SRCSET = APP_HERO_WIDTHS.map(
  (w) => `${APP_HERO_SRC}&width=${w} ${w}w`,
).join(', ');
