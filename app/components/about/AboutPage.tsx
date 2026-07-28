import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {useAboutScene} from './useAboutScene';

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

/**
 * The design's "SUBPAGE BANNER" — the same pattern the Shop banner uses, with a
 * slow crossfade between four frames instead of one static image. The page nav
 * sits above it (PelHeader), exactly as on Shop; this page used to clone the
 * homepage's full-bleed hero, which is why it didn't match.
 */
// Full-bleed, so these need the design's 2400px source — not the 700px that the
// A()/A2() scene helpers emit for the small collage cards.
const HERO_SLIDES = [
  {
    src: `${CDN}20240609_PorElDeporteFinal_ACajiga-856.jpg?v=1755701316&width=2400`,
    alt: 'The Por El Deporte community',
  },
  {
    src: `${CDN}20240609_PorElDeporteFinal_ACajiga-1151.jpg?v=1755704513&width=2400`,
    alt: 'Kickabout in Key Biscayne',
  },
  {
    src: `${CDN}20240609_PorElDeporteFinal_ACajiga-1294.jpg?v=1755702679&width=2400`,
    alt: 'Por El Deporte on match day',
  },
  {
    src: `${CDN}20241117_PorElDeporte_acajiga-7.jpg?v=1755707182&width=2400`,
    alt: 'Sharing mate on the sideline',
  },
];

function SubHero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % HERO_SLIDES.length),
      5000,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="pel-subhero" aria-label="Our story">
      <div className="pel-subhero__slides">
        {HERO_SLIDES.map((s, i) => (
          <img
            key={s.src}
            className={`pel-subhero__slide${i === active ? ' is-active' : ''}`}
            src={s.src}
            // Only the first frame is described; the rest rotate decoratively.
            alt={i === 0 ? s.alt : ''}
            aria-hidden={i === 0 ? undefined : true}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
      <div className="pel-subhero__overlay" />
      <div className="pel-subhero__inner">
        <div className="pel-subhero__eyebrow">Our Story &bull; Est. 2014</div>
        <h1 className="pel-subhero__title">Beyond the Game</h1>
        <p className="pel-subhero__sub">
          Founded in Key Biscayne in 2014 — a community built on friendship, fair
          play, and a shared love for the beautiful game.
        </p>
      </div>
    </section>
  );
}

export function AboutPage() {
  useAboutScene();
  return (
    <div className="pel-home pel-about-page">
      <SubHero />

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
