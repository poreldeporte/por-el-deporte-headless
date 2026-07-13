import {Link} from 'react-router';
import {PelMarquee} from '~/components/PelMarquee';
import {CartButton} from '~/components/home/CartButton';
import {useAboutScene} from './useAboutScene';

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

const CDN = 'https://poreldeporte.com/cdn/shop/files/';
const A = (id: string, v: string) =>
  `${CDN}20240609_PorElDeporteFinal_ACajiga-${id}.jpg?v=${v}&width=700`;
const A2 = (id: string, v: string) =>
  `${CDN}20241117_PorElDeporte_acajiga-${id}.jpg?v=${v}&width=700`;

type SceneCard =
  | {kind: 'photo'; id: string; x: number; rot: number; src: string; alt: string; product?: boolean}
  | {kind: 'say'; id: string; x: number; rot: number; tone: 'dark' | 'light'; title: string; label: string; body: string};

// The community scroll scene — same set + positions as About Page.dc.html.
const SCENE: SceneCard[] = [
  {kind: 'photo', id: 'p1', x: 18, rot: -3, src: A('888', '1755704548'), alt: 'Community members together'},
  {kind: 'photo', id: 'p2', x: 82, rot: 3, src: A('1207', '1755704396'), alt: 'Supporters on match day'},
  {kind: 'photo', id: 'p3', x: 58, rot: 2, src: `${CDN}palmas-kit-462846.png?v=1736430527&width=700`, alt: '“Palmas” Jersey', product: true},
  {kind: 'say', id: 's1', x: 30, rot: 2, tone: 'dark', title: 'Feels like family', label: 'Tomás R.', body: 'Wore the crest to a match and got stopped twice asking where it was from.'},
  {kind: 'photo', id: 'p4', x: 74, rot: -3, src: A('856', '1755701316'), alt: 'Por El Deporte community'},
  {kind: 'photo', id: 'p5', x: 36, rot: -3, src: `${CDN}artisan-ped-hoodie-9133088.png?v=1757600942&width=700`, alt: 'Artisan PED Hoodie', product: true},
  {kind: 'photo', id: 'p6', x: 18, rot: 2, src: A2('7', '1755707182'), alt: 'Weekend match day'},
  {kind: 'photo', id: 'p7', x: 86, rot: 2, src: A('1216', '1755705211'), alt: 'Club gear laid out'},
  {kind: 'photo', id: 'p8', x: 64, rot: 3, src: `${CDN}la-isla-tee-511237.png?v=1713839421&width=700`, alt: 'La Isla Tee', product: true},
  {kind: 'photo', id: 'p9', x: 13, rot: -2, src: A('335', '1750173740'), alt: 'Match day in Key Biscayne'},
  {kind: 'photo', id: 'p10', x: 50, rot: 1, src: A('1151', '1755704513'), alt: 'Key Biscayne kickabout'},
  {kind: 'photo', id: 'p11', x: 12, rot: -2, src: `${CDN}the-island-bucket-9731644.png?v=1755720072&width=700`, alt: 'The Island Bucket', product: true},
  {kind: 'photo', id: 'p12', x: 82, rot: -2, src: A2('483', '1755707645'), alt: 'Beyond the game'},
  {kind: 'photo', id: 'p13', x: 80, rot: -3, src: A('1017_1', '1755704655'), alt: 'Por El Deporte cap'},
  {kind: 'photo', id: 'p14', x: 20, rot: 3, src: A('225', '1755706151'), alt: 'On the pitch in Miami'},
  {kind: 'photo', id: 'p15', x: 88, rot: -3, src: `${CDN}el-clasico-tote-3651006.png?v=1765300446&width=700`, alt: 'El Clásico Tote', product: true},
  {kind: 'say', id: 's2', x: 68, rot: 2, tone: 'light', title: 'We give back', label: 'Por el deporte', body: 'Every purchase funds local matches, events, and youth soccer.'},
  {kind: 'photo', id: 'p16', x: 40, rot: -2, src: A('687', '1755706282'), alt: 'Club supporters'},
  {kind: 'photo', id: 'p17', x: 46, rot: 2, src: `${CDN}ocean-sunset-tee-382023.png?v=1736430528&width=700`, alt: 'The Ocean Tee', product: true},
  {kind: 'photo', id: 'p18', x: 24, rot: 3, src: A2('808', '1755707867'), alt: 'Building community'},
  {kind: 'photo', id: 'p19', x: 84, rot: 3, src: A('1294', '1755702679'), alt: 'The Por El Deporte team'},
];

const Spark = ({size = 28}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
    <path d="M50 0C54 30 70 46 100 50C70 54 54 70 50 100C46 70 30 54 0 50C30 46 46 30 50 0Z" fill="currentColor" />
  </svg>
);

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
  useAboutScene();
  return (
    <div className="pel-home pel-about-page">
      <PelMarquee items={TOP_ITEMS} />

      <section className="pel-hero" aria-label="Hero">
        <img
          className="pel-hero__img"
          style={{top: '-7%', height: '114%'}}
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
              {ORANGE_ITEMS.map((text) => (
                <span key={text} style={{display: 'inline-flex', alignItems: 'center', gap: 'inherit'}}>
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

      {/* Built by the Community — pinned scroll scene */}
      <section id="pel-scene" className="pel-scene" aria-label="Built by the community">
        <div id="pel-scene-sticky" className="pel-scene__sticky">
          <div className="pel-scene__center">
            <div className="pel-scene__badge">
              <Spark size={28} />
            </div>
            <h2 className="pel-scene__title">
              Built by
              <br />
              the Community
            </h2>
          </div>
          <div id="pel-cards" className="pel-scene__cards" aria-hidden="true">
            {SCENE.map((c) => (
              <div
                key={c.id}
                className={`pel-scene-card${c.kind === 'say' ? ` pel-scene-card--say pel-scene-card--${c.tone}` : ''}`}
                data-rot={c.rot}
                style={{left: `${c.x}%`}}
              >
                {c.kind === 'photo' ? (
                  <img
                    className={c.product ? 'pel-scene-card__img pel-scene-card__img--product' : 'pel-scene-card__img'}
                    src={c.src}
                    alt={c.alt}
                    loading="lazy"
                  />
                ) : (
                  <div className="pel-scene-card__say">
                    <h3 className="pel-scene-card__title">{c.title}</h3>
                    <div>
                      <div className="pel-scene-card__label">{c.label}</div>
                      <div className="pel-scene-card__body">{c.body}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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
