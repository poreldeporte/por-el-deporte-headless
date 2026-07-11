# Por El Deporte Storefront

Por El Deporte's headless Shopify storefront, built with Shopify's supported
Hydrogen stack: React Router, strict TypeScript, Tailwind, and Oxygen.

## Current status

- Official Hydrogen `2026.4.3` TypeScript scaffold installed.
- GraphQL code generation, TypeScript, ESLint, and the Oxygen production build pass.
- Local server-side rendering returns `HTTP 200` against Mock.shop.
- Shopify CLI is authenticated to `por-el-deporte.myshopify.com`.
- Real Shopify connection is the next gate. The Hydrogen sales channel must be
  installed before this repository can be linked to a Hydrogen storefront.
- Homepage implementation starts after the design source is added to the project
  or shared as a viewable link.

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
