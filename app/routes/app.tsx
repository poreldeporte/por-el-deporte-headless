import {useEffect, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import type {Route} from './+types/app';
import {seoMeta, siteOrigin} from '~/lib/seo';
import appLandingStyles from '~/styles/app-landing.css?url';

const APP_STORE_URL =
  'https://apps.apple.com/us/app/por-el-deporte/id6756241207';
const WEB_APP_URL = 'https://app.poreldeporte.com';

type ContactResult = {ok: boolean; message: string};

/**
 * S6's phone screens. FIVE screens for SIX steps, on purpose: "Midweek" and
 * "Two hours out" are the same screen in real life, so both steps resolve to
 * index 1. That means `active` never changes between them, so the phone is
 * genuinely still rather than crossfading an image against itself — two layers
 * of the same PNG composite to a visible wash toward the screen's own ground at
 * the fade midpoint, and the scale(1.025) offset double-images the text through
 * it. The caption under the phone is what changes instead.
 */
type PhoneScreen = {
  id: string;
  imageSrc: string;
  imageAlt: string;
};

const WEEK_SCREENS: PhoneScreen[] = [
  {
    id: 'home',
    imageSrc: '/app-screens/01-home.png',
    imageAlt:
      'The Por El Deporte home screen: Saturday 9:15AM at Brickell Soccer & Padel, 12 of 12 rostered, a waitlist button, and this week’s slate below it.',
  },
  {
    id: 'game',
    imageSrc: '/app-screens/04-game-details.png',
    imageAlt:
      'A game screen: kickoff time, weather, and the full RSVP list of twelve players with their ratings and records.',
  },
  {
    id: 'draft',
    imageSrc: '/app-screens/05-draft-room.png',
    imageAlt:
      'The draft room: two team pitches filling up, a captain on the clock, and the remaining players waiting to be picked.',
  },
  {
    id: 'record',
    imageSrc: '/app-screens/02-record.png',
    imageAlt:
      'The record screen: the latest result at the top and a dated history of games below it.',
  },
  {
    id: 'table',
    imageSrc: '/app-screens/03-leaderboard.png',
    imageAlt:
      'The table screen: the month’s top three on a podium and the full ranked list of players underneath.',
  },
];

type WeekStep = {
  id: string;
  /** The time. This is the step's heading — it is what makes it a week. */
  when: string;
  what: string;
  /** Index into WEEK_SCREENS. 'drop' and 'confirm' deliberately share one. */
  screen: number;
  /**
   * Present = this moment needs a person. The string is the detail, and it is
   * deliberately specific. The spec offers a generic "needs a human" marker but
   * leaves the wording open; "One person, 30 seconds" is the whole persuasive
   * point of the section and a generic marker throws it away.
   */
  human?: string;
};

const WEEK_STEPS: WeekStep[] = [
  {
    id: 'opens',
    when: 'Sunday, 3:00 PM',
    what: 'The list opens. Everyone finds out at the same second. Twelve claim a spot, the rest queue in order.',
    screen: 0,
  },
  {
    id: 'drop',
    when: 'Midweek',
    what: 'Someone drops. The next player is in and notified. You read about it; you don’t fix it.',
    screen: 1,
  },
  {
    id: 'confirm',
    when: 'Two hours out',
    what: 'Everyone confirms. Anyone who hasn’t is visible — to you, and to them.',
    screen: 1,
  },
  {
    id: 'draft',
    when: 'Before kickoff',
    what: 'Captains draft the teams live. Everyone watches it happen.',
    screen: 2,
    human: 'Two captains',
  },
  {
    id: 'fulltime',
    when: 'Full time',
    what: 'Someone puts the score in. The squad votes MVP.',
    screen: 3,
    human: 'One person, 30 seconds',
  },
  {
    id: 'evening',
    when: 'That evening',
    what: 'The match report lands, the ratings move, and the argument restarts in the chat where it belongs.',
    screen: 4,
  },
];

/** S3's two columns. Four entries against five, and the difference is left
    plain: the ruled field runs five rules deep and the chat column simply fills
    four of them. Blank ruled paper reads as room left over, not as a deficit. */
const TRADE_STAYS = [
  'The banter',
  'The photos',
  'The post-match argument',
  'Everyone you already have',
];

/*
 * ACCURACY GUARD — read before editing this list or its CSS.
 *
 * "What it cost, split" is the page's most fragile line: the app shows who has
 * paid and who has not, and never touches money (S4 and S8 both say so
 * outright). This column must therefore stay plain text and geometry. Do NOT
 * add, here or in .pel-app-trade__list--moves: a currency glyph, a numeral, a
 * total, a progress or amount meter, a badge, a chip, a button, a link, or any
 * affordance that looks tappable. Any of those turns a list of responsibilities
 * into a transaction UI, and the claim stops being true.
 */
const TRADE_MOVES = [
  'Twelve spots and the waitlist',
  'Who’s actually coming',
  'The teams',
  'What it cost, split',
  'The score, and what it meant',
];

/** S4 and S8 are a matched pair: same list treatment, same motion. */
type LeadItem = {lead: string; rest: string};

const STOPS_ITEMS: LeadItem[] = [
  {
    lead: 'Counting heads.',
    rest: 'The list opens at the same time every week and fills itself. When someone drops, the next player is in and told before you’ve even read the message.',
  },
  {
    lead: 'Being the bad guy.',
    rest: 'Captains draft live, in turn, with the pick order drawn at random if you want it. The teams happen to everyone at once, in front of everyone. There’s no lineup with your name on it.',
  },
  {
    lead: 'Chasing $12.',
    rest: 'Put in what the pitch cost and everyone sees their share. Afterwards you get a paid and unpaid list. You still collect it however you do now — the app never touches the money.',
  },
  {
    lead: 'Keeping score of people.',
    rest: 'Who confirmed, who dropped late, who didn’t turn up. Recorded against them, so it isn’t carried around by you.',
  },
];

export const meta: Route.MetaFunction = ({location, matches}) => {
  const origin = siteOrigin(matches);
  const url = `${origin}${location.pathname}`;
  return [
    ...seoMeta({
      // The old pair sold the opposite page: "Schedule games, fill rosters,
      // manage waitlists, track scores, follow player stats" is, almost word for
      // word, the five jobs this page now promises to take AWAY from the reader.
      // A searcher seeing that snippet was being offered more work.
      title: 'Por El Deporte App | Stop Running Your Game by Group Chat',
      description:
        'You didn’t volunteer to be a switchboard. Move one recurring game over and the roster, waitlist and teams run themselves. Free on iPhone and the web.',
      url,
      image: origin ? `${origin}/icon-512.png` : undefined,
    }),
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Por El Deporte',
        applicationCategory: 'SportsApplication',
        operatingSystem: 'iOS, Web',
        // Every clause maps to a copy block on the page, and the last sentence
        // restates S8's payments limit inside the markup, so the limitation
        // travels with the graph instead of living only in prose a scraper may
        // drop. Deliberately no `featureList`: it is where a future editor would
        // paste S3's column 2, and "What it cost, split" lifted out of its
        // surrounding qualifiers is a bald payments claim.
        description:
          'An app for the person who organises a recurring game: it opens the list, fills spots from a waitlist, drafts the teams, records the score, and keeps a paid and unpaid list. It tracks paid and unpaid only and never handles money.',
        url,
        installUrl: APP_STORE_URL,
        image: origin ? `${origin}/icon-512.png` : undefined,
        offers: {'@type': 'Offer', price: '0', priceCurrency: 'USD'},
        publisher: {
          '@type': 'Organization',
          name: 'Por El Deporte',
          url: origin || undefined,
        },
      },
    },
  ];
};

export const links: Route.LinksFunction = () => [
  {rel: 'stylesheet', href: appLandingStyles},
];

export default function AppLandingPage() {
  return (
    <div className="pel-app-page">
      <AppHero />
      <TheThursday />
      <TheTrade />
      <WhatStopsBeingYours />
      <TheReversal />
      <TheWeek />
      <OneGame />
      <TheClose />
    </div>
  );
}

/* ── S1 · Hero ───────────────────────────────────────────────────────────────
   No reveal markup anywhere in here, on purpose. useScrollMotion's above-the-
   fold guard makes reveals a no-op on tall viewports and a half-animated hero
   on short ones, and the H1 is the LCP element. The only CSS transforms left
   in this section are .pel-app-cta:hover and the sheet's tick marks
   (rotate -45deg), so if drift is ever wanted, [data-scroll-parallax] belongs
   on .pel-app-hero__sheet and on nothing else in here. */
function AppHero() {
  return (
    <section className="pel-app-hero" aria-labelledby="app-hero-title">
      <div className="pel-app-hero__inner">
        <div className="pel-app-hero__copy">
          {/* HARD BREAKS, MEASURED. Do not remove them.
              Flapjack 650 at -0.025em, width per 100px of font-size:
                "You didn't volunteer"  8.698x  ┐ 0.76% apart — the only
                "to be a switchboard."  8.632x  ┘ balanced pair in the sentence
                "volunteer to be a"     7.494x  <- the phone's binding line
                "switchboard."          5.329x  <- widest unbreakable token
              Left to wrap, this H1 takes FIVE shapes across the range, and not
              monotonically: 2 lines at 375/390/768/1100/1280, 3 lines at
              900/992/1024/1440/1600/1920. The 1440 rag is 302.5 / 539.6 /
              383.7 — line 1 at 56% of line 2 — and it flips back to 2 lines at
              1100 and 1280 before flipping again. That is the LCP element
              reflowing as the window widens.
              --lg is the balanced pair, live from 43.5em up. --sm is the
              three-line poster stack below it: the shorter binding line is
              what lets a 375px phone set 41.25px instead of 38.5px.
              The {' '} are load-bearing. JSX strips per-line leading
              whitespace, so they are the space that rejoins the halves when
              the <br> next to them is display:none. */}
          <h1 id="app-hero-title" className="pel-app-hero__title">
            You didn’t
            <br className="pel-app-hero__brk--sm" /> volunteer
            <br className="pel-app-hero__brk--lg" /> to be a
            <br className="pel-app-hero__brk--sm" /> <span>switchboard.</span>
          </h1>
          <p className="pel-app-hero__body">
            Por El Deporte takes the roster, the teams, the waitlist and the tab
            off your plate — and leaves your group chat exactly where it is.
            Free, on iPhone and the web.
          </p>
          <div className="pel-app-actions">
            {/* One CTA. It carries the Apple mark and a destination sublabel so
                that a label about moving your game reads unmistakably as a
                download rather than an in-page jump. */}
            <a
              className="pel-app-cta"
              href={APP_STORE_URL}
              target="_blank"
              rel="noreferrer"
            >
              <AppleIcon />
              <span>
                Move your Sunday game over
                <small>On the App Store</small>
              </span>
            </a>
          </div>
          {/* The spec pointed this link at the App Store and the button at the
              form. With the button now going to the App Store, that would be two
              links to one place and no route from the hero to the form, so this
              takes the form instead. */}
          <a className="pel-app-hero__aside" href="#close">
            Want us to set it up with you?
            <ArrowRight />
          </a>
        </div>

        {/* THE TEAM SHEET — the upcoming-game widget, recomposed.
            Still live DOM rather than a screenshot, and still aria-hidden as a
            whole: this is an illustration of the app, not the reader's own
            next game, and announcing "Sat 9:15AM, 12 of 12 rostered" as if it
            were their fixture is worse than silence. Every string in here
            already existed on the old card.

            ACCURACY GUARD. Twelve ticked slots and three queued boxes are the
            only state here, and a tick means CLAIMED, never PAID. Do NOT add
            to this sheet: a currency glyph, an amount, a total, a progress or
            amount meter, a badge, a chip, a button, a link, or anything that
            looks tappable — the old card's "On waitlist →" arrow sat on an
            aria-hidden element and implied a tap that did not exist, and is
            deliberately gone. The app tracks paid/unpaid and never touches
            money. Read the S4/S8 accuracy guard before editing this; the sheet
            is now the second place on the page where that claim can be broken. */}
        <div className="pel-app-hero__sheet" aria-hidden="true">
          <p className="pel-app-sheet__eyebrow">
            Up next
            <b>Sat 9:15AM</b>
          </p>
          {/* No date. It was hardcoded to a day that has since passed, and any
              hardcoded date here goes stale again. */}
          <p className="pel-app-sheet__venue">Brickell Soccer &amp; Padel</p>
          <p className="pel-app-sheet__count">
            <b>12/12</b> rostered
          </p>
          {/* Twelve slots, two columns of six, row-major — so slot 12 lands at
              the foot of column 2, directly above box 13 in the well below it.
              That vertical alignment is what lets the hook be a straight
              hairline instead of an elbow. */}
          <ol className="pel-app-sheet__roster">
            {[
              '01',
              '02',
              '03',
              '04',
              '05',
              '06',
              '07',
              '08',
              '09',
              '10',
              '11',
              '12',
            ].map((n) => (
              <li key={n} className={n === '12' ? 'is-promoted' : undefined}>
                <span>{n}</span>
              </li>
            ))}
          </ol>
          <div className="pel-app-sheet__queue">
            <p className="pel-app-sheet__queue-head">On waitlist</p>
            <ol>
              <li>13</li>
              <li>14</li>
              <li>15</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── S2 · The Thursday ───────────────────────────────────────────────────────
   Type and space only, as the spec asks — but with structure. The day word is
   pulled out of each sentence into its own column, which is what gives the
   five rows a shared left edge; left in place it is just the first word of a
   paragraph and does no structural work. A <dl> because that is exactly what
   this is: five terms and what each one costs you.

   Reading order and textContent are unchanged — "Sunday you post the game.
   Six say..." — so the copy is still the spec's, word for word. */
function TheThursday() {
  const week: Array<[string, string]> = [
    [
      'Sunday',
      'you post the game. Six say \u201Cin\u201D. Two send a thumbs-up you have to interpret. One says \u201Cmaybe\u201D.',
    ],
    ['Thursday', 'you count heads, come up two short, and start the DMs.'],
    [
      'Friday',
      'someone drops, and you scroll back three hundred messages to find who asked to be next.',
    ],
    ['Saturday', 'you write the teams yourself. Sunday you hear about it.'],
    ['Sunday night', 'you remind the same three people about the pitch money.'],
  ];

  return (
    <section
      className="pel-app-sec pel-app-thursday"
      aria-labelledby="app-thursday-title"
    >
      <div className="pel-app-thursday__inner pel-app-split">
        {/* One sentence per line. Set as one run it hyphen-broke "Forty-one"
            across two lines and stranded "you." on a third; the {' '} keeps a
            real space between the blocks so selecting and copying the heading
            still yields the sentence. */}
        <h2 id="app-thursday-title" className="pel-app-h2" data-reveal>
          <span>Twelve spots.</span> <span>Forty-one messages.</span>{' '}
          <span>One of you.</span>
        </h2>

        <div className="pel-app-thursday__body">
          <dl className="pel-app-thursday__week" data-reveal>
            {week.map(([day, rest]) => (
              <div className="pel-app-thursday__row" key={day}>
                <dt>{day}</dt>
                <dd>{rest}</dd>
              </div>
            ))}
          </dl>

          <p className="pel-app-thursday__close" data-reveal>
            <span>And nobody thanks you,</span>
            <span>because nobody saw any of it.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── S3 · The trade ─────────────────────────────────────────────────────────
   The page's key visual, and ONE object rather than two: a ruled team sheet
   with a single fold down the middle. A pitch split at the halfway line was the
   obvious candidate and is the wrong one — a pitch divided at halfway IS two
   teams facing each other, which is the versus framing this copy denies. A fold
   is reversible and destroys nothing. */
function TheTrade() {
  return (
    <section
      className="pel-app-sec pel-app-trade"
      aria-labelledby="app-trade-title"
    >
      <div className="pel-app-trade__head pel-app-split">
        <h2 id="app-trade-title" className="pel-app-h2" data-reveal>
          {/* One sentence per line, whatever the display face's metrics do. It
              also teaches the sheet's two-part division before the reader
              reaches it. Still one <h2>. */}
          <span>The chat keeps the jokes.</span>{' '}
          <span>The app takes the job.</span>
        </h2>
        <p className="pel-app-lead" data-reveal>
          We’re not asking you to move your community. We’re asking you to move
          the admin out of it. Leave the chat where it is — the slagging, the
          photos, the argument about whether that was offside. Take the twelve
          spots, the waitlist, the teams and the tab somewhere they look after
          themselves.
        </p>
      </div>
      <TradeColumns />
    </section>
  );
}

/**
 * The sheet. One frame, one continuous ruled field, one fold.
 *
 * The load-bearing device is `__paper`: a single full-width element carrying
 * the feint rules, so they run straight ACROSS the fold. Rules that cross the
 * divider make this read as one sheet with a notation on it rather than two
 * lists that happen to be adjacent. Neither column ever gets a border, a tint
 * or a keyline of its own — the accent lives on the seam and on the band rule.
 *
 * Column 2 holds plain text and geometry only: no pill, no arrow, no currency
 * mark, nothing tappable. That is what keeps "What it cost, split" from
 * reading as a transaction, which the page must never imply.
 */
function TradeColumns() {
  return (
    <div className="pel-app-trade__sheet">
      <div className="pel-app-trade__grid">
        {/* DOM order is heading → its list → heading → its list, so the reading
            order is right in both layouts. The decorative spans are placed by
            grid-area, so their DOM position is free.

            Headings are sentence case here and uppercased in CSS: the render is
            the spec's literal STAYS IN YOUR CHAT / MOVES TO THE APP, while a
            screen reader gets real words rather than risking letter-by-letter
            spelling of all-caps text. <h3> is honest — these are S3's two real
            subheads, whatever size they render at. */}
        <h3
          id="trade-stays"
          className="pel-app-trade__colhead pel-app-trade__colhead--stays"
        >
          Stays in your chat
        </h3>
        <ul
          className="pel-app-trade__list pel-app-trade__list--stays"
          role="list"
          aria-labelledby="trade-stays"
          data-reveal-stagger
        >
          {TRADE_STAYS.map((item) => (
            // No dx and no dy: the column that stays does not move. The spec
            // says column 2 carries the accent, so the asymmetry is the point
            // — and stillness reads as permanence, not as being diminished.
            <li key={item} data-reveal-item data-scale="1">
              {item}
            </li>
          ))}
        </ul>

        <h3
          id="trade-moves"
          className="pel-app-trade__colhead pel-app-trade__colhead--moves"
        >
          Moves to the app
        </h3>
        <ul
          className="pel-app-trade__list pel-app-trade__list--moves"
          role="list"
          aria-labelledby="trade-moves"
          data-reveal-stagger
        >
          {TRADE_MOVES.map((item) => (
            // Starts at the fold and settles outward: these are the entries
            // being filed across.
            <li key={item} data-reveal-item data-scale="1" data-dx="-14">
              {item}
            </li>
          ))}
        </ul>

        {/* One continuous band rule that changes colour at the fold — ink over
            the chat's half, brick over the app's. It says "two duties, one of
            them is the app's" without dimming, shrinking or shadowing
            anything. */}
        <span className="pel-app-trade__band" aria-hidden="true" />
        <span className="pel-app-trade__band-app" aria-hidden="true" />
        <span className="pel-app-trade__paper" aria-hidden="true" />
        <span className="pel-app-trade__seam" aria-hidden="true">
          <i className="pel-app-trade__fold">
            {/* The one mark both halves share. */}
            <i className="pel-app-trade__hinge" />
          </i>
          <i className="pel-app-trade__tab" />
        </span>
      </div>
    </div>
  );
}

/* ── S4 · What stops being yours ─────────────────────────────────────────────
   A list, not cards. One reveal per item so each fires at its own crossing;
   four identical rises read as a list, four different entrances read as cards.
   Not a stagger container — four items with a two-sentence body each exceed a
   viewport, so one crossing would fire all four and leave 3 and 4 blank. */
function WhatStopsBeingYours() {
  return (
    <section
      className="pel-app-sec pel-app-stops"
      aria-labelledby="app-stops-title"
    >
      <div className="pel-app-sec__inner pel-app-split">
        <h2 id="app-stops-title" className="pel-app-h2" data-reveal>
          Four things you stop doing on Thursday
        </h2>
        <LeadList items={STOPS_ITEMS} />
      </div>
    </section>
  );
}

/* ── S5 · The reversal ──────────────────────────────────────────────────────*/
function TheReversal() {
  const bullets = [
    'A rating that moves every week — and stays blank until they’ve played enough for it to be fair',
    'The draft. Being picked. Being picked first',
    'A written match report that names them, and a read on the matchup before kickoff',
    'Calling the winner, and a record of how often they’re right',
    'Leaderboards, form, MVP votes, trophies, and a history that goes back',
  ];

  return (
    <section
      className="pel-app-sec pel-app-reversal"
      aria-labelledby="app-reversal-title"
    >
      <div className="pel-app-reversal__inner">
        <div className="pel-app-reversal__copy">
          <h2 id="app-reversal-title" className="pel-app-h2" data-reveal>
            Then the strange part: they start chasing you.
          </h2>
          <p className="pel-app-lead" data-reveal>
            A game with no memory is just exercise. Give it a record and people
            start moving things around to be there.
          </p>
          {/* Short one-liners, so they read as one block rather than five
              separate ideas the way S4's items do. No terminal full stops —
              that is how the spec sets them, and it is consistent across all
              five. */}
          <ul className="pel-app-reversal__list" role="list" data-reveal>
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <p className="pel-app-reversal__close" data-reveal>
            This is the half you don’t have to do. The game gets good enough to
            sell itself.
          </p>
        </div>
        {/* The page's ONE drifter. Every other section rises; pictures drift.
            The wrapper is transform-free so the hook owns its transform. */}
        <div
          className="pel-app-reversal__shot"
          data-scroll-parallax
          data-speed="14"
        >
          <img
            src="/app-screens/06-post-draft-analysis.png"
            alt="A pre-match read inside the app: a projected score, a win probability split, team grades, and a written paragraph naming both captains and the players who decided the draft."
            width="471"
            height="1020"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

/* ── S6 · The week ───────────────────────────────────────────────────────────
   The scroll-driven phone, rehoused. The section wears BOTH classes:
   `pel-app-tour` is what inherits the sand ground, the top hairline, the
   section padding and every tuned sticky/phone dimension at 68em / 54em / 48em
   / 25em; `pel-week` is the new layer on top. */
function TheWeek() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  // Verbatim from the previous AppTour: marker at 53% of the viewport, nearest
  // step centre wins, rAF-coalesced, passive scroll + resize, one synchronous
  // read on mount so a deep link or a restored scroll position lands correct.
  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      const marker = window.innerHeight * 0.53;
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      stepRefs.current.forEach((step, index) => {
        if (!step) return;
        const rect = step.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - marker);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }
      });

      setActive((current) => (current === nearest ? current : nearest));
    };

    const scheduleRead = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', scheduleRead, {passive: true});
    window.addEventListener('resize', scheduleRead);

    return () => {
      window.removeEventListener('scroll', scheduleRead);
      window.removeEventListener('resize', scheduleRead);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const goToStep = (index: number) => {
    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    stepRefs.current[index]?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    });
  };

  const current = WEEK_STEPS[active];

  return (
    <section
      id="the-week"
      className="pel-app-tour pel-week"
      aria-labelledby="app-week-title"
    >
      {/* /app#inside-the-app is live today. Nothing in the repo points at it
          any more — only the deleted hero button did — but a campaign URL might. */}
      <span
        id="inside-the-app"
        className="pel-week__legacy-anchor"
        aria-hidden="true"
      />

      <div className="pel-app-tour__head">
        <h2 id="app-week-title" className="pel-app-h2" data-reveal>
          You set one time. The week does the rest.
        </h2>
        {/* Teaches the notation AND states the tally, in one line. The key marks
            are the same two shapes as the step nodes and the meter. */}
        <p className="pel-week__legend" data-reveal>
          <span className="pel-week__key">
            <i className="pel-week__key-mark" aria-hidden="true" />
            Four run themselves
          </span>
          <span className="pel-week__key">
            <i
              className="pel-week__key-mark pel-week__key-mark--human"
              aria-hidden="true"
            />
            Two need a human
          </span>
        </p>
      </div>

      {/* The stage stays FIRST in the DOM. At 54em the grid becomes
          display:block, grid-column goes inert, and mobile keeps the proven
          order: sticky phone, cards scrolling underneath it. */}
      <div className="pel-app-tour__grid pel-week__grid">
        <div className="pel-app-tour__stage">
          <Phone screens={WEEK_SCREENS} active={current.screen} />

          <div
            className="pel-week__meter"
            role="group"
            aria-label="Jump to a moment in the week"
          >
            {WEEK_STEPS.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={[
                  'pel-week__meter-cell',
                  step.human ? 'is-human' : '',
                  index === active ? 'is-active' : '',
                  index < active ? 'is-past' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={`Jump to ${step.when}`}
                aria-current={index === active ? 'step' : undefined}
                onClick={() => goToStep(index)}
              />
            ))}
          </div>
        </div>

        {/* role="list" because list-style:none strips list semantics in
            Safari/VoiceOver. */}
        <ol className="pel-app-tour__steps pel-week__steps" role="list">
          {WEEK_STEPS.map((step, index) => (
            <li
              key={step.id}
              ref={(node) => {
                // The body, not the <li>: the row's padding-bottom is the
                // scroll runway, and including it puts the row's centre in
                // empty space well below the sentence the reader is on.
                stepRefs.current[index] =
                  node?.querySelector('.pel-week-step__body') ?? null;
              }}
              className={[
                'pel-week-step',
                step.human ? 'pel-week-step--human' : '',
                index === active ? 'is-active' : '',
                index < active ? 'is-past' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-step={step.id}
            >
              <span className="pel-week-step__node" aria-hidden="true" />
              {/* NO data-reveal here: this element is what stepRefs measures
                  now, and the hook writes an inline translateY(28px) on its
                  targets, which would feed a wrong rect.top straight into the
                  nearest-centre tracker. The steps carry their own
                  scroll-driven motion anyway — colour, node fill and the
                  orange rule wiping across the row. Nothing on the sticky
                  stage or its ancestors carries reveal or parallax markup
                  either: an inline transform on an ancestor makes it a
                  containing block and drags the sticky phone. */}
              <div className="pel-week-step__body">
                <h3 className="pel-week-step__when">{step.when}</h3>
                <p className="pel-week-step__what">{step.what}</p>
                {step.human ? (
                  <p className="pel-week-step__flag">
                    <span className="pel-week-step__flag-label">
                      Needs a human
                    </span>
                    <span className="pel-week-step__flag-detail">
                      {step.human}
                    </span>
                  </p>
                ) : (
                  /* The four-against-two contrast, for screen readers. Sighted
                     readers get it from shape and margin; without this line AT
                     users hear two marked steps and four silent ones and have
                     to infer the pattern. */
                  <p className="sr-only">Needs nothing from you.</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Phone({screens, active}: {screens: PhoneScreen[]; active: number}) {
  return (
    <figure className="pel-app-phone">
      <span
        className="pel-app-phone__button pel-app-phone__button--mute"
        aria-hidden="true"
      />
      <span
        className="pel-app-phone__button pel-app-phone__button--up"
        aria-hidden="true"
      />
      <span
        className="pel-app-phone__button pel-app-phone__button--down"
        aria-hidden="true"
      />
      <span
        className="pel-app-phone__button pel-app-phone__button--power"
        aria-hidden="true"
      />
      <div className="pel-app-phone__bezel">
        <div className="pel-app-phone__island" aria-hidden="true" />
        <div className="pel-app-phone__screen">
          {screens.map((screen, index) => (
            <div
              key={screen.id}
              className={`pel-app-phone__layer${index === active ? ' is-active' : ''}`}
              aria-hidden={index !== active}
            >
              <img
                src={screen.imageSrc}
                alt={screen.imageAlt}
                width="471"
                height="1020"
                loading={index === 0 ? undefined : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>
      {/* No figcaption: it duplicated the active layer's alt text word for
          word, so each screen was announced twice. The per-layer alt carries
          it, and inactive layers are aria-hidden. */}
    </figure>
  );
}

/* ── S7 · One game ──────────────────────────────────────────────────────────*/
function OneGame() {
  return (
    <section
      className="pel-app-sec pel-app-onegame"
      aria-labelledby="app-onegame-title"
    >
      <div className="pel-app-onegame__inner pel-app-split">
        <h2 id="app-onegame-title" className="pel-app-h2" data-reveal>
          One game. That’s the whole commitment.
        </h2>
        <div className="pel-app-onegame__body">
          <p className="pel-app-lead" data-reveal>
            Don’t migrate anybody. Don’t announce anything. Run one game on the
            app and post the link in the chat you already have. People claim
            their own spot — you’re not adding anyone, and you’re not chasing
            anyone to sign up.
          </p>
          <p className="pel-app-onegame__close" data-reveal>
            If Thursday still comes with DMs, you’ve lost one week and nothing
            else.
          </p>
          {/* Set apart and quieter, and arriving a beat after the line above it. */}
          <p className="pel-app-onegame__pricing" data-reveal>
            <b>And it’s free.</b> Free for your community, free for your
            players, not a trial. The kit and the merch pay for pitch time,
            balls and the next match. The games have always been free to turn up
            to, and we’d like to keep it that way.
          </p>
          {/* Relocated from the deleted "Four things it won't do". It is the
              page's only statement of platform, and the web app's only link. */}
          <p className="pel-app-onegame__platform" data-reveal>
            iPhone and{' '}
            <a href={WEB_APP_URL} target="_blank" rel="noreferrer">
              web
            </a>{' '}
            today.
          </p>
        </div>
      </div>
    </section>
  );
}

/** The shared lead-in list primitive. */
function LeadList({items}: {items: LeadItem[]}) {
  return (
    <ul className="pel-app-leadlist" role="list">
      {items.map((item) => (
        <li key={item.lead} data-reveal>
          <b>{item.lead}</b> {item.rest}
        </li>
      ))}
    </ul>
  );
}

/* ── S9 · Close ─────────────────────────────────────────────────────────────*/
function TheClose() {
  const fetcher = useFetcher<ContactResult>();
  const formRef = useRef<HTMLFormElement>(null);
  const sending = fetcher.state !== 'idle';
  const result = fetcher.data;

  useEffect(() => {
    if (result?.ok) formRef.current?.reset();
  }, [result]);

  return (
    <section
      id="close"
      className="pel-app-sec pel-app-close"
      aria-labelledby="app-close-title"
    >
      <div className="pel-app-close__inner">
        <div className="pel-app-close__copy">
          <h2 id="app-close-title" className="pel-app-h2" data-reveal>
            Give us your Sunday game. We’ll give you your Thursday back.
          </h2>
          <p className="pel-app-lead" data-reveal>
            Tell us about your community and we’ll set it up with you. A real
            person writes back.
          </p>

          {/* The proof closes the copy column: a ruled stamp under the
              subhead, where the eye lands before crossing to the form. It used
              to sit in a track of its own beside the form, filling the top
              142px of a 770px slot — 600px of bare cream next to the page's
              conversion point. */}
          <div className="pel-app-close__proof" data-reveal>
            <p>
              Running the same game since <b>2014</b>.
            </p>
          </div>
        </div>

        {/* No reveal markup on the form or its fields: controls at opacity 0
            are focusable, and this is the target of the hero anchor — a #close
            jump should not hand the reader a 900ms fade on the thing they
            asked to be taken to. */}
        <fetcher.Form
          ref={formRef}
          method="post"
          action="/api/contact"
          className="pel-app-form"
          onSubmit={(event) => {
            if (sending) event.preventDefault();
          }}
        >
          <div className="pel-app-form__row">
            <label>
              <span>Name</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                maxLength={80}
                required
                disabled={sending}
                placeholder="YOUR NAME"
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                maxLength={254}
                required
                disabled={sending}
                placeholder="YOU@EXAMPLE.COM"
              />
            </label>
          </div>
          <label>
            <span>Community name</span>
            <input
              type="text"
              name="community"
              autoComplete="organization"
              maxLength={120}
              required
              disabled={sending}
              placeholder="WHO DO YOU PLAY WITH?"
            />
          </label>
          <label>
            <span>How many play, and how often</span>
            <input
              type="text"
              name="cadence"
              maxLength={160}
              required
              disabled={sending}
              placeholder="ABOUT 18 OF US, EVERY SUNDAY"
            />
          </label>
          <div className="pel-app-form__trap" aria-hidden="true">
            <label>
              Website
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>
          <div className="pel-app-form__submit">
            {/* aria-disabled, not disabled: disabling the element that has
                  focus drops focus to <body>, and the success path also resets
                  the form, so the reader lands nowhere with four empty fields.
                  The onSubmit guard above is what prevents a double send. */}
            <button type="submit" aria-disabled={sending}>
              {sending ? 'Sending…' : 'Move your Sunday game over'}
              <ArrowRight />
            </button>
            <p className="pel-app-form__privacy">
              We only use these details to write back.
            </p>
          </div>
          {/* One node, always present, with a fixed role. It collapses to
                zero height when empty rather than unmounting or using
                display:none — either of those takes it out of the
                accessibility tree, and a live region that appears at the same
                moment as its text is not reliably announced. */}
          <p
            className={`pel-app-form__status${
              result ? (result.ok ? ' is-success' : ' is-error') : ' is-idle'
            }`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {result?.message ?? ''}
          </p>
        </fetcher.Form>
      </div>
    </section>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 384 512" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.7-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}
