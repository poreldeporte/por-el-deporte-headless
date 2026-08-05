import {redirect} from 'react-router';

/**
 * When a resource's real handle differs from the one in the URL (Shopify serves
 * localized handles), send the browser to the canonical one.
 *
 * Two things this has to get right, because getting them wrong is an infinite
 * redirect rather than a cosmetic bug:
 *
 * 1. `params.handle` arrives URL-DECODED, but `url.pathname` is still encoded.
 *    A request for `/products/island-sketch-tee%20` gives a handle of
 *    `"island-sketch-tee "` (trailing space), which the Storefront API resolves
 *    to `"island-sketch-tee"` — so a rewrite is needed. But
 *    `"/products/island-sketch-tee%20".replace("island-sketch-tee ", ...)` finds
 *    nothing, the pathname comes back unchanged, and we redirect to the exact
 *    URL we were already on. Forever. So the replacement runs on the decoded
 *    pathname and the URL setter re-encodes it.
 *
 * 2. Never redirect to the current URL. Even if the rewrite logic is somehow
 *    defeated, that check turns a browser-breaking loop into a plain render.
 */
export function redirectIfHandleIsLocalized(
  request: Request,
  ...localizedResources: Array<{
    handle: string;
    data: {handle: string} & unknown;
  }>
) {
  const url = new URL(request.url);

  let pathname: string;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    // Malformed escape sequence (e.g. `%zz`) — there's nothing safe to rewrite
    // to, so let the route render or 404 on its own.
    return;
  }

  let changed = false;
  for (const {handle, data} of localizedResources) {
    if (handle === data.handle) continue;
    const next = pathname.replace(handle, data.handle);
    if (next !== pathname) {
      pathname = next;
      changed = true;
    }
  }

  if (!changed) return;

  url.pathname = pathname;
  if (url.toString() === request.url) return;

  throw redirect(url.toString());
}
