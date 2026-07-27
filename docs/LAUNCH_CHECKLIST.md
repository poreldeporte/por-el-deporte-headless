# Por El Deporte — Headless Launch Checklist

Living status doc for taking **poreldeporte.com** live on the Hydrogen storefront.
Last updated: 2026-07-27.

## TL;DR — where we are right now
- The branded headless storefront is **built, reviewed, and deployed to the
  Production Oxygen environment.** `poreldeporte.com` is **still the old themed
  store — untouched.**
- **Blocking the smoke-test:** a CSP font bug was found and fixed in code
  (`cd5b640`, on `main`) but **needs a redeploy** to take effect.
- **Next action (you):** `npx shopify hydrogen deploy --env production`, then
  hard-refresh the env URL and finish the smoke-test.

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
- [ ] **Redeploy** to pick up the font CSP fix (`cd5b640`). ← DO THIS NEXT
- [ ] Smoke-test on the env URL (desktop + phone):
  - [ ] Home renders with **real logo + Flapjack** headings
  - [ ] Product → color swatches (gallery follows) → Add to Cart → drawer →
        **checkout reaches Shopify**
  - [ ] `/collections/all-products`, `/search?q=tee`, `/policies`, `/account`
  - [ ] Bad URL (e.g. `/nope`) → branded **404**
- [ ] Note & fix anything still off (the "couple other things").

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
