import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  storefrontRedirect,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // Merged with Hydrogen's defaults. Needed for our brand assets:
    // - Google Fonts stylesheet (googleapis) + font files (gstatic)
    // - editorial imagery, which comes from cdn.shopify.com. (poreldeporte.com
    //   stays listed but is now just 'self' — before the domain cutover these
    //   images were addressed as poreldeporte.com/cdn/shop/files/…, a path only
    //   the old themed store served. It 404s on Oxygen, so they were rewritten
    //   to their real cdn.shopify.com/s/files/… URLs.)
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    // In production Vite/Oxygen rewrites the self-hosted Flapjack @font-face URL
    // to cdn.shopify.com, so it must be allowed here or the browser blocks the
    // font (CSP violation) and falls back to the serif.
    fontSrc: [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
      'https://cdn.shopify.com',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://poreldeporte.com',
      // The pixel's no-JS fallback and its tracking beacons are <img> requests.
      'https://www.facebook.com',
    ],
    // The Morning Footy clip is served from cdn.shopify.com. Without an explicit
    // media-src the browser falls back to default-src and blocks it, which is
    // the same trap the Flapjack font fell into above — and a blocked <video>
    // fails silently, showing a poster that never plays.
    mediaSrc: ["'self'", 'https://cdn.shopify.com'],
    // The Meta pixel loads fbevents.js from connect.facebook.net and then beacons
    // to facebook.com/tr. Both hosts have to be named: a blocked pixel fails
    // silently, so it would look installed and collect nothing.
    // No 'unsafe-inline' here on purpose: that would defeat the nonce Hydrogen
    // generates for every inline script. fbevents.js is allowed by host, and the
    // tag we inject carries the nonce.
    scriptSrc: ["'self'", 'https://cdn.shopify.com', 'https://connect.facebook.net'],
    connectSrc: [
      "'self'",
      'https://monorail-edge.shopifysvc.com',
      'https://connect.facebook.net',
      'https://www.facebook.com',
    ],
    // fbevents.js does not always beacon with an image. Once an event carries
    // enough payload — a product view with ids, value, currency and the
    // microdata it scrapes — it switches to an iframe transport instead. With
    // no frame-src that falls through to default-src, which does not list
    // facebook.com, so the frame is blocked and the event is lost.
    //
    // This is why the bug looked so strange: the homepage's tiny PageView went
    // out fine as an image while every product page silently sent nothing.
    frameSrc: ["'self'", 'https://www.facebook.com'],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  const response = new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });

  // On a 404, fall back to Shopify's admin URL Redirects (Settings → Navigation)
  // so legacy online-store links and backlinks 301 to the new storefront instead
  // of dead-ending — important when migrating an existing store.
  return storefrontRedirect({
    request,
    response,
    storefront: context.storefront,
  });
}
