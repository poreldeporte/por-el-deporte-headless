import type {CSSProperties} from 'react';
import {Link} from 'react-router';

/**
 * A cluster of four garments laid out as a lightly overlapping row of product
 * shots flanked by floating cloud "sticker" callouts. Each links to its own
 * product page.
 *
 * The copy is deliberately evergreen. It used to read "You Asked, We Delivered"
 * over "the hoodie you kept asking for, plus three new tees", which pinned the
 * section to one drop and to a specific product mix — both of which go stale the
 * moment the cluster below is swapped for different items.
 * The row reveals with a stagger and the clouds gently float (CSS) + fade in
 * (anime.js via useScrollMotion).
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
    // Bay rather than Black: the cluster reads as a row of silhouettes, and two
    // dark garments side by side lose their edges against each other.
    img: `${CDN}/unisex-garment-dyed-heavyweight-t-shirt-bay-front-6a7a2d3cc4277.png?v=1786391876&width=700`,
    alt: 'Members Tee',
    href: '/products/members-tee',
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
    // The back, not the front. The stacked lettering and the bicycle kick are
    // the whole point of this one; its front is a plain tee.
    img: `${CDN}/unisex-garment-dyed-heavyweight-t-shirt-ivory-back-6a79ea2dcdf9a.png?v=1786374723&width=700`,
    alt: 'Marado Tee',
    href: '/products/marado-tee',
    wrap: {width: '290px', height: '360px', zIndex: 2, marginLeft: '-38px'},
    inner: {transform: 'rotate(5deg) translateY(26px)'},
    dx: 60,
    dy: 40,
  },
  {
    img: `${CDN}/unisex-hooded-long-sleeve-tee-black-front-6a79e997330da.png?v=1786374568&width=700`,
    alt: 'La Isla Hooded Long Sleeve',
    href: '/products/la-isla-hooded-long-sleeve',
    wrap: {width: '280px', height: '345px', marginLeft: '-34px'},
    inner: {transform: 'rotate(9deg) translateY(34px)'},
    dx: 120,
    dy: 0,
  },
];

const CLOUDS: {pos: CSSProperties; text: string}[] = [
  {pos: {left: '5%', top: '10%', width: '200px', height: '158px'}, text: 'The hoodie you asked for'},
  // Was "Three new tees to match", which counted the cluster below it — so it
  // went wrong the moment the mix changed. This one survives a reshuffle.
  {pos: {right: '5%', top: '12%', width: '210px', height: '165px'}, text: 'And the layers to go with it'},
  {pos: {left: '1%', top: '52%', width: '195px', height: '152px'}, text: '100% ring-spun cotton'},
  {pos: {right: '2%', top: '54%', width: '195px', height: '152px'}, text: 'Made and worn in Miami'},
  {pos: {left: '4%', bottom: '2%', width: '205px', height: '160px'}, text: 'Free shipping, about a week'},
  {pos: {right: '4%', bottom: '1%', width: '205px', height: '160px'}, text: 'Every order helps fund our games'},
];

const SHOP_URL = '/collections/all-products';

export function FunctionSection() {
  return (
    <section className="pel-function" aria-label="Our gear">
      <div className="pel-function__head">
        <h2 className="pel-function__title" data-reveal>
          Made for
          <br />
          the Heat
        </h2>
        <p className="pel-function__sub" data-reveal>
          Heavy cotton that still breathes. Cuts that let you move. Colors that
          hold up to a Miami summer.
        </p>
        <div className="pel-function__cta" data-reveal>
          <Link to={SHOP_URL} className="pel-btn-outline">
            Shop the Gear
          </Link>
          <Link to={SHOP_URL} className="pel-icon-btn" aria-label="Shop the gear">
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
