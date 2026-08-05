#!/usr/bin/env bash
# Google Search Console setup, driven by the API instead of the web UI.
#
#   ./scripts/search-console.sh dns-token   # RECOMMENDED: TXT record, no deploy needed
#   ./scripts/search-console.sh dns-verify  # verify + add property + submit sitemap
#   ./scripts/search-console.sh token       # alt: meta tag (needs an Oxygen deploy)

#   ./scripts/search-console.sh report    # anytime: coverage + top queries
#
# Prerequisite (only a human can do this — it needs the Google password/2FA):
#
#   gcloud auth application-default login \
#     --scopes=openid,https://www.googleapis.com/auth/userinfo.email,\
#   https://www.googleapis.com/auth/cloud-platform,\
#   https://www.googleapis.com/auth/siteverification,\
#   https://www.googleapis.com/auth/webmasters
#
# Whichever Google account you log in with becomes the OWNER of the Search
# Console property, so use the one the business should keep long-term.
set -euo pipefail

SITE="https://poreldeporte.com/"
DOMAIN="poreldeporte.com"
PROJECT="${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project 2>/dev/null)}"

tok() {
  gcloud auth application-default print-access-token 2>/dev/null || {
    echo "No application-default credentials." >&2
    echo "Run the gcloud auth application-default login command in this file's header." >&2
    exit 1
  }
}

api() { # method url [body]
  local m=$1 u=$2 body=${3:-}
  if [ -n "$body" ]; then
    curl -sS -X "$m" "$u" \
      -H "Authorization: Bearer $(tok)" \
      -H 'Content-Type: application/json' \
      -H "x-goog-user-project: $PROJECT" \
      -d "$body"
  else
    curl -sS -X "$m" "$u" \
      -H "Authorization: Bearer $(tok)" \
      -H "x-goog-user-project: $PROJECT"
  fi
}

ensure_apis() {
  echo "==> enabling APIs on $PROJECT (idempotent)"
  gcloud services enable siteverification.googleapis.com searchconsole.googleapis.com \
    --project "$PROJECT" 2>&1 | sed 's/^/    /' || true
  gcloud auth application-default set-quota-project "$PROJECT" 2>&1 | sed 's/^/    /' || true
}

case "${1:-}" in
  dns-token)
    # Preferred over `token`. poreldeporte.com's nameservers are Cloudflare, so a
    # TXT record is a 30-second change in a dashboard — and unlike the meta tag it
    # needs no deploy, covers every subdomain, and survives a storefront rebuild.
    ensure_apis
    echo "==> requesting a DNS_TXT verification token for $DOMAIN"
    api POST 'https://www.googleapis.com/siteVerification/v1/token' \
      "{\"verificationMethod\":\"DNS_TXT\",\"site\":{\"type\":\"INET_DOMAIN\",\"identifier\":\"$DOMAIN\"}}" \
      | python3 -c '
import sys, json
d = json.load(sys.stdin)
if "error" in d:
    print("    ERROR:", json.dumps(d["error"])[:400]); sys.exit(1)
print("    Add this TXT record in Cloudflare DNS for poreldeporte.com:")
print()
print("      Type:  TXT")
print("      Name:  @        (the root, poreldeporte.com)")
print("      Value:", d["token"])
print()
print("    NOTE: the domain already has one google-site-verification TXT record.")
print("    ADD this one alongside it — do not replace it, something else is using it.")
print()
print("    Then run:  ./scripts/search-console.sh dns-verify")
'
    ;;

  dns-verify)
    echo "==> checking the TXT record has propagated"
    if ! dig +short TXT "$DOMAIN" | grep -q 'google-site-verification'; then
      echo "    no google-site-verification TXT found on $DOMAIN" >&2
      exit 1
    fi
    dig +short TXT "$DOMAIN" | grep 'google-site-verification' | sed 's/^/    found: /'
    echo "==> verifying domain ownership"
    api POST 'https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=DNS_TXT' \
      "{\"site\":{\"type\":\"INET_DOMAIN\",\"identifier\":\"$DOMAIN\"}}" | sed 's/^/    /'
    echo "==> adding the sc-domain property"
    api PUT "https://www.googleapis.com/webmasters/v3/sites/sc-domain%3A$DOMAIN" | sed 's/^/    /'
    echo "==> submitting the sitemap index"
    code=$(curl -sS -o /dev/null -w '%{http_code}' -X PUT \
      "https://www.googleapis.com/webmasters/v3/sites/sc-domain%3A$DOMAIN/sitemaps/$(python3 -c "
import urllib.parse; print(urllib.parse.quote('${SITE}sitemap.xml', safe=''))")" \
      -H "Authorization: Bearer $(tok)" -H "x-goog-user-project: $PROJECT")
    echo "    sitemap.xml -> HTTP $code"
    echo "==> done, no deploy required."
    ;;

  token)
    ensure_apis
    echo "==> requesting a META verification token for $SITE"
    api POST 'https://www.googleapis.com/siteVerification/v1/token' \
      "{\"verificationMethod\":\"META\",\"site\":{\"type\":\"SITE\",\"identifier\":\"$SITE\"}}" \
      | python3 -c '
import sys, json, re
d = json.load(sys.stdin)
if "error" in d:
    print("    ERROR:", json.dumps(d["error"])[:400]); sys.exit(1)
tag = d["token"]
m = re.search(r'"'"'content="([^"]+)"'"'"', tag)
print("    meta tag :", tag)
print()
print("    CONTENT  :", m.group(1) if m else "(could not parse)")
print()
print("    Next: set PUBLIC_GOOGLE_SITE_VERIFICATION to that CONTENT value in")
print("    Oxygen (Shopify admin > Hydrogen > Settings > Environment variables >")
print("    Production), deploy, then run:  ./scripts/search-console.sh verify")
'
    ;;

  verify)
    # Refuse to verify before the tag is actually live, otherwise Google marks the
    # attempt failed and we burn a retry.
    echo "==> checking the tag is live on $SITE"
    if ! curl -sS "$SITE" | grep -q 'google-site-verification'; then
      echo "    NOT LIVE: no google-site-verification meta tag on $SITE" >&2
      echo "    Set PUBLIC_GOOGLE_SITE_VERIFICATION in Oxygen and deploy first." >&2
      exit 1
    fi
    echo "    tag is live"

    echo "==> verifying ownership"
    api POST 'https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=META' \
      "{\"site\":{\"type\":\"SITE\",\"identifier\":\"$SITE\"}}" | sed 's/^/    /'

    echo "==> adding the Search Console property"
    api PUT "https://www.googleapis.com/webmasters/v3/sites/$(python3 -c "
import urllib.parse,sys; print(urllib.parse.quote('$SITE', safe=''))")" | sed 's/^/    /'

    echo "==> submitting sitemaps"
    for s in sitemap.xml; do
      enc=$(python3 -c "
import urllib.parse; print(urllib.parse.quote('${SITE}${s}', safe=''))")
      site_enc=$(python3 -c "
import urllib.parse; print(urllib.parse.quote('$SITE', safe=''))")
      code=$(curl -sS -o /dev/null -w '%{http_code}' -X PUT \
        "https://www.googleapis.com/webmasters/v3/sites/$site_enc/sitemaps/$enc" \
        -H "Authorization: Bearer $(tok)" -H "x-goog-user-project: $PROJECT")
      echo "    $s -> HTTP $code"
    done
    echo "==> done. Coverage data takes a day or two to appear."
    ;;

  report)
    site_enc=$(python3 -c "
import urllib.parse; print(urllib.parse.quote('$SITE', safe=''))")
    echo "==> properties on this account"
    api GET 'https://www.googleapis.com/webmasters/v3/sites' | python3 -c '
import sys,json
d=json.load(sys.stdin)
if "error" in d: print("    ERROR:", json.dumps(d["error"])[:300]); sys.exit(0)
for s in d.get("siteEntry",[]): print(f"    {s[\"permissionLevel\"]:<22} {s[\"siteUrl\"]}")
'
    echo "==> sitemaps"
    api GET "https://www.googleapis.com/webmasters/v3/sites/$site_enc/sitemaps" | python3 -c '
import sys,json
d=json.load(sys.stdin)
if "error" in d: print("    ERROR:", json.dumps(d["error"])[:300]); sys.exit(0)
for s in d.get("sitemap",[]):
    n=sum(int(c.get("submitted",0)) for c in s.get("contents",[]))
    print(f"    {s[\"path\"]}  submitted={n} errors={s.get(\"errors\",0)} warnings={s.get(\"warnings\",0)}")
'
    echo "==> top queries, last 28 days"
    start=$(python3 -c "
import datetime; print((datetime.date.today()-datetime.timedelta(days=28)).isoformat())")
    end=$(python3 -c "import datetime; print(datetime.date.today().isoformat())")
    api POST "https://www.googleapis.com/webmasters/v3/sites/$site_enc/searchAnalytics/query" \
      "{\"startDate\":\"$start\",\"endDate\":\"$end\",\"dimensions\":[\"query\"],\"rowLimit\":15}" \
      | python3 -c '
import sys,json
d=json.load(sys.stdin)
if "error" in d: print("    ERROR:", json.dumps(d["error"])[:300]); sys.exit(0)
rows=d.get("rows",[])
if not rows: print("    no data yet (normal for a new property)"); sys.exit(0)
for r in rows:
    print(f"    {r[\"keys\"][0][:44]:<46} clicks={r[\"clicks\"]:<5.0f} impr={r[\"impressions\"]:<6.0f} pos={r[\"position\"]:.1f}")
'
    ;;

  *)
    sed -n '2,20p' "$0"
    exit 1
    ;;
esac
