# Club jersey preorder

Product route: `/products/club-jersey`. Publication was approved on November 11,
2026. The existing brand and buying layout are preserved. The release uses
Shopify Oxygen storefront `1000157315` at `https://poreldeporte.com`.

## Buying experience

The page keeps the existing gallery, four release facts, brand fonts/colors,
header/footer, size pills, and product detail cards.
The main introduction connects the jersey to the club’s friendships and
community, led by “We came for the game. We stayed for the people.” A visible
“Jersey design by Sergio Gomez” byline follows, with his name in the brand’s
display font. The shorts option and The Details both mention the pockets.

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
   extras appear in the gallery and kit preview using the supplied product photos.
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

PED socks use visual **Black / White** choices, followed by a pack choice and
Remove once selected. Merchant-confirmed prices are **$10 for one pair** and
**$25 for three pairs**, all in the chosen color. The local preview supports
adding, switching and removing both packs, updates the full total, and includes
the color/pack in the submitted review. Changing a selection hides an outdated
submitted preview until it is reviewed again. The photo cards use the same selected
state as the jerseys; choosing a color adds the socks. Removing socks restores
the one-pair default. The merchant confirmed socks are one size; no size
selection is required.
The three-pair price and saving appear before choosing a color. Savings compare
three actual single-pair prices with the pack price, and are shown before selection
only when both colors have the same available offer. After choosing a color, its
own offer applies. Missing prices, mixed currencies and nonpositive savings do
not produce a savings claim.

The `ped-socks` product has four color/pack variants. The UI uses actual
color/pack/size variants and prices; socks resolve to a separate line in the same
cart mutation. Each pack is a priced SKU with cart quantity **1**. A three-pack
must resolve its own $25 SKU rather than adding three $10 singles. Unknown or
out-of-stock combinations fail before the cart write. Size choices appear only
when the product has multiple sizes.

## Local review and verification

Run `npm run dev -- --port 3017` in the task worktree and open
`http://localhost:3017/products/club-jersey`. While the Shopify jersey is unpublished,
development shows a marked design preview. Submitting validates the selection
and shows a preview without changing a cart. Production returns 404 until the
real jersey product is available to the Storefront API. The released route uses
the site’s canonical, Open Graph and social metadata.
The footer links directly to the kit builder.

Focused domain checks: `node --test tests/jersey.mjs` on Node 24. They cover the
exact seven-day deadline, print normalization/validation, all 400 builder choices
fulfilled by 16 jersey and 8 shorts SKUs, mixed-sleeve bundle prices and increments with shorts, independent sizing,
actual-price quotes, currency mismatches, exact sock color/pack/size resolution,
canonical style/size association in either selection order, complete bounded
catalog pagination, and rejection before cart mutation. Blank and partial print
fields also cover
the switch-free flow. Sock-pack savings cover actual prices and unsupported
comparisons. Normal lint,
typecheck, and build commands also apply. Browser review covers desktop/mobile
choice changes, form validation, official photo mapping, and preview submission.

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
Do not combine this offer with other discounts. Removing either jersey must
remove the saving. The PDP quotes the same $20 USD offer; Shopify applies and
recalculates the real cart/checkout discount. The cart shows its allocation.

Socks use native `Color` values `Black`/`White` and `Pack` values `1 pair`/`3 pairs`,
priced at $10/$25. Socks are merchant-confirmed **one size**. Packs contain one
color throughout; each pack is quantity 1 in the cart. A three-pack is one $25
line clearly labeled “3 pairs,” not three $10 singles.

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
still apply it to both jerseys. Shorts and socks are separate optional sections
under “Complete your kit.”

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
