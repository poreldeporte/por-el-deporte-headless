import {useEffect, useRef} from 'react';
import {AnalyticsEvent, useAnalytics, useNonce} from '@shopify/hydrogen';

/**
 * Meta (Facebook) pixel for the Hydrogen storefront.
 *
 * The Facebook & Instagram sales channel installs a pixel on the *online store*
 * theme. This site is not that store, so nothing was firing here: no
 * ViewContent, no AddToCart, and therefore no retargeting audience and no way
 * for Meta to optimise a campaign for anything but clicks.
 *
 * Purchases are a separate matter and are already covered: checkout is
 * Shopify-hosted even though the storefront is not, so the channel's own
 * integration reports them. What was missing is everything a shopper does
 * before they reach checkout, which is exactly what ads need.
 *
 * CONSENT
 * Gated on `canTrack()`, which Hydrogen wires to Shopify's Customer Privacy
 * API. Nothing loads until that returns true, so a visitor who has not
 * consented never contacts Meta at all — the script is not fetched, rather than
 * fetched and told to behave.
 *
 * NO PIXEL ID, NO PIXEL
 * If PUBLIC_META_PIXEL_ID is unset the component renders nothing and subscribes
 * to nothing. That is the state on a fresh clone, and it must stay silent
 * rather than logging or half-initialising.
 */

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      push?: unknown;
      loaded?: boolean;
      version?: string;
    };
    _fbq?: unknown;
  }
}

/**
 * Meta wants the bare numeric id. Shopify hands out gids like
 * `gid://shopify/ProductVariant/45678`, and sending that whole string means the
 * event never matches a catalogue item, which silently breaks dynamic ads while
 * every event still shows up as "received" in Events Manager.
 */
function numericId(gid?: string | null): string | undefined {
  if (!gid) return undefined;
  const last = String(gid).split('/').pop();
  return last && /^\d+$/.test(last) ? last : undefined;
}

type CartLineish = {
  merchandise?: {id?: string; product?: {id?: string; title?: string}};
  quantity?: number;
  cost?: {totalAmount?: {amount?: string; currencyCode?: string}};
};

export function MetaPixel({pixelId}: {pixelId?: string}) {
  const {subscribe, canTrack, register} = useAnalytics();
  const nonce = useNonce();
  // Hydrogen holds back events until every registered listener reports ready,
  // so the very first page view is not lost to a race with the script.
  const {ready} = register('MetaPixel');
  const loaded = useRef(false);

  useEffect(() => {
    if (!pixelId) return;

    const track = (event: string, data?: Record<string, unknown>) => {
      if (!canTrack()) return;
      if (!window.fbq) return;
      window.fbq('track', event, data);
    };

    /** Injects fbevents.js the first time we are allowed to track, never before. */
    const boot = () => {
      if (loaded.current || !canTrack()) return false;
      loaded.current = true;

      // Meta's standard snippet, written out rather than eval'd from a string so
      // it carries the CSP nonce.
      const f = window;
      if (!f.fbq) {
        const n: any = function (...args: unknown[]) {
          n.callMethod ? n.callMethod.apply(n, args) : n.queue!.push(args);
        };
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        f.fbq = n;
        f._fbq = n;

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        if (nonce) script.setAttribute('nonce', nonce);
        document.head.appendChild(script);
      }
      window.fbq!('init', pixelId);
      return true;
    };

    subscribe(AnalyticsEvent.PAGE_VIEWED, () => {
      boot();
      track('PageView');
    });

    subscribe(AnalyticsEvent.PRODUCT_VIEWED, (payload: any) => {
      if (!boot() && !loaded.current) return;
      const product = payload?.products?.[0];
      if (!product) return;
      track('ViewContent', {
        content_type: 'product',
        content_ids: [numericId(product.variantId) ?? numericId(product.id)].filter(Boolean),
        content_name: product.title,
        value: Number(product.price) || undefined,
        currency: product.currency ?? payload?.shop?.currency,
      });
    });

    subscribe(AnalyticsEvent.PRODUCT_ADD_TO_CART, (payload: any) => {
      if (!boot() && !loaded.current) return;
      // currentLine is the line that was just added, which is what Meta wants —
      // not the whole cart, which would inflate AddToCart value on every add.
      const line: CartLineish | undefined = payload?.currentLine;
      const id =
        numericId(line?.merchandise?.id) ?? numericId(line?.merchandise?.product?.id);
      if (!id) return;
      track('AddToCart', {
        content_type: 'product',
        content_ids: [id],
        content_name: line?.merchandise?.product?.title,
        value: Number(line?.cost?.totalAmount?.amount) || undefined,
        currency: line?.cost?.totalAmount?.currencyCode,
        contents: [{id, quantity: line?.quantity ?? 1}],
      });
    });

    subscribe(AnalyticsEvent.SEARCH_VIEWED, (payload: any) => {
      if (!boot() && !loaded.current) return;
      track('Search', {search_string: payload?.searchTerm});
    });

    ready();
  }, [pixelId, subscribe, canTrack, register, ready, nonce]);

  return null;
}

/**
 * Fired from the checkout button rather than from a cart view, because someone
 * opening the drawer to look at it has not begun checking out, and counting
 * that as InitiateCheckout makes the funnel look far healthier than it is.
 */
export function trackInitiateCheckout(value?: string, currency?: string) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'InitiateCheckout', {
    value: Number(value) || undefined,
    currency,
  });
}
