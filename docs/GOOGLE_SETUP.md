# Google Search Console & Business Profile

Both of these need a Google account login, so they can't be done from the repo.
Everything on the site side is already in place — this is the account work, with
the store's real values filled in so it's copy-paste rather than research.

---

## 1. Search Console — https://search.google.com/search-console

This is the one that matters. It's how you find out what Google actually thinks
of the site: which pages are indexed, which structured data validates, what
people searched to find you.

### Pick the property type

| Type | Verification | Use it when |
|---|---|---|
| **URL prefix** — `https://poreldeporte.com` | HTML meta tag (supported in code, see below) | **Start here.** Fastest path. |
| Domain — `poreldeporte.com` | DNS TXT record | Covers every subdomain and both http/https. Better long-term. |

Do **URL prefix** first to get data flowing today. Add the domain property later
if you want subdomains covered too — they can coexist.

### Verifying a URL-prefix property (meta tag)

1. Add the property `https://poreldeporte.com`.
2. Choose **HTML tag**. Google shows something like
   `<meta name="google-site-verification" content="AbC123..." />`.
3. Copy just the `content` value.
4. Put it in Oxygen as an environment variable — Shopify admin → Hydrogen →
   your storefront → Settings → Environment variables → Production:

   ```
   PUBLIC_GOOGLE_SITE_VERIFICATION = AbC123...
   ```

5. Redeploy (`npx shopify hydrogen deploy --env production`). The tag renders
   into every page's `<head>` automatically — no code change needed.
6. Confirm it's live before clicking Verify:

   ```
   curl -s https://poreldeporte.com/ | grep google-site-verification
   ```

7. Click **Verify**.

### Verifying a Domain property (DNS) — no deploy needed

Google gives you a TXT record. Shopify admin → Settings → Domains →
`poreldeporte.com` → DNS settings → Add custom record → TXT, host `@`, value =
the string Google gave you. Wait a few minutes, then Verify.

### Immediately after verifying

1. **Submit the sitemap.** Sitemaps → Add a new sitemap → `sitemap.xml`.
   It's an index pointing at six child sitemaps; Google will follow them:

   ```
   https://poreldeporte.com/sitemap.xml
     ├── /sitemap/products/1.xml
     ├── /sitemap/collections/1.xml
     ├── /sitemap/pages/1.xml       (currently empty by design — see below)
     ├── /sitemap/articles/1.xml
     ├── /sitemap/blogs/1.xml
     └── /sitemap/site/1.xml        (homepage, /about, policies)
   ```

2. **Request indexing** for the homepage and two or three products, via URL
   Inspection. Seeds the crawl instead of waiting.

3. **Check the Products report** (Shopping → Products). This is where the
   `schema.org/Product` markup shows up. Expect warnings for `aggregateRating`
   and `review` — those are *deliberately absent*: there's no review system, and
   inventing them breaks Google's policy. Ignore those two. Anything else is
   real and worth fixing.

4. **Check Enhancements → Breadcrumbs.** Should validate on every product and
   collection page.

### Things that will look like problems but aren't

- `/pages/gallery`, `/pages/contact`, `/pages/app` reported as
  "Excluded by 'noindex'" — intentional, they're empty. Fill one in via Shopify
  admin and it starts being indexed automatically, no code change.
- `/pages/privacy-policy` and `/pages/our-mission` as "Alternate page with
  proper canonical tag" — intentional, they're duplicates of
  `/policies/privacy-policy` and `/about`.
- `/sitemap/pages/1.xml` returning an empty `<urlset>` — correct today, because
  all five Shopify pages are either empty or duplicates.

---

## 2. Business Profile — https://business.google.com

### Read this before you start

Google Business Profile is for businesses with **in-person customer contact**.
An online-only store isn't eligible, and a profile created for one can be
suspended. So the question to answer first:

- **Do customers ever meet you in person?** Community events, kickabouts,
  pop-ups, local pickup on the island?
  - **Yes** → set up as a **service-area business**. You give Google an address
    for verification but **hide it** from the public listing, and instead list
    the areas you serve (Key Biscayne, Miami, Miami Shores). This is almost
    certainly the right shape for PED.
  - **No, orders only ship** → skip GBP. It won't help and risks suspension.
    Put the effort into Search Console and the Merchant Center instead.

### If you proceed, use exactly these values

Consistency matters — Google cross-checks the profile against the site's
`Organization` structured data, which already publishes the first four:

| Field | Value |
|---|---|
| Business name | `Por El Deporte` |
| Website | `https://poreldeporte.com` |
| Email | `contact@poreldeporte.com` |
| Founded | `2014` |
| Primary category | `Sportswear store` |
| Secondary categories | `Clothing store`, `Sports club` |
| Service areas | Key Biscayne FL, Miami FL, Miami Shores FL |
| Phone | `(954) 300-1035` — only if you want it public |
| Address | `9550 NW 1st Ave, Miami Shores, FL 33150` — verification only, **set to hidden** |

Short description to paste:

> Por El Deporte is a Miami soccer apparel brand and community, founded in Key
> Biscayne in 2014 by a group of friends who wanted a good game. We make tees,
> hoodies, hats and kits, and we bring people together around football.

### Verification

Google picks the method — usually video, sometimes postcard. Video verification
wants to see the operation is real: the kit, the printing/packing, the field.
Have that ready before you start, because the flow is timed once it begins.

### Once it's live

- Add photos. Reuse the brand photography already on the site; don't upload
  stock.
- Link the website field to `https://poreldeporte.com` (not the myshopify domain).
- Keep the name identical to the site. `Por El Deporte`, not `Por El Deporte FC`
  — the site publishes `Por El Deporte FC` only as `alternateName`.

---

## 3. Worth doing next: Merchant Center

Not asked for, but it's the piece that actually puts products in Google
Shopping. https://merchants.google.com — and Shopify has a Google & YouTube app
that syncs the catalog for you, which is far less work than a manual feed. The
product structured data the site already emits is what Merchant Center reads for
free listings.
