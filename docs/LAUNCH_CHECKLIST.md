# Por El Deporte — status

**poreldeporte.com is live** on the Hydrogen storefront, served by Oxygen.
Last updated: 2026-08-10.

## Commands

```bash
npx shopify hydrogen deploy --env production   # ships the WORKING TREE, not git
npx shopify hydrogen env push --env production # after editing .env
node scripts/link-audit.mjs                    # dead links across ~35 pages
node scripts/contrast-audit.mjs                # WCAG AA against painted backdrops
node scripts/mobile-audit.mjs                  # overflow + sub-12px type
./scripts/search-console.sh report             # coverage + top queries
```

Deploys and `env push` both stop on an interactive confirmation and are blocked
for the assistant by the permission classifier, so they are Franco's to run.

## Done

**Storefront** — full branded build: home, about, shop, PDP, cart drawer,
policies, blog, account, search, 404. Audits clean: 0 dead links, 0 contrast
failures, no mobile overflow.

**SEO** — sitemaps (products, collections, pages, articles, site routes), robots,
canonicals, Organization + Product + Breadcrumb JSON-LD, per-page titles and
descriptions, OG share images.

**Analytics (2026-08-10)** — was recording **nothing**. `PUBLIC_CHECKOUT_DOMAIN`
was unset in both `.env` and Oxygen, so `Analytics.Provider` never loaded the
Customer Privacy API. Only the performance beacon was firing, which made the
admin look alive. Now confirmed receiving `page_rendered`,
`product_page_rendered`, `collection_page_rendered` and `product_added_to_cart`.

**Checkout domain (2026-08-12)** — checkout was running on
`por-el-deporte.myshopify.com`. Shoppers browsing poreldeporte.com were handed
to an unfamiliar domain at the moment they reached for a card, and the funnel
showed it: 1,597 sessions, 134 add-to-carts (a healthy 8.4%), then only **14**
reaching checkout and 3 completing. A 90% loss at one step.

Shopify runs checkout on the *Online Store's* primary domain, and the Online
Store only had the myshopify domain because poreldeporte.com belongs to the
Hydrogen storefront. Fixed with Shopify's documented pattern: a
`checkout.poreldeporte.com` subdomain, targeted at Online Store and set primary.
`PUBLIC_CHECKOUT_DOMAIN` moved with it, since the Customer Privacy API keys off
that value and getting it wrong is what silently killed analytics before.

Still open: `checkout.poreldeporte.com` serves the whole Online Store theme,
product pages included, with self-referencing canonicals. That is a second copy
of the catalogue competing with the real storefront. The fix is the
[Hydrogen redirect theme](https://github.com/Shopify/hydrogen-redirect-theme),
which adds `noindex`, canonicals pointing at the Hydrogen host, and a
client-side redirect.

**Search Console (2026-08-10)** — `sc-domain:poreldeporte.com` verified by DNS
TXT, sitemap submitted, 0 errors. Owned by `franco.viola@live.com`.

**Email (2026-08-10)** — see the `project-email-setup` memory. Workspace account
renamed `lucy@` → `franco@`, sender domain authenticated, `contact@` created as
a Google Group and receiving. It had not existed since the Bluehost move, so
every customer reply had been bouncing.

**Copy (2026-08-10)** — swept the storefront and all Shopify content for AI
tells: em dashes, "more than just", "powered by community", "grab your
favorites", and the old reseller-written SEO descriptions.

**Sales channels** — all 21 active products published to Facebook & Instagram,
Meta and Shop. Printful-created products do not inherit the channel set, so new
ones need checking.

## Open

### Blocked on a credential
- [ ] **Shopify Admin API token** with `write_legal_policies` + `write_customers`.
      Unblocks two things at once:
      - The **refund policy in Shopify is still a byte-for-byte copy of the
        privacy policy**, and shipping / terms / contact are empty. The
        storefront serves correct text from `app/lib/policies.ts`, but checkout
        and the Meta channel render Shopify's version, and Meta's commerce
        review reads it.
      - `/api/newsletter` needs `PRIVATE_ADMIN_API_TOKEN`; signups currently
        fail silently, so no list is being built.

### Franco's to run
- [ ] **Release the Workspace subscription from Bluehost.** Still reseller-billed
      (`admin@reseller.bluehost.com` is also a verified domain owner). Ask for
      *release*, not cancel — a gap suspends the mailbox. Check the Bluehost card
      on file is valid in the meantime; a failed payment takes email down.
- [ ] **Shopify test notification** → check headers show `DKIM: PASS` for
      `poreldeporte.com` rather than falling back to `shopifyemail.com`.
- [ ] **DMARC**: currently `v=DMARC1; p=none;` with no reporting. Add
      `rua=mailto:dmarc@poreldeporte.com; fo=1;`. Do not move to `quarantine`
      until reports confirm both Google Workspace and Shopify pass alignment.
- [ ] **Google Business Profile** — never created. Manual; the API needs a
      profile verified 60+ days.

### Ready when you are
- [ ] **Hydrogen redirect theme.** `por-el-deporte.myshopify.com` is a second
      live storefront that self-canonicalises, competing with poreldeporte.com in
      Google. Password protection is NOT the fix — Shopify's docs are explicit
      that it *prevents Hydrogen checkouts*. The redirect theme is. Installable
      via `themeCreate` / `themePublish`; the current theme stays in the library
      as a one-click revert.
- [ ] **GA4 / Meta pixel.** Shopify analytics is session and product level only;
      neither tells you scroll depth or on-page behaviour. Needs a measurement ID
      and a pixel ID.
- [ ] **Two empty collections** (Official Kits, 2023 PED Kits). Handled on the
      storefront — their tiles are non-clickable teasers and they are excluded
      from the sitemap — but they still exist in Shopify.

## Gotchas worth remembering

- **Oxygen deploys the working tree, not git.** Uncommitted edits go live. Verify
  production by curling for a marker unique to the change.
- **Oxygen env vars bind at deploy time.** Setting one via `env push` does
  nothing until the next deploy.
- **The Storefront API returns option values in creation order.** Printful added
  `S` last on most products, so sizes arrived as `M L XL 2XL S`. Sorted at render
  in `ProductPage.tsx`; do not assume source order.
- **A stale `dist` produces false diagnoses.** A 404 on the token stylesheet
  makes every `var()` fall back and looks like broken CSS. Kill workers with
  `pkill -9 -f "mini-oxygen|workerd|hydrogen preview"` and rebuild before
  believing a visual bug.
