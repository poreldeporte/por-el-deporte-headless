import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {Money, type OptimisticCart} from '@shopify/hydrogen';
import {useId} from 'react';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

/**
 * The drawer's footer: what it costs, and the way out.
 *
 * The discount-code and gift-card forms that used to live here are gone. They
 * were the skeleton's unstyled inputs sitting directly above the checkout button
 * — two "Apply" buttons competing with the one control that matters, in a panel
 * 320px wide. Shopify's own checkout collects both codes on the payment step, so
 * nothing is lost by asking there instead: a customer with a code still uses it,
 * one screen later, in a field that was built for it.
 *
 * This block is deliberately rendered as a sibling of the scrolling line items
 * rather than inside them, so the total and the button stay pinned to the bottom
 * of the drawer no matter how many items are in the cart. Before, they sat at
 * the end of the scroll area — with three items you had to scroll past the
 * bottom of the list to find out what you owed or how to pay.
 */
export function CartSummary({cart, layout}: CartSummaryProps) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';
  const summaryId = useId();
  const checkoutUrl = cart?.checkoutUrl;

  return (
    <div aria-labelledby={summaryId} className={className}>
      <h4 id={summaryId} className="sr-only">
        Order summary
      </h4>

      {/* Shipping stated here rather than left as a surprise at checkout. It is
          genuinely free for U.S. orders (the domestic zone's only rate is
          $0.00); international is quoted live by the carrier. */}
      <dl className="cart-row cart-row--muted">
        <dt>Shipping</dt>
        <dd>Free in the U.S.</dd>
      </dl>

      <dl className="cart-row cart-row--total">
        <dt>Total</dt>
        <dd>
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost.subtotalAmount} />
          ) : (
            'Calculating'
          )}
        </dd>
      </dl>

      {checkoutUrl ? (
        <a className="cart-checkout" href={checkoutUrl} target="_self">
          Checkout
        </a>
      ) : null}

      <p className="cart-fineprint">
        Taxes and any international shipping are calculated at checkout.
      </p>
    </div>
  );
}
