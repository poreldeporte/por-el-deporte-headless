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

  if (image) {
    tags.push(
      {property: 'og:image', content: image},
      {name: 'twitter:image', content: image},
    );
  }

  return tags;
}
