# Por El Deporte Storefront

Por El Deporte's headless Shopify storefront, built with Shopify's supported
Hydrogen stack: React Router, strict TypeScript, Tailwind, and Oxygen.

## Current status

- Official Hydrogen `2026.4.3` TypeScript scaffold; GraphQL codegen, TypeScript,
  ESLint, and the Oxygen production build all pass.
- **Connected to the real store** `por-el-deporte.myshopify.com` (Hydrogen sales
  channel installed, storefront linked, env pulled). Live product/collection/cart
  data throughout.
- **Homepage** built from the Claude Design source: marquees, hero, live product
  rail, About collage, Moods, the Artisan-Hoodie Function section, testimonials,
  and the scallop-edged footer. Scroll/entrance motion via anime.js
  (npm-bundled, client-only, reduced-motion aware).
- **Commerce path works end to end**: Quick Add / product page → server-side cart
  → branded cart drawer → Shopify-hosted checkout (`checkoutUrl`).
- **Branded across all routes**: global `PelHeader` (non-home) + `PelFooter`, and
  the collection (PLP), product (PDP), and cart pages styled to the design system.
- CI runs lint + typecheck + build on every push/PR (`.github/workflows/ci.yml`).
- **Next: deploy.** The app is not yet on Oxygen — see "Deploy to Oxygen" below.
  This step needs Shopify CLI auth and is a go-live decision.

See [docs/BUILD_GUIDE.md](docs/BUILD_GUIDE.md) for the architecture + a
concept-by-concept tour of how it was built.

See [the project plan](docs/PROJECT_PLAN.md) for delivery phases and definitions
of done.

## Requirements

- Node.js 22 or 24
- npm
- Shopify staff or collaborator access to the Por El Deporte store
- The Hydrogen sales channel installed on the store

## Commands

```bash
npm install
npm run dev
npm run codegen
npm run typecheck
npm run lint
npm run build
```

`npm run dev` starts the Oxygen-compatible local runtime at
`http://localhost:3000` and exposes GraphiQL at `/graphiql`.

## Connect the Shopify store

Authentication and storefront provisioning stay in Shopify CLI. Do not copy
Admin API credentials into this repository.

First install Shopify's Hydrogen sales channel on the Por El Deporte store:

<https://apps.shopify.com/hydrogen>

```bash
npx shopify hydrogen login --shop por-el-deporte
npx shopify hydrogen link
npx shopify hydrogen env pull
```

The pulled `.env` is ignored by Git. After connecting, run `npm run codegen` so
queries are typed against the configured Storefront and Customer Account APIs.

## Request architecture

```text
Browser
  -> React Router route loader/action on Oxygen
  -> Hydrogen Storefront API client or server-side cart
  -> Shopify Storefront API
  -> server-rendered response + hydrated React UI

Cart checkoutUrl
  -> Shopify-hosted checkout
```

Route loaders own server data fetching, GraphQL documents live beside the
feature that consumes them, and generated operation types provide the contract
between Shopify data and UI components. Client state is reserved for ephemeral
UI concerns such as drawer visibility; Shopify remains the source of truth for
commerce state.

## Official references

- [Hydrogen and Oxygen getting started](https://shopify.dev/docs/storefronts/headless/hydrogen/getting-started)
- [Hydrogen fundamentals](https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals)
- [Shopify CLI Hydrogen commands](https://shopify.dev/docs/api/shopify-cli/hydrogen)
