import {useEffect, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import type {Route} from './+types/app';
import {seoMeta, siteOrigin} from '~/lib/seo';
import appLandingStyles from '~/styles/app-landing.css?url';

const APP_STORE_URL =
  'https://apps.apple.com/us/app/por-el-deporte/id6756241207';
const WEB_APP_URL = 'https://app.poreldeporte.com';

type ContactResult = {ok: boolean; message: string};
type MockScreen = 'home' | 'schedule' | 'roster' | 'results' | 'leaders';
type AppScreen = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  body: string;
  imageSrc: string | null;
  imageAlt: string;
  mock: MockScreen;
};

/**
 * Screenshot handoff point.
 *
 * The supplied product captures live in /public/app-screens. The phone,
 * crossfade, scroll tracking, and responsive crop are all wired to these
 * scroll states.
 */
const APP_SCREENS: AppScreen[] = [
  {
    id: 'home',
    number: '01',
    eyebrow: 'Home',
    title: 'The day starts here.',
    body: 'Open the community hub to see the next game, open spots, roster status, and the fastest way to get involved.',
    imageSrc: '/app-screens/01-home.png',
    imageAlt:
      'Por El Deporte home screen showing upcoming games and roster status',
    mock: 'home',
  },
  {
    id: 'record',
    number: '02',
    eyebrow: 'Record',
    title: 'Every result counts.',
    body: 'Record the score, vote for MVP, and build a searchable match history that makes every week matter.',
    imageSrc: '/app-screens/02-record.png',
    imageAlt: 'Por El Deporte record screen showing match results and history',
    mock: 'results',
  },
  {
    id: 'leaderboard',
    number: '03',
    eyebrow: 'Leaderboard',
    title: 'Make your mark.',
    body: 'Follow form, rankings, records, trophies, and head-to-head history across the players you know.',
    imageSrc: '/app-screens/03-leaderboard.png',
    imageAlt: 'Por El Deporte leaderboard screen showing player rankings',
    mock: 'leaders',
  },
  {
    id: 'game-details',
    number: '04',
    eyebrow: 'Game Details',
    title: 'Nothing gets missed.',
    body: 'Weather, venue, rules, capacity, attendance, and the full roster live on one game screen.',
    imageSrc: '/app-screens/04-game-details.png',
    imageAlt: 'Por El Deporte game details screen with weather and roster',
    mock: 'schedule',
  },
  {
    id: 'draft-room',
    number: '05',
    eyebrow: 'Draft Room',
    title: 'Draft the night.',
    body: 'Pick teams, follow captain decisions, and turn a regular run into a shared community ritual.',
    imageSrc: '/app-screens/05-draft-room.png',
    imageAlt: 'Por El Deporte draft room screen with player picks',
    mock: 'roster',
  },
  {
    id: 'post-draft-analysis',
    number: '06',
    eyebrow: 'Post-Draft Analysis',
    title: 'Keep talking after.',
    body: 'AI-generated analysis turns the draft into a story—with the matchup, the edge, and the numbers to back it up.',
    imageSrc: '/app-screens/06-post-draft-analysis.png',
    imageAlt: 'Por El Deporte post-draft analysis screen comparing teams',
    mock: 'results',
  },
];

export const meta: Route.MetaFunction = ({location, matches}) => {
  const origin = siteOrigin(matches);
  const url = `${origin}${location.pathname}`;
  return [
    ...seoMeta({
      title: 'Por El Deporte App | Organize Your Sports Community',
      description:
        'Schedule games, fill rosters, manage waitlists, track scores, follow player stats, and keep your sports community together.',
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
        description:
          'A community sports app for organizing games, managing rosters, tracking scores, and following player history.',
        url,
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
      <AppDetails />
      <AppTour />
      <DownloadBand />
      <AppContact />
    </div>
  );
}

function AppHero() {
  return (
    <section className="pel-app-hero" aria-labelledby="app-hero-title">
      <div
        className="pel-app-hero__orbit pel-app-hero__orbit--one"
        aria-hidden="true"
      />
      <div
        className="pel-app-hero__orbit pel-app-hero__orbit--two"
        aria-hidden="true"
      />
      <div className="pel-app-hero__inner">
        <div className="pel-app-hero__copy">
          <p className="pel-app-kicker">Por El Deporte &bull; The App</p>
          <h1 id="app-hero-title" className="pel-app-hero__title">
            Community
            <br />
            sports,
            <br />
            <span>organized.</span>
          </h1>
          <p className="pel-app-hero__body">
            Por El Deporte brings every part of your sports community
            together—from the first open spot to the final whistle.
          </p>
          <div className="pel-app-actions">
            <AppStoreButton className="pel-app-store--cream" />
            <a className="pel-app-link-button" href="#inside-the-app">
              See inside
              <ArrowDown />
            </a>
          </div>
          <div className="pel-app-hero__availability">
            <span>Free on iPhone</span>
            <i aria-hidden="true" />
            <a href={WEB_APP_URL} target="_blank" rel="noreferrer">
              Web app available
            </a>
          </div>
        </div>

        <div className="pel-app-hero__visual" aria-hidden="true">
          <div className="pel-app-field">
            <div className="pel-app-field__line pel-app-field__line--half" />
            <div className="pel-app-field__circle" />
            <div className="pel-app-field__box pel-app-field__box--top" />
            <div className="pel-app-field__box pel-app-field__box--bottom" />
          </div>
          <div className="pel-app-icon-card">
            <img src="/icon-512.png" alt="" width="512" height="512" />
          </div>
          <div className="pel-app-game-card">
            <div className="pel-app-game-card__top">
              <span>Up next</span>
              <span>Roster</span>
            </div>
            <div className="pel-app-game-card__main">
              <div className="pel-app-game-card__time">
                <b>Sat</b>
                <strong>9:15AM</strong>
              </div>
              <div className="pel-app-game-card__venue">
                <strong>Brickell Soccer &amp; Padel</strong>
                <p>August 29, 2026</p>
              </div>
            </div>
            <div className="pel-app-game-card__footer">
              <span>
                <b>12/12</b> rostered
              </span>
              <span className="pel-app-game-card__action">
                On waitlist&nbsp; →
              </span>
            </div>
          </div>
          <div className="pel-app-hero__stamp">Built for the way we play</div>
        </div>
      </div>
    </section>
  );
}

function AppDetails() {
  const details = [
    {
      number: '01',
      title: 'Make the game',
      body: 'Discover upcoming games, claim your place, and keep every detail in one community home hub.',
      icon: <CalendarIcon />,
    },
    {
      number: '02',
      title: 'Fill the roster',
      body: 'Manage capacity, attendance, waitlists, teams, and timely notifications without juggling chats.',
      icon: <PlayersIcon />,
    },
    {
      number: '03',
      title: 'Track the story',
      body: 'Record scores, vote for MVPs, compare players, and relive the action with AI-generated recaps.',
      icon: <ChartIcon />,
    },
  ];

  return (
    <section className="pel-app-details" aria-labelledby="app-details-title">
      <div className="pel-app-details__intro">
        <p className="pel-app-kicker">Made for real communities</p>
        <h2 id="app-details-title">Less chasing. More playing.</h2>
        <p>
          Build the squad. Settle it on the pitch. Keep the story going—from
          open spots and attendance to scores, rankings, trophies, and shared
          history.
        </p>
      </div>
      <div className="pel-app-details__grid">
        {details.map((detail) => (
          <article key={detail.number} className="pel-app-detail-card">
            <div className="pel-app-detail-card__head">
              <span>{detail.number}</span>
              <div className="pel-app-detail-card__icon">{detail.icon}</div>
            </div>
            <h3>{detail.title}</h3>
            <p>{detail.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AppTour() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

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

  const goToScreen = (index: number) => {
    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    stepRefs.current[index]?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    });
  };

  return (
    <section
      id="inside-the-app"
      className="pel-app-tour"
      aria-labelledby="app-tour-title"
    >
      <div className="pel-app-tour__head">
        <p className="pel-app-kicker">Inside the app</p>
        <h2 id="app-tour-title">One place for every game.</h2>
        <p>
          From the community home to post-game analysis, every part of the match
          day has a place.
        </p>
      </div>

      <div className="pel-app-tour__grid">
        <div className="pel-app-tour__stage">
          <Phone screens={APP_SCREENS} active={active} />
          <div
            className="pel-app-tour__progress"
            aria-label="Choose an app screen"
          >
            {APP_SCREENS.map((screen, index) => (
              <button
                key={screen.id}
                type="button"
                className={index === active ? 'is-active' : undefined}
                aria-label={`Show ${screen.eyebrow} screen`}
                aria-current={index === active ? 'step' : undefined}
                onClick={() => goToScreen(index)}
              />
            ))}
          </div>
        </div>

        <div className="pel-app-tour__steps">
          {APP_SCREENS.map((screen, index) => (
            <article
              key={screen.id}
              ref={(node) => {
                stepRefs.current[index] = node;
              }}
              className={`pel-app-tour-step${index === active ? ' is-active' : ''}`}
              data-screen={screen.id}
            >
              <div className="pel-app-tour-step__number">{screen.number}</div>
              <div className="pel-app-tour-step__copy">
                <p>{screen.eyebrow}</p>
                <h3>{screen.title}</h3>
                <div>{screen.body}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Phone({screens, active}: {screens: AppScreen[]; active: number}) {
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
              {screen.imageSrc ? (
                <img src={screen.imageSrc} alt={screen.imageAlt} />
              ) : (
                <ScreenMock variant={screen.mock} />
              )}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="sr-only">{screens[active]?.imageAlt}</figcaption>
    </figure>
  );
}

function ScreenMock({variant}: {variant: MockScreen}) {
  const titles: Record<MockScreen, string> = {
    home: 'Good afternoon',
    schedule: 'Schedule',
    roster: 'Tuesday Run',
    results: 'Match recap',
    leaders: 'Leaderboard',
  };

  return (
    <div className={`pel-app-mock pel-app-mock--${variant}`}>
      <div className="pel-app-mock__status">
        <span>9:41</span>
        <div>
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="pel-app-mock__nav">
        <img src="/icon-96.png" alt="" width="96" height="96" />
        <span>PEL</span>
        <i />
      </div>
      <div className="pel-app-mock__body">
        <p className="pel-app-mock__eyebrow">Por El Deporte</p>
        <h4>{titles[variant]}</h4>
        {variant === 'home' ? <MockHome /> : null}
        {variant === 'schedule' ? <MockSchedule /> : null}
        {variant === 'roster' ? <MockRoster /> : null}
        {variant === 'results' ? <MockResults /> : null}
        {variant === 'leaders' ? <MockLeaders /> : null}
      </div>
      <MockTabBar active={variant} />
    </div>
  );
}

function MockHome() {
  return (
    <>
      <div className="pel-app-mock__feature">
        <div className="pel-app-mock__feature-top">
          <span>Next up</span>
          <b>14 / 16</b>
        </div>
        <strong>Tuesday Run</strong>
        <p>Key Biscayne &bull; 7:00 PM</p>
        <div className="pel-app-mock__join">You&apos;re in</div>
      </div>
      <div className="pel-app-mock__section-title">
        <b>This week</b>
        <span>See all</span>
      </div>
      <MockGameRow day="THU" date="28" name="Thursday Lights" count="11 / 16" />
      <MockGameRow day="SUN" date="31" name="Sunday Club" count="8 / 12" />
    </>
  );
}

function MockSchedule() {
  const days = [
    {id: 'mon', label: 'M'},
    {id: 'tue', label: 'T'},
    {id: 'wed', label: 'W'},
    {id: 'thu', label: 'T'},
    {id: 'fri', label: 'F'},
    {id: 'sat', label: 'S'},
    {id: 'sun', label: 'S'},
  ];
  return (
    <>
      <div className="pel-app-mock__calendar">
        <div>
          <b>August</b>
          <span>&lsaquo;&nbsp;&nbsp;&rsaquo;</span>
        </div>
        <ul className="pel-app-mock__week">
          {days.map((day, index) => (
            <li key={day.id} className={index === 1 ? 'is-active' : undefined}>
              <span>{day.label}</span>
              <b>{25 + index}</b>
            </li>
          ))}
        </ul>
      </div>
      <div className="pel-app-mock__section-title">
        <b>Tuesday, Aug 26</b>
        <span>2 games</span>
      </div>
      <MockGameRow day="7:00" date="PM" name="Tuesday Run" count="2 spots" />
      <MockGameRow
        day="8:30"
        date="PM"
        name="Late Night Five"
        count="Waitlist"
      />
      <div className="pel-app-mock__create">+ Create a game</div>
    </>
  );
}

function MockRoster() {
  const players = ['FV', 'AM', 'JL', 'CR', 'LS', 'MP'];
  return (
    <>
      <div className="pel-app-mock__game-meta">
        <div>
          <span>Tue, Aug 26</span>
          <b>7:00 PM</b>
        </div>
        <div>
          <span>Location</span>
          <b>Key Biscayne</b>
        </div>
      </div>
      <div className="pel-app-mock__roster-head">
        <b>Confirmed</b>
        <span>14 / 16</span>
      </div>
      <div className="pel-app-mock__people">
        {players.map((player, index) => (
          <div key={player}>
            <i>{player}</i>
            <span>Player {index + 1}</span>
            <b>In</b>
          </div>
        ))}
      </div>
      <div className="pel-app-mock__waitlist">
        <span>Waitlist</span>
        <b>2 players</b>
      </div>
    </>
  );
}

function MockResults() {
  return (
    <>
      <div className="pel-app-mock__score">
        <span>Full time</span>
        <div>
          <b>Orange</b>
          <strong>6</strong>
          <i>-</i>
          <strong>4</strong>
          <b>Cream</b>
        </div>
        <p>Tuesday Run &bull; August 19</p>
      </div>
      <div className="pel-app-mock__section-title">
        <b>Match notes</b>
        <span>12 players</span>
      </div>
      <div className="pel-app-mock__stat-grid">
        <div>
          <b>10</b>
          <span>Goals</span>
        </div>
        <div>
          <b>4</b>
          <span>Assists</span>
        </div>
        <div>
          <b>2</b>
          <span>Badges</span>
        </div>
      </div>
      <div className="pel-app-mock__result-row">
        <i>W</i>
        <span>
          <b>Sunday Club</b>
          <small>Aug 17</small>
        </span>
        <strong>5 - 3</strong>
      </div>
      <div className="pel-app-mock__result-row">
        <i>D</i>
        <span>
          <b>Thursday Lights</b>
          <small>Aug 14</small>
        </span>
        <strong>4 - 4</strong>
      </div>
    </>
  );
}

function MockLeaders() {
  const leaders = [
    ['1', 'FV', 'Franco V.', '24'],
    ['2', 'AM', 'Alex M.', '21'],
    ['3', 'JL', 'Jamie L.', '18'],
    ['4', 'CR', 'Chris R.', '15'],
    ['5', 'LS', 'Leo S.', '14'],
  ];
  return (
    <>
      <div className="pel-app-mock__leader-tabs">
        <b>Overall</b>
        <span>Goals</span>
        <span>Wins</span>
      </div>
      <div className="pel-app-mock__podium">
        <div>
          <i>AM</i>
          <span>2</span>
        </div>
        <div>
          <i>FV</i>
          <span>1</span>
        </div>
        <div>
          <i>JL</i>
          <span>3</span>
        </div>
      </div>
      <div className="pel-app-mock__leader-list">
        {leaders.map(([place, initials, name, points]) => (
          <div key={place}>
            <strong>{place}</strong>
            <i>{initials}</i>
            <span>{name}</span>
            <b>{points} pts</b>
          </div>
        ))}
      </div>
    </>
  );
}

function MockGameRow({
  day,
  date,
  name,
  count,
}: {
  day: string;
  date: string;
  name: string;
  count: string;
}) {
  return (
    <div className="pel-app-mock__game-row">
      <div>
        <span>{day}</span>
        <b>{date}</b>
      </div>
      <p>
        <b>{name}</b>
        <span>Key Biscayne</span>
      </p>
      <strong>{count}</strong>
    </div>
  );
}

function MockTabBar({active}: {active: MockScreen}) {
  return (
    <div className="pel-app-mock__tabs">
      {(
        ['home', 'schedule', 'roster', 'results', 'leaders'] as MockScreen[]
      ).map((tab) => (
        <i key={tab} className={tab === active ? 'is-active' : undefined} />
      ))}
    </div>
  );
}

function DownloadBand() {
  return (
    <section className="pel-app-download" aria-labelledby="app-download-title">
      <div className="pel-app-download__mark" aria-hidden="true">
        <img
          src="/icon-512.png"
          alt=""
          width="512"
          height="512"
          loading="lazy"
        />
      </div>
      <div className="pel-app-download__copy">
        <p className="pel-app-kicker">Ready when you are</p>
        <h2 id="app-download-title">Build the squad. Keep the story going.</h2>
      </div>
      <AppStoreButton className="pel-app-store--ink" />
    </section>
  );
}

function AppContact() {
  const fetcher = useFetcher<ContactResult>();
  const formRef = useRef<HTMLFormElement>(null);
  const sending = fetcher.state !== 'idle';
  const result = fetcher.data;

  useEffect(() => {
    if (result?.ok) formRef.current?.reset();
  }, [result]);

  return (
    <section className="pel-app-contact" aria-labelledby="app-contact-title">
      <div className="pel-app-contact__inner">
        <div className="pel-app-contact__copy">
          <p className="pel-app-kicker">Get in touch</p>
          <h2 id="app-contact-title">Have a community in mind?</h2>
          <p>
            Questions, partnerships, or want to bring your own group onto the
            app? Send us a note and a real person will write back.
          </p>
          <a href="mailto:contact@poreldeporte.com">contact@poreldeporte.com</a>
        </div>

        <fetcher.Form
          ref={formRef}
          method="post"
          action="/api/contact"
          className="pel-app-contact__form"
        >
          <div className="pel-app-contact__row">
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
            <span>
              Community or organization <small>(optional)</small>
            </span>
            <input
              type="text"
              name="community"
              autoComplete="organization"
              maxLength={120}
              disabled={sending}
              placeholder="WHO DO YOU PLAY WITH?"
            />
          </label>
          <label>
            <span>Message</span>
            <textarea
              name="message"
              rows={6}
              minLength={10}
              maxLength={2000}
              required
              disabled={sending}
              placeholder="TELL US A LITTLE ABOUT IT..."
            />
          </label>
          <div className="pel-app-contact__trap" aria-hidden="true">
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
          <div className="pel-app-contact__submit">
            <button type="submit" disabled={sending}>
              {sending ? 'Sending...' : 'Send message'}
              <ArrowRight />
            </button>
            <p className="pel-app-contact__privacy">
              We only use these details to reply to your message.
            </p>
          </div>
          {result ? (
            <p
              className={`pel-app-contact__status${result.ok ? ' is-success' : ' is-error'}`}
              role={result.ok ? 'status' : 'alert'}
            >
              {result.message}
            </p>
          ) : null}
        </fetcher.Form>
      </div>
    </section>
  );
}

function AppStoreButton({className}: {className: string}) {
  return (
    <a
      className={`pel-app-store ${className}`}
      href={APP_STORE_URL}
      target="_blank"
      rel="noreferrer"
    >
      <AppleIcon />
      <span>
        <small>Download on the</small>App Store
      </span>
    </a>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 384 512" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.7-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function ArrowDown() {
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
      <path d="M12 4v15M6 13l6 6 6-6" />
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

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18M8 14h2M14 14h2M8 17h2" />
    </svg>
  );
}

function PlayersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c.4-4 2.7-6 5.5-6s5.1 2 5.5 6M15 5.5a3 3 0 0 1 0 5.8M16.5 14c2.3.5 3.7 2.4 4 5" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      <path d="m4 7 6-5 6 7 5-4" />
    </svg>
  );
}
