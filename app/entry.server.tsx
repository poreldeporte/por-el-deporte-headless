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
    // - hero/editorial imagery served from the primary domain poreldeporte.com
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
    ],
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
