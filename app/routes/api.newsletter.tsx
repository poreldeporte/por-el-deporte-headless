import type {Route} from './+types/api.newsletter';

/**
 * Newsletter signup. Creates a Shopify customer with email marketing consent.
 *
 * This has to go through the Admin API: the Storefront API has no way to
 * subscribe someone to marketing, and the footer form previously just called
 * preventDefault() and told people "You're In!" while dropping the address on
 * the floor. Everything here runs server-side so the admin token never reaches
 * the browser.
 *
 * Requires PRIVATE_ADMIN_API_TOKEN (a custom app token with write_customers).
 * Without it the endpoint reports failure rather than pretending to succeed —
 * silently swallowing signups is the bug this replaces.
 */

// Deliberately NOT tagged `#graphql`. Codegen validates every tagged document
// in app/ against the *Storefront* schema, and this is an Admin API operation —
// tagging it would break `npm run codegen`.
const SUBSCRIBE_MUTATION = `
  mutation NewsletterSubscribe($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADMIN_API_VERSION = '2026-04';

/** Conservative shape check — Shopify does the real validation. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Result = {ok: boolean; message: string};

/**
 * Resource route, so there is nothing to GET. Without a loader React Router
 * answers a bare "Unexpected Server Error"; this says what's actually wrong.
 */
export function loader() {
  return Response.json({ok: false, message: 'POST an email to subscribe.'} satisfies Result, {
    status: 405,
    headers: {Allow: 'POST'},
  });
}

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json({ok: false, message: 'Method not allowed'} satisfies Result, {status: 405});
  }

  // This endpoint is unauthenticated and creates records, so reject anything
  // that wasn't submitted from our own pages. Not a substitute for rate
  // limiting, but it stops the trivial cross-site abuse.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return Response.json({ok: false, message: 'Forbidden'} satisfies Result, {status: 403});
  }

  const email = String((await request.formData()).get('email') ?? '')
    .trim()
    .toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return Response.json(
      {ok: false, message: 'That email doesn’t look right.'} satisfies Result,
      {status: 400},
    );
  }

  const token = context.env.PRIVATE_ADMIN_API_TOKEN;
  const shop = context.env.PUBLIC_STORE_DOMAIN;
  if (!token) {
    console.error(
      'Newsletter signup failed: PRIVATE_ADMIN_API_TOKEN is not set, so ' +
        `"${email}" was not subscribed.`,
    );
    return Response.json(
      {
        ok: false,
        message: 'Signups are down right now. Email contact@poreldeporte.com and we’ll add you.',
      } satisfies Result,
      {status: 503},
    );
  }

  try {
    const response = await fetch(
      `https://${shop}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({
          query: SUBSCRIBE_MUTATION,
          variables: {
            input: {
              email,
              emailMarketingConsent: {
                marketingState: 'SUBSCRIBED',
                marketingOptInLevel: 'SINGLE_OPT_IN',
                consentUpdatedAt: new Date().toISOString(),
              },
              tags: ['newsletter', 'storefront-footer'],
            },
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Admin API returned ${response.status}`);
    }

    const body = (await response.json()) as {
      data?: {customerCreate?: {userErrors?: {field: string[]; message: string}[]}};
      errors?: {message: string}[];
    };

    if (body.errors?.length) {
      throw new Error(body.errors.map((e) => e.message).join('; '));
    }

    const userErrors = body.data?.customerCreate?.userErrors ?? [];
    if (userErrors.length) {
      // An address already on file is the normal case for a returning
      // supporter, not a failure worth showing them. Their consent state is
      // whatever it already was — we don't silently flip an unsubscribe back on.
      const taken = userErrors.some((e) => /taken|already/i.test(e.message));
      if (taken) {
        return Response.json({ok: true, message: 'You’re already on the list.'} satisfies Result);
      }
      return Response.json(
        {ok: false, message: userErrors[0].message} satisfies Result,
        {status: 400},
      );
    }

    return Response.json({ok: true, message: 'You’re in.'} satisfies Result);
  } catch (error) {
    console.error('Newsletter signup failed:', error);
    return Response.json(
      {ok: false, message: 'Something went wrong. Try again in a moment.'} satisfies Result,
      {status: 502},
    );
  }
}
