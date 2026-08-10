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

# x-goog-user-project bills the call to a Cloud project, and sending one the
# signed-in account has no serviceusage permission on is worse than sending none
# at all — the API rejects the header before it ever looks at the request. Only
# attach it if ADC actually accepted the project as its quota project.
ADC_FILE="${HOME}/.config/gcloud/application_default_credentials.json"
quota_project() {
  [ -f "$ADC_FILE" ] || return 0
  python3 -c "
import json,sys
try: print(json.load(open('$ADC_FILE')).get('quota_project_id') or '')
except Exception: print('')
" 2>/dev/null
}

api() { # method url [body]
  local m=$1 u=$2 body=${3:-}
  local qp; qp=$(quota_project)
  local hdrs=(-H "Authorization: Bearer $(tok)")
  [ -n "$qp" ] && hdrs+=(-H "x-goog-user-project: $qp")
  if [ -n "$body" ]; then
    curl -sS -X "$m" "$u" "${hdrs[@]}" -H 'Content-Type: application/json' -d "$body"
  else
    curl -sS -X "$m" "$u" "${hdrs[@]}"
  fi
}

# Fails loudly and early rather than letting the API return a confusing 403.
require_scopes() {
  local have
  have=$(python3 -c "
import json
try:
    d=json.load(open('$ADC_FILE'))
    print(' '.join(d.get('scopes') or []))
except Exception:
    print('')
" 2>/dev/null)
  case "$have" in
    *siteverification*) return 0 ;;
  esac
  cat >&2 <<'EOF'
    ADC is missing the siteverification/webmasters scopes.

    A plain `gcloud auth application-default login` only grants openid,
    userinfo.email, cloud-platform and sqlservice.login — none of which let
    these APIs run. Re-run the login with the scopes spelled out:

      gcloud auth application-default login --scopes=openid,\
https://www.googleapis.com/auth/userinfo.email,\
https://www.googleapis.com/auth/cloud-platform,\
https://www.googleapis.com/auth/siteverification,\
https://www.googleapis.com/auth/webmasters

    Sign in as the account that should OWN the Search Console property
    long-term — whoever authorises here becomes its owner.
EOF
  exit 1
}

ensure_apis() {
  require_scopes
  # Both of these need permissions on the Cloud project that the signing-in
  # account may not have, and neither is required for the verification and
  # Search Console calls to work. Advisory only.
  echo "==> enabling APIs on $PROJECT (optional, ignore failures)"
  gcloud services enable siteverification.googleapis.com searchconsole.googleapis.com \
    --project "$PROJECT" >/dev/null 2>&1 \
    && echo "    enabled" \
    || echo "    skipped (no permission on $PROJECT) — not required"
  gcloud auth application-default set-quota-project "$PROJECT" >/dev/null 2>&1 \
    && echo "    quota project set" \
    || echo "    quota project not set — calls will run without one"
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
    require_scopes
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
