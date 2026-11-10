# Club jersey preorder

Review route: `/products/club-jersey`. This task branch is local review work.
No Shopify catalog import, publication, deployment, or production cart write
has been performed. Keep the release unpublished until merchant approval.

## Buying experience

The page keeps the existing gallery, four release facts, brand fonts/colors,
header/footer, size pills, and product detail cards. The buying column follows:

1. One jersey or two jerseys, with the bundle price and saving visible first.
2. Home/orange or away/black, then short or long sleeves for each jersey.
3. Optional matching shorts, then jersey size and independent shorts size.
4. Optional included name/number during launch week.
5. Optional black/white PED socks, then the purchase button and shipping note.

The two-jersey offer mixes any two **different** styles, including short and
long sleeves of the same color. It is one player's bundle: the jersey size and
personalization apply to both jerseys. With shorts, it includes two matching
pairs in one separately selected shorts size. Duplicate styles are excluded;
changing color selects the other sleeve when necessary to keep the styles
different. In the single-jersey flow, changing color/sleeves recommends the
opposite color in the same sleeves for the bundle. Switching between one and
two jerseys otherwise preserves the chosen second style.

Short sleeves are $70 USD; long sleeves are $80 USD. The merchant authorized
choosing long-sleeve and bundle pricing for review. Two jerseys save $20:

| Jerseys              | Without shorts | With matching shorts |
| -------------------- | -------------: | -------------------: |
| One short sleeve     |            $70 |                  $85 |
| One long sleeve      |            $80 |                  $95 |
| Two short sleeves    |           $120 |                 $150 |
| One short + one long |           $130 |                 $160 |
| Two long sleeves     |           $140 |                 $170 |

Shorts are a $35-per-pair value, offered for $15 per jersey. The two-jersey
upgrade adds two pairs for $30, saving $40 on shorts. The jersey bundle saving
and shorts saving refer to separate comparisons. The price at the title and
purchase button always includes the selected extras. There is no receipt-style
summary above the button; the cart owns order review. Required sizes start
unselected, and changing jersey size never changes shorts size. Removing and
readding an extra preserves its size.

The personalization switch starts on. Turning it off hides print fields while
preserving entered text. A mobile back preview shows the selected color/sleeves,
and the fixed mobile purchase bar uses the same total/form as desktop. Both
buttons use native required-field checks and server validation. The bar hides
while the cart is open. Option sections explicitly own their padding to avoid
the generic section padding in `reset.css`; the print-to-next-divider gap is
24px. No size guide has been added.

Shorts and socks use photo placeholders until official images arrive. Jersey
front/back drawings distinguish long and short sleeves and remain labeled as
illustrations. Supplied reference photos are development-only.

PED socks use direct **No socks / Black / White** choices, with no extra Add
step. Socks price and sizes are still unconfirmed, and no published `ped-socks`
product was found. Unconfigured colors are disabled in the preview, keeping
the jersey total usable. No free or guessed sock price is charged. Once the
product exists, the UI uses its actual color/size variants and prices; socks
resolve to a separate line in the same cart mutation. Unknown/out-of-stock
combinations fail before the cart write. Size choices are shown only if needed.

## Local review and verification

Run `npm run dev -- --port 3017` in the task worktree and open
`http://localhost:3017/products/club-jersey`. With no Shopify jersey product,
development shows a marked design preview. Submitting validates the selection
and shows a preview without changing a cart. Production returns 404 until the
real jersey product exists. The route remains `noindex, nofollow`.

Focused domain checks: `node --test tests/jersey.mjs` on Node 24. They cover the
exact seven-day deadline, print normalization/validation, all 200 SKU choices,
mixed-sleeve bundle prices, independent sizing, actual-price quotes, currency
mismatches, sock resolution, and rejection before cart mutation. Normal lint,
typecheck, and build commands also apply. Browser review covers desktop/mobile
choice changes, form validation, illustrated sleeves, and preview submission.

## Shopify catalog setup

The prepared [draft CSV](./club-jersey-draft.csv) contains one product and all
200 variants: four single styles plus six two-style combinations, four jersey
sizes, and five shorts choices. It has not been imported. Regenerate it on
Node 24 with:

```sh
node scripts/jersey-catalog.mjs > docs/club-jersey-draft.csv
```

The generator writes only to stdout and never connects to Shopify. Description
copy and price seeds live in `app/lib/jersey.ts`. It uses the current
[Shopify CSV columns](https://help.shopify.com/en/manual/products/import-export/using-csv).
Every row is draft and unpublished. Images and launch time are omitted, so the
file does not start the personalization window. Inventory is tracked at zero
with continue-selling enabled and manual fulfillment. Confirm location,
shipping weights, and preorder inventory policy before activation.

Handle: `club-jersey`. Exact native option names:

| Option      | Values                                                                                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Style       | `Home (Orange) / Short sleeve`, `Home (Orange) / Long sleeve`, `Away (Black) / Short sleeve`, `Away (Black) / Long sleeve`, or two of these joined by a plus sign with one space on either side, in that canonical order |
| Size        | `M`, `L`, `XL`, `XXL`                                                                                                                                                                                                    |
| Shorts size | `None`, `M`, `L`, `XL`, `XXL`                                                                                                                                                                                            |

Each offer is a real priced Shopify variant, so checkout needs no client-only
discount or discount app. Style combines color/sleeves/contents while staying
within Shopify's [three-option limit](https://help.shopify.com/en/manual/products/variants/add-variants).
The route requests up to 250 variants to include all 200. Bundle inventory and
fulfillment are owned by the bundle SKU; this does not install Shopify Bundles
or synchronize component inventory. This release uses manual preorder
fulfillment. Confirm that the supplier understands each Style and the two
matching shorts pairs, including same-color bundles.

After approval, import without automatic publishing or overwriting matching
products. Inspect any existing `club-jersey` product before import. Verify draft
status and channel availability afterward; the CSV online-store column does
not control Hydrogen channel publication. Shopify owns actual prices,
availability, image assignments, and IDs. Preview prices never reach checkout.
The UI derives savings from those actual prices and suppresses unsupported
currency comparisons.

Create the socks product with handle `ped-socks`, exact native `Color` values
`Black`/`White`, and optional `Size` values matching the confirmed range. No sock
catalog file is prepared until price/sizing are supplied. A one-value size is
selected automatically; multiple sizes require a customer choice.

Create `preorder.starts_at` on the jersey product (date/time with Storefront
access). Set it only to the approved launch instant with an explicit timezone,
e.g. `2026-11-20T12:00:00-05:00`; this example does not schedule a launch. A
missing/invalid timestamp disables ordering. Personalization lasts exactly
7 × 24 hours from launch, after which plain preorders continue. Deadline copy
uses America/New_York; the server checks the deadline again on submission.
Optional `preorder.shipping_estimate` replaces “Shipping date to be confirmed.”

## Personalization and cart

Name/number are optional and included in the variant price. If enabled, require
both a name up to 14 characters and a 1–2 digit number (0–99, leading zeros
preserved). Names are normalized and uppercased on the server. Confirm print
limits, font, and placement with the supplier; artwork is not a print proof.

The server resolves exact native options before adding quantity 1. Line
attributes carry `Order type: Preorder`, bundle `Includes`, and, when selected,
`Name on back` and `Number on back`. The cart shows these properties; Shopify
carries them into checkout and the order. Different personalizations remain
separate lines. Confirm fulfillment reads these properties and does not inherit
automatic Printful fulfillment from the older catalog. Selected socks are a
second real SKU, and all line IDs are validated before one `cart.addLines`.

## Launch review

Before publishing, approve the page/prices, provide official photos of all four
jerseys/shorts/socks, confirm sock price/sizes and print limits, set up all
variants, agree the launch time, and confirm shipping language. Verify a real
personalized mixed-sleeve kit plus socks through cart and Shopify checkout
without placing a paid order. Verify bundle contents, both sizes, print fields,
stock errors, and checkout price. This integration journey is pending catalog
setup; preview submission does not prove real checkout.

The real product emits Hydrogen's consent-gated `Analytics.ProductView` via the
existing Shopify/Meta integration. Previews emit no jersey product view, and
print names/numbers are not analytics fields. Existing cart analytics owns
add-to-cart events. Verify consent and cart/checkout/purchase events at launch.
No conversion lift is claimed without live evidence. Review product → cart →
checkout → purchase by device/source after launch. Keep delivery/shipping claims
accurate; verify the footer's existing free-shipping claim before repeating it
beside the CTA.

Only after merchant approval: remove `noindex`, add approved promotion/navigation,
publish the catalog to Hydrogen, and deploy the exact approved revision.
