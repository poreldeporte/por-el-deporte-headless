/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  /**
   * Project-specific environment variables, merged with Hydrogen's own.
   */
  interface Env extends HydrogenEnv {
    /**
     * Admin API access token for a custom app with the `write_customers` scope.
     * Used only by app/routes/api.newsletter.tsx, server-side, to subscribe
     * people to email marketing — the Storefront API can't do that. Optional so
     * local dev and previews still build without it; the route reports a clear
     * failure when it's missing instead of pretending the signup worked.
     */
    PRIVATE_ADMIN_API_TOKEN?: string;

    /**
     * Google Search Console HTML-tag verification token — the `content` value
     * from the <meta name="google-site-verification"> snippet it hands you.
     * Rendered into every page's <head> by root.tsx when set. PUBLIC_ because
     * it is meant to be visible in the markup; it grants nothing on its own.
     */
    PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
  }
}
