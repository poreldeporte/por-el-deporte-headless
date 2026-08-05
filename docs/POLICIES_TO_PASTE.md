# Store policies — ready to paste

**Where:** Shopify admin → Settings → Policies. Each section below goes in the
matching field. Paste as plain text; Shopify's editor will keep the headings.

**Have a lawyer read the Terms of Service before you publish it.** The other
three are factual descriptions of how the store already works and are much
lower risk. Everything here is derived from the store's real configuration, not
from a generic template — see the notes under each one.

---

## ⚠️ Fix this first: the Refund Policy is currently the Privacy Policy

`/policies/refund-policy` is live right now and its body is **byte-identical to
the Privacy Policy**. It opens "this Privacy Policy provides important
information about how we handle personal information" and then talks about
cookies and data sharing. A customer clicking "Refund Policy" in the footer gets
a privacy policy.

The only refund terms anywhere in it are one buried paragraph. The replacement
below is built on exactly those stated terms — 30 days, new and unused with tags
and packaging, possible restocking fee, defects replaced or refunded — so it
introduces **no new commitments**, it just says them properly.

---

## 1. Refund policy  → replaces the current (wrong) text

> **Returns and refunds**
>
> If something isn't right, email us at contact@poreldeporte.com and we'll sort
> it out.
>
> **The window.** You can return or exchange an item within 30 days of receiving
> it.
>
> **Condition.** The item needs to come back new and unused, with the original
> tags and packaging. Some items may be subject to a restocking fee — we'll tell
> you before you send anything back, never after.
>
> **Damaged, defective, or wrong item.** Email us as soon as you notice, with a
> photo if you can. We'll replace it or refund you, whichever you'd prefer, and
> you won't pay return shipping on our mistake.
>
> **Refunds.** Once your return arrives and we've checked it over, we refund to
> your original payment method. Your bank usually takes a few business days to
> show it.
>
> **Return shipping.** Unless the item was damaged, defective, or not what you
> ordered, return shipping is on you.
>
> **How to start one.** Email contact@poreldeporte.com with your order number
> and what you'd like to do. We'll send return instructions. Please don't ship
> anything back before you hear from us — we won't know whose it is.

*Source: the "Returns and Refunds" and "Product Issues" paragraphs already
published inside the current policy.*

---

## 2. Shipping policy  → currently empty

> **Shipping**
>
> **Free shipping in the United States.** Every U.S. order ships free, no
> minimum. That's the only domestic rate we charge, so there's nothing to
> calculate at checkout.
>
> **International.** We ship worldwide. International rates are quoted live by
> USPS or DHL Express at checkout, based on where it's going, and you'll see the
> exact cost before you pay. Any customs duties or import taxes are the
> recipient's responsibility — those are set by your country, not by us.
>
> **Made to order.** Most of our gear is printed for you rather than pulled off
> a shelf, so there's a production step before anything ships. Once it's printed
> and packed, it's on its way.
>
> **Estimated delivery.** U.S. orders typically arrive within about a week from
> the day you order, production included. International takes longer and varies
> by destination. These are estimates from the carriers, not guarantees — busy
> stretches and customs can add time.
>
> **Tracking.** You'll get a confirmation when you order and a tracking number
> as soon as it ships. If tracking hasn't moved in a few days, email us at
> contact@poreldeporte.com and we'll chase it.
>
> **Addresses.** Please double-check your shipping address at checkout. We can
> usually correct it before an order goes into production, but not after —
> email us straight away if you spot a mistake.
>
> **Lost or stuck in transit.** Email contact@poreldeporte.com. We'll work it
> out with the carrier and make it right.

*Source: the store's actual delivery profiles — domestic zone has a single
$0.00 "Economy" rate; Rest of World uses live USPS and DHL Express rates. The
"about a week" estimate matches the "On Your Doorstep in 1 Week" claim already
on the site.* **If that week isn't what your real orders do, change both this
and the site marquee — a stated delivery estimate is a commitment.**

---

## 3. Terms of service  → currently empty

> **Terms of service**
>
> **Who we are.** This site is operated by Por El Deporte ("we", "us"). By
> browsing or buying here, you agree to these terms.
>
> **Using the site.** You need to be at least the age of majority where you live
> to place an order, or have a parent or guardian's consent. Don't use the site
> for anything unlawful, and don't attempt to interfere with it or access it in
> ways we haven't offered.
>
> **Products, prices, and availability.** We do our best to show colours and
> details accurately, but screens vary, and printed garments have natural
> variation. Prices are in U.S. dollars and can change without notice. We may
> limit quantities or decline an order — including after you've placed it, if
> something is priced wrong, out of stock, or the order looks fraudulent. If we
> cancel an order you've paid for, we refund it in full.
>
> **Orders and payment.** Placing an order is an offer to buy, which we accept
> by shipping. Payment is processed by third-party providers; we never see or
> store your full card details.
>
> **Shipping, returns, and refunds.** Covered by our Shipping Policy and Refund
> Policy, which form part of these terms.
>
> **Our content.** The Por El Deporte name, crest, designs, photography, and
> site content belong to us. You're welcome to share and post about the brand —
> please don't reproduce our designs commercially or use the crest as your own.
>
> **Things you post.** If you send us reviews, photos, or ideas, you give us
> permission to use them. We may edit or remove anything, and we're not obliged
> to keep it confidential or pay for it.
>
> **Third-party links.** We link to other sites, including Instagram. We're not
> responsible for what's on them.
>
> **No warranty beyond the law.** The site and everything on it is provided as
> is. We don't promise the site will be uninterrupted or error-free. Nothing
> here limits any rights you have under consumer protection law that can't be
> waived.
>
> **Limitation of liability.** To the extent the law allows, our liability for
> any order is limited to what you paid for it.
>
> **Governing law.** These terms are governed by the laws of the State of
> Florida, United States.
>
> **Changes.** We may update these terms. The current version always lives at
> this page, and continuing to use the site means you accept it.
>
> **Contact.** contact@poreldeporte.com

*Standard e-commerce terms, with the Florida governing law and the real support
email filled in. This is the one to have reviewed — it's a contract, and the
liability and governing-law clauses are the parts a lawyer will want to adjust.*

---

## 4. Contact information  → currently empty

> **Contact**
>
> Email us at contact@poreldeporte.com and a person will write back.
>
> Por El Deporte
> Miami, Florida, United States
>
> We're on Instagram at [@poreldeporte](https://www.instagram.com/poreldeporte/)
> — DMs are open too.

*Deliberately does not publish the Miami Shores street address or the phone
number from your Shopify billing settings, since those look personal. Add them
if you want them public.*

---

## After pasting

All four appear automatically at `/policies` and are linked from the footer's
Legal column — the storefront reads them from the Storefront API, so there's no
deploy needed. The Storefront API omits policies with an empty body, which is
why only Privacy and Refund show up today.

Verify with:

```
curl -s https://poreldeporte.com/policies | grep -o 'policies/[a-z-]*'
```

You should see four: `privacy-policy`, `refund-policy`, `shipping-policy`,
`terms-of-service`.
