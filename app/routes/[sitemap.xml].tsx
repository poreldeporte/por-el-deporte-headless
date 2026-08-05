import type {Route} from './+types/[sitemap.xml]';
import {getSitemapIndex} from '@shopify/hydrogen';

export async function loader({
  request,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemapIndex({
    storefront,
    request,
  });

  // getSitemapIndex only advertises the Shopify resource sitemaps. Append our
  // own child sitemap so the routes this app defines — the homepage, /about,
  // the policy documents — are declared too, rather than left to be found by
  // crawling.
  const origin = new URL(request.url).origin;
  const xml = (await response.text()).replace(
    '</sitemapindex>',
    `  <sitemap><loc>${origin}/sitemap/site/1.xml</loc></sitemap>\n</sitemapindex>`,
  );

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return new Response(xml, {status: response.status, headers});
}
