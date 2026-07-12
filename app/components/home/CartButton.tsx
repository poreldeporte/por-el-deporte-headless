import {Suspense} from 'react';
import {Await, useRouteLoaderData} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import type {RootLoader} from '~/root';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

/**
 * Branded cart control. Reads the (deferred) cart from the root loader, applies
 * optimistic updates so the count moves the instant you add, and opens the cart
 * drawer on click. Two looks: the nav "pill" and the floating "fab".
 */
export function CartButton({variant = 'pill'}: {variant?: 'pill' | 'fab'}) {
  const root = useRouteLoaderData<RootLoader>('root');
  return (
    <Suspense fallback={<CartButtonView variant={variant} count={0} />}>
      <Await resolve={root?.cart} errorElement={<CartButtonView variant={variant} count={0} />}>
        {(cart) => (
          <CartCount
            variant={variant}
            cart={(cart ?? null) as CartApiQueryFragment | null}
          />
        )}
      </Await>
    </Suspense>
  );
}

function CartCount({
  variant,
  cart,
}: {
  variant: 'pill' | 'fab';
  cart: CartApiQueryFragment | null;
}) {
  const optimistic = useOptimisticCart(cart);
  return <CartButtonView variant={variant} count={optimistic?.totalQuantity ?? 0} />;
}

function CartButtonView({
  variant,
  count,
}: {
  variant: 'pill' | 'fab';
  count: number;
}) {
  const {open} = useAside();
  const cartIcon = (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 8h12l-1 11H7z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </svg>
  );

  if (variant === 'fab') {
    return (
      <button
        type="button"
        className="pel-fab"
        aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
        onClick={() => open('cart')}
      >
        {cartIcon}
        <span className="pel-fab__badge">{count}</span>
      </button>
    );
  }

  return (
    <button type="button" className="pel-pill" onClick={() => open('cart')}>
      Cart
      <span className="pel-cart">
        {cartIcon}
        <span className="pel-cart-badge">{count}</span>
      </span>
    </button>
  );
}
