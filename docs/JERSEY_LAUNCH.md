# Club jersey preorder

Review route: `/products/club-jersey`. This branch is for review; it has not been
deployed. The existing product pages are unchanged.

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

Create a product with handle `club-jersey` and these exact option names/values:

| Option | Values                           |
| ------ | -------------------------------- |
| Color  | `Home (Orange)`, `Away (Black)`  |
| Size   | `M`, `L`, `XL`, `XXL`            |
| Kit    | `Jersey only`, `Jersey + shorts` |

The 16 variants cost **$70 USD** for a jersey and **$85 USD** with shorts.
Shorts use the jersey size. Configure inventory/continue-selling intentionally
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

## Approval and final validation

Before go-live: obtain official home/away photos, confirm supplier print limits
and same-size shorts, prepare the 16 real variants, agree the launch timestamp,
and confirm shipping language. Verify one real personalized selection through
cart and Shopify checkout without placing a paid order. Remove `noindex` when
the launch is approved, add approved navigation/promotion, then deploy the exact
approved revision. No Shopify catalog writes or production deployment have been
performed for this preview.
