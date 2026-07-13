import {useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';

/**
 * Renders the store's brand logo, pulled dynamically from Shopify via the header
 * query (shop.brand.logo) — so swapping the logo in admin updates the site with
 * no deploy. Falls back to the "Por El Deporte" text wordmark when no logo is
 * set. Meant to sit inside an existing <Link to="/">; height is set per
 * placement.
 */
export function PelLogoMark({height = 44}: {height?: number}) {
  const root = useRouteLoaderData<RootLoader>('root');
  const url = root?.header?.shop?.brand?.logo?.image?.url;
  if (!url) return <>Por El Deporte</>;
  return (
    <img
      src={url}
      alt="Por El Deporte"
      className="pel-logo-img"
      style={{height, width: 'auto'}}
      loading="eager"
    />
  );
}
