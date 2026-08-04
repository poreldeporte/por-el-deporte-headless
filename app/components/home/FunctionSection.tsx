import type {CSSProperties} from 'react';
import {Link} from 'react-router';

/**
 * "You Asked, We Delivered" — the current drop: the hoodie plus three tees,
 * laid out as a lightly overlapping row of product shots flanked by floating
 * cloud "sticker" callouts. Each garment links to its own product page.
 * The row reveals with a stagger and the clouds gently float (CSS) + fade in
 * (anime.js via useHomeReveal).
 */
const CDN = 'https://cdn.shopify.com/s/files/1/0548/8492/5487/files';

const CLUSTER: {
  img: string;
  alt: string;
  href: string;
  wrap: CSSProperties;
  inner: CSSProperties;
  dx: number;
  dy: number;
}[] = [
  {
    img: `${CDN}/island-sketch-tee-1636967.png?v=1765300448&width=700`,
    alt: 'Island Sketch Tee',
    href: '/products/island-sketch-tee',
    wrap: {width: '290px', height: '360px', marginRight: '-38px'},
    inner: {transform: 'rotate(-7deg) translateY(22px)'},
    dx: -90,
    dy: 0,
  },
  {
    // The hoodie is the anchor: biggest, centred, sitting in front.
    img: `${CDN}/artisan-ped-hoodie-9133088.png?v=1757600942&width=900`,
    alt: 'Artisan PED Hoodie',
    href: '/products/artisan-ped-hoodie',
    wrap: {width: '360px', height: '460px', zIndex: 3},
    inner: {},
    dx: 0,
    dy: 72,
  },
  {
    img: `${CDN}/futbol-mate-asado-tee-9742396.png?v=1756312839&width=700`,
    alt: 'Futbol, Mate, Asado Tee',
    href: '/products/futbol-mate-asado-tee',
    wrap: {width: '290px', height: '360px', zIndex: 2, marginLeft: '-38px'},
    inner: {transform: 'rotate(5deg) translateY(26px)'},
    dx: 60,
    dy: 40,
  },
  {
    img: `${CDN}/athletic-club-shield-tee-2037918.png?v=1757529282&width=700`,
    alt: 'Athletic Club Shield Tee',
    href: '/products/athletic-club-shield-tee',
    wrap: {width: '280px', height: '345px', marginLeft: '-34px'},
    inner: {transform: 'rotate(9deg) translateY(34px)'},
    dx: 120,
    dy: 0,
  },
];

const CLOUDS: {pos: CSSProperties; text: string}[] = [
  {pos: {left: '5%', top: '10%', width: '200px', height: '158px'}, text: 'The hoodie you asked for'},
  {pos: {right: '5%', top: '12%', width: '210px', height: '165px'}, text: 'Three new tees to match'},
  {pos: {left: '1%', top: '52%', width: '195px', height: '152px'}, text: '100% ring-spun cotton'},
  {pos: {right: '2%', top: '54%', width: '195px', height: '152px'}, text: 'Designed & worn in Miami'},
  {pos: {left: '4%', bottom: '2%', width: '205px', height: '160px'}, text: 'Free shipping — on your doorstep in 1 week'},
  {pos: {right: '4%', bottom: '1%', width: '205px', height: '160px'}, text: 'Every purchase powers our Miami community'},
];

const SHOP_URL = '/collections/all-products';

export function FunctionSection() {
  return (
    <section className="pel-function" aria-label="The latest drop">
      <div className="pel-function__head">
        <h2 className="pel-function__title" data-reveal>
          You Asked,
          <br />
          We Delivered
        </h2>
        <p className="pel-function__sub" data-reveal>
          The Artisan PED Hoodie and three new tees — an homage to our Key
          Biscayne roots, made for Miami weather.
        </p>
        <div className="pel-function__cta" data-reveal>
          <Link to={SHOP_URL} className="pel-btn-outline">
            Shop the Drop
          </Link>
          <Link to={SHOP_URL} className="pel-icon-btn" aria-label="Shop the drop">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M7 17L17 7M8.5 7H17v8.5" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="pel-cluster" data-reveal-stagger>
        {CLUSTER.map((c) => (
          <Link
            key={c.alt}
            to={c.href}
            className="pel-cluster__item"
            style={c.wrap}
            aria-label={`Shop the ${c.alt}`}
            data-reveal-item
            data-dx={c.dx}
            data-dy={c.dy}
            data-scale="0.82"
          >
            <div className="pel-cluster__inner" style={c.inner}>
              <img src={c.img} alt={c.alt} loading="lazy" />
            </div>
          </Link>
        ))}
      </div>

      {CLOUDS.map((cloud) => (
        <div key={cloud.text} className="pel-cloud" style={cloud.pos} data-reveal>
          <div className="pel-cloud__float">
            <div className="pel-cloud__shadow" />
            <div className="pel-cloud__body">
              <span>{cloud.text}</span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
