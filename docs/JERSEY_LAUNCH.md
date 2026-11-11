# Club jersey preorder

Review route: `/products/club-jersey`. This task branch is local review work.
No Shopify catalog import, publication, deployment, or production cart write
has been performed. Keep the release unpublished until merchant approval.

## Buying experience

The page keeps the existing gallery, four release facts, brand fonts/colors,
header/footer, size pills, and product detail cards.

On desktop, the product gallery and four release facts share one sticky container.
They stay aligned while the buying column scrolls and leave the viewport together
at the end of that section. Shorter desktop viewports use tighter card spacing
to keep all four facts visible. Mobile keeps the existing stacked layout.

The “Build your kit” column follows:

1. **Choose your jersey:** four visual style choices with a size for the first jersey.
   “Get Home + Away” offers a $20 saving on both jerseys. Each selected jersey has its
   own card, Edit control, and required size choice. Sizes start unselected.
2. **Complete your kit:** optional matching shorts with a separately chosen
   shorts size, then black/white socks and one-pair/three-pair packs. Selected
   extras appear in the gallery and kit preview; socks photos remain placeholders.
3. **Your name + number:** optional included personalization during launch week.
   Both fields remain visible, and the section states that the same print applies
   to both jerseys in a bundle.

The larger “Build your kit” heading introduces the full builder. Smaller numbered
headings, short explanations and dividers separate its three sections. The
purchase button and shipping note follow, without a receipt above the button.

The two-jersey offer is one **Home + Away** set, with an independent sleeve length
and size for each jersey. Same-color pairs are not bundle choices. Choosing,
editing or removing the other jersey never changes that size. With shorts, the
bundle includes two matching pairs in one separately selected shorts size; the
shorts selector explicitly says that both pairs use that size.

In a set, each style picker shows the two sleeve choices for its own color,
so edits preserve one Home and one Away jersey. Opening or canceling
a picker does not change the order or price. Selecting a second style adds it;
Edit replaces its style and Remove returns to one jersey. Sizes, extras and print
choices survive edits. The second picker shows the incremental price, including
the second shorts pair when selected. The bundle note confirms the jersey saving;
the shorts card owns the shorts charge.

Short sleeves are $70 USD; long sleeves are $80 USD. The merchant authorized
choosing long-sleeve and bundle pricing for review. Home + Away jerseys save $20:

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
summary above the button; the cart owns order review. Changing either jersey
size never changes the other jersey or shorts size. Removing and readding an
extra preserves its size.

Personalization has no switch. Both fields blank means a plain back; entering
either field requires both. The fixed mobile purchase bar uses the same
total/form as desktop. Both buttons use native required-field checks and server
validation. Before a jersey size is selected, the mobile action says “Build your
kit” and moves focus to the builder without submitting. Missing second-jersey,
shorts and socks sizes get explicit prompts. “View your kit” opens a native modal with the selected
jersey/shorts photos, socks, sizes, personalization and total. Close, Escape and
“Continue building” return to the same place; the background is inert while open.
The modal remains visible and closable when the viewport widens beyond mobile.
The bar hides while the cart is open. Option sections explicitly own their padding to avoid
the generic section padding in `reset.css`; the print-to-next-divider gap is
24px. The community floating button is hidden only on this PDP so it cannot
cover buying controls. No size guide has been added.

The official jersey and shorts cutouts are in `public/jersey/cutouts`. The
gallery, four style choices, second-jersey row, and shorts upsell use these
photos. Front/back images follow each selected color and sleeve, including
mixed bundles. Adding shorts switches Front to the matching full-kit photo.
Shorts and Detail views can be browsed without adding shorts to the order.
The photos show sample VIOLA/10 printing, as noted beneath the gallery.
“In action” adds the merchant's orange and black field photos. It follows the
chosen color, shows both photos for a Home + Away set, and remains selected when
changing jerseys. Both photos show short sleeves, stated in the caption even
when a long-sleeve jersey is selected. Shorts shown in the photos remain optional.
Personalization stays in the name/number fields; there is no illustrated Print
view or mobile print preview. Socks still use a placeholder because the supplied
folder contained no socks photos.

The 16 supplied photos had their external white backgrounds removed using the
imagegen edit tool with transparent output. White/cream fabric and printed details
remain opaque. Cutouts were exported with
`cwebp -q 88 -alpha_q 100 -m 6 -resize WIDTH 0` at widths 160, 640, and 1024 for
responsive loading. All exports retain alpha transparency. Image containers
use the store's existing background. Originals remain unchanged in the supplied
`ped-kits/web-product-pictures` folder. File names use
`{home|away}-{short|long}-{front|back|kit}` and `{home|away}-shorts[-detail]`, followed by
the width and `.webp`. `JerseyPhotos.tsx` owns the mapping used by every surface.

The action photos are responsive WebP exports in `public/jersey/action`, at the
same three widths and quality 88. Their scenes and backgrounds are preserved,
with no AI edits. Home uses `orange/andy-orange.jpg`; Away uses
`black/Black Kit Soccer Action Shot.png`, both from the supplied pictures folder.
Originals remain unchanged. The gallery contains the full photo without cropping.

PED socks use visual **Black / White** choices, followed by a pack choice and
Remove once selected. Merchant-confirmed prices are **$10 for one pair** and
**$25 for three pairs**, all in the chosen color. The local preview supports
adding, switching and removing both packs, updates the full total, and includes
the color/pack in the submitted review. Changing a selection hides an outdated
submitted preview until it is reviewed again. The photo cards use the same selected
state as the jerseys; choosing a color adds the socks. Removing socks restores
the one-pair default. No size is invented: the preview marks socks sizing as TBC.
The three-pair price and saving appear before choosing a color. Savings compare
three actual single-pair prices with the pack price, and are shown before selection
only when both colors have the same available offer. After choosing a color, its
own offer applies. Missing prices, mixed currencies and nonpositive savings do
not produce a savings claim.

No published `ped-socks` product was found. Once configured, the UI uses actual
color/pack/size variants and prices; socks resolve to a separate line in the same
cart mutation. Each pack is a priced SKU with cart quantity **1**. A three-pack
must resolve its own $25 SKU rather than adding three $10 singles. Unknown or
out-of-stock combinations fail before the cart write. Size choices appear only
when the product has multiple sizes.

## Local review and verification

Run `npm run dev -- --port 3017` in the task worktree and open
`http://localhost:3017/products/club-jersey`. With no Shopify jersey product,
development shows a marked design preview. Submitting validates the selection
and shows a preview without changing a cart. Production returns 404 until the
real jersey product exists. The route remains `noindex, nofollow`.

Focused domain checks: `node --test tests/jersey.mjs` on Node 24. They cover the
exact seven-day deadline, print normalization/validation, all 400 SKU choices,
mixed-sleeve bundle prices and increments with shorts, independent sizing,
actual-price quotes, currency mismatches, exact sock color/pack/size resolution,
canonical style/size association in either selection order, complete bounded
catalog pagination, and rejection before cart mutation. Blank and partial print
fields also cover
the switch-free flow. Sock-pack savings cover actual prices and unsupported
comparisons. Normal lint,
typecheck, and build commands also apply. Browser review covers desktop/mobile
choice changes, form validation, official photo mapping, and preview submission.

## Shopify catalog setup

The prepared [draft CSV](./club-jersey-draft.csv) contains one product and all
400 variants: 80 single-jersey choices (four styles × four sizes × five shorts
choices) and 320 Home + Away choices (four sleeve pairs × sixteen size pairs × five
shorts choices). It has not been imported. Regenerate it on
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

| Option      | Values                                                                                                                                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Style       | `Home (Orange) / Short sleeve`, `Home (Orange) / Long sleeve`, `Away (Black) / Short sleeve`, `Away (Black) / Long sleeve`, or one Home and one Away style joined by a plus sign with one space on either side, Home first |
| Size        | Singles: `M`, `L`, `XL`, `XXL`. Bundles: two sizes joined by a slash with one space on each side, in canonical Style order (for example `M / XXL`).                                                                        |
| Shorts size | `None`, `M`, `L`, `XL`, `XXL`                                                                                                                                                                                              |

Each offer is a real priced Shopify variant, so checkout needs no client-only
discount or discount app. Style combines color/sleeves/contents while staying
within Shopify's [three-option limit](https://help.shopify.com/en/manual/products/variants/add-variants).
The route loads the 400 variants through cursor pagination, at most two pages
of 250. Missing pages, invalid/repeated cursors, duplicate IDs and overflow fail
explicitly, so an incomplete catalog cannot silently hide size combinations.
Bundle inventory and fulfillment are owned by the bundle SKU; this does not install Shopify Bundles
or synchronize component inventory. This release uses manual preorder
fulfillment. Confirm that the supplier understands each Style and the two
matching shorts pairs. The native Size option
uses the same canonical order as Style. For example, choosing away long in M
first and home short in XXL second still resolves Style
`Home (Orange) / Short sleeve + Away (Black) / Long sleeve` and Size `XXL / M`. Fulfillment attributes
also spell out each style with its individual size.

After approval, import without automatic publishing or overwriting matching
products. Inspect any existing `club-jersey` product before import. Verify draft
status and channel availability afterward; the CSV online-store column does
not control Hydrogen channel publication. Shopify owns actual prices,
availability, cart/checkout image assignments, and IDs. The PDP's official
gallery assets are served by the storefront. Preview prices never reach checkout.
The UI derives savings from those actual prices and suppresses unsupported
currency comparisons.

Create the socks product with handle `ped-socks`, exact native `Color` values
`Black`/`White`, exact `Pack` values `1 pair`/`3 pairs`, and optional `Size` values
matching the confirmed range. Price the packs at $10/$25 respectively. Confirm
sizing before preparing its catalog import. A one-value size is selected
automatically; multiple sizes require a customer choice. Three-pair packs contain
the selected color and size throughout; inventory and fulfillment belong to the
pack SKU.

Create `preorder.starts_at` on the jersey product (date/time with Storefront
access). Set it only to the approved launch instant with an explicit timezone,
e.g. `2026-11-20T12:00:00-05:00`; this example does not schedule a launch. A
missing/invalid timestamp disables ordering. Personalization lasts exactly
7 × 24 hours from launch, after which plain preorders continue. Deadline copy
uses America/New_York; the server checks the deadline again on submission.
Optional `preorder.shipping_estimate` replaces “Shipping date to be confirmed.”

## Personalization and cart

Name/number are optional and included in the variant price. If either is filled,
require both a name up to 14 characters and a 1–2 digit number (0–99, leading zeros
preserved). Names are normalized and uppercased on the server. Confirm print
limits, font, and placement with the supplier; the sample photos are not a
personalized print proof.

The server resolves exact native options before adding quantity 1. Line
attributes carry `Order type: Preorder`, bundle `Includes` with explicit style/size
pairs and the shorts size, and, when selected,
`Name on back` and `Number on back`. The cart shows these properties; Shopify
carries them into checkout and the order. Different personalizations remain
separate lines. Confirm fulfillment reads these properties and does not inherit
automatic Printful fulfillment from the older catalog. Selected socks are a
second real SKU, and all line IDs are validated before one `cart.addLines`.

## Launch review

Before publishing, approve the page/prices and supplied jersey/shorts photos,
provide socks photos, confirm sock sizes and print limits, set up all
variants, agree the launch time, and confirm shipping language. Verify a real
personalized mixed-sleeve kit plus socks through cart and Shopify checkout
without placing a paid order. Verify bundle contents, different jersey sizes
in either style selection order, shorts size, print fields, stock errors, and
checkout price. This integration journey is pending catalog
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
