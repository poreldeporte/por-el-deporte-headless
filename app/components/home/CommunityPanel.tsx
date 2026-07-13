import {useState} from 'react';

/**
 * "What Makes Us Special" — a left slide-in panel with App / Club tabs, opened by
 * a floating action button that sits beside the cart FAB. Self-contained (own
 * open + tab state). Static brand content.
 */
const ICONS: Record<string, string> = {
  droplet: 'M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z',
  flask: 'M9 3h6M10 3v5l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3',
  grapes:
    'M12 4v3M8 10.5a2 2 0 1 0 .01 0M16 10.5a2 2 0 1 0 .01 0M12 14a2 2 0 1 0 .01 0M10 17.5a2 2 0 1 0 .01 0M14 17.5a2 2 0 1 0 .01 0',
  salt: 'M8 21h8v-9H8zM9 12V8a3 3 0 0 1 6 0v4M10 4h4',
  citrus: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 4v16M4 12h16',
  sparkle: 'M12 2c1 5 4 8 9 9-5 1-8 4-9 9-1-5-4-8-9-9 5-1 8-4 9-9z',
  leaf: 'M5 20C5 11 11 6 20 6c0 9-6 15-15 14zM5 20c4-5 8-7 12-8',
  molecule:
    'M6 7a2 2 0 1 0 .01 0M18 7a2 2 0 1 0 .01 0M12 18a2 2 0 1 0 .01 0M7.5 8.5l3.5 8M16.5 8.5l-3.5 8',
  pill: 'M8.5 15.5l7-7a3.5 3.5 0 0 0-5-5l-7 7a3.5 3.5 0 0 0 5 5zM7 7l6 6',
};

const ING_APP: [string, string][] = [
  ['Upcoming Games & Quick Join', 'sparkle'],
  ['Full Schedule & Open Spots', 'citrus'],
  ['Recaps, Scores & History', 'molecule'],
  ['Leaderboard & Stats', 'flask'],
  ['Rosters & Waitlists', 'grapes'],
  ['Game-Day Reminders', 'droplet'],
];
const ING_CLUB: [string, string][] = [
  ['Founded in 2014', 'sparkle'],
  ['Key Biscayne, FL Roots', 'leaf'],
  ['A Vibrant Miami Soccer Community', 'citrus'],
  ['Featured on CBS Golazo', 'molecule'],
  ['Shared Events & Matches', 'grapes'],
  ['Respect & Fair Play', 'salt'],
  ['Original Club Designs', 'pill'],
  ['Eco-Friendly 100% Cotton', 'droplet'],
  ['Free Shipping on All Orders', 'flask'],
  ['Sizes S to 2XL', 'sparkle'],
];

function Ico({name}: {name: string}) {
  return (
    <div className="pel-community__ico">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d={ICONS[name]} />
      </svg>
    </div>
  );
}

export function CommunityPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'app' | 'club'>('app');
  const isApp = tab === 'app';
  const items = isApp ? ING_APP : ING_CLUB;
  const full: [string, string] = isApp
    ? ['Build the Squad. Track the Story. Keep Your Community Moving.', 'sparkle']
    : ['More Than a Team — A Community of Camaraderie & Mutual Support', 'sparkle'];
  const serving = isApp
    ? 'Full Details — poreldeporte.com/pages/app'
    : 'Est. 2014 — Key Biscayne, Florida';

  return (
    <>
      <button
        type="button"
        className="pel-fab pel-fab--community"
        aria-label="What makes us special"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 8c-3.2-1.8-7.2-.4-7.2 3.8 0 3.6 2.8 7.6 4.8 7.6.9 0 1.4-.5 2.4-.5s1.5.5 2.4.5c2 0 4.8-4 4.8-7.6 0-4.2-4-5.6-7.2-3.8z" />
          <path d="M12 8c0-2.2 1.2-3.6 3-4.2" />
        </svg>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="pel-community__scrim"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <aside
            className="pel-community"
            role="dialog"
            aria-modal="true"
            aria-label="What makes us special"
          >
            <div className="pel-community__head">
              <h2 className="pel-community__title">
                What Makes
                <br />
                Us Special
              </h2>
              <button
                type="button"
                className="pel-community__close"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="pel-community__tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={isApp}
                className={isApp ? 'is-active' : undefined}
                onClick={() => setTab('app')}
              >
                The App
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!isApp}
                className={!isApp ? 'is-active' : undefined}
                onClick={() => setTab('club')}
              >
                The Club
              </button>
            </div>

            <div className="pel-community__body">
              {isApp ? (
                <div className="pel-community__app">
                  <div className="pel-community__badge">
                    <div className="pel-community__badge-shadow" />
                    <div className="pel-community__badge-body">
                      <span>PED</span>
                    </div>
                  </div>
                  <h3 className="pel-community__apptitle">
                    The Club
                    <br />
                    in Your Pocket
                  </h3>
                  <p className="pel-community__appdesc">
                    Schedule runs, fill rosters, and keep everyone aligned from
                    kickoff to recap — games, scores, and community in one place.
                  </p>
                  <div className="pel-community__dl">
                    <a
                      className="primary"
                      href="https://apps.apple.com/us/app/por-el-deporte/id6756241207"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <svg width="15" height="15" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.7-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                      </svg>
                      Download on the App Store
                    </a>
                    <a
                      className="secondary"
                      href="https://app.poreldeporte.com"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open the Web App
                    </a>
                  </div>
                </div>
              ) : null}

              <div className="pel-community__label">
                {isApp ? 'In the App' : 'Beyond the Game — What We’re About'}
              </div>
              <div className="pel-community__grid">
                {items.map(([label, icon]) => (
                  <div key={label} className="pel-community__ing">
                    <Ico name={icon} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="pel-community__ing pel-community__ing--full">
                <Ico name={full[1]} />
                <span>{full[0]}</span>
              </div>
            </div>

            <div className="pel-community__foot">{serving}</div>
          </aside>
        </>
      ) : null}
    </>
  );
}
