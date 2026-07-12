# Por El Deporte — Headless Build Guide

A learning-oriented companion to `PROJECT_PLAN.md`. The plan lists *what* we
deliver and when; this guide explains *how headless Shopify works* and *why we
built each piece the way we did*, using our own code as the textbook.

Read it top to bottom once. After that it's a reference — every section is
anchored to a real file you can open.

---

## 1. What we're building (and what "headless" means)

**The goal:** replace the themed poreldeporte.com storefront with a custom,
production storefront we fully control — while Shopify keeps doing everything it's
good at (catalog, inventory, cart, checkout, orders, payments).

A normal Shopify store welds two things together:

```
Shopify backend (products, cart, checkout, orders)  ─┐
                                                      ├─ one Liquid theme
Storefront UI (Liquid theme)                        ─┘
```

**Headless splits them.** Shopify stays the backend; we build a brand-new
frontend that talks to it over **APIs**:

```
Shopify backend  ──(GraphQL APIs)──►  our custom Hydrogen storefront (this repo)
```

**Why do it**
- Total control of design, UX, and performance (a Liquid theme can't give you this page).
- Reuse the same backend across web, mobile app, kiosk — Shopify is just an API.

**What it costs you**
- You rebuild everything a theme gave you free: nav, search, cart UI, SEO plumbing.
- More moving parts (build system, hosting, security policy) to own.

> **The one-sentence model:** *Shopify is the backend; this repo is a custom
> frontend that queries it with typed GraphQL and renders at the edge.*

---

## 2. The architecture

### 2.1 The three pillars (don't mix these up)

| Thing | What it is | Where in the repo |
|---|---|---|
| **Hydrogen** | Shopify's React framework for building the storefront. Built on **React Router 7**. Gives you Shopify-aware components (`<Image>`, `<Money>`, cart handlers) and CLI tooling. | everything in `app/` |
| **React Router 7** | The underlying framework: routing, data loading, server rendering. (Hydrogen's predecessor was "Remix" — same lineage.) | `app/routes/`, `app/root.tsx` |
| **Oxygen** | Shopify's global **edge hosting** (Cloudflare Workers-based) where Hydrogen deploys. Free on paid Shopify plans. | `server.ts`, `dist/server` |

### 2.2 The three APIs (know which does what — this is the crux of headless)

| API | Purpose | Token / auth | In this repo |
|---|---|---|---|
| **Storefront API** (GraphQL) | Buyer-facing **reads** + cart: products, collections, cart mutations | Storefront access token (public for browser, private/delegate for server) | every `#graphql` query; `PUBLIC_/PRIVATE_STOREFRONT_API_TOKEN` in `.env` |
| **Customer Account API** | Buyer login, orders, addresses (OAuth) | OAuth client id | `app/graphql/customer-account/*` |
| **Admin API** | Merchant back-office **writes** (create products, manage inventory) | server-only, sensitive scopes | *not used for storefront rendering — by design* |

**Checkout is not on this list.** You never rebuild checkout. You build the cart,
then send the shopper to Shopify's hosted, PCI-compliant checkout via the cart's
`checkoutUrl`. If asked "what does headless *not* replace?" → **checkout**.

### 2.3 The request lifecycle (the heart of it)

Follow one page load. Every Hydrogen page works this way:

```
Browser requests /products/la-isla-tee
   │
   ▼
server.ts                    ← Oxygen worker entry (runs at the edge)
   │  builds context, hands request to React Router
   ▼
app/lib/context.ts           ← createHydrogenContext(): wires the Storefront API
   │                            client, the server-side cart, session, cache, i18n.
   │                            This `context` is passed to EVERY loader.
   ▼
app/routes.ts                ← file-based routing maps the URL → a route file
   │
   ▼
app/routes/products.$handle.tsx →  loader() runs ON THE SERVER
   │   context.storefront.query(PRODUCT_QUERY)  ──►  Shopify Storefront API
   │   returns typed product data
   ▼
app/root.tsx                 ← the app shell: <html>, global CSS, <Analytics>,
   │                            PageLayout (chrome), wraps the route's <Outlet/>
   ▼
Server-renders HTML → streams to browser → React "hydrates" it into a live app
```

Two verbs to remember:
- **`loader`** — runs on the server, *reads* data for a page.
- **`action`** — runs on the server, handles a *mutation* (e.g. add-to-cart form POST).

### 2.4 Four load-bearing ideas

1. **SSR + hydration.** The server renders real HTML (fast first paint, good SEO),
   then React attaches interactivity in the browser. You saw this live: `curl`
   returned the hero HTML immediately, but the deferred product rail streams in
   after — because of the next idea.
2. **Await critical, defer the rest.** A loader `await`s above-the-fold data
   (blocks first byte) and returns un-awaited `Promise`s for below-the-fold data,
   rendered inside `<Suspense>`/`<Await>` so it streams. (See the old `_index.tsx`
   split, and we'll use it again for the product rail.)
3. **Typed GraphQL via codegen.** Queries live next to the feature that uses them
   as `#graphql` template strings. `npm run codegen` reads your store's schema and
   generates `storefrontapi.generated.d.ts` — the **contract** between Shopify data
   and your UI. Change a query → regenerate → types update. *(We saw the flip side
   of this today: deleting a query removed its generated type, and a component that
   still imported that type failed the build. That's the contract working.)*
4. **State ownership.** Shopify is the source of truth for commerce state. The
   **cart lives on the server** (via Hydrogen's cart handler in `context.ts`).
   React state is only for ephemeral UI — "is the cart drawer open." Never store
   cart contents in React.

### 2.5 Caching (why headless can be fast)

Storefront queries are cached (`CacheLong` / `CacheShort` / `CacheNone`), and
Oxygen caches at the edge. `context.ts` opens `caches.open('hydrogen')`. The dev
server exposes `/subrequest-profiler` to *see* every query and its cache state.

### 2.6 Security: the Content-Security-Policy (CSP)

Hydrogen ships a **strict CSP** (`app/entry.server.tsx`). It whitelists exactly
which hosts may serve scripts, styles, images, and fonts. Anything not listed is
**silently blocked** by the browser. This is a real gate in headless work — see
§4 for how it bit us and how we fixed it.

---

## 3. This repo, mapped

| Path | Role |
|---|---|
| `app/root.tsx` | App shell: `<html>`, global stylesheet links, `<Analytics>`, error boundary |
| `app/routes.ts` | Registers file-based routes |
| `app/routes/*` | Pages. `_index.tsx` (home), `collections.$handle.tsx` (PLP), `products.$handle.tsx` (PDP), `cart.tsx`, `search.tsx`, `account.*`, `blogs.*`, `policies.*` |
| `app/components/*` | UI components (Header, Footer, Cart*, Product*, Search*) |
| `app/lib/context.ts` | Hydrogen context wiring (Storefront client, cart, session, cache) |
| `app/lib/fragments.ts` | Shared GraphQL fragments (cart, menus) |
| `app/graphql/customer-account/*` | Customer Account API operations |
| `app/styles/*` | `reset.css`, `app.css` (skeleton), `tailwind.css`, **`pel-tokens.css`**, **`home.css`** (ours) |
| `app/entry.server.tsx` | SSR entry + **CSP** |
| `*.generated.d.ts` (root) | Codegen'd types — the API contract |
| `.env` | The linked store's real credentials (git-ignored) |
| `public/` | Static assets served at site root (e.g. `public/fonts/`) |

---

## 4. What we've built — Increment 1: foundation + hero + marquees

**Goal:** turn `DESIGN-SYSTEM.md` + `Home.dc.html` (the Claude Design source) into
the real top-of-page, and stand up the design system in code.

**Files touched**

| File | What & the concept it teaches |
|---|---|
| `public/fonts/TAYFlapjack.*` | **Static assets live in `/public`.** Only files there are served by Oxygen. That's why the licensed font moved out of the repo-root `/fonts`. |
| `app/styles/pel-tokens.css` *(new)* | **Design tokens as one source of truth.** Every value from `DESIGN-SYSTEM.md` (`--pel-orange`, type scale, radii, shadows…) plus the self-hosted `@font-face`. Loaded globally. Every future component reads these — we never hardcode a hex again. |
| `app/styles/home.css` *(new)* | **Inline styles → tokenized classes, scoped to `.pel-home`.** The design was ~800 lines of inline `style=""`; that doesn't belong in React. Same pixels, maintainable, and scoped so the skeleton routes are untouched. |
| `app/routes/_index.tsx` *(rewrote)* | The homepage: top marquee + hero (nav, headline, CTAs) + orange marquee. Loads its CSS via a **route-level `links()` export** — pages don't pay for CSS they don't use. |
| `app/entry.server.tsx` | **Extended the CSP** to allow Google Fonts (`fonts.googleapis.com`/`gstatic.com`) and hero imagery from `poreldeporte.com`. Without this the browser blocks them silently. |
| `app/root.tsx` | Google Fonts `preconnect` + stylesheet; linked the tokens CSS globally. |
| `app/components/PageLayout.tsx` | Suppress the skeleton header/footer on `/` so the homepage owns its hero-nav and footer. Temporary until we globalize the branded chrome (Increment 6). |
| `app/components/ProductItem.tsx` | Dropped a dead fragment type after removing the demo query — see §2.4 idea #3. |

**The verification gates we ran (all green):**
- `npx tsc --noEmit` → 0 type errors (the API contract holds)
- `npm run lint` → 0 problems
- `npm run build` → production Oxygen bundle builds, our CSS chunks emitted
- Live check: `HTTP 200`, CSP header carries the new allow-list, font + hero image load, screenshot matches the design

**Takeaways that generalize to all headless work:** static assets → `/public`;
tokens once, classes everywhere; the CSP is a gate, not a formality; deleting a
query changes the generated type contract.

---

## 5. Animation approach — CSS vs anime.js

Two kinds of motion in this design, and they want different tools:

- **Continuous loops (the marquees).** These are pure CSS `@keyframes`
  (`translateX(-50%)`, infinite). They were CSS in the original `Home.dc.html`
  too — anime.js never touched them. They stay CSS: cheapest, smoothest, no JS.
- **Scroll-triggered + intro + parallax** (hero line reveal, section fade-ups,
  mood-card stagger, collage/cluster reveals, cloud drift). The original drives
  these with **anime.js**, and **we keep anime.js** for them.

**One production change to how anime.js loads:** the design pulled it from a
jsdelivr CDN `<script>`. We'll instead install it from **npm** (`npm i animejs`)
and import it in a client-only effect. Same library, but: bundled + version-pinned,
works offline, and it needs **no CSP hole** for an external script host. This lands
in the increments that add the animated sections.

Rule of thumb: **CSS for anything that loops forever; anime.js for anything
triggered by scroll or first paint.**

---

## 6. The build roadmap (each step teaches one headless idea)

| # | Increment | The headless concept you'll learn |
|---|---|---|
| **1** ✅ | Foundation + hero + marquees | Tokens, static assets, CSP, route CSS, SSR |
| **2** | **Products rail on real data** | **Loaders + typed GraphQL + codegen** — a Storefront query becomes on-page UI, driven by a curated collection you control in Shopify admin |
| **3** | About / Moods / Function sections + anime.js reveals | Client-only effects, `prefers-reduced-motion`, bundling a dependency |
| **4** | Testimonials + footer | Static content modeling (later: metaobjects), the scallop-mask footer |
| **5** | **Cart wiring** (Quick Add + drawer + FAB) | **`action`s, the server-side cart, `checkoutUrl` handoff, optimistic UI** — the commerce spine |
| **6** | Globalize branded Header/Footer | Shared layout, "transparent-over-hero" nav, then build Shop (PLP) + Product (PDP) pages |
| **7** | Production hardening | Analytics + consent, sitemap/robots, caching strategy, old-URL redirects, a11y |
| **8** | **Deploy to Oxygen** | Edge deploy, preview vs production environments, GitHub→Oxygen CI, custom domain |

We build one increment at a time, verify it live, then move on.

---

## 7. Running & verifying

```bash
npm run dev        # local Oxygen runtime at http://localhost:3000
                   #   /graphiql             live GraphQL explorer on YOUR store
                   #   /subrequest-profiler  see queries + caching
npm run codegen    # regenerate GraphQL types after changing a query
npm run typecheck  # tsc — proves the API contract holds
npm run lint       # eslint
npm run build      # production Oxygen build (the real "will it deploy" test)
```

Our review gate before calling an increment done: **typecheck + lint + build all
green, plus a live render check.**

---

## 8. Glossary

- **Headless** — decoupling the storefront UI from the Shopify backend, connected by APIs.
- **Hydrogen** — Shopify's React (React Router 7) framework for headless storefronts.
- **Oxygen** — Shopify's edge hosting for Hydrogen; free on paid plans.
- **Storefront API** — GraphQL API for buyer-facing reads + cart.
- **Customer Account API** — OAuth API for buyer login/orders/addresses.
- **Admin API** — back-office writes; not used for storefront rendering.
- **Loader / Action** — server functions that read data / handle mutations for a route.
- **SSR / Hydration** — render HTML on the server, then make it interactive in the browser.
- **Codegen** — generates TypeScript types from GraphQL queries; the data contract.
- **CSP** — Content-Security-Policy; the allow-list of hosts the browser may load from.
- **`checkoutUrl`** — the cart's link to Shopify's hosted checkout (we never rebuild checkout).
- **Mock.shop** — a fake Shopify backend for building without a real store (we've moved off it).
- **Sales channel** — how a storefront registers on a store so products publish to it (the Hydrogen channel).

---

*Source of design truth: the Claude Design project "Poreldeporte headless rebuild"
(`DESIGN-SYSTEM.md`, `Home.dc.html`). Keep this guide updated as increments land.*
