# Club jersey preorder

Review route: `/products/club-jersey`. This branch is for review; it has not been
deployed. The existing product pages are unchanged.

The jersey uses the existing PDP layout and stylesheet: product title and price,
gallery thumbnails, release facts, swatches, size pills, and detail cards.
Jersey-specific styles cover the preorder and personalization additions.

The buying flow is color → jersey size → personalization → optional shorts.
Personalization uses a plain/name-and-number choice with full-width name/number
fields. Shorts use a single optional add-on row and a separate size selector.
The desktop gallery stays visible during customization; mobile offers a
collapsible back preview and a fixed total/purchase bar.
On mobile, the title, price, and included-personalization offer come before the
gallery, followed by buying options and then release facts. Both purchase
buttons name the next required choice until the selection is complete. The
summary shows both sizes and the exact name/number before submission, beside
the preorder shipping notice.
Both purchase buttons submit the same form with native required-field checks
and the same server validation. The mobile bar hides while the cart is open.
Size guides are intentionally excluded. Official photography and confirmed
print font/placement remain pending; illustrations are labeled as previews.
The four facts highlight the official club jersey, establishment in Key Biscayne
in 2014, preorder availability, and launch-week name/number personalization.

With no Shopify product, local development renders a clearly labeled preview
using the supplied reference photos and illustrative front/back artwork. The
review button validates the selection and displays a summary without mutating a
cart. Production returns 404 until the real product exists. Reference photos
are only shown in development; replace them with approved official photography
before launch.

For local review, run `npm run dev -- --port 3017` in the task worktree and open
`http://localhost:3017/products/club-jersey`. Focused tests run on Node 24 with
`node --test tests/jersey.mjs`; the normal lint, typecheck, and build commands
also apply. Preview submissions leave the Shopify cart empty.

## Shopify product setup

The prepared [draft catalog CSV](./club-jersey-draft.csv) contains one product
and all 40 variants. It has not been imported into Shopify. It uses the current
[Shopify product CSV columns](https://help.shopify.com/en/manual/products/import-export/using-csv),
with `Status: draft` and `Published on online store: false` on every row. It
omits images and the launch metafield, so importing it does not start the
personalization window. The catalog description and PDP story share the same
copy in `app/lib/jersey.ts`.

Regenerate it from the reviewed choices and prices on Node 24:

```sh
node scripts/jersey-catalog.mjs > docs/club-jersey-draft.csv
```

The generator writes only to stdout; it has no Shopify connection. The CSV
sets fulfillment to manual, tracked inventory to zero, and continue-selling
enabled for preorders. Confirm the actual fulfillment location, shipping
weights, and inventory policy before activation. No reference photos or
illustrative mockups are included in the catalog.

For the approved import, keep automatic publishing and overwriting matching
products disabled. If `club-jersey` already exists, inspect it before importing;
this file is for creating the new draft, not replacing an existing product.
Verify Draft status and channel availability in Shopify after import. The
CSV's online-store column does not manage Hydrogen channel publishing.

The product has handle `club-jersey` and these exact option names/values:

| Option      | Values                              |
| ----------- | ----------------------------------- |
| Color       | `Home (Orange)`, `Away (Black)`     |
| Size        | `M`, `L`, `XL`, `XXL` (jersey size) |
| Shorts size | `None`, `M`, `L`, `XL`, `XXL`       |

The 40 variants cost **$70 USD** when `Shorts size` is `None`, or **$85 USD**
when shorts are included. The Add shorts section shows the $15 difference and
requires an independent shorts size when enabled. Shoppers can pair any jersey
size with any shorts size. Adding shorts initially selects the chosen jersey
size if no shorts size has been chosen. Subsequent jersey changes never
overwrite the shorts size, and removing/readding shorts preserves its selection.
Both sizes belong to the actual Shopify variant and
appear as selected options in cart, checkout, and the order; shorts size is not
just a fulfillment note. The UI reads real prices from Shopify once configured.

Configure inventory/continue-selling intentionally
for a preorder and publish to the Hydrogen sales channel only after approval.
Assign the right official photo to each variant. Shopify owns actual prices,
availability, images, and variant IDs; preview prices never reach checkout.

Create product metafield `preorder.starts_at` (date and time, Storefront access
enabled). Set it to the agreed launch instant with an explicit timezone, e.g.
`2026-11-20T12:00:00-05:00`. The example is not a scheduled launch. A missing or
invalid launch timestamp keeps ordering disabled. Personalization is available
from this instant until exactly 7 × 24 hours later; afterward plain jerseys
remain orderable. Deadline text uses America/New_York. Both browser UI and
server action check the deadline, with the server authoritative on submission.

Optional `preorder.shipping_estimate` (single line text, Storefront access
enabled) replaces “Shipping date to be confirmed.” No shipping date is invented.

## Personalization

Personalization is optional and included in the selected variant's price. A
personalized jersey requires both a name (up to 14 characters) and a 1–2 digit
number (0–99, leading zero preserved). These are proposed print limits; confirm
them with the supplier before launch. Names are normalized and uppercased on
the server. The front/back artwork is illustrative, not a print proof.

The server resolves the selected variant from Shopify and adds quantity 1 with
line attributes `Order type: Preorder`, `Name on back`, and `Number on back`.
Different personalizations remain separate Shopify lines. The cart drawer/page
shows these attributes; Shopify carries them into checkout and the order.
Confirm that the fulfillment workflow reads order line properties; these new
jerseys must not inherit automatic fulfillment for the older Printful catalog.

## Conversion and measurement

The UI changes are hypotheses about reducing friction, not measured conversion
gains. The mobile audit at 390px found the product title 1,155px down the page,
after the gallery and fact cards. It is now near the top, and the facts follow
the buying options. The offer explicitly distinguishes the seven-day
personalization window from the continuing plain-jersey preorder.

The remaining launch priorities are approved home/away product photography
(including front, back, and shorts) and a credible delivery estimate. Keep
shipping language accurate until the date is confirmed. Baymard's research on
[product page usability](https://baymard.com/research-articles/current-state-ecommerce-product-page-ux)
and [shipping information](https://baymard.com/research-articles/show-shipping-costs-on-product-pages)
informed these priorities; neither source establishes a conversion lift for
this store.

The real jersey product now publishes Hydrogen's `Analytics.ProductView`, which
feeds the existing consent-gated Shopify/Meta integration. Development previews
do not publish jersey product views. No print names or numbers are added to
this event. Hydrogen already derives add-to-cart events from cart changes, so
this page does not send a second manual add-to-cart event.

At launch, verify one product view, one successful add-to-cart, and the existing
checkout/purchase events with consent enabled; confirm declined consent is
respected. Review the funnel from product view → cart → checkout → purchase by
device and traffic source in the existing analytics. Use real launch traffic
to identify drop-off before making further conversion claims or running an
experiment. Real product/cart/checkout event validation remains pending the
Shopify catalog setup.

## Approval and final validation

Before go-live: obtain official home/away photos, confirm supplier print limits,
prepare the 40 real variants, agree the launch timestamp,
and confirm shipping language. Verify one real personalized selection through
cart and Shopify checkout without placing a paid order. Remove `noindex` when
the launch is approved, add approved navigation/promotion, then deploy the exact
approved revision. No Shopify catalog writes or production deployment have been
performed for this preview.
