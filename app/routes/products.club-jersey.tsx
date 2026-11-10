import {data, useLoaderData, type HeadersFunction} from 'react-router';
import type {Route} from './+types/products.club-jersey';
import {JerseyPage} from '~/components/product/JerseyPage';
import {
  JERSEY_HANDLE,
  jerseyAttributes,
  matchesJerseyVariant,
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
  {title: 'The Club Jersey | Por El Deporte'},
  {
    name: 'description',
    content:
      'The official Por El Deporte jersey. Released once every two years, with just seven days to make it yours. Home in orange. Away in black.',
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
  const {product} = await context.storefront.query(JERSEY_QUERY, {
    variables: {handle: JERSEY_HANDLE},
    cache: context.storefront.CacheNone(),
  });
  const preview = import.meta.env.DEV && !product;
  if (!product && !preview) throw new Response(null, {status: 404});
  return data(
    {product, preview, now: Date.now()},
    {headers: {'Cache-Control': 'no-store'}},
  );
}

export async function action({request, context}: Route.ActionArgs) {
  const selection = readJerseySelection(await request.formData());
  const {product} = await context.storefront.query(JERSEY_QUERY, {
    variables: {handle: JERSEY_HANDLE},
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
  const variant = product.variants.nodes.find((item) =>
    matchesJerseyVariant(item.selectedOptions, selection),
  );
  if (!variant?.availableForSale) {
    return data(
      {
        error: 'This combination is unavailable. Please choose another.',
        preview: null,
        added: false,
      },
      {status: 400},
    );
  }
  const result = await context.cart.addLines([
    {
      merchandiseId: variant.id,
      quantity: 1,
      attributes: jerseyAttributes(selection),
    },
  ]);
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
  query JerseyPreorder($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      startsAt: metafield(namespace: "preorder", key: "starts_at") { value }
      shippingEstimate: metafield(namespace: "preorder", key: "shipping_estimate") { value }
      images(first: 10) { nodes { id url altText width height } }
      variants(first: 100) {
        nodes {
          id
          availableForSale
          selectedOptions { name value }
          price { amount currencyCode }
          image { id url altText width height }
        }
      }
    }
  }
` as const;
