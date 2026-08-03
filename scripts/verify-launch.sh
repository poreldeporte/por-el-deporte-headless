#!/usr/bin/env bash
#
# Post-deploy / post-cutover launch verification for the Por El Deporte
# Hydrogen storefront.
#
#   ./scripts/verify-launch.sh                    # production env URL (default)
#   ./scripts/verify-launch.sh https://poreldeporte.com   # after the cutover
#
# Checks everything that can be verified over HTTP. Browser-visual items
# (Flapjack actually rendering, swatch -> gallery, cart drawer, phone layout)
# still need a human — see docs/LAUNCH_CHECKLIST.md.
#
# NOTE on preview domains: on *.o2.myshopify.dev, Shopify deliberately serves
# `robots.txt` as `Disallow: /` and 404s `/sitemap.xml`. That is NOT an app bug.
# Those two checks are only expected to pass once a real custom domain is
# primary, so they are reported as INFO (not FAIL) on an o2 host.

set -uo pipefail

BASE="${1:-https://por-el-deporte-87a553fa8ec4577088b4.o2.myshopify.dev}"
BASE="${BASE%/}"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

pass=0; fail=0; info=0
is_preview=0
[[ "$BASE" == *".o2.myshopify.dev"* ]] && is_preview=1

ok()   { printf '  \033[32mPASS\033[0m  %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; fail=$((fail+1)); }
note() { printf '  \033[33mINFO\033[0m  %s\n' "$1"; info=$((info+1)); }
hdr()  { printf '\n\033[1m%s\033[0m\n' "$1"; }

get()      { curl -sS -A "$UA" "$@"; }
status_of(){ curl -sS -A "$UA" -o /dev/null -w '%{http_code}' "$1"; }

echo "Verifying: $BASE"
[[ $is_preview -eq 1 ]] && echo "(preview domain — SEO surfaces are suppressed by Shopify by design)"

# ---------------------------------------------------------------- routes
hdr "Routes"
while IFS='|' read -r path want; do
  got=$(status_of "$BASE$path")
  if [[ "$got" == "$want" ]]; then ok "$path -> $got"
  else bad "$path -> $got (expected $want)"; fi
done <<'ROUTES'
/|200
/collections|200
/collections/all-products|200
/collections/all-tees|200
/products/el-clasico-tee|200
/search?q=tee|200
/cart|200
/about|200
/policies|200
/policies/privacy-policy|200
/blogs|200
/robots.txt|200
/nope|404
/products/nope-not-real-xyz|404
/collections/does-not-exist-xyz|404
ROUTES

# ---------------------------------------------------- the font CSP fix
hdr "Flapjack font (the cd5b640 CSP fix)"
# Fetch bodies into variables before matching: with `pipefail`, a `grep -q` that
# exits on first match closes the pipe and curl dies with 56, which would
# otherwise be misreported as a failed check.
home_early=$(get "$BASE/")
csp=$(curl -sS -A "$UA" -D - -o /dev/null "$BASE/" | tr -d '\r' | grep -i '^content-security-policy:')
if grep -q 'font-src[^;]*cdn\.shopify\.com' <<<"$csp"; then
  ok "CSP font-src allows cdn.shopify.com"
else
  bad "CSP font-src is MISSING cdn.shopify.com -> Flapjack will be blocked (redeploy needed)"
fi

# The @font-face URL is rewritten by Oxygen at deploy time; find it and fetch it.
tokens_css=$(grep -oE 'https://[^"]*pel-tokens-[^"]*\.css' <<<"$home_early" | head -1)
if [[ -n "$tokens_css" ]]; then
  tokens_body=$(get "$tokens_css")
  font_url=$(grep -oE 'url\(([^)]*TAYFlapjack[^)]*\.woff2)' <<<"$tokens_body" | head -1 | sed 's/^url(//')
  if [[ -n "$font_url" ]]; then
    fs=$(status_of "$font_url")
    [[ "$fs" == "200" ]] && ok "font file serves 200 ($font_url)" \
                         || bad "font file -> $fs ($font_url)"
  else
    bad "could not find a TAYFlapjack woff2 URL in $tokens_css"
  fi
else
  bad "could not locate the pel-tokens stylesheet on the homepage"
fi

# ---------------------------------------------------------- SEO surfaces
hdr "SEO"
home="$home_early"
pdp=$(get "$BASE/products/el-clasico-tee")
grep -q '<link rel="canonical"' <<<"$home" && ok "canonical <link> present" || bad "canonical <link> missing"
grep -q 'property="og:title"'   <<<"$home" && ok "Open Graph tags present"  || bad "Open Graph tags missing"
grep -q '"@type":"Product"'     <<<"$pdp"  && ok "Product JSON-LD on PDP"   || bad "Product JSON-LD missing on PDP"

canon=$(grep -oE '<link rel="canonical" href="[^"]*"' <<<"$home" | sed 's/.*href="//;s/"//')
if [[ "$canon" == "$BASE"* ]]; then ok "canonical points at this host ($canon)"
else note "canonical is $canon (expected to start with $BASE)"; fi

robots=$(get "$BASE/robots.txt")
# Only a bare `Disallow: /` inside the `User-agent: *` group blocks everyone.
# Shopify's standard robots.txt also contains `User-agent: Nutch` + `Disallow: /`,
# which blocks that one crawler by design — grepping the file as a whole for
# '^Disallow: /$' matches it and cries wolf on a perfectly healthy site.
blocks_all_crawlers() {
  awk '
    /^[Uu]ser-agent:[[:space:]]*/ { ua = $2; next }
    ua == "*" && /^[Dd]isallow:[[:space:]]*\/[[:space:]]*$/ { found = 1 }
    END { exit(found ? 0 : 1) }
  ' <<<"$1"
}
if blocks_all_crawlers "$robots"; then
  if [[ $is_preview -eq 1 ]]; then
    note "robots.txt disallows all for 'User-agent: *' — expected on a preview domain, NOT an app bug"
  else
    bad "robots.txt disallows ALL crawlers for 'User-agent: *' on a LIVE domain!"
  fi
else
  ok "robots.txt does not block crawlers for 'User-agent: *'"
  grep -q '^Sitemap:' <<<"$robots" && ok "robots.txt has a Sitemap: line" \
                                   || bad "robots.txt has no Sitemap: line"
fi

sm=$(status_of "$BASE/sitemap.xml")
if [[ "$sm" == "200" ]]; then
  sm_body=$(get "$BASE/sitemap.xml")
  grep -q '<sitemapindex' <<<"$sm_body" && ok "sitemap.xml is a valid index" \
                                        || bad "sitemap.xml is 200 but not a sitemapindex"
elif [[ $is_preview -eq 1 ]]; then
  note "sitemap.xml -> $sm — expected on a preview domain, NOT an app bug"
else
  bad "sitemap.xml -> $sm on a LIVE domain"
fi

# ------------------------------------------------------- editorial imagery
# The cutover trap: brand photos were hardcoded to
# `https://poreldeporte.com/cdn/shop/files/…`, a path only the OLD themed store
# served. On the preview domain they loaded fine (poreldeporte.com was still the
# themed store); the moment the domain pointed at Oxygen they all 404'd. So check
# that every absolute image the homepage references actually resolves.
hdr "Editorial imagery"
img_urls=$(grep -oE 'src="https://[^"]+\.(jpg|jpeg|png|webp)[^"]*"' <<<"$home" \
  | sed 's/^src="//; s/"$//; s/&amp;/\&/g' | sort -u)
if [[ -z "$img_urls" ]]; then
  bad "no absolute images found on the homepage — markup changed?"
else
  n_img=0; n_bad=0
  while IFS= read -r u; do
    [[ -z "$u" ]] && continue
    n_img=$((n_img + 1))
    code=$(status_of "$u")
    if [[ "$code" != "200" ]]; then
      n_bad=$((n_bad + 1))
      bad "image $code  ${u#https://}"
    fi
  done <<<"$img_urls"
  [[ $n_bad -eq 0 ]] && ok "all $n_img homepage images resolve (200)"
fi
# Self-hosted /cdn/shop/* is the specific shape that breaks post-cutover.
selfcdn=$(grep -cE "src=\"$BASE/cdn/shop/" <<<"$home" || true)
if [[ "${selfcdn:-0}" -gt 0 ]]; then
  bad "$selfcdn image(s) point at $BASE/cdn/shop/… — that path is not served by Oxygen"
else
  ok "no images rely on the old /cdn/shop/ storefront path"
fi

# --------------------------------------------------------------- commerce
hdr "Commerce"
grep -q 'pel-pdp__swatch' <<<"$pdp" \
  && ok "PDP renders colour swatches" || bad "PDP swatches missing"

pdp_variant=$(grep -oE 'gid://shopify/ProductVariant/[0-9]+' <<<"$pdp" | head -1)
[[ -n "$pdp_variant" ]] && ok "PDP exposes a variant id" || bad "no variant id on PDP"

jar=$(mktemp)
curl -sS -A "$UA" -X POST "$BASE/cart" -c "$jar" \
  --data-urlencode "cartFormInput={\"action\":\"LinesAdd\",\"inputs\":{\"lines\":[{\"merchandiseId\":\"$pdp_variant\",\"quantity\":1}]}}" \
  -o /dev/null 2>/dev/null
cart_ck=$(awk '$6=="cart"{print $7}' "$jar" 2>/dev/null | head -1)
if [[ -n "$cart_ck" ]]; then
  ok "add-to-cart created a cart"
  cart_html=$(curl -sS -A "$UA" "$BASE/cart" -H "Cookie: cart=$cart_ck")
  grep -q 'cart/c/' <<<"$cart_html" && ok "cart page exposes a Shopify checkout URL" \
                                    || bad "no checkout URL on the cart page"
else
  bad "add-to-cart did not set a cart cookie"
fi
rm -f "$jar"

# -------------------------------------------------------------- branding
hdr "Branding & errors"
grep -q 'pel-logo-img' <<<"$home" && ok "real logo from shop.brand.logo" \
                                  || note "logo <img> absent (wordmark fallback in use)"
err=$(get "$BASE/nope")
grep -q 'pel-error__' <<<"$err" && ok "branded 404 page" || bad "404 is not the branded page"
pol=$(get "$BASE/policies")
grep -q '<title>' <<<"$pol" && ok "/policies has a <title>" \
                            || bad "/policies has no <title> (fixed in bf6874e — needs a redeploy)"

# ----------------------------------------------------------------- report
hdr "Result"
printf '  %d passed, %d failed, %d informational\n' "$pass" "$fail" "$info"
if [[ $fail -gt 0 ]]; then
  echo "  -> Not clear to cut over. See FAILs above."
  exit 1
fi
echo "  -> HTTP checks clear. Browser-visual pass still required (see docs/LAUNCH_CHECKLIST.md)."
