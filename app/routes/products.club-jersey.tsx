import {data, useLoaderData, type HeadersFunction} from 'react-router';
import type {Route} from './+types/products.club-jersey';
import {JerseyPage} from '~/components/product/JerseyPage';
import {
  JERSEY_HANDLE,
  JERSEY_TITLE,
  PED_SOCKS_HANDLE,
  jerseyCartLines,
  personalizationWindow,
  readJerseySelection,
  validateJerseySelection,
} from '~/lib/jersey';
import jerseyStyles from '~/styles/jersey.css?url';
import productStyles from '~/styles/product.css?url';

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: productStyles},
  {rel: 'stylesheet', href: jerseyStyles},
];
export const meta: Route.MetaFunction = () => [
  {title: `${JERSEY_TITLE} | Por El Deporte`},
  {
    name: 'description',
    content:
      'The official Por El Deporte jersey. Released every two years. Home in orange, away in black. Name and number included during the first 7 days of preorder.',
  },
  // Keep the launch out of search until the merchant approves publication.
  {name: 'robots', content: 'noindex, nofollow'},
];
export const headers: HeadersFunction = ({actionHeaders, loaderHeaders}) => {
  const headers = new Headers(actionHeaders);
  headers.set(
    'Cache-Control',
    loaderHeaders.get('Cache-Control') ?? 'no-store',
  );
  return headers;
};

export async function loader({context}: Route.LoaderArgs) {
  const {product, socks} = await context.storefront.query(JERSEY_QUERY, {
    variables: {handle: JERSEY_HANDLE, socksHandle: PED_SOCKS_HANDLE},
    cache: context.storefront.CacheNone(),
  });
  const preview = import.meta.env.DEV && !product;
  if (!product && !preview) throw new Response(null, {status: 404});
  return data(
    {product, socks, preview, now: Date.now()},
    {headers: {'Cache-Control': 'no-store'}},
  );
}

export async function action({request, context}: Route.ActionArgs) {
  const selection = readJerseySelection(await request.formData());
  const {product, socks} = await context.storefront.query(JERSEY_QUERY, {
    variables: {handle: JERSEY_HANDLE, socksHandle: PED_SOCKS_HANDLE},
    cache: context.storefront.CacheNone(),
  });
  const preview = import.meta.env.DEV && !product;
  const window = personalizationWindow(product?.startsAt?.value, Date.now());
  const error = validateJerseySelection(
    selection,
    preview || window.status === 'open',
  );
  if (error) return data({error, preview: null, added: false}, {status: 400});
  if (preview) return data({error: null, preview: selection, added: false});
  if (!product || ['unconfigured', 'upcoming'].includes(window.status)) {
    return data(
      {error: 'Preorders are not open yet.', preview: null, added: false},
      {status: 400},
    );
  }
  const order = jerseyCartLines(
    selection,
    product.variants.nodes,
    socks?.variants.nodes ?? [],
  );
  if (order.error)
    return data(
      {error: order.error, preview: null, added: false},
      {status: 400},
    );
  const result = await context.cart.addLines(order.lines);
  const headers = result.cart
    ? context.cart.setCartId(result.cart.id)
    : new Headers();
  const messages = [...(result.errors ?? []), ...(result.warnings ?? [])].map(
    (item) => item.message,
  );
  const added =
    Boolean(result.cart) && !result.errors?.length && !result.warnings?.length;
  return data(
    {
      error:
        messages.join(' ') ||
        (added ? null : 'Your jersey could not be added. Please try again.'),
      preview: null,
      added,
    },
    {headers, status: added ? 200 : 400},
  );
}

export default function Jersey() {
  return <JerseyPage {...useLoaderData<typeof loader>()} />;
}

const JERSEY_QUERY = `#graphql
  query JerseyPreorder($handle: String!, $socksHandle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      startsAt: metafield(namespace: "preorder", key: "starts_at") { value }
      shippingEstimate: metafield(namespace: "preorder", key: "shipping_estimate") { value }
      images(first: 10) { nodes { id url altText width height } }
      variants(first: 250) {
        nodes {
          id
          title
          availableForSale
          selectedOptions { name value }
          price { amount currencyCode }
          image { id url altText width height }
        }
      }
    }
    socks: product(handle: $socksHandle) {
      id
      title
      options { name values }
      variants(first: 250) {
        nodes {
          id
          availableForSale
          selectedOptions { name value }
          price { amount currencyCode }
        }
      }
    }
  }
` as const;
