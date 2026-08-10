/**
 * Contrast audit.
 *
 *   node scripts/contrast-audit.mjs [baseUrl]
 *
 * Walks the rendered pages and reports every text node whose colour fails WCAG
 * AA against its actual painted backdrop. Resolves the backdrop by climbing
 * ancestors for the first non-transparent background, and composites any alpha
 * in the text colour onto it, so `rgba(23,23,23,0.55)` is measured as what the
 * eye sees rather than as its nominal value.
 *
 * Text over an image is reported separately: the backdrop can't be sampled from
 * computed styles, so those are listed as "over image" for a human to judge
 * rather than silently passed or failed.
 */
import {chromium} from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const PAGES = ['/', '/about', '/collections/all-products', '/products/island-sketch-tee', '/cart', '/policies'];

const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
const seen = new Map();

for (const path of PAGES) {
  await page.goto(BASE + path, {waitUntil: 'load'});
  await page.waitForTimeout(900);
  const rows = await page.evaluate(() => {
    const lin = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const ratio = (a, b) => {
      const la = lum(a), lb = lum(b);
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    };
    const parse = (s) => {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((x) => parseFloat(x));
      return {rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1};
    };
    const over = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a));

    const out = [];
    for (const el of document.querySelectorAll('*')) {
      if (el.children.length) continue;
      const text = (el.textContent || '').trim();
      if (text.length < 3) continue;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (!(r.width > 0 && r.height > 0) || cs.visibility === 'hidden' || +cs.opacity === 0) continue;

      const fg = parse(cs.color);
      if (!fg) continue;

      // climb for a painted backdrop
      // Climb for a painted backdrop. A background-image only wins if that same
      // node has no solid colour under it — otherwise a decorative ancestor
      // (the footer's scallop, say) masked a perfectly measurable green and the
      // whole subtree got waved through as "over image".
      let bg = null, img = false, node = el;
      while (node && node !== document.documentElement) {
        const s = getComputedStyle(node);
        const b = parse(s.backgroundColor);
        if (b && b.a > 0.95) { bg = b.rgb; break; }
        if (s.backgroundImage && s.backgroundImage !== 'none') { img = true; break; }
        node = node.parentElement;
      }
      // an <img> sibling behind full-bleed sections
      if (!bg && !img) continue;

      const size = parseFloat(cs.fontSize);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const need = large ? 3 : 4.5;

      if (img) {
        out.push({sel: el.className || el.tagName, text: text.slice(0, 34), px: size, over: 'image', need});
        continue;
      }
      // Element opacity dims the text against the same backdrop, so it has to be
      // composited too — this is what hid the 3.67:1 footer headings.
      let eff = fg.a < 1 ? over(fg.rgb, bg, fg.a) : fg.rgb;
      const op = parseFloat(cs.opacity);
      if (op < 1) eff = over(eff, bg, op);
      const cr = ratio(eff, bg);
      if (cr < need) {
        out.push({
          sel: String(el.className || el.tagName).slice(0, 40),
          text: text.slice(0, 34),
          px: size, weight,
          got: +cr.toFixed(2), need,
          color: cs.color, bg: `rgb(${bg.join(', ')})`,
        });
      }
    }
    return out;
  });
  for (const row of rows) {
    const key = `${row.sel}|${row.got ?? 'img'}`;
    if (!seen.has(key)) seen.set(key, {...row, where: path});
  }
}
await browser.close();

const fails = [...seen.values()].filter((r) => r.over !== 'image').sort((a, b) => a.got - b.got);
const onImages = [...seen.values()].filter((r) => r.over === 'image');

console.log(`${fails.length} contrast failure(s):\n`);
for (const f of fails) {
  console.log(`  ${f.got}:1  (needs ${f.need})  ${f.px}px/${f.weight}  ${f.sel}`);
  console.log(`        "${f.text}"  ${f.color} on ${f.bg}   ${f.where}`);
}
if (onImages.length) {
  console.log(`\n${onImages.length} text run(s) over imagery — judge by eye, not computable:`);
  for (const f of onImages.slice(0, 8)) console.log(`  ${f.sel}  "${f.text}"`);
}
