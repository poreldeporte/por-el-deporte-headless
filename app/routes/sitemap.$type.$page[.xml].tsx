import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {getSitemap} from '@shopify/hydrogen';
import {shouldExcludePage} from '~/lib/pages-seo';

export async function loader({
  request,
  params,
  context: {storefront},
}: Route.LoaderArgs) {
  // `getSitemap` only knows about Shopify resources (products, collections,
  // pages, blogs, articles). The storefront's own routes — the homepage, the
  // About page, the policy documents — are ours, so they get their own child
  // sitemap under the synthetic type "site".
  if (params.type === 'site') {
    return siteRoutesSitemap(request, storefront);
  }

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

  let body: BodyInit | null = response.body;
  if (params.type === 'pages') {
    body = await withoutExcludedPages(response, storefront);
  } else if (params.type === 'articles') {
    body = await withArticleBlogPaths(response, storefront);
  }

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return new Response(body, {status: response.status, headers});
}

/**
 * `getSitemap` lists every published Shopify page. Some of ours are empty and
 * some duplicate a page that already owns the content, and both are excluded
 * from the index by pages.$handle.tsx — a sitemap is meant to list canonical,
 * indexable URLs, so those entries come back out here. Filtering the rendered
 * XML (rather than the source data) keeps Hydrogen's helper in charge of the
 * sitemap format; we only drop whole <url> blocks.
 */
async function withoutExcludedPages(
  response: Response,
  storefront: Route.LoaderArgs['context']['storefront'],
): Promise<string> {
  const xml = await response.text();

  const {pages} = await storefront.query(SITEMAP_PAGES_QUERY, {
    // 250 is the Storefront API's per-request maximum. A store with more pages
    // than that would keep its overflow in the sitemap, which is the safe way
    // to be wrong here.
    variables: {first: 250},
    cache: storefront.CacheLong(),
  });

  const excluded = new Set(
    (pages?.nodes ?? [])
      .filter((p) => shouldExcludePage(p.handle, p.body))
      .map((p) => p.handle),
  );
  if (!excluded.size) return xml;

  return xml.replace(/[ \t]*<url>[\s\S]*?<\/url>\n?/g, (block) => {
    const loc = /<loc>([^<]+)<\/loc>/.exec(block)?.[1] ?? '';
    const handle = loc.split('/pages/')[1];
    return handle && excluded.has(handle) ? '' : block;
  });
}

/**
 * Articles live at `/blogs/:blogHandle/:articleHandle` in this app, but the
 * `getLink` callback is only handed the article's own handle — there is no way
 * to build the real path from inside it, so `getSitemap` emits `/articles/x`,
 * which 404s. Rewriting the <loc> values here is the difference between a
 * sitemap of dead URLs and one Google can actually follow.
 */
async function withArticleBlogPaths(
  response: Response,
  storefront: Route.LoaderArgs['context']['storefront'],
): Promise<string> {
  const xml = await response.text();

  const {blogs} = await storefront.query(SITEMAP_ARTICLE_BLOGS_QUERY, {
    variables: {blogs: 50, articles: 250},
    cache: storefront.CacheLong(),
  });

  const blogOf = new Map<string, string>();
  for (const blog of blogs?.nodes ?? []) {
    for (const article of blog.articles?.nodes ?? []) {
      blogOf.set(article.handle, blog.handle);
    }
  }

  // `/articles/` only ever appears inside a URL in this document, in both the
  // <loc> and the hreflang <xhtml:link>, so one substitution covers both.
  return xml.replace(/\/articles\/([^"<\s]+)/g, (match, handle: string) => {
    const blog = blogOf.get(handle);
    return blog ? `/blogs/${blog}/${handle}` : match;
  });
}

/**
 * Sitemap for the routes this app defines itself. Shopify has no idea these
 * exist, so without it the homepage and /about are reachable by crawling but
 * never actually declared. `priority` is deliberately omitted everywhere except
 * the homepage — Google ignores it, and guessing at it just adds noise.
 */
async function siteRoutesSitemap(
  request: Request,
  storefront: Route.LoaderArgs['context']['storefront'],
): Promise<Response> {
  const origin = new URL(request.url).origin;

  const {shop} = await storefront.query(SITEMAP_POLICIES_QUERY, {
    cache: storefront.CacheLong(),
  });
  const policyPaths = [
    shop?.privacyPolicy,
    shop?.shippingPolicy,
    shop?.termsOfService,
    shop?.refundPolicy,
  ]
    .filter((p): p is {handle: string} => Boolean(p?.handle))
    .map((p) => `/policies/${p.handle}`);

  // `/collections/all-products` is a real Shopify collection and is already
  // listed in the collections sitemap, so it is not repeated here.
  const paths = ['/', '/about', '/policies', ...policyPaths];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map(
      (path) =>
        `<url><loc>${origin}${path}</loc><changefreq>weekly</changefreq></url>`,
    ),
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}

const SITEMAP_ARTICLE_BLOGS_QUERY = `#graphql
  query SitemapArticleBlogs($blogs: Int!, $articles: Int!) {
    blogs(first: $blogs) {
      nodes {
        handle
        articles(first: $articles) {
          nodes {
            handle
          }
        }
      }
    }
  }
` as const;

const SITEMAP_POLICIES_QUERY = `#graphql
  query SitemapPolicies {
    shop {
      privacyPolicy { handle }
      shippingPolicy { handle }
      termsOfService { handle }
      refundPolicy { handle }
    }
  }
` as const;

const SITEMAP_PAGES_QUERY = `#graphql
  query SitemapPages($first: Int!) {
    pages(first: $first) {
      nodes {
        handle
        body
      }
    }
  }
` as const;
