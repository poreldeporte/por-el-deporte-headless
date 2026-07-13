import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {getSitemap} from '@shopify/hydrogen';

export async function loader({
  request,
  params,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemap({
    storefront,
    request,
    params,
    // Single-locale US store — no locale-prefixed routes exist, so we emit only
    // the canonical URLs (advertising /en-ca//fr-ca alternates that 404 would
    // hurt SEO).
    locales: ['EN-US'],
    getLink: ({type, baseUrl, handle}) => `${baseUrl}/${type}/${handle}`,
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
