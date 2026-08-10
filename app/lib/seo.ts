import type {MetaDescriptor} from 'react-router';

/**
 * Shared SEO helpers. Hydrogen's <Meta /> only renders what a route's meta()
 * export returns — there is no default injection — so every indexable route
 * builds its tags through seoMeta() to get a consistent title, description,
 * canonical, and Open Graph / Twitter Card set (and thus a real link preview
 * in iMessage/WhatsApp/Slack/X instead of a bare URL).
 */

const SITE_NAME = 'Por El Deporte';

type RouteMatch = {id: string; data: unknown};

/**
 * The absolute origin (scheme + host) of the request, exposed by the root
 * loader. Used to build absolute canonical/og:url values from a pathname.
 * Self-referential canonicals are correct on whatever domain serves the app.
 */
export function siteOrigin(
  matches: ReadonlyArray<RouteMatch | undefined>,
): string {
  const root = matches.find((m) => m?.id === 'root');
  const data = root?.data as {origin?: string} | undefined;
  return data?.origin ?? '';
}

/** Recommended Open Graph card size. 1.91:1 is what every platform crops to. */
const SHARE_W = 1200;
const SHARE_H = 630;

/**
 * Turn any Shopify CDN image into a share card.
 *
 * Product mockups are square PNGs straight off the supplier — up to 3.1 MB and
 * 2000x2000. Shared as-is that fails in three ways: messaging apps skip
 * previews over roughly half a megabyte, a 1:1 image gets cropped unpredictably
 * by platforms expecting 1.91:1, and without og:image:width/height some
 * scrapers won't render a card at all.
 *
 * Shopify's CDN honours width/height/crop (it ignores `format`, so transparent
 * PNGs stay transparent — every major platform flattens those onto white, which
 * for a garment mockup is what you'd want anyway). Existing sizing params are
 * stripped first so callers can pass a URL that already carries `&width=`.
 */
export function shareImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (!/cdn\.shopify\.com/.test(url)) return url;
  const [base, query = ''] = url.split('?');
  const params = new URLSearchParams(query);
  ['width', 'height', 'crop', 'format'].forEach((k) => params.delete(k));
  params.set('width', String(SHARE_W));
  params.set('height', String(SHARE_H));
  params.set('crop', 'center');
  return `${base}?${params.toString()}`;
}

export type SeoInput = {
  title: string;
  description?: string | null;
  /** Absolute canonical URL for this page. */
  url?: string | null;
  /** Absolute image URL for social previews. */
  image?: string | null;
  type?: 'website' | 'product' | 'article';
};

export function seoMeta({
  title,
  description,
  url,
  image,
  type = 'website',
}: SeoInput): MetaDescriptor[] {
  const tags: MetaDescriptor[] = [
    {title},
    {property: 'og:title', content: title},
    {property: 'og:type', content: type},
    {property: 'og:site_name', content: SITE_NAME},
    {name: 'twitter:title', content: title},
    {name: 'twitter:card', content: image ? 'summary_large_image' : 'summary'},
  ];

  if (description) {
    const clean = description.trim();
    tags.push(
      {name: 'description', content: clean},
      {property: 'og:description', content: clean},
      {name: 'twitter:description', content: clean},
    );
  }

  if (url) {
    // `tagName: 'link'` is required — without it React Router's <Meta /> emits
    // `<meta rel="canonical">`, which crawlers ignore. og:url stays a meta.
    tags.push(
      {tagName: 'link', rel: 'canonical', href: url},
      {property: 'og:url', content: url},
    );
  }

  const card = shareImage(image);
  if (card) {
    tags.push(
      {property: 'og:image', content: card},
      {property: 'og:image:secure_url', content: card},
      // No og:image:width/height. Shopify's CDN will not upscale, so a source
      // smaller than the card box comes back at its own size — one article
      // image returns 803x558 — and a declared size that doesn't match the
      // bytes is worse than none, since scrapers lay the card out from it.
      {property: 'og:image:alt', content: title},
      {name: 'twitter:image', content: card},
      {name: 'twitter:image:alt', content: title},
    );
  }

  return tags;
}

/**
 * BreadcrumbList JSON-LD. Google requires at least two ListItems, each with
 * `position` and `name`; `item` is required except on the last crumb, where
 * omitting it lets Google use the current page URL.
 */
export function breadcrumbLd(
  origin: string,
  items: {name: string; href?: string}[],
) {
  return {
    'script:ld+json': {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        // Last crumb intentionally has no `item`.
        ...(c.href && i < items.length - 1
          ? {item: `${origin}${c.href}`}
          : {}),
      })),
    },
  };
}
