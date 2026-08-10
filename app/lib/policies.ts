/**
 * Policy text served by the storefront.
 *
 * Shopify is meant to be the source of truth for these — they live in Settings →
 * Policies and are what `shop.refundPolicy` etc. return. Three of the four are
 * unusable there today:
 *
 *   REFUND_POLICY     a verbatim, byte-for-byte copy of the privacy policy
 *   SHIPPING_POLICY   empty string
 *   TERMS_OF_SERVICE  empty string
 *
 * The refund page told a customer asking about returns how we handle their email
 * address. The other two were worse than blank: the Storefront API omits a policy
 * with an empty body entirely — it returns `null`, not an empty string — so
 * `/policies/shipping-policy` and `/policies/terms-of-service` answered 404, and
 * the policies index listed two entries where there should be four. A storefront
 * that ships worldwide had no reachable shipping policy at all.
 *
 * Writing the real text back into Shopify needs the `write_legal_policies` scope,
 * which the connected app is not granted, so the storefront supplies it instead.
 *
 * This is deliberately self-healing rather than a hard override: as soon as
 * someone pastes real text into Shopify, `resolvePolicyBody` stops substituting
 * and the Shopify copy wins again. Nothing here has to be un-done later.
 *
 * Note this only covers pages the storefront renders. Shopify's own copies (the
 * ones checkout links to, and the ones the Shop and Meta channels show) are
 * still whatever is in the admin — those can only be fixed in Shopify itself.
 */

type PolicyFallback = {title: string; body: string};

export const POLICY_FALLBACKS: Record<string, PolicyFallback> = {
  'refund-policy': {
    title: 'Refund Policy',
    body: `<p>If something isn't right, email us at <a href="mailto:contact@poreldeporte.com">contact@poreldeporte.com</a> and we'll sort it out.</p>
<p><strong>The window.</strong> You can return or exchange an item within 30 days of receiving it.</p>
<p><strong>Condition.</strong> The item needs to come back new and unused, with the original tags and packaging. Some items may be subject to a restocking fee. We'll tell you before you send anything back, never after.</p>
<p><strong>Damaged, defective, or the wrong item.</strong> Email us as soon as you notice, with a photo if you can. We'll replace it or refund you, whichever you'd prefer, and you won't pay return shipping on our mistake.</p>
<p><strong>Refunds.</strong> Once your return arrives and we've checked it over, we refund to your original payment method. Your bank usually takes a few business days to show it.</p>
<p><strong>Return shipping.</strong> Unless the item was damaged, defective, or not what you ordered, return shipping is on you.</p>
<p><strong>How to start one.</strong> Email <a href="mailto:contact@poreldeporte.com">contact@poreldeporte.com</a> with your order number and what you'd like to do. We'll send return instructions. Please don't ship anything back before you hear from us, because we won't know whose it is.</p>`,
  },

  'shipping-policy': {
    title: 'Shipping Policy',
    body: `<p><strong>Free shipping in the United States.</strong> Every U.S. order ships free, no minimum. That's the only domestic rate we charge, so there's nothing to work out at checkout.</p>
<p><strong>International.</strong> We ship worldwide. International rates are quoted live by the carrier at checkout based on where it's going, so you see the exact cost before you pay. Any customs duties or import taxes are the recipient's responsibility, since those are set by your country rather than by us.</p>
<p><strong>Made to order.</strong> Most of our gear is printed for you rather than pulled off a shelf, so there's a production step before anything ships. Once it's printed and packed, it's on its way.</p>
<p><strong>Estimated delivery.</strong> U.S. orders typically arrive within about a week of ordering, production included. International takes longer and varies by destination. These are carrier estimates rather than guarantees, and busy stretches or customs can add time.</p>
<p><strong>Tracking.</strong> You'll get a confirmation when you order and a tracking number as soon as it ships. If tracking hasn't moved in a few days, email <a href="mailto:contact@poreldeporte.com">contact@poreldeporte.com</a> and we'll chase it.</p>
<p><strong>Addresses.</strong> Please double-check your shipping address at checkout. We can usually correct it before an order goes into production, but not after, so email us straight away if you spot a mistake.</p>
<p><strong>Lost or stuck in transit.</strong> Email <a href="mailto:contact@poreldeporte.com">contact@poreldeporte.com</a>. We'll work it out with the carrier and make it right.</p>`,
  },

  'terms-of-service': {
    title: 'Terms of Service',
    body: `<p><strong>Who we are.</strong> This site is operated by Por El Deporte ("we", "us"). By browsing or buying here, you agree to these terms.</p>
<p><strong>Using the site.</strong> You need to be at least the age of majority where you live to place an order, or have a parent or guardian's consent. Don't use the site for anything unlawful, and don't attempt to interfere with it or reach it in ways we haven't offered.</p>
<p><strong>Products, prices, and availability.</strong> We do our best to show colours and details accurately, but screens vary and printed garments have natural variation. Prices are in U.S. dollars and can change without notice. We may limit quantities or decline an order, including after you've placed it, if something is priced wrong, out of stock, or the order looks fraudulent. If we cancel an order you've paid for, we refund it in full.</p>
<p><strong>Orders and payment.</strong> Placing an order is an offer to buy, which we accept by shipping it. Payment is handled by third-party processors; we never see or store your full card details.</p>
<p><strong>Shipping, returns, and refunds.</strong> Covered by our <a href="/policies/shipping-policy">Shipping Policy</a> and <a href="/policies/refund-policy">Refund Policy</a>, which form part of these terms.</p>
<p><strong>Our content.</strong> The Por El Deporte name, crest, designs, photography, and site content belong to us. You're welcome to share and post about the brand. Please don't reproduce our designs commercially or use the crest as your own.</p>
<p><strong>Things you post.</strong> If you send us photos, comments, or ideas, you give us permission to use them. We may edit or remove anything, and we're not obliged to keep it confidential or to pay for it.</p>
<p><strong>Third-party links.</strong> We link out to other sites, including Instagram. We're not responsible for what's on them.</p>
<p><strong>No warranty beyond the law.</strong> The site and everything on it is provided as is. We don't promise it will be uninterrupted or error-free. Nothing here limits any rights you have under consumer protection law that can't be waived.</p>
<p><strong>Limitation of liability.</strong> To the extent the law allows, our liability for any order is limited to what you paid for it.</p>
<p><strong>Governing law.</strong> These terms are governed by the laws of the State of Florida, United States.</p>
<p><strong>Changes.</strong> We may update these terms. The current version always lives on this page, and continuing to use the site means you accept it.</p>
<p><strong>Contact.</strong> <a href="mailto:contact@poreldeporte.com">contact@poreldeporte.com</a></p>`,
  },
};

/**
 * Headings that only ever appear in the privacy policy. The refund policy in
 * Shopify is a copy of it, and a copy is worse than a blank page — a customer
 * reading it comes away believing they were told the return terms. Matching on
 * content rather than on a hardcoded "always override refund-policy" means the
 * substitution disappears by itself the moment the admin copy is corrected.
 */
function looksLikePrivacyPolicy(body: string): boolean {
  return (
    /Information Collection and Use/i.test(body) &&
    /Sharing of Information/i.test(body)
  );
}

export type ResolvedPolicy = {
  id: string;
  handle: string;
  title: string;
  body: string;
};

/**
 * Merge whatever the Storefront API returned with our fallback. `policy` is null
 * for any policy whose body is blank in the admin — the API drops those rather
 * than returning an empty one — so this has to be able to build a whole policy,
 * not just swap a body in.
 *
 * Returns null only when Shopify has nothing and we have no fallback either,
 * which is the genuine 404 case.
 */
export function resolvePolicy(
  handle: string,
  policy?: {id: string; title: string; body: string} | null,
): ResolvedPolicy | null {
  const fallback = POLICY_FALLBACKS[handle];
  const shopCopy = (policy?.body ?? '').trim();

  if (!fallback) {
    return policy && shopCopy
      ? {id: policy.id, handle, title: policy.title, body: shopCopy}
      : null;
  }

  const useShopCopy =
    Boolean(shopCopy) &&
    !(handle !== 'privacy-policy' && looksLikePrivacyPolicy(shopCopy));

  return {
    // Synthesised policies have no Shopify id; the handle is unique and is all
    // the index uses it for.
    id: policy?.id ?? `local:${handle}`,
    handle,
    title: policy?.title ?? fallback.title,
    body: useShopCopy ? shopCopy : fallback.body,
  };
}

/** Handles we can serve even when Shopify returns nothing for them. */
export const FALLBACK_POLICY_HANDLES = Object.keys(POLICY_FALLBACKS);
