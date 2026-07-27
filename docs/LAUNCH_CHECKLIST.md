# Por El Deporte — Headless Launch Checklist

Living status doc for taking **poreldeporte.com** live on the Hydrogen storefront.
Last updated: 2026-07-27.

## TL;DR — where we are right now
- The branded headless storefront is **built, reviewed, and deployed to the
  Production Oxygen environment.** `poreldeporte.com` is **still the old themed
  store — untouched.**
- **Blocking the smoke-test:** a CSP font bug was found and fixed in code
  (`cd5b640`, on `main`) but **needs a redeploy** to take effect. The fix has
  since been **verified correct at the build + CDN level** — see
  "Smoke-test results" below.
- The **HTTP-level smoke-test is done**; two small real bugs were found and
  fixed (uncommitted). Only browser-visual checks remain.
- **Next action (you):** `npx shopify hydrogen deploy --env production`, then
  hard-refresh the env URL and do the browser-visual pass.

## Key URLs & commands
- **Repo:** `github.com/poreldeporte/por-el-deporte-headless` — working branch `main`.
- **Production env URL (public):**
  `https://por-el-deporte-87a553fa8ec4577088b4.o2.myshopify.dev/`
  (This is the stable environment URL — respects the Public toggle. The URL the
  `deploy` command prints is a per-deployment permalink that stays auth-gated.)
- **Deploy to production (no prompt):** `npx shopify hydrogen deploy --env production`
- **Full-public test of a private deploy:** add `--auth-bypass-token`
- There is **no Oxygen auto-deploy workflow** — production deploys are manual
  and need your Shopify login (auto-mode can't run them).

## Go-live phases

### Phase A — Promote code ✅ DONE
- [x] Merge `feat/headless-storefront` → `main`, push to origin (tip `cd5b640`).

### Phase B — Production deploy + smoke-test  ⏳ IN PROGRESS
- [x] Deploy to **Production** Oxygen environment.
- [x] Make the **Production environment Public** (Storefront settings →
      Environments → Production → URL privacy → Public).
- [ ] **Redeploy** to pick up the font CSP fix (`cd5b640`) **+ the two fixes
      below**. ← DO THIS NEXT
- [x] **HTTP-level smoke-test done** (33-route sweep vs the live env URL, plus a
      local `npm run preview` control to separate app bugs from Oxygen
      preview-domain behaviour). Findings recorded below.
- [ ] Smoke-test on the env URL (desktop + phone) — **browser-only items left**:
  - [ ] Home renders with **real logo + Flapjack** headings ← the redeploy fix
  - [ ] Product → color swatches (gallery follows) → Add to Cart → drawer →
        **checkout reaches Shopify**
  - [ ] `/collections/all-products`, `/search?q=tee`, `/policies`, `/account`
  - [ ] Bad URL (e.g. `/nope`) → branded **404**
- [ ] Note & fix anything still off (the "couple other things").

## Automated verification

```bash
./scripts/verify-launch.sh                      # production env URL (default)
./scripts/verify-launch.sh https://poreldeporte.com   # after the cutover
```

Covers every HTTP-checkable item: route statuses, the Flapjack CSP fix + the
actual font file, canonical/OG/JSON-LD, robots + sitemap, add-to-cart → checkout
URL, branded 404. Exits non-zero if anything fails. On an `*.o2.myshopify.dev`
host it reports the suppressed robots/sitemap as INFO rather than FAIL.

As of `bf6874e`, pre-redeploy, it reports **26 pass / 2 fail / 2 info** — and
both failures are exactly what the pending redeploy fixes (CSP `font-src`, and
the `/policies` `<title>`). After the redeploy both should flip to PASS.

## Smoke-test results (2026-07-27, HTTP level)

### Verified working
- **Font CSP fix is correct and sufficient.** Oxygen rewrites the `@font-face`
  URL at **deploy** time (not in the local Vite build, which keeps `/fonts/…`)
  to `cdn.shopify.com/oxygen-v2/<ids>/fonts/TAYFlapjack.woff2` — that URL
  returns **200**, and the live `font-src` is still the pre-fix value. So the
  only thing standing between us and Flapjack is the redeploy.
- **Cart → checkout works end-to-end.** `LinesAdd` → cart holds "El Clásico Tee
  / Bay / S" qty 1 with a live `checkoutUrl` (verified against the Storefront
  API, then re-verified rendering on the cart page).
- **Search works** — `?q=tee` returns the 9 tees, relevance-ordered; results are
  brand-styled via `.pel-search__results .search-result*` descendant rules.
- **Branded 404** — `pel-error__*` with the wordmark logo (the header `<img>`
  is absent by design; it falls back to the wordmark).
- Real logo from `shop.brand.logo`, canonical `<link>`, OG/Twitter, and Product
  JSON-LD (`Product`/`Offer`/`Brand`) all present. 33-route sweep: no unexpected
  statuses. No password protection on the store.

### Fixed in this pass (⚠️ uncommitted — included in your next deploy)
- `/policies` had **no `<title>`** — `policies._index.tsx` was the only route
  missing a `meta` export. Added one via `seoMeta()` (title + description +
  canonical + OG/Twitter), matching its sibling routes.
- `/cart` page `<h1>` was falling back to `reset.css` (generic 1.6rem bold)
  instead of the eyebrow + display-title pattern every other page uses. Added
  `.cart__eyebrow` / `.cart__title`.
- `typecheck`, `lint`, `build` all green after both.

### Not bugs — verified, do not "fix"
- **`robots.txt` serves `Disallow: /` and `/sitemap.xml` 404s on the env URL.**
  This is Shopify suppressing SEO surfaces on a preview domain (same reason
  `x-robots-tag: none` is set). Locally both are correct: a 2125-byte robots.txt
  with a `Sitemap:` line, and a valid `<sitemapindex>`.
  **→ Re-verify both on `poreldeporte.com` right after the Phase C cutover.**
- A nonsense query (`?q=zzzznomatch`) returns 8 unrelated products. This is
  Shopify's own search API returning a fallback set — reproduced identically for
  three different random strings straight against the API. Side effect: the
  "No results for …" empty state can never trigger for product searches.
- `/favicon.ico` 404s — the app ships an SVG favicon, which is fine for modern
  browsers. Adding an `.ico` is optional.
- Canonical currently points at the `o2.myshopify.dev` origin; it is derived
  from the request origin, so it becomes `poreldeporte.com` after cutover.

### Needs your action in Shopify admin (not code)
- **`/policies/shipping-policy` and `/policies/terms-of-service` 404** because
  they are not defined in the store — only Privacy and Refund exist, and the
  `/policies` index correctly lists just those two. For a store shipping
  physical goods, a Shipping Policy and Terms of Service are worth adding
  before launch (Settings → Policies).

### Known, left alone deliberately
- The branded 404 has no `<title>` (browser tab shows the URL). Root's
  `ErrorBoundary` bypasses route `meta`, and React is 18.3 so `<title>` does not
  hoist from the body. Fixing it means touching root meta for every page —
  disproportionate risk mid-launch. Backlog.

### Phase C — The cutover (⚠️ irreversible / customer-facing — DO NOT start until B passes)
- [ ] Online Store → Preferences → confirm **password protection is OFF**
      (it blocks Hydrogen checkout).
- [ ] Settings → **Domains** → set `poreldeporte.com` **Target = production
      Hydrogen storefront**, type **Primary**. ← this is go-live.
- [ ] Publish Shopify's **Hydrogen redirect theme** so `*.myshopify.com`
      visitors forward to Hydrogen.

### Phase D — Post-launch
- [ ] Redirect previous **order-status** pages (existing orders).
- [ ] Update **Meta/Google product feeds** to the new domain.
- [ ] Update **notification URLs** (Settings → Notifications).
- [ ] Confirm **Shopify analytics** is flowing.

## What's already done (build)
- Full branded storefront: Home, Shop (`/collections/*`), Product, About,
  Cart drawer, and all utility routes rebranded (policies, pages, search,
  collections index, **full account area**).
- **Dynamic logo** pulled from `shop.brand.logo` (wordmark fallback).
- **SEO:** canonical (`<link>`), Open Graph/Twitter, Product JSON-LD, meta
  descriptions everywhere, US-only sitemap, robots.
- **Commerce fixes:** PDP gallery follows the selected variant, Add-to-Cart
  price keeps cents/currency, Shop catalog cap raised + multi-variant cards
  route to PDP, empty-collection state.
- **Resilience:** branded 404/ErrorBoundary, branded empty cart, dismissable
  cart error/warning banner, `storefrontRedirect` (legacy 301s on 404).
- Branded favicon + theme-color, `:focus-visible` a11y ring.
- Verified: `npm run typecheck` / `lint` / `build` all green.

## Bugs found & fixed this launch pass
- Adversarial review caught 3 regressions → fixed (`929a519`): canonical was a
  `<meta>` not `<link>`; cart banner was undismissable; PDP gallery variant sync.
- **Font CSP bug (`cd5b640`):** Vite/Oxygen rewrites the self-hosted Flapjack
  `@font-face` URL to `cdn.shopify.com`, which the CSP `font-src` didn't allow →
  browser blocked the font, fell back to serif. Fixed by allowing
  `cdn.shopify.com` in `font-src`. (Would have affected the live domain too.)

## Backlog — optional polish (not launch-blocking)
- Editorial `<img>` → responsive `srcset`.
- Product recommendations ("You may also like").
- Move hardcoded testimonials / Instagram posts to Shopify **metaobjects**.
- Blog routes — **intentionally skipped** for launch.
