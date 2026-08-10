/**
 * Redundant-link audit.
 *
 *   node scripts/dup-links.mjs [baseUrl]
 *
 * Two different kinds of redundancy, both of which waste a nav slot and confuse
 * a customer who expects different labels to go different places:
 *
 *   MANY LABELS -> ONE HREF   e.g. "Our Mission", "Gallery" and "Join the
 *                             Revolution" all landing on /about
 *   ONE LABEL -> MANY HREFS   the same wording pointing at different pages,
 *                             which is the same problem in reverse
 *
 * Scoped per region (footer / header / main) so that a product card legitimately
 * linking to its own PDP from an image and a title isn't reported.
 */
import {chromium} from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const PAGES = ['/', '/about', '/collections/all-products', '/products/island-sketch-tee', '/cart'];

const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1440, height: 900}});
const byRegion = new Map(); // region -> Map(href -> Set(label))

for (const path of PAGES) {
  await page.goto(BASE + path, {waitUntil: 'load'});
  await page.waitForTimeout(500);
  const links = await page.evaluate(() => {
    const out = [];
    for (const a of document.querySelectorAll('a[href]')) {
      const r = a.getBoundingClientRect();
      const cs = getComputedStyle(a);
      if (!(r.width > 0 && r.height > 0) || cs.visibility === 'hidden') continue;
      const label = (a.getAttribute('aria-label') || a.textContent || '').trim().replace(/\s+/g, ' ');
      if (!label) continue;
      const region = a.closest('footer')
        ? 'footer'
        : a.closest('header, nav[aria-label="Primary"]')
          ? 'header'
          : 'main';
      out.push({region, href: a.href, label});
    }
    return out;
  });
  for (const {region, href, label} of links) {
    if (!byRegion.has(region)) byRegion.set(region, new Map());
    const m = byRegion.get(region);
    if (!m.has(href)) m.set(href, new Set());
    m.get(href).add(label);
  }
}
await browser.close();

let found = 0;
for (const [region, m] of byRegion) {
  // many labels -> one href
  const dupes = [...m.entries()].filter(([, labels]) => labels.size > 1);
  if (dupes.length) {
    console.log(`\n${region.toUpperCase()} — several labels pointing at the same page:`);
    for (const [href, labels] of dupes) {
      found++;
      console.log(`   ${href.replace(BASE, '') || '/'}`);
      for (const l of labels) console.log(`      "${l}"`);
    }
  }
  // one label -> many hrefs
  const byLabel = new Map();
  for (const [href, labels] of m) {
    for (const l of labels) {
      if (!byLabel.has(l)) byLabel.set(l, new Set());
      byLabel.get(l).add(href);
    }
  }
  const split = [...byLabel.entries()].filter(([, hrefs]) => hrefs.size > 1);
  if (split.length) {
    console.log(`\n${region.toUpperCase()} — one label pointing at different pages:`);
    for (const [label, hrefs] of split) {
      found++;
      console.log(`   "${label}"`);
      for (const h of hrefs) console.log(`      ${h.replace(BASE, '') || '/'}`);
    }
  }
}
console.log(found ? `\n${found} redundancy group(s)` : '\nno redundant links');
