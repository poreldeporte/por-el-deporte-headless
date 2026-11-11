# Club jersey preorder

Review route: `/products/club-jersey`. This task branch is local review work.
Shopify products were created with merchant authorization for checkout testing.
Keep the release unpublished until merchant approval; no storefront deployment
has been performed.

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
view or mobile print preview.

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

The four supplied socks photos are in `public/jersey/socks`, with responsive
160/640/1024px WebP exports. The black and white pair photos replace placeholders
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
the one-pair default. No size is invented: the preview marks socks sizing as TBC.
The three-pair price and saving appear before choosing a color. Savings compare
three actual single-pair prices with the pack price, and are shown before selection
only when both colors have the same available offer. After choosing a color, its
own offer applies. Missing prices, mixed currencies and nonpositive savings do
not produce a savings claim.

The `ped-socks` draft has four color/pack variants. The UI uses actual
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
real jersey product is available to the Storefront API. The route remains
`noindex, nofollow`.

Focused domain checks: `node --test tests/jersey.mjs` on Node 24. They cover the
exact seven-day deadline, print normalization/validation, all 400 builder choices
fulfilled by 80 individual jersey SKUs, mixed-sleeve bundle prices and increments with shorts, independent sizing,
actual-price quotes, currency mismatches, exact sock color/pack/size resolution,
canonical style/size association in either selection order, complete bounded
catalog pagination, and rejection before cart mutation. Blank and partial print
fields also cover
the switch-free flow. Sock-pack savings cover actual prices and unsupported
comparisons. Normal lint,
typecheck, and build commands also apply. Browser review covers desktop/mobile
choice changes, form validation, official photo mapping, and preview submission.

## Shopify catalog setup

The [draft CSV](./club-jersey-draft.csv) contains one product and **80 individual
jersey variants**: four styles × four jersey sizes × five shorts choices.
Regenerate it on Node 24 with:

```sh
node scripts/jersey-catalog.mjs > docs/club-jersey-draft.csv
```

The generator writes only to stdout. Description and price seeds live in
`app/lib/jersey.ts`; Shopify owns actual prices, availability and variant IDs.
The CSV stays draft, unpublished, manually fulfilled, tracked at zero with
continue-selling enabled. It omits media and the launch timestamp.

Created products:

- [The Club Jersey](https://admin.shopify.com/store/por-el-deporte/products/8544669630511), handle `club-jersey`, 80 variants and 18 supplied images.
- [PED Socks](https://admin.shopify.com/store/por-el-deporte/products/8544670548015), handle `ped-socks`, four variants and four supplied images.

| Jersey option | Values |
| --- | --- |
| Style | `Home (Orange) / Short sleeve`, `Home (Orange) / Long sleeve`, `Away (Black) / Short sleeve`, `Away (Black) / Long sleeve` |
| Size | `M`, `L`, `XL`, `XXL` |
| Shorts size | `None`, `M`, `L`, `XL`, `XXL` |

A Home + Away purchase adds **two individual jersey variants** in one cart
mutation. Each line has its own sleeve, jersey size, photo, price and print
properties. When shorts are added, each jersey line includes one matching pair
in the chosen shorts size. There are no combined bundle SKUs. Inventory and
manual fulfillment belong to each individual variant.

Shopify's automatic Buy X get Y rule [Home + Away — Save $20](https://admin.shopify.com/store/por-el-deporte/discounts/1328073998383) must be active
for launch: buy one of the 40 Home variants, get $20 off one of the 40 Away
variants. The two sets must contain only the corresponding color's variants,
not the entire product. No per-order limit; one saving per qualifying pair.
Do not combine this offer with other discounts. Removing either jersey must
remove the saving. The PDP quotes the same $20 USD offer; Shopify applies and
recalculates the real cart/checkout discount. The cart shows its allocation.

Socks use native `Color` values `Black`/`White` and `Pack` values `1 pair`/`3 pairs`,
priced at $10/$25. **Sock sizing still needs merchant confirmation**; no Size
option or one-size claim has been invented. If needed, add confirmed `Size`
values before launch. Packs contain one color and size throughout; each pack
is quantity 1 in the cart.

[Club jersey preorder shipping profile](https://admin.shopify.com/store/por-el-deporte/settings/shipping/profiles/106888233007)
is limited to these products, the manual location, and the **United States**.
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

The server resolves all exact native options before a single `cart.addLines`
call. If either jersey or the selected socks are unavailable, it adds nothing.
Each jersey gets `Order type: Preorder`, optional `Includes: 1 pair of matching
shorts · Size …`, and optional `Name on back` / `Number on back`. Native variant
options own each jersey's style and size. Shopify carries these into checkout
and the order. Different personalizations remain separate lines. Fulfillment
must read each line's properties. Physical orders remain manually fulfilled.

## Launch review

Before publishing, approve the page/prices and supplied jersey/shorts/socks photos,
confirm sock sizes and print limits, agree the launch time, and confirm shipping
language. Checkout testing uses simulated Shopify Payments transactions only.
The completed tests and restored store state are recorded below.

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

## Checkout evidence · November 11, 2026

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

Local checks: 19 domain tests, TypeScript, focused ESLint and production build.
The existing optional bundle-analysis warning about `metafile.server.json`
remains; the build itself passes. Generated CSV matches the 80-variant generator.
Implementation and verification were assisted by Codex.

After testing, both orders were canceled, their test payments refunded,
inventory restocked, and the orders archived. Shopify Payments test mode is
**off**, verified after reload. Both products are **Draft**, have **no sales
channels selected**, and show zero available inventory after restocking.
The temporary `preorder.starts_at` value was cleared, so the seven-day clock
has not started. Storefront API lookups return no jersey or socks product.
The bundle discount is deactivated (Shopify status **Expired**); the dedicated
U.S. preorder shipping profile remains configured.

At the approved launch, set the actual launch timestamp, publish the products
to the Por El Deporte Hydrogen channel, reactivate the bundle discount with
no end date, and deploy the approved revision. Recheck the native checkout
total after activation. No hosted CI, push, pull request or deployment was
performed during this local review task.
