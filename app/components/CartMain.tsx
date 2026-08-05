import {useState} from 'react';
import {useOptimisticCart} from '@shopify/hydrogen';
import {Link, useFetchers} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};
/** Returns a map of all line items and their children. */
function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}
/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  return (
    <section
      className={className}
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
    >
      <CartEmpty hidden={linesCount} layout={layout} />
      <CartMessages />
      {layout === 'aside' && cartHasItems ? <CartShippingNote /> : null}
      <div className="cart-details">
        <p id="cart-lines" className="sr-only">
          Line items
        </p>
        <div>
          <ul aria-labelledby="cart-lines">
            {(cart?.lines?.nodes ?? []).map((line) => {
              // we do not render non-parent lines at the root of the cart
              if (
                'parentRelationship' in line &&
                line.parentRelationship?.parent
              ) {
                return null;
              }
              return (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  childrenMap={childrenMap}
                />
              );
            })}
          </ul>
        </div>
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </section>
  );
}

/**
 * The drawer used to show a spend ladder here — "You are $27 away from getting
 * 5% off!" over 5/10/15/20/25% tiers at $75/$150/$225/$300/$400.
 *
 * None of those discounts exist. The store has exactly one automatic discount
 * and it is free shipping; every percentage discount in the account is a
 * one-off code, almost all expired. So the bar was telling customers that
 * spending another $27 would earn them 5% off, in the checkout path, and it
 * never would. That's a worse promise than a fake review — money moves on it.
 *
 * Replaced with the thing that is actually true and automatic. If real spend
 * tiers get set up in Shopify later, this is where the bar goes back, driven by
 * the discount data rather than a hardcoded list.
 */
function CartShippingNote() {
  return (
    <div className="pel-cartnote">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
        <circle cx="7" cy="17.5" r="1.6" />
        <circle cx="17" cy="17.5" r="1.6" />
      </svg>
      <span>Free shipping on U.S. orders, no minimum.</span>
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div className="pel-cart-empty" hidden={hidden}>
      <div className="pel-cart-empty__icon" aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M6 8h12l-1 11H7z" />
          <path d="M9 8V7a3 3 0 0 1 6 0v1" />
        </svg>
      </div>
      <p className="pel-cart-empty__title">Your cart is empty</p>
      <p className="pel-cart-empty__sub">
        Nothing in here yet. Let&rsquo;s get you
        kitted out.
      </p>
      <Link
        to="/collections/all-products"
        onClick={close}
        prefetch="viewport"
        className="pel-cart-empty__cta"
      >
        Shop all gear
      </Link>
    </div>
  );
}

type CartMsg = {message?: string | null};

/**
 * Surfaces cart mutation errors and warnings that the cart action returns
 * ({errors, warnings}) but that were previously swallowed — e.g. an item that
 * sold out mid-session, a quantity Shopify had to adjust, or an invalid
 * discount code. Reads them off the active cart fetchers.
 */
function CartMessages() {
  const fetchers = useFetchers();
  // The cart drawer stays mounted for the whole session, so fetcher.data (and
  // its errors/warnings) persists after a problem is resolved. Track dismissed
  // messages so a resolved issue can be cleared and doesn't nag on every reopen.
  const [dismissed, setDismissed] = useState<string[]>([]);
  const messages: string[] = [];
  for (const fetcher of fetchers) {
    const data = fetcher.data as
      | {errors?: CartMsg[]; warnings?: CartMsg[]}
      | undefined;
    for (const item of [...(data?.errors ?? []), ...(data?.warnings ?? [])]) {
      if (item?.message) messages.push(item.message);
    }
  }
  const visible = Array.from(new Set(messages)).filter(
    (m) => !dismissed.includes(m),
  );
  if (!visible.length) return null;
  return (
    <div className="pel-cart-msg" role="alert">
      {visible.map((m) => (
        <p key={m}>
          <span>{m}</span>
          <button
            type="button"
            className="pel-cart-msg__close"
            aria-label="Dismiss message"
            onClick={() => setDismissed((d) => [...d, m])}
          >
            ×
          </button>
        </p>
      ))}
    </div>
  );
}
