# Audit findings — Por El Deporte storefront

From an 8-lens audit of the running production build: 8 parallel finders, then
one adversarial verifier per finding, each told to refute it and to default to
"not real" when uncertain. 91 agents.

**83 raised → 63 confirmed, 20 refuted.** Only the confirmed ones are listed.

Status key: **FIXED** = fixed and verified in this repo. **DRAFTED** = text is
written in `docs/POLICIES_TO_PASTE.md`, needs pasting into Shopify admin.
**OPEN** = not yet addressed.

| # | Severity | Status | Finding |
|---|:--|:--|---|
| 1 | blocker | FIXED | Cart drawer's close × and "CART" title are hidden behind the sticky site header on every page except the homepage, and the × is unclickable |
| 2 | blocker | FIXED | Cart drawer's sticky Totals panel covers the cart line items — on a laptop with 2 items you see zero products |
| 3 | blocker | FIXED | Cart drawer cannot be closed on any page except the homepage — close button is buried under the sticky site header |
| 4 | blocker | FIXED | On phones the cart drawer shows no product at all and the subtotal amount is clipped off-screen |
| 5 | blocker | FIXED | Cart drawer promises 5-25% off spend tiers that are never applied to the cart or the checkout |
| 6 | high | OPEN | The /cart page's checkout CTA and totals block render as unstyled stock Hydrogen skeleton — the same component is fully branded in the cart drawer |
| 7 | high | OPEN | Order detail shows $0.00 in the per-item "Total" column (renders the discount, not the line total) |
| 8 | high | OPEN | /cart page's Totals block is raw Hydrogen skeleton — the primary checkout CTA is unstyled plain text |
| 9 | high | OPEN | "Remove" button is styled as a 32px circular icon button, so the word overflows and the circle strikes through the text |
| 10 | high | FIXED | Homepage cart FAB sits exactly on top of the community FAB, making the community button unclickable |
| 11 | high | OPEN | --text-muted token is 3.82:1 on cream, failing body copy, breadcrumb links and variant labels |
| 12 | high | OPEN | Product pages hardcode "100% ring-spun cotton / Plastic-Free" on every product, contradicting the Specs card on the same page |
| 13 | high | OPEN | Two of the store's four collections are completely empty, and one is a footer link on every page |
| 14 | high | OPEN | Homepage "Shop Our Signature Gear" rail shows 12 products with no prices, and Quick Add blind-picks a size |
| 15 | high | FIXED | All three blog templates are unbranded stock Hydrogen skeleton — content renders flush against the viewport edge with no container |
| 16 | high | DRAFTED | /policies/refund-policy serves the Privacy Policy verbatim — the store has no visible returns policy |
| 17 | high | FIXED | Homepage hero (the LCP element) is a fixed width=2400 image with no srcset, no preload and no fetchpriority — 8.3s LCP on emulated 4G |
| 18 | medium | OPEN | Cart line "Remove" button is styled as a 32px circle, drawing a stray circular border across its own text |
| 19 | medium | OPEN | Order detail shipping address renders as one run-together string with the customer's name printed twice |
| 20 | medium | OPEN | Order totals table prints every label twice — "Subtotal Subtotal", "Tax Tax", "Total Total" |
| 21 | medium | OPEN | Address forms reuse the same DOM ids, so every label on a saved address wires to the empty "Create address" form |
| 22 | medium | OPEN | Order status shown to customers as raw API enums ("PAID", "SUCCESS", "PARTIALLY_REFUNDED") and "N/A" for unshipped orders |
| 23 | medium | OPEN | "Set as default address" checkbox is stretched to full width and renders centered on its own line, detached from its label |
| 24 | medium | OPEN | Account forms are capped at 400px by a leftover skeleton reset, leaving two-thirds of the branded card empty |
| 25 | medium | OPEN | Address form demands raw ISO codes for country and state with no hint that codes are required |
| 26 | medium | OPEN | Destructive address delete has no confirmation, profile save has no success feedback, and all address Save buttons disable together |
| 27 | medium | OPEN | Cart line items display "Title: Default Title" for single-variant products |
| 28 | medium | OPEN | Invalid discount code fails completely silently — no error, no clearing, no feedback |
| 29 | medium | OPEN | Large unexplained vertical gaps between the discount and gift-card rows in both cart layouts |
| 30 | medium | OPEN | Quick-add-to-cart buttons on the shop grid have no accessible name |
| 31 | medium | OPEN | Cart drawer is marked aria-modal but focus never enters it, is not trapped, and is not restored on close |
| 32 | medium | OPEN | About-page mission copy is dark brown on orange at 2.47:1 — the worst contrast on the site |
| 33 | medium | OPEN | Brand orange and cream fail 4.5:1 against each other, hitting the newsletter CTA, the active nav item and the PDP colour swatch |
| 34 | medium | OPEN | Announcement marquee text is 3.9:1 on blue on every page |
| 35 | medium | OPEN | /collections renders four blank beige squares — no collection has an image |
| 36 | medium | OPEN | Every collection page is headed "Gear Up." with tees/hats/totes copy; the collection's own name never appears in a heading |
| 37 | medium | OPEN | Render-blocking Google Fonts stylesheet gates first paint and delays the brand font, which is never preloaded; a third of that request is for a font that never paints |
| 38 | medium | OPEN | Product page editorial strip: 707 KB of hand-written imgs at fixed width=800 into 352x440 / 240x300 boxes |
| 39 | medium | OPEN | /collections renders as four completely blank boxes — and it is the destination of the account area's only 'Start Shopping' CTA |
| 40 | medium | OPEN | Two empty collections are live, promoted in the site footer, and listed in the sitemap; the empty collection page still runs the 'Gear Up.' sell hero over zero products |
| 41 | medium | OPEN | Sold-out variants are signalled by 35% opacity alone — still clickable, no accessible state, and no explanation once the shopper is in a dead end |
| 42 | medium | OPEN | Product meta/og descriptions are missing spaces between sentences and run 60-150% over the SERP snippet limit |
| 43 | medium | OPEN | All four collection pages share one identical meta description, and no collection page has an og:image |
| 44 | medium | DRAFTED | /policies/refund-policy serves the Privacy Policy text verbatim — there are no refund terms anywhere on the site |
| 45 | medium | FIXED | Product page's main gallery image — the LCP element — is marked loading="lazy" |
| 46 | medium | FIXED | Homepage ships 4.5 MB of images; the 15-tile Instagram grid alone is 2.5 MB, every tile hardcoded to width=700 for a ~170px box |
| 47 | medium | FIXED | Any product/collection/page/blog URL containing a percent-encoded character (e.g. a trailing space) 302s to itself forever — the browser shows ERR_TOO_MANY_REDIRECTS instead of the branded 404 |
| 48 | medium | FIXED | The 404 page renders with no <title>, no meta description and no robots tag at all |
| 49 | medium | FIXED | All four blog routes still carry stock Hydrogen-skeleton meta: no canonical, no description, no Open Graph, and "… blog" / "… article" titles |
| 50 | low | OPEN | Invalid <legend> placement and unstyled <h3>s in the account body |
| 51 | low | OPEN | Empty close-overlay button inside the cart dialog has no accessible name |
| 52 | low | OPEN | Footer column headings are cream at 70% opacity over green — 3.67:1 |
| 53 | low | OPEN | Keyboard focus ring is nearly invisible on the green footer and over the hero photo |
| 54 | low | OPEN | Footer "Club" column is leftover old-theme navigation: Our Mission / Gallery / Join the Revolution all point at /about |
| 55 | low | OPEN | The "What Makes Us Special" drawer sends customers to poreldeporte.com/pages/app, which renders an empty page titled "app" |
| 56 | low | OPEN | Expired /cart/<lines> share links discard their helpful message and show the generic 'Something went wrong' 500 copy |
| 57 | low | OPEN | The sitemap advertises two policy URLs that robots.txt blocks from being crawled |
| 58 | low | OPEN | /collections is a fully SEO-tagged route that is in no sitemap and has no link from the public site |
| 59 | low | OPEN | Account pages use bare, unbranded browser titles that break the site-wide "Por El Deporte \| X" pattern |
| 60 | low | OPEN | The permanent /collections/all consolidation redirect returns 302 instead of 301 |
| 61 | low | FIXED | Every 404 response ships with no <title> tag at all |
| 62 | low | FIXED | Every page ships two <main> elements, one illegally nested inside <aside> |
| 63 | low | FIXED | Every error page (404, 410, 500) renders with no <title> at all — the browser tab shows the raw URL |

---

## Detail

### 1. BLOCKER — FIXED — Cart drawer's close × and "CART" title are hidden behind the sticky site header on every page except the homepage, and the × is unclickable

**Where:** `app/components/Aside.tsx:56 (`.overlay` z-index 10, `aside header` / `button.close`) stacking below `.pel-siteheader__inner`; app/components/PageLayout.tsx:36. URLs: every page except /`

**Evidence:** Hit-tested the live build. The drawer's close button is at viewport (1394, 48) on all pages. On / , `document.elementFromPoint(1394,48)` returns `BUTTON.close.reset` and a raw mouse click at that point changes `.overlay` from "overlay expanded" to "overlay " (drawer closes). On /products/kit-launch, /cart and /collections/all-products, `elementFromPoint(1394,48)` returns `DIV.pel-siteheader__inner`, and a raw click at that point leaves `.overlay` as "overlay expanded" — the drawer does NOT close. Same for the `<h3>CART</h3>` title's center point. Screenshots: shots/z_drawertop_HOMEPAGE.png shows the branded "CART" heading + circular × ; shots/z_drawertop_PRODUCT.png shows both entirely covered by the header, leaving the drawer with a blank top and no visible close affordance.

**Impact:** On every page except the homepage a customer opens the cart, sees a drawer with no title and no visible close button, and clicking where the × appears does nothing. The only escapes are the Esc key or clicking the dimmed overlay — neither is discoverable. This is the primary cart UX on the site.

**Fix:** Raise the `.overlay`/`aside` stacking context above `.pel-siteheader` (or offset the drawer's `top` by the header height and give the drawer its own sticky header) so the drawer's `header` with the `CART` title and `.close` button is visible and hit-testable on non-home pages.

### 2. BLOCKER — FIXED — Cart drawer's sticky Totals panel covers the cart line items — on a laptop with 2 items you see zero products

**Where:** `app/styles/app.css:306 (.cart-main max-height/overflow) + app/styles/pel-cart.css:135-142 (.cart-summary-aside position:sticky;bottom:0); URL /products/* → cart drawer`

**Evidence:** Measured with Playwright. 1440x900, 1 item: .cart-line spans y 245-441 but .cart-summary-aside spans y 362-763; document.elementFromPoint() over the quantity stepper (y 390) returns `.cart-subtotal`. 1440x790 (MacBook Air) with 2 items: .cart-main clientHeight 540 / scrollHeight 950, summary y 253 h 401, lines at y 245 (h170) and y 417 (h196) — elementFromPoint over the two steppers returns `INPUT` and `P`. Screenshot of that state shows only the progress bar and the TOTALS block: no product image, name, price, quantity or Remove anywhere in the drawer. Cause: the 401px-tall Totals block is `position:sticky; bottom:0` INSIDE the scroll container `.cart-main`, whose height is capped at `calc(100vh - var(--cart-aside-summary-height))` (250px reserve), so it permanently occupies the bottom 401px of a 540-690px scrollport.

**Impact:** A customer adds a product, the drawer opens, and they cannot see what they just added, cannot change quantity, and cannot remove it. With 2+ items the drawer looks empty apart from a subtotal. Simultaneously ~150px of blank cream is left below the checkout button because of the hardcoded 250px reserve.

**Fix:** Restructure the drawer: make .cart-main a flex column (height:100%; min-height:0), put only .cart-details in the scrolling region (flex:1; overflow-y:auto; min-height:0), and render .cart-summary-aside as a non-scrolling flex footer. Delete the --cart-aside-summary-height / --cart-aside-summary-height-with-discount max-height hacks in app.css:302-313 and the position:sticky in pel-cart.css:136.

### 3. BLOCKER — FIXED — Cart drawer cannot be closed on any page except the homepage — close button is buried under the sticky site header

**Where:** `app/styles/app.css:168 (.overlay z-index:10) vs app/styles/pel-chrome.css:24-27 (.pel-siteheader position:sticky; z-index:40); app/styles/app.css:171-180 (.overlay .close-outside)`

**Evidence:** On /products/el-clasico-tee at 1440x940 the drawer's header renders at y 0-89 with the X at [1372,26,44,44], but document.elementFromPoint(1394,48) returns `.pel-siteheader__inner` and Playwright `.click()` on `.overlay.expanded aside header .close` times out (element not hittable). Same for the "CART" heading. On iPhone 13 (390px) it is worse: `.overlay .close-outside` computes to width:0px because it is `calc(100% - var(--aside-width))` = 390 - 460; tapping the X location hit-tests to `BUTTON.pel-pill` (the header CART pill, which just re-opens the cart) and a tap at (10,500) does not close the drawer either. Verified the homepage works (no PelHeader there): closed-by-X = true.

**Impact:** Every add-to-cart on a PDP, collection, /cart, /about or policy page opens a drawer with no visible or clickable close affordance. Desktop users can only press Escape or click the narrow strip of scrim; phone users have no way out at all short of the browser back button.

**Fix:** Give .overlay a z-index above the header (e.g. 50) or drop .pel-siteheader's z-index while an aside is expanded, and change .close-outside to `width: max(0px, calc(100% - var(--aside-width)))` — or better, make it `inset:0` and let the aside paint over it.

### 4. BLOCKER — FIXED — On phones the cart drawer shows no product at all and the subtotal amount is clipped off-screen

**Where:** `app/styles/app.css:333-340 (.cart-summary-aside width: calc(var(--aside-width) - 40px)) with app/styles/pel-cart.css:9 (--aside-width: 460px); iPhone 13 viewport, cart drawer`

**Evidence:** iPhone 13 (390x664) after adding El Clásico Tee: .cart-summary-aside measures [x16,y237,w420,h337] inside a 358px content column, so the subtotal <dd> sits at x 371-432 (viewport 390) — only the leading "$" is visible in the screenshot — and the CONTINUE TO CHECKOUT button spans x 20-432 and is clipped at the right edge and cut off at the bottom. The line item is completely hidden behind the Totals panel; after scrolling .cart-main to the end (scrollTop 309 of 723-414) the line sits at y -80 with the summary starting at y 166 and the header covering y 0-105, so the only part of the product ever visible is the word "Remove". The "25% OFF" milestone label is also clipped at the right edge.

**Impact:** On the traffic that matters most for a Miami apparel brand, the cart drawer shows a progress bar and a price the customer cannot read, with no product, no image, no quantity control, and a checkout button running off the screen.

**Fix:** Drop the fixed `width: calc(var(--aside-width) - 40px)` (use width:auto/100% with the drawer's own padding) and apply the flex-footer restructure from the first finding so the line items get the remaining height.

### 5. BLOCKER — FIXED — Cart drawer promises 5-25% off spend tiers that are never applied to the cart or the checkout

**Where:** `app/components/CartMain.tsx:96-136 (CART_MILESTONES / CartProgress); app/components/CartSummary.tsx:24-33 (subtotal only)`

**Evidence:** CART_MILESTONES is hardcoded UI; grep shows nothing in app/ applies a discount code or reads discountAllocations. With 3 x El Clásico Tee the drawer said "YOU ARE $15 AWAY FROM GETTING 10% OFF!" with the 5%-off tier already lit, while the cart loader data reported cost.subtotalAmount $135.00, cost.totalAmount $135.00, totalTaxAmount null, discountCodes: [] — i.e. no automatic discount exists at $135 even though the widget says 5% off unlocked at $75. The summary also renders only Subtotal (no discount line, no order total), so a real discount would still be invisible. The bar is mis-scaled too: fill = subtotal/400 but the dots are evenly spaced (measured centres 5.6 / 27.8 / 50 / 72.2 / 94.4% of the bar). At subtotal $90 the fill is 22.5% while the "10% OFF" dot is at 27.8%, so the fill crosses that dot at about $111 although 10% off supposedly needs $150; the "5% OFF" dot sits at 5.6%, appearing reached from roughly $22.

**Impact:** The store tells customers they have earned money off and then charges them full price at checkout. That is the kind of thing that generates refund requests and chargebacks, and it is the loudest element in the cart drawer.

**Fix:** Either delete CartProgress, or make it real: create the matching automatic discounts in Shopify, add `discountAllocations` and `cost.totalAmount` to the cart fragment, render a Discount row and an Order total row in CartSummary, and compute the bar fill from the milestone index rather than subtotal/400 so the fill and the dots agree.

### 6. HIGH — OPEN — The /cart page's checkout CTA and totals block render as unstyled stock Hydrogen skeleton — the same component is fully branded in the cart drawer

**Where:** `app/components/CartSummary.tsx:13 (layout==='page' → 'cart-summary-page'); app/styles/pel-cart.css:135 styles only .cart-summary-aside; app/styles/app.css:329 gives .cart-summary-page just `position: relative`. URL: /cart`

**Evidence:** Added a real item ("Palmas" Jersey, $78) via Playwright and measured the live page. On /cart the primary CTA `Continue to Checkout →` computes to backgroundColor rgba(0,0,0,0), padding 0px, border-radius 0px, font-size 16px, box 1224x22 — i.e. a bare text link. `<h4>Totals</h4>` computes to Montserrat 16px plain body text. The discount and gift-card inputs compute to `1px solid rgb(0,0,0)`, border-radius 4px (generic app.css skeleton), with large accidental vertical gaps from the skeleton's `<br/>`/`<dl>`/`<section>` markup. Opening the cart DRAWER on the same build renders the identical CartSummary component branded: checkout is a full-width black pill (`CONTINUE TO CHECKOUT →`), `TOTALS` is a 12px uppercase muted label (rgba(23,23,23,0.55)), and the inputs are white pills at border-radius 999px. Screenshots: shots/s_cart_full.png (page) vs shots/z_drawer.png (drawer).

**Impact:** A customer who clicks "VIEW CART" in the footer or navigates to /cart lands on the money page with the primary purchase button rendered as plain 16px text with no button affordance, next to generic grey-bordered inputs and stray whitespace. It reads as a half-built page and buries the single most important CTA on the storefront.

**Fix:** Give `.cart-summary-page` the same brand treatment `.cart-summary-aside` already has in app/styles/pel-cart.css (pill checkout button, uppercase muted `Totals` label, pill discount/gift-card inputs), or better, have CartSummary emit shared `pel-` classes for both layouts and delete the reliance on stock app.css. Also drop the `<br/>`-based spacing in CartCheckoutActions.

### 7. HIGH — OPEN — Order detail shows $0.00 in the per-item "Total" column (renders the discount, not the line total)

**Where:** `app/routes/account.orders.$id.tsx:218 (column header defined at :99) — /account/orders/:id`

**Evidence:** The table header is `<th scope="col">Total</th>` but the cell renders `<Money data={lineItem.totalDiscount!} />`. The GraphQL fragment `OrderLineItemFull` (app/graphql/customer-account/CustomerOrderQuery.ts:18-44) only selects `price`, `discountAllocations` and `totalDiscount` — there is no line-total field, so the column can never be right. Rendered proof in a harness built from the real markup + the shipped CSS bundles: a 2 × $38.00 line prints Price $38.00, Quantity 2, Total $0.00 (screenshot /private/tmp/claude-501/-Users-francoviola-Desktop-ViolaCreative-por-el-deporte-ecommerce/22edec18-25e2-4256-8718-a7415bf76a14/scratchpad/v2-orderdetail.png).

**Impact:** Every line on every past order reads Total $0.00 for any item that wasn't discounted. A customer opening their order looks at a receipt that says the item cost nothing, which reads as either a billing error or a broken site — the single worst place to have wrong money on the page.

**Fix:** Render the real line total instead of the discount: either compute `price.amount * quantity` (minus `totalDiscount`) into a MoneyV2 and pass that to `<Money>`, or add a total-price field to the `OrderLineItemFull` fragment and use it. Keep `totalDiscount` only if you add a separate "Discount" column.

### 8. HIGH — OPEN — /cart page's Totals block is raw Hydrogen skeleton — the primary checkout CTA is unstyled plain text

**Where:** `app/components/CartSummary.tsx:49-60, 99-115, 223-244; only .cart-summary-aside is branded in app/styles/pel-cart.css:135-188, while .cart-summary-page is just `position:relative` in app/styles/app.css:329-331. URL: /cart`

**Evidence:** Measured on /cart at 1440x940: `.cart-summary-page a[href^="https"]` ("Continue to Checkout →") is 16px, color rgb(0,0,0), background transparent, padding 0px, border-radius 0px, 1224px wide, height 22 — a full-bleed plain text link. The "Totals" h4 is default 16px regular. The discount and gift-card inputs are 204x42 with border-radius 4px and transparent background (browser default chrome). Both "Apply" buttons are bare 47x24 text with no border or background. Screenshot shows these in a visibly different typographic weight/style from the branded SUBTOTAL / $135.00 row directly above them.

**Impact:** The dedicated cart page — the page the footer's "View Cart" link and the /cart URL both land on — presents the store's single most important button as unstyled black body text that does not look clickable, next to two default-looking form fields. It reads as an unfinished dev build.

**Fix:** Extend the pel-cart.css rules that already style `.cart-summary-aside` (button pill, input pill, uppercase micro-label) to `.cart-summary-page`, or refactor them onto a shared class applied in both layouts.

### 9. HIGH — OPEN — "Remove" button is styled as a 32px circular icon button, so the word overflows and the circle strikes through the text

**Where:** `app/styles/pel-cart.css:106-119 (.cart-line-quantity button) applied to the LinesRemove submit in app/components/CartLineItem.tsx:146-165`

**Evidence:** Measured the last button in .cart-line-quantity on /cart: width 32, height 32, border-radius 50%, border 1px solid rgb(23,23,23), scrollWidth 48, textContent "Remove". Screenshots of both /cart and the drawer show a circle outline drawn through the letters "Rem" of "Remove", overlapping the adjacent "+" stepper button. The rule targets every `button` inside .cart-line-quantity, not just the two steppers.

**Impact:** The delete control on every cart line renders as a struck-through word with a stray circle over it — visible on the cart page, the drawer, desktop and mobile.

**Fix:** Scope the circular styling to the steppers: `.cart-line-quantity button[name='decrease-quantity'], .cart-line-quantity button[name='increase-quantity'] { … }`, and give the Remove submit its own text-link styling.

### 10. HIGH — FIXED — Homepage cart FAB sits exactly on top of the community FAB, making the community button unclickable

**Where:** `app/styles/home.css:1123-1125 (.pel-fab { right: 26px }) overriding app/styles/pel-chrome.css:409-411 (.pel-fab--community { right: 98px }); load order set in app/root.tsx:19-20`

**Evidence:** On the homepage at 1440x900 both buttons measure the identical rect [1356,816,58,58]. Playwright's click on `.pel-fab--community` fails with: "<svg …> from <button type=\"button\" class=\"pel-fab\" aria-label=\"Open cart, 2 items\"> subtree intercepts pointer events" (30s timeout). Cause: home.css is imported after pel-chrome.css, so its equal-specificity `.pel-fab { right: 26px }` wins over `.pel-fab--community { right: 98px }`.

**Impact:** On the homepage the "What makes us special" floating button is completely dead — every click on it hits the cart button instead and opens the cart drawer.

**Fix:** Increase specificity of the offset (e.g. `.pel-fabs .pel-fab--community { right: 98px }`) or move the `--community` rule into home.css after the base `.pel-fab` rule.

### 11. HIGH — OPEN — --text-muted token is 3.82:1 on cream, failing body copy, breadcrumb links and variant labels

**Where:** `app/styles/pel-tokens.css:39 (`--text-muted: rgba(23, 23, 23, 0.55)`); consumers include app/styles/product.css:120-124 (`.pel-pdp__lead`) and app/styles/shop.css:184-189 (`.pel-shopcard__cat`)`

**Evidence:** axe-core reports `color-contrast` (SERIOUS) with fg=#7C7971 on bg=#f7f0de at 3.82:1 against a 4.5:1 requirement, across: `.pel-pdp__lead` (16px normal — "The striped shield. The one everyone asks about."), `.pel-pdp__opt-label` ("Color", the variant-picker label), `.pel-pdp__note` ("Each purchase powers our Miami community."), breadcrumb links `a[href="/"]` "Home" and `a[href$="all-products"]` "Shop", and `.pel-shopcard__cat` at 16 nodes (every product card's category on the collection page). Rendered-pixel sampling of the same elements returned glyph core rgb(124,121,113) on rgb(247,240,222) = 3.82 and rgb(123,120,112) = 3.88, matching the computed values.

**Impact:** Ordinary body copy on every product page, the breadcrumb navigation links, the labels that tell a customer which option they are choosing, and the category line on all 16 shop cards are all below the AA threshold. This is the single most widespread contrast defect and it lands on text customers must read to buy.

**Fix:** Raise the token alpha from 0.55 to at least ~0.66 (`rgba(23,23,23,0.66)` ≈ 4.6:1 on #F7F0DE), or set `--text-muted: #5F5C56`. One token change fixes all listed call sites.

### 12. HIGH — OPEN — Product pages hardcode "100% ring-spun cotton / Plastic-Free" on every product, contradicting the Specs card on the same page

**Where:** `app/components/product/ProductPage.tsx:11-16 (STATS) and :251-257 (`.pel-pdp__fabric` band); visible on /products/kit-launch, /products/artisan-ped-hoodie, /products/organic-bucket-hat, /products/por-el-deporte-cap, /products/the-tote, /products/el-clasico-tote`

**Evidence:** Scraped the fabric band, stat cards and Specs card from all 16 rendered PDPs. Every product shows the identical orange band directly above Add to Cart — "Plastic-Free | 100% ring-spun cotton | Super-soft heavyweight" — plus stat cards "100% / Ring-Spun Cotton" and "0 / Plastic". Meanwhile SPECS is keyed per garment, so on /products/kit-launch the same page says Fabric = "Performance knit" and its own story says "the same fabric we actually play in"; the hoodie says "Cotton-rich fleece"; the cap and bucket hat say "100% organic cotton twill … Certified GOTS and OEKO-TEX"; both totes say "100% cotton canvas". 6 of 16 products contradict themselves; the band/stats are visible (product.css:226-238 renders it as a full-width orange bar, :71-81 as bordered cards).

**Impact:** On the $78 Palmas Jersey a shopper reads "PLASTIC-FREE — 100% RING-SPUN COTTON" inches above the buy button and "Fabric: Performance knit" one scroll later. A performance knit is synthetic, so the plastic-free/100%-cotton claim is both self-contradicting and false — an unsubstantiated material claim on the store's flagship item. "Super-soft heavyweight" is also nonsense on a bucket hat and a canvas tote.

**Fix:** Make the fabric band and the two material stat cards derive from `kind` the same way WEAR and SPECS already do (e.g. reuse `SPECS[kind]`'s Fabric row for the band's middle chip, and drop the "0 Plastic" / "100% Ring-Spun Cotton" stats for jersey/hoodie, keeping them only where the spec table agrees).

### 13. HIGH — OPEN — Two of the store's four collections are completely empty, and one is a footer link on every page

**Where:** `/collections/2022-kits ("Official Kits") and /collections/2023-por-el-deporte-kits; linked from app/components/PelFooter.tsx:18 and from the /collections index`

**Evidence:** curl of both URLs returns 200 with banner eyebrow "Shop All • 0 Styles" and the grid replaced by the empty state "Nothing here yet. / Nothing here right now. Check back soon. / Browse all gear". /collections/all-products has 16 and /collections/all-tees has 10. The one real kit, "Palmas" Jersey ($78), lives only in all-products. The footer's "Official Kits" link resolves to /collections/2022-kits.

**Impact:** A shopper clicking "Official Kits" in the footer of any page — the most obvious entry point for the brand's flagship jersey — hits a dead collection telling them to check back soon, while the jersey is actually in stock. "2023 Por El Deporte Kits" is equally dead and is one of only four cards on the /collections browse page, so half that page leads nowhere. The empty state also stutters: "Nothing here yet." followed by "Nothing here right now. Check back soon." says the same thing twice (app/components/shop/ShopPage.tsx:120-124).

**Fix:** Either add the Palmas Jersey (and any other kits) to "Official Kits" in Shopify admin and unpublish/delete "2023 Por El Deporte Kits", or repoint the footer's "Official Kits" link at /products/kit-launch. Also collapse the two duplicate sentences in the empty state into one.

### 14. HIGH — OPEN — Homepage "Shop Our Signature Gear" rail shows 12 products with no prices, and Quick Add blind-picks a size

**Where:** `app/components/home/ProductRail.tsx:93-126; query at app/routes/_index.tsx:284-300`

**Evidence:** Rendered homepage text for the rail is "01 / 12 — “Palmas” Jersey Quick Add — Artisan PED Hoodie Quick Add — Futbol, Mate, Asado Tee Quick Add …" with no price anywhere; HOME_RAIL_QUERY fetches only id/title/handle/featuredImage/selectedOrFirstAvailableVariant and never requests `price`. RailCard's comment at :115-116 states "(For products that require a size choice, the arrow → the PDP.)" but the code has no such branch — it always renders AddToCartButton with `selectedOrFirstAvailableVariant`. The sibling ShopCard does implement exactly that check (shop/ShopPage.tsx:172, 201-208).

**Impact:** The first product section a visitor sees prices nothing, so "Quick Add" puts a $78 jersey in the cart at a price the shopper has never been shown, in a size they never chose. The component's own comment describes behaviour it does not have.

**Fix:** Add `priceRange { minVariantPrice { amount currencyCode } }` (and `options { optionValues { name } }`) to HOME_RAIL_QUERY, render a `<Money>` on each card, and port ShopCard's `needsChoice` branch so multi-variant products link to the PDP instead of quick-adding — or delete the stale comment.

### 15. HIGH — FIXED — All three blog templates are unbranded stock Hydrogen skeleton — content renders flush against the viewport edge with no container

**Where:** `app/routes/blogs._index.tsx (`.blogs`, `.blogs-grid`, bare `<h1>`), app/routes/blogs.$blogHandle._index.tsx (`.blog`, `.blog-grid`), app/routes/blogs.$blogHandle.$articleHandle.tsx (`.article`). URLs: /blogs, /blogs/news, /blogs/news/brickell-league-final`

**Evidence:** Live capture: /blogs renders zero `pel-` classes (only `blogs`, `blogs-grid`, `blog`) with 4 unclassed block elements and h1 at Flapjack 25.6px, versus 52px for every branded page title (/policies, /cart, /collections). `.blogs` and `.blogs-grid` have no rule in any file under app/styles/ and no match in the shipped dist/client/assets/*.css. The article page renders 1 non-pel class (`article`), 10 unclassed elements, and body text spanning the full 1440px viewport with no max-width. Screenshots shots/s__blogs.png and shots/s__blogs_news_brickell_league_final.png show the headings and paragraphs starting at x=0 with no left padding, directly above a correctly laid-out branded footer. This is not thin content: /blogs/news/brickell-league-final is a full post (8 paragraphs plus 6 photos, 8619px tall).

**Impact:** Reachable by customers, not just crawlers: on-site search links straight to articles (app/components/SearchResults.tsx:47 — /search?q=tee returns an "Articles: Brickell League Final" result), and /sitemap/articles/1.xml plus /sitemap/blogs/1.xml expose them for indexing. A customer who follows one sees real brand content dumped edge-to-edge in default type, which looks broken next to /, /about and the product pages.

**Fix:** Wrap the three blog routes in the existing brand container pattern (`pel-legal`/`pel-legal__inner` + `pel-prose` already used by app/routes/policies.$handle.tsx and pages.$handle.tsx give a max-width, padding and branded title/prose for free), and replace the bare `<h1>` with `pel-legal__title` (or a new `pel-` blog class). Also fix the invalid `<div>`/`<address>` nested inside `<h1>` in blogs.$blogHandle.$articleHandle.tsx and the duplicated `className="article"` on both wrapper and content div.

### 16. HIGH — DRAFTED — /policies/refund-policy serves the Privacy Policy verbatim — the store has no visible returns policy

**Where:** `URL /policies/refund-policy (rendered by app/routes/policies.$handle.tsx:1-40, linked from the footer "Legal" column on every page — app/components/PelFooter.tsx:48)`

**Evidence:** Extracted the `.pel-prose` body from both policy pages on :3000 and compared: both are 2424 characters and byte-identical. Under the H1 "Refund Policy" the page opens "Effective Date: April 1st, 2024 / Welcome to Por El Deporte. Your privacy and trust are important to us, and this Privacy Policy provides important information about how we handle personal information…", runs through "Information Collection and Use", "Sharing of Information", "ADA Compliance", "Security", and ends with the heading "Changes to This Privacy Policy". The only return terms anywhere on the site are one buried paragraph inside it ("…eligible for a return or exchange within 30 days of receipt… may be subject to a restocking fee").

**Impact:** A customer who clicks "Refund Policy" before buying lands on a page headed Refund Policy that talks about cookies, data sharing and ADA compliance and never presents itself as a returns policy. The actual 30-day/restocking-fee terms are hidden mid-document under a privacy heading, so they are neither findable nor enforceable-looking. Note this is separate from the already-known missing Shipping Policy / ToS: the Refund policy is *defined* in Shopify, just filled with the wrong document.

**Fix:** In Shopify admin → Settings → Policies → Refund policy, replace the pasted privacy text with a real returns/refunds policy (30-day window, condition requirements, restocking fee, damaged-goods process, who pays return shipping). No code change needed — policies.$handle.tsx renders whatever the shop returns.

### 17. HIGH — FIXED — Homepage hero (the LCP element) is a fixed width=2400 image with no srcset, no preload and no fetchpriority — 8.3s LCP on emulated 4G

**Where:** `app/routes/_index.tsx:209-213 (img.pel-hero__img), URL path /`

**Evidence:** Playwright + PerformanceObserver confirms the LCP element is IMG.pel-hero__img on both viewports. Intrinsic 2400x1600; displayed box 1440x892 (desktop 1440@DPR1) and 390x808 (mobile 390x844@DPR2, so ~780 device px needed). Delivered bytes from the CDN: width=2400 = 328,156 B webp; width=800 = 87,528 B; width=1600 = 186,892 B. The tag has no srcset, no sizes, no loading attr and no fetchpriority; `grep -rn "rel=.preload.|fetchpriority|fetchPriority" app` returns zero hits anywhere in the repo, and the served HTML's only preloads are 14 modulepreload tags. Throttled A/B (mobile 390x844@DPR2, Regular 4G: 1.6 Mbps / 150 ms RTT / 4x CPU), repeated twice with <10 ms variance: as-is LCP 8,268 / 8,264 ms; deferring the Moods bg 6,664 / 6,660 ms; deferring it AND serving the hero at width=800 3,344 / 3,300 ms. A zero-JS control run (all /assets/*.js aborted) still gave LCP 7,312 ms with the hero request spanning 189-7,282 ms, proving image bytes alone are the bottleneck.

**Impact:** Every mobile visitor downloads a 328 KB, 2400px-wide photo to fill a 390px-wide box and stares at a black hero for ~8 seconds on a normal 4G connection. LCP over 4s is a 'Poor' Core Web Vital; this is the first impression of the brand and it also directly suppresses Google rankings.

**Fix:** Give the hero a real responsive source and prioritise it: add `srcset` at 800/1200/1600/2400 with `sizes="100vw"`, plus `fetchpriority="high"` and `decoding="sync"` on the img, and emit a matching `<link rel="preload" as="image" imagesrcset=... imagesizes="100vw">` from the _index route's links export so the preload scanner starts it in the first RTT.

### 18. MEDIUM — OPEN — Cart line "Remove" button is styled as a 32px circle, drawing a stray circular border across its own text

**Where:** `app/styles/pel-cart.css:106-132 (`.cart-line-quantity button` sets width/height/border-radius; the `button[type='submit']:last-child` rule at :129 only adds underline). Affects /cart and the cart drawer`

**Evidence:** Live measurement of the Remove button inside `.cart-line-quantity`: width 32px, height 32px, border-radius 50%, border `1px solid rgb(23,23,23)` — the same circular icon-button treatment as the − and + buttons, but its text content is the word "Remove", which overflows the 32px circle. Screenshot shots/z_cartline.png (2x) clearly shows a circle outline drawn over the letters "mo" of "Remove", colliding with the adjacent "+" button. Also visible in the drawer at shots/z_drawer.png.

**Impact:** Every customer with an item in the cart sees a misdrawn control — a circle overlapping a word — on both the cart page and the cart drawer. It reads as a rendering bug and undermines confidence right before checkout.

**Fix:** Scope the circular sizing to the quantity steppers only (e.g. `.cart-line-quantity button[name^='decrease-quantity'], .cart-line-quantity button[name^='increase-quantity']`, or add a class in app/components/CartLineItem.tsx), and reset `width`, `height`, `border` and `border-radius` to `auto`/`none`/`0` on the Remove submit button that the `:last-child` rule already targets.

### 19. MEDIUM — OPEN — Order detail shipping address renders as one run-together string with the customer's name printed twice

**Where:** `app/routes/account.orders.$id.tsx:165-177 — /account/orders/:id`

**Evidence:** `shippingAddress.formatted` is `Array<String>` (customer-accountapi.generated.d.ts:768 / hydrogen customer-account-api-types.d.ts) and the query asks for `formatted(withName: true)` (CustomerOrderQuery.ts, shippingAddress block), yet the component does `<p>{order.shippingAddress.formatted}</p>` — React concatenates array children with no separator. Verified with react-dom/server: rendering `<p>{['Franco Viola','100 Crandon Blvd','Key Biscayne FL 33149','United States']}</p>` produces `<p>Franco Viola100 Crandon BlvdKey Biscayne FL 33149United States</p>`. Because `name` is also printed at :166 and `withName: true` includes it again, the block renders:
Franco Viola
Franco Viola100 Crandon BlvdKey Biscayne FL 33149United States
Key Biscayne FL, United States

**Impact:** The "Shipping Address" block on every order detail page is a mashed-together wall of text with the customer's name duplicated and the city/state repeated a third time from `formattedArea`. It is the most-read block on the page and it looks like the site is broken.

**Fix:** Map the array: `{order.shippingAddress.formatted.map((line) => <p key={line}>{line}</p>)}`, drop the separate `<p>{name}</p>` at :166 (since `withName: true` already includes it) and drop the redundant `formattedArea` line at :172-176.

### 20. MEDIUM — OPEN — Order totals table prints every label twice — "Subtotal Subtotal", "Tax Tax", "Total Total"

**Where:** `app/routes/account.orders.$id.tsx:108-160 — /account/orders/:id`

**Evidence:** Each `<tfoot>` row contains two label cells: `<th scope="row" colSpan={3}>Subtotal</th>` immediately followed by `<th scope="row">Subtotal</th>`, then the `<td>` value (same pattern for the Discounts, Tax and Total rows). Measured in the browser against the real stylesheets — `tfoot` rows come back as `"Subtotal||Subtotal|$76.00"`, `"Tax|Tax|$5.32"`, `"Total|Total|$81.32"`, i.e. 3 cells spanning 5 columns in a 4-column table. No CSS anywhere hides the second cell: `grep -rn "tfoot|colspan|account-order" app/styles/*.css` returns nothing, so it renders duplicated at every viewport. Screenshot: scratchpad/v2-orderdetail.png.

**Impact:** The order summary a customer checks against their bank statement reads "Subtotal   Subtotal $76.00 / Tax  Tax $5.32 / Total  Total $81.32", and the footer rows are misaligned with the 4-column header above them.

**Fix:** Delete the duplicate `<th scope="row">` in each of the four `<tfoot>` rows and keep one label cell with `colSpan={3}` so each row totals 4 columns.

### 21. MEDIUM — OPEN — Address forms reuse the same DOM ids, so every label on a saved address wires to the empty "Create address" form

**Where:** `app/routes/account.addresses.tsx:383-500 (AddressForm inputs) — /account/addresses`

**Evidence:** `AddressForm` hardcodes `id="firstName"`, `id="lastName"`, … `id="defaultAddress"`, and the page renders one instance for the new-address form plus one per saved address (:270 and :331-337). With one saved address, Playwright reports 11 duplicated ids: firstName, lastName, company, address1, address2, city, zoneCode, zip, territoryCode, phoneNumber, defaultAddress (each ×2). Resolving the labels via `label.control` shows both "Set as default address" labels point at the checkbox inside the form whose id is `NEW_ADDRESS_ID` — i.e. the create form, not the saved address.

**Impact:** Clicking any field label inside a saved address jumps focus into the blank Create-address form, and clicking "Set as default address" on a saved address toggles the create form's checkbox instead — so a customer trying to change their default address silently does nothing. Screen readers announce the wrong control for every field beyond the first form.

**Fix:** Namespace the ids per form, e.g. `const uid = (f: string) => `${addressId}-${f}`` and use it for every `id`/`htmlFor` pair in `AddressForm` (the hidden `addressId` input already carries the identity, so the ids are free to change).

### 22. MEDIUM — OPEN — Order status shown to customers as raw API enums ("PAID", "SUCCESS", "PARTIALLY_REFUNDED") and "N/A" for unshipped orders

**Where:** `app/routes/account.orders._index.tsx:214-215 and app/routes/account.orders.$id.tsx:42,183 — /account/orders, /account/orders/:id`

**Evidence:** The order card renders `<p>{order.financialStatus}</p>` and `{fulfillmentStatus}` straight from `flattenConnection(order.fulfillments)[0]?.status`. Those are GraphQL enums: `OrderFinancialStatus` = AUTHORIZED|EXPIRED|PAID|PARTIALLY_PAID|PARTIALLY_REFUNDED|PENDING|REFUNDED|VOIDED and `FulfillmentStatus` = CANCELLED|ERROR|FAILURE|OPEN|PENDING|SUCCESS (node_modules/@shopify/hydrogen/dist/customer-account-api-types.d.ts:3484 and :5560) — the schema comments literally say "Displayed as **Paid**", "Displayed as **Partially refunded**", meaning the UI is expected to humanize them. On the detail page, an order with no fulfillment yet falls back to `'N/A'` (:42) and prints that under the "Status" heading. Note the friendlier order-level `fulfillmentStatus` field IS already fetched in both queries (CustomerOrdersQuery.ts:9, CustomerOrderQuery.ts:50) and never used. Screenshots: scratchpad/v2-orderslist.png, scratchpad/v2-orderdetail.png.

**Impact:** A customer's order history reads "PAID / SUCCESS" and "PARTIALLY_REFUNDED"; a brand-new order they just placed shows Status: N/A. It looks like a debug view rather than a storefront.

**Fix:** Add a small label map (PAID→"Paid", PARTIALLY_REFUNDED→"Partially refunded", SUCCESS→"Fulfilled", …) and use the already-fetched order-level `order.fulfillmentStatus` instead of `fulfillments.nodes[0].status`; replace the `'N/A'` fallback with "Not yet shipped".

### 23. MEDIUM — OPEN — "Set as default address" checkbox is stretched to full width and renders centered on its own line, detached from its label

**Where:** `app/styles/pel-chrome.css:1173 (`.pel-account__body input {width:100%}`) applied to app/routes/account.addresses.tsx:493-499 — /account/addresses`

**Evidence:** The branding rule `.pel-account__body input { width: 100%; padding: 12px 14px; … }` has no type filter, so it also hits `input[type="checkbox"]`. Measured computed width of `#defaultAddress` = 348px; the checkbox glyph paints centered in that box at y=4097 while its label sits at y=4120 — a different line. Visible in scratchpad/v2-addresses.png: the checkbox floats alone in the middle of the card with "Set as default address" underneath it on the left.

**Impact:** The one control that decides which address Shopify pre-fills at checkout looks like a stray artifact rather than a labelled checkbox, on both the Create and each saved-address card.

**Fix:** Scope the rule: `.pel-account__body input:not([type='checkbox']):not([type='radio'])`, and give the wrapper `<div>` at :492 `display:flex; align-items:center; gap:8px` with the checkbox at `width:auto`.

### 24. MEDIUM — OPEN — Account forms are capped at 400px by a leftover skeleton reset, leaving two-thirds of the branded card empty

**Where:** `app/styles/reset.css:99-104 (`form { @media (min-width:768px){ max-width:400px } }`) — /account/orders, /account/profile, /account/addresses`

**Evidence:** Computed `max-width: 400px` on every `<form>` in the account body while `.pel-account__inner` is 860px (pel-chrome.css:1089). Measured: the "Filter Orders" form is 400px wide while the order cards next to it are 860px; the 10-field address card is 400px inside the 860px shell. Screenshots scratchpad/v2-orderslist.png (filter box visibly half the width of the order cards) and scratchpad/v2-addresses.png (tall narrow column, right two-thirds of the page empty).

**Impact:** The account area looks half-built: the order filter is a small box floating beside full-width order cards, and the address form is an unnecessarily long single column of 10 stacked fields with dead space beside it.

**Fix:** Either scope the reset (`form:not(.pel-account__body form)`) or override in pel-chrome.css with `.pel-account__body form { max-width: 100% }`, and lay the address fields out as a 2-column grid at ≥768px.

### 25. MEDIUM — OPEN — Address form demands raw ISO codes for country and state with no hint that codes are required

**Where:** `app/routes/account.addresses.tsx:447-457 (zoneCode) and :469-480 (territoryCode) — /account/addresses`

**Evidence:** The country field is labelled "Country Code*" but its placeholder says "Country", it is `maxLength={2}`, and it posts to `territoryCode`. The state field is labelled "State / Province*" with placeholder "State / Province" but posts to `zoneCode`. Both are free-text inputs with no select, no pattern and no helper copy, and the values go straight into `CustomerAddressInput` (:67-86).

**Impact:** A Miami customer typing "Florida" and "United States" — exactly what the labels and placeholders invite — gets a raw Shopify API userError echoed into the `<mark>` block instead of a saved address, with no guidance on what to type instead.

**Fix:** Replace both with `<select>`s (country list + zones for the selected country), or at minimum relabel to "State / Province code (e.g. FL)" and "Country code (e.g. US)" with matching placeholders.

### 26. MEDIUM — OPEN — Destructive address delete has no confirmation, profile save has no success feedback, and all address Save buttons disable together

**Where:** `app/routes/account.addresses.tsx:347-353, :511; app/routes/account.profile.tsx:118-129`

**Evidence:** The Delete button is a bare `formMethod="DELETE"` submit — the action deletes immediately (:188-213) with no confirm step and no undo. The profile action returns `{error: null, customer}` on success but the component only renders `action?.error` (:118-126), so a successful save produces no message. `AddressForm` reads the route-global `useNavigation()` and `stateForMethod` compares only the method (:375, :511), so saving one address puts *every* saved address's Save button into the disabled "Saving" state.

**Impact:** A mis-click permanently removes a saved address; a customer who edits their name sees the button flick back to "Update" with no confirmation it saved; with several addresses the whole list appears to be saving at once.

**Fix:** Add a confirm step (or a two-click "Delete → Confirm") before the DELETE submit; render a success line in profile when `action?.customer && !action.error`; key the address form's pending state to the submitting `addressId` (use a per-form `useFetcher`) instead of route-global navigation state.

### 27. MEDIUM — OPEN — Cart line items display "Title: Default Title" for single-variant products

**Where:** `app/components/CartLineItem.tsx:66-74 (selectedOptions map) and :41-49 (alt={title}); visible in the drawer and on /cart`

**Evidence:** Added each product and read the rendered line item: por-el-deporte-cap → "POR EL DEPORTE CAP | $35.00 | Title: Default Title"; the-tote → "DRV PNK TOTE | $35.00 | Title: Default Title"; el-clasico-tote → "EL CLÁSICO TOTE | $35.00 | Title: Default Title". Multi-variant products render correctly ("Color: White", "Size: M"). The line image's alt attribute is `title`, i.e. also the literal string "Default Title" for these products. Captured in screenshot of /cart.

**Impact:** Three of the store's products show Shopify's internal placeholder option name in the cart, on both the drawer and the cart page, and screen readers announce the cart image as "Default Title".

**Fix:** Filter the options before rendering: `selectedOptions.filter(o => !(o.name === 'Title' && o.value === 'Default Title'))`, and use `product.title` (not the variant title) for the image alt.

### 28. MEDIUM — OPEN — Invalid discount code fails completely silently — no error, no clearing, no feedback

**Where:** `app/components/CartSummary.tsx:99-118 + app/components/CartMain.tsx:178-214 (CartMessages) + app/routes/cart.tsx:37-50`

**Evidence:** On /cart with one item I filled the discount field with TOTALLYFAKECODE123 and clicked Apply. After the mutation settled: subtotal unchanged at $35.00, `.pel-cart-msg` count = 0, no Discounts row appeared, and the bogus code was still sitting in the input (visible in screenshot). Shopify's cartDiscountCodesUpdate returns the code with `applicable: false` and no userError, and CartMessages only surfaces `errors`/`warnings` from the fetcher, so nothing is ever shown.

**Impact:** A customer who mistypes a code, or tries a code that has expired, gets zero response from the page. They will click Apply repeatedly and then either abandon or email asking why the code doesn't work.

**Fix:** After the DiscountCodesUpdate action, compare the submitted code against the returned `cart.discountCodes` and render an inline "That code isn't valid" message (and clear the field on success, the way the gift-card field already does at CartSummary.tsx:155-161).

### 29. MEDIUM — OPEN — Large unexplained vertical gaps between the discount and gift-card rows in both cart layouts

**Where:** `app/components/CartSummary.tsx:99-118 and :223-244 (skeleton `&nbsp;` / `<br />` markup); rendered on /cart and in the drawer`

**Evidence:** Measured on /cart: the gift-card input's top is 76px below the discount input's bottom (`gapPx: 76`) for 42px-tall fields. In the drawer the same gap is ~113px (discount input at y 494, gift-card input at y 607). CartCheckoutActions also emits a stray `<br />` after the checkout link (CartSummary.tsx:57).

**Impact:** The Totals block looks like unfinished scaffolding: two small fields floating in large empty bands, with the checkout CTA pushed far from the subtotal it relates to.

**Fix:** Replace the `&nbsp;`/`<br />` spacing in CartSummary with real flex rows and a defined gap, and drop the trailing `<br />`.

### 30. MEDIUM — OPEN — Quick-add-to-cart buttons on the shop grid have no accessible name

**Where:** `app/components/shop/ShopPage.tsx:209-217 (and app/components/AddToCartButton.tsx:28-35) — /collections/all-products`

**Evidence:** axe-core (wcag2a/aa) reports `button-name` with impact CRITICAL, 3 nodes: `.pel-shopcard:nth-child(13|14|15) > form[action="/cart"] > button[type="submit"]`, html `<button type="submit" class="pel-shopcard__add">` whose only child is the `plusIcon` SVG carrying `aria-hidden="true"` (ShopPage.tsx:173-177). Computed accessible name is the empty string. Enumerating all 16 cards in the browser: El Clásico Tote, DRV PNK Tote and Por El Deporte Cap render `addTag:"button", addLabel:null, addText:""`; the other 13 cards take the `needsChoice` branch (ShopPage.tsx:202-208), which is an `<a>` and DOES set `aria-label="Choose options for <title>"`. `AddToCartButton` accepts no aria-label prop at all, so none can be forwarded.

**Impact:** A screen-reader or voice-control user on the main shop page hears only "button" for the add-to-cart control on the three single-variant, in-stock products, with no indication of what it does or which product it adds. The identical control on the other 13 cards is announced correctly, so the failure is silent and inconsistent.

**Fix:** Add an optional `aria-label` prop to `AddToCartButton` and forward it to the `<button>`, then pass `aria-label={`Add ${product.title} to cart`}` in the ShopPage AddToCartButton branch, mirroring the `Choose options for …` label already used on the sibling Link branch.

### 31. MEDIUM — OPEN — Cart drawer is marked aria-modal but focus never enters it, is not trapped, and is not restored on close

**Where:** `app/components/Aside.tsx:56-74 (aria-modal at :58) — reproduced on /collections/all-products`

**Evidence:** Driving the page with Playwright: after clicking the header Cart pill the overlay becomes `class="overlay expanded"`, `visibility:visible`, but `document.activeElement` is still `BUTTON.pel-pill` and `focusMovedInto: false`. 14 consecutive Tab presses all reported `OUTSIDE` the dialog — `a[Home]`, then `button.pel-chip[All|Hats|Hoodies|Jerseys|Tees|Totes]`, then `a.pel-shopcard__link`/`a.pel-shopcard__add` for card after card — i.e. focus walks the collection grid behind the open overlay. `aria-modal` is written as a bare JSX attribute so it computes to `"true"` permanently, including when closed (measured `ariaModal:"true"` with `visibility:hidden`). Escape does close the drawer, but focus afterwards was `A.pel-shopcard__link`, not the Cart button that opened it.

**Impact:** A keyboard user who opens the cart cannot reach the cart contents, the Close button, or Checkout by tabbing — they tab through the whole page behind the overlay instead. Because aria-modal="true" tells assistive tech the rest of the page is inert while focus is actually parked outside the dialog, a screen-reader user can be left with nothing reachable at all. This blocks checkout from the keyboard.

**Fix:** In Aside.tsx, set `aria-modal={expanded || undefined}` (and ideally `role="dialog"` only when expanded, or `inert`/`hidden` when not), move focus to the dialog (the Close button or the aside container) in the existing `expanded` useEffect, cycle Tab/Shift+Tab within the overlay while open, and restore focus to the previously focused element on close.

### 32. MEDIUM — OPEN — About-page mission copy is dark brown on orange at 2.47:1 — the worst contrast on the site

**Where:** `app/components/about/AboutPage.tsx → `.pel-mission__body` inside `.pel-mission__panel` — /about`

**Evidence:** Computed styles: `color: rgb(122,46,23)` (#7A2E17), font 12.5px weight 700, on parent `.pel-mission__panel` `background-color: rgb(206,100,62)` (#CE643E) with no background image and opacity 1 — so it is a flat colour pair. Ratio = 2.47:1 against a required 4.5:1. Independently confirmed by rendered-pixel sampling of the element screenshot (bg=rgb(206,100,62) 78.8% of box, glyph core=rgb(122,46,23), measured ratio 2.47) and by a with-text/without-text differential capture in which 100% of glyph-core pixels fell below 4.5:1. Text: "Since 2014 we have been putting on games in Key Biscayne and making room for whoever wants to play. Every jersey, tee, and hat helps pay for the next match." A screenshot of the panel shows it as visibly washed-out against the orange.

**Impact:** The paragraph that states the brand's mission and where customers' money goes is the least readable text on the site — barely half the required contrast. Low-vision customers, and anyone on a phone in Miami daylight, will struggle to read it at all.

**Fix:** Darken the copy colour substantially on the orange panel (e.g. to `var(--pel-ink)` #171717, which gives ~6.0:1 on #CE643E) or switch to `var(--pel-cream)` on a darker panel. #7A2E17 cannot reach 4.5:1 against #CE643E.

### 33. MEDIUM — OPEN — Brand orange and cream fail 4.5:1 against each other, hitting the newsletter CTA, the active nav item and the PDP colour swatch

**Where:** `app/styles/pel-tokens.css:23 (`--pel-orange: #ce643e`); app/styles/home.css:980-988 (`.pel-newsletter__btn`); app/styles/product.css:193-198 (`.pel-pdp__swatch-name`) — /, /about, /collections/all-products, /products/*`

**Evidence:** axe-core `color-contrast` (SERIOUS) measures both directions at 3.34:1 versus a 4.5:1 requirement. Cream on orange: `.pel-newsletter__btn` "Notify Me" (fg #f7f0de, bg #ce643e, 12px bold) on all four audited pages; `.pel-pdp__swatch-name` "Ivory" (18px, weight 600 — under the 18.66px-bold large-text cutoff, so 4.5:1 applies); `.pel-pdp__fabric > span` × 3 ("Plastic-Free", "100% ring-spun cotton", "Super-soft heavyweight"). Orange on cream: `a[aria-current="page"].is-active` ("About" on /about, "Shop" on /collections/all-products, 13px bold), `.pel-shop__count > span` "16" (22px normal), `.pel-values__eyebrow`, `.pel-value__n`. Rendered-pixel checks reproduced 3.35 for the Notify Me button, the active nav link, the swatch name and the values eyebrow.

**Impact:** The newsletter's only submit button, the header indicator showing which page you are on, and the label of the currently selected product colour are all under-contrast on every page. The swatch name matters most commercially: a customer with low vision cannot reliably confirm which colourway they have selected before adding to cart.

**Fix:** Darken the orange used behind or as text (e.g. #B44E2A gives ~4.6:1 against #F7F0DE and ~4.7:1 under cream), or keep #CE643E purely for large display type and fills while using `var(--pel-ink)` for text on orange and a darker orange for orange-on-cream text.

### 34. MEDIUM — OPEN — Announcement marquee text is 3.9:1 on blue on every page

**Where:** `app/components/PelMarquee.tsx via app/components/PelHeader.tsx:17 — all four audited pages`

**Evidence:** axe-core `color-contrast` (SERIOUS), 6 nodes per page: `.pel-marquee__group:nth-child(1) > span:nth-child(n) > span`, measured fg=#f7f0de on bg=#4576ce at 3.9:1 against a 4.5:1 requirement, font-size 9.0pt (12px) weight bold. Rendered-pixel sampling of `.pel-marquee` returned bg=rgb(69,118,206) covering 86.5% of the band with glyph core rgb(247,240,222) at ratio 3.9, confirming the computed value. Content includes substantive information: "Free Shipping on U.S. Orders", "On Your Doorstep in 1 Week", "Beyond the Game".

**Impact:** The band that carries the free-shipping and delivery-time promises sits below AA on every page, at only 12px. This is prime conversion copy that some customers will not be able to read.

**Fix:** Darken the marquee background (#3560AE against #F7F0DE gives ~5.2:1) or drop the blue band's text to `var(--pel-ink)`. The duplicated second `.pel-marquee__group` is already correctly `aria-hidden="true"`, so only the colour needs changing.

### 35. MEDIUM — OPEN — /collections renders four blank beige squares — no collection has an image

**Where:** `app/routes/collections._index.tsx:93-103 (image is conditional) and app/styles/pel-chrome.css:946-952 (`.pel-collections__well` is a bordered 1:1 sand block)`

**Evidence:** Rendered markup for all four cards is `<div class="pel-collections__well"></div><h3 …>All Products</h3>` — the well is empty on every one. An alt-text sweep of /collections found only the two footer photos and the logo; zero collection images. `.pel-collections__well` has `aspect-ratio: 1`, a 2px ink border and a sand background, so each renders as a large empty box.

**Impact:** The "Browse / Collections" page — reachable from search engines and the only category index — is a grid of four blank tan rectangles with text labels under them. It reads as a half-built page rather than a shop.

**Fix:** Upload a collection image for each collection in Shopify admin (Collections → Featured image). Optionally fall back to the collection's first product image in CollectionItem so the page can never render empty wells again.

### 36. MEDIUM — OPEN — Every collection page is headed "Gear Up." with tees/hats/totes copy; the collection's own name never appears in a heading

**Where:** `app/components/shop/ShopPage.tsx:78-86 — `title` is passed in but used only for the breadcrumb and aria-label; the H1 and eyebrow are hardcoded`

**Evidence:** Banner text scraped from all four collection pages is identical apart from the count: "Shop All • 16 Styles / Gear Up. / Every tee, hat, and tote supports our Key Biscayne community…" for all-products, and "Shop All • 0 Styles / Gear Up. / Every tee, hat, and tote…" for Official Kits. The `<title>` tags do differ ("Por El Deporte | Official Kits"), so the data is available and simply unused. Meta description is also the same hardcoded fallback on all four (collections.$handle.tsx:15-17) because no collection has a description.

**Impact:** On /collections/all-tees the page never says "Tees"; on Official Kits it says "Shop All • 0 Styles / Gear Up. / Every tee, hat, and tote…", which mentions neither kits nor jerseys and contradicts the page a customer thought they clicked into. The browser tab and the H1 disagree on every collection page.

**Fix:** Use the passed-in `title` in the eyebrow ("{title} • {n} Styles") and/or the H1, and let the collection's Shopify description override the hardcoded subline when present.

### 37. MEDIUM — OPEN — Render-blocking Google Fonts stylesheet gates first paint and delays the brand font, which is never preloaded; a third of that request is for a font that never paints

**Where:** `app/root.tsx:68-76 (links export), app/styles/pel-tokens.css:10-18 and :60, both / and /products/*`

**Evidence:** Resource timing with renderBlockingStatus: all 7 local stylesheets are `blocking` but complete by 40 ms (tailwind 2.4 KB enc, reset 0.5, app 1.9, pel-tokens 2.0, pel-chrome 3.9, home 4.4, pel-cart 1.4). Render then stays blocked until 136 ms waiting on the 8th blocking resource, `fonts.googleapis.com/css2?family=Fraunces...&family=Montserrat...` (22-136 ms) — and that in turn pushes the local brand font TAYFlapjack.woff2 (19.8 KB, cross-origin on cdn.shopify.com) to 144-219 ms. `.pel-hero__title` uses `var(--font-display)` = Flapjack (pel-tokens.css:60) and was an LCP candidate at 196 ms, i.e. it paints in Georgia first and swaps. There is no `rel="preload"` for the woff2 anywhere: `grep -rn "rel=.preload.|as: 'image'|fetchpriority" app` returns zero hits. Separately, Fraunces is dead: it appears only as a fallback *behind* Flapjack in `--font-display`, and `document.fonts` reports all 3 Fraunces faces `unloaded` after full load while Flapjack is `loaded` — yet `family=Fraunces:opsz,wght@9..144,300..900` inflates the render-blocking response from 7,664 B (Montserrat only) to 9,038 B. font-display itself is correct (`swap` on both).

**Impact:** First paint on every page waits on a third-party DNS+TLS+response round trip — 114 ms on localhost with preconnect, typically 300-600 ms on real mobile — and the brand's display typeface arrives third in a serial chain, so the hero headline flashes in Georgia before snapping to Flapjack.

**Fix:** Add `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/TAYFlapjack.woff2">` to root.tsx's links so the font starts in the first RTT instead of at 144 ms; delete `family=Fraunces:opsz,wght@9..144,300..900` from the Google Fonts URL at root.tsx:76 and drop 'Fraunces' from `--font-display`; and self-host Montserrat (or load the Google stylesheet non-blocking) so first paint no longer depends on fonts.googleapis.com.

### 38. MEDIUM — OPEN — Product page editorial strip: 707 KB of hand-written imgs at fixed width=800 into 352x440 / 240x300 boxes

**Where:** `app/components/product/ProductPage.tsx:350 and :357, URL path /products/artisan-ped-hoodie`

**Evidence:** Five `<img src={m.src} ... loading="lazy" />` tags with no srcset and `sizes` null, each hardcoded `?width=800`. Measured on-page bytes: 167 KB, 97 KB, 247 KB, 88 KB, 108 KB = 707 KB, which is 72% of the product page's 978 KB desktop image weight (1.69 MB page total, 54 requests). Rendered boxes are 352x440 on desktop 1440@DPR1 (needs 352) and 240x300 on mobile 390@DPR2 (needs 480) — so desktop over-serves 2.3x linear. The strip is rendered twice in the DOM for the marquee duplication (same URLs, so cached, no double download).

**Impact:** Two thirds of the product page's image budget goes to a decorative scrolling strip below the buy box, at more than double the resolution any viewport displays.

**Fix:** Add srcset (400/500/800) and `sizes="(min-width: 60em) 352px, 240px"` to the img at ProductPage.tsx:350/357, or drop the hardcoded width from 800 to 500.

### 39. MEDIUM — OPEN — /collections renders as four completely blank boxes — and it is the destination of the account area's only 'Start Shopping' CTA

**Where:** `/Users/francoviola/Desktop/ViolaCreative/por-el-deporte-ecommerce/app/routes/collections._index.tsx:93-103; style at app/styles/pel-chrome.css:946; inbound link at app/routes/account.orders._index.tsx:111`

**Evidence:** Storefront API confirms all four collections return image: null (all-products, 2022-kits, 2023-por-el-deporte-kits, all-tees). collections._index.tsx:94 guards with `{collection?.image && <Image .../>}`, so .pel-collections__well renders empty — and pel-chrome.css:946 gives it aspect-ratio: 1, a 2px ink border and a sand background. Screenshot at 1280x900 shows four empty beige squares with only a title beneath each; at 390x844 each empty square fills nearly the whole viewport, so the page is a vertical stack of four blank boxes. The cards also show no product count, so 'OFFICIAL KITS' and '2023 POR EL DEPORTE KITS' look identical to the populated ones. /collections is not in any sitemap and is not linked from the header or footer — its one inbound link is app/routes/account.orders._index.tsx:111, `<Link to="/collections">Start Shopping →</Link>`, shown to a signed-in customer who has placed no orders.

**Impact:** The single moment the site invites a new registered customer to start shopping, it sends them to a page of four empty rectangles — two of which lead to empty collections. Every other shop CTA on the site points at /collections/all-products, which works.

**Fix:** Point account.orders._index.tsx:111 at /collections/all-products like every other shop CTA. For the /collections page itself, render a fallback inside .pel-collections__well when collection.image is null (the collection's first product image, or the brand mark on sand) so the card is never an empty box — or upload collection images in Shopify admin.

### 40. MEDIUM — OPEN — Two empty collections are live, promoted in the site footer, and listed in the sitemap; the empty collection page still runs the 'Gear Up.' sell hero over zero products

**Where:** `/Users/francoviola/Desktop/ViolaCreative/por-el-deporte-ecommerce/app/components/PelFooter.tsx:18; hero copy at app/components/shop/ShopPage.tsx:79-85`

**Evidence:** Storefront API `products(first:1)` returns [] for both 2022-kits and 2023-por-el-deporte-kits. PelFooter.tsx:18 links 'Official Kits' → /collections/2022-kits, and that footer renders on every page. /sitemap/collections/1.xml lists both empty handles. Rendered page (screenshot of /collections/2022-kits) reads: hero 'SHOP ALL • 0 STYLES' / 'GEAR UP.' / 'Every tee, hat, and tote supports our Key Biscayne community. Rep the club and grab your favorites.', then '0 PRODUCTS' and 'NOTHING HERE YET. / Nothing here right now. Check back soon.' Note also PelFooter.tsx:17 labels a link 'Hats & Totes' but points it at /collections/all-products, the same target as 'All Products' on the next line.

**Impact:** A shopper clicking 'Official Kits' from the footer of any page gets a full-bleed hero selling gear, a '0 STYLES' eyebrow, and an empty grid — the page contradicts itself. Google is being fed two thin, empty collection URLs from the sitemap.

**Fix:** Repoint the 'Official Kits' footer link at a populated collection (or unpublish 2022-kits and 2023-por-el-deporte-kits from the Hydrogen sales channel so they leave the sitemap and 404 cleanly). In ShopPage, when products.length === 0 suppress the 'Shop All • N Styles' eyebrow and the 'grab your favorites' sell line and lead with the empty-state copy instead. Also fix the 'Hats & Totes' label or give it a real destination.

### 41. MEDIUM — OPEN — Sold-out variants are signalled by 35% opacity alone — still clickable, no accessible state, and no explanation once the shopper is in a dead end

**Where:** `/Users/francoviola/Desktop/ViolaCreative/por-el-deporte-ecommerce/app/components/product/ProductPage.tsx:238-239 (and the isDifferentProduct branch at :227)`

**Evidence:** game-shorts is the only product in the catalog with unavailable variants (Storefront API: Medium/Black, Medium/White and X-Large/Black are unavailable; 3 of 6). Driven with Playwright on /products/game-shorts: the 'Medium' size button renders opacity '0.35' with disabled=false and aria-disabled=null — it is a fully operable button with no accessible out-of-stock state and no text or strikethrough. Clicking it navigates to ?Size=Medium&Color=Black; 'Medium' is then simultaneously is-active AND still at opacity 0.35 (so the current selection is styled the same as an unavailable one), both colour swatches drop to 0.35, and the CTA becomes a disabled button reading 'SOLD OUT'. Nothing on the page says which size is in stock. The same state is reached directly by deep link /products/game-shorts?Size=Medium&Color=Black.

**Impact:** A screen-reader user hears 'Medium, button' with no indication it is out of stock, selects it, and lands on a disabled button. A sighted shopper who arrives on a shared ?Size=Medium link sees a greyed-out SOLD OUT with no next step, and cannot tell at a glance that Large and X-Large are available because the active chip is faded too. Opacity-only signalling at 0.35 on the sand background is also very low contrast.

**Fix:** On option values where `avail` is false: set aria-disabled="true", add a visually-hidden ' (sold out)' to the label, and add a strikethrough (Hydrogen's own convention) rather than relying on opacity. Keep the active chip at full opacity so the current selection is always legible. When selectedVariant.availableForSale is false, render a line under the CTA naming the available alternatives, e.g. 'Medium is sold out — try Large or X-Large.'

### 42. MEDIUM — OPEN — Product meta/og descriptions are missing spaces between sentences and run 60-150% over the SERP snippet limit

**Where:** `app/routes/products.$handle.tsx:22-25 (`product.seo?.description || product.description`) — URL paths: /products/the-tote, /products/kit-launch, /products/ball-blueprint-tee, /products/drv-pnk-tee, /products/el-clasico-tote, /products/island-sketch-tee, /products/la-isla-tee, /products/game-shorts, /products/ocean-sunset-tee`

**Evidence:** Rendered `<meta name="description">` on /products/the-tote: "Por El Deporte on the front, everything else inside.A nod to Inter Miami and to Key Biscayne, where this all started in 2014.Thick cotton canvas with a flat bottom and handles…" — note `inside.A` and `2014.Thick`. /products/kit-launch: "The one from CBS Golazo.Made with Worldie FC…". /products/ocean-sunset-tee: "drawn simply and printed small.100% cotton, relaxed fit." I measured all 17 products in the sitemap: 9 of 17 contain a `[a-z0-9][.!?][A-Z]` sentence-glue defect, and 11 of 17 exceed 160 characters (the longest, /products/futbol-mate-asado-tee, is 307 chars). The same string is reused verbatim for `og:description`, `twitter:description`, and the Product JSON-LD `description` (products.$handle.tsx:41), so the defect is emitted four times per page. Cause: `product.description` is Shopify's tag-stripped plaintext of `descriptionHtml`, which drops the `</p><p>` boundary without substituting whitespace.

**Impact:** Google's snippet and every iMessage/WhatsApp/Slack/X link preview for over half the catalogue shows sentences welded together ("inside.A nod to Inter Miami"), reading like broken machine output, and the long ones get truncated mid-sentence with an ellipsis. These are the storefront's most-shared URLs.

**Fix:** In products.$handle.tsx:22-25, build the description from `product.descriptionHtml`: replace block-closing tags (`</p>`, `<br>`, `</li>`, `</div>`, `</h[1-6]>`) with a space before stripping remaining tags, decode entities, collapse runs of whitespace, then truncate at the last word boundary before ~155 chars. Keep `product.seo?.description` as the first-choice override. Put the helper in app/lib/seo.ts so the JSON-LD `description` gets the cleaned value too.

### 43. MEDIUM — OPEN — All four collection pages share one identical meta description, and no collection page has an og:image

**Where:** `app/routes/collections.$handle.tsx:15-19; app/lib/seo.ts:38-80 (no default image) — URL paths: /collections/all-products, /collections/all-tees, /collections/2022-kits, /collections/2023-por-el-deporte-kits, plus /collections and /policies*`

**Evidence:** All four collection URLs render the byte-identical string `<meta name="description" content="Shop Por El Deporte apparel. Original club designs, 100% cotton, free shipping."/>` — i.e. every one falls through to the hardcoded fallback at collections.$handle.tsx:17 because no collection has a description in Shopify. `og:image` is absent on all four (the route passes `collection?.image?.url`, and no collection has an image set), and absent on /collections, /policies, /policies/privacy-policy and /policies/refund-policy. Because `seoMeta()` has no default image, it also downgrades those pages to `<meta name="twitter:card" content="summary"/>`. Only / and /about carry an og:image.

**Impact:** /collections/all-products is the destination of the "Shop" link in the header (app/components/PelHeader.tsx:26) and of three of the four footer shop links — it is the single most-shared URL after the homepage, and pasting it into Instagram DMs, WhatsApp or iMessage produces a bare grey text card with no picture. In search, four distinct shop URLs offer Google the same 78-character snippet, so it will rewrite or ignore them.

**Fix:** Add a `DEFAULT_OG_IMAGE` constant in app/lib/seo.ts and use it whenever `image` is falsy (the homepage's `…acajiga-26.jpg?…&width=1200` already works and is the natural site-wide card), which fixes collections, /collections, and the policy pages at once. Separately, write a real description for each collection in Shopify admin so `collection.description` stops falling through to the shared fallback.

### 44. MEDIUM — DRAFTED — /policies/refund-policy serves the Privacy Policy text verbatim — there are no refund terms anywhere on the site

**Where:** `Shopify admin content for the Refund Policy field (route code in app/routes/policies.$handle.tsx is correct). URLs: /policies/refund-policy, linked from /policies and the footer "REFUND POLICY"`

**Evidence:** Extracted and hashed the `.pel-prose` body of both pages from the live server: /policies/privacy-policy → 2433 chars, sha1 c622fe097f49; /policies/refund-policy → 2433 chars, sha1 c622fe097f49. Byte-identical. Both open "Effective Date: April 1st, 2024 Welcome to Por El Deporte. Your privacy and trust are important to us, and this Privacy Policy provides important information about how we handle personal information…" under an h1 reading "REFUND POLICY". I confirmed app/routes/policies.$handle.tsx:31-42 correctly maps the `refund-policy` handle to the `refundPolicy` Storefront field, so the duplication is in the store's content, not the code.

**Impact:** A customer trying to find out whether they can return a $78 jersey clicks "REFUND POLICY" in the footer and gets a privacy policy. The store has no stated return window, condition or process anywhere, and the page is in /sitemap/site/1.xml so it is indexed that way.

**Fix:** Replace the Refund Policy body in Shopify admin (Settings → Policies → Refund policy) with actual return/refund terms. No code change needed.

### 45. MEDIUM — FIXED — Product page's main gallery image — the LCP element — is marked loading="lazy"

**Where:** `app/components/product/ProductPage.tsx:144, URL path /products/artisan-ped-hoodie`

**Evidence:** Hydrogen's <Image> defaults to lazy, and line 144 passes no `loading`/`fetchpriority`. The served HTML confirms it: `<img ... loading="lazy" sizes="(min-width: 60em) 640px, 100vw" ...>`. PerformanceObserver identifies this exact image as the LCP element on both 1440x900@DPR1 (box 547x558) and 390x844@DPR2 (box 350x357). Throttled A/B (mobile, Regular 4G 1.6 Mbps / 150 ms RTT / 4x CPU) rewriting only that one attribute to `loading="eager" fetchpriority="high"`: as-is LCP 2,060 ms with the image request starting at 635 ms; fixed LCP 808 ms with the request starting at 43 ms. The lazy attribute keeps the preload scanner from ever seeing it, so it waits ~600 ms for layout.

**Impact:** The product photo — the single thing a shopper needs to see before buying — takes 2.6x longer to appear than it should on mobile, leaving an empty box at the top of every product page for the first 2 seconds.

**Fix:** Pass `loading="eager"` and `fetchpriority="high"` to the main <Image> at ProductPage.tsx:144 (leave the 4 thumbnails at :157 lazy). Also tighten `sizes` — the actual desktop box measures 547px, not the declared 640px.

### 46. MEDIUM — FIXED — Homepage ships 4.5 MB of images; the 15-tile Instagram grid alone is 2.5 MB, every tile hardcoded to width=700 for a ~170px box

**Where:** `app/components/home/InstagramFeed.tsx:7-21 and :55, URL path /`

**Evidence:** Full-scroll Playwright measurement of the homepage: 32 images totalling 4,616 KB (4.51 MB) of a 5,415 KB / 73-request page on desktop; 4,416 KB of images / 5.09 MB total / 68 requests on mobile 390x844@DPR2. The 15 pel-ig__img tiles measure 2,561 KB of that. Every tile is a template literal ending `?width=700` with no srcset/sizes — measured `sizes` attribute is null on all 15. Rendered boxes: 168x210 CSS px on mobile (needs ~336 device px at DPR2) and 250x312 on desktop (needs 250 at DPR1). So each tile delivers 700x1050 into a 168x210 box — 4.3x more pixels than the device can show. Real CDN bytes for two samples: goalkeeper-stretched-low width=700 = 247,928 B vs width=340 = 75,368 B (-70%); slide-tackle width=700 = 228,222 B vs width=340 = 72,614 B (-68%). Individual tiles measured on-page range 47 KB to 242 KB.

**Impact:** A phone visitor who scrolls the homepage burns ~4.3 MB of cellular data, roughly 1.7 MB of it on a decorative photo wall rendered at a quarter of the resolution delivered. On throttled 4G the page never fired its load event inside 120 seconds.

**Fix:** Add a `srcset` (340/400/500/700) and `sizes="(min-width: 48em) 250px, 168px"` to the tile img at InstagramFeed.tsx:55, or render the tiles through Hydrogen's <Image> which generates these automatically — the same component already does it correctly for the product rail cards.

### 47. MEDIUM — FIXED — Any product/collection/page/blog URL containing a percent-encoded character (e.g. a trailing space) 302s to itself forever — the browser shows ERR_TOO_MANY_REDIRECTS instead of the branded 404

**Where:** `/Users/francoviola/Desktop/ViolaCreative/por-el-deporte-ecommerce/app/lib/redirect.ts:15 (and :21); callers at app/routes/collections.$handle.tsx:59, app/routes/products.$handle.tsx:133, app/routes/pages.$handle.tsx:62, app/routes/blogs.$blogHandle._index.tsx:49, app/routes/blogs.$blogHandle.$articleHandle.tsx:42`

**Evidence:** curl -s -D - 'http://localhost:3000/collections/all-products%20' returns 'HTTP/1.1 302 Found' with 'Location: http://localhost:3000/collections/all-products%20' — identical to the request. curl -L --max-redirs 12 burns all 12 redirects and never resolves. Playwright page.goto() on /collections/all-products%20 and /products/la-isla-tee%20 both fail with 'net::ERR_TOO_MANY_REDIRECTS'. Same loop reproduced on /pages/our-mission%20, /blogs/news%20 and /blogs/news/brickell-league-final%20 (all 6/6 redirects consumed). Mechanism: params.handle is decoded ('all-products '), the Storefront API resolves the trimmed handle and returns handle 'all-products', so `handle !== data.handle` is true; line 15 then does url.pathname.replace('all-products ', 'all-products') against the *encoded* pathname '/collections/all-products%20', which contains no literal space, so the replace is a no-op and line 21 throws a redirect to the exact same URL.

**Impact:** A customer who follows a link with a trailing space — routinely produced by email clients, Instagram bios, PDFs, SMS and link wrappers appending %20 — gets Chrome's raw 'This page isn't working / ERR_TOO_MANY_REDIRECTS' error page. No branding, no logo, no way back into the store, and the carefully built 404 page never renders. Googlebot sees an infinite redirect chain on the same URLs.

**Fix:** In redirectIfHandleIsLocalized, operate on decoded path segments instead of the raw pathname (e.g. rebuild the path from url.pathname.split('/').map(decodeURIComponent) and re-encode), and add a safety guard so the redirect is only thrown when the newly built URL actually differs from request.url — otherwise fall through (or throw a 404). The guard alone converts this blocker into a normal page render.

### 48. MEDIUM — FIXED — The 404 page renders with no <title>, no meta description and no robots tag at all

**Where:** `app/root.tsx:167-186 (Layout/<Meta />, no `meta` export on root); app/routes/$.tsx:3-7 — URL path: any non-existent URL, e.g. /this-page-does-not-exist`

**Evidence:** `curl -s http://localhost:3000/this-page-does-not-exist` returns 404 and the entire <head> contains only charset/viewport/theme-color/stylesheets/icons — no <title>, no `name="description"`, no canonical, no `name="robots"`. Confirmed in a real browser with Playwright: `page.title()` for that URL returns the empty string `""` (vs `"Por El Deporte | Cart"` for /cart). The branded body copy does render ("404 / Off the pitch / We could not find that page…"), so the page looks finished but is headless. Cause: `$.tsx`'s loader throws a Response, so no route `meta()` runs, and `root.tsx` has no `meta` export to fall back on (grep for `export const meta|export function meta` across app/ matches 17 route files and never root.tsx).

**Impact:** Every mistyped URL, dead inbound link, and stale social/email link gives the customer a browser tab labelled with the raw URL (`localhost:3000/this-page-does-not-exist`) instead of the brand. The same headless <head> is served for every 5xx via the shared ErrorBoundary, so an outage page is also nameless. Bookmarking or sharing a 404 yields a bare-URL preview.

**Fix:** Add `export const meta` to app/root.tsx returning a default `{title: 'Por El Deporte'}` plus `{name: 'robots', content: 'noindex'}`. Root meta still runs when a descendant route throws, so this covers the 404 and 500 boundaries in one place, and every child route's `meta()` already overrides the title on success.

### 49. MEDIUM — FIXED — All four blog routes still carry stock Hydrogen-skeleton meta: no canonical, no description, no Open Graph, and "… blog" / "… article" titles

**Where:** `app/routes/blogs._index.tsx:9-11; app/routes/blogs.$blogHandle._index.tsx:8-10; app/routes/blogs.$blogHandle.$articleHandle.tsx:6-8 — URL paths: /blogs, /blogs/news, /blogs/brickell-soccer-padel-2024, /blogs/news/brickell-league-final`

**Evidence:** Every blog URL returns 200 with a <head> containing only a <title> — `name="description"`, `rel="canonical"`, `og:url`, `og:type` and `og:image` are all absent (verified by curl on all four). Every other indexable route on the site goes through `seoMeta()` in app/lib/seo.ts and gets the full set. The titles are the unmodified skeleton templates: `Por El Deporte | Blogs`, `Por El Deporte | News blog`, `Por El Deporte | BRICKELL SOCCER PADEL 2024 blog`, `Por El Deporte | Brickell League Final article`. All four URLs are actively submitted to Google: /blogs/news and /blogs/brickell-soccer-padel-2024 appear in /sitemap/blogs/1.xml and /blogs/news/brickell-league-final appears in /sitemap/articles/1.xml.

**Impact:** Sitemap-advertised pages compete for indexing with no snippet control (Google invents one from body text), no canonical to absorb `?utm_*` and other query-string variants, and no link-preview card. A customer who shares the one published article gets a bare URL in the chat. The literal word "blog"/"article" appended to a title, and the all-caps "BRICKELL SOCCER PADEL 2024", read as unfinished template output next to the rest of the site.

**Fix:** Route the three blog `meta()` exports through `seoMeta()` like collections.$handle.tsx does: title `Por El Deporte | ${title}` with no " blog"/" article" suffix (title-case the blog title, or set a proper title in Shopify admin for the all-caps one), description from `article.seo?.description || article.excerpt`, `url` from `siteOrigin(matches) + location.pathname`, `image` from `article.image?.url`, and `type: 'article'` on the article route.

### 50. LOW — OPEN — Invalid <legend> placement and unstyled <h3>s in the account body

**Where:** `app/routes/account.profile.tsx:93, app/routes/account.addresses.tsx:269 and :330; app/routes/account.orders.$id.tsx:163,181`

**Evidence:** "Personal information" is a `<legend>` sitting directly inside `<Form>` before the `<fieldset>` (profile.tsx:92-94); "Create address" and "Existing addresses" are `<legend>` elements inside plain `<div>`s. A `<legend>` outside a `<fieldset>` is invalid HTML and provides no accessible grouping name — the actual fieldsets in both forms have no legend. Separately, `.pel-account__body` styles `h2` only (pel-chrome.css:1145); the order-detail `<h3>`s ("Shipping Address", "Status") compute to Montserrat 18.72px/700 while every other account heading uses the Fraunces display face.

**Impact:** Screen readers announce the address and profile fieldsets as unnamed groups, and the two headings on the order detail page fall out of the brand type system (visible in scratchpad/v2-orderdetail.png).

**Fix:** Move each `<legend>` inside its `<fieldset>` (or change it to an `<h3>`), and add a `.pel-account__body h3` rule using `var(--font-display)`.

### 51. LOW — OPEN — Empty close-overlay button inside the cart dialog has no accessible name

**Where:** `app/components/Aside.tsx:63`

**Evidence:** `<button className="close-outside" onClick={close} />` has no children, no aria-label and no title. With the cart drawer open, axe-core reports `button-name` impact CRITICAL for target `.close-outside`, html `<button class="close-outside"></button>`, reason "Element does not have inner text that is visible to screen readers; aria-label attribute does not exist or is empty". It is present in the DOM on every page (measured as not-visible while the overlay is `visibility:hidden`, and flagged as soon as the overlay is expanded).

**Impact:** Once the cart is open, the dialog contains a focusable control that assistive tech announces as an unlabelled "button", giving no clue that activating it dismisses the cart.

**Fix:** Add `aria-label="Close cart"` to the `.close-outside` button, or make it a non-focusable presentational click-catcher (`<div>` with an onClick plus `aria-hidden="true"`, given the labelled Close button already exists at Aside.tsx:67).

### 52. LOW — OPEN — Footer column headings are cream at 70% opacity over green — 3.67:1

**Where:** `app/styles/home.css:1064-1074 (`.pel-footer__colh`, `opacity: 0.7`); rendered by app/components/PelFooter.tsx:164 — all pages`

**Evidence:** axe-core `color-contrast` (SERIOUS), 5 nodes per page: `.pel-footer__col:nth-child(1|2|3) > .pel-footer__colh` "Shop", "Club", "Follow", measured fg=#bbc8b0 on bg=#2f6a44 at 3.67:1, font-size 13.5pt (18px) weight normal. 18px normal is not WCAG large text (that needs ≥24px, or ≥18.66px bold), so the requirement is 4.5:1. The #BBC8B0 value is `var(--pel-cream)` #F7F0DE flattened by the declared `opacity: 0.7` over the green footer. For contrast, the sibling `.pel-footer__link` text measures 5.66:1 on the same green and passes — only the headings fail.

**Impact:** The three headings that organise the entire footer navigation are the only under-contrast text in the footer, so the structure of the footer is the hardest part of it to read.

**Fix:** Remove `opacity: 0.7` from `.pel-footer__colh` (full #F7F0DE on #2F6A44 is ~7.7:1), or raise it to ~0.85 if the softened look is wanted.

### 53. LOW — OPEN — Keyboard focus ring is nearly invisible on the green footer and over the hero photo

**Where:** `app/styles/pel-chrome.css:797-806 (`outline: 3px solid var(--pel-blue)`) — footer on all pages; `.pel-btn` in the homepage hero`

**Evidence:** The global focus ring resolves to #4576CE. Computed against the surfaces it is drawn on: vs footer green #2F6A44 = 1.45:1 and vs brand orange #CE643E = 1.16:1, against the 3:1 minimum WCAG 1.4.11 requires for focus indicators. Sampling the actual ring band (the 2-4px zone outside each element, matching `outline-offset: 2px` + 3px width) for every focusable element in the footer returned `surroundingBg rgb(47,106,68) → ringContrast=1.45` for `A.pel-footer__link` and `A.pel-footer__logo`. For the homepage hero CTA `.pel-btn`, the ring band falls on the hero photograph and sampled rgb(171,69,6)/rgb(170,45,4) → ringContrast 1.32-1.53. On cream and sand surfaces the same ring measures a passing 3.6-3.9:1. (Verified separately that the ring itself does render: tabbing 40 stops with the token stylesheet loaded produced zero stops without a visible outline.)

**Impact:** A keyboard user tabbing into the footer — every Shop/Club/Follow link plus the footer logo — effectively loses track of where focus is, as does anyone tabbing to the primary "Shop Now" hero button. The indicator exists but disappears against the brand's own green and orange.

**Fix:** Make the ring surface-aware: keep blue on cream, and override to `outline-color: var(--pel-cream)` (or #FFFFFF) for focusable elements inside `.pel-footer` and over the hero image. Adding a contrasting second layer (e.g. `box-shadow: 0 0 0 5px rgba(23,23,23,.6)` alongside the outline) makes it robust on any background, including photos.

### 54. LOW — OPEN — Footer "Club" column is leftover old-theme navigation: Our Mission / Gallery / Join the Revolution all point at /about

**Where:** `app/components/PelFooter.tsx:22-29 (and "Hats & Totes" → /collections/all-products at :17)`

**Evidence:** Dumped footer hrefs from the rendered homepage: Club column = "Our Mission -> /about", "Gallery -> /about", "Join the Revolution -> /about" — three differently-labelled links to one destination. There is no gallery page on the storefront; the store's real /pages/gallery (title "Our Miami Memories") renders with a completely empty body. "Join the Revolution" appears nowhere else on the site. /about itself is titled "Beyond the Game" / "Our Story" and never uses the words "Our Mission". Separately "Hats & Totes" resolves to /collections/all-products (all 16 products, tees included).

**Impact:** The footer of every page advertises a photo gallery and a "Join the Revolution" page that do not exist; all three clicks silently dump the customer on the same About page, and one of the labels comes from the old theme's menu. "Hats & Totes" promises a filtered category and delivers the full catalogue.

**Fix:** Reduce the Club column to one honest link ("Our Story" → /about) plus something real, and drop "Gallery" and "Join the Revolution" until those pages exist. Point "Hats & Totes" at a real hats/totes collection or remove it.

### 55. LOW — OPEN — The "What Makes Us Special" drawer sends customers to poreldeporte.com/pages/app, which renders an empty page titled "app"

**Where:** `app/components/home/CommunityPanel.tsx:62 (`serving = 'Full details at poreldeporte.com/pages/app'`); the panel is mounted globally in app/components/PageLayout.tsx:51`

**Evidence:** curl http://localhost:3000/pages/app returns 200 and renders `<h1 class="pel-legal__title">app</h1><div class="pel-prose">` with nothing after it — an un-titled, un-capitalised handle as the heading and a zero-length body. app/lib/pages-seo.ts:9 already documents `app`, `gallery` and `contact` as "a title and no body". The drawer's App tab prints that URL as its footer line on every page of the site.

**Impact:** The App tab pitches the club app, then the footer line tells the customer where to get "full details" — and that URL is a blank page whose only content is the word "app" in display type. Anyone who follows it concludes the site is unfinished. The tab already links to the working App Store listing and app.poreldeporte.com (both verified 200), so the dead reference is gratuitous.

**Fix:** Replace the string with something real — e.g. "Est. 2014 Key Biscayne, Florida" (what the Club tab already uses) or "apps.apple.com/app/por-el-deporte" — or populate /pages/app in Shopify admin.

### 56. LOW — OPEN — Expired /cart/<lines> share links discard their helpful message and show the generic 'Something went wrong' 500 copy

**Where:** `/Users/francoviola/Desktop/ViolaCreative/por-el-deporte-ecommerce/app/routes/cart.$lines.tsx:52 throws the message; app/root.tsx:231-238 ignores it`

**Evidence:** GET /cart/garbagelines returns 410 and renders '410 / Something went wrong / An unexpected error occurred. Try again in a moment, or head back home.' The Response body thrown at cart.$lines.tsx:52 is 'Link may be expired. Try checking the URL.' but root.tsx:223 only special-cases `errorStatus === 404`, so every other status — including this deliberate 410 — falls to the generic 'unexpected error' branch and error.data is never read.

**Impact:** /cart/<variantId>:<qty> is the standard Shopify pattern for add-to-cart links in email and Instagram campaigns. When one goes stale (variant deleted, product unpublished) the customer is told an unexpected error occurred and to try again in a moment — advice that will never work — instead of being told the link expired. A big orange '410' is also meaningless to a shopper.

**Fix:** In the root ErrorBoundary, branch on 4xx as well: render error.data (when it's a string) as the message, and use copy like 'That link no longer works' with the existing Back home / Shop all gear CTAs. Consider suppressing the numeric code for non-404 4xx statuses.

### 57. LOW — OPEN — The sitemap advertises two policy URLs that robots.txt blocks from being crawled

**Where:** `app/routes/sitemap.$type.$page[.xml].tsx:133,137 (emits `/policies/${handle}`) vs app/routes/[robots.txt].tsx:73 (`Disallow: /policies/`) — URL paths: /sitemap/site/1.xml, /robots.txt`

**Evidence:** `/sitemap/site/1.xml` lists exactly 5 URLs, including `http://localhost:3000/policies/privacy-policy` and `http://localhost:3000/policies/refund-policy`. `/robots.txt` contains `Disallow: /policies/` in the `User-agent: *` block (and repeats it for AhrefsBot / AhrefsSiteAudit). The prefix rule matches both sitemapped URLs. Both pages render a correct self-referencing canonical and a real meta description, so the SEO work on them is wasted. This directly violates the invariant the codebase documents for itself in app/lib/pages-seo.ts:19-20: "a page can never be told 'noindex' while still being advertised in the sitemap."

**Impact:** Google Search Console reports "Sitemap contains URLs which are blocked by robots.txt" and marks both pages "Indexed, though blocked by robots.txt" or excluded — so the refund policy, the page a hesitant buyer searches for by name before checking out, can surface with "No information is available for this page" or not at all.

**Fix:** Pick one side. Either drop `Disallow: /policies/` from [robots.txt].tsx:73 (keeping these pages crawlable is the intent implied by giving them canonicals and descriptions), or stop emitting `policyPaths` from the site sitemap at sitemap.$type.$page[.xml].tsx:133 and add `{name: 'robots', content: 'noindex, follow'}` to policies.$handle.tsx's meta — matching the exclude-plus-noindex pattern already implemented in app/lib/pages-seo.ts.

### 58. LOW — OPEN — /collections is a fully SEO-tagged route that is in no sitemap and has no link from the public site

**Where:** `app/routes/collections._index.tsx:8-14; app/routes/sitemap.$type.$page[.xml].tsx:137 (`const paths = ['/', '/about', '/policies', ...policyPaths]`) — URL path /collections`

**Evidence:** /collections returns 200 with a unique title, a unique description and a self-referencing canonical. It appears in none of the six sitemaps: /sitemap/site/1.xml lists only /, /about, /policies and the two policy handles, and /sitemap/collections/1.xml lists individual collection handles, not the index. Grepping the app for `"/collections"` finds exactly one internal link, app/routes/account.orders._index.tsx:111 — inside the logged-in empty-orders state. It is absent from the homepage's internal-link set, from PelHeader.tsx and from PelFooter.tsx.

**Impact:** The only page that links out to all four collections in one place — the natural hub for collection-level crawl equity — is undiscoverable to both crawlers and customers. It is also the only route from which /collections/2023-por-el-deporte-kits is reachable.

**Fix:** Add `/collections` to the `paths` array at sitemap.$type.$page[.xml].tsx:137, and either link it from the footer's Shop column (app/components/PelFooter.tsx:16-19) or, if the branded Shop page is meant to be the only browse surface, redirect /collections to /collections/all-products the way collections.all.tsx already does.

### 59. LOW — OPEN — Account pages use bare, unbranded browser titles that break the site-wide "Por El Deporte | X" pattern

**Where:** `app/routes/account.profile.tsx:19 (`{title: 'Profile'}`); app/routes/account.addresses.tsx:31 (`'Addresses'`); app/routes/account.orders._index.tsx:33 (`'Orders'`); app/routes/account.orders.$id.tsx:11 (`` `Order ${data?.order?.name}` ``)`

**Evidence:** Every other route in the app prefixes the brand — verified in the rendered HTML for /, /about, /collections, /collections/all-products, /cart, /search, /policies, /policies/privacy-policy, /policies/refund-policy and each product, all of the form `Por El Deporte | …`. The four account routes return the raw noun only. app/routes/account_.login.tsx, account._index.tsx and account.tsx export no `meta` at all.

**Impact:** A signed-in customer with several tabs open sees tabs reading "Profile", "Orders" and "Order #1042" with no brand, so the store's tabs are indistinguishable from any other site's; the same unbranded strings become the bookmark and browser-history labels for the post-purchase pages customers return to most.

**Fix:** Prefix all four with `Por El Deporte | ` to match the rest of the app, and add a `meta` export to account.tsx so the account layout supplies a branded default for account._index.tsx and account.$.tsx.

### 60. LOW — OPEN — The permanent /collections/all consolidation redirect returns 302 instead of 301

**Where:** `app/routes/collections.all.tsx:11 (`throw redirect('/collections/all-products')`) — URL path /collections/all`

**Evidence:** `curl -D - http://localhost:3000/collections/all` returns `HTTP/1.1 302 Found` with `Location: /collections/all-products`. React Router's `redirect()` defaults to 302. The route's own doc comment (collections.all.tsx:4-9) describes the change as permanent by design: "The site's 'Shop' everywhere points at the curated /collections/all-products … redirect here to that single canonical shopping surface."

**Impact:** /collections/all is a well-known Shopify URL likely to have pre-existing index entries and external links from the store's previous theme. A 302 tells Google to keep the old URL in the index and not to transfer its signals to /collections/all-products, so link equity earned by the old Shop URL never reaches the new one.

**Fix:** Change collections.all.tsx:11 to `throw redirect('/collections/all-products', 301)`.

### 61. LOW — FIXED — Every 404 response ships with no <title> tag at all

**Where:** `app/root.tsx:231 `ErrorBoundary` — no `meta` export accompanies it. URL: any unmatched path, e.g. /nope-xyz-404`

**Evidence:** `curl -s http://localhost:3000/nope-xyz-404 | grep -c "<title"` returns 0 on the current build, while /cart returns `<title>Por El Deporte | Cart</title>`. Status is correctly 404 and no `og:title` is emitted either. Playwright confirms `document.title` is the empty string on the 404 route (compare h1 "Off the pitch", which is correctly branded). Screenshot shots/s__this_page_does_not_exist_xyz.png — the page body itself is properly designed; only the document title is missing.

**Impact:** The browser tab and history entry for any mistyped or dead URL show the raw path instead of the brand name, and crawlers that hit a stale link record a titleless document. The 404 body is otherwise on-brand, so this is a one-line gap in an already-finished page.

**Fix:** Add a `meta` export alongside `ErrorBoundary` in app/root.tsx returning a branded title (e.g. `Por El Deporte | Page not found` for 404 and `Por El Deporte | Something went wrong` otherwise), using the existing `seoMeta` helper from ~/lib/seo.

### 62. LOW — FIXED — Every page ships two <main> elements, one illegally nested inside <aside>

**Where:** `app/components/Aside.tsx:71`

**Evidence:** `<main>{children}</main>` is rendered inside the `<aside>` of the cart overlay. Querying the DOM returns `mainCount: 2` and `mainInsideAside: true` on /, /about, /collections/all-products and /products/el-clasico-tee. With the cart drawer open, axe-core reports three MODERATE violations all targeting `aside > main`: `landmark-no-duplicate-main` ("Document has more than one main landmark"), `landmark-main-is-top-level` ("The main landmark is contained in another landmark") and `landmark-unique`. While the drawer is closed the overlay computes to `visibility: hidden`, so the duplicate is out of the accessibility tree, but the invalid markup is present in every server response.

**Impact:** Landmark navigation is ambiguous whenever the cart is open — a screen-reader user asking for "main" gets two results with no way to tell the page content from the cart panel. The HTML spec also forbids `main` as a descendant of `aside`, so the markup fails validation on every page.

**Fix:** Change the `<main>` inside Aside.tsx to a `<div>` (the dialog is already labelled by its heading via `aria-labelledby`), leaving exactly one top-level `main` per page.

### 63. LOW — FIXED — Every error page (404, 410, 500) renders with no <title> at all — the browser tab shows the raw URL

**Where:** `/Users/francoviola/Desktop/ViolaCreative/por-el-deporte-ecommerce/app/root.tsx (ErrorBoundary at :215; no `meta` export anywhere in the file) and app/routes/$.tsx`

**Evidence:** curl of /this-page-does-not-exist returns a complete <head> with zero <title> elements (verified by dumping everything up to </head>). In Playwright, document.title === "" on /this-page-does-not-exist, /products/not-a-real-handle, /collections/not-a-real-collection, /pages/nope, /blogs/news/nope, /blogs/nonexistentblog, and /cart/garbagelines (410). By contrast every non-error page has one (/ = 'Por El Deporte | Miami Soccer Apparel & Community', /collections = 'Por El Deporte | Collections'). Root cause confirmed in node_modules/react-router/dist/development/chunk-QUQL4437.mjs: getActiveMatches() does matches.slice(0, errorIdx + 1) where errorIdx is the index of the *boundary* route — which is root, since no route exports its own ErrorBoundary. So only root's meta runs on an error, and root has none. This is why the fallback at products.$handle.tsx:18 (`if (!product) return seoMeta({title: 'Por El Deporte'})`) never fires.

**Impact:** A shopper who hits a dead link sees a browser tab, history entry and bookmark labelled 'poreldeporte.com/whatever-broken-path' instead of the brand name. Shared 404 links and any SERP entry for an error URL carry no brand name, and the page also ships with no meta description or og:title.

**Fix:** Add `export const meta: Route.MetaFunction = () => [{title: 'Por El Deporte'}];` to app/root.tsx. Because root is the error boundary this is the only place that reliably runs on an error path, and it also gives the handful of routes with no meta export a branded fallback. React is 18.3.1, so rendering a bare <title> inside the ErrorBoundary would not be hoisted into <head> — the root meta export is the working fix.
