/**
 * Site-wide link and dead-control audit.
 *
 *   node scripts/link-audit.mjs [baseUrl]      # default http://localhost:3000
 *
 * Crawls every internal page reachable from the homepage and reports:
 *   - internal links that don't return 200
 *   - external links that don't resolve
 *   - <a> with no href / href="#" and <button> with no handler (dead controls),
 *     found by driving a real browser rather than reading the markup, so a React
 *     onClick counts as wired and a bare styled <button> does not
 *   - images that fail to load
 *   - links whose accessible name is empty
 */
import {chromium} from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const MAX_PAGES = 40;

// Routes that intentionally require auth or mutate state — crawl-visited but
// never followed as link targets to avoid logging in / emptying a cart.
const SKIP = /^\/(account|cart\/|discount\/|\.well-known)/;

const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1440, height: 900}});

const seen = new Set(['/']);
const queue = ['/'];
const linkStatus = new Map(); // url -> status
const problems = [];
const visited = [];

const record = (kind, where, detail) => problems.push({kind, where, detail});

async function statusOf(url) {
  if (linkStatus.has(url)) return linkStatus.get(url);
  let status;
  try {
    // GET, not HEAD — Oxygen answers HEAD differently on some routes.
    const res = await fetch(url, {redirect: 'follow'});
    status = res.status;
  } catch (err) {
    status = `ERR ${err.cause?.code ?? err.message}`;
  }
  linkStatus.set(url, status);
  return status;
}

while (queue.length && visited.length < MAX_PAGES) {
  const path = queue.shift();
  const url = BASE + path;
  let response;
  try {
    // 'load' + a short settle, NOT 'networkidle'. Pages carrying 20-30 lazy
    // images never reach a 500ms network-quiet window inside the timeout, so
    // networkidle reported /about and three PDPs as "failed to load" when they
    // render perfectly. Playwright discourages networkidle for exactly this.
    response = await page.goto(url, {waitUntil: 'load', timeout: 30000});
    await page.waitForTimeout(600);
  } catch {
    record('PAGE FAILED TO LOAD', path, url);
    continue;
  }
  if (response.status() !== 200) {
    record('PAGE NOT 200', path, `${response.status()}`);
    continue;
  }
  visited.push(path);

  const found = await page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return (
        r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05
      );
    };
    const name = (el) =>
      (el.getAttribute('aria-label') || el.textContent || '').trim();

    const links = [];
    const dead = [];
    for (const a of document.querySelectorAll('a')) {
      if (!vis(a)) continue;
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.startsWith('javascript:')) {
        dead.push({tag: 'a', name: name(a).slice(0, 40), href: href ?? '(none)'});
        continue;
      }
      links.push({href: a.href, name: name(a).slice(0, 40)});
    }
    // React 18+ delegates events to the root, so `el.onclick` is null even on a
    // wired button. The handler lives in the fiber props React stashes on the
    // DOM node under a `__reactProps$<hash>` key — that's the only honest way
    // to tell a working button from a styled <button> that does nothing.
    const reactProps = (el) => {
      const k = Object.keys(el).find((x) => x.startsWith('__reactProps$'));
      return k ? el[k] : null;
    };
    for (const b of document.querySelectorAll('button')) {
      if (!vis(b)) continue;
      const props = reactProps(b);
      const wired =
        b.closest('form') ||
        b.type === 'submit' ||
        b.onclick ||
        Boolean(props?.onClick || props?.onPointerDown || props?.onMouseDown);
      if (!wired) dead.push({tag: 'button', name: name(b).slice(0, 40), href: '(no handler)'});
    }
    const imgs = [...document.querySelectorAll('img')]
      .filter((i) => vis(i) && i.complete && i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src);

    const unnamed = [...document.querySelectorAll('a')]
      .filter((a) => vis(a) && !name(a) && !a.querySelector('img[alt]:not([alt=""])'))
      .map((a) => a.getAttribute('href'));

    return {links, dead, imgs, unnamed};
  });

  for (const d of found.dead) record(`DEAD ${d.tag.toUpperCase()}`, path, `"${d.name}" ${d.href}`);
  for (const i of found.imgs) record('IMAGE FAILED', path, i);
  for (const u of found.unnamed) record('LINK HAS NO NAME', path, u);

  for (const {href, name: text} of found.links) {
    const u = new URL(href);
    if (u.origin === BASE) {
      const p = u.pathname + u.search;
      if (SKIP.test(u.pathname)) continue;
      const st = await statusOf(BASE + p);
      if (st !== 200) record('BROKEN INTERNAL LINK', path, `${st}  ${p}  ("${text}")`);
      const clean = u.pathname;
      if (!seen.has(clean) && !SKIP.test(clean) && !/\.(xml|txt|json|png|ico)$/.test(clean)) {
        seen.add(clean);
        queue.push(clean);
      }
    } else if (u.protocol.startsWith('http')) {
      const st = await statusOf(href);
      if (st !== 200 && st !== 403 && st !== 429) {
        record('BROKEN EXTERNAL LINK', path, `${st}  ${href}  ("${text}")`);
      }
    }
  }
}

await browser.close();

console.log(`crawled ${visited.length} pages: ${visited.join(', ')}\n`);
if (!problems.length) {
  console.log('no problems found');
} else {
  const byKind = {};
  for (const p of problems) (byKind[p.kind] ??= []).push(p);
  for (const [kind, list] of Object.entries(byKind)) {
    console.log(`${kind}  (${list.length})`);
    const shown = new Set();
    for (const p of list) {
      const key = p.detail;
      if (shown.has(key)) continue;
      shown.add(key);
      console.log(`   ${p.where.padEnd(34)} ${p.detail}`);
    }
    console.log('');
  }
}
