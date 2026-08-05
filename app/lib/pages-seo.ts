/**
 * SEO policy for Shopify "pages" (`/pages/:handle`).
 *
 * These are content pages carried over from the store's old theme. They are all
 * still served by pages.$handle.tsx and all still land in the sitemap, but the
 * branded storefront no longer links to most of them — which leaves two things
 * Google's ecommerce guidance treats as real problems:
 *
 *   1. Empty pages. `gallery`, `contact` and `app` have a title and no body.
 *      Submitting blank URLs in a sitemap spends crawl budget on nothing.
 *   2. Duplicates. `/pages/privacy-policy` is byte-identical to the policy
 *      document at `/policies/privacy-policy`, and `our-mission` covers the
 *      same ground as the designed `/about` page. Two URLs for one thing split
 *      the ranking signals between them.
 *
 * Both rules are derived from live data rather than hardcoded lists of URLs, so
 * the moment someone fills in `contact` in Shopify admin it starts being
 * indexed and listed again with no code change. The same helpers drive the
 * route's meta() and the sitemap filter, so a page can never be told "noindex"
 * while still being advertised in the sitemap.
 */

/**
 * Pages whose content already has a better home on this storefront. The value
 * is the path that should own the ranking; the `/pages/...` URL keeps working
 * and simply points its canonical there.
 */
export const PAGE_CANONICAL_OVERRIDES: Readonly<Record<string, string>> = {
  // Byte-identical to the Shopify policy served at /policies/privacy-policy.
  'privacy-policy': '/policies/privacy-policy',
  // The club's founding story — /about is the designed surface for it.
  'our-mission': '/about',
};

/**
 * True when a Shopify page body carries no actual copy. Shopify's rich-text
 * editor happily saves markup with nothing in it (`<p>&nbsp;</p>`, a stray
 * `<br>`), so tags and non-breaking spaces have to come out before measuring.
 */
export function isPageBodyEmpty(body: string | null | undefined): boolean {
  if (!body) return true;
  const text = body
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .trim();
  return text.length === 0;
}

/**
 * The canonical path a `/pages/:handle` URL should point at — itself, unless
 * the content belongs to another page.
 */
export function pageCanonicalPath(handle: string, pathname: string): string {
  return PAGE_CANONICAL_OVERRIDES[handle] ?? pathname;
}

/**
 * Whether a page should stay out of the index (and therefore out of the
 * sitemap): it has no content, or it is a duplicate of a page that owns it.
 */
export function shouldExcludePage(
  handle: string,
  body: string | null | undefined,
): boolean {
  return handle in PAGE_CANONICAL_OVERRIDES || isPageBodyEmpty(body);
}
