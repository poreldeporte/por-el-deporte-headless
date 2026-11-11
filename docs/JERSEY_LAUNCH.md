# Club jersey preorder

Product route: `/products/club-jersey`. Publication was approved on November 11,
2026. The existing brand and buying layout are preserved. The release uses
Shopify Oxygen storefront `1000157315` at `https://poreldeporte.com`.

## Storefront discovery

The homepage keeps its existing brand hero and adds a release announcement and
“Build your kit” link. Directly below the hero marquee, a jersey feature shows
Home and Away, the Shopify starting price, the preorder shipping note, and the
included printing offer while the existing personalization window is open.
The hero streams independently of the catalog query. The homepage marquee no
longer promises one-week delivery, which does not apply to these preorders.

The jersey is first in Shopify's manually curated All Products collection
(`268004393007`, handle `all-products`). That collection controls both Shop order
and the homepage product rail. Shorts and socks remain builder add-ons rather
than separate Shop cards. The jersey cards and homepage feature reuse the
compressed, transparent product photos and link to the kit builder.

## Buying experience

The page keeps the existing gallery, four release facts, brand fonts/colors,
header/footer, size pills, and product detail cards.
The main introduction includes players, supporters, and the wider community. A
visible “Jersey design by Sergio Gomez” byline follows, with his name in the
brand’s display font. The shorts option and The Details both mention pockets.

On desktop, the product gallery and four release facts share one sticky container.
They stay aligned while the buying column scrolls and leave the viewport together
at the end of that section. Shorter desktop viewports use tighter card spacing
to keep all four facts visible. Mobile keeps the existing stacked layout.

The “Build your kit” column follows:

1. **Choose your jersey:** four visual style choices, followed by size and optional
   name/number inside the jersey card. The summary stays hidden during style
   selection and appears when the picker collapses. Edit reopens the choices.
   A compact “Add Home/Away” photo row offers the $20 Home + Away saving and
   opens a second jersey card. Each jersey has its own sleeve, size and print.
   Edit sits beneath the selected style. A small red circled × at the second
   card's top-right removes it and remains available while choosing sleeves.
   Its accessible label names the jersey, and its touch target is 44px.
2. **Matching shorts:** one optional add/remove decision. A single jersey adds
   one matching pair for $15; Home + Away adds both matching pairs for $30.
   Each pair has a photo card and independent required size, which collapses to
   a size/price summary with Edit after selection. Sizes are retained by color
   when removing/readding shorts. Removing the second jersey removes its matching
   shorts. Adding it while shorts are selected clearly includes the additional
   pair in the upgrade price and requires its own size.
3. **Socks:** optional Black and White photo rows, each with a quantity control
   starting at zero. Mix colors freely. Single pairs cost $10; every group of
   three saves $5 automatically. One size; no pack or size selector. At two pairs,
   the page offers the next pair for $5. Both colors share one card whose header
   shows the total for all selected pairs, with savings appearing at three pairs.

All three steps use the same heading, divider, card spacing, photo alignment,
body labels and accessible controls. The existing brand and gallery remain.
The price label stays “Your kit total” and the socks header reserves two rows,
so quantity updates do not move the controls. On mobile, selected socks appear
in their builder rows and kit preview; the repeated gallery rows stay desktop-only
to avoid inserting content above the active controls.
The purchase button and shipping note follow, without another order summary.

A two-jersey set always contains one Home and one Away. Each style editor then
shows only its color’s sleeve choices. Adding the second jersey copies the first
print once; both name/number pairs remain visible and independently editable.
Sizes start unselected. Choosing the already-selected style also collapses the
picker. Focus returns to Edit after a selection and to the add row after removal.

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
kit” and moves focus to the builder without submitting. Missing second-jersey
and shorts sizes get explicit prompts. “View your kit” opens a native modal with the selected
jersey/shorts photos, socks, sizes, personalization and total. Close, Escape and
“Continue building” return to the same place; the background is inert while open.
The modal remains visible and closable when the viewport widens beyond mobile.
The bar hides while the cart is open. Option sections explicitly own their padding to avoid
the generic section padding in `reset.css`; the print-to-next-divider gap is
24px. The community floating button is hidden only on this PDP so it cannot
cover buying controls. No size guide has been added.

The official jersey and shorts cutouts are in `app/assets/jersey/cutouts`. The
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
view or mobile print preview.

The 16 supplied photos had their external white backgrounds removed using the
imagegen edit tool with transparent output. White/cream fabric and printed details
remain opaque. The current compressed exports use
`cwebp -q 78 -alpha_q 100 -m 6 -resize WIDTH 0` at widths 160, 320, 640, and 1024.
The extra 320px size keeps small cards and thumbnails from requesting 640px
images on high-density phones. All exports retain alpha transparency. Image containers
use the store's existing background. Originals remain unchanged in the supplied
`ped-kits/web-product-pictures` folder. File names use
`{home|away}-{short|long}-{front|back|kit}` and `{home|away}-shorts[-detail]`, followed by
the width and `.webp`. `JerseyPhotos.tsx` owns the mapping used by every surface.
It imports the files through Vite so each gets a content hash and a direct
Oxygen CDN URL in production. Only the main gallery image loads eagerly with
high priority; closed kit and socks dialogs wait until they are opened.

The action photos are responsive WebP exports in `app/assets/jersey/action`, at the
same four widths and quality 78. Their scenes and backgrounds are preserved,
with no AI edits. Home uses `orange/andy-orange.jpg`; Away uses
`black/Black Kit Soccer Action Shot.png`, both from the supplied pictures folder.
Originals remain unchanged. The gallery contains the full photo without cropping.

The four supplied socks photos are in `app/assets/jersey/socks`, with responsive
160/320/640/1024px WebP exports. The black and white pair photos replace placeholders
in the color choices, selected gallery add-on, and kit preview. “View photos”
opens a native dialog with the pair and logo detail for either color. Browsing
photos does not add socks or change the kit; the dialog starts on the selected
sock color, or black before selection. Close and Escape restore focus to the
trigger. The dialog keeps the existing brand styles and supports desktop/mobile.

Source files supplied from Downloads:

| Asset        | Source file                                     |
| ------------ | ----------------------------------------------- |
| Black pair   | `Black Socks with Orange Island Logos.png`      |
| Black detail | `Black Ribbed Socks Product Detail.png`         |
| White pair   | `ChatGPT Image Nov 11, 2026, 12_25_02 AM-2.png` |
| White detail | `ChatGPT Image Nov 11, 2026, 12_25_02 AM-1.png` |

The built-in imagegen tool removed the exterior background from the two pair
shots, preserving the sock fabric, orange logos, and markings. Prompt for each
color: “Remove only the pale tabletop/background outside the two socks; preserve
both entire socks, their silhouette, orientation, knit texture, fabric color,
orange island logos, and small markings. Keep both socks fully in frame and
return a transparent cutout.” Pair exports preserve alpha; detail photos retain
their original backgrounds and framing. All supplied originals remain unchanged.

PED socks use Black/White quantity controls, bounded to 99 pairs per color per
submission. The server rejects invalid quantities, duplicate/unknown colors,
unavailable variants and incomplete shorts sizes before a single cart write.
Each color resolves to its native `1 pair` SKU with the selected quantity.
Shopify may split a color across lines when allocating its automatic discount.
Each line still identifies the color, quantity and price. The mobile kit
preview and gallery show both selected colors and their quantities.

The native [PED socks — Any 3 for $25](https://admin.shopify.com/store/por-el-deporte/discounts/1328223158319)
rule buys two single pairs and discounts one single pair by $5,
with no per-order maximum, so 3 pairs cost $25, 4 cost $35 and 6 cost $50.
Only Black / 1 pair and White / 1 pair variants qualify in both halves of the
rule. Legacy $25 three-pair SKUs remain available to existing carts and are
excluded from the new discount. The sock and Home + Away rules both allow
product-discount combinations on their separate items, so their savings coexist.
The quote uses actual single-pair prices; the any-three offer is shown only when
both colors have matching USD prices. Shopify owns the actual cart/checkout
allocation and recalculation after quantities or lines change.

## Local review and verification

Run `npm run dev -- --port 3017` in the task worktree and open
`http://localhost:3017/products/club-jersey`. While the Shopify jersey is unpublished,
development shows a marked design preview. Submitting validates the selection
and shows a preview without changing a cart. Production returns 404 until the
real jersey product is available to the Storefront API. The released route uses
the site’s canonical, Open Graph and social metadata.
The footer links directly to the kit builder.

Focused domain checks: `node --test tests/jersey.mjs` on Node 24. They cover the
exact seven-day deadline, print normalization/validation, all 1,168 builder choices
fulfilled by 16 jersey and 8 shorts SKUs, mixed-sleeve bundle prices and increments
with shorts, independent sizing, actual-price quotes, currency mismatches,
exact single-pair color and quantity resolution,
canonical style/size association in either selection order, complete bounded
catalog pagination, and rejection before cart mutation. Blank and partial print
fields also cover the switch-free flow. Mixed-color savings cover repeated
groups of three, actual prices and unsupported comparisons. Legacy open forms
normalize shared shorts sizes and sock packs into the same new model without
changing the customer’s selected contents or price. Normal lint, typecheck,
and build commands also apply. Browser review covers desktop/mobile
choice changes, form validation, official photo mapping, and preview submission.

The November 11 extras update was checked at 320px, 390px and 1440px, including
rapid quantity taps. A real Shopify cart and native checkout showed Home short
sleeve/L ($70), Away long sleeve/M ($60 after the bundle saving), matching shorts
in M and XL ($15 each), and two Black plus one White sock pairs ($25), for a
$185 subtotal. Cart quantity changes confirmed 2/3/4/5/6 sock pairs cost
$20/$25/$35/$45/$50 while retaining the Home + Away discount. No payment or order
was submitted.

## Shopify catalog setup

The [draft CSV](./club-jersey-draft.csv) contains **16 jersey variants**
(four styles × four sizes) and **8 shorts variants** (two colors × four sizes).
Regenerate it on Node 24 with:

```sh
node scripts/jersey-catalog.mjs > docs/club-jersey-draft.csv
```

The generator writes only to stdout. Description and price seeds live in
`app/lib/jersey.ts`; Shopify owns actual prices, availability and variant IDs.
The CSV stays draft, unpublished, manually fulfilled, tracked at zero with
continue-selling enabled. It omits media and the launch timestamp.

Created products:

- [The Club Jersey](https://admin.shopify.com/store/por-el-deporte/products/8544669630511), handle `club-jersey`, 16 variants and 18 supplied images.
- [Club Shorts](https://admin.shopify.com/store/por-el-deporte/products/8544853360687), handle `club-shorts`, eight variants and four supplied images.
- [PED Socks](https://admin.shopify.com/store/por-el-deporte/products/8544670548015), handle `ped-socks`, four variants and four supplied images.

| Jersey option | Values |
| --- | --- |
| Style | `Home (Orange) / Short sleeve`, `Home (Orange) / Long sleeve`, `Away (Black) / Short sleeve`, `Away (Black) / Long sleeve` |
| Size | `M`, `L`, `XL`, `XXL` |

A Home + Away purchase adds **two individual jersey variants** in one cart
mutation. Each line has its own sleeve, jersey size, photo, price and print
properties. Each matching pair of shorts is a separate $15 cart/order line with
its own
color, size and photo. Shopify’s native parent relationship attaches it to the
corresponding jersey and removes it if that jersey is removed. The kit-only
shorts route redirects to the builder. There are no combined bundle SKUs.
Inventory and manual fulfillment belong to each individual variant.

Shopify's automatic Buy X get Y rule [Home + Away — Save $20](https://admin.shopify.com/store/por-el-deporte/discounts/1328073998383) is active: buy one of the eight Home variants, get $20 off one of the eight Away
variants. The two sets must contain only the corresponding color's variants,
not the entire product. No per-order limit; one saving per qualifying pair.
Allow product-discount combinations so the separate PED socks saving can apply; order and shipping combinations remain off. Removing either jersey must
remove the saving. The PDP quotes the same $20 USD offer; Shopify applies and
recalculates the real cart/checkout discount. The cart shows its allocation.

Socks retain native `Color` values `Black`/`White` and `Pack` values `1 pair`/`3 pairs`,
priced at $10/$25. The builder now uses the `1 pair` variants exclusively and
adds each selected color with its real quantity. Existing three-pair cart lines
remain valid and do not receive the single-pair discount. Socks are one size.

[Club jersey preorder shipping profile](https://admin.shopify.com/store/por-el-deporte/settings/shipping/profiles/106888233007)
contains all 28 variants across these three products and is limited to the
manual location and the **United States**.
The free rate is “Preorder — shipping date to be confirmed,” with no transit
estimate. Printful is excluded. Existing products and shipping profiles are
unchanged. Packed weights remain unset; add accurate weights before buying
shipping labels or enabling international shipping.

The `preorder.starts_at` date/time definition exists with Storefront access.
Set it only to the approved launch instant with an explicit timezone,
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

Each jersey has a card containing its style, size, and visible name/number
fields. The compact Home + Away offer opens a second card with the same sleeve
length and copies the first jersey's current print once. Both prints are then
independently editable; leave either pair of fields blank for a plain back.
The second jersey requires its own size selection. The kit preview and cart
keep each print with its jersey. Legacy forms that submit only one name/number
still apply it to both jerseys. Shorts and socks are separate numbered optional steps.

The server resolves all exact native options before a single `cart.addLines`
call. If any selected jersey, shorts or socks are unavailable, it adds nothing.
Each jersey gets `Order type: Preorder` and optional `Name on back` /
`Number on back`. Shorts get their own preorder property and native size/color.
Native variant
options own each jersey's style and size. Shopify carries these into checkout
and the order. Different personalizations remain separate lines. Fulfillment
must read each line's properties. Physical orders remain manually fulfilled.

## Launch review

The merchant approved publication, prices, photos, one-size socks, U.S.-only
shipping and a seven-day personalization window beginning at launch. Tests use
simulated Shopify Payments transactions only; production must have test mode off.

The real product emits Hydrogen's consent-gated `Analytics.ProductView` via the
existing Shopify/Meta integration. Previews emit no jersey product view, and
print names/numbers are not analytics fields. Existing cart analytics owns
add-to-cart events. Verify consent and cart/checkout/purchase events at launch.
No conversion lift is claimed without live evidence. Review product → cart →
checkout → purchase by device/source after launch. Keep delivery/shipping claims
accurate; verify the footer's existing free-shipping claim before repeating it
beside the CTA.

The jersey is Active on the Por El Deporte Hydrogen channel. Shorts and socks
are Unlisted on that channel so the builder owns their discovery. The native
Home + Away discount has no end date. `preorder.starts_at` owns the seven-day
printing cutoff; it is set to the actual launch instant, not the testing window.

Pushes to `main` run lint, typecheck and the financial/cart contracts, then
build and deploy that same revision to Oxygen using the existing repository
secret `OXYGEN_DEPLOYMENT_TOKEN_1000157315` and environment branch `main`. Pull
requests run checks without deploying. The standard public-repository runner
has a 15-minute cap; no paid runner or new hosting plan is introduced.
The deploy command runs `npm run build` after Oxygen supplies
`HYDROGEN_ASSET_BASE_URL`. Do not skip that build: an earlier build without the
CDN base leaves relative image URLs that the storefront asset proxy expands
into much larger PNG responses. Imported image URLs go directly to the CDN;
content hashes also prevent old compressed files remaining in browser caches.

## Earlier checkout evidence · November 11, 2026

These two earlier orders preceded the separation of shorts into their own lines.
Shopify Payments test mode was temporarily enabled with merchant authorization.
No real payment or shipping label was purchased, and neither order was fulfilled.

| Test order | Contents | Subtotal | U.S. shipping | Tax | Simulated total |
| --- | --- | ---: | ---: | ---: | ---: |
| [PED#1485](https://admin.shopify.com/store/por-el-deporte/orders/7053673857071) | Home short XL + Away long M; shorts L on each; TEST KIT / 07 on each; white 3-pair socks | $185 | $0 | $12.95 | $197.95 |
| [PED#1486](https://admin.shopify.com/store/por-el-deporte/orders/7053676544047) | Home short L; shorts XL; plain back; black 1-pair socks | $95 | $0 | $6.65 | $101.65 |

The first order completed on desktop after an intentional declined-card attempt;
the second completed from the 390px mobile builder and checkout. Both saved
orders show the correct native variants and line properties at the manual
fulfillment location. Each jersey is a separate row in cart, checkout and admin.

Storefront API verification covered all eight Home + Away sleeve/shorts offers,
with $20 saved per pair. A same-color pair receives no discount; two qualifying
pairs save $40; removing Home removes the Away discount. Test cart contents were
removed after verification. A valid Canadian address was rejected with
“Shipping not available,” confirming the U.S.-only profile.

Both earlier test orders were canceled, their test payments refunded, inventory
restocked, and the orders archived. No real payment or fulfillment occurred.

## Release verification

- 20 domain checks cover the 400 kit combinations, actual prices, separate linked
  lines, unavailable extras, independent sizing and the exact seven-day cutoff.
- Ten native Shopify cart checks cover every Home + Away sleeve combination
  with/without shorts and three-pair socks. Removing Home removes its shorts
  and the bundle saving. Repeating a jersey with different print and shorts
  sizes preserves the correct parent and fulfillment properties. Test carts
  were emptied after verification.
- A mixed-sleeve full kit with three-pair socks has five lines and a $185 subtotal:
  Home short $70, Away long $80 less $20, two shorts at $15 each, socks $25.
- TypeScript, ESLint and the production build pass. The existing optional
  `metafile.server.json` bundle-analysis warning does not fail the build.
- [PED#1487](https://admin.shopify.com/store/por-el-deporte/orders/7053827276847)
  completed from the 390px mobile builder and Shopify checkout with all five
  separate lines, correct printing, a $185 subtotal, free shipping, $12.95 tax
  and a $197.95 simulated payment. Admin fulfillment shows each shorts line
  attached to its correct jersey. The test order was canceled and restocked;
  Shopify Payments test mode was switched off and verified after reload.
- Implementation and verification were assisted by Codex.
