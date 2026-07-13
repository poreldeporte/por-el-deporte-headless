import {redirect} from 'react-router';
import type {Route} from './+types/collections.all';

/**
 * The automatic /collections/all surface is a stock, unbranded duplicate of the
 * real Shop. The site's "Shop" everywhere points at the curated
 * /collections/all-products (rendered by the branded ShopPage), so redirect
 * here to that single canonical shopping surface.
 */
export async function loader(_args: Route.LoaderArgs) {
  throw redirect('/collections/all-products');
}

export default function CollectionsAll() {
  return null;
}
