# Pending Shopify content changes — 3 new Printful products

Blocked only on the Shopify Admin connection. Everything below is decided; it is
a mechanical pass once there's write access. Nothing here needs a deploy — the
storefront reads all of it from the API at runtime.

Copy was written from the actual artwork (I pulled the mockups down and looked at
them), and matches the voice of the existing descriptions: a short fragment, then
the story, then plain practical detail. No em dashes.

---

## 1. Cafe Tote — `/products/cafe-tote`

The print is a "PED CAFÉ" storefront: a player in the orange kit sitting outside
under a red-and-blue striped awning, palm tree, drink on the table, ball at his
feet, POR EL DEPORTE beneath.

**descriptionHtml**
```html
<p>Sunday at the PED Café.</p><p>A player in the orange kit, a cold drink, a ball by the chair, and nowhere in particular to be. Drawn for the mornings after a match when nobody wants to go home yet.</p><p>Heavy organic cotton, flat bottom, straps long enough for a shoulder. Fits a full shop, or boots and a ball.</p>
```

**productType** `Totes`
**seo.title** `Cafe Tote | Por El Deporte`
**seo.description** `A roomy organic cotton tote with our PED Café print. Flat bottom, shoulder-length straps, and free shipping on U.S. orders.`

---

## 2. Marado Tee — `/products/marado-tee`

Big back print: POR EL DEPORTE stacked over and over in chunky orange woodblock
lettering, with a navy player mid bicycle-kick through the middle.

**descriptionHtml**
```html
<p>For the goal you still talk about.</p><p>The name stacked over and over across the back, and a player upside down in the middle of it. Garment dyed, so the colour has already settled and will not shift on you.</p><p>Heavyweight ring-spun cotton, relaxed fit, soft from the first wear.</p>
```

**productType** `Tees`
**seo.title** `Marado Tee | Por El Deporte`
**seo.description** `Heavyweight garment-dyed tee with a woodblock back print. Relaxed fit in Bay, Ivory or Black. Free shipping on U.S. orders.`

---

## 3. La Isla long-sleeve tee — `/products/la-isal-long-sleeve-tee`

**This garment has a hood.** The mockup clearly shows one; the title doesn't say
so, and a customer can't tell from the name. Small orange Key Biscayne silhouette
with POR EL DEPORTE on the left chest, `2014` down the left cuff.

**title** `La Isla long-sleeve tee` → **`La Isla Hooded Long Sleeve`**
**handle** `la-isal-long-sleeve-tee` → **`la-isla-hooded-long-sleeve`**
(the current handle is a typo: "isal". Set `redirectNewHandle: true` so the old
URL keeps working — it is in the sitemap and was crawled.)

**descriptionHtml**
```html
<p>The island, small on the chest.</p><p>Key Biscayne in orange, no bigger than a thumb, with 2014 down the left cuff. Everything else left alone.</p><p>Lightweight cotton, long sleeves, and a hood for a breezy night game rather than actual cold.</p>
```

**productType** `Tees`
**seo.title** `La Isla Hooded Long Sleeve | Por El Deporte`
**seo.description** `A lightweight hooded long sleeve with the Key Biscayne island on the chest and 2014 on the cuff. Free shipping on U.S. orders.`

---

## 4. Image alt text — all three products

Every image on all three is Printful's default `"Product mockup"`, which is what
a screen reader reads out and what Google indexes. Set per image, describing what
is actually shown, e.g.:

- `Cafe Tote in natural cotton with the PED Café print`
- `Marado Tee in Ivory, back print`  /  `Marado Tee in Bay, front`
- `La Isla Hooded Long Sleeve in Black, island crest on the chest`

Existing products use `"{Title} - Por El Deporte"`, which is weak but not wrong.
Anything is better than "Product mockup"; prefer describing the view and colour.

---

## Verifying afterwards

```
npx shopify hydrogen preview          # or check production
curl -s https://poreldeporte.com/products/cafe-tote | grep -o '<title>[^<]*'
```

The PDP subtitle should be the short opening line only. Before this pass it was
the entire 300-character spec dump, because the supplier ships one `<p>` with
`<br>` bullets — that parsing is already fixed in
`app/components/product/ProductPage.tsx` (`splitDescription`), so these
descriptions will render as lead + story + a real spec list.

Garment kinds are already handled: `hoodedls` exists precisely for #3, so its
spec card says "Hood: Unlined, no drawcord" rather than generic tee copy.
