import {useEffect} from 'react';
import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import pelTokens from '~/styles/pel-tokens.css?url';
import pelCart from '~/styles/pel-cart.css?url';
import pelChrome from '~/styles/pel-chrome.css?url';
import homeStyles from '~/styles/home.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';
import {MetaPixel} from '~/components/MetaPixel';
import {HERO_SRC, HERO_SRCSET} from '~/lib/hero';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..900&family=Montserrat:wght@500;600;700;800&display=swap';

export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    // The brand display face is served from our own origin and was never
    // preloaded, so the headline swapped in late on every page. It is the one
    // font above the fold, so it goes first.
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: '/fonts/TAYFlapjack.woff2',
      crossOrigin: 'anonymous',
    },
    // Google Fonts is a render-blocking stylesheet on a third-party origin.
    // Loading it as `print` keeps it off the critical path; Layout flips it to
    // `all` once mounted, and the <noscript> there covers scripting being off.
    // Both families declare display=swap, so text is never invisible.
    //
    // The flip lives in an effect rather than an onLoad attribute here. React
    // requires event handlers to be functions, and links() entries are
    // serialised to HTML, so the `onLoad: "this.media='all'"` string this used
    // to carry was dropped from the SSR output and then threw invariant 231 on
    // hydration — which downgraded every page to a full client-side re-render.
    {
      rel: 'stylesheet',
      href: GOOGLE_FONTS_HREF,
      media: 'print',
    },
    // Icons are real files in public/ (served from the storefront origin), not
    // bundled assets, so /favicon.ico resolves for the crawlers and older
    // browsers that request that exact path and never read <link>.
    {rel: 'icon', href: '/favicon.ico', sizes: '48x48'},
    {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icon-32.png'},
    {rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icon-16.png'},
    // iOS ignores SVG and multi-size .ico — it wants one opaque 180x180 PNG.
    {rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'},
    {rel: 'manifest', href: '/manifest.json'},
    // Preload the homepage hero. It's the LCP element and the browser otherwise
    // only discovers it after parsing the document; `imageSrcSet`/`imageSizes`
    // must mirror the <img> exactly or the preload fetches a second file.
    // `fetchPriority` is on the tag too — this just moves the discovery earlier.
    {
      rel: 'preload',
      as: 'image',
      href: `${HERO_SRC}&width=1600`,
      imageSrcSet: HERO_SRCSET,
      imageSizes: '100vw',
      fetchPriority: 'high',
    },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    origin: new URL(args.request.url).origin,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    // Google Search Console's HTML-tag verification. Kept in an env var so
    // claiming the property is a config change in Oxygen, not a code change —
    // and so the token isn't committed to a public repo. See docs/GOOGLE_SETUP.md.
    googleSiteVerification: env.PUBLIC_GOOGLE_SITE_VERIFICATION,
    // Undefined until PUBLIC_META_PIXEL_ID is set, and MetaPixel renders
    // nothing in that state rather than half-initialising.
    metaPixelId: env.PUBLIC_META_PIXEL_ID,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  // Promote the deferred Google Fonts stylesheet from `print` to `all`. It is
  // fetched off the critical path (see links()) and only needs to start
  // applying once we are on the client.
  useEffect(() => {
    document
      .querySelectorAll<HTMLLinkElement>('link[media="print"][rel="stylesheet"]')
      .forEach((link) => {
        if (link.href.startsWith('https://fonts.googleapis.com/')) {
          link.media = 'all';
        }
      });
  }, []);
  // Read from root loader data rather than a meta() export: in React Router v7
  // the deepest matched route's meta() replaces its parents', so a root-level
  // meta tag would vanish on every page that defines its own. Optional-chained
  // because Layout also renders the error boundary, where there is no data.
  const googleSiteVerification = useRouteLoaderData<RootLoader>('root')
    ?.googleSiteVerification;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#F7F0DE" />
        {googleSiteVerification ? (
          <meta
            name="google-site-verification"
            content={googleSiteVerification}
          />
        ) : null}
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <link rel="stylesheet" href={pelTokens}></link>
        <link rel="stylesheet" href={pelChrome}></link>
        <link rel="stylesheet" href={homeStyles}></link>
        <link rel="stylesheet" href={pelCart}></link>
        <Meta />
        <Links />
        <noscript>
          <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
        </noscript>
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <MetaPixel pixelId={data.metaPixelId} />
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorStatus = 500;
  // Routes that throw a Response with a helpful sentence had it discarded in
  // favour of the generic copy — an expired /cart/<lines> share link throws
  // "Link may be expired. Try checking the URL." and the customer saw
  // "Something went wrong" instead.
  let detail: string | null = null;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    // Only for non-404s. The catch-all route throws the pathname as its data
    // ("/nope not found"), so surfacing 404 data replaced friendly copy with a
    // raw technical string — worse than what it fixed.
    if (
      error.status !== 404 &&
      typeof error.data === 'string' &&
      error.data.trim()
    ) {
      detail = error.data.trim();
    }
  }

  const is404 = errorStatus === 404;

  return (
    <div className="pel-error">
      {/* Error routes have no meta() of their own, and root deliberately doesn't
          export one (in React Router v7 a parent's meta() is replaced by the
          deepest match, so a root-level title would vanish everywhere). Without
          these the browser tab showed the raw URL and the page had no title or
          robots directive at all. Rendered here rather than via <Meta /> because
          the boundary replaces the route tree. */}
      <title>
        {is404
          ? 'Page not found | Por El Deporte'
          : 'Something went wrong | Por El Deporte'}
      </title>
      <meta name="robots" content="noindex, follow" />
      <a href="/" className="pel-error__logo" aria-label="Por El Deporte home">
        Por El Deporte
      </a>
      <div className="pel-error__code">{errorStatus}</div>
      <h1 className="pel-error__title">
        {is404 ? 'Off the pitch' : 'Something went wrong'}
      </h1>
      <p className="pel-error__msg">
        {detail ??
          (is404
            ? 'We could not find that page. The shop is right here.'
            : 'An unexpected error occurred. Try again in a moment, or head back home.')}
      </p>
      <div className="pel-error__cta">
        <a href="/" className="pel-error__btn">
          Back home
        </a>
        <a href="/collections/all-products" className="pel-error__btn pel-error__btn--ghost">
          Shop all gear
        </a>
      </div>
    </div>
  );
}
