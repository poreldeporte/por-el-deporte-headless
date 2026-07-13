import type {CSSProperties} from 'react';
import {Stars} from './Stars';

/**
 * "Founded in 2014…" — a cloud-clipped photo collage + brand statement.
 * Photos are editorial brand imagery (Shopify-hosted). They can later move to a
 * metaobject so the team can swap them without a deploy.
 *
 * NOTE: the large community photo reuses a match-day shot for now; drop the real
 * team photo into /public and point `img` at it to replace.
 */
const COLLAGE: {
  pos: CSSProperties;
  dx: number;
  dy: number;
  img: string;
  alt: string;
  backer: string;
}[] = [
  {
    pos: {left: '0', top: '0', width: '48.5%', aspectRatio: '1.5'},
    dx: -70,
    dy: 0,
    img: 'https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-856.jpg?v=1755701316&width=900',
    alt: 'El Clásico Tee on the pitch',
    backer: '#d8cdbb',
  },
  {
    pos: {left: '51.5%', top: '0', width: '48.5%', aspectRatio: '1.5'},
    dx: 70,
    dy: -34,
    img: 'https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-1207.jpg?v=1755704396&width=800',
    alt: 'The Island Bucket hat',
    backer: '#cfe3f2',
  },
  {
    pos: {left: '0', bottom: '0', width: '100%', aspectRatio: '1.55'},
    dx: 0,
    dy: 80,
    img: 'https://poreldeporte.com/cdn/shop/files/20240609_PorElDeporteFinal_ACajiga-335.jpg?v=1750173740&width=1200',
    alt: 'The Por El Deporte community',
    backer: '#e7ded0',
  },
];

export function About() {
  return (
    <section className="pel-about" aria-label="About Por El Deporte">
      <h2 className="pel-about__title" data-reveal>
        Founded in 2014 by a Group
        <br />
        of Friends United by Their
        <br />
        Love for the Game
      </h2>

      <div className="pel-about__grid">
        <div className="pel-collage" data-reveal-stagger>
          {COLLAGE.map((c) => (
            <div
              key={c.alt}
              className="pel-collage__item"
              style={c.pos}
              data-reveal-item
              data-dx={c.dx}
              data-dy={c.dy}
              data-scale="0.9"
            >
              <div className="pel-collage__shadow" />
              <div className="pel-collage__frame" style={{background: c.backer}}>
                <img src={c.img} alt={c.alt} loading="lazy" />
              </div>
            </div>
          ))}
        </div>

        <div className="pel-about__body">
          <p className="pel-about__lead" data-reveal>
            More than just a team, Por El Deporte is a community — built on lasting
            friendships, mutual support, and memories we&rsquo;ll cherish forever.
          </p>
          <div className="pel-about__meta">
            <div className="pel-about__cta">
              <button type="button" className="pel-btn-outline">
                Our Mission
              </button>
              <button
                type="button"
                className="pel-icon-btn"
                aria-label="Our mission"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M7 17L17 7M8.5 7H17v8.5" />
                </svg>
              </button>
            </div>
            <div className="pel-about__rating">
              <Stars total={5} filled={4} size={24} />
              <a
                href="https://www.instagram.com/poreldeporte"
                target="_blank"
                rel="noreferrer"
                className="pel-follow"
              >
                Follow @poreldeporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
