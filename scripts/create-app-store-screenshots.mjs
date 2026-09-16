import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourceDir = path.join(root, 'public/app-screens');
const outputDir = path.join(root, 'app-store-screenshots');
await fs.mkdir(outputDir, {recursive: true});

const screens = [
  {
    file: '01-home.png',
    output: '01-community-home.png',
    kicker: 'POR EL DEPORTE · THE APP',
    title: 'Every game\nstarts here.',
    body: 'See what’s next, who’s in, and where your community is playing.',
    accent: 'COMMUNITY HOME',
    theme: 'dark',
  },
  {
    file: '04-game-details.png',
    output: '02-game-day-ready.png',
    kicker: 'GAME DAY, ORGANIZED',
    title: 'Know\nevery detail.',
    body: 'Weather, venue, rules, capacity, attendance, and the full roster in one place.',
    accent: 'GAME DETAILS',
    theme: 'cream',
  },
  {
    file: '02-record.png',
    output: '03-keep-the-score.png',
    kicker: 'AFTER THE FINAL WHISTLE',
    title: 'Keep\nthe score.',
    body: 'Record results, vote for MVP, and build a history worth coming back to.',
    accent: 'RECORD',
    theme: 'orange',
  },
  {
    file: '03-leaderboard.png',
    output: '04-make-your-mark.png',
    kicker: 'YOUR COMMUNITY, YOUR RECORD',
    title: 'Make\nyour mark.',
    body: 'Follow form, rankings, records, trophies, and the players you know.',
    accent: 'LEADERBOARD',
    theme: 'green',
  },
  {
    file: '06-post-draft-analysis.png',
    output: '05-keep-the-story-going.png',
    kicker: 'THE STORY KEEPS GOING',
    title: 'Read the game\nafter the game.',
    body: 'AI-powered analysis turns every matchup into a story—with the numbers to back it up.',
    accent: 'POST-DRAFT ANALYSIS',
    theme: 'blue',
  },
];

const themes = {
  dark: {background: '#171717', foreground: '#f7f0de', muted: '#c8c0ad', accent: '#c66743'},
  cream: {background: '#f7f0de', foreground: '#241b17', muted: '#756b60', accent: '#aa4933'},
  orange: {background: '#c66743', foreground: '#f7f0de', muted: '#f8d4bc', accent: '#241b17'},
  green: {background: '#9caf87', foreground: '#241b17', muted: '#3f513c', accent: '#f7f0de'},
  blue: {background: '#4768ae', foreground: '#f7f0de', muted: '#d9e0f5', accent: '#d57b4c'},
};

function esc(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

const browser = await chromium.launch({headless: true});
for (const item of screens) {
  const image = (await fs.readFile(path.join(sourceDir, item.file))).toString('base64');
  const t = themes[item.theme];
  const title = esc(item.title).replaceAll('\n', '<br>');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}html,body{margin:0;width:1242px;height:2688px;overflow:hidden}
    body{background:${t.background};color:${t.foreground};font-family:Arial,Helvetica,sans-serif}
    .page{position:relative;width:1242px;height:2688px;padding:134px 104px 110px;overflow:hidden}
    .orbit{position:absolute;border:2px solid ${t.foreground};opacity:.12;border-radius:50%;pointer-events:none}
    .orbit.one{width:900px;height:900px;right:-420px;top:-380px}.orbit.two{width:700px;height:700px;left:-440px;bottom:-300px}
    .kicker{position:relative;font-size:22px;line-height:1.2;font-weight:700;letter-spacing:5px;color:${t.accent}}
    h1{position:relative;margin:48px 0 30px;font-size:112px;line-height:.88;letter-spacing:-5px;text-transform:uppercase;font-weight:800}
    .body{position:relative;max-width:770px;margin:0;font-size:31px;line-height:1.28;font-weight:600;color:${t.muted}}
    .accent{position:absolute;right:104px;top:152px;padding:15px 19px;border:2px solid ${t.foreground};border-radius:999px;font-size:16px;font-weight:700;letter-spacing:3px;color:${t.foreground}}
    .device{position:absolute;left:252px;top:960px;width:738px;padding:18px;border:3px solid ${t.foreground};border-radius:52px;background:#111;box-shadow:28px 32px 0 rgba(0,0,0,.18);transform:rotate(-3deg)}
    .device img{display:block;width:100%;height:auto;border-radius:37px}
    .bottom{position:absolute;left:104px;right:104px;bottom:110px;display:flex;align-items:end;justify-content:space-between;border-top:2px solid ${t.foreground};padding-top:25px}
    .brand{font-size:18px;font-weight:700;letter-spacing:4px}.count{font-size:18px;font-weight:700;letter-spacing:3px;color:${t.accent}}
  </style></head><body><main class="page"><div class="orbit one"></div><div class="orbit two"></div><div class="kicker">${esc(item.kicker)}</div><div class="accent">${esc(item.accent)}</div><h1>${title}</h1><p class="body">${esc(item.body)}</p><div class="device"><img src="data:image/png;base64,${image}" /></div><div class="bottom"><div class="brand">POR EL DEPORTE</div><div class="count">${String(screens.indexOf(item) + 1).padStart(2, '0')} / 05</div></div></main></body></html>`;
  const page = await browser.newPage({viewport: {width: 1242, height: 2688}, deviceScaleFactor: 1});
  await page.setContent(html);
  await page.screenshot({path: path.join(outputDir, item.output), fullPage: true, type: 'png'});
  await page.close();
}
await browser.close();
