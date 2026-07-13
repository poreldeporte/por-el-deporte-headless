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
      {layout === 'aside' && cartHasItems ? (
        <CartProgress
          subtotal={Number(cart?.cost?.subtotalAmount?.amount ?? 0)}
        />
      ) : null}
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

const CART_MILESTONES = [
  {at: 75, off: '5%'},
  {at: 150, off: '10%'},
  {at: 225, off: '15%'},
  {at: 300, off: '20%'},
  {at: 400, off: '25%'},
];

/** Free-shipping / spend-more discount progress bar shown atop the cart drawer. */
function CartProgress({subtotal}: {subtotal: number}) {
  const last = CART_MILESTONES[CART_MILESTONES.length - 1].at;
  const pct = Math.min(100, (subtotal / last) * 100);
  const next = CART_MILESTONES.find((m) => m.at > subtotal);
  const away = next ? Math.ceil(next.at - subtotal) : 0;
  return (
    <div className="pel-cartprog">
      <div className="pel-cartprog__line">
        {next
          ? `You are $${away} away from getting ${next.off} off!`
          : 'You unlocked 25% off your order!'}
      </div>
      <div className="pel-cartprog__bar">
        <div className="pel-cartprog__fill" style={{width: `${pct}%`}} />
        <div className="pel-cartprog__dots">
          {CART_MILESTONES.map((m) => (
            <div
              key={m.at}
              className={`pel-cartprog__dot${subtotal >= m.at ? ' is-hit' : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <path d="M11 4H5a1 1 0 0 0-1 1v6l9 9 7-7-9-9z" />
                <path d="M7.5 8.5h.01" />
              </svg>
              <span>{m.off} off</span>
            </div>
          ))}
        </div>
      </div>
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
        Looks like you haven&rsquo;t added anything yet — let&rsquo;s get you
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
  const messages: string[] = [];
  for (const fetcher of fetchers) {
    const data = fetcher.data as
      | {errors?: CartMsg[]; warnings?: CartMsg[]}
      | undefined;
    for (const item of [...(data?.errors ?? []), ...(data?.warnings ?? [])]) {
      if (item?.message) messages.push(item.message);
    }
  }
  const unique = Array.from(new Set(messages));
  if (!unique.length) return null;
  return (
    <div className="pel-cart-msg" role="alert">
      {unique.map((m) => (
        <p key={m}>{m}</p>
      ))}
    </div>
  );
}
