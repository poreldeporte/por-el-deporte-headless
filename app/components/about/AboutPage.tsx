import {Link} from 'react-router';
import {PelMarquee} from '~/components/PelMarquee';
import {CartButton} from '~/components/home/CartButton';
import {useHomeReveal} from '~/components/home/useHomeReveal';

const TOP_ITEMS = [
  {id: 'btg', text: 'Beyond the Game'},
  {id: 'bc', text: 'Building Community'},
  {id: 'cm', text: 'Creating Memories'},
  {id: 'btg2', text: 'Beyond the Game'},
  {id: 'bc2', text: 'Building Community'},
  {id: 'cm2', text: 'Creating Memories'},
];

const ORANGE_ITEMS = [
  'Beyond the Game',
  'Est. 2014 — Key Biscayne',
  'Powered by Community',
  'Creating Memories',
];

const B = 'https://poreldeporte.com/cdn/shop/files/';
type Card =
  | {kind: 'photo'; id: string; src: string; alt: string; rot: number; product?: boolean}
  | {kind: 'say'; id: string; title: string; label: string; body: string; tone: 'dark' | 'light'; rot: number};

const CARDS: Card[] = [
  {kind: 'photo', id: 'c1', src: `${B}20240609_PorElDeporteFinal_ACajiga-888.jpg?v=1755704548&width=700`, alt: 'Community members together', rot: -3},
  {kind: 'photo', id: 'c2', src: `${B}20240609_PorElDeporteFinal_ACajiga-1207.jpg?v=1755704396&width=700`, alt: 'Supporters on match day', rot: 3},
  {kind: 'photo', id: 'c3', src: `${B}palmas-kit-462846.png?v=1736430527&width=700`, alt: '“Palmas” Jersey', rot: 2, product: true},
  {kind: 'say', id: 's1', title: 'Feels like family', label: 'Tomás R.', body: 'Wore the crest to a match and got stopped twice asking where it was from.', tone: 'dark', rot: 2},
  {kind: 'photo', id: 'c4', src: `${B}20240609_PorElDeporteFinal_ACajiga-856.jpg?v=1755701316&width=700`, alt: 'Por El Deporte community', rot: -3},
  {kind: 'photo', id: 'c5', src: `${B}artisan-ped-hoodie-9133088.png?v=1757600942&width=700`, alt: 'Artisan PED Hoodie', rot: -3, product: true},
  {kind: 'photo', id: 'c6', src: `${B}20241117_PorElDeporte_acajiga-7.jpg?v=1755707182&width=700`, alt: 'Weekend match day', rot: 2},
  {kind: 'photo', id: 'c7', src: `${B}20240609_PorElDeporteFinal_ACajiga-335.jpg?v=1750173740&width=700`, alt: 'Match day in Key Biscayne', rot: -2},
  {kind: 'photo', id: 'c8', src: `${B}la-isla-tee-511237.png?v=1713839421&width=700`, alt: 'La Isla Tee', rot: 3, product: true},
  {kind: 'say', id: 's2', title: 'We give back', label: 'Por el deporte', body: 'Every purchase funds local matches, events, and youth soccer.', tone: 'light', rot: 2},
  {kind: 'photo', id: 'c9', src: `${B}20240609_PorElDeporteFinal_ACajiga-1151.jpg?v=1755704513&width=700`, alt: 'Key Biscayne kickabout', rot: 1},
  {kind: 'photo', id: 'c10', src: `${B}the-island-bucket-9731644.png?v=1755720072&width=700`, alt: 'The Island Bucket hat', rot: -2, product: true},
  {kind: 'photo', id: 'c11', src: `${B}20241117_PorElDeporte_acajiga-483.jpg?v=1755707645&width=700`, alt: 'Beyond the game', rot: -2},
  {kind: 'photo', id: 'c12', src: `${B}ocean-sunset-tee-382023.png?v=1736430528&width=700`, alt: 'The Ocean Tee', rot: 2, product: true},
];

function HeroNav() {
  return (
    <nav className="pel-nav" aria-label="Primary">
      <div className="pel-nav__links">
        <Link to="/">Home</Link>
        <Link to="/about" className="is-active">
          About
        </Link>
        <Link to="/collections/all-products">Shop</Link>
      </div>
      <div className="pel-nav__logo">
        <Link to="/" aria-label="Por El Deporte — home">
          Por El Deporte
        </Link>
      </div>
      <div className="pel-nav__actions">
        <button type="button" className="pel-pill pel-hide-mobile" title="Accounts — coming soon">
          Account
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="8" r="3.4" />
            <path d="M5.5 20c.5-3.5 3.5-5 6.5-5s6 1.5 6.5 5" />
          </svg>
        </button>
        <CartButton variant="pill" />
      </div>
    </nav>
  );
}

export function AboutPage() {
  useHomeReveal();
  return (
    <div className="pel-home pel-about-page">
      <PelMarquee items={TOP_ITEMS} />

      <section className="pel-hero" aria-label="Hero">
        <img
          className="pel-hero__img"
          src="https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-335.jpg?v=1750173740&width=2400"
          alt="Por El Deporte match day"
        />
        <div className="pel-hero__overlay" />
        <HeroNav />
        <div className="pel-hero__content">
          <h1 className="pel-hero__title">
            Miami Soccer
            <br />
            Apparel &amp; Community
          </h1>
          <div className="pel-hero__lede">
            <p className="pel-hero__sub">
              Beyond the game — building community and creating memories in Key
              Biscayne since 2014.
            </p>
            <div className="pel-cta-row">
              <Link to="/collections/all-products" className="pel-btn">
                Shop Now
              </Link>
              <Link to="/collections/all-products" className="pel-btn pel-btn--icon" aria-label="Shop now">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M7 17L17 7M8.5 7H17v8.5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        <div className="pel-scroll-cue" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </section>

      <div className="pel-marquee pel-marquee--orange">
        <div className="pel-marquee__track">
          {[0, 1].map((g) => (
            <div key={g} className="pel-marquee__group" aria-hidden={g === 1 || undefined}>
              {ORANGE_ITEMS.map((text, i) => (
                <span key={`${text}-${i}`} style={{display: 'inline-flex', alignItems: 'center', gap: 'inherit'}}>
                  <span>{text}</span>
                  <svg className="pel-marquee__star" width="16" height="16" viewBox="0 0 100 100" aria-hidden="true">
                    <path d="M50 0C54 30 70 46 100 50C70 54 54 70 50 100C46 70 30 54 0 50C30 46 46 30 50 0Z" fill="currentColor" />
                  </svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Built by the Community — card collage */}
      <section className="pel-community-scene" aria-label="Built by the community">
        <div className="pel-community-scene__head" data-reveal>
          <div className="pel-community-scene__badge" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 100 100">
              <path d="M50 0C54 30 70 46 100 50C70 54 54 70 50 100C46 70 30 54 0 50C30 46 46 30 50 0Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="pel-community-scene__title">
            Built by
            <br />
            the Community
          </h2>
        </div>
        <div className="pel-community-scene__grid">
          {CARDS.map((c) => (
            <div
              key={c.id}
              className={`pel-cc${c.kind === 'say' ? ` pel-cc--say pel-cc--${c.tone}` : ''}`}
              style={{transform: `rotate(${c.rot}deg)`}}
            >
              {c.kind === 'photo' ? (
                <img
                  className={c.product ? 'pel-cc__img pel-cc__img--product' : 'pel-cc__img'}
                  src={c.src}
                  alt={c.alt}
                  loading="lazy"
                />
              ) : (
                <div className="pel-cc__say">
                  <h3 className="pel-cc__title">{c.title}</h3>
                  <div>
                    <div className="pel-cc__label">{c.label}</div>
                    <div className="pel-cc__body">{c.body}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 50 / 50 Mission */}
      <section className="pel-mission" aria-label="Our mission">
        <div className="pel-mission__photo">
          <img
            src="https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-888.jpg?v=1755704548&width=1400"
            alt="Por El Deporte community member"
          />
          <svg className="pel-mission__cloud pel-mission__cloud--l" viewBox="0 0 100 100" aria-hidden="true">
            <path d="M50 0C54 30 70 46 100 50C70 54 54 70 50 100C46 70 30 54 0 50C30 46 46 30 50 0Z" fill="currentColor" />
          </svg>
        </div>
        <div className="pel-mission__panel">
          <h2 className="pel-mission__title" data-reveal>
            <span>Bringing people together through the game.</span>
          </h2>
          <p className="pel-mission__body" data-reveal>
            Since 2014, Por El Deporte has been more than a club — it&rsquo;s a
            community built in Key Biscayne. Every jersey, tee, and hat funds local
            matches, unites fans, and keeps our sunny soccer passion alive, on and
            off the pitch.
          </p>
          <svg className="pel-mission__cloud pel-mission__cloud--r" viewBox="0 0 100 100" aria-hidden="true">
            <path d="M50 0C54 30 70 46 100 50C70 54 54 70 50 100C46 70 30 54 0 50C30 46 46 30 50 0Z" fill="currentColor" />
          </svg>
        </div>
      </section>
    </div>
  );
}
