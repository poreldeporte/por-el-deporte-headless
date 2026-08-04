import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {useAboutScene} from './useAboutScene';

const ORANGE_ITEMS = [
  'Beyond the Game',
  'Est. 2014 — Key Biscayne',
  'Powered by Community',
  'Creating Memories',
];

const CDN = 'https://cdn.shopify.com/s/files/1/0548/8492/5487/files/';

type SceneCard = {id: string; x: number; rot: number; src: string; alt: string};

// Every card is a photograph — no product mockups, no quote cards — and every
// frame is unique across the whole site. Positions/rotations are unchanged so
// the scroll choreography still reads the same.
const SCENE: SceneCard[] = [
  {id: 'p1', x: 18, rot: -3, src: `${CDN}ped-2025-cluster-of-three-teammates-seated.jpg?v=1785854205&width=700`, alt: 'Teammates on the bench between games'},
  {id: 'p2', x: 82, rot: 3, src: `${CDN}ped-2025-player-in-orange-bib-striking.jpg?v=1785854205&width=700`, alt: 'Striking the ball in front of goal'},
  {id: 'p3', x: 58, rot: 2, src: `${CDN}ped-2025-woman-laughing-between-two-players.jpg?v=1785854205&width=700`, alt: 'Laughing together on the sideline'},
  {id: 'p4', x: 30, rot: 2, src: `${CDN}ped-2025-player-in-orange-patterned-ocean.jpg?v=1785854205&width=700`, alt: 'The club shirt in the afternoon sun'},
  {id: 'p5', x: 74, rot: -3, src: `${CDN}ped-2025-smiling-player-in-cream-crest.jpg?v=1785854205&width=700`, alt: 'A smile in the cream crest tee'},
  {id: 'p6', x: 36, rot: -3, src: `${CDN}ped-2025-three-players-in-kit-and.jpg?v=1785854205&width=700`, alt: 'Three players before kickoff'},
  {id: 'p7', x: 18, rot: 2, src: `${CDN}ped-2025-player-in-patterned-home-kit.jpg?v=1785854205&width=700`, alt: 'On the ball in the home kit'},
  {id: 'p8', x: 86, rot: 2, src: `${CDN}ped-2025-player-drinking-from-an-orange.jpg?v=1785854409&width=700`, alt: 'Cooling off between games'},
  {id: 'p9', x: 64, rot: 3, src: `${CDN}ped-2025-player-in-orange-patterned-ped.jpg?v=1785854409&width=700`, alt: 'The club shirt on the sideline'},
  {id: 'p10', x: 13, rot: -2, src: `${CDN}ped-2025-player-in-orange-bib-dribbling.jpg?v=1785854409&width=700`, alt: 'Driving forward with the ball'},
  {id: 'p11', x: 50, rot: 1, src: `${CDN}ped-2025-player-striking-the-ball-with.jpg?v=1785854409&width=700`, alt: 'Full swing at the ball'},
  {id: 'p12', x: 12, rot: -2, src: `${CDN}ped-2025-teammates-embracing-after-a-goal.jpg?v=1785854409&width=700`, alt: 'Celebrating a goal together'},
  {id: 'p13', x: 82, rot: -2, src: `${CDN}ped-2025-player-walking-in-sage-crest.jpg?v=1785854409&width=700`, alt: 'Walking on in the sage crest tee'},
  {id: 'p14', x: 80, rot: -3, src: `${CDN}ped-2025-player-walking-in-from-the.jpg?v=1785854409&width=700`, alt: 'Coming in from the pitch'},
  {id: 'p15', x: 20, rot: 3, src: `${CDN}ped-2025-player-standing-in-cream-crest.jpg?v=1785854850&width=700`, alt: 'Standing in the cream crest tee'},
  {id: 'p16', x: 88, rot: -3, src: `${CDN}ped-2025-walking-away-in-cream-por.jpg?v=1785854850&width=700`, alt: 'Walking off in the Por El Deporte tee'},
  {id: 'p17', x: 68, rot: 2, src: `${CDN}ped-2025-player-in-white-tee-and.jpg?v=1785854849&width=700`, alt: 'Sideline in a white tee and cap'},
  {id: 'p18', x: 40, rot: -2, src: `${CDN}ped-2025-back-view-of-the-number.jpg?v=1785854850&width=700`, alt: 'Back of the shirt, number showing'},
  {id: 'p19', x: 46, rot: 2, src: `${CDN}ped-2025-goalkeeper-in-patterned-gk-shirt.jpg?v=1785854850&width=700`, alt: 'The keeper in the patterned shirt'},
  {id: 'p20', x: 24, rot: 3, src: `${CDN}ped-2025-number-7-in-the-patterned.jpg?v=1785854850&width=700`, alt: 'Number 7 in the patterned kit'},
  {id: 'p21', x: 84, rot: 3, src: `${CDN}ped-2025-player-standing-over-the-ball.jpg?v=1785854850&width=700`, alt: 'Standing over the ball before a restart'},
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
    src: `${CDN}20241117_PorElDeporte_acajiga-441.jpg?v=1749483589&width=2400`,
    alt: 'Striking the ball in the golden hour',
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
    src: `${CDN}20241117_PorElDeporte_acajiga-763.jpg?v=1755707473&width=2400`,
    alt: 'Supporters along the fence on match day',
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
                className="pel-scene-card"
                data-rot={c.rot}
                style={{left: `${c.x}%`}}
              >
                <img
                  className="pel-scene-card__img"
                  src={c.src}
                  alt={c.alt}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 50 / 50 Mission */}
      <section className="pel-mission" aria-label="Our mission">
        <div className="pel-mission__photo">
          <img
            src="https://cdn.shopify.com/s/files/1/0548/8492/5487/files/20241117_PorElDeporte_acajiga-780.jpg?v=1755707862&width=1400"
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
