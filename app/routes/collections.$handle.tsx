import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {Analytics} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ShopPage} from '~/components/shop/ShopPage';
import shopStyles from '~/styles/shop.css?url';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Por El Deporte | ${data?.collection.title ?? 'Shop'}`}];
};

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: shopStyles},
];

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(SHOP_COLLECTION_QUERY, {
      variables: {handle, first: 60},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();

  return (
    <>
      <ShopPage
        title={collection.title}
        image={collection.image?.url}
        products={collection.products.nodes}
      />
      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />
    </>
  );
}

const SHOP_PRODUCT_FRAGMENT = `#graphql
  fragment ShopProduct on Product {
    id
    title
    handle
    productType
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: [], ignoreUnknownOptions: true) {
      id
      availableForSale
    }
  }
` as const;

const SHOP_COLLECTION_QUERY = `#graphql
  ${SHOP_PRODUCT_FRAGMENT}
  query ShopCollection(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        id
        url
        altText
        width
        height
      }
      products(first: $first) {
        nodes {
          ...ShopProduct
        }
      }
    }
  }
` as const;
