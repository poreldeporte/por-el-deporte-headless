/**
 * Mobile responsiveness audit.
 *
 *   node scripts/mobile-audit.mjs [baseUrl]      # default http://localhost:3000
 *
 * Loads each key route at iPhone-class viewports and reports, per route:
 *   - horizontal overflow of the document, and the elements actually causing it
 *   - tap targets below the 44x44 minimum
 *   - text below 12px
 *   - images that overflow their container
 * Writes a screenshot per route/viewport so the layout can be eyeballed too.
 */
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:3000';
const OUT = process.env.AUDIT_OUT || '/tmp/mobile-audit';
mkdirSync(OUT, {recursive: true});

// Each route carries a selector that MUST be present. A pure layout audit will
// happily report "no problems" on a page that renders nothing at all — which is
// exactly what happened when a PageLayout edit dropped <main>{children}</main>.
const ROUTES = [
  ['home', '/', '.pel-hero'],
  ['about', '/about', '.pel-subhero'],
  ['shop', '/collections/all-products', '.pel-shop__grid'],
  ['product', '/products/el-clasico-tee', '.pel-pdp__buy'],
  ['cart', '/cart', '.cart'],
  ['search', '/search?q=tee', '.pel-search'],
  ['policies', '/policies', '.pel-legal'],
];

// 390 = iPhone 14/15, 360 = common Android floor, 768 = tablet boundary
const VIEWPORTS = [
  ['390', 390, 844],
  ['360', 360, 800],
];

const probe = () => {
  const vw = document.documentElement.clientWidth;
  const out = {vw, scrollWidth: document.documentElement.scrollWidth, offenders: [], taps: [], small: [], imgs: [], sticky: []};
  const label = (el) => {
    const id = el.id ? `#${el.id}` : '';
    const cls = typeof el.className === 'string' && el.className
      ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
      : '';
    return `${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 78);
  };
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;

    // Overflow past the right edge (or off the left). Ignore anything that is
    // inside a clipping ancestor — that overflow is intentional and invisible.
    if (r.right > vw + 1 || r.left < -1) {
      let clipped = false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const pcs = getComputedStyle(p);
        if (/hidden|clip|auto|scroll/.test(pcs.overflowX)) { clipped = true; break; }
      }
      if (!clipped) {
        out.offenders.push({
          el: label(el),
          left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
          over: Math.round(r.right - vw),
        });
      }
    }
    // Tap targets
    if (el.matches('a,button,[role="button"],input,select') && r.width > 0) {
      if (r.height < 44 || r.width < 24) {
        out.taps.push({el: label(el), w: Math.round(r.width), h: Math.round(r.height)});
      }
    }
    // Tiny text
    const fs = parseFloat(cs.fontSize);
    if (fs && fs < 12 && el.textContent && el.textContent.trim().length > 3 && el.children.length === 0) {
      out.small.push({el: label(el), px: +fs.toFixed(1), text: el.textContent.trim().slice(0, 34)});
    }
    // position:sticky that can never pin. A sticky element sticks to its nearest
    // SCROLL CONTAINER, not the viewport — so a single `overflow-x: hidden` on
    // html/body silently disables every sticky on the page. That is exactly how
    // the About page's pinned scroll scene died on mobile while this audit
    // reported "no layout problems": an unpinned scene is just empty space.
    if (cs.position === 'sticky') {
      for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
        const ncs = getComputedStyle(n);
        if (/hidden|auto|scroll/.test(ncs.overflowX) || /hidden|auto|scroll/.test(ncs.overflowY)) {
          out.sticky.push({el: label(el), blockedBy: label(n), overflow: `${ncs.overflowX}/${ncs.overflowY}`});
          break;
        }
      }
    }
    // Images wider than their parent
    if (el.tagName === 'IMG' && el.parentElement) {
      const pr = el.parentElement.getBoundingClientRect();
      // Only a problem if it is not clipped — a full-bleed parallax backdrop is
      // deliberately oversized and hidden by its container.
      let clips = false;
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        const ncs = getComputedStyle(n);
        if (/hidden|clip/.test(ncs.overflow) || /hidden|clip/.test(ncs.overflowX)) { clips = true; break; }
      }
      if (r.width > pr.width + 2 && !clips) {
        out.imgs.push({el: label(el), w: Math.round(r.width), parent: Math.round(pr.width)});
      }
    }
  }
  const dedupe = (a, k) => {
    const seen = new Set();
    return a.filter((x) => (seen.has(x[k]) ? false : seen.add(x[k])));
  };
  out.sticky = dedupe(out.sticky, 'el').slice(0, 6);
  out.offenders = dedupe(out.offenders.sort((a, b) => b.over - a.over), 'el').slice(0, 12);
  out.taps = dedupe(out.taps, 'el').slice(0, 10);
  out.small = dedupe(out.small, 'el').slice(0, 8);
  out.imgs = dedupe(out.imgs, 'el').slice(0, 8);
  return out;
};

const browser = await chromium.launch();
let problems = 0;

for (const [vname, w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: {width: w, height: h},
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  for (const [name, path, must] of ROUTES) {
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + path, {waitUntil: 'networkidle', timeout: 45000});
    } catch {
      await page.goto(BASE + path, {waitUntil: 'domcontentloaded', timeout: 45000});
    }
    await page.waitForTimeout(700);
    const r = await page.evaluate(probe);
    const overflow = r.scrollWidth - r.vw;
    const hasContent = await page.evaluate((sel) => !!document.querySelector(sel), must);
    const footer = await page.evaluate(() => !!document.querySelector('.pel-footer'));

    console.log(`\n=== ${name} @${vname}  (vw ${r.vw}, scrollWidth ${r.scrollWidth})`);
    if (!hasContent) { problems++; console.log(`  ⚠ PAGE DID NOT RENDER: "${must}" missing`); }
    if (!footer) { problems++; console.log('  ⚠ FOOTER MISSING'); }
    if (overflow > 1) {
      problems++;
      console.log(`  ⚠ HORIZONTAL OVERFLOW: +${overflow}px`);
      for (const o of r.offenders) console.log(`     +${o.over}px  ${o.el}  [w ${o.width}, right ${o.right}]`);
      if (!r.offenders.length) console.log('     (no unclipped offender — likely a margin/negative-offset)');
    } else {
      console.log('  ok  no horizontal overflow');
    }
    if (r.sticky.length) {
      problems++;
      console.log('  ⚠ position:sticky cannot pin (trapped in a scroll container):');
      r.sticky.forEach((x) => console.log(`     ${x.el}  blocked by ${x.blockedBy} [overflow ${x.overflow}]`));
    }
    if (r.imgs.length) { problems++; console.log('  ⚠ images wider than parent:'); r.imgs.forEach((i) => console.log(`     ${i.el}  ${i.w} > ${i.parent}`)); }
    if (r.taps.length) console.log(`  · ${r.taps.length} small tap target(s): ` + r.taps.slice(0, 4).map((t) => `${t.el}(${t.w}x${t.h})`).join(', '));
    if (r.small.length) console.log(`  · ${r.small.length} text <12px: ` + r.small.slice(0, 3).map((t) => `${t.el}@${t.px}px`).join(', '));

    await page.screenshot({path: `${OUT}/${name}-${vname}.png`, fullPage: false});
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(`\nscreenshots -> ${OUT}`);
console.log(problems ? `\n${problems} layout problem(s) found` : '\nno layout problems found');
