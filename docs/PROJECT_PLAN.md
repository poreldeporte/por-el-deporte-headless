# Por El Deporte Headless Shopify Plan

Updated: July 11, 2026

## Outcome

Deliver an interview-ready, mobile-first Hydrogen storefront with one reliable
end-to-end path:

```text
Homepage -> product listing -> product detail -> cart drawer -> Shopify checkout
```

The demo uses real Por El Deporte products, deploys to a shareable Oxygen preview,
and has local screenshots or a recording as a network-failure fallback.

## Delivery principles

1. Build vertical commerce slices before secondary features.
2. Keep Shopify as the source of truth for products, availability, cart, and checkout.
3. Treat generated GraphQL types as API contracts, not optional tooling.
4. Build mobile-first, then add wider-layout enhancements.
5. Make accessibility and automated tests part of each slice's definition of done.
6. Record meaningful AI decisions, verification, and human review instead of claiming
   that generated code is correct by default.

## Phase 0 — Supported baseline and access

- [x] Preserve the existing font assets while establishing the new storefront baseline.
- [x] Scaffold current, supported Hydrogen with React Router and TypeScript.
- [x] Add Tailwind and GraphQL code generation through the official generator.
- [x] Pass TypeScript, ESLint, production build, and local SSR smoke test.
- [x] Authenticate Shopify CLI with an identity that can access Por El Deporte.
- [ ] Install the Hydrogen sales channel on Por El Deporte.
- [ ] Link or create the Hydrogen storefront and pull its environment variables.
- [ ] Verify a real product query and cart creation against the store.
- [ ] Add the supplied design source and inventory its assets, breakpoints, and states.

Exit gate: the local homepage renders real store data and no credentials are committed.

## Phase 1 — Design-system foundation

- Define semantic color, typography, spacing, radius, shadow, and motion tokens.
- Self-host TAY Flapjack with explicit fallbacks and font-display behavior.
- Define the boundary: Tailwind for layout/common utilities; SCSS Modules for scoped,
  stateful, or visually complex components.
- Install Storybook and document primitives before composing page sections.
- Build accessible Button, Link, IconButton, Container, Heading, Price, ProductCard,
  Drawer, and quantity-control primitives.
- Add Storybook accessibility checks and responsive stories.

Exit gate: page work consumes documented tokens and primitives rather than one-off values.

## Phase 2 — Responsive homepage

- Translate the supplied design into semantic, independently testable sections.
- Implement the small-screen layout first and add intentional tablet/desktop changes.
- Use responsive Shopify images with meaningful alt text and stable aspect ratios.
- Add loading, empty, and error states for any commerce-backed section.
- Validate keyboard order, landmarks, headings, contrast, reduced motion, and focus states.

Exit gate: homepage matches the approved reference at agreed mobile and desktop widths.

## Phase 3 — Commerce vertical slice

### Product listing page

- Query real products or a selected collection with typed Storefront API GraphQL.
- Render responsive ProductCards with image, title, price range, and availability cues.
- Preserve URL-based pagination/filter state so links remain shareable.

### Product detail page

- Query product media, price, compare-at price, options, variants, and availability.
- Keep selected options in the URL when practical.
- Resolve a selected variant deterministically and disable impossible combinations.
- Add the selected merchandise ID through Hydrogen's server-side cart action.

### Cart and checkout

- Present the server-side cart in an accessible drawer.
- Use optimistic quantity updates and removals with recovery on action failure.
- Manage only drawer visibility/focus as ephemeral client state; Zustand is allowed if
  that state must be shared beyond the existing Hydrogen layout context.
- Send the shopper to the cart's Shopify-hosted `checkoutUrl`.

Exit gate: a shopper can choose a real variant, add it, change quantity, remove it,
and reach Shopify checkout on mobile and desktop.

## Phase 4 — Quality system

- Add Vitest and React Testing Library for design-system and commerce-state logic.
- Add Playwright for the primary commerce flow.
- Run Axe on the homepage, PLP, PDP, open cart, and core Storybook stories.
- Capture stable screenshots at selected mobile and desktop viewports.
- Test sold-out products, unavailable variants, empty cart, API errors, and slow images.

Exit gate: automated checks catch regressions in the interview-critical path.

## Phase 5 — Delivery and interview package

- Add GitHub Actions for install, codegen, typecheck, lint, unit tests, build, and E2E.
- Deploy a preview environment to Oxygen and verify its environment variables.
- Add architecture decisions for data flow, state ownership, styling, testing, and checkout.
- Add an AI workflow log showing prompts/decisions, diffs reviewed, and tests run.
- Capture final screenshots and a short narrated commerce-flow recording.
- Prepare a five-minute architecture walkthrough and failure/recovery talking points.

Exit gate: the demo works live and can still be presented without network access.

## Deferred labs

These are valuable interview topics but do not block the demo:

- Customer Account API authentication and account routes
- Algolia indexing, search UI, and webhook/update architecture
- Admin API mutations with server-only scopes and idempotency
- Shopify Functions deployment model and extension boundaries

## Weekend schedule

### Saturday, July 11

- Finish store access and validate real products/cart.
- Inventory the design and establish tokens/components.
- Complete the homepage shell and the commerce data model.

### Sunday, July 12

- Complete PLP, PDP, cart drawer, and checkout handoff.
- Add Storybook, Playwright/Axe coverage, Oxygen preview, and demo backups.
- Finish architecture and AI-workflow notes.

### Monday, July 13

- Run the full demo from a clean browser session.
- Rehearse architecture, tradeoffs, accessibility, testing, and deferred-feature answers.
- Keep the Oxygen URL, screenshots, and recording ready in separate tabs.
